import { Injectable } from '@nestjs/common';
import { Pool, type PoolClient } from 'pg';
import type { IdentityConfiguration } from './identity-security';
import { csrfToken, decryptFactor, encryptFactor, newOpaqueToken, tokenHash, verifyTotp } from './identity-security';

export type Audience = 'customer' | 'admin';
export type AuthSession = { id: string; user_id: string; audience: Audience; auth_level: 'password' | 'mfa'; csrf_secret_hash: Buffer; expires_at: Date; idle_expires_at: Date; permissions: string[] };
export type AuthUser = { id: string; email: string; password_hash: string | null; email_verified_at: Date | null; status: string; admin: boolean };
export type ChallengePurpose = 'email_verify' | 'password_reset' | 'login_mfa';
type Queryable = Pick<PoolClient, 'query'>;

@Injectable()
export class IdentityStore {
  private readonly pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      try { const result = await work(client); await client.query('COMMIT'); return result; }
      catch (error) { await client.query('ROLLBACK'); throw error; }
    } finally { client.release(); }
  }
  async userByEmail(email: string): Promise<AuthUser | null> {
    const result = await this.pool.query<AuthUser>(`SELECT u.id,u.email,u.password_hash,u.email_verified_at,u.status,
      EXISTS(SELECT 1 FROM galung.user_roles ur JOIN galung.role_permissions rp ON rp.role_id=ur.role_id
        JOIN galung.permissions p ON p.id=rp.permission_id WHERE ur.user_id=u.id AND p.code='admin.access') AS admin
      FROM galung.users u WHERE lower(u.email)=lower($1)`, [email]);
    return result.rows[0] ?? null;
  }
  async register(input: { email: string; passwordHash: string; displayName: string; countryCode: string; locale: string; termsVersion: string; termsHash: Buffer; privacyVersion: string; privacyHash: Buffer; requestId: string }): Promise<string> {
    return this.transaction(async client => {
      const result = await client.query<{ id: string }>(`INSERT INTO galung.users(email,password_hash,display_name,country_code,preferred_locale)
        VALUES($1,$2,$3,$4,$5) RETURNING id`, [input.email, input.passwordHash, input.displayName, input.countryCode, input.locale]);
      const userId = result.rows[0].id;
      await client.query(`SELECT galung.assign_customer_role($1)`, [userId]);
      await client.query(`INSERT INTO galung.legal_acceptances(user_id,terms_version,terms_content_hash,privacy_notice_version,privacy_notice_hash,locale,country_code,request_id)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8)`, [userId, input.termsVersion, input.termsHash, input.privacyVersion, input.privacyHash, input.locale, input.countryCode, input.requestId]);
      await this.audit(client, userId, 'identity.register', userId, input.requestId);
      return userId;
    });
  }
  async audit(client: Queryable, actorId: string | null, action: string, entityId: string, requestId: string): Promise<void> {
    await client.query(`INSERT INTO galung.audit_logs(actor_id,action,entity_type,entity_id,request_id)
      VALUES($1,$2,'identity',$3,$4)`, [actorId, action, entityId, requestId]);
  }
  async auditFailure(action: string, opaqueSubject: string, requestId: string): Promise<void> {
    await this.transaction(client => this.audit(client, null, action, opaqueSubject, requestId));
  }
  async challenge(userId: string, purpose: ChallengePurpose, audience: Audience, expiresMinutes: number, requestId: string, outboxKey?: Buffer): Promise<{ id: string; token: string }> {
    const token = newOpaqueToken();
    return this.transaction(async client => {
      await client.query(`UPDATE galung.auth_challenges SET consumed_at=now() WHERE user_id=$1 AND purpose=$2 AND consumed_at IS NULL`, [userId, purpose]);
      const result = await client.query<{ id: string }>(`INSERT INTO galung.auth_challenges(user_id,purpose,challenge_hash,expires_at,audience,request_id)
        VALUES($1,$2,$3,now()+($4::text || ' minutes')::interval,$5,$6) RETURNING id`, [userId, purpose, tokenHash(token), expiresMinutes, audience, requestId]);
      if (purpose === 'email_verify' || purpose === 'password_reset') {
        if (!outboxKey) throw new Error('Identity outbox encryption key missing');
        await client.query(`INSERT INTO galung.identity_delivery_outbox(challenge_id,user_id,purpose,payload_ciphertext)
          VALUES($1,$2,$3,$4)`, [result.rows[0].id, userId, purpose, encryptFactor(token, outboxKey)]);
      }
      await this.audit(client, userId, `identity.${purpose}.requested`, result.rows[0].id, requestId);
      return { id: result.rows[0].id, token };
    });
  }
  async claimDelivery(): Promise<{ id: string; userId: string; email: string; purpose: 'email_verify' | 'password_reset'; ciphertext: Buffer; attempts: number } | null> {
    return this.transaction(async client => {
      const result = await client.query<{ id: string; user_id: string; email: string; purpose: 'email_verify' | 'password_reset'; payload_ciphertext: Buffer; attempts: number; challenge_valid: boolean }>(`
        SELECT o.id,o.user_id,u.email,o.purpose,o.payload_ciphertext,o.attempts,
          (c.consumed_at IS NULL AND c.expires_at>now()) AS challenge_valid
        FROM galung.identity_delivery_outbox o JOIN galung.users u ON u.id=o.user_id
        JOIN galung.auth_challenges c ON c.id=o.challenge_id
        WHERE (o.status='pending' AND o.available_at<=now()) OR (o.status='sending' AND o.lease_until<now())
        ORDER BY o.available_at LIMIT 1 FOR UPDATE OF o SKIP LOCKED`);
      if (!result.rowCount) return null;
      const row = result.rows[0];
      if (!row.challenge_valid) {
        await client.query(`UPDATE galung.identity_delivery_outbox SET status='expired',payload_ciphertext=NULL WHERE id=$1`, [row.id]);
        return null;
      }
      const attempts = row.attempts + 1;
      await client.query(`UPDATE galung.identity_delivery_outbox SET status='sending',attempts=$2,lease_until=now()+interval '2 minutes' WHERE id=$1`, [row.id, attempts]);
      return { id: row.id, userId: row.user_id, email: row.email, purpose: row.purpose, ciphertext: row.payload_ciphertext, attempts };
    });
  }
  async finishDelivery(delivery: { id: string; userId: string; attempts: number }, delivered: boolean, requestId: string): Promise<void> {
    await this.transaction(async client => {
      const result = await client.query(`UPDATE galung.identity_delivery_outbox SET status=$3,payload_ciphertext=CASE WHEN $4::boolean THEN NULL ELSE payload_ciphertext END,
        delivered_at=CASE WHEN $4::boolean THEN now() ELSE delivered_at END,
        available_at=CASE WHEN $4::boolean THEN available_at ELSE now()+interval '1 minute' END,lease_until=NULL
        WHERE id=$1 AND attempts=$2 AND status='sending' RETURNING id`,
        [delivery.id, delivery.attempts, delivered ? 'delivered' : 'pending', delivered]);
      if (result.rowCount) await this.audit(client, delivery.userId, delivered ? 'identity.email.delivered' : 'identity.email.delivery_failed', delivery.id, requestId);
    });
  }
  async consumeChallenge<T>(token: string, purpose: ChallengePurpose, work: (client: PoolClient, userId: string) => Promise<T>): Promise<T | null> {
    if (!/^[a-f0-9]{64}$/i.test(token)) return null;
    return this.transaction(async client => {
      const found = await client.query<{ id: string; user_id: string }>(`SELECT id,user_id FROM galung.auth_challenges
        WHERE challenge_hash=$1 AND purpose=$2 AND consumed_at IS NULL AND expires_at>now() FOR UPDATE`, [tokenHash(token), purpose]);
      if (!found.rowCount) return null;
      const challenge = found.rows[0];
      const result = await work(client, challenge.user_id);
      await client.query('UPDATE galung.auth_challenges SET consumed_at=now() WHERE id=$1', [challenge.id]);
      return result;
    });
  }
  async verifyEmail(token: string, requestId: string): Promise<boolean> {
    return (await this.consumeChallenge(token, 'email_verify', async (client, userId) => {
      await client.query('UPDATE galung.users SET email_verified_at=COALESCE(email_verified_at,now()),updated_at=now() WHERE id=$1', [userId]);
      await this.audit(client, userId, 'identity.email.verified', userId, requestId);
      return true;
    })) ?? false;
  }
  async resetPassword(token: string, passwordHash: string, requestId: string): Promise<boolean> {
    return (await this.consumeChallenge(token, 'password_reset', async (client, userId) => {
      await client.query('UPDATE galung.users SET password_hash=$2,updated_at=now() WHERE id=$1 AND status=$3', [userId, passwordHash, 'active']);
      await client.query('UPDATE galung.auth_sessions SET revoked_at=now() WHERE user_id=$1 AND revoked_at IS NULL', [userId]);
      await client.query(`UPDATE galung.auth_challenges SET consumed_at=now() WHERE user_id=$1 AND purpose IN ('login_mfa','password_reset') AND consumed_at IS NULL`, [userId]);
      await this.audit(client, userId, 'identity.password.reset', userId, requestId);
      return true;
    })) ?? false;
  }
  async issueSession(client: Queryable, userId: string, audience: Audience, authLevel: 'password' | 'mfa', config: IdentityConfiguration, requestId: string) {
    const token = newOpaqueToken();
    const csrf = csrfToken(token, config.IDENTITY_CSRF_KEY);
    const idle = audience === 'admin' ? config.SESSION_ADMIN_IDLE_MINUTES : config.SESSION_CUSTOMER_IDLE_MINUTES;
    const absolute = audience === 'admin' ? config.SESSION_ADMIN_ABSOLUTE_MINUTES : config.SESSION_CUSTOMER_ABSOLUTE_MINUTES;
    const result = await client.query<{ id: string; expires_at: Date }>(`INSERT INTO galung.auth_sessions
      (user_id,session_token_hash,audience,auth_level,mfa_completed_at,expires_at,idle_expires_at,last_seen_at,csrf_secret_hash)
      VALUES($1,$2,$3,$4,CASE WHEN $4='mfa' THEN now() ELSE NULL END,now()+($5::text || ' minutes')::interval,
      now()+(LEAST($5,$6)::text || ' minutes')::interval,now(),$7) RETURNING id,expires_at`,
      [userId, tokenHash(token), audience, authLevel, absolute, idle, tokenHash(csrf)]);
    await this.audit(client, userId, 'identity.session.issued', result.rows[0].id, requestId);
    return { id: result.rows[0].id, token, csrf, expiresAt: result.rows[0].expires_at };
  }
  async createSession(userId: string, audience: Audience, level: 'password' | 'mfa', config: IdentityConfiguration, requestId: string) {
    return this.transaction(client => this.issueSession(client, userId, audience, level, config, requestId));
  }
  async resolveSession(token: string, audience: Audience, idleMinutes: number): Promise<AuthSession | null> {
    if (!/^[a-f0-9]{64}$/i.test(token)) return null;
    const result = await this.pool.query<AuthSession>(`UPDATE galung.auth_sessions s SET last_seen_at=now(),
      idle_expires_at=LEAST(s.expires_at,now()+($3::text || ' minutes')::interval)
      FROM galung.users u WHERE s.user_id=u.id AND s.session_token_hash=$1 AND s.audience=$2
      AND s.revoked_at IS NULL AND s.expires_at>now() AND s.idle_expires_at>now() AND u.status='active'
      RETURNING s.id,s.user_id,s.audience,s.auth_level,s.csrf_secret_hash,s.expires_at,s.idle_expires_at`,
      [tokenHash(token), audience, idleMinutes]);
    const session = result.rows[0];
    if (!session) return null;
    const roles = await this.pool.query<{ code: string }>(`SELECT DISTINCT p.code FROM galung.user_roles ur
      JOIN galung.role_permissions rp ON rp.role_id=ur.role_id JOIN galung.permissions p ON p.id=rp.permission_id WHERE ur.user_id=$1`, [session.user_id]);
    session.permissions = roles.rows.map(row => row.code);
    if (audience === 'admin' && (session.auth_level !== 'mfa' || !session.permissions.includes('admin.access'))) return null;
    return session;
  }
  async revokeSession(ownerId: string, sessionId: string, audience: Audience, requestId: string): Promise<boolean> {
    return this.transaction(async client => {
      const result = await client.query('UPDATE galung.auth_sessions SET revoked_at=now() WHERE id=$1 AND user_id=$2 AND audience=$3 AND revoked_at IS NULL RETURNING id', [sessionId, ownerId, audience]);
      if (result.rowCount) await this.audit(client, ownerId, 'identity.session.revoked', sessionId, requestId);
      return !!result.rowCount;
    });
  }
  async profile(ownerId: string) {
    const result = await this.pool.query(`SELECT id,email,display_name AS "displayName",country_code AS "countryCode",
      preferred_locale AS "preferredLocale",email_verified_at AS "emailVerifiedAt",legal_billing_name AS "legalBillingName",
      company_name AS "companyName",company_registration_id AS "companyRegistrationId" FROM galung.users WHERE id=$1 AND status='active'`, [ownerId]);
    return result.rows[0] ?? null;
  }
  async sessions(ownerId: string, audience: Audience) {
    const result = await this.pool.query(`SELECT id,audience,auth_level AS "authLevel",issued_at AS "issuedAt",expires_at AS "expiresAt"
      FROM galung.auth_sessions WHERE user_id=$1 AND audience=$2 AND revoked_at IS NULL AND expires_at>now() AND idle_expires_at>now() ORDER BY issued_at DESC`, [ownerId, audience]);
    return result.rows;
  }
  async legalAcceptances(ownerId: string) {
    const result = await this.pool.query(`SELECT terms_version AS "termsVersion",privacy_notice_version AS "privacyNoticeVersion",accepted_at AS "acceptedAt"
      FROM galung.legal_acceptances WHERE user_id=$1 ORDER BY accepted_at DESC`, [ownerId]);
    return result.rows;
  }
  async privacyRequests(ownerId: string) {
    const result = await this.pool.query(`SELECT id,kind,status,requested_at AS "requestedAt" FROM galung.account_privacy_requests
      WHERE user_id=$1 ORDER BY requested_at DESC`, [ownerId]);
    return result.rows;
  }
  async requestPrivacy(ownerId: string, kind: 'export' | 'deletion', requestId: string) {
    return this.transaction(async client => {
      const inserted = await client.query<{ id: string }>(`INSERT INTO galung.account_privacy_requests(user_id,kind,request_id)
        VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id`, [ownerId, kind, requestId]);
      if (inserted.rowCount) await this.audit(client, ownerId, `identity.privacy.${kind}.requested`, inserted.rows[0].id, requestId);
      const result = await client.query<{ id: string; status: string }>(`SELECT id,status FROM galung.account_privacy_requests
        WHERE user_id=$1 AND kind=$2 AND status IN ('pending','in_review') ORDER BY requested_at DESC LIMIT 1`, [ownerId, kind]);
      return result.rows[0];
    });
  }
  async updateProfile(ownerId: string, update: { displayName?: string; preferredLocale?: string; countryCode?: string; legalBillingName?: string; companyName?: string | null; companyRegistrationId?: string | null }, requestId: string) {
    const changed = await this.transaction(async client => {
      const result = await client.query(`UPDATE galung.users SET display_name=COALESCE($2,display_name),preferred_locale=COALESCE($3,preferred_locale),
        country_code=COALESCE($4,country_code),legal_billing_name=COALESCE($5,legal_billing_name),
        company_name=CASE WHEN $6::boolean THEN $7 ELSE company_name END,
        company_registration_id=CASE WHEN $8::boolean THEN $9 ELSE company_registration_id END,
        updated_at=now() WHERE id=$1 AND status='active' RETURNING id`,
        [ownerId, update.displayName ?? null, update.preferredLocale ?? null, update.countryCode ?? null,
          update.legalBillingName ?? null, Object.hasOwn(update, 'companyName'), update.companyName ?? null,
          Object.hasOwn(update, 'companyRegistrationId'), update.companyRegistrationId ?? null]);
      if (!result.rowCount) return null;
      await this.audit(client, ownerId, 'identity.profile.updated', ownerId, requestId);
      return true;
    });
    return changed ? this.profile(ownerId) : null;
  }
  async adminFactorStatus(userId: string): Promise<'active' | 'pending' | 'absent'> {
    const result = await this.pool.query<{ status: 'active' | 'pending' }>(`SELECT status FROM galung.auth_factors
      WHERE user_id=$1 AND kind='totp' AND status IN ('active','pending') ORDER BY status='active' DESC LIMIT 1`, [userId]);
    return result.rows[0]?.status ?? 'absent';
  }
  async pendingMfaChallenge(challengeId: string, client: PoolClient, maxAttempts: number) {
    if (!/^[0-9a-f-]{36}$/i.test(challengeId)) return null;
    const result = await client.query<{ id: string; user_id: string }>(`SELECT id,user_id FROM galung.auth_challenges
      WHERE id=$1 AND purpose='login_mfa' AND audience='admin' AND consumed_at IS NULL AND expires_at>now() AND attempts<$2 FOR UPDATE`, [challengeId, maxAttempts]);
    return result.rows[0] ?? null;
  }
  async enrollFactor(challengeId: string, secret: string, config: IdentityConfiguration, requestId: string): Promise<boolean> {
    return this.transaction(async client => {
      const challenge = await this.pendingMfaChallenge(challengeId, client, config.MFA_CHALLENGE_MAX_ATTEMPTS);
      if (!challenge) return false;
      const existing = await client.query(`SELECT id FROM galung.auth_factors WHERE user_id=$1 AND kind='totp' AND status='active'`, [challenge.user_id]);
      if (existing.rowCount) return false;
      await client.query(`UPDATE galung.auth_factors SET status='revoked' WHERE user_id=$1 AND kind='totp' AND status='pending'`, [challenge.user_id]);
      await client.query(`INSERT INTO galung.auth_factors(user_id,kind,secret_ciphertext,status) VALUES($1,'totp',$2,'pending')`, [challenge.user_id, encryptFactor(secret, config.IDENTITY_ENCRYPTION_KEY)]);
      await this.audit(client, challenge.user_id, 'identity.mfa.enrollment.started', challenge.user_id, requestId);
      return true;
    });
  }
  async completeMfa(challengeId: string, code: string, config: IdentityConfiguration, requestId: string, enrollment: boolean) {
    return this.transaction(async client => {
      const challenge = await this.pendingMfaChallenge(challengeId, client, config.MFA_CHALLENGE_MAX_ATTEMPTS);
      if (!challenge) return null;
      const factor = await client.query<{ id: string; secret_ciphertext: Buffer; last_totp_step: string | null }>(`SELECT id,secret_ciphertext,last_totp_step FROM galung.auth_factors
        WHERE user_id=$1 AND kind='totp' AND status=$2 FOR UPDATE`, [challenge.user_id, enrollment ? 'pending' : 'active']);
      if (!factor.rowCount) return null;
      const row = factor.rows[0];
      const step = await verifyTotp(decryptFactor(row.secret_ciphertext, config.IDENTITY_ENCRYPTION_KEY), code, row.last_totp_step === null ? undefined : Number(row.last_totp_step));
      if (step === null) {
        await client.query(`UPDATE galung.auth_challenges SET attempts=attempts+1,
          consumed_at=CASE WHEN attempts+1 >= $2 THEN now() ELSE consumed_at END WHERE id=$1`, [challenge.id, config.MFA_CHALLENGE_MAX_ATTEMPTS]);
        await this.audit(client, challenge.user_id, 'identity.mfa.failed', challenge.id, requestId);
        return null;
      }
      await client.query(`UPDATE galung.auth_factors SET last_totp_step=$2,status='active',verified_at=COALESCE(verified_at,now()) WHERE id=$1`, [row.id, step]);
      await client.query(`UPDATE galung.auth_challenges SET consumed_at=now() WHERE id=$1`, [challenge.id]);
      let recoveryCodes: string[] | undefined;
      if (enrollment) {
        recoveryCodes = Array.from({ length: 8 }, newOpaqueToken);
        for (const recovery of recoveryCodes) await client.query(`INSERT INTO galung.auth_recovery_codes(user_id,code_hash)
          VALUES($1,$2)`, [challenge.user_id, tokenHash(recovery)]);
        await this.audit(client, challenge.user_id, 'identity.mfa.enrollment.completed', challenge.user_id, requestId);
      }
      const session = await this.issueSession(client, challenge.user_id, 'admin', 'mfa', config, requestId);
      return { ...session, recoveryCodes };
    });
  }
  async recoverMfa(challengeId: string, recoveryCode: string, config: IdentityConfiguration, requestId: string) {
    if (!/^[a-f0-9]{64}$/i.test(recoveryCode)) return null;
    return this.transaction(async client => {
      const challenge = await this.pendingMfaChallenge(challengeId, client, config.MFA_CHALLENGE_MAX_ATTEMPTS);
      if (!challenge) return null;
      const activeFactor = await client.query(`SELECT id FROM galung.auth_factors WHERE user_id=$1 AND kind='totp' AND status='active' FOR UPDATE`, [challenge.user_id]);
      if (!activeFactor.rowCount) return null;
      const result = await client.query<{ id: string }>(`SELECT id FROM galung.auth_recovery_codes WHERE user_id=$1 AND code_hash=$2
        AND used_at IS NULL AND (expires_at IS NULL OR expires_at>now()) FOR UPDATE`, [challenge.user_id, tokenHash(recoveryCode)]);
      if (!result.rowCount) {
        await client.query(`UPDATE galung.auth_challenges SET attempts=attempts+1,
          consumed_at=CASE WHEN attempts+1 >= $2 THEN now() ELSE consumed_at END WHERE id=$1`, [challenge.id, config.MFA_CHALLENGE_MAX_ATTEMPTS]);
        await this.audit(client, challenge.user_id, 'identity.mfa.recovery.failed', challenge.id, requestId);
        return null;
      }
      await client.query('UPDATE galung.auth_recovery_codes SET used_at=now() WHERE id=$1', [result.rows[0].id]);
      await client.query(`UPDATE galung.auth_sessions SET revoked_at=now() WHERE user_id=$1 AND audience='admin' AND revoked_at IS NULL`, [challenge.user_id]);
      await client.query('UPDATE galung.auth_challenges SET consumed_at=now() WHERE id=$1', [challenge.id]);
      await this.audit(client, challenge.user_id, 'identity.mfa.recovery.used', challenge.user_id, requestId);
      return this.issueSession(client, challenge.user_id, 'admin', 'mfa', config, requestId);
    });
  }
}

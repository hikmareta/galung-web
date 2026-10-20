import { Client } from 'pg';
import { randomUUID, randomBytes } from 'node:crypto';
import { IdentityStore } from '../apps/api/src/identity-store';

const client = new Client({ connectionString: process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL });
async function rejectsConstraint(sql: string, values: unknown[], code: string): Promise<void> {
  await client.query('SAVEPOINT negative_case');
  try {
    await client.query(sql, values);
    throw new Error(`Expected PostgreSQL ${code} rejection`);
  } catch (error) {
    if ((error as { code?: string }).code !== code) throw error;
  } finally { await client.query('ROLLBACK TO SAVEPOINT negative_case'); await client.query('RELEASE SAVEPOINT negative_case'); }
}
async function main() {
  if (!['test', 'staging'].includes(process.env.APP_ENV ?? '')) throw new Error('Disposable test/staging database only');
  await client.connect();
  try {
    const version = await client.query<{ server_version_num: string }>('SELECT current_setting($1) AS server_version_num', ['server_version_num']);
    const number = Number(version.rows[0].server_version_num);
    if (number < 160000 || number >= 170000) throw new Error(`PostgreSQL 16 required; got ${number}`);
    const applied = await client.query<{ id: string }>(`SELECT id FROM galung.schema_migrations WHERE id IN ('005_identity_contract_candidate','006_identity_runtime')`);
    if (applied.rowCount !== 2) throw new Error('Identity migrations not applied');
    await client.query('BEGIN');
    const user = await client.query<{ id: string }>(`INSERT INTO galung.users(email,password_hash)
      VALUES($1,$2) RETURNING id`, [`phase02-${randomUUID()}@example.invalid`, 'synthetic-no-login']);
    const id = user.rows[0].id;
    await rejectsConstraint(`INSERT INTO galung.auth_sessions(user_id,session_token_hash,expires_at) VALUES($1,$2,now()+interval '1 hour')`, [id, randomBytes(32)], '23514');
    await rejectsConstraint(`INSERT INTO galung.auth_sessions(user_id,session_token_hash,expires_at,audience,idle_expires_at,csrf_secret_hash)
      VALUES($1,$2,now()+interval '1 hour','customer',now()+interval '30 minutes',$3)`, [id, randomBytes(31), randomBytes(32)], '23514');
    await rejectsConstraint(`INSERT INTO galung.auth_challenges(user_id,purpose,challenge_hash,expires_at,audience)
      VALUES($1,'invalid',$2,now()+interval '1 hour','customer')`, [id, randomBytes(32)], '23514');
    await client.query(`INSERT INTO galung.auth_factors(user_id,kind,secret_ciphertext,status) VALUES($1,'totp',$2,'active')`, [id, randomBytes(40)]);
    await rejectsConstraint(`INSERT INTO galung.auth_factors(user_id,kind,secret_ciphertext,status) VALUES($1,'totp',$2,'active')`, [id, randomBytes(40)], '23505');
    await rejectsConstraint(`INSERT INTO galung.auth_recovery_codes(user_id,code_hash) VALUES($1,$2)`, [id, randomBytes(31)], '23514');
    const roles = await client.query<{ code: string }>(`SELECT code FROM galung.roles WHERE code IN ('customer','identity_admin')`);
    if (roles.rowCount !== 2) throw new Error('Identity roles missing');
    await client.query('ROLLBACK');
    const raceUser = await client.query<{ id: string }>(`INSERT INTO galung.users(email,password_hash)
      VALUES($1,$2) RETURNING id`, [`phase02-race-${randomUUID()}@example.invalid`, 'synthetic-no-login']);
    const store = new IdentityStore();
    try {
      const challenge = await store.challenge(raceUser.rows[0].id, 'password_reset', 'customer', 10, 'postgres16-race', randomBytes(32));
      const results = await Promise.all([
        store.resetPassword(challenge.token, 'synthetic-hash-1', 'postgres16-race'),
        store.resetPassword(challenge.token, 'synthetic-hash-2', 'postgres16-race'),
      ]);
      if (results.filter(Boolean).length !== 1) throw new Error(`Reset race consumed ${results.filter(Boolean).length} times`);
      await client.query('DELETE FROM galung.audit_logs WHERE actor_id=$1', [raceUser.rows[0].id]);
      await client.query('DELETE FROM galung.auth_challenges WHERE user_id=$1', [raceUser.rows[0].id]);
      await client.query('DELETE FROM galung.users WHERE id=$1', [raceUser.rows[0].id]);
    } finally { await (Reflect.get(store, 'pool') as { end: () => Promise<void> }).end(); }
    process.stdout.write('Identity PostgreSQL 16 constraints passed\n');
  } finally { await client.end(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Identity DB check failed'); process.exitCode = 1; });

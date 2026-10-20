import { Body, Controller, Get, HttpCode, HttpException, Inject, Injectable, NestMiddleware, Param, Patch, Post, Req, Res, ServiceUnavailableException } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import Redis from 'ioredis';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import type { Principal } from '@galung/authz';
import { PublicRoute, RequirePermission } from './authorization';
import { IdentityStore, type Audience, type AuthSession } from './identity-store';
import { csrfToken, hashPassword, identityConfiguration, newTotpSecret, safeHashMatch, verifyPassword, type IdentityConfiguration } from './identity-security';

type IdentityRequest = Request & { requestId?: string; principal?: Principal; identitySession?: AuthSession; rawSessionToken?: string; audience?: Audience };
const email = z.string().email().max(320).transform(value => value.trim().toLowerCase());
const password = z.string().min(12).max(1024);
const registerInput = z.object({ email, password, displayName: z.string().trim().min(1).max(150), countryCode: z.string().regex(/^[A-Z]{2}$/), preferredLocale: z.enum(['id-ID','en']), termsVersion: z.string().min(1), privacyNoticeVersion: z.string().min(1), acceptTerms: z.literal(true), acknowledgePrivacy: z.literal(true) }).strict();
const loginInput = z.object({ email, password: z.string(), audience: z.enum(['customer','admin']) }).strict();
const emailInput = z.object({ email }).strict();
const confirmInput = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/i) }).strict();
const resetInput = confirmInput.extend({ newPassword: password });
const mfaInput = z.object({ challengeId: z.string().uuid(), code: z.string().regex(/^\d{6}$/) }).strict();
const recoveryInput = z.object({ challengeId: z.string().uuid(), recoveryCode: z.string().regex(/^[a-f0-9]{64}$/i) }).strict();
const enrollInput = z.object({ challengeId: z.string().uuid() }).strict();
const profileInput = z.object({ displayName: z.string().trim().min(1).max(150).optional(), preferredLocale: z.enum(['id-ID','en']).optional(),
  countryCode: z.string().regex(/^[A-Z]{2}$/).optional(), legalBillingName: z.string().trim().min(1).max(200).optional(),
  companyName: z.string().trim().min(1).max(200).nullable().optional(), companyRegistrationId: z.string().trim().min(1).max(100).nullable().optional() }).strict().refine(value => Object.keys(value).length > 0);
const privacyInput = z.object({ kind: z.enum(['export','deletion']) }).strict();
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const fail = (status: number, code: string) => new HttpException({ error: { code, message: code } }, status);
const parsed = <T>(schema: z.ZodType<T>, body: unknown): T => { const result = schema.safeParse(body); if (!result.success) throw fail(400, 'INVALID_INPUT'); return result.data; };
const cookieValue = (header: string | undefined, name: string): string | undefined => (header ?? '').split(';').map(value => value.trim()).find(value => value.startsWith(`${name}=`))?.slice(name.length + 1);
const cookieName = (audience: Audience) => audience === 'admin' ? '__Host-galung_admin' : '__Host-galung_customer';
const setCookie = (response: Response, audience: Audience, token: string, expiresAt: Date) => response.cookie(cookieName(audience), token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: Math.max(0, expiresAt.getTime() - Date.now()) });
const clearCookie = (response: Response, audience: Audience) => response.clearCookie(cookieName(audience), { httpOnly: true, secure: true, sameSite: 'lax', path: '/' });

@Injectable()
export class IdentityGateway {
  readonly config: IdentityConfiguration | null;
  private readonly redis: Redis | null;
  private readonly dummyHash: Promise<string> | null;
  constructor(@Inject(IdentityStore) readonly store: IdentityStore) {
    this.config = process.env.IDENTITY_ENABLED === 'true' ? identityConfiguration.parse(process.env) : null;
    if (this.config && !['local', 'test'].includes(process.env.APP_ENV ?? '')) {
      if (!this.config.CUSTOMER_ORIGIN.startsWith('https://') || !this.config.ADMIN_ORIGIN.startsWith('https://') || !this.config.SMTP_URL.startsWith('smtps://'))
        throw new Error('Identity production transport requires TLS');
    }
    this.redis = this.config ? new Redis(process.env.REDIS_URL!, { lazyConnect: true, maxRetriesPerRequest: 0, connectTimeout: 2000 }) : null;
    this.dummyHash = this.config ? hashPassword('galung synthetic account placeholder', this.config) : null;
  }
  requireConfig(): IdentityConfiguration { if (!this.config) throw new ServiceUnavailableException({ error: { code: 'IDENTITY_DISABLED', message: 'Identity unavailable' } }); return this.config; }
  async rate(action: string, req: IdentityRequest, account?: string): Promise<void> {
    this.requireConfig();
    const redis = this.redis!;
    try {
      if (redis.status === 'wait') await redis.connect();
      const network = req.ip || req.socket.remoteAddress || 'unknown';
      const subjects = [`network:${network}`, ...(account ? [`account:${account}`] : [])];
      for (const subject of subjects) {
        const key = `identity:rate:${action}:${digest(subject)}`;
        const result = await redis.multi().incr(key).expire(key, this.config!.IDENTITY_RATE_LIMIT_WINDOW_SECONDS, 'NX').exec();
        if (!result || Number(result[0]?.[1]) > this.config!.IDENTITY_RATE_LIMIT_MAX) throw fail(429, 'RATE_LIMITED');
      }
    } catch (error) { if (error instanceof HttpException) throw error; throw new ServiceUnavailableException({ error: { code: 'RATE_LIMIT_UNAVAILABLE', message: 'Try again later' } }); }
  }
  async dummyVerify(candidate: string) { return verifyPassword(await this.dummyHash!, candidate); }
}

@Injectable()
export class IdentityMiddleware implements NestMiddleware {
  constructor(@Inject(IdentityGateway) private readonly gateway: IdentityGateway) {}
  async use(req: IdentityRequest, res: Response, next: NextFunction) {
    try {
      const config = this.gateway.config;
      if (!config) return next();
      const route = new URL(req.originalUrl, 'http://local.invalid').pathname.replace(/^\/api\/v1/, '');
      const mutation = !['GET','HEAD','OPTIONS'].includes(req.method);
      if (mutation) {
        const origin = req.headers.origin;
        if (!origin || ![config.CUSTOMER_ORIGIN, config.ADMIN_ORIGIN].includes(origin)) throw fail(403, 'ORIGIN_DENIED');
        if ((req.headers['content-length'] !== undefined && req.headers['content-length'] !== '0' || req.headers['transfer-encoding']) && !req.is('application/json')) throw fail(415, 'JSON_REQUIRED');
      }
      const requested = req.headers['x-galung-audience'];
      if (requested !== undefined && requested !== 'customer' && requested !== 'admin') throw fail(400, 'INVALID_AUDIENCE');
      const audience: Audience = route.startsWith('/admin/') || requested === 'admin' ? 'admin' : 'customer';
      req.audience = audience;
      const expectedOrigin = audience === 'admin' ? config.ADMIN_ORIGIN : config.CUSTOMER_ORIGIN;
      if ((route.startsWith('/admin/') || route.startsWith('/me') ||
        route === '/auth/csrf' || route === '/auth/session' || route === '/auth/logout') && req.headers.origin !== expectedOrigin)
        throw fail(403, 'ORIGIN_DENIED');
      if (route.startsWith('/auth/mfa/') && req.headers.origin !== config.ADMIN_ORIGIN) throw fail(403, 'ORIGIN_DENIED');
      const token = cookieValue(req.headers.cookie, cookieName(audience));
      if (token) {
        const idle = audience === 'admin' ? config.SESSION_ADMIN_IDLE_MINUTES : config.SESSION_CUSTOMER_IDLE_MINUTES;
        const session = await this.gateway.store.resolveSession(token, audience, idle);
        if (session) {
          req.identitySession = session;
          req.rawSessionToken = token;
          req.principal = { id: session.user_id, permissions: session.permissions, mfaVerified: session.auth_level === 'mfa' };
          if (mutation && !/^\/auth\/(register|login|email-verification|password-reset|mfa)/.test(route)) {
            const csrf = req.headers['x-csrf-token'];
            if (typeof csrf !== 'string' || !safeHashMatch(csrf, session.csrf_secret_hash)) throw fail(403, 'CSRF_INVALID');
          }
        }
      }
      next();
    } catch (error) {
      if (error instanceof HttpException) res.status(error.getStatus()).json({ ...(error.getResponse() as object), requestId: req.requestId ?? 'unavailable' });
      else res.status(503).json({ error: { code: 'IDENTITY_UNAVAILABLE', message: 'Identity unavailable' }, requestId: req.requestId ?? 'unavailable' });
    }
  }
}

@Controller('auth')
export class IdentityController {
  constructor(@Inject(IdentityGateway) private readonly gateway: IdentityGateway) {}
  @Post('register') @PublicRoute() @HttpCode(201)
  async register(@Req() req: IdentityRequest, @Body() body: unknown) {
    const config = this.gateway.requireConfig();
    const input = parsed(registerInput, body);
    if (req.headers.origin !== config.CUSTOMER_ORIGIN) throw fail(403, 'ORIGIN_DENIED');
    await this.gateway.rate('register', req, input.email);
    if (input.termsVersion !== config.LEGAL_TERMS_VERSION || input.privacyNoticeVersion !== config.LEGAL_PRIVACY_VERSION) throw fail(409, 'LEGAL_VERSION_STALE');
    let userId: string;
    try { userId = await this.gateway.store.register({ email: input.email, passwordHash: await hashPassword(input.password, config), displayName: input.displayName, countryCode: input.countryCode, locale: input.preferredLocale, termsVersion: config.LEGAL_TERMS_VERSION, termsHash: config.LEGAL_TERMS_SHA256, privacyVersion: config.LEGAL_PRIVACY_VERSION, privacyHash: config.LEGAL_PRIVACY_SHA256, requestId: req.requestId! }); }
    catch (error) { if ((error as { code?: string }).code === '23505') return { status: 'verification_pending' }; throw error; }
    await this.gateway.store.challenge(userId, 'email_verify', 'customer', config.CHALLENGE_EMAIL_MINUTES, req.requestId!, config.IDENTITY_OUTBOX_KEY);
    return { status: 'verification_pending' };
  }
  @Post('email-verification/request') @PublicRoute() @HttpCode(202)
  async verificationRequest(@Req() req: IdentityRequest, @Body() body: unknown) {
    const config = this.gateway.requireConfig(), input = parsed(emailInput, body);
    if (req.headers.origin !== config.CUSTOMER_ORIGIN) throw fail(403, 'ORIGIN_DENIED');
    await this.gateway.rate('email-verification', req, input.email);
    const user = await this.gateway.store.userByEmail(input.email);
    if (user && !user.email_verified_at && user.status === 'active') {
      await this.gateway.store.challenge(user.id, 'email_verify', 'customer', config.CHALLENGE_EMAIL_MINUTES, req.requestId!, config.IDENTITY_OUTBOX_KEY);
    }
    return { status: 'accepted' };
  }
  @Post('email-verification/confirm') @PublicRoute() @HttpCode(204)
  async verifyEmail(@Req() req: IdentityRequest, @Body() body: unknown) {
    const config = this.gateway.requireConfig(); const input = parsed(confirmInput, body);
    if (req.headers.origin !== config.CUSTOMER_ORIGIN) throw fail(403, 'ORIGIN_DENIED');
    await this.gateway.rate('email-confirm', req);
    if (!await this.gateway.store.verifyEmail(input.token, req.requestId!)) throw fail(409, 'TOKEN_INVALID_OR_USED');
  }
  @Post('password-reset/request') @PublicRoute() @HttpCode(202)
  async resetRequest(@Req() req: IdentityRequest, @Body() body: unknown) {
    const config = this.gateway.requireConfig(), input = parsed(emailInput, body);
    if (req.headers.origin !== config.CUSTOMER_ORIGIN) throw fail(403, 'ORIGIN_DENIED');
    await this.gateway.rate('password-reset', req, input.email);
    const user = await this.gateway.store.userByEmail(input.email);
    if (user?.email_verified_at && user.status === 'active') {
      await this.gateway.store.challenge(user.id, 'password_reset', 'customer', config.CHALLENGE_RESET_MINUTES, req.requestId!, config.IDENTITY_OUTBOX_KEY);
    }
    return { status: 'accepted' };
  }
  @Post('password-reset/confirm') @PublicRoute() @HttpCode(204)
  async resetConfirm(@Req() req: IdentityRequest, @Body() body: unknown) {
    const config = this.gateway.requireConfig(); const input = parsed(resetInput, body);
    if (req.headers.origin !== config.CUSTOMER_ORIGIN) throw fail(403, 'ORIGIN_DENIED');
    await this.gateway.rate('password-confirm', req);
    if (!await this.gateway.store.resetPassword(input.token, await hashPassword(input.newPassword, config), req.requestId!)) throw fail(409, 'TOKEN_INVALID_OR_USED');
  }
  @Post('login') @PublicRoute() @HttpCode(200)
  async login(@Req() req: IdentityRequest, @Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const config = this.gateway.requireConfig(), input = parsed(loginInput, body);
    if (req.headers.origin !== (input.audience === 'admin' ? config.ADMIN_ORIGIN : config.CUSTOMER_ORIGIN)) throw fail(403, 'ORIGIN_DENIED');
    await this.gateway.rate('login', req, input.email);
    const user = await this.gateway.store.userByEmail(input.email);
    const valid = user ? await verifyPassword(user.password_hash, input.password) : await this.gateway.dummyVerify(input.password);
    if (!valid || !user || user.status !== 'active' || !user.email_verified_at) {
      await this.gateway.store.auditFailure('identity.login.failed', digest(input.email), req.requestId!);
      throw fail(401, 'INVALID_CREDENTIALS');
    }
    if (input.audience === 'admin') {
      if (!user.admin) {
        await this.gateway.store.auditFailure('identity.admin_login.denied', digest(input.email), req.requestId!);
        throw fail(401, 'INVALID_CREDENTIALS');
      }
      const challenge = await this.gateway.store.challenge(user.id, 'login_mfa', 'admin', config.CHALLENGE_MFA_MINUTES, req.requestId!);
      res.status(202);
      return { challengeId: challenge.id, expiresInMinutes: config.CHALLENGE_MFA_MINUTES, enrollmentRequired: (await this.gateway.store.adminFactorStatus(user.id)) !== 'active' };
    }
    const session = await this.gateway.store.createSession(user.id, 'customer', 'password', config, req.requestId!);
    setCookie(res, 'customer', session.token, session.expiresAt);
    return { id: session.id, audience: 'customer', expiresAt: session.expiresAt, authLevel: 'password' };
  }
  @Post('mfa/enroll') @PublicRoute() @HttpCode(200)
  async enroll(@Req() req: IdentityRequest, @Body() body: unknown) {
    const config = this.gateway.requireConfig(), input = parsed(enrollInput, body);
    await this.gateway.rate('mfa-enroll', req);
    const secret = newTotpSecret();
    if (!await this.gateway.store.enrollFactor(input.challengeId, secret, config, req.requestId!)) throw fail(401, 'MFA_CHALLENGE_INVALID');
    return { secret };
  }
  @Post('mfa/enroll/confirm') @PublicRoute() @HttpCode(200)
  async confirmEnrollment(@Req() req: IdentityRequest, @Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const config = this.gateway.requireConfig(), input = parsed(mfaInput, body);
    await this.gateway.rate('mfa-confirm', req);
    const session = await this.gateway.store.completeMfa(input.challengeId, input.code, config, req.requestId!, true);
    if (!session) throw fail(401, 'MFA_INVALID');
    setCookie(res, 'admin', session.token, session.expiresAt);
    return { id: session.id, audience: 'admin', expiresAt: session.expiresAt, authLevel: 'mfa', recoveryCodes: session.recoveryCodes };
  }
  @Post('mfa/complete') @PublicRoute() @HttpCode(200)
  async completeMfa(@Req() req: IdentityRequest, @Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const config = this.gateway.requireConfig(), input = parsed(mfaInput, body);
    await this.gateway.rate('mfa-complete', req);
    const session = await this.gateway.store.completeMfa(input.challengeId, input.code, config, req.requestId!, false);
    if (!session) throw fail(401, 'MFA_INVALID');
    setCookie(res, 'admin', session.token, session.expiresAt);
    return { id: session.id, audience: 'admin', expiresAt: session.expiresAt, authLevel: 'mfa' };
  }
  @Post('mfa/recovery') @PublicRoute() @HttpCode(200)
  async recoverMfa(@Req() req: IdentityRequest, @Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const config = this.gateway.requireConfig(), input = parsed(recoveryInput, body);
    await this.gateway.rate('mfa-recovery', req);
    const session = await this.gateway.store.recoverMfa(input.challengeId, input.recoveryCode, config, req.requestId!);
    if (!session) throw fail(401, 'MFA_INVALID');
    setCookie(res, 'admin', session.token, session.expiresAt);
    return { id: session.id, audience: 'admin', expiresAt: session.expiresAt, authLevel: 'mfa' };
  }
  @Get('csrf') @RequirePermission('account.read')
  csrf(@Req() req: IdentityRequest) { return { csrfToken: csrfToken(req.rawSessionToken!, this.gateway.requireConfig().IDENTITY_CSRF_KEY) }; }
  @Get('session') @RequirePermission('account.read')
  session(@Req() req: IdentityRequest) { const session = req.identitySession!; return { id: session.id, audience: session.audience, expiresAt: session.expires_at, authLevel: session.auth_level }; }
  @Post('logout') @RequirePermission('account.read') @HttpCode(204)
  async logout(@Req() req: IdentityRequest, @Res({ passthrough: true }) res: Response) {
    await this.gateway.store.revokeSession(req.principal!.id, req.identitySession!.id, req.audience!, req.requestId!);
    clearCookie(res, req.audience!);
  }
}

@Controller('me')
export class IdentityProfileController {
  constructor(@Inject(IdentityGateway) private readonly gateway: IdentityGateway) {}
  @Get() @RequirePermission('account.read')
  profile(@Req() req: IdentityRequest) { return this.gateway.store.profile(req.principal!.id); }
  @Patch() @RequirePermission('account.write')
  update(@Req() req: IdentityRequest, @Body() body: unknown) { return this.gateway.store.updateProfile(req.principal!.id, parsed(profileInput, body), req.requestId!); }
  @Get('sessions') @RequirePermission('account.read')
  sessions(@Req() req: IdentityRequest) { return this.gateway.store.sessions(req.principal!.id, req.audience!); }
  @Post('sessions/:id/revoke') @RequirePermission('account.write') @HttpCode(204)
  async revoke(@Req() req: IdentityRequest, @Param('id') id: string) {
    if (!z.string().uuid().safeParse(id).success) throw fail(400, 'INVALID_INPUT');
    if (!await this.gateway.store.revokeSession(req.principal!.id, id, req.audience!, req.requestId!)) throw fail(404, 'NOT_FOUND');
  }
  @Get('legal-acceptances') @RequirePermission('account.read')
  legal(@Req() req: IdentityRequest) { return this.gateway.store.legalAcceptances(req.principal!.id); }
  @Get('privacy-requests') @RequirePermission('account.read')
  privacy(@Req() req: IdentityRequest) { return this.gateway.store.privacyRequests(req.principal!.id); }
  @Post('privacy-requests') @RequirePermission('account.write') @HttpCode(202)
  requestPrivacy(@Req() req: IdentityRequest, @Body() body: unknown) {
    return this.gateway.store.requestPrivacy(req.principal!.id, parsed(privacyInput, body).kind, req.requestId!);
  }
}

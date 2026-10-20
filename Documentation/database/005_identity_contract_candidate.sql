-- ODL-007 identity-only additive review candidate; NOT approved for production.
-- Requires 001 and 003. No commercial data or credentials are seeded.
BEGIN;
SET search_path TO galung, public;

ALTER TABLE auth_sessions ADD COLUMN audience text;
ALTER TABLE auth_sessions ADD COLUMN last_seen_at timestamptz;
ALTER TABLE auth_sessions ADD COLUMN idle_expires_at timestamptz;
ALTER TABLE auth_sessions ADD COLUMN csrf_secret_hash bytea;
ALTER TABLE auth_sessions ADD COLUMN generation integer NOT NULL DEFAULT 1;
ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_audience_check CHECK (audience IS NULL OR audience IN ('customer','admin'));
ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_generation_check CHECK (generation > 0);
ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_idle_check CHECK (idle_expires_at IS NULL OR idle_expires_at <= expires_at);
ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_csrf_hash_check CHECK (csrf_secret_hash IS NULL OR length(csrf_secret_hash) = 32);
ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_auth_level_check CHECK (auth_level IN ('password','mfa'));
CREATE INDEX ix_auth_sessions_active_user ON auth_sessions(user_id, audience, expires_at) WHERE revoked_at IS NULL;

ALTER TABLE auth_challenges ADD COLUMN audience text;
ALTER TABLE auth_challenges ADD COLUMN request_id text;
ALTER TABLE auth_challenges ADD CONSTRAINT auth_challenges_audience_check CHECK (audience IS NULL OR audience IN ('customer','admin'));
ALTER TABLE auth_challenges ADD CONSTRAINT auth_challenges_purpose_check CHECK (purpose IN ('email_verify','password_reset','login_mfa','mfa_enroll','mfa_recovery','email_change'));
ALTER TABLE auth_challenges ADD CONSTRAINT auth_challenges_lifetime_check CHECK (expires_at > created_at);

ALTER TABLE auth_factors ADD CONSTRAINT auth_factors_kind_check CHECK (kind IN ('totp'));
CREATE UNIQUE INDEX uq_auth_factors_one_active_totp ON auth_factors(user_id, kind) WHERE status = 'active';
ALTER TABLE auth_recovery_codes ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE auth_recovery_codes ADD COLUMN expires_at timestamptz;
ALTER TABLE auth_recovery_codes ADD CONSTRAINT auth_recovery_codes_lifetime_check CHECK (expires_at IS NULL OR expires_at > created_at);
CREATE INDEX ix_auth_recovery_codes_unused ON auth_recovery_codes(user_id) WHERE used_at IS NULL;

COMMIT;

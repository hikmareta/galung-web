-- Phase 02 identity-only draft. Apply after 005 in a disposable PostgreSQL 16 database.
-- No users, credentials, legal texts, or administrative grants are seeded.
BEGIN;
SET search_path TO galung, public;

ALTER TABLE users ADD COLUMN legal_billing_name text;
ALTER TABLE users ADD COLUMN company_name text;
ALTER TABLE users ADD COLUMN company_registration_id text;
ALTER TABLE users ADD CONSTRAINT users_billing_name_length CHECK (legal_billing_name IS NULL OR length(trim(legal_billing_name)) BETWEEN 1 AND 200);
ALTER TABLE users ADD CONSTRAINT users_company_name_length CHECK (company_name IS NULL OR length(trim(company_name)) BETWEEN 1 AND 200);
ALTER TABLE users ADD CONSTRAINT users_company_registration_length CHECK (company_registration_id IS NULL OR length(trim(company_registration_id)) BETWEEN 1 AND 100);
CREATE TABLE account_privacy_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
 kind text NOT NULL CHECK (kind IN ('export','deletion')), status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_review','completed','rejected')),
 requested_at timestamptz NOT NULL DEFAULT now(), request_id text NOT NULL
);
CREATE UNIQUE INDEX uq_account_privacy_pending ON account_privacy_requests(user_id,kind) WHERE status IN ('pending','in_review');
CREATE TABLE identity_delivery_outbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), challenge_id uuid NOT NULL REFERENCES auth_challenges(id), user_id uuid NOT NULL REFERENCES users(id),
 purpose text NOT NULL CHECK (purpose IN ('email_verify','password_reset')),
 payload_ciphertext bytea, status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','delivered','expired')),
 attempts integer NOT NULL DEFAULT 0 CHECK (attempts>=0), available_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz,
 delivered_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (status NOT IN ('pending','sending') OR payload_ciphertext IS NOT NULL)
);
CREATE INDEX ix_identity_delivery_due ON identity_delivery_outbox(available_at) WHERE status IN ('pending','sending');

-- Legacy sessions predate audience and CSRF binding. Revoke instead of guessing.
UPDATE auth_sessions SET revoked_at = now() WHERE revoked_at IS NULL AND (audience IS NULL OR csrf_secret_hash IS NULL OR idle_expires_at IS NULL);
ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_live_complete CHECK (
  revoked_at IS NOT NULL OR (audience IS NOT NULL AND csrf_secret_hash IS NOT NULL AND idle_expires_at IS NOT NULL)
);
ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_token_hash_length CHECK (length(session_token_hash)=32);
ALTER TABLE auth_challenges ADD CONSTRAINT auth_challenges_hash_length CHECK (length(challenge_hash)=32);
ALTER TABLE auth_recovery_codes ADD CONSTRAINT auth_recovery_codes_hash_length CHECK (length(code_hash)=32);
ALTER TABLE auth_factors ADD COLUMN last_totp_step bigint;
ALTER TABLE auth_factors ADD CONSTRAINT auth_factors_step_check CHECK (last_totp_step IS NULL OR last_totp_step >= 0);

INSERT INTO roles(code, description) VALUES ('customer', 'Verified customer self-service') ON CONFLICT(code) DO NOTHING;
INSERT INTO roles(code, description) VALUES ('identity_admin', 'Administrative identity access requiring MFA') ON CONFLICT(code) DO NOTHING;
INSERT INTO permissions(code, description) VALUES
  ('account.read', 'Read own account and sessions'),
  ('account.write', 'Update own profile and sessions'),
  ('admin.access', 'Access identity administration')
ON CONFLICT(code) DO NOTHING;
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code='customer' AND p.code IN ('account.read','account.write')
ON CONFLICT DO NOTHING;
INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code='identity_admin' AND p.code IN ('account.read','account.write','admin.access')
ON CONFLICT DO NOTHING;

CREATE FUNCTION galung.assign_customer_role(p_user_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = galung, pg_temp AS $$
BEGIN
  INSERT INTO user_roles(user_id,role_id)
  SELECT p_user_id,id FROM roles WHERE code='customer';
  IF NOT FOUND THEN RAISE EXCEPTION 'Customer role missing'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION galung.assign_customer_role(uuid) FROM PUBLIC;

COMMIT;

-- Phase 00 contract reconciliation DRAFT, PostgreSQL 16+ target.
-- Apply after 001_core_schema.sql in an isolated review database only.
-- No commercial values, bank data, private keys or user records are seeded.
-- Production migration approval, Prisma compatibility, grants and rollback remain pending.
BEGIN;
CREATE EXTENSION IF NOT EXISTS btree_gist;
SET search_path TO galung, public;

-- D-01: record evidence of legal text versions; do not conflate privacy notice
-- acknowledgement with optional marketing consent.
CREATE TABLE legal_acceptances (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
 source_order_id uuid REFERENCES orders(id), terms_version text NOT NULL,
 terms_content_hash bytea NOT NULL, privacy_notice_version text NOT NULL,
 privacy_notice_hash bytea NOT NULL, locale text NOT NULL, country_code char(2) NOT NULL,
 accepted_at timestamptz NOT NULL DEFAULT now(), request_id text NOT NULL,
 CHECK (length(terms_content_hash)=32 AND length(privacy_notice_hash)=32)
);
CREATE INDEX ix_legal_acceptances_user ON legal_acceptances(user_id,accepted_at DESC);
CREATE TABLE marketing_consents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
 purpose text NOT NULL, consent_version text NOT NULL, granted boolean NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now(), request_id text NOT NULL
);
CREATE INDEX ix_marketing_consents_user_purpose ON marketing_consents(user_id,purpose,recorded_at DESC);
ALTER TABLE invoices ADD COLUMN legal_acceptance_id uuid REFERENCES legal_acceptances(id);
ALTER TABLE invoices ADD COLUMN company_identity_snapshot jsonb;
ALTER TABLE invoices ADD COLUMN tax_basis_snapshot jsonb;
ALTER TABLE invoices ADD COLUMN payment_terms_snapshot jsonb;

-- Identity-provider choice is pending. These tables describe minimum state only;
-- a reviewed provider may replace them before production deployment.
CREATE TABLE auth_factors (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
 kind text NOT NULL, secret_ciphertext bytea, public_credential jsonb,
 status text NOT NULL CHECK (status IN ('pending','active','revoked')),
 created_at timestamptz NOT NULL DEFAULT now(), verified_at timestamptz,
 CHECK (secret_ciphertext IS NOT NULL OR public_credential IS NOT NULL)
);
CREATE TABLE auth_recovery_codes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
 code_hash bytea NOT NULL UNIQUE, used_at timestamptz
);
CREATE TABLE auth_challenges (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id),
 purpose text NOT NULL, challenge_hash bytea NOT NULL UNIQUE,
 expires_at timestamptz NOT NULL, consumed_at timestamptz,
 attempts integer NOT NULL DEFAULT 0 CHECK (attempts>=0),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_auth_challenges_expiry ON auth_challenges(expires_at) WHERE consumed_at IS NULL;
ALTER TABLE auth_sessions ADD COLUMN mfa_completed_at timestamptz;
ALTER TABLE auth_sessions ADD COLUMN auth_level text NOT NULL DEFAULT 'password';
ALTER TABLE auth_sessions ADD COLUMN last_step_up_at timestamptz;

-- D-02: settlement metadata and bank maker/checker evidence. No supported
-- currency or fee policy is inferred from this structure.
CREATE TABLE currency_metadata (
 code char(3) PRIMARY KEY, minor_exponent smallint NOT NULL CHECK (minor_exponent BETWEEN 0 AND 9),
 valid_from timestamptz NOT NULL, valid_to timestamptz,
 approved_by uuid NOT NULL REFERENCES users(id),
 CHECK (valid_to IS NULL OR valid_to>valid_from)
);
CREATE TABLE bank_account_currencies (
 bank_account_id uuid NOT NULL REFERENCES bank_accounts(id),
 currency_code char(3) NOT NULL REFERENCES currency_metadata(code),
 can_receive boolean NOT NULL DEFAULT false,
 PRIMARY KEY(bank_account_id,currency_code)
);
ALTER TABLE bank_account_change_requests ADD COLUMN proposal_digest bytea;
ALTER TABLE bank_account_change_requests ADD COLUMN expected_account_version integer;
ALTER TABLE bank_account_change_requests ADD COLUMN requester_mfa_at timestamptz;
ALTER TABLE bank_account_change_requests ADD COLUMN reviewer_mfa_at timestamptz;
ALTER TABLE bank_account_change_requests ADD COLUMN published_at timestamptz;
ALTER TABLE bank_account_change_requests ADD COLUMN effective_at timestamptz;
ALTER TABLE bank_account_change_requests ADD CONSTRAINT bank_change_mfa_pair
 CHECK (status <> 'applied' OR
        (reviewed_by IS NOT NULL AND reviewed_by <> requested_by AND
         requester_mfa_at IS NOT NULL AND reviewer_mfa_at IS NOT NULL AND
         published_at IS NOT NULL AND proposal_digest IS NOT NULL)) NOT VALID;
ALTER TABLE bank_credits ADD CONSTRAINT bank_credit_reference_nonblank
 CHECK (length(trim(bank_reference))>0);
CREATE TABLE financial_adjustments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id),
 bank_credit_id uuid REFERENCES bank_credits(id), kind text NOT NULL,
 amount_minor bigint NOT NULL, currency_code char(3) NOT NULL,
 reason text NOT NULL, requested_by uuid NOT NULL REFERENCES users(id),
 approved_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (approved_by IS NULL OR approved_by<>requested_by)
);
CREATE UNIQUE INDEX uq_payment_submission_approved_once
 ON payment_reviews(payment_submission_id) WHERE decision='approved';
ALTER TABLE prices ADD CONSTRAINT ex_prices_published_overlap
 EXCLUDE USING gist (plan_id WITH =, billing_months WITH =, currency_code WITH =,
                     tstzrange(starts_at,ends_at,'[)') WITH &&)
 WHERE (status='active');
ALTER TABLE plan_policy_versions ADD CONSTRAINT ex_policies_published_overlap
 EXCLUDE USING gist (plan_id WITH =, tstzrange(valid_from,valid_to,'[)') WITH &&)
 WHERE (published_at IS NOT NULL);

-- D-03: one logical license can have many ordered, auditable revisions.
CREATE TABLE license_signing_keys (
 kid text PRIMARY KEY, algorithm text NOT NULL CHECK (algorithm='EdDSA'),
 public_jwk jsonb NOT NULL, environment text NOT NULL,
 status text NOT NULL CHECK (status IN ('staged','active','retired','compromised')),
 published_at timestamptz, retired_at timestamptz
);
CREATE TABLE license_revisions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 license_id uuid NOT NULL REFERENCES licenses(id),
 source_order_id uuid NOT NULL UNIQUE REFERENCES orders(id),
 issuance_request_id uuid NOT NULL UNIQUE REFERENCES license_issuance_requests(id),
 revision integer NOT NULL CHECK (revision>0),
 policy_snapshot jsonb NOT NULL CHECK (jsonb_typeof(policy_snapshot)='object'),
 issuance_signing_kid text REFERENCES license_signing_keys(kid),
 issuance_artifact_digest bytea CHECK (issuance_artifact_digest IS NULL OR length(issuance_artifact_digest)=32),
 issuance_artifact_ciphertext bytea,
 issued_at timestamptz NOT NULL DEFAULT now(), issued_by uuid NOT NULL REFERENCES users(id),
 entitlement_ready_at timestamptz,
 UNIQUE(license_id,revision),
 CHECK (entitlement_ready_at IS NULL OR
        (issuance_signing_kid IS NOT NULL AND issuance_artifact_digest IS NOT NULL AND issuance_artifact_ciphertext IS NOT NULL))
);
CREATE TABLE entitlement_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 subscription_id uuid NOT NULL REFERENCES subscriptions(id),
 source_order_id uuid NOT NULL REFERENCES orders(id),
 license_id uuid REFERENCES licenses(id), event_type text NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT now(), actor_id uuid REFERENCES users(id),
 request_id text NOT NULL, metadata_redacted jsonb NOT NULL DEFAULT '{}'::jsonb,
 UNIQUE(source_order_id,event_type)
);
ALTER TABLE subscription_periods ADD COLUMN license_revision_id uuid UNIQUE REFERENCES license_revisions(id);
ALTER TABLE subscription_periods ADD CONSTRAINT ex_subscription_paid_period_overlap
 EXCLUDE USING gist (subscription_id WITH =, tstzrange(start_at,paid_end_at,'[)') WITH &&);

-- D-04: activation secrets, device proof, replay, credential rotation and
-- per-activation token issuance. No private signing key is stored here.
CREATE TABLE activation_claims (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), license_id uuid NOT NULL REFERENCES licenses(id),
 created_by uuid NOT NULL REFERENCES users(id), secret_hash bytea NOT NULL UNIQUE,
 expires_at timestamptz NOT NULL, consumed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), CHECK (expires_at>created_at)
);
CREATE INDEX ix_activation_claims_expiry ON activation_claims(expires_at) WHERE consumed_at IS NULL;
CREATE TABLE license_challenges (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 license_id uuid REFERENCES licenses(id), activation_id uuid REFERENCES license_activations(id),
 device_key_thumbprint bytea NOT NULL, purpose text NOT NULL CHECK (purpose IN ('activate','refresh','deactivate')),
 nonce_hash bytea NOT NULL UNIQUE, expires_at timestamptz NOT NULL,
 consumed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (expires_at>created_at),
 CHECK ((purpose='activate' AND license_id IS NOT NULL) OR
        (purpose<>'activate' AND activation_id IS NOT NULL))
);
CREATE INDEX ix_license_challenges_expiry ON license_challenges(expires_at) WHERE consumed_at IS NULL;
CREATE TABLE license_device_keys (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), activation_id uuid NOT NULL REFERENCES license_activations(id),
 public_key_jwk jsonb NOT NULL, thumbprint bytea NOT NULL,
 algorithm text NOT NULL, registered_at timestamptz NOT NULL DEFAULT now(),
 revoked_at timestamptz, UNIQUE(activation_id,thumbprint)
);
ALTER TABLE license_activations ADD COLUMN current_device_key_id uuid REFERENCES license_device_keys(id);
ALTER TABLE license_activations ADD COLUMN current_license_revision_id uuid REFERENCES license_revisions(id);
CREATE TABLE license_refresh_credentials (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), activation_id uuid NOT NULL REFERENCES license_activations(id),
 family_id uuid NOT NULL, secret_hash bytea NOT NULL UNIQUE,
 issued_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
 consumed_at timestamptz, rotated_to_id uuid,
 reuse_detected_at timestamptz, revoked_at timestamptz,
 CHECK (expires_at>issued_at)
);
ALTER TABLE license_refresh_credentials ADD CONSTRAINT fk_refresh_rotated_to
 FOREIGN KEY(rotated_to_id) REFERENCES license_refresh_credentials(id);
CREATE INDEX ix_refresh_family ON license_refresh_credentials(family_id,issued_at DESC);
CREATE TABLE license_token_issuances (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 activation_id uuid NOT NULL REFERENCES license_activations(id),
 license_revision_id uuid NOT NULL REFERENCES license_revisions(id),
 jti uuid NOT NULL UNIQUE, kid text NOT NULL REFERENCES license_signing_keys(kid),
 issued_at timestamptz NOT NULL, expires_at timestamptz NOT NULL,
 CHECK (expires_at>issued_at)
);
CREATE INDEX ix_token_issuances_activation ON license_token_issuances(activation_id,issued_at DESC);

-- D-05: private proof lifecycle and verified installer publication metadata.
ALTER TABLE file_assets ADD COLUMN expected_sha256 bytea;
ALTER TABLE file_assets ADD COLUMN expected_size_bytes bigint;
ALTER TABLE file_assets ADD COLUMN finalized_at timestamptz;
ALTER TABLE file_assets ADD COLUMN quarantine_reason text;
ALTER TABLE file_assets ADD COLUMN retention_until timestamptz;
CREATE TABLE file_scan_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), asset_id uuid NOT NULL REFERENCES file_assets(id),
 scanner_version text NOT NULL, result file_scan_status NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE software_releases ADD COLUMN signer_identity text;
ALTER TABLE software_releases ADD COLUMN signature_verified_at timestamptz;
ALTER TABLE software_releases ADD COLUMN hash_verified_at timestamptz;
ALTER TABLE software_releases ADD COLUMN published_by uuid REFERENCES users(id);

COMMIT;

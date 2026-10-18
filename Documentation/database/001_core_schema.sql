-- Galung.id PostgreSQL 16+ reference DDL, release 1 (Basic/Pro only)
-- Review migration and access model before production. All timestamps are timestamptz UTC instants.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS galung;
SET search_path TO galung, public;

CREATE TYPE lifecycle_status AS ENUM ('draft','active','inactive','archived');
CREATE TYPE order_kind AS ENUM ('new','renewal','upgrade','adjustment');
CREATE TYPE order_status AS ENUM ('awaiting_payment','proof_submitted','under_review','approved','cancelled','expired','fulfilled');
CREATE TYPE payment_status AS ENUM ('submitted','under_review','awaiting_funds','amount_mismatch','needs_revision','rejected','approved');
CREATE TYPE subscription_status AS ENUM ('pending_activation','active','grace','expired','cancelled','suspended','revoked');
CREATE TYPE license_status AS ENUM ('pending','issued','active','expired','suspended','revoked');
CREATE TYPE issuance_status AS ENUM ('pending','processing','issued','failed','cancelled');
CREATE TYPE account_change_status AS ENUM ('pending','approved','rejected','applied');
CREATE TYPE cms_status AS ENUM ('draft','in_review','published','archived');
CREATE TYPE file_scan_status AS ENUM ('pending','clean','malicious','failed');

CREATE TABLE users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL,
 display_name text, password_hash text, email_verified_at timestamptz,
 country_code char(2), preferred_locale text NOT NULL DEFAULT 'id-ID' CHECK (preferred_locale IN ('id-ID','en')),
 status lifecycle_status NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT email_nonempty CHECK (length(trim(email))>3)
);
CREATE UNIQUE INDEX uq_users_email_normalized ON users(lower(email));
CREATE TABLE roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, description text);
CREATE TABLE permissions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, description text);
CREATE TABLE role_permissions (role_id uuid NOT NULL REFERENCES roles(id), permission_id uuid NOT NULL REFERENCES permissions(id), PRIMARY KEY(role_id,permission_id));
CREATE TABLE user_roles (user_id uuid NOT NULL REFERENCES users(id), role_id uuid NOT NULL REFERENCES roles(id), assigned_by uuid REFERENCES users(id), assigned_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,role_id));
CREATE TABLE auth_sessions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), session_token_hash bytea NOT NULL UNIQUE, issued_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, revoked_at timestamptz, CHECK(expires_at>issued_at));
CREATE INDEX ix_auth_sessions_user ON auth_sessions(user_id,expires_at);

CREATE TABLE products (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, title text NOT NULL, status lifecycle_status NOT NULL DEFAULT 'draft', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE plans (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES products(id), code text NOT NULL UNIQUE, title text NOT NULL, status lifecycle_status NOT NULL DEFAULT 'draft', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE plan_policy_versions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), plan_id uuid NOT NULL REFERENCES plans(id), version integer NOT NULL CHECK(version>0),
 max_devices integer NOT NULL CHECK(max_devices>=1), max_concurrent_sessions integer NOT NULL CHECK(max_concurrent_sessions>=1),
 offline_max_hours integer NOT NULL DEFAULT 336 CHECK(offline_max_hours BETWEEN 0 AND 336), grace_hours integer NOT NULL DEFAULT 72 CHECK(grace_hours=72),
 feature_rules jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(feature_rules)='object'),
 valid_from timestamptz NOT NULL, valid_to timestamptz, published_at timestamptz, created_by uuid REFERENCES users(id),
 UNIQUE(plan_id,version), CHECK(valid_to IS NULL OR valid_to>valid_from)
);
CREATE INDEX ix_policy_lookup ON plan_policy_versions(plan_id,valid_from DESC);
CREATE TABLE prices (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), plan_id uuid NOT NULL REFERENCES plans(id), billing_months integer NOT NULL CHECK(billing_months IN (1,12)), currency_code char(3) NOT NULL,
 amount_minor bigint NOT NULL CHECK(amount_minor>=0), version integer NOT NULL CHECK(version>0), starts_at timestamptz NOT NULL, ends_at timestamptz,
 status lifecycle_status NOT NULL DEFAULT 'draft', created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(plan_id,billing_months,currency_code,version), CHECK(ends_at IS NULL OR ends_at>starts_at)
);
CREATE INDEX ix_prices_active ON prices(plan_id,currency_code,billing_months,starts_at DESC);
CREATE TABLE promotions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, discount_type text NOT NULL CHECK(discount_type IN ('percent','fixed')), discount_value numeric(18,4) NOT NULL CHECK(discount_value>0), currency_code char(3), starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, max_redemptions integer, per_user_limit integer, status lifecycle_status NOT NULL DEFAULT 'draft', created_at timestamptz NOT NULL DEFAULT now(), CHECK(ends_at>starts_at), CHECK((discount_type='percent' AND discount_value<=100) OR discount_type='fixed'));
CREATE TABLE promotion_plan_scopes (promotion_id uuid NOT NULL REFERENCES promotions(id), plan_id uuid NOT NULL REFERENCES plans(id), PRIMARY KEY(promotion_id,plan_id));

CREATE TABLE bank_accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bank_name text NOT NULL, beneficiary_name text NOT NULL, account_number_ciphertext bytea NOT NULL,
 account_number_last4 text NOT NULL, swift_bic text, iban_ciphertext bytea, bank_country char(2) NOT NULL, supported_currency char(3) NOT NULL,
 status lifecycle_status NOT NULL DEFAULT 'draft', approved_by uuid REFERENCES users(id), approved_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), CHECK(length(account_number_last4)=4)
);
CREATE TABLE bank_account_change_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), old_account_id uuid REFERENCES bank_accounts(id), proposed_account_id uuid NOT NULL REFERENCES bank_accounts(id),
 requested_by uuid NOT NULL REFERENCES users(id), reviewed_by uuid REFERENCES users(id), status account_change_status NOT NULL DEFAULT 'pending',
 reason text NOT NULL, requested_at timestamptz NOT NULL DEFAULT now(), reviewed_at timestamptz,
 CHECK(reviewed_by IS NULL OR reviewed_by<>requested_by)
);

CREATE TABLE orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_number text UNIQUE NOT NULL, customer_id uuid NOT NULL REFERENCES users(id), kind order_kind NOT NULL,
 status order_status NOT NULL DEFAULT 'awaiting_payment', related_subscription_id uuid,
 billing_name text NOT NULL, billing_email text NOT NULL, billing_country char(2) NOT NULL, billing_address jsonb NOT NULL DEFAULT '{}'::jsonb,
 invoice_currency char(3) NOT NULL, subtotal_minor bigint NOT NULL CHECK(subtotal_minor>=0), discount_minor bigint NOT NULL DEFAULT 0 CHECK(discount_minor>=0),
 tax_minor bigint NOT NULL DEFAULT 0 CHECK(tax_minor>=0), total_minor bigint NOT NULL CHECK(total_minor>=0),
 created_at timestamptz NOT NULL DEFAULT now(), due_at timestamptz NOT NULL, approved_at timestamptz, fulfilled_at timestamptz,
 CHECK(total_minor=subtotal_minor-discount_minor+tax_minor), CHECK(due_at>created_at)
);
CREATE INDEX ix_orders_customer_created ON orders(customer_id,created_at DESC);
CREATE INDEX ix_orders_status ON orders(status,created_at);
CREATE TABLE order_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id), plan_id uuid NOT NULL REFERENCES plans(id),
 price_id uuid NOT NULL REFERENCES prices(id), policy_version_id uuid NOT NULL REFERENCES plan_policy_versions(id),
 billing_months integer NOT NULL CHECK(billing_months IN (1,12)), quantity integer NOT NULL DEFAULT 1 CHECK(quantity=1),
 unit_amount_minor bigint NOT NULL CHECK(unit_amount_minor>=0), line_total_minor bigint NOT NULL CHECK(line_total_minor>=0),
 plan_snapshot jsonb NOT NULL, price_snapshot jsonb NOT NULL, policy_snapshot jsonb NOT NULL
);
CREATE INDEX ix_order_items_order ON order_items(order_id);
CREATE TABLE promotion_redemptions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), promotion_id uuid NOT NULL REFERENCES promotions(id), order_id uuid NOT NULL REFERENCES orders(id), user_id uuid NOT NULL REFERENCES users(id), discount_minor bigint NOT NULL CHECK(discount_minor>=0), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(promotion_id,order_id));
CREATE TABLE invoices (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL UNIQUE REFERENCES orders(id), invoice_number text NOT NULL UNIQUE,
 issue_at timestamptz NOT NULL DEFAULT now(), due_at timestamptz NOT NULL, total_minor bigint NOT NULL CHECK(total_minor>=0), currency_code char(3) NOT NULL,
 bank_account_id uuid NOT NULL REFERENCES bank_accounts(id), bank_instructions_snapshot jsonb NOT NULL, pdf_asset_id uuid, immutable_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE file_assets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), storage_bucket text NOT NULL, storage_key text NOT NULL UNIQUE, original_filename text,
 mime_type text NOT NULL, size_bytes bigint NOT NULL CHECK(size_bytes>0), sha256 bytea NOT NULL,
 scan_status file_scan_status NOT NULL DEFAULT 'pending', owner_id uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE payment_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id), submitted_by uuid NOT NULL REFERENCES users(id),
 proof_asset_id uuid NOT NULL REFERENCES file_assets(id), sender_name text NOT NULL, sender_bank text, transfer_reference text,
 sent_amount_minor bigint NOT NULL CHECK(sent_amount_minor>0), sent_currency char(3) NOT NULL, sent_at timestamptz,
 status payment_status NOT NULL DEFAULT 'submitted', revision_number integer NOT NULL CHECK(revision_number>0), customer_notes text,
 submitted_at timestamptz NOT NULL DEFAULT now(), UNIQUE(order_id,revision_number)
);
CREATE INDEX ix_payment_submissions_review ON payment_submissions(status,submitted_at);
CREATE TABLE bank_credits (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bank_account_id uuid NOT NULL REFERENCES bank_accounts(id), bank_reference text NOT NULL,
 received_minor bigint NOT NULL CHECK(received_minor>0), currency_code char(3) NOT NULL, received_at timestamptz NOT NULL,
 recorded_by uuid NOT NULL REFERENCES users(id), recorded_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(bank_account_id,bank_reference)
);
CREATE TABLE payment_reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), payment_submission_id uuid NOT NULL REFERENCES payment_submissions(id), reviewer_id uuid NOT NULL REFERENCES users(id),
 decision text NOT NULL CHECK(decision IN ('under_review','awaiting_funds','amount_mismatch','needs_revision','rejected','approved')),
 bank_credit_id uuid REFERENCES bank_credits(id), reason text NOT NULL, reviewed_at timestamptz NOT NULL DEFAULT now(),
 CHECK(decision<>'approved' OR bank_credit_id IS NOT NULL)
);
CREATE UNIQUE INDEX uq_bank_credit_approved_once ON payment_reviews(bank_credit_id) WHERE decision='approved';
CREATE INDEX ix_reviews_submission ON payment_reviews(payment_submission_id,reviewed_at DESC);

CREATE TABLE subscriptions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid NOT NULL REFERENCES users(id), plan_id uuid NOT NULL REFERENCES plans(id),
 status subscription_status NOT NULL DEFAULT 'pending_activation', current_paid_end_at timestamptz, current_grace_end_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(current_grace_end_at IS NULL OR (current_paid_end_at IS NOT NULL AND current_grace_end_at=current_paid_end_at+interval '72 hours'))
);
ALTER TABLE orders ADD CONSTRAINT fk_order_related_subscription FOREIGN KEY(related_subscription_id) REFERENCES subscriptions(id);
CREATE INDEX ix_subscriptions_customer ON subscriptions(customer_id,status);
CREATE TABLE subscription_periods (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), subscription_id uuid NOT NULL REFERENCES subscriptions(id), source_order_id uuid NOT NULL UNIQUE REFERENCES orders(id),
 billing_months integer NOT NULL CHECK(billing_months IN (1,12)), payment_approved_at timestamptz NOT NULL,
 entitlement_ready_at timestamptz NOT NULL, start_at timestamptz NOT NULL, paid_end_at timestamptz NOT NULL,
 grace_end_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), CHECK(paid_end_at>start_at), CHECK(grace_end_at=paid_end_at+interval '72 hours'), CHECK(start_at>=payment_approved_at AND start_at>=entitlement_ready_at)
);
CREATE INDEX ix_subscription_periods ON subscription_periods(subscription_id,start_at DESC);
CREATE TABLE license_issuance_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL UNIQUE REFERENCES orders(id), subscription_id uuid NOT NULL REFERENCES subscriptions(id),
 status issuance_status NOT NULL DEFAULT 'pending', processed_by uuid REFERENCES users(id), failure_reason text,
 created_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz
);
CREATE TABLE licenses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), license_public_id text NOT NULL UNIQUE, subscription_id uuid NOT NULL REFERENCES subscriptions(id),
 issuance_request_id uuid NOT NULL UNIQUE REFERENCES license_issuance_requests(id), policy_version_id uuid NOT NULL REFERENCES plan_policy_versions(id),
 status license_status NOT NULL DEFAULT 'issued', activation_secret_hash bytea UNIQUE, max_devices integer NOT NULL CHECK(max_devices>0),
 max_concurrent_sessions integer NOT NULL CHECK(max_concurrent_sessions>0), feature_snapshot jsonb NOT NULL,
 issued_by uuid NOT NULL REFERENCES users(id), issued_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz, revoke_reason text
);
CREATE INDEX ix_licenses_subscription ON licenses(subscription_id,status);
CREATE TABLE devices (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES users(id), device_label text, fingerprint_hash bytea NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(owner_id,fingerprint_hash)
);
CREATE TABLE license_activations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), license_id uuid NOT NULL REFERENCES licenses(id), device_id uuid NOT NULL REFERENCES devices(id),
 activated_at timestamptz NOT NULL DEFAULT now(), last_online_validated_at timestamptz, offline_token_expires_at timestamptz,
 deactivated_at timestamptz, UNIQUE(license_id,device_id)
);
CREATE INDEX ix_activations_active ON license_activations(license_id) WHERE deactivated_at IS NULL;
CREATE TABLE license_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), license_id uuid NOT NULL REFERENCES licenses(id), activation_id uuid REFERENCES license_activations(id),
 actor_id uuid REFERENCES users(id), event_type text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_license_events_license ON license_events(license_id,created_at DESC);

CREATE TABLE cms_pages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL, locale text NOT NULL CHECK(locale IN ('id-ID','en')), title text NOT NULL, status cms_status NOT NULL DEFAULT 'draft', current_revision_id uuid, published_at timestamptz, UNIQUE(slug,locale));
CREATE TABLE cms_revisions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), page_id uuid NOT NULL REFERENCES cms_pages(id), revision integer NOT NULL CHECK(revision>0), body jsonb NOT NULL, seo jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid REFERENCES users(id), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(page_id,revision));
ALTER TABLE cms_pages ADD CONSTRAINT fk_cms_current_revision FOREIGN KEY(current_revision_id) REFERENCES cms_revisions(id);
CREATE TABLE portfolio_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL, locale text NOT NULL CHECK(locale IN ('id-ID','en')), title text NOT NULL, summary text, body jsonb NOT NULL DEFAULT '{}'::jsonb, status cms_status NOT NULL DEFAULT 'draft', published_at timestamptz, UNIQUE(slug,locale));
CREATE TABLE software_releases (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version text NOT NULL, channel text NOT NULL CHECK(channel IN ('stable','beta')), platform text NOT NULL DEFAULT 'windows-x64', file_asset_id uuid NOT NULL REFERENCES file_assets(id), sha256 bytea NOT NULL, release_notes jsonb NOT NULL DEFAULT '{}'::jsonb, published_at timestamptz, UNIQUE(version,channel,platform));
CREATE TABLE notifications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), kind text NOT NULL, subject text NOT NULL, body text NOT NULL, read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX ix_notifications_user ON notifications(user_id,created_at DESC);
CREATE TABLE email_deliveries (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id), template_key text NOT NULL, recipient_email text NOT NULL, status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','sending','sent','failed')), attempts integer NOT NULL DEFAULT 0, last_error text, created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz);
CREATE TABLE outbox_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), aggregate_type text NOT NULL, aggregate_id uuid NOT NULL, event_type text NOT NULL, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz, attempts integer NOT NULL DEFAULT 0, last_error text);
CREATE INDEX ix_outbox_pending ON outbox_events(created_at) WHERE processed_at IS NULL;
CREATE TABLE audit_logs (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_id uuid REFERENCES users(id), action text NOT NULL, entity_type text NOT NULL, entity_id text NOT NULL, request_id text, reason text, before_redacted jsonb, after_redacted jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX ix_audit_entity ON audit_logs(entity_type,entity_id,created_at DESC);
CREATE TABLE idempotency_keys (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), scope text NOT NULL, idempotency_key text NOT NULL, request_hash bytea NOT NULL, response_status integer, response_body jsonb, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, UNIQUE(scope,idempotency_key));
COMMIT;

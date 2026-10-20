-- Minimal in-memory PostgreSQL schema for Phase 02 service tests only.
-- The full 001/003/004/005/006 chain is tested by hosted PostgreSQL 16 CI.
CREATE SCHEMA galung;
SET search_path TO galung, public;
CREATE TABLE users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, display_name text,
 password_hash text, email_verified_at timestamptz, country_code char(2), preferred_locale text NOT NULL DEFAULT 'id-ID',
 status text NOT NULL DEFAULT 'active', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, description text);
CREATE TABLE permissions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, description text);
CREATE TABLE role_permissions (role_id uuid REFERENCES roles(id), permission_id uuid REFERENCES permissions(id), PRIMARY KEY(role_id,permission_id));
CREATE TABLE user_roles (user_id uuid REFERENCES users(id), role_id uuid REFERENCES roles(id), PRIMARY KEY(user_id,role_id));
CREATE TABLE auth_sessions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id), session_token_hash bytea UNIQUE,
 issued_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, revoked_at timestamptz,
 mfa_completed_at timestamptz, auth_level text NOT NULL DEFAULT 'password', last_step_up_at timestamptz);
CREATE TABLE auth_challenges (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id), purpose text NOT NULL,
 challenge_hash bytea UNIQUE NOT NULL, expires_at timestamptz NOT NULL, consumed_at timestamptz, attempts integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE auth_factors (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id), kind text NOT NULL,
 secret_ciphertext bytea, public_credential jsonb, status text NOT NULL, created_at timestamptz DEFAULT now(), verified_at timestamptz);
CREATE TABLE auth_recovery_codes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id), code_hash bytea UNIQUE NOT NULL, used_at timestamptz);
CREATE TABLE legal_acceptances (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id),
 terms_version text NOT NULL, terms_content_hash bytea NOT NULL, privacy_notice_version text NOT NULL,
 privacy_notice_hash bytea NOT NULL, locale text NOT NULL, country_code char(2) NOT NULL,
 accepted_at timestamptz DEFAULT now(), request_id text NOT NULL);
CREATE TABLE audit_logs (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_id uuid REFERENCES users(id),
 action text NOT NULL, entity_type text NOT NULL, entity_id text NOT NULL, request_id text, created_at timestamptz DEFAULT now());

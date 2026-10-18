-- Phase 00 owner decision A: fixed elapsed terms, 30 x 24h or 365 x 24h.
-- Draft migration; apply after 003 only in local/test or opted-in isolated staging.
-- Existing 1/12 values are cycle identifiers, mapped to 30/365 elapsed days.
BEGIN;
SET search_path TO galung, public;

ALTER TABLE prices DROP CONSTRAINT prices_billing_months_check;
ALTER TABLE order_items DROP CONSTRAINT order_items_billing_months_check;
ALTER TABLE subscription_periods DROP CONSTRAINT subscription_periods_billing_months_check;

ALTER TABLE prices RENAME COLUMN billing_months TO term_days;
ALTER TABLE order_items RENAME COLUMN billing_months TO term_days;
ALTER TABLE subscription_periods RENAME COLUMN billing_months TO term_days;

UPDATE prices SET term_days = CASE term_days WHEN 1 THEN 30 WHEN 12 THEN 365 END;
UPDATE order_items SET term_days = CASE term_days WHEN 1 THEN 30 WHEN 12 THEN 365 END;
UPDATE subscription_periods SET term_days = CASE term_days WHEN 1 THEN 30 WHEN 12 THEN 365 END;

ALTER TABLE prices ADD CONSTRAINT prices_term_days_check CHECK (term_days IN (30,365));
ALTER TABLE order_items ADD CONSTRAINT order_items_term_days_check CHECK (term_days IN (30,365));
ALTER TABLE subscription_periods ADD CONSTRAINT subscription_periods_term_days_check CHECK (term_days IN (30,365));
-- Multiplication by hours ensures elapsed UTC time through DST and leap dates.
-- Existing periods inconsistent with the approved fixed term deliberately fail review.
ALTER TABLE subscription_periods ADD CONSTRAINT subscription_periods_fixed_duration_check
 CHECK (paid_end_at = start_at + (term_days * 24) * interval '1 hour');

ALTER INDEX prices_plan_id_billing_months_currency_code_version_key
 RENAME TO prices_plan_id_term_days_currency_code_version_key;
ALTER INDEX ix_prices_active RENAME TO ix_prices_active_term_days;
ALTER TABLE prices RENAME CONSTRAINT ex_prices_published_overlap TO ex_prices_term_published_overlap;
COMMIT;

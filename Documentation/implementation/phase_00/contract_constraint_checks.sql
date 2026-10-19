-- Synthetic constraint checks for Phase 00 draft, run only in an isolated DB
-- after migrations 001, 003 and 004.
BEGIN;
SET search_path TO galung, public;
DO $$
DECLARE
 u1 uuid; u2 uuid; prod uuid; plan uuid; acct uuid; change_id uuid;
 sub uuid; ord1 uuid; ord2 uuid; t timestamptz := now();
 jan_start timestamptz := timestamptz '2028-01-31 23:00:00+00';
BEGIN
 SET LOCAL TIME ZONE 'America/New_York';
 IF jan_start + 720 * interval '1 hour' <> timestamptz '2028-03-01 23:00:00+00' THEN
  RAISE EXCEPTION 'monthly fixed UTC term changed across February/DST';
 END IF;
 IF timestamptz '2024-02-29 12:00:00+00' + 8760 * interval '1 hour' <> timestamptz '2025-02-28 12:00:00+00' THEN
  RAISE EXCEPTION 'annual fixed UTC term changed across leap day';
 END IF;
 INSERT INTO users(email) VALUES ('phase00-a@example.invalid') RETURNING id INTO u1;
 INSERT INTO users(email) VALUES ('phase00-b@example.invalid') RETURNING id INTO u2;
 INSERT INTO products(code,title) VALUES ('PHASE00_SYNTHETIC','Synthetic') RETURNING id INTO prod;
 INSERT INTO plans(product_id,code,title) VALUES (prod,'PHASE00_TEST','Synthetic') RETURNING id INTO plan;

 INSERT INTO prices(plan_id,term_days,currency_code,amount_minor,version,starts_at,status)
 VALUES (plan,30,'IDR',100,1,t,'active');
 BEGIN
  INSERT INTO prices(plan_id,term_days,currency_code,amount_minor,version,starts_at,status)
  VALUES (plan,30,'IDR',200,2,t+interval '1 day','active');
  RAISE EXCEPTION 'overlapping active prices were accepted';
 EXCEPTION WHEN exclusion_violation THEN NULL;
 END;

 BEGIN
  INSERT INTO prices(plan_id,term_days,currency_code,amount_minor,version,starts_at,status)
  VALUES (plan,31,'IDR',100,3,t,'draft');
  RAISE EXCEPTION 'unsupported term length was accepted';
 EXCEPTION WHEN check_violation THEN NULL;
 END;

 INSERT INTO plan_policy_versions(plan_id,version,max_devices,max_concurrent_sessions,valid_from,published_at)
 VALUES (plan,30,1,1,t,t);
 BEGIN
  INSERT INTO plan_policy_versions(plan_id,version,max_devices,max_concurrent_sessions,valid_from,published_at)
  VALUES (plan,2,2,1,t+interval '1 day',t);
  RAISE EXCEPTION 'overlapping published policies were accepted';
 EXCEPTION WHEN exclusion_violation THEN NULL;
 END;

 INSERT INTO bank_accounts(bank_name,beneficiary_name,account_number_ciphertext,account_number_last4,bank_country,supported_currency)
 VALUES ('Synthetic Bank','Synthetic Beneficiary',decode('abcd','hex'),'0000','ID','IDR') RETURNING id INTO acct;
 INSERT INTO bank_account_change_requests(proposed_account_id,requested_by,reviewed_by,reason)
 VALUES (acct,u1,u2,'Synthetic bank control test') RETURNING id INTO change_id;
 BEGIN
  UPDATE bank_account_change_requests SET status='applied' WHERE id=change_id;
  RAISE EXCEPTION 'bank change without both MFA records was accepted';
 EXCEPTION WHEN check_violation THEN NULL;
 END;
 UPDATE bank_account_change_requests
 SET status='applied', requester_mfa_at=t, reviewer_mfa_at=t,
     proposal_digest=decode(repeat('ab',32),'hex'), published_at=t
 WHERE id=change_id;
 BEGIN
  INSERT INTO bank_account_change_requests(proposed_account_id,requested_by,reviewed_by,reason)
  VALUES (acct,u1,u1,'Synthetic self approval test');
  RAISE EXCEPTION 'self-reviewed bank change was accepted';
 EXCEPTION WHEN check_violation THEN NULL;
 END;

 INSERT INTO subscriptions(customer_id,plan_id) VALUES (u1,plan) RETURNING id INTO sub;
 INSERT INTO orders(order_number,customer_id,kind,billing_name,billing_email,billing_country,
                    invoice_currency,subtotal_minor,total_minor,due_at)
 VALUES ('PHASE00-1',u1,'new','Synthetic','phase00-a@example.invalid','ID','IDR',100,100,t+interval '7 days')
 RETURNING id INTO ord1;
 INSERT INTO orders(order_number,customer_id,kind,billing_name,billing_email,billing_country,
                    invoice_currency,subtotal_minor,total_minor,due_at)
 VALUES ('PHASE00-2',u1,'renewal','Synthetic','phase00-a@example.invalid','ID','IDR',100,100,t+interval '7 days')
 RETURNING id INTO ord2;
 INSERT INTO subscription_periods(subscription_id,source_order_id,term_days,payment_approved_at,
                                  entitlement_ready_at,start_at,paid_end_at,grace_end_at)
 VALUES (sub,ord1,30,t,t,t,t+interval '720 hours',t+interval '792 hours');
 BEGIN
  INSERT INTO subscription_periods(subscription_id,source_order_id,term_days,payment_approved_at,
                                    entitlement_ready_at,start_at,paid_end_at,grace_end_at)
  VALUES (sub,ord2,30,t,t,t+interval '720 hours',t+interval '1441 hours',t+interval '1513 hours');
  RAISE EXCEPTION 'non-fixed paid duration was accepted';
 EXCEPTION WHEN check_violation THEN NULL;
 END;
 BEGIN
  INSERT INTO subscription_periods(subscription_id,source_order_id,term_days,payment_approved_at,
                                    entitlement_ready_at,start_at,paid_end_at,grace_end_at)
  VALUES (sub,ord2,30,t,t,t+interval '480 hours',t+interval '1200 hours',t+interval '1272 hours');
  RAISE EXCEPTION 'overlapping paid periods were accepted';
 EXCEPTION WHEN exclusion_violation THEN NULL;
 END;
END $$;
ROLLBACK;

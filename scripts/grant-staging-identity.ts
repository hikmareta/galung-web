import { Client } from 'pg';

if (process.env.APP_ENV !== 'staging' || !process.env.MIGRATION_DATABASE_URL) throw new Error('Staging migrator only');
const client = new Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
async function main() {
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query('GRANT USAGE ON SCHEMA galung TO galung_app');
    await client.query('GRANT SELECT,INSERT,UPDATE ON galung.users,galung.auth_sessions,galung.auth_challenges,galung.auth_factors,galung.auth_recovery_codes,galung.identity_delivery_outbox TO galung_app');
    await client.query('GRANT SELECT,INSERT ON galung.legal_acceptances,galung.account_privacy_requests TO galung_app');
    await client.query('GRANT INSERT ON galung.audit_logs TO galung_app');
    await client.query('GRANT SELECT ON galung.roles,galung.permissions,galung.role_permissions,galung.user_roles TO galung_app');
    await client.query('GRANT EXECUTE ON FUNCTION galung.assign_customer_role(uuid) TO galung_app');
    const privilege = await client.query<{ identity_write: boolean; commerce_write: boolean }>(`SELECT
      has_table_privilege('galung_app','galung.auth_sessions','INSERT') AS identity_write,
      has_table_privilege('galung_app','galung.orders','INSERT') AS commerce_write`);
    if (!privilege.rows[0].identity_write || privilege.rows[0].commerce_write) throw new Error('Identity grant boundary failed');
    await client.query('COMMIT');
    process.stdout.write('Staging identity grants applied\n');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { await client.end(); }
}
main().catch(() => { console.error('Staging identity grants failed'); process.exitCode = 1; });

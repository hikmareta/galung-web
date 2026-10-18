import { Client } from 'pg';
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function main() {
await client.connect();
try {
  const result = await client.query<{ id: string }>('SELECT id FROM galung.schema_migrations ORDER BY id');
  const ids = result.rows.map(row => row.id);
  if (ids.join(',') !== '001_core_schema,003_phase00_contract_delta,004_fixed_subscription_terms') throw new Error(`Unexpected migrations: ${ids.join(',')}`);
  const table = await client.query("SELECT to_regclass('galung.users') AS users, to_regclass('galung.license_revisions') AS revisions");
  if (!table.rows[0].users || !table.rows[0].revisions) throw new Error('Required contract tables missing');
  console.log('Database migration check passed');
} finally { await client.end(); }

}
main().catch(error => { console.error(error); process.exitCode = 1; });

import { Client } from 'pg';
if (process.env.APP_ENV !== 'staging') throw new Error('Staging only');
const client = new Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
async function main() {
  await client.connect();
  try {
    await client.query("CREATE ROLE galung_app LOGIN PASSWORD 'ephemeral_app_only'");
    await client.query('GRANT CONNECT ON DATABASE galung_staging TO galung_app');
  } finally { await client.end(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

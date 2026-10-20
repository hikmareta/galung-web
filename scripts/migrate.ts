import { Client } from 'pg';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrations = [
  ['001_core_schema', 'Documentation/database/001_core_schema.sql'],
  ['003_phase00_contract_delta', 'Documentation/database/003_phase00_contract_delta.sql'],
  ['004_fixed_subscription_terms', 'Documentation/database/004_fixed_subscription_terms.sql'],
  ['005_identity_contract_candidate', 'Documentation/database/005_identity_contract_candidate.sql'],
  ['006_identity_runtime', 'Documentation/database/006_identity_runtime.sql'],
] as const;
const environment = process.env.APP_ENV;
if (!['local', 'test', 'staging'].includes(environment ?? '')) throw new Error('Draft migrations cannot run in production');
if (environment === 'staging' && process.env.ALLOW_DRAFT_MIGRATIONS !== 'true') throw new Error('Staging draft migration requires explicit opt-in');
const migrationUrl = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
if (environment === 'staging' && !process.env.MIGRATION_DATABASE_URL) throw new Error('Staging requires a dedicated migration connection');
const client = new Client({ connectionString: migrationUrl });
async function main() {
await client.connect();
try {
  await client.query('SELECT pg_advisory_lock(441001)');
  await client.query('CREATE SCHEMA IF NOT EXISTS galung');
  await client.query('CREATE TABLE IF NOT EXISTS galung.schema_migrations (id text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
  for (const [id, path] of migrations) {
    const sql = readFileSync(resolve(path), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const existing = await client.query<{ checksum: string }>('SELECT checksum FROM galung.schema_migrations WHERE id=$1', [id]);
    if (existing.rowCount) {
      if (existing.rows[0].checksum !== checksum) throw new Error(`Migration drift: ${id}`);
      continue;
    }
    const body = sql.replace(/^BEGIN;\s*/i, '').replace(/\s*COMMIT;\s*$/i, '');
    await client.query('BEGIN');
    try {
      await client.query(body);
      await client.query('INSERT INTO galung.schema_migrations(id,checksum) VALUES($1,$2)', [id, checksum]);
      await client.query('COMMIT');
      console.log(`Applied ${id}`);
    } catch (error) { await client.query('ROLLBACK'); throw error; }
  }
} finally { await client.query('SELECT pg_advisory_unlock(441001)').catch(() => undefined); await client.end(); }

}
main().catch(error => { console.error(error); process.exitCode = 1; });

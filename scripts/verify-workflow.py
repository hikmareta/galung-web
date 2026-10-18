from pathlib import Path
ci = Path('.github/workflows/ci.yaml').read_text()
for item in ('pnpm install --frozen-lockfile', 'pnpm lint', 'pnpm typecheck', 'pnpm test', 'pnpm build', 'pnpm db:migrate', 'pnpm audit'):
    assert item in ci, item
staging = Path('.github/workflows/staging.yaml').read_text()
assert 'scripts/smoke-staging.mjs' in staging and 'APP_ENV: staging' in staging and 'MIGRATION_DATABASE_URL' in staging
print('Workflow structure checks passed')

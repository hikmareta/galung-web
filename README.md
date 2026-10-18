# Galung.id engineering foundation

Phase 01 only. The public, admin and API apps are foundation shells. No ordering, payment or licensing operation is enabled.

## Local boot

Requires Node 22, pnpm 10, Docker and access to npm registry. From a fresh clone:

```sh
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
set -a; . ./.env; set +a
docker compose -f infrastructure/docker/compose.yaml up -d --wait
pnpm check:env
pnpm db:migrate
pnpm db:check
pnpm dev
```

Web: `http://localhost:3000`; admin: `http://localhost:3001`; API liveness: `http://localhost:4000/api/v1/health/live`; readiness: `/api/v1/health/ready`.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Never use `.env.example` values outside local development. Migrations apply `001_core_schema.sql` then `003_phase00_contract_delta.sql`; `002_future_extensions.sql` is deliberately excluded. The SQL remains a Phase 00 draft and must not be promoted to production without contract approval and target DB verification.

## Staging

The staging workflow creates an isolated **ephemeral** GitHub Actions environment with PostgreSQL and Redis, applies the draft migrations with explicit opt-in, starts the built API and web/admin shells, and probes health. It is destroyed when the workflow finishes and provides no permanent public URL. Configure `staging` environment reviewers and branch protection in GitHub settings. A persistent staging host remains a separate future decision.

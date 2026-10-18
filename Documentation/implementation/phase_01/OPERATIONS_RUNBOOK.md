# Phase 01 operations runbook

## Scope

This runbook applies to foundation shells and operational health only. The SQL is a Phase 00 draft. Production migrations, commerce, payment and licensing are disabled or absent.

## Local boot and verification

Use Node 22 and pnpm 10. Run `CI=true pnpm install --frozen-lockfile`, copy `.env.example` to `.env`, start local PostgreSQL/Redis with `docker compose -f infrastructure/docker/compose.yaml up -d --wait`, then `pnpm check:env`, `pnpm db:migrate`, `pnpm db:check`, `pnpm dev`. Use `pnpm exec turbo run lint typecheck test build --force` for a no-cache check. The Turbo graph makes a package's build wait for its typecheck to avoid Next `.next/types` races.

The API exposes `/api/v1/health/live` and `/api/v1/health/ready`. Liveness only confirms the process. Readiness confirms PostgreSQL and Redis and returns `503` with `DEPENDENCY_UNAVAILABLE` when either fails. Web and admin expose `/health` for process smoke checks. None of these proves business readiness or authorizes a commercial release.

## Ephemeral staging

`.github/workflows/staging.yaml` runs on pull requests and manual dispatch. It creates PostgreSQL 16 and Redis in the GitHub runner, creates a restricted application database identity, applies the draft SQL files present in the checked-out commit with explicit `ALLOW_DRAFT_MIGRATIONS=true`, builds all apps, and probes four health endpoints. The environment is destroyed after the run. Inspect the `staging-smoke` check on the pull request. The `main` rule is configured to require `verify`, `secrets`, and `staging-smoke` plus one approval, and is enforced while this repository is public under GitHub Free. A ready PR with all checks green and no approval was blocked in a live test. Collaborator `@dhikandhika` subsequently approved PR #1 at `fd7a62c` and merged it into `main` as `46f3410`. The phase acceptance gate remains open despite the repository merge. A permanent staging service needs a separate hosting, credential, TLS and isolation decision.

## Failed checks and migration recovery

- For a failed readiness probe, inspect PostgreSQL and Redis connectivity, then retry. Do not infer that payment or licensing is healthy from a green probe.
- For migration drift, stop deployment, compare recorded checksum with the versioned SQL and inspect migration history. Never edit `galung.schema_migrations` or historical SQL as a routine recovery step.
- The runner uses a PostgreSQL advisory lock, and each migration plus its checksum record is enclosed in a transaction. A failed migration is rolled back while earlier successful migrations remain. Fix the draft in a new reviewed migration or restore a disposable test database. Production needs an approved forward-fix/rollback plan and canonical contract freeze.
- Do not copy staging database URLs, temporary passwords or unpublished plan/bank values into logs or repository files.

## Rollback

Foundation application deployment can revert to the previous known-good commit and rerun health smoke checks. CI branch rules remain in effect. The ephemeral staging database is disposable and should be recreated from scratch. Production schema rollback is not authorized for these draft migrations. No Phase 01 business data or production database has been changed.

## Evidence and ownership

The Phase 01 acceptance report links hosted CI/staging runs and records local tests. The Product Owner identifies collaborator `@dhikandhika` as a different person assigned to Tech Lead, Security and QA review. [GitHub review `5563655819`](https://github.com/hikmareta/galung-web/pull/1#pullrequestreview-5563655819) approved PR head `fd7a62c` on 2026-10-18; its body says “Proceed.” The PR was merged at 22:24 WIB. A [second review `5563679364`](https://github.com/hikmareta/galung-web/pull/1#pullrequestreview-5563679364) was submitted after merge and explicitly states the three assigned roles and approval of the PR code. It contains no detailed findings and covers the same PR head. Local commits after `fd7a62c` were not part of this merge; publish them only through a separate reviewed PR with fresh required CI.

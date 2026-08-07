# Contributing

## Branch flow

```
feature → dev → staging → main
```

- `dev` — integration; deploys to `ac-portal-dev` (dev.appcarrier.cloud).
- `staging` — pre-prod; deploys to `ac-portal-staging` and runs the ZAP DAST gate.
- `main` — production; deploys to `ac-portal-prod` (appcarrier.cloud).

Open PRs into `dev`. Promote by merging `dev → staging`, then `staging → main`
once the DAST gate is green.

## Local development

```bash
npm install --legacy-peer-deps
npm run dev     # http://localhost:3000
npm run build   # standalone production build
npm run lint
```

## Conventions

- TypeScript + Tailwind v4. Design tokens in `src/lib/tokens.ts`; verbatim design
  content in `src/data/*`.
- Keep pages faithful to `design_handoff_fptis_ns_web`. Do **not** fill `[…]`
  placeholders (dates, result figures, copyright year) — those are content-team
  owned by convention.
- Commit messages: imperative summary; group by concern.
- Never commit secrets — the pipeline's Gitleaks step scans every push.

## CI/CD

Every push triggers the Tekton DevSecOps pipeline. See
[`docs/DEVSECOPS.md`](docs/DEVSECOPS.md) and
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

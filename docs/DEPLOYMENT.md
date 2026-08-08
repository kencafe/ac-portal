# Deployment

## Topology

| Branch | Namespace | Host | Replicas |
|---|---|---|---|
| `dev` | `ac-portal-dev` | https://dev.appcarrier.cloud | 1 |
| `staging` | `ac-portal-staging` | https://staging.appcarrier.cloud | 1 |
| `main` | `ac-portal-prod` | https://appcarrier.cloud | 2 |

- Runtime: Next.js **standalone** (Node) on `registry.access.redhat.com/ubi9/nodejs-20`, port 3000, non-root (OpenShift arbitrary UID).
- Build: OpenShift **BuildConfig** (Docker strategy, binary source) → ImageStream `ac-portal:latest` per namespace.
- CI hub (Tekton pipeline + EventListener) lives in `ac-portal-dev` and deploys into all three namespaces.
- TLS: edge termination on the shared `*.appcarrier.cloud` wildcard; apex `appcarrier.cloud` uses its own cert on the prod Route.

## First-time setup

See [`k8s/tekton/BOOTSTRAP.md`](../k8s/tekton/BOOTSTRAP.md): namespaces, RBAC + `pipelines-scc`, mirror scanner images, apply pipeline/triggers, webhook secret + GitHub webhook.

## Normal flow (GitOps)

```
push dev      → pipeline → deploy ac-portal-dev
push staging  → pipeline → deploy ac-portal-staging + ZAP DAST gate
push main     → pipeline → deploy ac-portal-prod (apex)
```

## Manual deploy / promote

```bash
# Trigger a run for an environment (example: prod)
oc -n ac-portal-dev create -f - <<'EOF'
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata: { generateName: ns-web-prod-, namespace: ac-portal-dev }
spec:
  pipelineRef: { name: ns-web-cicd }
  taskRunTemplate: { serviceAccountName: ns-web-pipeline }
  params:
    - { name: git-url, value: "https://github.com/kencafe/ac-portal.git" }
    - { name: git-revision, value: main }
    - { name: env, value: prod }
    - { name: target-namespace, value: ac-portal-prod }
    - { name: deploy-host, value: appcarrier.cloud }
    - { name: run-dast, value: "false" }
  workspaces:
    - name: shared
      volumeClaimTemplate:
        spec: { accessModes: ["ReadWriteOnce"], resources: { requests: { storage: 1Gi } }, storageClassName: ac-bronze-single }
EOF
```

## CI trigger & DNS

- Public DNS exists only for `appcarrier.cloud` and `ns.appcarrier.cloud`
  (→ router `103.9.0.232`). `dev`/`staging` subdomains and the `apps.prod01…`
  router hostname are **not internet-resolvable**, so:
  - **Prod is publicly reachable** at `https://appcarrier.cloud` immediately.
  - For dev/staging, add a hosts entry locally, or create DNS records:
    ```
    103.9.0.232  dev.appcarrier.cloud  staging.appcarrier.cloud
    ```
  - The **GitHub push webhook** (EventListener route on `apps.prod01…`) can't be
    reached from GitHub until the EL is exposed on a publicly-resolvable host
    (add e.g. `ci.appcarrier.cloud → 103.9.0.232` and point the route/webhook there).
    Until then, trigger runs manually (below) — the pipeline itself is unchanged.

## Rollback

```bash
oc -n ac-portal-prod rollout undo deploy/ac-portal
# or pin a known-good image digest:
oc -n ac-portal-prod set image deploy/ac-portal ac-portal=<image@sha256:...>
```

## Database (target architecture)

```bash
oc -n ac-portal-<env> apply -f k8s/postgres/cluster.yaml   # CloudNativePG
```
CNPG creates `ns-blog-db-app` (credentials); mirror into Vault and surface to the app as `ns-web-secrets` (`DATABASE_URL`).

## Notes / gotchas

- The workspace PVC needs `pipelines-scc` (fsGroup) or `git-clone` hits `Permission denied` on Ceph RBD.
- Nodes can't pull Docker Hub/ghcr directly — scanner images are mirrored into the internal registry.
- Reusing an existing Deployment/Route name with a different `selector`/`host` fails (immutable) — delete the old object first.

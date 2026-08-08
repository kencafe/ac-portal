# DevSecOps tooling — ac-portal-dev (self-hosted, in-namespace)

Three tooling instances live **inside** `ac-portal-dev` (not the shared cluster ones):
ArgoCD, HashiCorp Vault, DefectDojo. Manifests are in `argocd/`, `vault/`, `defectdojo/`.

Secrets are **not** committed — create them live before/after applying manifests.

## DNS (human action required)
Public DNS is split-horizon with no wildcard. Add A records → `103.9.0.232` for:
- `argocd-dev.appcarrier.cloud`
- `vault-dev.appcarrier.cloud`
- `defectdojo-dev.appcarrier.cloud`

Until then, verify with e.g. `curl --resolve <host>:443:103.9.0.232 https://<host>/`.
All three routes use edge TLS with the golden `ns-web-tls` cert (`*.appcarrier.cloud`).

## ArgoCD
```
oc apply -f argocd/argocd-instance.yaml     # namespaced ArgoCD via Red Hat GitOps operator
oc apply -f argocd/route.yaml               # then live-patch golden cert onto the route
oc apply -f argocd/rbac.yaml                # app-controller admin, scoped to ac-portal-dev
oc apply -f argocd/application.yaml         # AppProject + Application (MANUAL sync)
```
- Admin password: `oc -n ac-portal-dev get secret argocd-cluster -o jsonpath='{.data.admin\.password}' | base64 -d`
- The Application syncs `k8s/overlays/dev`. Sync policy is intentionally **manual** (`syncPolicy: {}`)
  so it will not prune/self-heal the live objects (Deployment edited by the Keycloak work,
  routes live-patched with certs) on first reconcile. Turn on auto-sync only after Git == live.

## Vault (dev mode)
```
oc create secret generic vault-root --from-literal=root-token=<RANDOM>   # deterministic dev root token
oc apply -f vault/vault.yaml            # single pod, dev mode (inmem, no PVC); live-patch golden cert
oc apply -f vault/vault-sync.yaml       # CronJob: Vault -> Secret ns-web-secrets
```
- KV v2 at `secret/ac-portal/{ai,oidc,db,cron}`. Populate with `vault kv put` (see the session log).
- **Dev-mode Vault is in-memory: contents are lost on pod restart.** Re-run the `vault kv put`
  commands after any restart (the root token id is fixed, so auth still works).
- The `vault-sync` CronJob writes `AI_API_KEY` into `ns-web-secrets` every 15m. The app
  Deployment already has an optional `secretRef: ns-web-secrets`, so **no Deployment edit is made**.

### One-time Deployment change NOT applied (documented per the concurrency rule)
The app picks up a newly-created/updated `ns-web-secrets` only on pod restart. When ready:
```
oc -n ac-portal-dev rollout restart deploy/ac-portal
```
(Left to the human because the Keycloak agent is concurrently editing this Deployment.)
Replace the placeholder AI key with the real one:
```
POD=$(oc -n ac-portal-dev get pod -l app=vault -o jsonpath='{.items[0].metadata.name}')
oc -n ac-portal-dev exec $POD -- sh -c 'VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=<root> vault kv put secret/ac-portal/ai AI_API_KEY=<REAL_KEY>'
```

## DefectDojo
```
oc create secret generic defectdojo-secret --from-literal=DD_SECRET_KEY=<R> \
  --from-literal=DD_CREDENTIAL_AES_256_KEY=<R> --from-literal=DD_DATABASE_PASSWORD=<R> \
  --from-literal=DD_ADMIN_PASSWORD=<R> --from-literal=DD_DATABASE_URL=postgresql://defectdojo:<pass>@defectdojo-postgres:5432/defectdojo
oc apply -f defectdojo/00-data.yaml     # postgres (reuses postgres:16 IS) + redis
oc apply -f defectdojo/10-app.yaml      # initializer Job + uwsgi + celeryworker + nginx + route
```
- Postgres reuses the existing `postgres:16` imagestream (SCLorg). Redis/django/nginx images
  mirrored from docker.io via `oc import-image`.
- Product `ac-portal`, engagement `ci-dev`, and an admin API token were created via the API.
- Tekton wiring: `k8s/tekton/tasks.yaml` now reads `ns-web-defectdojo` (DD_URL/DD_HOST/DD_TOKEN)
  which targets THIS instance (`http://defectdojo.ac-portal-dev.svc:8080`) instead of the
  shared `defectdojo-creds` in `ac-devsecops`. Create it with:
```
oc create secret generic ns-web-defectdojo \
  --from-literal=DD_URL=http://defectdojo.ac-portal-dev.svc:8080 \
  --from-literal=DD_HOST=defectdojo-dev.appcarrier.cloud \
  --from-literal=DD_TOKEN=<admin-api-token>
```

## Quota note
`ac-portal-quota` was raised: `pods` 20→40, `persistentvolumeclaims` 10→20 to fit the new
workloads. CPU/memory limits were untouched (headroom was sufficient).

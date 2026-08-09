# Kargo PoC (isolated sandbox)

An **evaluation-only** install of [Kargo](https://kargo.io) (Akuity) to explore the
UI and features. It is **not** wired into any real promotion flow, Argo CD, Tekton,
or the dev/staging/prod workloads, and is designed to be removed cleanly.

- Chart: `oci://ghcr.io/akuity/kargo-charts/kargo` **v1.11.0** (appVersion v1.11.0)
- Namespace: **`kargo`** (dedicated)
- UI: **https://kargo.appcarrier.cloud** (edge TLS, golden wildcard cert)
- Components (Deployments): `kargo-api`, `kargo-controller`, `kargo-management-controller`,
  `kargo-webhooks-server`, `kargo-external-webhooks-server`
- Depends on cert-manager (already present cluster-wide) for its webhook certs.

## Egress / image

Cluster nodes cannot pull `ghcr.io` directly, but the internal registry can import it:

```bash
oc -n kargo import-image kargo:v1.11.0 --from=ghcr.io/akuity/kargo:v1.11.0 --confirm
```

`values.yaml` then points `image.repository` at
`image-registry.openshift-image-registry.svc:5000/kargo/kargo`. (First pod start is
slow while the registry proxies the layers from ghcr.)

## Install

```bash
helm upgrade --install kargo oci://ghcr.io/akuity/kargo-charts/kargo --version 1.11.0 \
  -n kargo --create-namespace -f k8s/kargo/values.yaml
oc apply -f k8s/kargo/route.yaml   # then patch route TLS from the wildcard cert
```

## Login

- User: **admin**
- Password: stored in Secret **`kargo/kargo-admin-poc-credentials`**, key `password`
  (retrieve with `oc -n kargo get secret kargo-admin-poc-credentials -o jsonpath='{.data.password}' | base64 -d`).
- The bcrypt hash + token signing key live in Secret **`kargo/kargo-api-admin`** (referenced
  via `api.secret.name`), so no credential is stored in git or Helm values.

## Isolation guarantees (verified)

- Runs only in namespace `kargo`; no Kargo controller runs in ac-portal-cicd/dev/staging/prod.
- No `Project`/`Warehouse`/`Stage`/`Promotion` objects were created — the user explores from
  a clean slate. Nothing points at the real git overlays or apps.
- The cluster-scoped admission webhooks only match the `kargo.akuity.io` API group, plus
  secrets/configmaps **only** in namespaces labelled `kargo.akuity.io/project` (none exist;
  the real workload namespaces are never intercepted).
- Pods run under the default `restricted-v2` SCC — no extra SCC grant was needed.

## Uninstall (clean removal)

```bash
# 1) Helm release (removes Deployments, Services, cluster Roles/Bindings, webhook configs)
helm uninstall kargo -n kargo

# 2) Namespace (removes route, secrets, imagestream, cert-manager Certificates, etc.)
oc delete ns kargo

# 3) CRDs are NOT removed by Helm — delete them explicitly (this drops any Kargo CRs):
oc get crd -o name | grep 'kargo.akuity.io' | xargs -r oc delete

# 4) Sanity: no leftover cluster RBAC / webhooks
oc get clusterrole,clusterrolebinding | grep -i kargo
oc get validatingwebhookconfiguration,mutatingwebhookconfiguration | grep -i kargo
```

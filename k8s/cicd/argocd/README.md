# ArgoCD control-plane in the CI hub (`ac-portal-cicd`)

Namespaced ArgoCD instance provisioned by the Red Hat OpenShift GitOps operator,
relocated here from `ac-portal-dev` for Model C consistency. Drift viewer only —
all Applications are **manual sync, no auto-prune/selfHeal**, so ArgoCD never
mutates a running site on its own.

| File | Contents |
|------|----------|
| `argocd-instance.yaml` | the `ArgoCD` CR (server insecure behind edge TLS, repo `ARGOCD_EXEC_TIMEOUT=300s` for slow git egress, `resourceExclusions`) |
| `rbac.yaml` | RoleBindings granting the app-controller SA `admin` in dev/staging/prod (namespace-scoped) |
| `application.yaml` | AppProject `ac-portal` + 3 Applications (`ac-portal-{dev,staging,prod}`) in this namespace |
| `route.yaml` | UI route `argocd.appcarrier.cloud` (edge TLS from `ns-web-tls`) |

## Multi-namespace management (operator-native, not a file)

A namespaced ArgoCD instance only watches its own namespace by default. To let it
manage the three env namespaces, they are **labelled** so the operator wires the
cluster-secret namespace scope + controller RBAC:

```bash
oc label namespace ac-portal-dev     argocd.argoproj.io/managed-by=ac-portal-cicd --overwrite
oc label namespace ac-portal-staging argocd.argoproj.io/managed-by=ac-portal-cicd --overwrite
oc label namespace ac-portal-prod    argocd.argoproj.io/managed-by=ac-portal-cicd --overwrite
```

## One-time secret (not in git)

```bash
oc -n ac-portal-cicd create secret tls ns-web-tls \
  --cert=/path/appcarrier.cloud-cert/fullchain.pem \
  --key=/path/appcarrier.cloud-cert/privkey.pem
# then patch the route TLS from it (inline cert never committed)
```

## Known caveat — sync status shows `Unknown`

App **health** is computed correctly (all three Healthy), but **sync** shows
`Unknown`. The application-controller builds a cluster cache by listing every API
resource; on this shared cluster it is `forbidden` on operator CRDs it has no
rights to (e.g. `tekton.dev/PipelineResource`, `configuration.konghq.com/*`,
`camel.apache.org/IntegrationPlatform`, …), which aborts the diff. `resourceExclusions`
handles a few, but a complete fix needs a **posture decision** (owner to choose):

1. grant the controller a **cluster-scoped read-only** ClusterRole (turns this into
   an effectively cluster-scoped ArgoCD — simplest, broadest), or
2. maintain an explicit `resourceExclusions` list covering every unpermitted CRD.

Until then ArgoCD works as a health/drift dashboard. **The old ac-portal-dev
instance is intentionally left running** and must not be decommissioned until the
sync posture above is chosen and verified on the new instance.

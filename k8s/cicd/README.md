# CI/CD hub — `ac-portal-cicd` (Model C)

A **neutral** namespace that hosts the whole Tekton DevSecOps pipeline and the
build artefacts. It builds the image **once** in `ac-portal-cicd` and **promotes**
it (via `oc tag`) into each environment namespace, then rolls out and re-patches
the route TLS from that env's `ns-web-tls` secret.

```
  git push (branch)                ac-portal-cicd (this ns)                 target env ns
  ─────────────────►  EventListener ─► PipelineRun ─► build ONCE ─► oc tag ─► set image(digest)
     dev  → dev                                      ac-portal:latest          + rollout
     staging → staging  (DAST)                       (cicd ImageStream)        + re-patch route TLS
     main → prod                                                               (ns-web-tls per env)
```

Branch → env mapping (TriggerBindings):

| Branch  | env     | target namespace     | deploy host              | DAST |
|---------|---------|----------------------|--------------------------|------|
| dev     | dev     | ac-portal-dev        | dev.appcarrier.cloud     | no   |
| staging | staging | ac-portal-staging    | staging.appcarrier.cloud | yes  |
| main    | prod    | ac-portal-prod       | appcarrier.cloud         | no   |

## Manifests (GitOps)

| File            | Contents |
|-----------------|----------|
| `namespace.yaml`| the `ac-portal-cicd` namespace |
| `build.yaml`    | `ImageStream` + `BuildConfig ac-portal` (binary Docker build, output `ac-portal:latest`) |
| `rbac.yaml`     | SAs `ns-web-pipeline` / `ns-web-triggers`; local edit/image-builder/pipelines-scc; cross-ns `edit` in dev/staging/prod; image-puller (hub→tool images in dev, envs→promoted image in hub) |
| `tasks.yaml`    | The 8 shared DevSecOps Tasks (gitleaks, dependency-check, semgrep, trivy, kube-linter, zap, defectdojo, oc-run). Tool images from the `ac-portal-dev` mirror. Shared by all 3 pipelines — DRY at the task layer |
| `pipelines.yaml`| Three env-pinned Pipelines `ac-portal-cicd-{dev,staging,prod}` (same task graph, per-env param defaults; build-once + promote-by-tag) |
| `triggers.yaml` | Per-env TriggerTemplates `ns-web-tt-{dev,staging,prod}` + Bindings, one EventListener `ns-web-el`, EL Route. Branch→pipeline: dev→dev, staging→staging, main→prod |

## One-time secrets (NOT in git — create imperatively)

```bash
# Wildcard TLS (used only to re-patch env routes; also available for the EL route).
oc -n ac-portal-cicd create secret tls ns-web-tls \
  --cert=/path/appcarrier.cloud-cert/fullchain.pem \
  --key=/path/appcarrier.cloud-cert/privkey.pem

# DefectDojo API creds + GitHub webhook token (copied from ac-portal-dev).
oc -n ac-portal-dev get secret ns-web-defectdojo -o yaml   | <re-namespace> | oc apply -f -
oc -n ac-portal-dev get secret ns-web-webhook-secret -o yaml | <re-namespace> | oc apply -f -
```

## Tool images

The security-tool images (gitleaks/trivy/semgrep/kube-linter/zaproxy/dependency-check)
are mirrored in the `ac-portal-dev` registry. Tasks reference them there and the hub
SA group is granted `system:image-puller` on `ac-portal-dev`. To make the hub fully
self-contained, re-mirror them into `ac-portal-cicd` and drop that puller grant.

## Manual run

Env params are pinned as Pipeline defaults, so a run only needs to pick the
pipeline (and may override `git-revision`):

```bash
oc -n ac-portal-cicd create -f - <<'YAML'
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata: { generateName: ns-web-dev-, namespace: ac-portal-cicd }
spec:
  pipelineRef: { name: ac-portal-cicd-dev }   # or -staging / -prod
  taskRunTemplate: { serviceAccountName: ns-web-pipeline }
  workspaces:
    - name: shared
      volumeClaimTemplate:
        spec: { accessModes: ["ReadWriteOnce"], resources: { requests: { storage: 1Gi } }, storageClassName: ac-bronze-single }
YAML
```

> PROD is deploy-capable (RBAC + pipeline in place) but must be promoted deliberately
> (push `main` or a manual `env=prod` run). Never auto-deploy prod.

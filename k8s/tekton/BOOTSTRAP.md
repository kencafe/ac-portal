# CI/CD bootstrap (one-time, CI hub = `ac-portal-dev`)

The Tekton pipeline runs in `ac-portal-dev` and deploys into
`ac-portal-dev` / `ac-portal-staging` / `ac-portal-prod`.

## 1. Namespaces & RBAC

```bash
oc new-project ac-portal-staging   # dev & prod already exist
oc apply -f k8s/tekton/rbac.yaml
oc adm policy add-scc-to-user pipelines-scc -z ns-web-pipeline -n ac-portal-dev
```

`pipelines-scc` is required so the shared workspace PVC (Ceph RBD) gets an
`fsGroup` and is group-writable — otherwise `git-clone` fails with
`Permission denied` creating `.git`.

## 2. Mirror the security-tool images

Cluster nodes cannot pull Docker Hub / ghcr directly, but the integrated
registry **can** import from them. Mirror once into `ac-portal-dev`:

```bash
oc -n ac-portal-dev import-image gitleaks:v8.18.4 --from=docker.io/zricethezav/gitleaks:v8.18.4 --confirm
oc -n ac-portal-dev import-image trivy:0.53.0     --from=docker.io/aquasec/trivy:0.53.0 --confirm
oc -n ac-portal-dev import-image semgrep:latest   --from=docker.io/semgrep/semgrep:latest --confirm
oc -n ac-portal-dev import-image kube-linter:latest --from=docker.io/stackrox/kube-linter:latest --confirm
oc -n ac-portal-dev import-image zaproxy:stable    --from=ghcr.io/zaproxy/zaproxy:stable --confirm
```

The tasks in `tasks.yaml` reference these via
`image-registry.openshift-image-registry.svc:5000/ac-portal-dev/<tool>`.

> Note: Trivy vuln-DB and Semgrep rulesets are fetched at run time; if pod
> egress is restricted they are skipped gracefully (advisory). Mirror the DBs
> for fully offline, blocking gates.

## 3. Pipeline, tasks, triggers, webhook secret

```bash
oc apply -f k8s/tekton/tasks.yaml
oc apply -f k8s/tekton/pipeline.yaml
oc apply -f k8s/tekton/triggers.yaml
oc -n ac-portal-dev create secret generic ns-web-webhook-secret \
  --from-literal=secretToken="$(openssl rand -hex 20)"
```

## 3b. Namespace quota for in-namespace builds

The Docker build pod requests up to 8Gi. `ac-portal-prod` shipped with an 8Gi
total `limits.memory` quota, which the build exceeds alongside running pods.
Raise it (or run "build once in ac-portal-dev, promote image" instead):

```bash
oc -n ac-portal-prod patch resourcequota ac-portal-quota --type=merge \
  -p '{"spec":{"hard":{"limits.memory":"16Gi","requests.memory":"12Gi","limits.cpu":"8","requests.cpu":"6"}}}'
```

`ac-portal-dev` already has ample quota (48Gi). Also grant `pipelines-scc` and
mirror scanner images once per cluster (§1–§2).

## 3c. CMS admin auth (OpenShift OAuth)

The CMS route (`ac-portal-cms` → `cms-<env>.appcarrier.cloud`) is fronted by an
`oauth-proxy` sidecar using OpenShift login. Create the cookie secret per env:

```bash
oc -n ac-portal-<env> create secret generic ns-web-oauth \
  --from-literal=session_secret="$(openssl rand -base64 32)"
```

Access: browse `https://cms-<env>.appcarrier.cloud/cms` → OpenShift login. The
`--openshift-sar` gate only admits users who can **update deployments in
ac-portal-dev** (project admins/editors). Adjust the SAR in
`k8s/base/deployment.yaml` (oauth-proxy args) to change who is allowed. The
public site stays open on the main route.

## 4. GitHub webhook

Point `https://<ns-web-el route>/` (see `oc -n ac-portal-dev get route ns-web-el`)
at the repo as a `push` webhook using the same secret token. Branch → env:
`dev → ac-portal-dev`, `staging → ac-portal-staging` (runs DAST),
`main → ac-portal-prod`.

## Manual run

```bash
oc -n ac-portal-dev create -f k8s/tekton/pipelinerun-dev.yaml   # example
```

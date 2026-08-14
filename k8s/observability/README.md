# Observability — Grafana LGTM (OBS-001)

## Phase 1 — Metrics + Dashboards (DONE 2026-08-13)
- **User-Workload Monitoring** enabled (`openshift-monitoring/cluster-monitoring-config` → `enableUserWorkload: true`).
- **Grafana** (plain Deployment, image via Nexus `registry.apps.xplat.fis.com.vn/grafana/grafana:11.1.0`) in ns `observability`, route `grafana.appcarrier.cloud`.
- **Datasource** → platform Prometheus via `thanos-querier.openshift-monitoring:9091`, auth = SA `grafana` bearer (clusterrole `cluster-monitoring-view`).
- **Dashboard** "AC-Portal — Namespaces Overview" provisioned (pods, restarts, CPU, memory).

### Secrets (created out-of-band with `oc`, NOT in git)
- `grafana-admin` (admin user/password — stored in ops creds file)
- `grafana-sa-token` (SA token for the datasource)
- `grafana-datasource` (provisioning file carrying the bearer token)

Apply: `oc apply -f k8s/observability/grafana-phase1.yaml` (after the secrets exist).

## Phase 2 — Logs (Loki + Alloy) — TODO
## Phase 3 — Traces (Tempo + OTel, app `instrumentation.ts`) — TODO

## Phase 2 — Logs (Loki + Alloy) — DONE 2026-08-14
- **Loki** SingleBinary, filesystem storage (PVC loki-data 10Gi), retention 14d — `loki.yaml`. Service `loki.observability:3100`.
- **Alloy** (Deployment, NOT DaemonSet — reads pod logs via the K8s API, so **no privileged SCC/hostPath needed**) — `alloy.yaml`. ClusterRole `alloy-logs-reader` (read pods/pods-log/namespaces/nodes). Scoped to ac-portal-* + observability namespaces via `discovery.kubernetes { namespaces {...} }`.
- **Grafana** Loki datasource (uid `loki`) added to secret `grafana-datasource` — health OK.
- Streams labeled by `instance` (=namespace/pod:container) + `job`. (Optional refinement: a loki.process stage to split into namespace/pod/container labels.)

## Phase 3 — Traces (Tempo + OTel, app instrumentation.ts) — TODO

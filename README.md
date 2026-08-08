# FPT-IS Next Gen Service — website & blog

Next.js (App Router) + TypeScript + Tailwind v4, dựng lại từ bộ thiết kế
`design_handoff_fptis_ns_web`. Triển khai trên OpenShift qua OpenShift Pipelines
(Tekton) với chuỗi DevSecOps theo OWASP DevSecOps Guideline.

## Màn hình

| Route | Nội dung |
|---|---|
| `/` | Landing — 9 dịch vụ, mô hình 4 giai đoạn, ngành, đối tác, case study, liên hệ |
| `/dich-vu/[slug]` | Chi tiết dịch vụ (9 slug, SSG) |
| `/blog`, `/blog/[slug]` | Blog (tìm kiếm + lọc chuyên mục) và trang bài |
| `/cms` | Content Studio — 6 khu quản trị (noindex) |

## Phát triển

```bash
npm install --legacy-peer-deps
npm run dev      # http://localhost:3000
npm run build    # bản standalone cho container
```

## Môi trường & branch

| Branch | Namespace | Host |
|---|---|---|
| `dev` | `ac-portal-dev` | https://dev.appcarrier.cloud |
| `staging` | `ac-portal-staging` | https://staging.appcarrier.cloud |
| `main` | `ac-portal-prod` | https://appcarrier.cloud |

## CI/CD (OpenShift Pipelines · DevSecOps OWASP)

Push → EventListener (webhook GitHub) → PipelineRun `ns-web-cicd`:

`git-clone → gitleaks (secret) → OWASP Dependency-Check (SCA) + Semgrep (SAST) +
kube-linter (compliance) → build (BuildConfig) → Trivy (image scan) →
DefectDojo import → deploy → OWASP ZAP DAST (chỉ staging) → DefectDojo`

Kết quả quét đẩy về **DefectDojo** (sản phẩm `AC-Portal`). Chi tiết:
[docs/DEVSECOPS.md](docs/DEVSECOPS.md), [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md),
bootstrap `k8s/tekton/BOOTSTRAP.md`.

Manifests: `k8s/` (base + overlays dev/staging/prod), pipeline `k8s/tekton/`,
DB `k8s/postgres/` (CloudNativePG).

## Kiến trúc

- Hạ tầng & pipeline: `docs/architecture.html`
- Microservices + mô hình C4 (C1–C4): `docs/c4-architecture.html`

## Backend (chưa triển khai — theo README thiết kế)

RSS ingest, dịch AI phía server, cổng bản quyền, API công khai, xác thực CMS.
Kiến trúc mục tiêu dùng **PostgreSQL (CloudNativePG)** lưu bài trước/sau dịch và
**HashiCorp Vault** giữ token/secret — xem `docs/architecture.html`.

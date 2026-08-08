# DevSecOps — quy trình theo OWASP DevSecOps Guideline

Tham chiếu: <https://owasp.org/www-project-devsecops-guideline/latest/>

CI/CD chạy trên **OpenShift Pipelines (Tekton)**. Mỗi push lên GitHub kích hoạt
EventListener (webhook) → PipelineRun `ns-web-cicd`. Nhánh quyết định môi trường
đích. Kết quả quét được đẩy về **DefectDojo** (`ac-devsecops`).

## Toolchain (theo yêu cầu)

| Kiểm soát | Công cụ |
|---|---|
| Secret / leak scan | **Gitleaks** |
| SCA (dependencies) | **OWASP Dependency-Check** |
| SAST | **Semgrep** |
| Container image scan | **Trivy** (chỉ dùng cho image) |
| DAST | **OWASP ZAP** (baseline, trên staging) |
| Compliance / IaC | **kube-linter** |
| Quản lý lỗ hổng | **DefectDojo** (import-scan) |

## Ánh xạ giai đoạn OWASP → pipeline

| Giai đoạn OWASP | Task Tekton | Công cụ | Cổng gate |
|---|---|---|---|
| Pre-commit | `secret-scan` | Gitleaks | advisory¹ |
| Vulnerability scanning | `sca` | OWASP Dependency-Check | advisory¹ |
| Vulnerability scanning | `sast` | Semgrep | advisory¹ |
| Vulnerability scanning | `image-scan` | Trivy (image) | advisory¹ |
| Vulnerability scanning | `dast` | OWASP ZAP | staging² |
| Compliance auditing | `compliance` | kube-linter | advisory |
| Aggregation | `defectdojo` / `dast` | DefectDojo import-scan | non-fatal |

¹ `onError: continue` để không chặn lần chạy đầu. Siết blocking khi baseline sạch
(xem cuối trang). ² DAST chỉ chạy trên **staging** — quét động môi trường đang
chạy trước khi promote lên prod.

## Luồng pipeline

```
git-clone
   ├─ secret-scan (gitleaks)             → reports/gitleaks.sarif
   ├─ sca (OWASP Dependency-Check)       → reports/dependency-check-report.json
   ├─ sast (semgrep)                     → reports/semgrep.sarif
   └─ compliance (kube-linter)
        │  (build gate: secret-scan + sca + sast)
   build              → oc apply -k overlay + oc start-build (BuildConfig Docker)
   image-scan (Trivy) → reports/trivy-image.json
   defectdojo         → import Dependency-Check / Semgrep / Trivy / Gitleaks
   deploy             → oc rollout restart + status
   dast (staging)     → OWASP ZAP → import ZAP Scan vào DefectDojo
```

Sản phẩm DefectDojo: **AC-Portal** (`auto_create_context`), engagement
`ci-<env>` cho scan tĩnh/ảnh và `dast-<env>` cho ZAP.

## Nhánh → môi trường

| Branch | Namespace | Host | DAST |
|---|---|---|---|
| `dev` | `ac-portal-dev` | dev.appcarrier.cloud | không |
| `staging` | `ac-portal-staging` | staging.appcarrier.cloud | **có** |
| `main` | `ac-portal-prod` | appcarrier.cloud | không |

## Secret & DefectDojo

- Token/khoá (AI, DB, public API, webhook) trong **HashiCorp Vault**, đưa vào pod
  qua Vault Agent → Secret `ns-web-secrets`. Không hardcode.
- DefectDojo URL/host/token trong Secret `defectdojo-creds`. Import gọi vào service
  in-cluster `defect-dojo-defectdojo-django.ac-devsecops.svc` kèm header
  `Host: defect-dojo-ac-devsecops.apps.prod01.fis-cloud.fpt.com` (ALLOWED_HOSTS).
- Webhook Tekton: `ns-web-webhook-secret` (chữ ký HMAC GitHub).
- Image công cụ mirror vào registry nội bộ (xem `BOOTSTRAP.md`).

## DefectDojo — hoạt động ✅

Pipeline đẩy kết quả về DefectDojo có sẵn ở `ac-devsecops`, sản phẩm **AC-Portal**
(product_type "Research and Development"), engagement `ci-<env>` / `dast-<env>`.
Đã xác nhận import **HTTP 201** (Trivy → test tạo thành công).

Cấu hình trong secret `defectdojo-creds` (namespace `ac-portal-dev`):
- `DD_URL` = `http://defect-dojo-defectdojo-django.ac-devsecops.svc` (service in-cluster)
- `DD_HOST` = `security-devsecops.sec.cluster02.fis-cloud.xplat.online` (phải khớp
  `ALLOWED_HOSTS` của DefectDojo — dùng route prod01 sẽ bị `DisallowedHost` 400)
- `DD_TOKEN` = token có quyền import (tạo bằng
  `oc -n ac-devsecops exec deploy/defect-dojo-defectdojo-django -c uwsgi -- python manage.py drf_create_token admin`)

Import bắt buộc kèm `-H "Accept: application/json"`, `product_name`, và
`product_type_name` khi dùng `auto_create_context=true`.

## Siết gate về blocking (khi baseline sạch)

Trong `tasks.yaml`, bỏ `onError: continue` và trả mã lỗi thật:
`dependency-check.sh --failOnCVSS 7`, `semgrep --error`, `trivy image --exit-code 1`,
`gitleaks detect` (bỏ `|| true`). Với môi trường hạn chế egress: cấu hình NVD API
key cho Dependency-Check và mirror ruleset Semgrep.

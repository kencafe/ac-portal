# DevSecOps — quy trình theo OWASP DevSecOps Guideline

Tham chiếu: <https://owasp.org/www-project-devsecops-guideline/latest/>

CI/CD chạy trên **OpenShift Pipelines (Tekton)**. Mỗi lần push lên GitHub kích
hoạt EventListener (webhook) → PipelineRun `ns-web-cicd`. Nhánh quyết định môi
trường đích.

## Ánh xạ giai đoạn OWASP → pipeline

| Giai đoạn OWASP | Kiểm soát | Task Tekton | Công cụ | Cổng gate |
|---|---|---|---|---|
| **Pre-commit** | Secrets management | `secret-scan` | Gitleaks | advisory¹ |
| **Pre-commit** | Linting | (trong `build`/repo) | ESLint / `next lint` | advisory |
| **Vulnerability scanning** | SCA — dependencies | `sca` | Trivy `fs` (vuln) | advisory¹ |
| **Vulnerability scanning** | SAST | `sast` | Semgrep (`--config auto`) | advisory¹ |
| **Vulnerability scanning** | Secret scan (fs) | `sca` | Trivy `fs` (secret) | advisory |
| **Vulnerability scanning** | Container image scan | `image-scan` | Trivy `image` | advisory¹ |
| **Vulnerability scanning** | DAST | `dast` | OWASP ZAP baseline | staging² |
| **Compliance auditing** | IaC / manifest policy | `compliance` | kube-linter | advisory |

¹ `onError: continue` để lần chạy đầu không bị chặn. **Chuyển sang blocking** khi
baseline sạch: bỏ `onError: continue` và đặt `--exit-code 1` / `--error` (xem
"Siết gate" bên dưới).

² DAST chỉ chạy trên **staging** (`run-dast=true`) — đúng khuyến nghị OWASP: quét
động trên môi trường đang chạy trước khi promote lên prod.

## Luồng pipeline

```
git-clone
   ├─ secret-scan (gitleaks)          ┐
   ├─ sca (trivy fs)                  ├─ pre-commit + vuln scanning (song song)
   ├─ sast (semgrep)                  │
   └─ compliance (kube-linter)        ┘
        │  (build gate: secret-scan + sca + sast)
   build            → oc apply -k overlay + oc start-build (BuildConfig Docker)
   image-scan       → trivy image (đăng nhập registry nội bộ bằng token SA)
   deploy           → oc rollout restart + rollout status
   dast (staging)   → OWASP ZAP baseline vào https://staging.appcarrier.cloud
```

## Nhánh → môi trường

| Branch | Namespace | Host | DAST |
|---|---|---|---|
| `dev` | `ac-portal-dev` | dev.appcarrier.cloud | không |
| `staging` | `ac-portal-staging` | staging.appcarrier.cloud | **có** |
| `main` | `ac-portal-prod` | appcarrier.cloud | không |

Promote: cùng Dockerfile/mã nguồn được build lại per-namespace; staging là cổng
DAST bắt buộc trước khi `main` lên prod.

## Quản lý secret (OWASP: không hardcode)

- Token/khoá (AI provider, DB, public API, webhook) nằm trong **HashiCorp Vault**
  (`vault.appcarrier.cloud`), đưa vào pod qua Vault Agent → Secret `ns-web-secrets`
  (`envFrom` optional). Không có khoá nào trong mã nguồn hay client.
- Webhook secret Tekton: `ns-web-webhook-secret` (chữ ký GitHub, interceptor
  `github` xác thực HMAC).
- Image công cụ bảo mật mirror vào registry nội bộ (xem `k8s/tekton/BOOTSTRAP.md`).

## Siết gate về blocking (khi baseline sạch)

Trong `k8s/tekton/tasks.yaml`, mỗi task muốn chặn build:
1. Bỏ `onError: continue`.
2. Đổi lệnh sang mã lỗi thật: `trivy ... --exit-code 1`, `semgrep ... --error`,
   `gitleaks detect` (bỏ `|| true`), `kube-linter lint` (đã trả mã ≠ 0 khi có lỗi).
3. Với môi trường offline: mirror Trivy DB và ruleset Semgrep vào registry/nội bộ.

## Chạy thủ công

```bash
oc -n ac-portal-dev create -f k8s/tekton/pipelinerun-dev.yaml
# hoặc tkn pipeline start ns-web-cicd -p env=dev -p target-namespace=ac-portal-dev ...
```

# Security Policy

## Reporting a vulnerability

Email **dungpv30@fpt.com.vn** with details and reproduction steps. Do not open a
public issue for undisclosed vulnerabilities. We aim to acknowledge within a few
business days.

## Security posture

- **DevSecOps pipeline** (OWASP-aligned) runs on every push — secret scanning
  (Gitleaks), SCA (Trivy), SAST (Semgrep), container image scan (Trivy), DAST
  (OWASP ZAP on staging), manifest compliance (kube-linter). See
  [`docs/DEVSECOPS.md`](docs/DEVSECOPS.md).
- **Secrets** live in HashiCorp Vault and reach workloads via Vault Agent — never
  hardcoded in source or shipped to the browser. AI model calls go through the
  server only.
- **HTTP hardening**: strict CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS (see `next.config.ts`).
- **Container**: non-root (OpenShift arbitrary UID), read-only-friendly, all Linux
  capabilities dropped, `seccompProfile: RuntimeDefault`.
- **CMS** (`/cms`) is `noindex` and destined to sit behind authentication
  (Editor/Admin roles) once the backend lands.

## Supported branches

`main` (production) receives security fixes first, then `staging` and `dev`.

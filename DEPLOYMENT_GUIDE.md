# AC Portal - Hướng Dẫn Deployment 🚀

## 📋 Tóm Tắt Project

✅ **Đã Hoàn Thành:**
- Next.js 16 + TypeScript + Tailwind CSS project
- Components cho Blog và Services (tiếng Việt)
- Docker configuration với multi-stage build
- OpenShift deployment manifests (Kustomize)
- GitHub Actions CI/CD pipeline
- Git branching strategy (main/develop)
- Security và RBAC configurations

## 🎯 Bước Tiếp Theo

### 1. Tạo GitHub Repository

```bash
# Tạo repository mới trên GitHub với tên: ac-portal
# Sau đó link local repo với GitHub:

cd /root/ac-projects/ac-portal
git remote add origin https://github.com/YOUR_USERNAME/ac-portal.git
git push -u origin main
git push -u origin develop
```

### 2. Setup OpenShift Environment

```bash
# Chạy script setup OpenShift:
./scripts/setup-openshift.sh

# Script sẽ tạo:
# - Namespaces: ac-portal-dev, ac-portal-prod  
# - Service Accounts với proper RBAC
# - Network Policies và Resource Quotas
# - Registry secrets
```

### 3. Cấu Hình GitHub Secrets

Thêm các secrets vào GitHub repository:

```
OPENSHIFT_SERVER=https://api.prod01.fis-cloud.fpt.com:6443
OPENSHIFT_TOKEN=<deployment-token-from-setup-script>
REGISTRY_USERNAME=<quay.io-username>
REGISTRY_PASSWORD=<quay.io-password>
```

### 4. Deploy Application

```bash
# Deploy to development:
./scripts/deploy.sh dev

# Deploy to production:  
./scripts/deploy.sh prod

# Or deploy with specific image tag:
./scripts/deploy.sh prod -i v1.0.0
```

## 🌐 URLs Sau Khi Deploy

- **Development**: https://ac-portal-dev.apps.cluster.com
- **Production**: https://ac-portal.apps.cluster.com

## 🔄 Development Workflow

1. **Feature Development:**
```bash
git checkout develop
git checkout -b feature/your-feature-name
# Make changes...
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
# Create PR to develop branch
```

2. **Release Process:**
```bash
# After testing in dev, create PR from develop to main
# Merge triggers auto-deployment to production
```

## 📦 Project Structure

```
ac-portal/
├── src/
│   ├── app/                 # Next.js pages
│   └── components/          # Reusable components
├── k8s/                     # OpenShift manifests
├── .github/workflows/       # CI/CD pipelines
├── scripts/                 # Deployment scripts
├── Dockerfile              # Container build
└── docker-compose.yml      # Local development
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or use Docker Compose
docker-compose up --build
```

## 🔐 Security Features

- ✅ Security headers in Next.js config
- ✅ Container runs as non-root user  
- ✅ Network policies in OpenShift
- ✅ RBAC với least privilege
- ✅ Image vulnerability scanning
- ✅ Dependency security updates

## 📊 Monitoring & Observability

- Health checks trong Kubernetes
- Resource quotas và limits
- Deployment rollout status monitoring
- Application logs via OpenShift console

---

**🎉 Project AC Portal đã sẵn sàng cho production!**

**Next Steps:**
1. Tạo GitHub repository và push code
2. Chạy `./scripts/setup-openshift.sh` 
3. Configure GitHub secrets
4. Test deployment với `./scripts/deploy.sh dev`
5. Verify application tại development URL
# AC Portal - Cloud Services Website & Technical Blog

## 🚀 Project Overview

AC Portal là website Cloud Services + Technical Blog được xây dựng với:

- **Framework**: Next.js 16 với TypeScript
- **Styling**: Tailwind CSS 4
- **Target**: DevOps Engineers, SRE, Platform Engineers
- **Deployment**: OpenShift với CI/CD automation

## 📁 Project Structure

```
ac-portal/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── blog/              # Blog pages
│   │   ├── services/          # Service pages  
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── blog/              # Blog components
│   │   ├── services/          # Service components
│   │   └── shared/            # Shared components
│   └── lib/                   # Utilities
├── public/                    # Static assets
├── .github/
│   └── workflows/             # GitHub Actions
├── k8s/                       # OpenShift manifests
├── Dockerfile                 # Container image
└── docker-compose.yml         # Development
```

## 🌲 Git Branching Strategy

- **main** → Production environment (OpenShift prod namespace)
- **develop** → Development environment (OpenShift dev namespace)
- **feature/** → Feature branches (tạo PR vào develop)
- **hotfix/** → Emergency fixes (PR trực tiếp vào main)

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- OpenShift CLI (oc)

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Docker Development
```bash
# Build và chạy với Docker Compose
docker-compose up --build

# Access: http://localhost:3000
```

## 🚢 Deployment Strategy

### Environments
1. **Development** (`develop` branch)
   - Namespace: `ac-portal-dev`
   - Auto-deploy on push to develop
   - URL: https://ac-portal-dev.apps.cluster.com

2. **Production** (`main` branch)
   - Namespace: `ac-portal-prod`
   - Auto-deploy on push to main
   - URL: https://ac-portal.apps.cluster.com

### CI/CD Workflow
1. Developer tạo feature branch
2. Tạo PR vào `develop`
3. Automated tests và code review
4. Merge → auto-deploy to dev environment
5. Tạo PR từ `develop` vào `main`
6. Approval → merge → auto-deploy to production

## 📝 Content Guidelines

### Blog Module
- Technical editorial style
- Max content width: 760px
- Focus: Production experience, SRE insights
- Language: Vietnamese technical content

### Services Module  
- Enterprise-grade presentation
- No pricing tables
- Focus: Methodology and expertise
- Service categories: Consulting, Implementation, Operations, Security

## 🔐 OpenShift Configuration

### Required Resources
- **Namespace**: ac-portal-dev, ac-portal-prod
- **Service Account**: ac-portal-deployer
- **RBAC**: Deployment permissions
- **Secrets**: Registry credentials, app secrets
- **ConfigMaps**: Environment-specific config

### Resource Limits
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi" 
    cpu: "500m"
```

## 🚀 Quick Start

1. **Clone repository**
```bash
git clone <repo-url>
cd ac-portal
```

2. **Setup development environment**
```bash
npm install
npm run dev
```

3. **Create feature branch**
```bash
git checkout -b feature/your-feature-name
```

4. **Make changes and commit**
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

5. **Create Pull Request** to `develop` branch

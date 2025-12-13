# 🏗️ OpenShift ImageStreams Migration

## 📋 Thay Đổi Chính

### ❌ Trước (External Registry)
- Sử dụng Quay.io external registry
- GitHub Actions build và push Docker images
- Pull images từ external registry

### ✅ Sau (OpenShift ImageStreams)
- Sử dụng OpenShift ImageStreams internal
- OpenShift BuildConfig build từ GitHub source
- Images được lưu trữ nội bộ trong OpenShift

## 🔄 Migration Changes

### 1. New Resources Created
```yaml
# ImageStream for image storage
apiVersion: image.openshift.io/v1
kind: ImageStream
metadata:
  name: ac-portal

# BuildConfig for building from source
apiVersion: build.openshift.io/v1  
kind: BuildConfig
metadata:
  name: ac-portal
spec:
  source:
    git:
      uri: https://github.com/YOUR_USERNAME/ac-portal.git
  output:
    to:
      kind: ImageStreamTag
      name: ac-portal:latest
```

### 2. Updated Deployment
```yaml
# Deployment now references ImageStream
spec:
  containers:
  - name: ac-portal
    image: ac-portal:latest  # ImageStream reference
```

### 3. Updated CI/CD Pipeline
```yaml
# GitHub Actions now triggers OpenShift builds
- name: Trigger OpenShift Build
  run: |
    oc start-build ac-portal --from-repo=. --wait --follow
    oc tag ac-portal:latest ac-portal:$TAG
```

## 🚀 Benefits

### 🔒 Security
- ✅ No external registry credentials needed
- ✅ Images stored within OpenShift cluster
- ✅ Better network security (no external pulls)

### ⚡ Performance  
- ✅ Faster deployments (internal registry)
- ✅ Better bandwidth utilization
- ✅ Reduced external dependencies

### 🛠️ Management
- ✅ Centralized image management
- ✅ Integrated with OpenShift RBAC
- ✅ Built-in image scanning capabilities

## 📝 Updated Workflow

### Development Workflow
1. **Code Push**: Developer pushes to `develop` branch
2. **Auto Build**: GitHub Actions triggers OpenShift build
3. **Image Tag**: Built image tagged as `ac-portal:dev`
4. **Deploy**: Deployment pulls from ImageStream
5. **Verify**: Application available at dev URL

### Production Workflow
1. **Release**: Merge `develop` → `main`
2. **Build**: Production build triggered
3. **Tag**: Image tagged as `ac-portal:prod`
4. **Deploy**: Production deployment updated
5. **Live**: Application live on production URL

## 🔧 Setup Commands

### 1. Run Updated Setup
```bash
./scripts/setup-openshift.sh
# Now creates ImageStreams and BuildConfigs instead of registry secrets
```

### 2. Deploy with ImageStreams
```bash
./scripts/deploy.sh dev   # Uses ac-portal:dev ImageStream tag
./scripts/deploy.sh prod  # Uses ac-portal:prod ImageStream tag
```

### 3. Manual Build (if needed)
```bash
# Trigger manual build
oc start-build ac-portal --from-repo=.

# Tag specific build
oc tag ac-portal:latest ac-portal:v1.0.0

# Deploy specific tag
./scripts/deploy.sh prod -i v1.0.0
```

## 📊 Comparison

| Aspect | External Registry | ImageStreams |
|--------|------------------|--------------|
| **Security** | Requires external credentials | OpenShift RBAC only |
| **Performance** | Network dependent | Internal registry |
| **Management** | Multiple systems | Single OpenShift platform |
| **Cost** | External registry fees | Included with OpenShift |
| **Compliance** | External data flow | Internal data only |

## ⚠️ Important Notes

### GitHub Secrets Update
Remove old secrets, add new ones:
```bash
# Remove (no longer needed):
REGISTRY_USERNAME
REGISTRY_PASSWORD

# Keep/Add:
OPENSHIFT_SERVER=https://api.prod01.fis-cloud.fpt.com:6443  
OPENSHIFT_TOKEN=<service-account-token>
```

### BuildConfig Source
Update BuildConfig with your actual GitHub repository:
```yaml
source:
  git:
    uri: https://github.com/YOUR_USERNAME/ac-portal.git
```

---

**🎯 Result**: AC Portal now fully integrated với OpenShift ecosystem, không cần external registry, bảo mật và hiệu năng tốt hơn!
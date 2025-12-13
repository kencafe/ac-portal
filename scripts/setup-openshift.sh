#!/bin/bash

# AC Portal - OpenShift Setup Script
# This script sets up the required namespaces and RBAC for AC Portal deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEV_NAMESPACE="ac-portal-dev"
PROD_NAMESPACE="ac-portal-prod"
SERVICE_ACCOUNT="ac-portal-deployer"

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_oc_login() {
    if ! oc whoami &> /dev/null; then
        print_error "Bạn chưa đăng nhập vào OpenShift cluster!"
        print_error "Hãy chạy: oc login --token=<your-token> --server=<server-url>"
        exit 1
    fi
    
    current_user=$(oc whoami)
    print_status "Đã đăng nhập với user: $current_user"
}

create_namespace() {
    local namespace=$1
    
    if oc get namespace "$namespace" &> /dev/null; then
        print_warning "Namespace '$namespace' đã tồn tại"
    else
        print_status "Tạo namespace: $namespace"
        oc new-project "$namespace" --display-name="AC Portal - $(echo $namespace | cut -d'-' -f3 | tr '[:lower:]' '[:upper:]')" \
            --description="AC Portal $(echo $namespace | cut -d'-' -f3) environment"
    fi
}

create_service_account() {
    local namespace=$1
    
    oc project "$namespace"
    
    if oc get serviceaccount "$SERVICE_ACCOUNT" -n "$namespace" &> /dev/null; then
        print_warning "Service Account '$SERVICE_ACCOUNT' đã tồn tại trong namespace '$namespace'"
    else
        print_status "Tạo Service Account: $SERVICE_ACCOUNT trong namespace: $namespace"
        oc create serviceaccount "$SERVICE_ACCOUNT" -n "$namespace"
    fi
}

setup_rbac() {
    local namespace=$1
    
    print_status "Cấu hình RBAC cho namespace: $namespace"
    
    # Grant edit permissions to service account
    oc policy add-role-to-user edit "system:serviceaccount:$namespace:$SERVICE_ACCOUNT" -n "$namespace"
    
    # Allow pulling images from other namespaces
    oc policy add-role-to-user system:image-puller "system:serviceaccount:$namespace:$SERVICE_ACCOUNT" -n "$namespace"
}

setup_imagestreams() {
    local namespace=$1
    
    oc project "$namespace"
    
    print_status "Thiết lập ImageStreams cho namespace: $namespace"
    
    # Check if ImageStream exists
    if oc get imagestream ac-portal -n "$namespace" &> /dev/null; then
        print_warning "ImageStream 'ac-portal' đã tồn tại trong namespace '$namespace'"
    else
        print_status "Tạo ImageStream ac-portal trong namespace: $namespace"
        
        cat <<EOF | oc apply -f -
apiVersion: image.openshift.io/v1
kind: ImageStream
metadata:
  name: ac-portal
  namespace: $namespace
  labels:
    app: ac-portal
    component: frontend
spec:
  lookupPolicy:
    local: true
EOF
    fi
    
    # Check if BuildConfig exists  
    if oc get buildconfig ac-portal -n "$namespace" &> /dev/null; then
        print_warning "BuildConfig 'ac-portal' đã tồn tại trong namespace '$namespace'"
    else
        print_status "Tạo BuildConfig ac-portal trong namespace: $namespace"
        
        cat <<EOF | oc apply -f -
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: ac-portal
  namespace: $namespace
  labels:
    app: ac-portal
    component: frontend
spec:
  source:
    type: Git
    git:
      uri: https://github.com/YOUR_USERNAME/ac-portal.git
      ref: main
    contextDir: "."
  strategy:
    type: Docker
    dockerStrategy:
      dockerfilePath: Dockerfile
  output:
    to:
      kind: ImageStreamTag
      name: ac-portal:latest
  resources:
    requests:
      memory: "1Gi"
      cpu: "500m"
    limits:
      memory: "2Gi"
      cpu: "1000m"
EOF
    fi
}

setup_network_policies() {
    local namespace=$1
    
    print_status "Thiết lập Network Policies cho namespace: $namespace"
    
    cat <<EOF | oc apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ac-portal-network-policy
  namespace: $namespace
spec:
  podSelector:
    matchLabels:
      app: ac-portal
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          network.openshift.io/policy-group: ingress
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - {}
EOF
}

setup_resource_quotas() {
    local namespace=$1
    local env_type=$2
    
    print_status "Thiết lập Resource Quota cho namespace: $namespace"
    
    if [ "$env_type" == "dev" ]; then
        cpu_limit="2"
        memory_limit="4Gi"
        pod_limit="10"
    else
        cpu_limit="4"
        memory_limit="8Gi"
        pod_limit="20"
    fi
    
    cat <<EOF | oc apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: ac-portal-quota
  namespace: $namespace
spec:
  hard:
    requests.cpu: "$cpu_limit"
    requests.memory: "$memory_limit"
    limits.cpu: "$cpu_limit"
    limits.memory: "$memory_limit"
    pods: "$pod_limit"
    persistentvolumeclaims: "5"
EOF
}

setup_limit_ranges() {
    local namespace=$1
    
    print_status "Thiết lập Limit Range cho namespace: $namespace"
    
    cat <<EOF | oc apply -f -
apiVersion: v1
kind: LimitRange
metadata:
  name: ac-portal-limits
  namespace: $namespace
spec:
  limits:
  - default:
      cpu: 500m
      memory: 512Mi
    defaultRequest:
      cpu: 100m
      memory: 128Mi
    type: Container
EOF
}

get_deployment_token() {
    local namespace=$1
    
    print_status "Lấy deployment token cho namespace: $namespace"
    
    # Get the secret name for the service account
    secret_name=$(oc get serviceaccount "$SERVICE_ACCOUNT" -n "$namespace" -o jsonpath='{.secrets[0].name}')
    
    if [ -n "$secret_name" ]; then
        token=$(oc get secret "$secret_name" -n "$namespace" -o jsonpath='{.data.token}' | base64 -d)
        print_status "Deployment token cho $namespace:"
        echo "$token"
        echo
    else
        print_warning "Không tìm thấy token cho service account"
    fi
}

main() {
    print_status "=== AC Portal OpenShift Setup ==="
    print_status "Thiết lập môi trường OpenShift cho AC Portal"
    echo
    
    # Check if user is logged in
    check_oc_login
    echo
    
    # Setup Development Environment
    print_status "=== THIẾT LẬP DEVELOPMENT ENVIRONMENT ==="
    create_namespace "$DEV_NAMESPACE"
    create_service_account "$DEV_NAMESPACE"
    setup_rbac "$DEV_NAMESPACE"
    setup_imagestreams "$DEV_NAMESPACE"
    setup_network_policies "$DEV_NAMESPACE"
    setup_resource_quotas "$DEV_NAMESPACE" "dev"
    setup_limit_ranges "$DEV_NAMESPACE"
    echo
    
    # Setup Production Environment
    print_status "=== THIẾT LẬP PRODUCTION ENVIRONMENT ==="
    create_namespace "$PROD_NAMESPACE"
    create_service_account "$PROD_NAMESPACE"
    setup_rbac "$PROD_NAMESPACE"
    setup_imagestreams "$PROD_NAMESPACE"
    setup_network_policies "$PROD_NAMESPACE"
    setup_resource_quotas "$PROD_NAMESPACE" "prod"
    setup_limit_ranges "$PROD_NAMESPACE"
    echo
    
    # Display deployment information
    print_status "=== THÔNG TIN DEPLOYMENT ==="
    print_status "Development namespace: $DEV_NAMESPACE"
    print_status "Production namespace: $PROD_NAMESPACE"
    print_status "Service Account: $SERVICE_ACCOUNT"
    echo
    
    print_status "=== DEPLOYMENT TOKENS ==="
    get_deployment_token "$DEV_NAMESPACE"
    get_deployment_token "$PROD_NAMESPACE"
    
    print_status "=== HOÀN THÀNH SETUP ==="
    print_status "OpenShift đã được cấu hình thành công cho AC Portal!"
    print_status "Bạn có thể deploy ứng dụng bằng:"
    echo "  oc apply -k k8s/overlays/dev    # Deploy to development"
    echo "  oc apply -k k8s/overlays/prod   # Deploy to production"
}

# Run main function
main "$@"
#!/bin/bash

# AC Portal - Deployment Script
# Deploy AC Portal to OpenShift environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

usage() {
    echo "AC Portal Deployment Script"
    echo ""
    echo "Usage: $0 [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "Environments:"
    echo "  dev     Deploy to development environment"
    echo "  prod    Deploy to production environment"
    echo ""
    echo "Options:"
    echo "  -i, --image-tag    Specify image tag (default: latest for prod, dev for dev)"
    echo "  -n, --namespace    Override default namespace"
    echo "  -d, --dry-run      Show what would be deployed without applying"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                           # Deploy to dev with dev image tag"
    echo "  $0 prod -i v1.2.3               # Deploy to prod with specific tag"
    echo "  $0 dev --dry-run                # Show deployment manifests"
    echo ""
}

check_prerequisites() {
    # Check if oc is installed
    if ! command -v oc &> /dev/null; then
        print_error "OpenShift CLI (oc) is not installed"
        exit 1
    fi
    
    # Check if kustomize is available
    if ! command -v kustomize &> /dev/null; then
        print_error "Kustomize is not installed"
        exit 1
    fi
    
    # Check if logged in to OpenShift
    if ! oc whoami &> /dev/null; then
        print_error "Not logged in to OpenShift cluster"
        print_error "Run: oc login --token=<your-token> --server=<server-url>"
        exit 1
    fi
    
    current_user=$(oc whoami)
    current_server=$(oc whoami --show-server)
    print_status "Logged in as: $current_user"
    print_info "Server: $current_server"
}

deploy_environment() {
    local env=$1
    local image_tag=$2
    local namespace=$3
    local dry_run=$4
    
    print_status "=== DEPLOYING AC PORTAL TO $env ENVIRONMENT ==="
    
    # Set defaults
    if [ "$env" == "dev" ]; then
        namespace=${namespace:-"ac-portal-dev"}
        image_tag=${image_tag:-"dev"}
        overlay_path="k8s/overlays/dev"
    elif [ "$env" == "prod" ]; then
        namespace=${namespace:-"ac-portal-prod"}
        image_tag=${image_tag:-"latest"}
        overlay_path="k8s/overlays/prod"
    else
        print_error "Invalid environment: $env"
        exit 1
    fi
    
    print_info "Environment: $env"
    print_info "Namespace: $namespace"
    print_info "Image tag: $image_tag"
    print_info "Overlay path: $overlay_path"
    
    # Check if namespace exists
    if ! oc get namespace "$namespace" &> /dev/null; then
        print_error "Namespace '$namespace' does not exist"
        print_error "Run setup script first: ./scripts/setup-openshift.sh"
        exit 1
    fi
    
    # Switch to target namespace
    oc project "$namespace"
    
    # Update image tag in kustomization
    print_status "Updating image tag in kustomization..."
    cd "$overlay_path"
    kustomize edit set image ac-portal=quay.io/ac-portal/ac-portal:$image_tag
    cd - > /dev/null
    
    if [ "$dry_run" == "true" ]; then
        print_status "=== DRY RUN - DEPLOYMENT MANIFESTS ==="
        kustomize build "$overlay_path"
        return
    fi
    
    # Apply manifests
    print_status "Applying Kubernetes manifests..."
    oc apply -k "$overlay_path"
    
    # Wait for deployment
    print_status "Waiting for deployment to complete..."
    oc rollout status deployment/ac-portal --timeout=300s
    
    # Check deployment status
    print_status "=== DEPLOYMENT STATUS ==="
    oc get pods -l app=ac-portal
    oc get services -l app=ac-portal
    oc get routes -l app=ac-portal
    
    # Get application URL
    app_url=$(oc get route ac-portal -o jsonpath='{.spec.host}')
    if [ -n "$app_url" ]; then
        print_status "Application URL: https://$app_url"
    fi
    
    print_status "=== DEPLOYMENT COMPLETED SUCCESSFULLY ==="
}

# Parse command line arguments
ENVIRONMENT=""
IMAGE_TAG=""
NAMESPACE=""
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        dev|prod)
            ENVIRONMENT="$1"
            shift
            ;;
        -i|--image-tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN="true"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Main execution
if [ -z "$ENVIRONMENT" ]; then
    print_error "Environment is required"
    usage
    exit 1
fi

# Check prerequisites
check_prerequisites

# Deploy
deploy_environment "$ENVIRONMENT" "$IMAGE_TAG" "$NAMESPACE" "$DRY_RUN"
#!/bin/bash
# =============================================================================
# SIMA Platform - PROD Bootstrap Script
# Downloads Docker images from registry, runs containers
# IDEMPOTENT: Checks what exists before creating
# =============================================================================

set -e

# Variables from Terraform
DOCKER_REGISTRY="${docker_registry}"
DOCKER_TAG="${docker_tag}"
ENVIRONMENT="${environment}"

# Constants
LOG_FILE=/var/log/sima-bootstrap.log
SIMA_DIR=/opt/sima-platform
MARKER_FILE="$SIMA_DIR/.bootstrap-complete"

# =============================================================================
# Logging Function
# =============================================================================
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$ENVIRONMENT] $1" | tee -a $LOG_FILE
}

# =============================================================================
# Check if containers are running (IDEMPOTENT)
# =============================================================================
if docker ps | grep -q "sima-"; then
    log "SIMA containers already running. Checking for updates..."
    
    # Pull latest images
    log "Pulling latest images from $DOCKER_REGISTRY..."
    docker pull $DOCKER_REGISTRY/auth-service:$DOCKER_TAG || true
    docker pull $DOCKER_REGISTRY/api-gateway:$DOCKER_TAG || true
    docker pull $DOCKER_REGISTRY/inventory-service:$DOCKER_TAG || true
    docker pull $DOCKER_REGISTRY/tenant-service:$DOCKER_TAG || true
    
    # Restart with new images
    cd $SIMA_DIR
    docker-compose -f docker-compose.prod.yml up -d
    
    log "Update complete!"
    exit 0
fi

log "Starting fresh PROD installation..."

# =============================================================================
# Install Dependencies
# =============================================================================
log "Installing system dependencies..."

# Update system
yum update -y

# Install Docker
if ! command -v docker &> /dev/null; then
    log "Installing Docker..."
    amazon-linux-extras install docker -y
    systemctl enable docker
    systemctl start docker
    usermod -a -G docker ec2-user
else
    log "Docker already installed."
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    log "Docker Compose already installed."
fi

# =============================================================================
# Create Directory and Download Compose File
# =============================================================================
log "Setting up SIMA directory..."
mkdir -p $SIMA_DIR
cd $SIMA_DIR

# Download production docker-compose file from GitHub
log "Downloading docker-compose.prod.yml..."
curl -fsSL "https://raw.githubusercontent.com/Dereck2102/sima-platform/main/docker-compose.prod.yml" -o docker-compose.prod.yml

# Download .env.example and create .env
log "Configuring environment..."
curl -fsSL "https://raw.githubusercontent.com/Dereck2102/sima-platform/main/.env.example" -o .env.example
cp .env.example .env

# Set PROD-specific configurations
sed -i "s/NODE_ENV=.*/NODE_ENV=production/" .env
sed -i "s/ENVIRONMENT=.*/ENVIRONMENT=prod/" .env

# =============================================================================
# Pull Docker Images
# =============================================================================
log "Pulling Docker images from $DOCKER_REGISTRY..."

docker pull $DOCKER_REGISTRY/auth-service:$DOCKER_TAG
docker pull $DOCKER_REGISTRY/api-gateway:$DOCKER_TAG
docker pull $DOCKER_REGISTRY/inventory-service:$DOCKER_TAG
docker pull $DOCKER_REGISTRY/tenant-service:$DOCKER_TAG

# =============================================================================
# Start Services
# =============================================================================
log "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# =============================================================================
# Mark Installation Complete
# =============================================================================
log "Marking installation complete..."
echo "$(date '+%Y-%m-%d %H:%M:%S')" > $MARKER_FILE
echo "Registry: $DOCKER_REGISTRY" >> $MARKER_FILE
echo "Tag: $DOCKER_TAG" >> $MARKER_FILE

log "PROD Bootstrap complete! Services should be available shortly."
log "Check status with: docker-compose -f docker-compose.prod.yml ps"

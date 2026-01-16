#!/bin/bash
# =============================================================================
# SIMA Platform - QA Bootstrap Script
# Downloads from GitHub, builds from source
# IDEMPOTENT: Checks what exists before creating
# =============================================================================

set -e

# Variables from Terraform
GITHUB_REPO="${github_repo}"
GITHUB_BRANCH="${github_branch}"
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
# Check if already installed (IDEMPOTENT)
# =============================================================================
if [ -f "$MARKER_FILE" ]; then
    log "SIMA already installed. Checking for updates..."
    cd $SIMA_DIR
    
    # Pull latest changes
    git fetch origin $GITHUB_BRANCH
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$GITHUB_BRANCH)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        log "Already up to date. No changes needed."
        exit 0
    fi
    
    log "Updates found. Pulling and rebuilding..."
    git pull origin $GITHUB_BRANCH
    
    # Rebuild only if there are changes
    docker-compose down
    docker-compose build
    docker-compose up -d
    
    log "Update complete!"
    exit 0
fi

log "Starting fresh QA installation..."

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

# Install Git
if ! command -v git &> /dev/null; then
    log "Installing Git..."
    yum install -y git
else
    log "Git already installed."
fi

# Install Node.js (for building)
if ! command -v node &> /dev/null; then
    log "Installing Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
else
    log "Node.js already installed."
fi

# =============================================================================
# Clone Repository
# =============================================================================
log "Cloning repository from $GITHUB_REPO (branch: $GITHUB_BRANCH)..."
mkdir -p $SIMA_DIR
git clone --branch $GITHUB_BRANCH $GITHUB_REPO $SIMA_DIR
cd $SIMA_DIR

# =============================================================================
# Configure Environment
# =============================================================================
log "Configuring environment..."
if [ -f ".env.example" ]; then
    cp .env.example .env
    
    # Set QA-specific configurations
    sed -i "s/NODE_ENV=.*/NODE_ENV=qa/" .env
    sed -i "s/ENVIRONMENT=.*/ENVIRONMENT=qa/" .env
fi

# =============================================================================
# Build and Start Services
# =============================================================================
log "Building and starting services..."

# Start infrastructure first
docker-compose up -d postgres mongo redis kafka zookeeper rabbitmq minio

# Wait for databases to be ready
log "Waiting for databases to be ready..."
sleep 30

# Start application services
docker-compose up -d

# =============================================================================
# Mark Installation Complete
# =============================================================================
log "Marking installation complete..."
echo "$(date '+%Y-%m-%d %H:%M:%S')" > $MARKER_FILE
echo "Branch: $GITHUB_BRANCH" >> $MARKER_FILE
echo "Commit: $(git rev-parse HEAD)" >> $MARKER_FILE

log "QA Bootstrap complete! Services should be available shortly."
log "Check status with: docker-compose ps"

#!/bin/bash

# ============================================================================
# SIMA PLATFORM - TITAN NODE SETUP SCRIPT
# ============================================================================
# This script sets up the Titan Node with all required services on EC2
# Usage: bash titan-setup.sh

set -e

echo "=========================================="
echo "SIMA Titan Node - Setup Script"
echo "=========================================="

ENVIRONMENT=${1:-"dev"}
KAFKA_BROKERS=${2:-"localhost:9092"}
RABBITMQ_HOST=${3:-"localhost"}
MQTT_BROKER=${4:-"localhost"}
MONGODB_PASSWORD=${5:-"mongodb123"}
REGISTRY_PASSWORD=${6:-"registry123"}

echo "[INFO] Starting Titan Node setup for environment: $ENVIRONMENT"
echo "[INFO] Kafka Brokers: $KAFKA_BROKERS"
echo "[INFO] RabbitMQ Host: $RABBITMQ_HOST"
echo "[INFO] MQTT Broker: $MQTT_BROKER"

# ============================================================================
# SYSTEM UPDATES
# ============================================================================

echo "[STEP 1] Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y curl wget git vim net-tools htop iotop unzip jq

# ============================================================================
# DOCKER INSTALLATION
# ============================================================================

echo "[STEP 2] Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  rm get-docker.sh
else
  echo "[INFO] Docker already installed"
fi

# ============================================================================
# DOCKER COMPOSE INSTALLATION
# ============================================================================

echo "[STEP 3] Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
else
  echo "[INFO] Docker Compose already installed"
fi

# ============================================================================
# NODE.JS INSTALLATION
# ============================================================================

echo "[STEP 4] Installing Node.js..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "[INFO] Node.js already installed"
fi

# ============================================================================
# MONITORING AGENT INSTALLATION
# ============================================================================

echo "[STEP 5] Installing CloudWatch Agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb

# ============================================================================
# CREATE APPLICATION DIRECTORIES
# ============================================================================

echo "[STEP 6] Creating application directories..."
sudo mkdir -p /opt/sima/{services,config,logs,backups}
sudo chown -R $USER:$USER /opt/sima
mkdir -p /opt/sima/services/{api-gateway,auth-service,users-service,assets-service,audit-service,iot-service,notifications-service,reports-service,storage-service}

# ============================================================================
# CREATE ENVIRONMENT FILES
# ============================================================================

echo "[STEP 7] Creating environment configuration..."
cat > /opt/sima/config/.env.production << EOF
NODE_ENV=production
ENVIRONMENT=$ENVIRONMENT

# Server
API_GATEWAY_PORT=3000
API_GATEWAY_HOST=0.0.0.0

# Database
DATABASE_HOST=<RDS_ENDPOINT>
DATABASE_PORT=5432
DATABASE_NAME=sima_db
DATABASE_USER=simaadmin
DATABASE_PASSWORD=<RDS_PASSWORD>

MONGODB_URI=mongodb://<MONGODB_HOST>:27017/sima
MONGODB_USER=admin
MONGODB_PASSWORD=$MONGODB_PASSWORD

REDIS_HOST=<REDIS_HOST>
REDIS_PORT=6379
REDIS_PASSWORD=<REDIS_PASSWORD>

# Message Brokers
KAFKA_BROKERS=$KAFKA_BROKERS
RABBITMQ_URI=amqp://guest:guest@$RABBITMQ_HOST:5672
MQTT_BROKER=mqtt://$MQTT_BROKER:1883

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRATION=86400

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE_PATH=/opt/sima/logs

# Backup
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_STORAGE_PATH=/opt/sima/backups

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=sima-storage-$ENVIRONMENT
EOF

echo "[SUCCESS] Environment file created at /opt/sima/config/.env.production"

# ============================================================================
# INSTALL NODE MODULES
# ============================================================================

echo "[STEP 8] Installing Node dependencies..."
npm install -g pm2 pm2-logrotate pm2-auto-pull
pm2 install pm2-auto-pull

# ============================================================================
# SETUP PM2 ECOSYSTEM FILE
# ============================================================================

echo "[STEP 9] Setting up PM2 process management..."
cat > /opt/sima/ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: './dist/apps/api-gateway/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/opt/sima/logs/api-gateway-error.log',
      out_file: '/opt/sima/logs/api-gateway-out.log',
      log_file: '/opt/sima/logs/api-gateway-combined.log',
      time: true,
      merge_logs: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
EOFPM2

# ============================================================================
# SETUP LOGROTATE
# ============================================================================

echo "[STEP 10] Setting up log rotation..."
sudo tee /etc/logrotate.d/sima > /dev/null << EOF
/opt/sima/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 $USER $USER
    sharedscripts
    postrotate
        pm2 reload all > /dev/null
    endscript
}
EOF

# ============================================================================
# CREATE HEALTH CHECK SCRIPT
# ============================================================================

echo "[STEP 11] Creating health check script..."
cat > /opt/sima/health-check.sh << 'EOFHEALTH'
#!/bin/bash

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting health checks..."

SERVICES=("api-gateway" "auth-service" "users-service")
UNHEALTHY=0

for service in "${SERVICES[@]}"; do
  if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "[✓] $service is healthy"
  else
    echo "[✗] $service is unhealthy"
    UNHEALTHY=$((UNHEALTHY + 1))
  fi
done

if [ $UNHEALTHY -gt 0 ]; then
  echo "[ERROR] $UNHEALTHY services are unhealthy"
  exit 1
fi

echo "[SUCCESS] All services are healthy"
exit 0
EOFHEALTH

chmod +x /opt/sima/health-check.sh

# ============================================================================
# SETUP CRON JOBS
# ============================================================================

echo "[STEP 12] Setting up automated tasks..."

# Backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/sima/backup.sh") | crontab -

# Health check cron job
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/sima/health-check.sh") | crontab -

# ============================================================================
# SETUP NGINX REVERSE PROXY (OPTIONAL)
# ============================================================================

echo "[STEP 13] Setting up Nginx reverse proxy..."
sudo apt-get install -y nginx

sudo tee /etc/nginx/sites-available/sima > /dev/null << 'EOFNGINX'
upstream sima_backend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
    keepalive 64;
}

server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://sima_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
    }
}
EOFNGINX

sudo ln -sf /etc/nginx/sites-available/sima /etc/nginx/sites-enabled/sima
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# ============================================================================
# SETUP FIREWALL
# ============================================================================

echo "[STEP 14] Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable

# ============================================================================
# CREATE BACKUP SCRIPT
# ============================================================================

echo "[STEP 15] Creating backup script..."
cat > /opt/sima/backup.sh << 'EOFBACKUP'
#!/bin/bash

BACKUP_DIR="/opt/sima/backups"
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
MAX_BACKUPS=30

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Starting backup..."

mkdir -p $BACKUP_DIR

tar -czf $BACKUP_FILE \
  /opt/sima/logs \
  /opt/sima/config

# Upload to AWS S3
aws s3 cp $BACKUP_FILE s3://sima-backups-production/

# Cleanup old backups
find $BACKUP_DIR -name "backup-*.tar.gz" -type f -printf '%T+ %p\n' | sort -r | tail -n +$((MAX_BACKUPS + 1)) | cut -d' ' -f2 | xargs -r rm

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Backup completed: $BACKUP_FILE"
EOFBACKUP

chmod +x /opt/sima/backup.sh

# ============================================================================
# COMPLETION
# ============================================================================

echo ""
echo "=========================================="
echo "Titan Node Setup Completed Successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Deploy application containers"
echo "2. Configure environment variables"
echo "3. Start services with: pm2 start /opt/sima/ecosystem.config.js"
echo "4. Monitor with: pm2 monit"
echo ""
echo "Services will be available at:"
echo "- API Gateway: http://localhost:3000"
echo "- Health Check: http://localhost:3000/health"
echo ""

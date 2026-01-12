#!/bin/bash
# SIMA Platform - Database Backup Script
# Requirement #19: On-premise backup

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
POSTGRES_CONTAINER="sima-postgres"
MONGO_CONTAINER="sima-mongo"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🗄️ SIMA Backup Script${NC}"
echo "Date: $DATE"
echo "-------------------"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# PostgreSQL Backup
echo -e "${YELLOW}📦 Backing up PostgreSQL...${NC}"
docker exec $POSTGRES_CONTAINER pg_dump -U ${POSTGRES_USER:-sima} ${POSTGRES_DB:-sima_core} > "$BACKUP_DIR/postgres_$DATE.sql"
gzip "$BACKUP_DIR/postgres_$DATE.sql"
echo "✅ PostgreSQL backup: postgres_$DATE.sql.gz"

# MongoDB Backup
echo -e "${YELLOW}📦 Backing up MongoDB...${NC}"
docker exec $MONGO_CONTAINER mongodump --archive --gzip --db=sima > "$BACKUP_DIR/mongo_$DATE.archive.gz"
echo "✅ MongoDB backup: mongo_$DATE.archive.gz"

# Redis Backup (RDB dump)
echo -e "${YELLOW}📦 Backing up Redis...${NC}"
docker exec sima-redis redis-cli BGSAVE
sleep 2
docker cp sima-redis:/data/dump.rdb "$BACKUP_DIR/redis_$DATE.rdb" 2>/dev/null || echo "⚠️ Redis backup skipped (no data)"

# List backups
echo ""
echo -e "${GREEN}📋 Backups created:${NC}"
ls -lh "$BACKUP_DIR"/*$DATE* 2>/dev/null || echo "No backups found"

# Cleanup old backups (keep last 7 days)
echo ""
echo -e "${YELLOW}🧹 Cleaning old backups (>7 days)...${NC}"
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "*.rdb" -mtime +7 -delete 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Backup completed successfully!${NC}"

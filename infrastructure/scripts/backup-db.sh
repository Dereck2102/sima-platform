#!/bin/bash
# =============================================================================
# SIMA Platform - Database Backup Script
# Creates backups of PostgreSQL and MongoDB databases
# =============================================================================

set -e

# Configuration
ENV=${1:-qa}
BACKUP_DIR="/tmp/sima-backups"
DATE=$(date +%Y%m%d_%H%M%S)
REGION=${AWS_REGION:-us-east-1}

echo "📦 Starting SIMA Platform Database Backup ($ENV)"
echo "   Date: $DATE"
echo ""

# Create backup directory
mkdir -p $BACKUP_DIR

# =============================================================================
# PostgreSQL Backup
# =============================================================================
backup_postgres() {
  echo "🐘 Backing up PostgreSQL..."
  
  # Get RDS endpoint
  RDS_ID="sima-$ENV-postgres"
  RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier $RDS_ID \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text --region $REGION 2>/dev/null || echo "")
  
  if [ -z "$RDS_ENDPOINT" ] || [ "$RDS_ENDPOINT" == "None" ]; then
    echo "   ⚠️  RDS not found in AWS, trying local Docker..."
    
    # Local Docker backup
    if docker ps | grep -q sima-postgres; then
      docker exec sima-postgres pg_dump -U ${POSTGRES_USER:-sima} \
        ${POSTGRES_DB:-sima_core} > $BACKUP_DIR/postgres_${ENV}_${DATE}.sql
      
      if [ -f "$BACKUP_DIR/postgres_${ENV}_${DATE}.sql" ]; then
        gzip $BACKUP_DIR/postgres_${ENV}_${DATE}.sql
        echo "   ✅ PostgreSQL backup: postgres_${ENV}_${DATE}.sql.gz"
      fi
    else
      echo "   ❌ PostgreSQL container not running"
      return 1
    fi
  else
    echo "   RDS Endpoint: $RDS_ENDPOINT"
    
    # AWS RDS backup (requires pg_dump on the machine)
    PGPASSWORD=$DB_PASSWORD pg_dump \
      -h $RDS_ENDPOINT \
      -U ${DB_USERNAME:-sima_admin} \
      -d ${DB_NAME:-sima_qa} \
      -F c \
      -f $BACKUP_DIR/postgres_${ENV}_${DATE}.dump 2>/dev/null || {
        echo "   ⚠️  pg_dump not available, creating RDS snapshot instead..."
        aws rds create-db-snapshot \
          --db-instance-identifier $RDS_ID \
          --db-snapshot-identifier "sima-$ENV-backup-$DATE" \
          --region $REGION
        echo "   ✅ RDS snapshot created: sima-$ENV-backup-$DATE"
        return 0
      }
    
    gzip $BACKUP_DIR/postgres_${ENV}_${DATE}.dump
    echo "   ✅ PostgreSQL backup: postgres_${ENV}_${DATE}.dump.gz"
  fi
}

# =============================================================================
# MongoDB Backup
# =============================================================================
backup_mongodb() {
  echo "🍃 Backing up MongoDB..."
  
  # Local Docker backup
  if docker ps | grep -q sima-mongo; then
    docker exec sima-mongo mongodump \
      --username ${MONGO_USER:-root} \
      --password ${MONGO_PASSWORD:-password} \
      --authenticationDatabase admin \
      --out /tmp/mongodump
    
    # Copy from container
    docker cp sima-mongo:/tmp/mongodump $BACKUP_DIR/mongodb_${ENV}_${DATE}
    
    # Compress
    tar -czf $BACKUP_DIR/mongodb_${ENV}_${DATE}.tar.gz \
      -C $BACKUP_DIR mongodb_${ENV}_${DATE}
    rm -rf $BACKUP_DIR/mongodb_${ENV}_${DATE}
    
    # Cleanup in container
    docker exec sima-mongo rm -rf /tmp/mongodump
    
    echo "   ✅ MongoDB backup: mongodb_${ENV}_${DATE}.tar.gz"
  else
    echo "   ⚠️  MongoDB container not running"
    return 1
  fi
}

# =============================================================================
# Upload to S3 (optional)
# =============================================================================
upload_to_s3() {
  BUCKET="sima-backups-$ENV"
  
  # Check if bucket exists
  if aws s3 ls "s3://$BUCKET" 2>/dev/null; then
    echo "☁️  Uploading to S3..."
    
    for file in $BACKUP_DIR/*.gz $BACKUP_DIR/*.tar.gz; do
      if [ -f "$file" ]; then
        aws s3 cp $file "s3://$BUCKET/$(basename $file)" --region $REGION
        echo "   ✅ Uploaded: $(basename $file)"
      fi
    done
  else
    echo "   ⚠️  S3 bucket $BUCKET not found, keeping local backups only"
  fi
}

# =============================================================================
# Cleanup Old Backups (keep last 7 days)
# =============================================================================
cleanup_old_backups() {
  echo "🧹 Cleaning up old backups..."
  find $BACKUP_DIR -name "*.gz" -mtime +7 -delete 2>/dev/null || true
  find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
  echo "   ✅ Old backups cleaned"
}

# =============================================================================
# Main
# =============================================================================

backup_postgres
backup_mongodb

# Uncomment to enable S3 upload
# upload_to_s3

cleanup_old_backups

echo ""
echo "============================================="
echo "📊 Backup Summary"
echo "============================================="
echo "   Environment: $ENV"
echo "   Backup Dir:  $BACKUP_DIR"
echo "   Files:"
ls -lh $BACKUP_DIR/*.gz 2>/dev/null || echo "   (no backups created)"
ls -lh $BACKUP_DIR/*.tar.gz 2>/dev/null || true
echo "============================================="
echo ""
echo "✅ Backup complete!"

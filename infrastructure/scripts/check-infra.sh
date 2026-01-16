#!/bin/bash
# =============================================================================
# SIMA Platform - Infrastructure Check Script
# Verifies existing infrastructure before deployment (idempotent)
# =============================================================================

set -e

ENV=${1:-qa}
REGION=${AWS_REGION:-us-east-1}
PROJECT="sima"

echo "🔍 Checking existing infrastructure for $ENV environment..."
echo "   Region: $REGION"
echo ""

# =============================================================================
# VPC Check
# =============================================================================
echo "📦 Checking VPC..."
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=tag:Project,Values=SIMA Platform" "Name=tag:Environment,Values=$ENV" \
  --query 'Vpcs[0].VpcId' --output text --region $REGION 2>/dev/null || echo "None")

if [ "$VPC_ID" != "None" ] && [ -n "$VPC_ID" ]; then
  echo "   ✅ VPC exists: $VPC_ID"
  echo "VPC_EXISTS=true" >> $GITHUB_ENV 2>/dev/null || true
  echo "VPC_ID=$VPC_ID" >> $GITHUB_ENV 2>/dev/null || true
else
  echo "   ❌ VPC not found. Will be created by Terraform."
  echo "VPC_EXISTS=false" >> $GITHUB_ENV 2>/dev/null || true
fi

# =============================================================================
# ASG Check
# =============================================================================
echo "📦 Checking Auto Scaling Group..."
ASG_NAME="$PROJECT-$ENV-asg"
ASG_EXISTS=$(aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names $ASG_NAME \
  --query 'AutoScalingGroups[0].AutoScalingGroupName' --output text --region $REGION 2>/dev/null || echo "None")

if [ "$ASG_EXISTS" != "None" ] && [ -n "$ASG_EXISTS" ]; then
  CURRENT_CAPACITY=$(aws autoscaling describe-auto-scaling-groups \
    --auto-scaling-group-names $ASG_NAME \
    --query 'AutoScalingGroups[0].DesiredCapacity' --output text --region $REGION)
  echo "   ✅ ASG exists: $ASG_NAME (Capacity: $CURRENT_CAPACITY)"
  echo "ASG_EXISTS=true" >> $GITHUB_ENV 2>/dev/null || true
else
  echo "   ❌ ASG not found. Will be created by Terraform."
  echo "ASG_EXISTS=false" >> $GITHUB_ENV 2>/dev/null || true
fi

# =============================================================================
# ALB Check
# =============================================================================
echo "📦 Checking Application Load Balancer..."
ALB_NAME="$PROJECT-$ENV-alb"
ALB_ARN=$(aws elbv2 describe-load-balancers \
  --names $ALB_NAME \
  --query 'LoadBalancers[0].LoadBalancerArn' --output text --region $REGION 2>/dev/null || echo "None")

if [ "$ALB_ARN" != "None" ] && [ -n "$ALB_ARN" ]; then
  ALB_DNS=$(aws elbv2 describe-load-balancers \
    --names $ALB_NAME \
    --query 'LoadBalancers[0].DNSName' --output text --region $REGION)
  echo "   ✅ ALB exists: $ALB_NAME"
  echo "      DNS: $ALB_DNS"
  echo "ALB_EXISTS=true" >> $GITHUB_ENV 2>/dev/null || true
  echo "ALB_DNS=$ALB_DNS" >> $GITHUB_ENV 2>/dev/null || true
else
  echo "   ❌ ALB not found. Will be created by Terraform."
  echo "ALB_EXISTS=false" >> $GITHUB_ENV 2>/dev/null || true
fi

# =============================================================================
# RDS Check
# =============================================================================
echo "📦 Checking RDS Database..."
RDS_ID="$PROJECT-$ENV-postgres"
RDS_STATUS=$(aws rds describe-db-instances \
  --db-instance-identifier $RDS_ID \
  --query 'DBInstances[0].DBInstanceStatus' --output text --region $REGION 2>/dev/null || echo "None")

if [ "$RDS_STATUS" != "None" ]; then
  echo "   ✅ RDS exists: $RDS_ID (Status: $RDS_STATUS)"
  
  if [ "$RDS_STATUS" == "stopped" ]; then
    echo "   ⚠️  RDS is stopped. Starting..."
    aws rds start-db-instance --db-instance-identifier $RDS_ID --region $REGION
    echo "   🔄 Start command sent. RDS will be available in ~5 minutes."
  fi
  
  RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier $RDS_ID \
    --query 'DBInstances[0].Endpoint.Address' --output text --region $REGION)
  echo "      Endpoint: $RDS_ENDPOINT"
  echo "RDS_EXISTS=true" >> $GITHUB_ENV 2>/dev/null || true
  echo "RDS_ENDPOINT=$RDS_ENDPOINT" >> $GITHUB_ENV 2>/dev/null || true
else
  echo "   ❌ RDS not found. Will be created by Terraform."
  echo "RDS_EXISTS=false" >> $GITHUB_ENV 2>/dev/null || true
fi

# =============================================================================
# ElastiCache Check
# =============================================================================
echo "📦 Checking ElastiCache Redis..."
REDIS_ID="$PROJECT-$ENV-redis"
REDIS_STATUS=$(aws elasticache describe-cache-clusters \
  --cache-cluster-id $REDIS_ID \
  --query 'CacheClusters[0].CacheClusterStatus' --output text --region $REGION 2>/dev/null || echo "None")

if [ "$REDIS_STATUS" != "None" ]; then
  echo "   ✅ ElastiCache exists: $REDIS_ID (Status: $REDIS_STATUS)"
  echo "REDIS_EXISTS=true" >> $GITHUB_ENV 2>/dev/null || true
else
  echo "   ❌ ElastiCache not found. Will be created by Terraform."
  echo "REDIS_EXISTS=false" >> $GITHUB_ENV 2>/dev/null || true
fi

# =============================================================================
# EC2 Instances Check
# =============================================================================
echo "📦 Checking EC2 Instances..."
INSTANCE_COUNT=$(aws ec2 describe-instances \
  --filters "Name=tag:Project,Values=SIMA Platform" "Name=tag:Environment,Values=$ENV" "Name=instance-state-name,Values=running" \
  --query 'Reservations[*].Instances[*].InstanceId' --output text --region $REGION 2>/dev/null | wc -w || echo "0")

echo "   📊 Running instances: $INSTANCE_COUNT"
echo "INSTANCE_COUNT=$INSTANCE_COUNT" >> $GITHUB_ENV 2>/dev/null || true

# =============================================================================
# Budget Check (AWS Academy warning)
# =============================================================================
echo ""
echo "💰 AWS Academy Budget Reminder:"
echo "   ⚠️  Budget: \$50 per account"
echo "   ⚠️  Budget updates every 8-12 hours"
echo "   ⚠️  If exceeded, account will be disabled!"
echo ""

# =============================================================================
# Summary
# =============================================================================
echo "============================================="
echo "📊 Infrastructure Audit Summary for $ENV"
echo "============================================="
echo "   VPC:         $([ "$VPC_ID" != "None" ] && echo '✅ Exists' || echo '❌ Missing')"
echo "   ASG:         $([ "$ASG_EXISTS" != "None" ] && echo '✅ Exists' || echo '❌ Missing')"
echo "   ALB:         $([ "$ALB_ARN" != "None" ] && echo '✅ Exists' || echo '❌ Missing')"
echo "   RDS:         $([ "$RDS_STATUS" != "None" ] && echo '✅ Exists' || echo '❌ Missing')"
echo "   ElastiCache: $([ "$REDIS_STATUS" != "None" ] && echo '✅ Exists' || echo '❌ Missing')"
echo "   EC2 Count:   $INSTANCE_COUNT"
echo "============================================="
echo ""
echo "✅ Infrastructure check complete!"

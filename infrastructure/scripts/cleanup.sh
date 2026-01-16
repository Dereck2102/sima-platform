#!/bin/bash
# =============================================================================
# SIMA Platform - Cleanup Script
# Destroys all infrastructure for an environment (use with caution!)
# =============================================================================

set -e

ENV=${1:-qa}
REGION=${AWS_REGION:-us-east-1}
PROJECT="sima"

echo "⚠️  SIMA Platform - Infrastructure Cleanup"
echo "   Environment: $ENV"
echo "   Region: $REGION"
echo ""

# Safety check
if [ "$ENV" == "prod" ]; then
  echo "❌ PRODUCTION cleanup requires explicit confirmation!"
  echo "   Set CONFIRM_PROD_DESTROY=yes to proceed"
  if [ "$CONFIRM_PROD_DESTROY" != "yes" ]; then
    exit 1
  fi
fi

# Confirmation
if [ "$FORCE" != "yes" ]; then
  echo "⚠️  This will DESTROY all infrastructure in $ENV environment!"
  echo "   - VPC and all subnets"
  echo "   - EC2 instances"
  echo "   - RDS database (DATA WILL BE LOST)"
  echo "   - ElastiCache cluster"
  echo "   - Load Balancer"
  echo ""
  read -p "Are you sure? Type 'destroy' to confirm: " CONFIRM
  if [ "$CONFIRM" != "destroy" ]; then
    echo "Aborted."
    exit 0
  fi
fi

echo ""
echo "🔨 Starting cleanup..."
echo ""

# =============================================================================
# Option 1: Use Terraform (recommended)
# =============================================================================
if [ -f "infrastructure/terraform/environments/$ENV/main.tf" ]; then
  echo "📦 Using Terraform to destroy infrastructure..."
  cd "infrastructure/terraform/environments/$ENV"
  
  terraform init
  terraform destroy -auto-approve
  
  echo "✅ Terraform destroy complete"
else
  echo "⚠️  Terraform files not found, using AWS CLI..."
  
  # =============================================================================
  # Option 2: Manual cleanup via AWS CLI
  # =============================================================================
  
  # Delete ASG
  echo "📦 Deleting Auto Scaling Group..."
  ASG_NAME="$PROJECT-$ENV-asg"
  aws autoscaling delete-auto-scaling-group \
    --auto-scaling-group-name $ASG_NAME \
    --force-delete \
    --region $REGION 2>/dev/null || echo "   ASG not found or already deleted"
  
  # Delete Launch Template
  echo "📦 Deleting Launch Template..."
  LT_NAME="$PROJECT-$ENV-lt"
  aws ec2 delete-launch-template \
    --launch-template-name $LT_NAME \
    --region $REGION 2>/dev/null || echo "   Launch Template not found"
  
  # Delete ALB
  echo "📦 Deleting Load Balancer..."
  ALB_NAME="$PROJECT-$ENV-alb"
  ALB_ARN=$(aws elbv2 describe-load-balancers \
    --names $ALB_NAME \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text \
    --region $REGION 2>/dev/null || echo "")
  
  if [ -n "$ALB_ARN" ] && [ "$ALB_ARN" != "None" ]; then
    aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN --region $REGION
    echo "   ALB deleted"
  fi
  
  # Delete Target Groups
  echo "📦 Deleting Target Groups..."
  TG_ARNS=$(aws elbv2 describe-target-groups \
    --query "TargetGroups[?contains(TargetGroupName, '$PROJECT-$ENV')].TargetGroupArn" \
    --output text \
    --region $REGION 2>/dev/null || echo "")
  
  for TG_ARN in $TG_ARNS; do
    aws elbv2 delete-target-group --target-group-arn $TG_ARN --region $REGION 2>/dev/null || true
  done
  
  # Delete RDS (careful - data loss!)
  echo "📦 Deleting RDS Instance..."
  RDS_ID="$PROJECT-$ENV-postgres"
  aws rds delete-db-instance \
    --db-instance-identifier $RDS_ID \
    --skip-final-snapshot \
    --delete-automated-backups \
    --region $REGION 2>/dev/null || echo "   RDS not found or already deleted"
  
  # Delete ElastiCache
  echo "📦 Deleting ElastiCache Cluster..."
  REDIS_ID="$PROJECT-$ENV-redis"
  aws elasticache delete-cache-cluster \
    --cache-cluster-id $REDIS_ID \
    --region $REGION 2>/dev/null || echo "   ElastiCache not found or already deleted"
  
  echo ""
  echo "⚠️  Some resources may take time to fully delete."
  echo "   VPC and subnets must be deleted manually after dependencies are removed."
fi

echo ""
echo "============================================="
echo "🧹 Cleanup Summary"
echo "============================================="
echo "   Environment: $ENV"
echo "   Status:      Cleanup initiated"
echo "============================================="
echo ""
echo "✅ Cleanup complete!"
echo ""
echo "💡 To verify all resources are deleted:"
echo "   ./check-infra.sh $ENV"

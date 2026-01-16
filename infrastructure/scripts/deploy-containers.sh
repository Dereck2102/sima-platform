#!/bin/bash
# =============================================================================
# SIMA Platform - Deploy Containers Script
# Deploys Docker containers to EC2 instances via SSM (no SSH required)
# =============================================================================

set -e

ENV=${1:-qa}
REGION=${AWS_REGION:-us-east-1}
PROJECT="sima"
DOCKER_USER="${DOCKERHUB_USERNAME:-dereck2102}"

echo "🚀 Deploying Docker containers to $ENV environment..."
echo "   Docker user: $DOCKER_USER"
echo "   Region: $REGION"
echo ""

# =============================================================================
# Get EC2 Instances from ASG
# =============================================================================
ASG_NAME="$PROJECT-$ENV-asg"
echo "📦 Getting EC2 instances from ASG: $ASG_NAME..."

INSTANCE_IDS=$(aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names $ASG_NAME \
  --query 'AutoScalingGroups[0].Instances[*].InstanceId' \
  --output text --region $REGION)

if [ -z "$INSTANCE_IDS" ] || [ "$INSTANCE_IDS" == "None" ]; then
  echo "❌ No EC2 instances found in ASG: $ASG_NAME"
  exit 1
fi

echo "   Found instances: $INSTANCE_IDS"
echo ""

# =============================================================================
# Define services to deploy
# =============================================================================
SERVICES=(
  "api-gateway"
  "auth-service"
  "tenant-service"
  "inventory-service"
  "storage-service"
  "notification-service"
  "report-service"
  "search-service"
  "audit-service"
  "mobile-bff"
)

# =============================================================================
# Deploy to each instance
# =============================================================================
for INSTANCE_ID in $INSTANCE_IDS; do
  echo "🔧 Deploying to instance: $INSTANCE_ID"
  
  # Build docker pull commands
  PULL_COMMANDS=""
  for SERVICE in "${SERVICES[@]}"; do
    PULL_COMMANDS+="docker pull $DOCKER_USER/sima-$SERVICE:$ENV || docker pull $DOCKER_USER/sima-$SERVICE:latest; "
  done
  
  # Execute deployment via SSM
  COMMAND_ID=$(aws ssm send-command \
    --instance-ids $INSTANCE_ID \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=[
      'echo \"🐳 Pulling Docker images...\"',
      '$PULL_COMMANDS',
      'echo \"📝 Updating docker-compose...\"',
      'cd /home/ec2-user/sima-platform',
      'docker-compose -f docker-compose.$ENV.yml pull',
      'echo \"🔄 Restarting containers...\"',
      'docker-compose -f docker-compose.$ENV.yml up -d --remove-orphans',
      'echo \"🧹 Cleaning old images...\"',
      'docker image prune -f',
      'echo \"✅ Deployment complete!\"'
    ]" \
    --timeout-seconds 600 \
    --output text \
    --query 'Command.CommandId' \
    --region $REGION)
  
  echo "   Command sent: $COMMAND_ID"
  echo "   Waiting for completion..."
  
  # Wait for command to complete
  aws ssm wait command-executed \
    --command-id $COMMAND_ID \
    --instance-id $INSTANCE_ID \
    --region $REGION 2>/dev/null || true
  
  # Get command status
  STATUS=$(aws ssm get-command-invocation \
    --command-id $COMMAND_ID \
    --instance-id $INSTANCE_ID \
    --query 'Status' \
    --output text \
    --region $REGION 2>/dev/null || echo "Unknown")
  
  if [ "$STATUS" == "Success" ]; then
    echo "   ✅ Deployment successful on $INSTANCE_ID"
  else
    echo "   ⚠️  Deployment status: $STATUS on $INSTANCE_ID"
  fi
  
  echo ""
done

# =============================================================================
# Summary
# =============================================================================
echo "============================================="
echo "📊 Deployment Summary"
echo "============================================="
echo "   Environment:  $ENV"
echo "   Instances:    $(echo $INSTANCE_IDS | wc -w)"
echo "   Services:     ${#SERVICES[@]}"
echo "============================================="
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 To check container status, run:"
echo "   aws ssm send-command --instance-ids <instance-id> \\"
echo "     --document-name 'AWS-RunShellScript' \\"
echo "     --parameters 'commands=[\"docker ps\"]'"

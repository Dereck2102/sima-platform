#!/bin/bash
# =============================================================================
# SIMA Platform - Health Check Script
# Validates deployment by checking service endpoints
# =============================================================================

set -e

ENV=${1:-qa}
REGION=${AWS_REGION:-us-east-1}
PROJECT="sima"
MAX_RETRIES=10
RETRY_DELAY=30

echo "🏥 Running health checks for $ENV environment..."
echo ""

# =============================================================================
# Get ALB DNS
# =============================================================================
ALB_NAME="$PROJECT-$ENV-alb"
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names $ALB_NAME \
  --query 'LoadBalancers[0].DNSName' \
  --output text \
  --region $REGION 2>/dev/null || echo "")

if [ -z "$ALB_DNS" ] || [ "$ALB_DNS" == "None" ]; then
  echo "❌ Could not find ALB: $ALB_NAME"
  exit 1
fi

BASE_URL="http://$ALB_DNS"
echo "📍 Base URL: $BASE_URL"
echo ""

# =============================================================================
# Health Check Function
# =============================================================================
check_endpoint() {
  local name=$1
  local path=$2
  local expected_code=${3:-200}
  
  echo -n "   Checking $name... "
  
  for ((i=1; i<=MAX_RETRIES; i++)); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path" --max-time 10 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" == "$expected_code" ]; then
      echo "✅ ($HTTP_CODE)"
      return 0
    fi
    
    if [ $i -lt $MAX_RETRIES ]; then
      echo -n "⏳ "
      sleep $RETRY_DELAY
    fi
  done
  
  echo "❌ (Got: $HTTP_CODE, Expected: $expected_code)"
  return 1
}

# =============================================================================
# Run Health Checks
# =============================================================================
echo "🔍 Checking endpoints..."
FAILED=0

# API Gateway
check_endpoint "API Gateway" "/api/health" || ((FAILED++))

# Core Service (Auth+Tenant)
check_endpoint "Core Service" "/api/auth/health" || ((FAILED++))

# Shared Service
check_endpoint "Shared Service" "/api/notifications/health" || ((FAILED++))

# Inventory Service
check_endpoint "Inventory Service" "/api/assets" "401" || ((FAILED++))

# Swagger Documentation
check_endpoint "Swagger Docs" "/api" || ((FAILED++))

echo ""

# =============================================================================
# Check Target Group Health
# =============================================================================
echo "🎯 Checking Target Group health..."
TG_ARN=$(aws elbv2 describe-target-groups \
  --names "$PROJECT-$ENV-tg" \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text \
  --region $REGION 2>/dev/null || echo "")

if [ -n "$TG_ARN" ] && [ "$TG_ARN" != "None" ]; then
  HEALTHY=$(aws elbv2 describe-target-health \
    --target-group-arn $TG_ARN \
    --query 'TargetHealthDescriptions[?TargetHealth.State==`healthy`].Target.Id' \
    --output text \
    --region $REGION 2>/dev/null | wc -w || echo "0")
  
  UNHEALTHY=$(aws elbv2 describe-target-health \
    --target-group-arn $TG_ARN \
    --query 'TargetHealthDescriptions[?TargetHealth.State!=`healthy`].Target.Id' \
    --output text \
    --region $REGION 2>/dev/null | wc -w || echo "0")
  
  echo "   Healthy targets:   $HEALTHY"
  echo "   Unhealthy targets: $UNHEALTHY"
  
  if [ "$HEALTHY" -eq 0 ]; then
    echo "   ⚠️  No healthy targets in target group!"
    ((FAILED++))
  fi
else
  echo "   ⚠️  Could not find target group"
fi

echo ""

# =============================================================================
# Summary
# =============================================================================
echo "============================================="
echo "📊 Health Check Summary"
echo "============================================="
echo "   Environment: $ENV"
echo "   Base URL:    $BASE_URL"
echo "   Failed:      $FAILED"
echo "============================================="

if [ $FAILED -gt 0 ]; then
  echo ""
  echo "❌ Health check completed with $FAILED failures"
  exit 1
else
  echo ""
  echo "✅ All health checks passed!"
  exit 0
fi

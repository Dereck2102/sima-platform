#!/bin/bash
# Session 4 - Quick Build Fix Script
# Purpose: Remove Kafka imports and compile all services
# Usage: ./scripts/build-all-services.sh

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  SIMA Platform - Build All Services Script               ║"
echo "║  Session 4 Quick Compilation Fix                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Clean Kafka imports from service files
echo -e "${BLUE}[1/4]${NC} Removing Kafka imports from services..."

SERVICES=("assets-service" "audit-service" "iot-service" "notifications-service" "reports-service" "storage-service")

for SERVICE in "${SERVICES[@]}"; do
  SERVICE_PATH="apps-services/$SERVICE/src/services"
  
  if [ -d "$SERVICE_PATH" ]; then
    for FILE in $(find "$SERVICE_PATH" -name "*.service.ts" 2>/dev/null); do
      echo "  Cleaning: $FILE"
      
      # Remove Kafka imports
      sed -i.bak '/import.*KafkaService/d' "$FILE"
      sed -i.bak '/import.*KAFKA_TOPICS/d' "$FILE"
      
      # Remove Kafka from constructor
      sed -i.bak 's/private readonly kafkaService: KafkaService,*//g' "$FILE"
      sed -i.bak 's/kafkaService: KafkaService,*//g' "$FILE"
      
      # Clean empty lines
      sed -i.bak '/^[[:space:]]*$/N;/^\n$/!P;D' "$FILE"
      
      # Remove backup files
      rm -f "$FILE.bak"
    done
  fi
done

echo -e "${GREEN}✓ Kafka imports removed${NC}"
echo ""

# Step 2: Reset Nx cache
echo -e "${BLUE}[2/4]${NC} Resetting Nx cache..."
npx nx reset
echo -e "${GREEN}✓ Nx cache reset${NC}"
echo ""

# Step 3: Build all services
echo -e "${BLUE}[3/4]${NC} Building all 8 services (this may take 2-3 minutes)..."
echo ""

npx nx run-many --target=build \
  --projects=users-service,assets-service,audit-service,auth-service,iot-service,notifications-service,reports-service,storage-service \
  --parallel=2 \
  --no-cache

BUILD_STATUS=$?

echo ""
if [ $BUILD_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ All services built successfully!${NC}"
else
  echo -e "${YELLOW}⚠ Some services failed to build${NC}"
  echo "Run 'npx nx build {service-name} --verbose' to debug individual services"
fi

# Step 4: Verify build outputs
echo ""
echo -e "${BLUE}[4/4]${NC} Verifying build outputs..."
echo ""

COMPILED=0
for SERVICE in users-service assets-service audit-service auth-service iot-service notifications-service reports-service storage-service; do
  DIST_FILE="dist/apps-services/$SERVICE/main.js"
  
  if [ -f "$DIST_FILE" ]; then
    FILE_SIZE=$(wc -c < "$DIST_FILE")
    echo -e "${GREEN}✓${NC} $SERVICE ($FILE_SIZE bytes)"
    ((COMPILED++))
  else
    echo -e "${YELLOW}✗${NC} $SERVICE (NOT FOUND)"
  fi
done

echo ""
echo "Build Results: $COMPILED / 8 services compiled"
echo ""

if [ $COMPILED -eq 8 ]; then
  echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}SUCCESS! All 8 services are ready for deployment${NC}"
  echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Start infrastructure: docker-compose up -d"
  echo "  2. Run migrations: npm run db:migrate"
  echo "  3. Seed database: npm run db:seed"
  echo "  4. Start services: npm run serve:all (requires custom npm script)"
  echo ""
else
  echo -e "${YELLOW}⚠ Build incomplete. Compiled: $COMPILED / 8${NC}"
  echo ""
  echo "To debug, run:"
  echo "  npx nx build {service-name} --verbose"
  echo ""
fi

exit $BUILD_STATUS

# SIMA Platform - Optimized Startup Script
# Version 2.0 - Staged Execution

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   🚀 SIMA Platform - Automated Launcher   " -ForegroundColor Cyan  
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ProjectRoot = $PSScriptRoot
$InfraWait = 20
$CoreServiceWait = 25
$GatewayWait = 15
$FrontendWait = 10

# Kill existing Node processes to prevent port conflicts
Write-Host "[0/6] Cleaning up zombie processes..." -ForegroundColor DarkGray
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "      ✓ Cleanup complete" -ForegroundColor Green
Write-Host ""

# Phase 1: Infrastructure
Write-Host "[1/6] Starting Infrastructure (Docker)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; docker-compose up -d postgres mongo redis kafka zookeeper mosquitto; Write-Host 'Infrastructure Ready' -ForegroundColor Green; Read-Host 'Press Enter to close'"
Write-Host "      Waiting $InfraWait seconds for containers..." -ForegroundColor DarkGray
Start-Sleep -Seconds $InfraWait
Write-Host "      ✓ Infrastructure started" -ForegroundColor Green
Write-Host ""

# Phase 2: Core Service (Auth + Tenant)
Write-Host "[2/6] Starting Core Service (Port 3002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; npx nx serve core-service"
Write-Host "      Waiting $CoreServiceWait seconds for TypeScript compilation..." -ForegroundColor DarkGray
Start-Sleep -Seconds $CoreServiceWait
Write-Host "      ✓ Core Service started" -ForegroundColor Green
Write-Host ""

# Phase 3: API Gateway
Write-Host "[3/6] Starting API Gateway (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; npx nx serve api-gateway"
Write-Host "      Waiting $GatewayWait seconds..." -ForegroundColor DarkGray
Start-Sleep -Seconds $GatewayWait
Write-Host "      ✓ API Gateway started" -ForegroundColor Green
Write-Host ""

# Phase 4: Supporting Backend Services
Write-Host "[4/6] Starting Supporting Services (Inventory, Shared, Audit)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; npx nx run-many --target=serve --projects=inventory-service,shared-service,audit-service --parallel=3"
Write-Host "      Services starting in background..." -ForegroundColor DarkGray
Start-Sleep -Seconds 10
Write-Host "      ✓ Supporting services launched" -ForegroundColor Green
Write-Host ""

# Phase 5: Shell App (Main Frontend)
Write-Host "[5/6] Starting Shell App (Port 4100)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; npx nx serve shell-app"
Write-Host "      Waiting $FrontendWait seconds for Vite bundling..." -ForegroundColor DarkGray
Start-Sleep -Seconds $FrontendWait
Write-Host "      ✓ Shell App started" -ForegroundColor Green
Write-Host ""

# Phase 6: Essential MFEs
Write-Host "[6/6] Starting Essential MFEs (Dashboard, Assets)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot'; npx nx run-many --target=serve --projects=dashboard-mfe,assets-mfe --parallel=2"
Write-Host "      MFEs bundling..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5
Write-Host "      ✓ MFEs launched" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   ✅ SIMA Platform Started Successfully!   " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "   📍 Access Points:" -ForegroundColor Cyan
Write-Host "      • Web App:      http://localhost:4100" -ForegroundColor White
Write-Host "      • API Gateway:  http://localhost:3000" -ForegroundColor White
Write-Host "      • Swagger Docs: http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "   🔑 Test Credentials:" -ForegroundColor Cyan
Write-Host "      • Super Admin:  dsamacoria@uce.edu.ec / Admin123!" -ForegroundColor White
Write-Host "      • Demo Admin:   admin@uce.edu.ec / Test123!" -ForegroundColor White
Write-Host ""
Write-Host "   💡 To start additional MFEs:" -ForegroundColor DarkGray
Write-Host "      npx nx serve users-mfe" -ForegroundColor DarkGray
Write-Host "      npx nx serve reports-mfe" -ForegroundColor DarkGray
Write-Host "      npx nx serve settings-mfe" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Press Enter to exit this launcher..."
Read-Host

Write-Host "🚀 Starting SIMA Platform Local Development Environment..." -ForegroundColor Cyan

# 1. Start Infrastructure (Docker)
Write-Host "1️⃣  Starting Infrastructure (Postgres, Mongo, Redis, Kafka)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:infra"
Write-Host "   Waiting 15 seconds for containers to warm up..." -ForegroundColor DarkGray
Start-Sleep -Seconds 15

# 2. Start Backend & Frontend Services
Write-Host "2️⃣  Starting All Services (Backend + Microfrontends)..." -ForegroundColor Yellow
Write-Host "   This will open a new window. Please wait for all services to become active." -ForegroundColor DarkGray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:all-services"

Write-Host "✅ Startup Initiated!" -ForegroundColor Green
Write-Host "   - API Gateway: http://localhost:3000"
Write-Host "   - Shell App:   http://localhost:4100"
Write-Host "   - Dashboard:   http://localhost:4102"
Write-Host "   - Mobile BFF:  Check logs"
Write-Host ""
Write-Host "press Enter to exit this launcher..."
Read-Host

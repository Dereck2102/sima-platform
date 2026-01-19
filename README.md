# 🏢 SIMA Platform

**Sistema Integrado de Manejo de Activos** - Integrated Asset Management System

A cloud-native, multi-tenant SaaS platform for enterprise asset management built with microservices architecture.

[![CI Pipeline](https://github.com/Dereck2102/sima-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Dereck2102/sima-platform/actions/workflows/ci.yml)
[![Deploy QA](https://github.com/Dereck2102/sima-platform/actions/workflows/deploy-qa.yml/badge.svg)](https://github.com/Dereck2102/sima-platform/actions/workflows/deploy-qa.yml)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Monitoring](#-monitoring)

---

## ✨ Features

- **Multi-Tenant Architecture** - Complete tenant isolation with role-based access
- **Real-Time Tracking** - GPS-based asset geolocation with live updates
- **Microservices** - 12 independent, scalable backend services
- **Microfrontends** - Module Federation for dynamic UI composition
- **Multi-Protocol** - REST, WebSocket, gRPC, SOAP, MQTT support
- **Event-Driven** - Apache Kafka for asynchronous communication
- **Mobile Ready** - React Native app for iOS/Android
- **Automated Testing** - Load testing, unit tests, E2E tests with dashboard

---

## 🏗️ Architecture

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SIMA Platform                                │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend (Microfrontends)                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Shell App │ │Assets MFE│ │Dashboard │ │Users MFE │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│  API Gateway (NestJS) - Authentication, Routing, Rate Limiting      │
├─────────────────────────────────────────────────────────────────────┤
│  Microservices                                                       │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐                    │
│  │Core Service│  │Shared Srv  │  │Inventory Srv │                    │
│  │(Auth+Tent) │  │(Not+Rep+St)│  │(Asset+Search)│                    │
│  └────────────┘  └────────────┘  └──────────────┘                    │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐                    │
│  │ Audit Srv  │  │ Mobile BFF │  │ Geo Tracker  │                    │
│  └────────────┘  └────────────┘  └──────────────┘                    │
│  ┌────────────┐  ┌────────────┐                                      │
│  │ Analytics  │  │Testing Dash│                                      │
│  └────────────┘  └────────────┘                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Infrastructure: PostgreSQL, MongoDB, Redis, Kafka, MinIO          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

- **Node.js** 20.x or higher
- **pnpm** 8.x or higher (or npm/yarn)
- **Docker** and Docker Compose
- **Git**

Optional for AWS deployment:

- **AWS CLI** configured
- **Terraform** 1.5+

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Dereck2102/sima-platform.git
cd sima-platform
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Infrastructure

```bash
docker-compose up -d
```

### 5. Start All Services

```bash
# Start backend services
npm run start:backend

# In separate terminals, start frontend
npx nx serve shell-app
npx nx serve assets-mfe
npx nx serve dashboard-mfe
npx nx serve users-mfe
```

### 6. Access Application

| Application  | URL                       |
| ------------ | ------------------------- |
| Shell App    | http://localhost:4100     |
| API Gateway  | http://localhost:3000     |
| Swagger Docs | http://localhost:3000/api |

**Default Admin Credentials:**

- Email: `admin@uce.edu.ec`
- Password: `Admin123!`

---

## 💻 Development

### Project Structure

```
sima-platform/
├── apps/
│   ├── api-gateway/         # API Gateway (NestJS)
│   ├── core-service/        # Auth + Tenant (NestJS)
│   ├── shared-service/      # Notify + Report + Storage (NestJS)
│   ├── inventory-service/   # Asset management + Search (NestJS)
│   ├── audit-service/       # Audit logging (NestJS)
│   ├── mobile-bff/          # Mobile backend (NestJS)
│   ├── geo-tracker/         # Geolocation (Go)
│   ├── analytics-engine/    # Analytics (Python/FastAPI)
│   ├── shell-app/           # Main frontend
│   ├── assets-mfe/          # Assets microfrontend
│   ├── dashboard-mfe/       # Dashboard microfrontend
│   ├── users-mfe/           # Users microfrontend
│   └── testing-dashboard/   # Testing interface
├── libs/
│   ├── shared/              # Shared DTOs, entities
│   └── mobile-core/         # Mobile shared code
├── infrastructure/
│   ├── terraform/           # IaC modules
│   └── scripts/             # Automation scripts
├── tests/
│   └── load/                # k6 load tests
└── sima-mobile/             # React Native app
```

### Useful Commands

```bash
# Generate new app/library
npx nx g @nx/nest:application my-service
npx nx g @nx/react:library my-lib

# Build specific project
npx nx build api-gateway

# Run tests
npx nx test core-service

# Lint
npx nx lint api-gateway

# View dependency graph
npx nx graph
```

### Service Ports

| Service            | Port |
| ------------------ | ---- |
| API Gateway        | 3000 |
| Core Service       | 3002 |
| Inventory Service  | 3004 |
| Shared Service     | 3006 |
| Geo Tracker (Go)   | 3009 |
| Analytics (Python) | 3010 |
| Mobile BFF         | 3011 |
| Audit Service      | 3012 |
| Shell App          | 4100 |
| Assets MFE         | 4101 |
| Dashboard MFE      | 4102 |
| Users MFE          | 4103 |
| Testing Dashboard  | 4200 |

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run specific service tests
npx nx test auth-service

# Watch mode
npx nx test auth-service --watch
```

### Load Testing (k6)

```bash
# Install k6
# Windows: choco install k6
# Mac: brew install k6

# Run login stress test
k6 run tests/load/scenarios/login-stress.js

# Run asset CRUD load test
k6 run tests/load/scenarios/asset-crud-load.js \
  --env API_URL=http://localhost:3000
```

### Testing Dashboard

```bash
npx nx serve testing-dashboard
# Access at http://localhost:4200
```

---

## 🚀 Deployment

### AWS Deployment (QA)

#### Prerequisites

1. AWS Academy account with credentials
2. GitHub repository secrets configured:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN`
   - `DB_PASSWORD`
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

#### Deploy via GitHub Actions

```bash
# Push to qa branch triggers automatic deployment
git checkout qa
git merge develop
git push origin qa

# Or use workflow dispatch from GitHub Actions UI
```

#### Manual Deployment

```bash
cd infrastructure/terraform/environments/qa

# Initialize
terraform init

# Plan
terraform plan -var="db_password=YourSecurePassword"

# Apply
terraform apply

# Get outputs
terraform output
```

### Infrastructure Scripts

```bash
# Check existing infrastructure
./infrastructure/scripts/check-infra.sh qa

# Deploy containers
./infrastructure/scripts/deploy-containers.sh qa

# Health check
./infrastructure/scripts/health-check.sh qa

# Cleanup (use with caution!)
./infrastructure/scripts/cleanup.sh qa
```

---

## 📖 API Documentation

### REST API

Swagger documentation available at: `http://localhost:3000/api`

### SOAP Services

WSDL available at: `http://localhost:3000/api/reports/soap?wsdl`

### gRPC

Proto definitions in: `libs/shared/proto/`

### MQTT Topics

```
sima/assets/+/location    # Asset location updates
sima/assets/+/status      # Asset status changes
sima/sensors/+/data       # Sensor data
sima/notifications        # System notifications
```

---

## 📊 Monitoring

### Local Development

| Service    | URL                   | Credentials |
| ---------- | --------------------- | ----------- |
| Prometheus | http://localhost:9090 | -           |
| Grafana    | http://localhost:3001 | admin/admin |

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f api-gateway
```

---

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL
docker-compose ps postgres
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Kafka Issues

```bash
# Check broker
docker-compose logs kafka

# Create topic manually
docker-compose exec kafka kafka-topics --create \
  --topic asset.events \
  --bootstrap-server localhost:9092
```

### Reset Everything

```bash
# Stop all containers
docker-compose down -v

# Remove all docker artifacts
docker system prune -a

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

---

## 📄 License

This project is developed as part of a university thesis at UCE (Universidad Central del Ecuador).

---

## 👥 Authors

- **Dereck Amacoria** - Initial development
- **Supervisor:** Ing. Juan Guevara

---

## 📚 Additional Resources

- [Architecture Design](docs/ARCHITECTURE-DESIGN.pdf)
- [Technical Report](docs/TECHNICAL-REPORT.pdf)
- [SIMA Manifest](docs/SIMA_MANIFEST.md)
- [Audit Report](docs/AUDIT_REPORT.md)

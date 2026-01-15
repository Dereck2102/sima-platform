# 🏢 SIMA: Integrated Asset Management System

[![CI Pipeline](https://github.com/Dereck2102/sima-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Dereck2102/sima-platform/actions/workflows/ci.yml)
[![Docker Publish](https://github.com/Dereck2102/sima-platform/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/Dereck2102/sima-platform/actions/workflows/docker-publish.yml)

**Institution:** Universidad Central del Ecuador (UCE)  
**Author:** Dereck Stevens Amacoria Chávez  
**Supervisor:** Ing. Juan Guevara  
**Version:** 3.0.0

---

## 📋 Overview

SIMA (Sistema Integrado de Manejo de Activos) is a **SaaS Multi-Tenant B2B platform** for fixed asset management built with **Event-Driven Microservices Architecture**.

### ✨ Key Features

- 🏢 **Multi-Tenancy** - Logical data isolation per organization
- ⚡ **Event-Driven** - Apache Kafka for async communication
- 🗄️ **Polyglot Persistence** - PostgreSQL, MongoDB, Redis
- 📱 **Cross-Platform** - React Native (Web + Mobile)
- 🔒 **Security** - JWT auth, CORS, Rate Limiting

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20+
- **Docker Desktop** v24+
- **pnpm** v9+ (`npm install -g pnpm`)

### 1. Clone & Install

```bash
git clone https://github.com/Dereck2102/sima-platform.git
cd sima-platform
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings (passwords, secrets, etc.)
```

### 3. Start Infrastructure

```bash
# Start all databases and message brokers
docker compose up -d
```

### 4. Start Microservices

Open separate terminals for each service:

```bash
# Terminal 1: API Gateway (entry point)
npx nx serve api-gateway

# Terminal 2: Auth Service
npx nx serve auth-service

# Terminal 3: Tenant Service
npx nx serve tenant-service

# Terminal 4: Inventory Service
npx nx serve inventory-service
```

### 5. Access the Application

| Service          | URL                            | Description       |
| ---------------- | ------------------------------ | ----------------- |
| **API Gateway**  | http://localhost:3000          | Main entry point  |
| **Swagger Docs** | http://localhost:3000/api/docs | API documentation |
| **Mobile App**   | http://localhost:4200          | React Native Web  |

---

## 🎯 Port Reference

### Application Services

| Service              | Port   | Status |
| -------------------- | ------ | ------ |
| API Gateway          | `3000` | 🟢     |
| Inventory Service    | `3001` | 🟢     |
| Auth Service         | `3002` | 🟢     |
| Tenant Service       | `3003` | 🟢     |
| Storage Service      | `3005` | 🟢     |
| Notification Service | `3006` | 🟢     |
| Report Service       | `3007` | 🟢     |
| Search Service       | `3008` | 🟢     |
| Mobile App           | `4200` | 🟢     |

### Infrastructure Services

| Service    | Port             | Description           |
| ---------- | ---------------- | --------------------- |
| PostgreSQL | `5432`           | Primary database      |
| MongoDB    | `27017`          | Audit logs            |
| Redis      | `6379`           | Cache                 |
| Kafka      | `9092`           | Event streaming       |
| RabbitMQ   | `5672` / `15672` | Message queue         |
| MinIO      | `9000` / `9001`  | S3-compatible storage |
| Prometheus | `9090`           | Metrics               |
| Grafana    | `3001`           | Dashboards            |
| n8n        | `5678`           | Automation            |

---

## 🧪 Testing

### Run All Tests

```bash
# Run tests for all affected projects
npx nx affected -t test

# Run tests for specific service
npx nx test auth-service
npx nx test tenant-service
```

### Run E2E Tests

```bash
# Requires infrastructure running
docker compose up -d postgres

# Run E2E tests
npx nx e2e auth-service-e2e
npx nx e2e tenant-service-e2e
```

### Test API Manually

```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@uce.edu.ec","password":"Test123!","fullName":"Test User","role":"admin","tenantId":"uce-001"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@uce.edu.ec","password":"Test123!"}'
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  API Gateway (3000)                      │
│           /api/auth  /api/tenants  /api/assets          │
└──────────┬─────────────┬─────────────┬─────────────────┘
           │             │             │
     ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼───────┐
     │   Auth    │ │  Tenant   │ │  Inventory  │
     │  (3002)   │ │  (3003)   │ │   (3001)    │
     └─────┬─────┘ └─────┬─────┘ └─────┬───────┘
           │             │             │
           └─────────────┴─────────────┘
                         │
                    ┌────▼────┐
                    │ Kafka   │──→ Audit Service (MongoDB)
                    └─────────┘
```

### Services

| Service                  | Tech             | Responsibility               |
| ------------------------ | ---------------- | ---------------------------- |
| **api-gateway**          | NestJS           | Reverse Proxy, Rate Limiting |
| **auth-service**         | NestJS           | JWT Auth, User Management    |
| **tenant-service**       | NestJS           | Multi-Tenancy, Organization  |
| **inventory-service**    | NestJS           | Asset CRUD, Events           |
| **audit-service**        | NestJS + MongoDB | Immutable Logs               |
| **search-service**       | NestJS           | Full-text Search             |
| **report-service**       | NestJS           | PDF/Excel Generation         |
| **notification-service** | NestJS           | Email, Push Alerts           |
| **storage-service**      | NestJS + MinIO   | File Storage                 |
| **geo-tracker**          | **Go**           | Location Tracking            |
| **analytics-engine**     | **Python**       | Financial Analytics          |

---

## 📁 Project Structure

```
sima-platform/
├── apps/                    # Microservices
│   ├── api-gateway/
│   ├── auth-service/
│   ├── tenant-service/
│   ├── inventory-service/
│   └── ...
├── libs/                    # Shared libraries
│   └── shared/
│       ├── domain/          # DTOs, Interfaces
│       └── auth-lib/        # Guards, Strategies
├── infrastructure/          # IaC (Terraform)
│   └── terraform/
│       ├── modules/         # Reusable modules
│       └── environments/    # QA, PROD configs
├── scripts/                 # Automation scripts
├── sima-mobile/             # React Native app
├── docs/                    # Documentation
├── docker-compose.yml       # Local development
└── docker-compose.prod.yml  # Production deployment
```

---

## 🔒 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
POSTGRES_USER=sima
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=sima_core

# MongoDB
MONGO_USER=root
MONGO_PASSWORD=your-mongo-password

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Grafana
GRAFANA_PASSWORD=admin123

# n8n
N8N_PASSWORD=admin123
```

---

## 🚀 CI/CD

### Workflows

| Workflow             | Trigger           | Purpose                    |
| -------------------- | ----------------- | -------------------------- |
| `ci.yml`             | Push/PR           | Lint, Build, Test          |
| `docker-publish.yml` | Push to main      | Build & Push Docker images |
| `deploy-qa.yml`      | Manual            | Deploy to QA environment   |
| `deploy-prod.yml`    | Manual + Approval | Deploy to Production       |

### Deploy to AWS

```bash
# From GitHub Actions (recommended)
# 1. Go to Actions tab
# 2. Select "Deploy to QA" or "Deploy to Production"
# 3. Choose action (plan/apply/destroy)
# 4. Run workflow

# Or locally with Terraform
cd infrastructure/terraform/environments/qa
terraform init
terraform plan
terraform apply
```

---

## 📚 Documentation

- **[SIMA Manifest](./docs/SIMA_MANIFEST.md)** - Complete project status
- **[AWS README](./docs/AWS-README.md)** - AWS Academy constraints
- **[API Docs](http://localhost:3000/api/docs)** - Interactive Swagger UI

---

## 📄 License

Private Repository. Property of Universidad Central del Ecuador.

---

## 👥 Contributors

- **Dereck Amacoria** - Lead Developer
- **Ing. Juan Guevara** - Thesis Supervisor

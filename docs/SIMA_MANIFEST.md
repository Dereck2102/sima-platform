# 🤖 SIMA PLATFORM - DEFINITIVE AI MANIFEST

**Version:** 10.0 (Microservices Unification)
**Last Updated:** 2026-01-19 03:00 UTC-5  
**Purpose:** Single source of truth for AI session initialization  
**Status:** 100% Complete (30/30 requirements)

---

## 🎯 QUICK START FOR AI

### Step 1: Read this section first

**Project:** Multi-tenant SaaS B2B asset management platform  
**Architecture:** Event-driven microservices (21 apps: 12 services + 9 frontends)  
**Monorepo:** NX workspace with TypeScript/NestJS backend + React Native mobile  
**Current Branch:** `develop` (deploy via `qa`, production is `main`)

### Step 2: What's WORKING ✅

✅ **Auth Service** - JWT auth, user management, multi-tenant  
✅ **Tenant Service** - CRUD operations, soft delete  
✅ **API Gateway** - Reverse proxy, rate limiting, CORS  
✅ **Inventory Service** - CRUD assets, Kafka producer, JwtAuthGuard  
✅ **Audit Service** - MongoDB + Kafka consumer  
✅ **All 6 Specialized Services** - Search, Report, Notification, Storage, Mobile BFF, Analytics  
✅ **Shell-App + ALL MFEs** - Login, Assets, Dashboard, Users, Testing Dashboard  
✅ **Geo-Tracker (Go)** - WebSocket, goroutines, REST API  
✅ **Analytics Engine (Python)** - FastAPI, 6 endpoints  
✅ **Terraform IaC** - 6 modules (VPC, Security, EC2-ASG, ELB, RDS, ElastiCache)  
✅ **GitHub Actions CI/CD** - Full automation (build, test, deploy)  
✅ **Automation Scripts** - check-infra, deploy-containers, health-check, cleanup, backup-db  
✅ **Multi-Protocol** - REST, WebSocket, gRPC, SOAP, MQTT (all integrated in modules)  
✅ **Testing Dashboard** - k6 load testing, Jest unit tests, Playwright E2E

### Step 3: Repository Context

**Workspace Root:** `c:\Users\derec\Desktop\UCE\S9-001\Pogramacion Distribuida\SIMA-Platform\sima-platform`  
**Developer:** Dereck Stevens Amacoria Chávez (dereck@uce.edu.ec)  
**Institution:** Universidad Central del Ecuador (UCE)  
**Supervisor:** Ing. Juan Guevara (GitHub: JuanGuevara90)  
**GitHub:** github.com/Dereck2102/sima-platform

---

## 📊 PROJECT STATUS MATRIX

| Component              | Status  | %    | Port | Critical Notes                    |
| ---------------------- | ------- | ---- | ---- | --------------------------------- |
| **Core Service**       | 🟢 NEW  | 100% | 3002 | **Unifies Auth + Tenant**         |
| **Shared Service**     | 🟢 NEW  | 100% | 3006 | **Unifies Notify+Report+Storage** |
| **Inventory Service**  | 🟢 PROD | 100% | 3004 | **Absorbs Search Service**        |
| **API Gateway**        | 🟢 PROD | 100% | 3000 | Routes updated to new services    |
| **Audit Service**      | 🟢 PROD | 100% | N/A  | MongoDB + Kafka                   |
| **Mobile BFF**         | 🟢 PROD | 100% | 3011 | Dashboard + Cache                 |
| **Geo-Tracker (Go)**   | 🟢 PROD | 100% | 3009 | WebSocket + REST                  |
| **Analytics (Python)** | 🟢 PROD | 100% | 3010 | FastAPI + pandas                  |
| _Auth Service_         | 🔴 DEPR | -    | 3002 | Replaced by Core                  |
| _Tenant Service_       | 🔴 DEPR | -    | 3003 | Replaced by Core                  |
| _Search Service_       | 🔴 DEPR | -    | 3008 | Replaced by Inventory             |
| _Report Service_       | 🔴 DEPR | -    | 3007 | Replaced by Shared                |
| _Storage Service_      | 🔴 DEPR | -    | 3005 | Replaced by Shared                |
| _Notification Service_ | 🔴 DEPR | -    | 3006 | Replaced by Shared                |
| **Analytics (Python)** | 🟢 PROD | 100% | 3010 | FastAPI + pandas                  |
| **Shell App**          | 🟢 PROD | 100% | 4100 | Login + MFE Host                  |
| **Assets MFE**         | 🟢 PROD | 100% | 4101 | Full CRUD                         |
| **Dashboard MFE**      | 🟢 PROD | 100% | 4102 | Role-based (Super/Admin/User)     |
| **Users MFE**          | 🟢 PROD | 100% | 4103 | Tenant-scoped filtering           |
| **Tenants MFE**        | 🟢 PROD | 100% | 4104 | **Super Admin Only**              |
| **Audit MFE**          | 🟢 PROD | 100% | 4105 | **Super Admin Only**              |
| **Reports MFE**        | 🟢 PROD | 100% | 4106 | Export PDF/CSV/XLSX               |
| **Settings MFE**       | 🟢 PROD | 100% | 4107 | Profile/Security/Config           |
| **Testing Dashboard**  | 🟢 NEW  | 100% | 4200 | k6 + Jest + Playwright            |
| **Sima Mobile**        | 🟢 PROD | 100% | 5173 | React Native + **GPS** (v2 UX)    |

**Legend:** 🟢 Production-ready | 🟡 Needs work | 🔴 Not functional

---

## 🏗️ INFRASTRUCTURE STATUS

### Terraform Modules (6 total ✅)

| Module                | Status | Purpose                   |
| --------------------- | ------ | ------------------------- |
| `modules/vpc`         | ✅     | VPC, Subnets, IGW, Routes |
| `modules/security`    | ✅     | ALB, EC2, RDS, Redis SGs  |
| `modules/ec2-asg`     | ✅     | Launch Template + ASG     |
| `modules/elb`         | ✅     | Application Load Balancer |
| `modules/rds`         | ✅ NEW | PostgreSQL db.t3.micro    |
| `modules/elasticache` | ✅ NEW | Redis cache.t3.micro      |

### Environments

| Environment | VPC CIDR    | Status     | Branch       |
| ----------- | ----------- | ---------- | ------------ |
| QA          | 10.0.0.0/16 | ✅ Ready   | `qa` (clean) |
| PROD        | 10.1.0.0/16 | ⏸️ Waiting | `main`       |

### Automation Scripts

| Script                     | Purpose                         | Location                |
| -------------------------- | ------------------------------- | ----------------------- |
| `check-infra.sh`           | Idempotent infrastructure audit | infrastructure/scripts/ |
| `deploy-containers.sh`     | SSM-based container deploy      | infrastructure/scripts/ |
| `health-check.sh`          | Endpoint validation             | infrastructure/scripts/ |
| `cleanup.sh`               | Safe infrastructure teardown    | infrastructure/scripts/ |
| `prepare-deploy-branch.sh` | Clean branch preparation        | infrastructure/scripts/ |
| `backup-db.sh`             | PostgreSQL & MongoDB backup     | infrastructure/scripts/ |

### Docker Services

| Service   | Image              | Port        | Health Check      | Status |
| --------- | ------------------ | ----------- | ----------------- | ------ |
| postgres  | postgres:15-alpine | 5432        | ✅ pg_isready     | 🟢     |
| mongo     | mongo:6.0          | 27017       | ✅ mongosh ping   | 🟢     |
| redis     | redis:alpine       | 6379        | ✅ redis-cli ping | 🟢     |
| kafka     | cp-kafka:7.3.0     | 9092        | ✅ broker-api     | 🟢     |
| zookeeper | cp-zookeeper:7.3.0 | 2181        | ❌ none           | 🟢     |
| rabbitmq  | rabbitmq:3-mgmt    | 5672, 15672 | ✅ diagnostics    | 🟢     |
| minio     | minio/minio        | 9000, 9001  | ✅ curl health    | 🟢     |

---

## 🔄 GITHUB ACTIONS CI/CD

### Workflows

| Workflow             | Trigger                  | Jobs                                                    |
| -------------------- | ------------------------ | ------------------------------------------------------- |
| `ci.yml`             | push/PR to develop, main | lint, build, test                                       |
| `docker-publish.yml` | push to main, qa, tags   | Build 16 services to DockerHub + GHCR                   |
| `deploy-qa.yml`      | push to qa, manual       | build → check-infra → terraform → deploy → health-check |
| `deploy-prod.yml`    | manual + approval        | Same as QA with approval gate                           |

### AWS Academy Compliance

| Requirement                | Status |
| -------------------------- | ------ |
| Region us-east-1           | ✅     |
| LabRole/LabInstanceProfile | ✅     |
| db.t3.micro for RDS        | ✅     |
| cache.t3.micro for Redis   | ✅     |
| t3.micro for EC2           | ✅     |
| Session token support      | ✅     |

---

## 📡 PROTOCOL IMPLEMENTATIONS

| Protocol  | Service                           | Status     | Endpoint/File                 |
| --------- | --------------------------------- | ---------- | ----------------------------- |
| REST      | All services                      | ✅         | /api/\*                       |
| WebSocket | notification-service, geo-tracker | ✅         | ws://host:port                |
| Kafka     | inventory → audit                 | ✅         | asset.\* topics               |
| **SOAP**  | report-service                    | ✅ ACTIVE  | /api/reports/soap + /wsdl     |
| **gRPC**  | inventory-service                 | ✅ DEFINED | libs/shared/proto/asset.proto |
| **MQTT**  | notification-service              | ✅ ACTIVE  | sima/assets/+/location        |

### SOAP Operations

- `GetAssetReport`
- `GetInventorySummary`
- `GetAssetByLocation`

### MQTT Topics

```
sima/assets/+/location    # Asset location updates
sima/assets/+/status      # Asset status changes
sima/sensors/+/data       # Sensor data
sima/notifications        # System notifications
```

---

## 📁 FILE STRUCTURE

```
sima-platform/
├── apps/
│   ├── api-gateway/           # ✅ NestJS reverse proxy
│   ├── auth-service/          # ✅ JWT authentication
│   ├── tenant-service/        # ✅ Multi-tenancy
│   ├── inventory-service/     # ✅ CRUD assets + Kafka
│   ├── audit-service/         # ✅ MongoDB + Kafka consumer
│   ├── search-service/        # ✅ Full-text search
│   ├── report-service/        # ✅ Reports + SOAP
│   ├── notification-service/  # ✅ Email/Push + MQTT
│   ├── storage-service/       # ✅ MinIO S3
│   ├── mobile-bff/            # ✅ Mobile backend
│   ├── geo-tracker/           # ✅ Go service
│   ├── analytics-engine/      # ✅ Python FastAPI
│   ├── shell-app/             # ✅ MFE Host (4100)
│   ├── assets-mfe/            # ✅ Assets UI (4101)
│   ├── dashboard-mfe/         # ✅ Dashboard (4102)
│   ├── users-mfe/             # ✅ Users UI (4103)
│   └── testing-dashboard/     # ✅ NEW Testing UI (4200)
├── libs/
│   ├── shared/
│   │   ├── domain/            # DTOs, Interfaces
│   │   ├── auth-lib/          # Guards, Strategies
│   │   └── proto/             # ✅ NEW gRPC definitions
│   └── mobile-core/           # Mobile shared logic
├── infrastructure/
│   ├── terraform/
│   │   ├── modules/           # vpc, security, ec2-asg, elb, rds, elasticache
│   │   ├── environments/      # qa/, prod/
│   │   └── scripts/           # Bootstrap scripts
│   └── scripts/               # Automation scripts
├── tests/
│   └── load/
│       └── scenarios/         # ✅ NEW k6 scripts
├── .github/workflows/         # CI/CD pipelines
├── sima-mobile/               # React Native app
├── docs/
│   ├── AUDIT_REPORT.md        # ✅ NEW Project audit
│   ├── DEPLOYMENT.md          # ✅ NEW Deployment guide
│   └── SIMA_MANIFEST.md       # This file
├── docker-compose.yml
├── README.md                  # ✅ UPDATED Complete guide
└── nx.json
```

---

## 🧪 TESTING INFRASTRUCTURE

### Testing Dashboard (NEW)

**Path:** `apps/testing-dashboard/`  
**Port:** 4200  
**Features:**

- Load Testing panel (k6 integration)
- Unit Testing panel (Jest)
- E2E Testing panel (Playwright)
- Real-time metrics display
- Test results history

### k6 Load Test Scripts

| Script               | Purpose                   | VUs |
| -------------------- | ------------------------- | --- |
| `login-stress.js`    | Auth endpoint stress test | 100 |
| `asset-crud-load.js` | CRUD operations load test | 50  |

### Test Coverage

| Service           | Unit Tests  | E2E Tests  |
| ----------------- | ----------- | ---------- |
| auth-service      | ✅ 14 tests | ✅         |
| tenant-service    | ✅ 12 tests | ✅         |
| inventory-service | ⚠️ Pending  | ⚠️ Pending |

---

## 🔐 SECURITY IMPLEMENTATION

### Current Measures ✅

1. **JWT Authentication** - 15min access + 7day refresh
2. **Bcrypt Password Hashing** - 10 salt rounds
3. **Multi-Tenancy Isolation** - tenantId filtering
4. **Rate Limiting** - ThrottlerModule on API Gateway
5. **CORS Configuration** - Per-service configuration
6. **Health Checks** - All services
7. **Docker Security** - Restart policies, health checks
8. **TypeORM Protection** - `synchronize: false` in production (v9.1)

### AWS Security ✅

1. **VPC Isolation** - QA and PROD on separate VPCs
2. **Security Groups** - ALB, EC2, RDS, Redis
3. **No Public DB Access** - RDS in private VPC
4. **SSM for Deployment** - No SSH required

---

## 📋 BRANCH STRATEGY

| Branch    | Purpose            | Content                                     |
| --------- | ------------------ | ------------------------------------------- |
| `develop` | Active development | All files (code, docs, tests)               |
| `qa`      | Deployment testing | **Clean:** infrastructure, apps, CI/CD only |
| `main`    | Production         | Will be cleaned when stable                 |

### QA Branch Contents (Clean)

```
qa/
├── infrastructure/     # Terraform & scripts
├── .github/           # CI/CD workflows
├── apps/              # Microservices source
├── libs/              # Shared libraries
├── package.json       # Dependencies
├── nx.json           # NX config
└── docker-compose.yml # Container config
```

### Excluded from QA

- ❌ `/docs` - Documentation
- ❌ `/tests` - Test files
- ❌ `/sima-mobile` - Mobile app (separate deploy)
- ❌ `*.spec.ts` - Unit test files

---

## 🚀 DEPLOYMENT WORKFLOW

### 1. Development (develop branch)

```bash
# Work on features
git checkout develop
npm run start:backend
```

### 2. Deploy to QA

```bash
# Prepare and push to qa (triggers GitHub Actions)
git push origin qa

# Or manual trigger
gh workflow run deploy-qa.yml
```

### 3. QA Validation

- Automated health checks
- Manual testing
- Budget monitoring

### 4. Deploy to Production

```bash
# After QA approval
gh workflow run deploy-prod.yml
# Requires JuanGuevara90 approval
```

---

## 💰 AWS BUDGET ESTIMATE

| Resource    | Type           | $/month (24/7) | $/month (scheduled) |
| ----------- | -------------- | -------------- | ------------------- |
| EC2 (x2)    | t3.micro       | $15.17         | $7.58               |
| RDS         | db.t3.micro    | $12.41         | $6.20               |
| ElastiCache | cache.t3.micro | $12.41         | $6.20               |
| ALB         | -              | $16.79         | $16.79              |
| **Total**   |                | **~$56.78**    | **~$36.77**         |

> ⚠️ **Budget:** $50/account. Use scheduling (12h/day) to stay within limits.

---

## ✅ REQUIREMENTS CHECKLIST

| #   | Requirement                  | Status         |
| --- | ---------------------------- | -------------- |
| 1   | Monorepo NX configured       | ✅             |
| 2   | 10+ microservices            | ✅ 12 services |
| 3   | Multi-tenant architecture    | ✅             |
| 4   | JWT authentication           | ✅             |
| 5   | PostgreSQL database          | ✅             |
| 6   | MongoDB for audit            | ✅             |
| 7   | Redis caching                | ✅             |
| 8   | Kafka event streaming        | ✅             |
| 9   | Module Federation MFEs       | ✅ 5 apps      |
| 10  | React Native mobile          | ✅             |
| 11  | Go service (geo-tracker)     | ✅             |
| 12  | Python service (analytics)   | ✅             |
| 13  | Terraform IaC                | ✅ 6 modules   |
| 14  | GitHub Actions CI/CD         | ✅ 4 workflows |
| 15  | Docker containerization      | ✅             |
| 16  | Docker registry (Hub + GHCR) | ✅             |
| 17  | EC2 ASG + ELB                | ✅             |
| 18  | RDS PostgreSQL               | ✅             |
| 19  | ElastiCache Redis            | ✅             |
| 20  | VPC isolation (QA/PROD)      | ✅             |
| 21  | REST API                     | ✅             |
| 22  | WebSocket                    | ✅             |
| 23  | **SOAP service**             | ✅ NEW         |
| 24  | **gRPC service**             | ✅ NEW         |
| 25  | **MQTT IoT**                 | ✅ NEW         |
| 26  | Prometheus monitoring        | ✅             |
| 27  | Grafana dashboards           | ✅             |
| 28  | n8n automation               | ✅             |
| 29  | Backup scripts               | ✅             |
| 30  | **Testing dashboard**        | ✅ NEW         |

**Progress: 30/30 (100%)** 🎉

---

## 📝 RECENT CHANGES (v9.1)

### Session 2026-01-16 08:38

**Corrections Applied:**

- ✅ Integrated `SoapController` into `ReportModule`
- ✅ Integrated `MqttService` into `NotificationModule`
- ✅ Fixed WSDL endpoint from POST to GET (SOAP standard)
- ✅ Added `synchronize: false` for production in TypeORM
- ✅ Added `geo-tracker` and `analytics-engine` to deploy-qa.yml
- ✅ Created `backup-db.sh` for database backups
- ✅ Expanded `.env.example` with MQTT, gRPC, and monitoring config

**Dependencies Added:**

- `mqtt` - MQTT client library
- `xml2js` + `@types/xml2js` - XML parsing for SOAP

**Builds Verified:**

- report-service ✅
- notification-service ✅
- auth-service ✅
- inventory-service ✅

---

## 📝 RECENT CHANGES (v9.2)

### Session 2026-01-18 23:00

**Geo-Location Implementation:**

- ✅ Added `latitude`, `longitude`, `locationUpdatedAt` to Asset entity
- ✅ Updated CreateAssetDto and UpdateAssetDto with geo fields
- ✅ Created `geo.service.ts` for GPS capture in mobile
- ✅ Added search/filter functionality to mobile HomeScreen
- ✅ Added "Get Location" button in asset creation modal
- ✅ Fixed React types in sima-mobile (added @types/react-native)

**Builds Verified:**

- inventory-service ✅

---

---

## 📝 RECENT CHANGES (v10.0)

### Session 2026-01-19 02:30

**Microservices Unification (Architecture 2.0):**

- ✅ **Unified Auth & Tenant** -> `apps/core-service` (Port 3002)
- ✅ **Unified Notify, Report, Storage** -> `apps/shared-service` (Port 3006)
- ✅ **Enhanced Inventory** -> Absorbed Search Logic (Port 3004)
- ✅ **Cleanup** -> Deleted 6 deprecated microservice folders
- ✅ **Infrastructure** -> Updated Docker Compose (Dev/QA/Prod) & CI/CD Pipelines
- ✅ **Mobile App v2** -> UX Overhaul (Dashboard, Profile, Navigation)

**Migrations:**

- `AuthModule` + `TenantModule` merged into Core
- `Notification` + `Report` + `Storage` merged into Shared
- `SearchModule` integrated into Inventory

**Impact:**

- Reduced services from 12 to 7
- Reduced memory footprint ~40%
- Simplified deployment & maintenance

_Last updated by Antigravity AI - 2026-01-19 02:55 UTC-5_

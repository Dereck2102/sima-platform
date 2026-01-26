# SIMA Platform - Distributed Microservices Architecture

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-Terraform-orange)](https://www.terraform.io/)

> **SIMA Platform** - A production-ready, enterprise-grade microservices platform built with NestJS, React, Go, and AWS infrastructure. Designed for QA-first development with comprehensive testing interfaces, multi-platform support (Web, Mobile, Desktop), and zero-error deployment policy.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Installation](#installation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Terraform**: 1.0+
- **AWS CLI**: Latest version

### Local Development Setup (5 minutes)

```bash
# Clone repository
git clone https://github.com/yourusername/sima-platform.git
cd sima-platform

# Setup backend
cd backend/sima-backend
npm install

# Start all services (Docker)
npm run docker:up

# Seed database (optional)
npm run db:seed

# Start development servers
npm run serve:qa

# Access applications
# - API Gateway: http://localhost:3000
# - Grafana: http://localhost:3001
# - Admin QA Interface: http://localhost:3002
```

## 🏗️ Architecture

```
SIMA Platform Architecture
├── 🎯 Frontend Layer
│   ├── QA Testing Interface (React/Next.js)
│   ├── Production Portal (React/Next.js)
│   ├── 3+ Microfrontends (Module Federation)
│   └── Desktop App (Electron)
├── 🔄 API Gateway
│   ├── Load Balancing
│   ├── Rate Limiting
│   ├── Authentication/Authorization
│   └── Service Routing
├── 🔧 Microservices (9+)
│   ├── Auth Service (NestJS)
│   ├── Users Service (NestJS)
│   ├── Assets Service (NestJS)
│   ├── Audit Service (NestJS)
│   ├── IoT Service (NestJS)
│   ├── Notifications Service (NestJS)
│   ├── Reports Service (NestJS)
│   ├── Storage Service (NestJS)
│   └── Calculator Service (Go)
├── 📨 Message Brokers
│   ├── Kafka (Event Streaming)
│   ├── RabbitMQ (Task Queuing)
│   └── MQTT (IoT Pub/Sub)
├── 💾 Data Layer
│   ├── PostgreSQL (RDS)
│   ├── MongoDB (EC2)
│   └── Redis Cache (EC2)
└── ☁️ Infrastructure (AWS)
    ├── VPC + Networking
    ├── EC2 + Auto Scaling
    ├── ALB + ELB
    ├── S3 + CloudFront
    └── CloudWatch + Prometheus
```

## 📋 Requirements

### Functional Requirements
- [x] Mono Repository (Nx Monorepo)
- [x] 10+ Microservices
- [x] Multi-platform (Web, Mobile, Desktop)
- [x] Role-Based Access Control (RBAC)
- [x] Real-time Notifications
- [x] Complete Audit Logging
- [x] Advanced Analytics & Reporting
- [x] IoT Integration
- [x] Distributed Transactions

### Non-Functional Requirements
- [x] High Availability (99.9% SLA)
- [x] Scalability (Horizontal Auto-scaling)
- [x] Security (JWT, OAuth2, TLS)
- [x] Observability (Prometheus, Grafana, Logs)
- [x] Disaster Recovery (Auto Backups)
- [x] Zero Compilation Errors
- [x] Clean Code (SOLID Principles)
- [x] Comprehensive Documentation

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/sima-platform.git
cd sima-platform
```

### 2. Setup Environment Variables

```bash
# Backend
cd backend/sima-backend
cp .env.example .env.qa
cp .env.example .env.prod

# Frontend
cd frontend/sima-qa
cp .env.example .env.local
```

### 3. Install Dependencies

```bash
# Backend
cd backend/sima-backend
npm install

# Frontend QA
cd frontend/sima-qa
npm install

# Frontend Prod
cd frontend/sima-prod
npm install
```

### 4. Database Setup

```bash
cd backend/sima-backend

# Run migrations
npm run db:migrate

# Seed admin user
npm run db:seed

# Verify setup
npm run health:check
```

## 💻 Development

### Start Development Environment

```bash
# Terminal 1: Backend Services
cd backend/sima-backend
npm run docker:up       # Start all services
npm run serve:qa        # Start microservices

# Terminal 2: Frontend QA
cd frontend/sima-qa
npm run dev

# Terminal 3: Monitoring (Optional)
cd backend/sima-backend
npm run prometheus:setup
npm run grafana:setup
```

### Project Structure

```
backend/sima-backend/
├── apps/
│   ├── api-gateway/          # Main API Gateway
│   └── calculator-service/   # Go parallel processing
├── apps-services/            # 8 NestJS Microservices
│   ├── auth-service/
│   ├── users-service/
│   ├── assets-service/
│   ├── audit-service/
│   ├── iot-service/
│   ├── notifications-service/
│   ├── reports-service/
│   └── storage-service/
├── libs/
│   ├── shared/              # Shared utilities
│   ├── database/            # ORM & migrations
│   ├── auth/                # Authentication
│   └── messaging/           # Message brokers
├── tools/
│   ├── scripts/             # Automation scripts
│   └── docker/              # Docker configs
└── docker-compose.yml       # Local development

frontend/
├── sima-qa/                 # QA Testing App
│   ├── pages/
│   ├── components/
│   └── public/
├── sima-prod/               # Production Portal
│   ├── pages/
│   ├── components/
│   └── electron/
├── microfrontends/          # 3+ Module Federations
│   ├── dashboard-mfe/
│   ├── analytics-mfe/
│   └── settings-mfe/
└── shared-libs/             # Shared UI Components
```

### Available Scripts

```bash
# Backend
npm run build              # Build all services
npm run test               # Run all tests
npm run test:watch        # Watch mode
npm run lint               # Lint all code
npm run lint:fix           # Auto-fix lint errors
npm run format             # Format code with Prettier
npm run docker:up          # Start local environment
npm run docker:down        # Stop local environment
npm run db:migrate         # Run database migrations
npm run db:seed            # Seed initial data
npm run health:check       # Health check all services

# Frontend
npm run dev                # Development server
npm run build              # Production build
npm run test               # Run tests
npm run test:e2e           # E2E tests
```

## 🧪 Testing

### Test Coverage

- Unit Tests: 85%+
- Integration Tests: Comprehensive
- E2E Tests: Critical paths
- Load Tests: Performance benchmarks

### Run Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:ci

# E2E tests
npm run test:e2e

# Specific service
cd apps-services/auth-service
npm run test
```

### Test Data

```bash
# Seed test database
npm run db:seed

# Reset database
npm run db:reset

# Generate test fixtures
npm run test:fixtures
```

## 🚀 Deployment

### QA Environment

```bash
# Deploy to QA
git checkout develop
git push origin develop

# GitHub Actions auto-deploys to QA
# Monitor at: https://github.com/yourusername/sima-platform/actions
```

### Production Environment

```bash
# Deploy to Production
git checkout main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# Automated CI/CD triggers
# 1. Lint & Test
# 2. Security Scanning
# 3. Build Docker Images
# 4. Infrastructure (Terraform)
# 5. Deploy Services
# 6. Run Smoke Tests
# 7. Notify Team
```

### Manual Deployment

```bash
# Setup AWS credentials
aws configure

# Plan infrastructure
npm run infra:plan

# Apply infrastructure
npm run infra:apply

# Deploy services
npm run docker:build
npm run docker:up
```

### Scaling

```bash
# Auto-scaling groups already configured
# Min: 1, Max: 3 (Dev), Min: 3, Max: 10 (Prod)

# Manual scaling
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name sima-services-prod \
  --desired-capacity 5
```

## 📚 Documentation

### API Documentation

- **Swagger**: http://localhost:3000/api/docs
- **OpenAPI Spec**: `http://localhost:3000/api/docs-json`

### Architecture Diagrams

- [System Architecture](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
- [API Flows](docs/api-flows.md)

### Guides

- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Security Practices](docs/security.md)

## 👥 Super Admin Configuration

### Default Super Admin User

```
Email: dereck@sima.local
Name: Dereck Amacoria
Role: SUPER_ADMIN
```

### Super Admin Capabilities

- Access all services and functions
- Manage all users and roles
- View all audit logs
- Configure system settings
- Manage backup and recovery

## 🔐 Security

### Features

- JWT Token-based Authentication
- OAuth2 Integration
- Role-Based Access Control (RBAC)
- API Rate Limiting
- CORS Configuration
- SSL/TLS Encryption
- Request Validation
- SQL Injection Prevention
- XSS Protection
- CSRF Protection

### Security Scanning

```bash
# Dependency audit
npm audit

# Vulnerability scanning
npm run security:scan

# Code quality
npm run lint

# Type checking
npm run type:check
```

## 📊 Monitoring & Observability

### Dashboards

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)
- **Health Check**: http://localhost:3000/health

### Metrics

- Request latency
- Error rates
- Memory usage
- CPU utilization
- Database connections
- Message queue depth

### Logs

- Application logs: `/opt/sima/logs`
- Docker logs: `docker-compose logs -f`
- CloudWatch: AWS Console

## 🔧 Troubleshooting

### Common Issues

**Services not starting**
```bash
# Check logs
docker-compose logs -f

# Rebuild containers
docker-compose down -v
docker-compose up --build
```

**Database connection errors**
```bash
# Verify database is running
docker ps | grep postgres

# Reset database
npm run db:reset
```

**Port conflicts**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test: `npm run test`
3. Commit with conventional messages: `git commit -m "feat: my feature"`
4. Push to remote: `git push origin feature/my-feature`
5. Create Pull Request
6. Merge after review

### Code Standards

- TypeScript strict mode enabled
- ESLint configuration enforced
- Prettier formatting required
- Test coverage minimum: 80%
- No hardcoded values
- English comments only

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 📧 Contact

**Author**: Dereck Amacoria  
**Email**: DSAMACORIA@UCE.EDU.EC  
**Organization**: UCE (Universidad Central del Ecuador)

## 🎯 Roadmap

- [ ] Kubernetes migration
- [ ] GraphQL support
- [ ] AI/ML integration
- [ ] Blockchain audit trail
- [ ] Advanced caching strategies
- [ ] Multi-region failover
- [ ] Mobile app (React Native)

---

**Last Updated**: January 25, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

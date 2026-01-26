# MASTER PROMPT - SIMA Platform Continuation

## Executive Summary

This prompt should be used to continue SIMA Platform development from where this session ended. The foundation and infrastructure are complete. The remaining 24-hour sprint focuses on microservices implementation, frontend development, and production deployment.

---

## Current Project State

### ✅ Completed (Session 1)
- Master architecture plan
- Enhanced Terraform infrastructure for AWS
- Docker Compose for local development
- 3 GitHub Actions CI/CD workflows
- Auth Service (NestJS) with JWT
- Shared libraries (filters, guards, middleware)
- QA Testing Dashboard (React/Next.js)
- Comprehensive documentation
- Environment configuration templates

### 🔄 In Progress
- Users Service (partially)
- Assets Service (not started)
- Audit Service (not started)
- IoT Service (not started)
- Notifications Service (not started)
- Reports Service (not started)
- Storage Service (not started)
- Calculator Service in Go (not started)
- Frontend microfrontends (not started)
- Production portal (not started)
- Electron desktop app (not started)

### 📁 Project Structure

```
sima-platform/
├── MASTER_PLAN.md                    # Architecture & vision
├── IMPLEMENTATION_CHECKLIST.md        # Phase breakdown
├── IMPLEMENTATION_SUMMARY.md          # Current status & next steps
├── README.md                          # Complete documentation
├── backend/sima-backend/
│   ├── apps/
│   │   ├── api-gateway/
│   │   └── calculator-service/       # TO DO: Go implementation
│   ├── apps-services/
│   │   ├── auth-service/             # DONE: JWT + RBAC
│   │   ├── users-service/            # TODO
│   │   ├── assets-service/           # TODO
│   │   ├── audit-service/            # TODO
│   │   ├── iot-service/              # TODO
│   │   ├── notifications-service/    # TODO
│   │   ├── reports-service/          # TODO
│   │   └── storage-service/          # TODO
│   ├── libs/
│   │   ├── shared/                   # DONE: Filters, guards, middleware
│   │   ├── database/                 # TODO: ORM configuration
│   │   ├── auth/                     # DONE: JWT strategy
│   │   └── messaging/                # DONE: Kafka service
│   ├── docker-compose.yml            # DONE: All services configured
│   └── package.json                  # DONE: All scripts
├── frontend/
│   ├── sima-qa/                      # DONE: Dashboard interface
│   ├── sima-prod/                    # TODO: Production portal
│   └── microfrontends/               # TODO: 3 microfrontends
├── infrastructure/
│   ├── main.tf                       # DONE: Extended Terraform
│   ├── scripts/
│   │   ├── titan-setup.sh            # DONE: Node initialization
│   │   ├── mongodb-setup.sh          # TODO
│   │   ├── kafka-setup.sh            # TODO
│   │   ├── rabbitmq-setup.sh         # TODO
│   │   └── mqtt-setup.sh             # TODO
│   └── docker/                       # Docker service configs
└── .github/workflows/
    ├── ci-backend.yml                # DONE
    ├── deploy-qa.yml                 # DONE
    └── deploy-prod.yml               # DONE
```

---

## Implementation Priority (By Importance)

### Priority 1: Core Microservices (Hours 1-8)
1. **Users Service** - User management, roles, permissions
2. **Audit Service** - Event logging, compliance tracking
3. **Auth Service** - Already done, needs integration tests
4. **Assets Service** - Core asset management

### Priority 2: Communication Layer (Hours 9-10)
1. **Inter-service messaging** - Kafka topics
2. **Event streaming** - Publish/subscribe patterns
3. **Error handling** - Retry logic, dead-letter queues

### Priority 3: Additional Services (Hours 11-14)
1. **IoT Service** - Device management, telemetry
2. **Notifications Service** - Multi-channel notifications
3. **Reports Service** - Analytics and export
4. **Storage Service** - File management

### Priority 4: Go Service (Hours 15-16)
1. **Calculator Service** - Parallel processing
2. **gRPC endpoints** - Inter-service communication
3. **Performance optimization** - Go concurrency

### Priority 5: Frontend (Hours 17-20)
1. **Microfrontends** - Dashboard, Analytics, Settings
2. **Production Portal** - Main user interface
3. **Shared components** - Reusable UI library
4. **Electron wrapper** - Desktop application

### Priority 6: Testing & Deployment (Hours 21-24)
1. **Unit tests** - 85%+ coverage
2. **Integration tests** - Service communication
3. **E2E tests** - User workflows
4. **Production deployment** - AWS infrastructure
5. **Monitoring setup** - Prometheus/Grafana
6. **Documentation** - Final completion

---

## Next Immediate Commands

```bash
# Start where left off
cd /c/Users/derec/Desktop/UCE/S9-001/Pogramacion\ Distribuida/SIMA-Platform/sima-platform

# Verify current state
git status
npm run lint
npm run build

# Start implementing Users Service
cd backend/sima-backend/apps-services/users-service
# Create module, controller, service, entity, dto

# Run tests
npm run test

# Push to GitHub
git add .
git commit -m "feat: implement users service"
git push origin develop
```

---

## Development Standards

### Code Quality
- ESLint must pass: `npm run lint`
- No hardcoded values
- TypeScript strict mode
- English comments only
- Conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`

### Testing Requirements
- Unit tests for all services
- Integration tests for database
- E2E tests for critical paths
- Minimum 80% coverage on critical paths
- Run with: `npm run test:ci`

### Documentation
- Swagger/OpenAPI for all APIs
- README for each service
- Comments for complex logic
- Type definitions with JSDoc

### Security
- JWT validation on all protected endpoints
- RBAC checks for authorization
- Input validation with class-validator
- No password logs or sensitive data in logs
- SQL injection prevention (TypeORM)

### Performance
- API response time < 200ms (p95)
- Database queries < 50ms (p95)
- Memory usage < 512MB per service
- Enable caching where appropriate

---

## Testing Commands Reference

```bash
# Backend tests
npm run test                 # All tests
npm run test:watch         # Watch mode
npm run test:ci            # CI mode with coverage
npm run test:e2e           # End-to-end tests

# Frontend tests
npm run test               # Tests in frontend/
npm run test:coverage      # With coverage report

# Specific service tests
cd apps-services/auth-service
npm run test               # Service-specific tests

# Load testing
npm run test:load          # Performance testing
```

---

## Deployment Pipeline

### QA Environment
```bash
# Automatic on push to develop
git push origin develop     # Triggers GitHub Actions
# CI/CD pipeline runs automatically
```

### Production Environment
```bash
# Automatic on tag
git tag -a v1.0.0
git push origin main --tags
# Full deployment pipeline runs
```

### Manual Deployment
```bash
# Plan infrastructure
npm run infra:plan

# Apply infrastructure
npm run infra:apply

# Build Docker images
npm run docker:build

# Deploy services
docker-compose up -d
```

---

## Key Configuration Files to Update

### Environment Variables
- `.env.qa` - QA environment secrets
- `.env.prod` - Production secrets
- AWS credentials in GitHub Secrets

### Infrastructure
- `infrastructure/terraform.tfvars` - AWS configuration
- `infrastructure/scripts/` - Service setup scripts

### CI/CD
- GitHub Secrets for AWS, Docker Hub credentials
- Webhook configurations

---

## Super Admin Configuration

**Default Super Admin**:
- **Name**: Dereck Amacoria
- **Email**: DSAMACORIA@UCE.EDU.EC
- **Role**: SUPER_ADMIN
- **Permissions**: Full access to all services

**Setup in Users Service**:
```typescript
// seed_admin.js
const superAdmin = {
  email: 'DSAMACORIA@UCE.EDU.EC',
  name: 'Dereck Amacoria',
  password: hash('initial-password'),
  role: 'SUPER_ADMIN',
  isActive: true,
};

await usersService.create(superAdmin);
```

---

## Troubleshooting Checklist

### Services not starting
```bash
docker-compose down -v
docker-compose up --build
npm run health:check
```

### Database connection issues
```bash
# Check PostgreSQL
docker ps | grep postgres
npm run db:migrate
npm run db:seed
```

### Port conflicts
```bash
lsof -i :3000
kill -9 <PID>
```

### Build errors
```bash
npm ci --force
npm run clean
npm run build
```

---

## Important Notes for Next Session

1. **Continue from Users Service** - This is the next priority
2. **Run tests frequently** - Ensure zero compilation errors
3. **Use Docker Compose** - Simplifies local development
4. **Push to develop branch** - QA deployment is automatic
5. **Monitor GitHub Actions** - CI/CD validation
6. **Follow naming conventions** - Consistent across codebase
7. **Keep comments in English** - Code and documentation
8. **Super Admin is Dereck** - Don't change permissions lightly
9. **24-hour goal** - Stay focused on the timeline
10. **Ask for clarification** - If requirements are unclear

---

## External References

- **TypeScript**: https://www.typescriptlang.org/docs/
- **NestJS**: https://docs.nestjs.com/
- **React/Next.js**: https://nextjs.org/docs
- **Terraform**: https://www.terraform.io/docs/
- **Docker**: https://docs.docker.com/
- **AWS**: https://docs.aws.amazon.com/

---

## Contact Information

**Project Owner**: Dereck Amacoria  
**Email**: DSAMACORIA@UCE.EDU.EC  
**Organization**: Universidad Central del Ecuador (UCE)  
**Repository**: `git@github.com:youruser/sima-platform.git`

---

## Session Summary

**Session 1 Accomplishments**:
- ✅ Complete project architecture designed
- ✅ Infrastructure as Code (Terraform) extended
- ✅ Docker Compose for local development
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Auth Service with JWT
- ✅ QA Testing Dashboard
- ✅ Shared libraries created
- ✅ Comprehensive documentation

**Next Session Focus**:
- Users Service (1-2 hours)
- Assets Service (2 hours)
- Audit Service (2 hours)
- IoT Service (2 hours)
- Continue with remaining services...

---

**Project Start**: January 25, 2026, 00:00  
**Session 1 End**: January 25, 2026, ~06:00  
**Target Completion**: January 26, 2026, 00:00  
**Overall Progress**: 40%

**Status**: ON TRACK ✅

Use this prompt at the start of the next development session to maintain context and continue implementation.

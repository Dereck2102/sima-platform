<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# 🤖 PROMPT MAESTRO PARA IA ANTIGRAVITY - PROYECTO SIMA


***

## 📌 CONTEXTO DEL ENTORNO DE TRABAJO

**IDE**: Antigravity con modelo OPUS
**Integración**: GitHub + GitHub Actions + Docker
**Manifest Path**: `/docs/SIMA_MANIFEST.md` (fuente de verdad del estado actual)
**Branch Strategy**:

- `develop` → Todo el desarrollo actual (TÚ TRABAJAS AQUÍ)
- `qa` → Pre-producción para testing
- `prod` (main) → Producción (requiere aprobación de Ing. Juan Guevara)

***

## 🎯 TU MISIÓN PRINCIPAL

Eres responsable de **auditar, adaptar y optimizar** el proyecto SIMA para cumplir con los nuevos requerimientos de **automatización total y deployment en AWS Academy** bajo estrictas restricciones de presupuesto y permisos.

### Principios Rectores

1. **AUTOMATIZACIÓN ABSOLUTA**: Todo debe ejecutarse con mínima intervención humana
2. **AUDITORÍA PROFUNDA**: Lee TODO el código antes de modificar
3. **CAMBIOS ESENCIALES**: Solo modifica lo necesario, no reescribas código funcional
4. **APP FUNCIONAL**: El objetivo es una aplicación lista para producción, NO demos de Chaos Testing
5. **TESTING AUTOMATIZADO**: Tests ejecutados desde interfaz automatizada, separados del código fuente

***

## 📂 ESTADO ACTUAL DEL PROYECTO (Lee `/docs/SIMA_MANIFEST.md`)

### Arquitectura Existente

- **Monorepo NX**: 16 apps (12 microservicios + 4 microfrontends)
- **Microservicios funcionando al 97%**: Auth, Tenant, Inventory, Audit, Search, Report, Notification, Storage, Mobile-BFF, Geo-Tracker (Go), Analytics (Python), API Gateway
- **Frontend**: Shell-App + Assets MFE + Dashboard MFE + Users MFE (Module Federation)
- **Mobile**: React Native (sima-mobile)
- **Infraestructura local**: Docker Compose completo y funcional
- **IaC parcial**: Terraform básico + GitHub Actions configurados


### Stack Tecnológico Confirmado

```yaml
Backend: NestJS 11 (TypeScript), Go, Python (FastAPI)
Frontend: React + Module Federation, React Native
Databases: PostgreSQL 15, MongoDB 6, Redis
Messaging: Kafka, RabbitMQ
Storage: MinIO
Monitoring: Prometheus + Grafana
Container: Docker + Docker Compose
CI/CD: GitHub Actions
IaC: Terraform
```


***

## 🚨 RESTRICCIONES AWS ACADEMY (CRÍTICAS)

### Limitaciones de Presupuesto

- **2 cuentas AWS Academy disponibles**
    - Cuenta 1: \$50 USD para **QA** (usar ahora)
    - Cuenta 2: \$50 USD para **PROD** (reservada)
- **Monitoreo obligatorio**: AWS Budgets se actualiza cada 8-12 horas
- **Si se excede el presupuesto**: Cuenta deshabilitada, pérdida total de recursos


### Limitaciones IAM y Servicios

```yaml
Regiones permitidas: us-east-1, us-west-2 SOLAMENTE
IAM: NO crear roles, usar SOLO LabRole y LabInstanceProfile
EC2:
  - Máximo: 9 instancias concurrentes
  - Máximo: 32 vCPUs totales
  - Tipos: nano, micro, small, medium, large
  - AMIs: Quick Start, Community (NO Marketplace)
EBS:
  - Tamaño máximo: 100GB
  - Tipos: gp2, gp3, sc1, standard (NO PIOPS)
RDS:
  - Engines: Aurora, MySQL, PostgreSQL, MariaDB, SQL Server, Oracle
  - Tipos: nano, micro, small, medium
  - Storage: máx 100GB, tipo gp2
  - NO enhanced monitoring
  - Auto-start después de 7 días stopped
```


### Servicios Permitidos que Pueden Usar LabRole

✅ API Gateway, Lambda, ECS, Fargate, ALB, ASG, S3, RDS, ElastiCache, CloudWatch, CloudFormation, SNS, SQS, Secrets Manager, CloudFront, WAF

***

## 📋 REQUERIMIENTOS OBLIGATORIOS (29 ITEMS)

Debes asegurar que **QA y PROD** cumplan con:

### Infrastructure \& DevOps (Prioridad Alta)

- [x] Monorepo configurado
- [x] 10+ microservicios implementados
- [ ] **ASG + ELB en QA y PROD** ← IMPLEMENTAR
- [ ] **Terraform completo y funcional** ← COMPLETAR
- [ ] **GitHub Actions CI/CD robusto** ← MEJORAR
- [ ] **Docker images en DockerHub/GHCR** ← AUTOMATIZAR
- [ ] **Multi-VPC (QA y PROD aisladas)** ← IMPLEMENTAR
- [ ] **Backups automáticos de DB** ← IMPLEMENTAR
- [ ] **EC2 auto-provisioning** ← IMPLEMENTAR


### Architecture \& Communication

- [x] Event-Driven Architecture (Kafka)
- [x] Microservicios + CQRS
- [x] REST API + WebSocket
- [ ] **SOAP + GRPC + MQTT** ← AÑADIR SI FALTA
- [x] API Gateway centralizado
- [x] Microfrontends (3+)


### Testing \& Quality

- [ ] **Load Testing automatizado** ← IMPLEMENTAR (interfaz automatizada)
- [ ] **Unit Testing en CI/CD** ← IMPLEMENTAR
- [ ] **Functional Testing** ← IMPLEMENTAR
- [ ] **Interfaz de testing automatizada** ← CREAR


### Platform \& Orchestration

- [ ] **Kubernetes deployment** ← IMPLEMENTAR (si presupuesto lo permite)
- [x] Multi-plataforma (Web, Mobile, Desktop)
- [ ] **Multi-región en PROD** ← PLANIFICAR
- [x] Cache management (Redis)
- [x] Monitoring (Prometheus + Grafana)


### Automation \& Documentation

- [ ] **n8n para procesos de negocio** ← IMPLEMENTAR
- [ ] **README completo con comandos** ← ACTUALIZAR
- [x] Swagger documentation
- [x] Conventional commits

***

## 🔧 MODIFICACIONES REQUERIDAS (DETALLES TÉCNICOS)

### 1. AUTOMATIZACIÓN TOTAL DEL DEPLOYMENT

#### Objetivo

Deployment completo con "un par de clicks" desde GitHub Actions.

#### Implementación Requerida

```yaml
# .github/workflows/deploy-qa.yml
name: Deploy to QA
on:
  push:
    branches: [qa]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_QA }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_QA }}
          aws-session-token: ${{ secrets.AWS_SESSION_TOKEN_QA }}
          aws-region: us-east-1
      
      - name: Check existing infrastructure
        run: |
          chmod +x ./infrastructure/scripts/check-infra.sh
          ./infrastructure/scripts/check-infra.sh qa
      
      - name: Terraform Apply
        run: |
          cd infrastructure/terraform/environments/qa
          terraform init
          terraform plan -out=tfplan
          terraform apply -auto-approve tfplan
      
      - name: Deploy Docker containers
        run: |
          chmod +x ./infrastructure/scripts/deploy-containers.sh
          ./infrastructure/scripts/deploy-containers.sh qa
      
      - name: Health check
        run: |
          chmod +x ./infrastructure/scripts/health-check.sh
          ./infrastructure/scripts/health-check.sh qa
```


### 2. SCRIPTS IDEMPOTENTES E INTELIGENTES

#### Script: `infrastructure/scripts/check-infra.sh`

```bash
#!/bin/bash
# Verifica infraestructura existente antes de crear/actualizar

ENV=$1  # qa | prod
REGION="us-east-1"

echo "🔍 Checking existing infrastructure for $ENV..."

# Check VPC
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=tag:Environment,Values=$ENV" "Name=tag:Project,Values=SIMA" \
  --query 'Vpcs[^0].VpcId' --output text)

if [ "$VPC_ID" != "None" ]; then
  echo "✅ VPC exists: $VPC_ID"
  echo "VPC_EXISTS=true" >> $GITHUB_ENV
else
  echo "❌ VPC not found. Will create new one."
  echo "VPC_EXISTS=false" >> $GITHUB_ENV
fi

# Check ASG
ASG_NAME="sima-$ENV-asg"
ASG_EXISTS=$(aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names $ASG_NAME \
  --query 'AutoScalingGroups[^0].AutoScalingGroupName' --output text)

if [ "$ASG_EXISTS" != "None" ]; then
  echo "✅ ASG exists: $ASG_NAME"
  CURRENT_CAPACITY=$(aws autoscaling describe-auto-scaling-groups \
    --auto-scaling-group-names $ASG_NAME \
    --query 'AutoScalingGroups[^0].DesiredCapacity' --output text)
  echo "   Current capacity: $CURRENT_CAPACITY instances"
else
  echo "❌ ASG not found. Will create new one."
fi

# Check RDS
RDS_ID="sima-$ENV-postgres"
RDS_STATUS=$(aws rds describe-db-instances \
  --db-instance-identifier $RDS_ID \
  --query 'DBInstances[^0].DBInstanceStatus' --output text 2>/dev/null)

if [ $? -eq 0 ]; then
  echo "✅ RDS exists: $RDS_ID (Status: $RDS_STATUS)"
  if [ "$RDS_STATUS" == "stopped" ]; then
    echo "⚠️  RDS is stopped. Starting..."
    aws rds start-db-instance --db-instance-identifier $RDS_ID
  fi
else
  echo "❌ RDS not found. Will create new one."
fi

# Check ELB
ELB_NAME="sima-$ENV-alb"
ELB_ARN=$(aws elbv2 describe-load-balancers \
  --names $ELB_NAME \
  --query 'LoadBalancers[^0].LoadBalancerArn' --output text 2>/dev/null)

if [ $? -eq 0 ]; then
  echo "✅ ELB exists: $ELB_NAME"
else
  echo "❌ ELB not found. Will create new one."
fi

# Check ElastiCache
REDIS_ID="sima-$ENV-redis"
REDIS_STATUS=$(aws elasticache describe-cache-clusters \
  --cache-cluster-id $REDIS_ID \
  --query 'CacheClusters[^0].CacheClusterStatus' --output text 2>/dev/null)

if [ $? -eq 0 ]; then
  echo "✅ ElastiCache exists: $REDIS_ID (Status: $REDIS_STATUS)"
else
  echo "❌ ElastiCache not found. Will create new one."
fi

echo ""
echo "📊 Infrastructure audit complete for $ENV"
```


#### Script: `infrastructure/scripts/deploy-containers.sh`

```bash
#!/bin/bash
# Despliega contenedores Docker en EC2 desde DockerHub

ENV=$1
REGION="us-east-1"
DOCKER_USER="dereck2102"  # Ajustar a tu usuario real

echo "🚀 Deploying Docker containers to $ENV..."

# Get EC2 instances in ASG
ASG_NAME="sima-$ENV-asg"
INSTANCE_IDS=$(aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names $ASG_NAME \
  --query 'AutoScalingGroups[^0].Instances[*].InstanceId' \
  --output text)

if [ -z "$INSTANCE_IDS" ]; then
  echo "❌ No EC2 instances found in ASG"
  exit 1
fi

echo "📦 Found instances: $INSTANCE_IDS"

# Deploy to each instance
for INSTANCE_ID in $INSTANCE_IDS; do
  echo ""
  echo "🔧 Deploying to instance: $INSTANCE_ID"
  
  # Execute commands via SSM (no SSH needed!)
  aws ssm send-command \
    --instance-ids $INSTANCE_ID \
    --document-name "AWS-RunShellScript" \
    --parameters 'commands=[
      "cd /home/ec2-user",
      "docker pull '$DOCKER_USER'/sima-api-gateway:'$ENV'",
      "docker pull '$DOCKER_USER'/sima-auth-service:'$ENV'",
      "docker pull '$DOCKER_USER'/sima-tenant-service:'$ENV'",
      "docker pull '$DOCKER_USER'/sima-inventory-service:'$ENV'",
      "docker-compose -f docker-compose.'$ENV'.yml up -d"
    ]' \
    --output text
done

echo ""
echo "✅ Deployment complete!"
```


### 3. TERRAFORM MODULAR Y COMPLETO

#### Estructura Requerida

```
infrastructure/terraform/
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── security/
│   │   ├── main.tf (Security Groups)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── ec2-asg/
│   │   ├── main.tf (Launch Template + ASG)
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── user-data.sh
│   ├── elb/
│   │   ├── main.tf (ALB + Target Groups)
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── rds/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── elasticache/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── qa/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       ├── terraform.tfvars
│       └── backend.tf
└── scripts/
    ├── check-infra.sh
    ├── deploy-containers.sh
    ├── health-check.sh
    └── cleanup.sh
```


#### Archivo: `infrastructure/terraform/environments/qa/main.tf`

```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "SIMA"
      Environment = "qa"
      ManagedBy   = "Terraform"
      Owner       = "Dereck Amacoria"
      University  = "UCE"
    }
  }
}

# Data source for existing LabRole
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

data "aws_iam_instance_profile" "lab_profile" {
  name = "LabInstanceProfile"
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"
  
  environment         = "qa"
  vpc_cidr           = "10.0.0.0/16"
  public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]
  availability_zones  = ["us-east-1a", "us-east-1b"]
}

# Security Groups Module
module "security" {
  source = "../../modules/security"
  
  environment = "qa"
  vpc_id      = module.vpc.vpc_id
}

# RDS Module
module "rds" {
  source = "../../modules/rds"
  
  environment          = "qa"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  engine_version       = "15.4"
  db_name             = "sima_qa"
  db_username         = "sima_admin"
  db_password         = var.db_password
  subnet_ids          = module.vpc.private_subnet_ids
  security_group_ids  = [module.security.rds_sg_id]
  backup_retention    = 7
  multi_az            = false  # Single AZ for cost savings in QA
}

# ElastiCache Module
module "elasticache" {
  source = "../../modules/elasticache"
  
  environment         = "qa"
  node_type          = "cache.t3.micro"
  num_cache_nodes    = 1
  subnet_ids         = module.vpc.private_subnet_ids
  security_group_ids = [module.security.redis_sg_id]
}

# ALB Module
module "elb" {
  source = "../../modules/elb"
  
  environment         = "qa"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.public_subnet_ids
  security_group_ids = [module.security.alb_sg_id]
}

# ASG Module
module "ec2_asg" {
  source = "../../modules/ec2-asg"
  
  environment           = "qa"
  vpc_id               = module.vpc.vpc_id
  subnet_ids           = module.vpc.private_subnet_ids
  security_group_ids   = [module.security.ec2_sg_id]
  instance_type        = "t3.micro"
  min_size             = 2
  max_size             = 6
  desired_capacity     = 2
  target_group_arns    = [module.elb.target_group_arn]
  iam_instance_profile = data.aws_iam_instance_profile.lab_profile.name
  
  user_data = templatefile("${path.module}/user-data.sh", {
    environment = "qa"
    docker_user = var.docker_username
    rds_endpoint = module.rds.endpoint
    redis_endpoint = module.elasticache.endpoint
  })
}

# Outputs
output "alb_dns_name" {
  value = module.elb.alb_dns_name
}

output "rds_endpoint" {
  value = module.rds.endpoint
}

output "redis_endpoint" {
  value = module.elasticache.endpoint
}
```


### 4. SEPARACIÓN TOTAL QA vs PROD

#### VPCs Completamente Aisladas

```hcl
# QA VPC
vpc_cidr = "10.0.0.0/16"

# PROD VPC (Cuenta AWS diferente)
vpc_cidr = "172.31.0.0/16"

# NO VPC Peering
# NO Transit Gateway
# NO rutas compartidas
# Cuentas AWS completamente separadas
```


#### Variables por Ambiente

```hcl
# environments/qa/terraform.tfvars
aws_region = "us-east-1"
environment = "qa"
instance_type = "t3.micro"
rds_instance_class = "db.t3.micro"
min_instances = 2
max_instances = 6
enable_multi_az = false

# environments/prod/terraform.tfvars
aws_region = "us-east-1"
environment = "prod"
instance_type = "t3.small"
rds_instance_class = "db.t3.small"
min_instances = 3
max_instances = 9
enable_multi_az = true
```


### 5. TESTING AUTOMATIZADO CON INTERFAZ

#### Implementar Testing Dashboard

```
apps/testing-dashboard/
├── src/
│   ├── components/
│   │   ├── LoadTestPanel.tsx
│   │   ├── UnitTestPanel.tsx
│   │   ├── FunctionalTestPanel.tsx
│   │   └── ResultsViewer.tsx
│   ├── services/
│   │   ├── k6.service.ts
│   │   ├── jest.service.ts
│   │   └── playwright.service.ts
│   └── App.tsx
├── tests/
│   ├── load/
│   │   ├── scenarios/
│   │   │   ├── login-stress.js
│   │   │   ├── asset-crud-load.js
│   │   │   └── api-gateway-spike.js
│   │   └── k6.config.js
│   ├── unit/
│   │   └── run-all-tests.sh
│   └── functional/
│       └── playwright.config.ts
└── package.json
```


#### Dashboard Features

- **Load Testing**: Ejecutar scripts k6 desde interfaz web
- **Unit Testing**: Ver resultados de Jest en tiempo real
- **Functional Testing**: Ejecutar Playwright tests
- **Metrics**: CPU, Memory, Response Time, Error Rate
- **Reports**: Exportar resultados a PDF/CSV


### 6. README COMPLETO

```markdown
# 🚀 SIMA Platform - Complete Setup Guide

## 📋 Prerequisites

- Node.js 20+
- Docker Desktop
- AWS CLI configured
- Terraform 1.5+
- Git

## 🏠 Local Development

### 1. Clone Repository
```bash
git clone https://github.com/Dereck2102/sima-platform.git
cd sima-platform
```


### 2. Install Dependencies

```bash
npm install
```


### 3. Setup Environment Variables

```bash
cp .env.example .env
# Edit .env with your credentials
```


### 4. Start Infrastructure Services

```bash
docker-compose up -d
```


### 5. Run Microservices

```bash
# Start all services
npm run start:all

# Or start individually
npm run start api-gateway
npm run start auth-service
npm run start tenant-service
```


### 📍 Service Ports

| Service | Port | URL |
| :-- | :-- | :-- |
| API Gateway | 3000 | http://localhost:3000 |
| Auth Service | 3002 | http://localhost:3002 |
| Tenant Service | 3003 | http://localhost:3003 |
| Inventory Service | 3004 | http://localhost:3004 |
| Search Service | 3008 | http://localhost:3008 |
| Notification Service | 3006 | http://localhost:3006 |
| Storage Service | 3005 | http://localhost:3005 |
| Report Service | 3007 | http://localhost:3007 |
| Mobile BFF | 3011 | http://localhost:3011 |
| Geo Tracker (Go) | 3009 | http://localhost:3009 |
| Analytics (Python) | 3010 | http://localhost:3010 |
| Shell App | 4100 | http://localhost:4100 |
| Assets MFE | 4101 | http://localhost:4101 |
| Dashboard MFE | 4102 | http://localhost:4102 |
| Users MFE | 4103 | http://localhost:4103 |

## ☁️ QA Deployment

### Prerequisites

- AWS Academy account with \$50 budget
- GitHub repository secrets configured
- DockerHub account


### Deploy to QA

```bash
# Push to qa branch
git checkout qa
git merge develop
git push origin qa

# GitHub Actions will automatically:
# 1. Build Docker images
# 2. Push to DockerHub
# 3. Check existing infrastructure
# 4. Apply Terraform changes
# 5. Deploy containers
# 6. Run health checks
```


### Manual QA Deployment

```bash
cd infrastructure/terraform/environments/qa
terraform init
terraform plan
terraform apply

# Deploy containers
cd ../../../scripts
./deploy-containers.sh qa
```


## 🏭 Production Deployment

### Prerequisites

- Approval from Ing. Juan Guevara
- Production AWS account
- All QA tests passed


### Deploy to PROD

```bash
# Create pull request from qa to main
# Wait for approval
# Merge will trigger production deployment

# Manual deployment
git checkout main
git merge qa
git push origin main
```


## 🧪 Testing

### Run All Tests

```bash
npm run test
```


### Unit Tests

```bash
npm run test:unit
```


### E2E Tests

```bash
npm run test:e2e
```


### Load Tests

```bash
cd tests/load
k6 run scenarios/login-stress.js
```


## 🐳 Docker Commands

### Build All Images

```bash
docker-compose build
```


### View Logs

```bash
docker-compose logs -f [service-name]
```


### Stop All Services

```bash
docker-compose down
```


### Clean Everything

```bash
docker-compose down -v
docker system prune -a
```


## 📊 Monitoring

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)


## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart service
docker-compose restart postgres
```


### Kafka Issues

```bash
# Check Kafka broker
docker-compose logs kafka

# Create topic manually
docker-compose exec kafka kafka-topics --create \
  --topic asset.events \
  --bootstrap-server localhost:9092
```


## 📚 Additional Resources

- [Architecture Design](docs/ARCHITECTURE-DESIGN.pdf)
- [Technical Report](docs/TECHNICAL-REPORT.pdf)
- [API Documentation](http://localhost:3000/api)
- [SIMA Manifest](docs/SIMA_MANIFEST.md)

```

***

## 🎯 PLAN DE ACCIÓN PARA LA IA (PASO A PASO)

### FASE 1: AUDITORÍA COMPLETA (2-4 horas)
1. Lee **TODO** el código en `/apps` y `/libs`
2. Identifica código funcional vs código que necesita actualización
3. Revisa `/docs/SIMA_MANIFEST.md` para confirmar estado
4. Documenta hallazgos en `/docs/AUDIT_REPORT.md`

### FASE 2: TERRAFORM COMPLETO (4-6 horas)
1. Completar módulos faltantes en `/infrastructure/terraform/modules`
2. Configurar ambientes QA y PROD con variables separadas
3. Implementar VPCs completamente aisladas
4. Añadir outputs necesarios para GitHub Actions
5. Probar `terraform plan` sin errores

### FASE 3: SCRIPTS DE AUTOMATIZACIÓN (3-4 horas)
1. Crear `check-infra.sh` (idempotente)
2. Crear `deploy-containers.sh` (pull from DockerHub)
3. Crear `health-check.sh` (validación post-deploy)
4. Crear `cleanup.sh` (limpieza de recursos)
5. Hacer todos los scripts ejecutables y con manejo de errores

### FASE 4: GITHUB ACTIONS ROBUSTO (2-3 horas)
1. Mejorar `ci.yml` (build + test)
2. Completar `deploy-qa.yml` (automated)
3. Completar `deploy-prod.yml` (manual approval)
4. Mejorar `docker-publish.yml` (multi-registry)
5. Añadir notificaciones de éxito/fallo

### FASE 5: TESTING AUTOMATIZADO (4-6 horas)
1. Crear `apps/testing-dashboard` con React
2. Integrar k6 para load testing
3. Integrar Jest para unit testing
4. Integrar Playwright para E2E testing
5. Crear interfaz visual para ejecutar y ver resultados

### FASE 6: FUNCIONALIDADES FALTANTES (6-8 horas)
1. Implementar SOAP endpoint (si no existe)
2. Implementar GRPC service (si no existe)
3. Implementar MQTT broker para IoT (si no existe)
4. Configurar n8n para automatización de procesos
5. Completar backup automático de bases de datos

### FASE 7: DOCUMENTACIÓN (2-3 horas)
1. Actualizar README principal con todos los comandos
2. Crear README en cada módulo de Terraform
3. Actualizar `/docs/SIMA_MANIFEST.md`
4. Documentar proceso de deployment en `/docs/DEPLOYMENT.md`

### FASE 8: VALIDACIÓN FINAL (2-3 horas)
1. Deployment de QA desde cero
2. Verificar aislamiento de VPCs
3. Ejecutar tests automatizados
4. Validar que presupuesto no se exceda
5. Documentar cualquier issue encontrado

***

## 📝 REGLAS DE TRABAJO

### DO ✅
- Leer código existente antes de modificar
- Usar `LabRole` y `LabInstanceProfile` exclusivamente
- Hacer commits con Conventional Commits
- Documentar cada cambio importante
- Probar localmente antes de push
- Mantener `/docs/SIMA_MANIFEST.md` actualizado
- Crear código idempotente
- Usar tags en todos los recursos AWS
- Monitorear presupuesto AWS constantemente
- Separar completamente QA y PROD

### DON'T ❌
- NO crear roles IAM personalizados
- NO usar servicios no permitidos en AWS Academy
- NO hardcodear credenciales
- NO exceder 9 instancias EC2 concurrentes
- NO usar tipos de instancia mayores a `large`
- NO reescribir código funcional sin razón
- NO hacer deploy a PROD sin aprobación
- NO conectar VPCs de QA y PROD
- NO exceder presupuesto de $50 por cuenta
- NO usar Chaos Testing para consumir presupuesto

***

## 🎓 OBJETIVO FINAL

Entregar una **aplicación SaaS multi-tenant completamente funcional** desplegada en AWS Academy con:

✅ Deployment automatizado (1-click)  
✅ Infraestructura como código (Terraform)  
✅ CI/CD robusto (GitHub Actions)  
✅ Testing automatizado con interfaz  
✅ Ambientes QA y PROD aislados  
✅ Monitoreo y alertas configuradas  
✅ Documentación completa  
✅ Presupuesto controlado  
✅ Alta disponibilidad (ASG + ELB)  
✅ Backups automáticos  

***

## 📌 ÚLTIMA INSTRUCCIÓN

**Antigravity OPUS**: Este es tu mapa completo. Comienza con la FASE 1 (auditoría) y avanza secuencialmente. Actualiza `/docs/SIMA_MANIFEST.md` después de cada fase completada. Trabaja SOLO en el branch `develop`. Haz commits frecuentes con mensajes descriptivos. Pregunta si algo no está claro antes de implementar.

**PRIORIDAD MÁXIMA**: Automatización + Funcionalidad + Documentación
<span style="display:none">[^1][^2][^3][^4][^5]</span>

<div align="center">⁂</div>

[^1]: ARCHITECTURE-DESIGN-_AMACORIA-DERECK.pdf
[^2]: AWS-README.md
[^3]: requeriments.xlsx
[^4]: TECHNICAL-REPORT_AMACORIA-DERECK.pdf
[^5]: SIMA_MANIFEST.md```


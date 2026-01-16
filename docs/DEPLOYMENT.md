# 🚀 SIMA Platform - Deployment Guide

Complete guide for deploying SIMA Platform to AWS Academy environments.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Academy Setup](#aws-academy-setup)
3. [GitHub Configuration](#github-configuration)
4. [QA Deployment](#qa-deployment)
5. [Production Deployment](#production-deployment)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Local Tools

```bash
# Install AWS CLI
# Windows: choco install awscli
# Mac: brew install awscli

# Install Terraform
# Windows: choco install terraform
# Mac: brew install terraform

# Verify installations
aws --version
terraform --version
```

### DockerHub Account

1. Create account at https://hub.docker.com
2. Create access token: Account Settings → Security → New Access Token
3. Note your username and token

---

## AWS Academy Setup

### 1. Access AWS Academy

1. Login to AWS Academy Learner Lab
2. Click "Start Lab"
3. Wait for lab to become ready (green indicator)

### 2. Get Credentials

Click "AWS Details" and copy:

```bash
AWS_ACCESS_KEY_ID=ASIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...  # Very long string
```

> ⚠️ **Important:** AWS Academy credentials expire every 4 hours!

### 3. Configure Local AWS CLI

```bash
aws configure
# Enter Access Key ID
# Enter Secret Access Key
# Region: us-east-1
# Output format: json

# For session token, create credentials file:
# ~/.aws/credentials
[default]
aws_access_key_id = ASIA...
aws_secret_access_key = ...
aws_session_token = ...
```

---

## GitHub Configuration

### Required Secrets

Go to: Repository → Settings → Secrets and variables → Actions

| Secret                  | Description     | Value                         |
| ----------------------- | --------------- | ----------------------------- |
| `AWS_ACCESS_KEY_ID`     | AWS access key  | From AWS Academy              |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key  | From AWS Academy              |
| `AWS_SESSION_TOKEN`     | Session token   | From AWS Academy              |
| `DB_PASSWORD`           | RDS password    | Strong password (min 8 chars) |
| `DOCKERHUB_USERNAME`    | DockerHub user  | Your username                 |
| `DOCKERHUB_TOKEN`       | DockerHub token | Your access token             |

### Update Secrets Script

Run this when AWS credentials expire:

```bash
# Get new credentials from AWS Academy
# Update GitHub secrets via CLI:
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
gh secret set AWS_SESSION_TOKEN
```

---

## QA Deployment

### Option 1: Automatic (Recommended)

```bash
# Merge code to qa branch
git checkout qa
git merge develop
git push origin qa

# GitHub Actions will automatically:
# 1. Build all Docker images
# 2. Check existing infrastructure
# 3. Apply Terraform changes
# 4. Deploy containers
# 5. Run health checks
```

### Option 2: Manual Deployment

```bash
# 1. Check infrastructure status
./infrastructure/scripts/check-infra.sh qa

# 2. Apply Terraform
cd infrastructure/terraform/environments/qa
terraform init
terraform plan -var="db_password=YourSecurePassword123!"
terraform apply

# 3. Build and push Docker images
docker build -t youruser/sima-api-gateway:qa -f apps/api-gateway/Dockerfile .
docker push youruser/sima-api-gateway:qa
# Repeat for all services...

# 4. Deploy containers
./infrastructure/scripts/deploy-containers.sh qa

# 5. Verify deployment
./infrastructure/scripts/health-check.sh qa
```

### Option 3: GitHub Actions Manual Trigger

1. Go to Actions → Deploy to QA
2. Click "Run workflow"
3. Select action: `deploy`
4. Click "Run workflow"

---

## Production Deployment

### Requirements

- [ ] All QA tests passing
- [ ] Approval from Ing. Juan Guevara
- [ ] Production AWS account ready

### Deployment Process

```bash
# 1. Create pull request
git checkout main
git pull origin main
gh pr create --base main --head qa --title "Release to Production"

# 2. Wait for approval

# 3. After merge, GitHub Actions deploys automatically
# Or use manual trigger in Actions
```

---

## Post-Deployment

### Verify Deployment

```bash
# Get ALB DNS
terraform output alb_url

# Test endpoints
curl http://<ALB_DNS>/api/health
curl http://<ALB_DNS>/api/auth/health
```

### Access Application

1. Get ALB DNS from Terraform outputs
2. Open in browser: `http://<ALB_DNS>`
3. Login with admin credentials

### Monitor Resources

```bash
# Check EC2 instances
aws ec2 describe-instances \
  --filters "Name=tag:Environment,Values=qa" \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name]'

# Check RDS
aws rds describe-db-instances \
  --db-instance-identifier sima-qa-postgres

# Check costs (updates every 8-12 hours)
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '7 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics "UnblendedCost"
```

---

## Cost Management

### AWS Academy Budget: $50

| Resource    | Type           | Est. Monthly Cost |
| ----------- | -------------- | ----------------- |
| EC2 (x2)    | t3.micro       | ~$15              |
| RDS         | db.t3.micro    | ~$12              |
| ElastiCache | cache.t3.micro | ~$12              |
| ALB         | -              | ~$17              |
| **Total**   |                | **~$56**          |

### Cost Saving Tips

1. **Stop RDS when not in use:**

   ```bash
   aws rds stop-db-instance --db-instance-identifier sima-qa-postgres
   ```

2. **Scale down ASG at night:**

   ```bash
   aws autoscaling set-desired-capacity \
     --auto-scaling-group-name sima-qa-asg \
     --desired-capacity 0
   ```

3. **Destroy infrastructure when done:**
   ```bash
   ./infrastructure/scripts/cleanup.sh qa
   ```

---

## Troubleshooting

### Terraform Errors

```bash
# "Error: Provider configuration not present"
terraform init -upgrade

# "Error: No valid credential sources"
# → Refresh AWS Academy credentials

# "Error: creating RDS instance: DBSubnetGroupNotAllowedFault"
# → Use public subnets for DB in AWS Academy
```

### Container Deployment Issues

```bash
# Check EC2 instance logs
aws ssm send-command \
  --instance-ids <instance-id> \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["docker ps -a", "docker logs sima-api-gateway"]'

# Get command output
aws ssm get-command-invocation \
  --command-id <command-id> \
  --instance-id <instance-id>
```

### Health Check Failures

```bash
# Check target group health
aws elbv2 describe-target-health \
  --target-group-arn <tg-arn>

# Check security groups
aws ec2 describe-security-groups \
  --group-ids <sg-id>
```

### Database Connection Issues

```bash
# Test from EC2 instance
aws ssm send-command \
  --instance-ids <instance-id> \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["nc -zv <rds-endpoint> 5432"]'
```

---

## Environment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Academy Account                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    VPC (10.0.0.0/16)                     │   │
│  │  ┌─────────────┐  ┌─────────────┐                       │   │
│  │  │ Public      │  │ Public      │                       │   │
│  │  │ Subnet A    │  │ Subnet B    │                       │   │
│  │  │ 10.0.1.0/24 │  │ 10.0.2.0/24 │                       │   │
│  │  │             │  │             │                       │   │
│  │  │ ┌─────────┐ │  │ ┌─────────┐ │      ┌─────────┐     │   │
│  │  │ │   EC2   │ │  │ │   EC2   │ │      │   ALB   │     │   │
│  │  │ │  ASG    │ │  │ │  ASG    │ │◄─────│         │◄────┼───│
│  │  │ └─────────┘ │  │ └─────────┘ │      └─────────┘     │   │
│  │  └──────┬──────┘  └──────┬──────┘                       │   │
│  │         │                │                              │   │
│  │         ▼                ▼                              │   │
│  │    ┌─────────────────────────────┐                      │   │
│  │    │         RDS PostgreSQL      │                      │   │
│  │    │      ElastiCache Redis      │                      │   │
│  │    └─────────────────────────────┘                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Contact

For deployment issues, contact:

- **Developer:** Dereck Amacoria
- **Supervisor:** Ing. Juan Guevara

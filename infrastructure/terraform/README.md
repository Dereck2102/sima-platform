# SIMA Platform - Terraform Infrastructure

## Directory Structure

```
infrastructure/terraform/
├── environments/
│   ├── qa/                 # QA environment configuration
│   │   ├── main.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── prod/               # PROD environment configuration
│       ├── main.tf
│       ├── terraform.tfvars
│       └── backend.tf
├── modules/
│   ├── vpc/                # VPC module (isolated networks)
│   ├── ec2-asg/            # Auto Scaling Group module
│   ├── elb/                # Application Load Balancer module
│   └── security/           # Security Groups module
└── README.md               # This file
```

## Quick Start

```bash
# Initialize Terraform (QA environment)
cd environments/qa
terraform init

# Plan changes
terraform plan -out=qa.plan

# Apply changes (creates infrastructure)
terraform apply qa.plan

# Destroy infrastructure (cleanup)
terraform destroy
```

## AWS Academy Constraints

- **Regions:** `us-east-1` and `us-west-2` only
- **Instance types:** `t3.micro`, `t2.small` (cost-saving)
- **IAM Role:** Must use `LabRole` and `LabInstanceProfile`
- **Max EC2:** 9 concurrent instances
- **Max vCPU:** 32 total
- **EBS:** Max 100GB, gp2/gp3 only

## Environment Variables Required

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

## Cost Estimate (per environment)

| Resource               | Estimated Monthly Cost |
| ---------------------- | ---------------------- |
| EC2 t3.micro (1x 24/7) | ~$7.50                 |
| ALB                    | ~$16.00                |
| EBS 20GB               | ~$1.60                 |
| Elastic IP             | ~$3.60                 |
| **Total**              | **~$28.70**            |

> **Note:** Stop EC2 instances when not in use to save costs!

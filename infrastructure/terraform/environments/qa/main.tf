# =============================================================================
# SIMA Platform - QA Environment
# Completely isolated from PROD (different VPC CIDR)
# =============================================================================

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
      Project     = "SIMA Platform"
      Environment = "qa"
      ManagedBy   = "Terraform"
      Institution = "UCE"
    }
  }
}

# =============================================================================
# Variables
# =============================================================================

variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "sima"
}

variable "environment" {
  default = "qa"
}

# QA VPC uses 10.0.0.0/16 (PROD uses 10.1.0.0/16 - NO OVERLAP)
variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "availability_zones" {
  default = ["us-east-1a", "us-east-1b"]
}

variable "instance_type" {
  default = "t3.micro" # Cost-saving
}

variable "github_repo" {
  default = "https://github.com/Dereck2102/sima-platform.git"
}

variable "github_branch" {
  default = "develop"
}

locals {
  common_tags = {
    Project     = "SIMA Platform"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# =============================================================================
# VPC Module
# =============================================================================

module "vpc" {
  source = "../../modules/vpc"

  project_name        = var.project_name
  environment         = var.environment
  vpc_cidr            = var.vpc_cidr
  public_subnet_cidrs = var.public_subnet_cidrs
  availability_zones  = var.availability_zones
  common_tags         = local.common_tags
}

# =============================================================================
# Security Module
# =============================================================================

module "security" {
  source = "../../modules/security"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  common_tags  = local.common_tags
}

# =============================================================================
# ELB Module
# =============================================================================

module "elb" {
  source = "../../modules/elb"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.public_subnet_ids
  security_group_ids = [module.security.alb_security_group_id]
  common_tags        = local.common_tags
}

# =============================================================================
# EC2 ASG Module
# =============================================================================

module "ec2_asg" {
  source = "../../modules/ec2-asg"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.public_subnet_ids
  security_group_ids = [module.security.ec2_security_group_id]
  instance_type      = var.instance_type
  key_name           = "vockey"
  target_group_arns  = [module.elb.target_group_arn]
  common_tags        = local.common_tags

  # QA: Downloads from GitHub, builds from source
  user_data = templatefile("${path.module}/../../scripts/bootstrap-qa.sh.tpl", {
    github_repo   = var.github_repo
    github_branch = var.github_branch
    environment   = var.environment
  })

  asg_min_size         = 1
  asg_max_size         = 2
  asg_desired_capacity = 1
}

# =============================================================================
# Outputs
# =============================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS Name"
  value       = module.elb.alb_dns_name
}

output "alb_url" {
  description = "Application URL"
  value       = "http://${module.elb.alb_dns_name}"
}

output "elastic_ip" {
  description = "Elastic IP for reference"
  value       = module.elb.elastic_ip
}

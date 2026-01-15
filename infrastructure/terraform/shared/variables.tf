# =============================================================================
# SIMA Platform - Terraform Shared Variables
# =============================================================================

variable "project_name" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "sima"
}

variable "environment" {
  description = "Environment name (qa, prod)"
  type        = string
  validation {
    condition     = contains(["qa", "prod"], var.environment)
    error_message = "Environment must be 'qa' or 'prod'."
  }
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
  validation {
    condition     = contains(["us-east-1", "us-west-2"], var.aws_region)
    error_message = "Region must be 'us-east-1' or 'us-west-2' (AWS Academy restriction)."
  }
}

# =============================================================================
# VPC Configuration
# =============================================================================

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
}

variable "availability_zones" {
  description = "Availability zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# =============================================================================
# EC2 Configuration
# =============================================================================

variable "instance_type" {
  description = "EC2 instance type (AWS Academy: nano, micro, small, medium, large)"
  type        = string
  default     = "t3.micro"
  validation {
    condition = contains([
      "t2.nano", "t2.micro", "t2.small", "t2.medium", "t2.large",
      "t3.nano", "t3.micro", "t3.small", "t3.medium", "t3.large"
    ], var.instance_type)
    error_message = "Instance type must be nano, micro, small, medium, or large (AWS Academy restriction)."
  }
}

variable "key_name" {
  description = "EC2 key pair name (use 'vockey' in us-east-1)"
  type        = string
  default     = "vockey"
}

variable "ami_id" {
  description = "AMI ID for EC2 instances (Amazon Linux 2)"
  type        = string
  default     = "" # Will be fetched dynamically
}

# =============================================================================
# Auto Scaling Configuration
# =============================================================================

variable "asg_min_size" {
  description = "Minimum number of instances in ASG"
  type        = number
  default     = 1
}

variable "asg_max_size" {
  description = "Maximum number of instances in ASG"
  type        = number
  default     = 2
}

variable "asg_desired_capacity" {
  description = "Desired number of instances in ASG"
  type        = number
  default     = 1
}

# =============================================================================
# Application Configuration
# =============================================================================

variable "github_repo" {
  description = "GitHub repository URL for SIMA Platform"
  type        = string
  default     = "https://github.com/Dereck2102/sima-platform.git"
}

variable "github_branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "develop"
}

variable "docker_registry" {
  description = "Docker registry for SIMA images"
  type        = string
  default     = "ghcr.io/dereck2102/sima-platform"
}

variable "docker_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

# =============================================================================
# Tags
# =============================================================================

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "SIMA Platform"
    ManagedBy   = "Terraform"
    Institution = "UCE"
  }
}

# =============================================================================
# SIMA Platform - Application Load Balancer Module
# =============================================================================

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "security_group_ids" {
  type = list(string)
}

variable "common_tags" {
  type = map(string)
}

# =============================================================================
# Application Load Balancer
# =============================================================================

resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = var.security_group_ids
  subnets            = var.subnet_ids

  enable_deletion_protection = false

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-alb"
    Environment = var.environment
  })
}

# =============================================================================
# Target Group
# =============================================================================

resource "aws_lb_target_group" "main" {
  name     = "${var.project_name}-${var.environment}-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/api/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    matcher             = "200"
  }

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-tg"
    Environment = var.environment
  })
}

# =============================================================================
# HTTP Listener
# =============================================================================

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-http-listener"
    Environment = var.environment
  })
}

# =============================================================================
# Elastic IP for ALB (Optional - for consistent IP)
# =============================================================================

resource "aws_eip" "alb" {
  domain = "vpc"

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-eip"
    Environment = var.environment
  })
}

# =============================================================================
# Outputs
# =============================================================================

output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "ALB DNS Name"
  value       = aws_lb.main.dns_name
}

output "target_group_arn" {
  description = "Target Group ARN"
  value       = aws_lb_target_group.main.arn
}

output "elastic_ip" {
  description = "Elastic IP"
  value       = aws_eip.alb.public_ip
}

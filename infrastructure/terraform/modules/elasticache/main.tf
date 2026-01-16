# =============================================================================
# SIMA Platform - ElastiCache Module
# Redis cache for session management and caching
# AWS Academy: cache.t3.micro
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

variable "node_type" {
  type    = string
  default = "cache.t3.micro"
}

variable "num_cache_nodes" {
  type    = number
  default = 1
}

variable "engine_version" {
  type    = string
  default = "7.0"
}

variable "port" {
  type    = number
  default = 6379
}

variable "common_tags" {
  type = map(string)
}

# =============================================================================
# Subnet Group
# =============================================================================

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-redis-subnet"
  subnet_ids = var.subnet_ids

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-redis-subnet"
    Environment = var.environment
  })
}

# =============================================================================
# ElastiCache Cluster
# =============================================================================

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "${var.project_name}-${var.environment}-redis"
  engine               = "redis"
  engine_version       = var.engine_version
  node_type            = var.node_type
  num_cache_nodes      = var.num_cache_nodes
  parameter_group_name = "default.redis7"
  port                 = var.port

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = var.security_group_ids

  # Maintenance
  maintenance_window = "sun:05:00-sun:06:00"

  # Snapshots (for prod only)
  snapshot_retention_limit = var.environment == "prod" ? 7 : 0
  snapshot_window         = var.environment == "prod" ? "04:00-05:00" : null

  # Apply changes immediately in QA
  apply_immediately = var.environment == "qa" ? true : false

  tags = merge(var.common_tags, {
    Name        = "${var.project_name}-${var.environment}-redis"
    Environment = var.environment
  })
}

# =============================================================================
# Outputs
# =============================================================================

output "endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_cluster.main.cache_nodes[0].address
}

output "port" {
  description = "Redis port"
  value       = aws_elasticache_cluster.main.cache_nodes[0].port
}

output "configuration_endpoint" {
  description = "Configuration endpoint (for cluster mode)"
  value       = aws_elasticache_cluster.main.configuration_endpoint
}

output "cluster_id" {
  description = "Cluster ID"
  value       = aws_elasticache_cluster.main.cluster_id
}

output "arn" {
  description = "ElastiCache ARN"
  value       = aws_elasticache_cluster.main.arn
}

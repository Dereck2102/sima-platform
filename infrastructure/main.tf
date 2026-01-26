terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "sima-terraform-state"
    key            = "sima/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = local.common_tags
  }
}

# ============================================================================
# LOCALS
# ============================================================================

locals {
  common_tags = {
    Project     = "SIMA"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Version     = "1.0.0"
  }

  service_ports = {
    api_gateway      = 3000
    auth_service     = 3001
    users_service    = 3002
    assets_service   = 3003
    audit_service    = 3004
    iot_service      = 3005
    notifications    = 3006
    reports_service  = 3007
    storage_service  = 3008
  }
}

# ============================================================================
# VPC AND NETWORKING
# ============================================================================

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "sima-vpc-${var.environment}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "sima-igw-${var.environment}"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "sima-public-${count.index + 1}-${var.environment}"
    Type = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 11}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "sima-private-${count.index + 1}-${var.environment}"
    Type = "Private"
  }
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count  = 2
  domain = "vpc"

  tags = {
    Name = "sima-nat-eip-${count.index + 1}-${var.environment}"
  }

  depends_on = [aws_internet_gateway.main]
}

# NAT Gateways
resource "aws_nat_gateway" "main" {
  count         = 2
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "sima-nat-${count.index + 1}-${var.environment}"
  }

  depends_on = [aws_internet_gateway.main]
}

# Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.main.id
  }

  tags = {
    Name = "sima-public-rt-${var.environment}"
  }
}

# Public Route Table Association
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private Route Tables
resource "aws_route_table" "private" {
  count  = 2
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "sima-private-rt-${count.index + 1}-${var.environment}"
  }
}

# Private Route Table Association
resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# ---------------- INTERNET ----------------

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

# --------------- ROUTES ----------------

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "sima-public-rt"
  }
}

resource "aws_route_table_association" "pub_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ------------- SECURITY GROUP ----------

resource "aws_security_group" "internal" {
  vpc_id = aws_vpc.main.id

  name = "sima-internal-sg"

  # Internal traffic
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # SSH from your PC only
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_ip]
  }

  # Outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "sima-internal"
  }
}

# --------------- AMI ------------------

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# --------------- TITAN ----------------

resource "aws_instance" "titan" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.large"

  subnet_id = aws_subnet.private.id

  vpc_security_group_ids = [
    aws_security_group.internal.id
  ]

  iam_instance_profile = var.lab_instance_profile

  user_data = file("${path.module}/titan-setup.sh")

  tags = {
    Name = "sima-titan"
  }
}

# ---------------- RDS -----------------

# DB Subnet Group (2 AZs) ✅ FIXED
resource "aws_db_subnet_group" "db" {
  name = "sima-db-subnet"

  subnet_ids = [
    aws_subnet.private.id,
    aws_subnet.private2.id
  ]

  tags = {
    Name = "sima-db-subnet"
  }
}

# Postgres
resource "aws_db_instance" "postgres" {
  allocated_storage = 20

  engine         = "postgres"
  engine_version = "14"

  instance_class = "db.t3.micro"

  db_name  = "simadb"
  username = "sima_admin"
  password = var.db_password

  db_subnet_group_name = aws_db_subnet_group.db.name

  skip_final_snapshot = true
  publicly_accessible = false

  vpc_security_group_ids = [
    aws_security_group.internal.id
  ]

  tags = {
    Name = "sima-postgres"
  }
}

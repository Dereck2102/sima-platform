provider "aws" {
  region = var.region
}

# ---------------- VPC ----------------

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "sima-vpc" }
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone = "us-east-1a"
}

resource "aws_subnet" "private" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "us-east-1a"
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

# --------------- ROUTES ---------------

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

resource "aws_route_table_association" "pub_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ------------- SECURITY GROUP ----------

resource "aws_security_group" "internal" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_ip]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --------------- AMI ------------------

data "aws_ami" "ubuntu" {
  most_recent = true
  owners = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# --------------- TITAN ----------------

resource "aws_instance" "titan" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.large"
  subnet_id     = aws_subnet.private.id

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

resource "aws_db_subnet_group" "db" {
  subnet_ids = [aws_subnet.private.id]
}

resource "aws_db_instance" "postgres" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "14"
  instance_class       = "db.t3.micro"
  name                 = "simadb"
  username             = "sima_admin"
  password             = var.db_password
  skip_final_snapshot  = true
  publicly_accessible  = false

  vpc_security_group_ids = [
    aws_security_group.internal.id
  ]

  db_subnet_group_name = aws_db_subnet_group.db.name
}

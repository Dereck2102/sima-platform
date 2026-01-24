variable "region" {
  default = "us-east-1"
}

variable "allowed_ssh_ip" {
  description = "Public IP for Bastion SSH"
  type        = string
}

variable "lab_instance_profile" {
  default = "LabInstanceProfile"
}

variable "db_password" {
  description = "Postgres password"
  type        = string
  sensitive   = true
}

output "titan_ip" {
  value = aws_instance.titan.private_ip
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}

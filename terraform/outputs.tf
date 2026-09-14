output "server_public_ip" {
  description = "The public IP address of the CPMS EC2 instance"
  value       = aws_instance.cpms_server.public_ip
}

output "frontend_url" {
  description = "URL to access the frontend"
  value       = "http://${aws_instance.cpms_server.public_ip}"
}

output "grafana_url" {
  description = "URL to access Grafana"
  value       = "http://${aws_instance.cpms_server.public_ip}:3000"
}

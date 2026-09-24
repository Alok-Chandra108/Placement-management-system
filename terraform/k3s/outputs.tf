output "master_public_ip" {
  description = "Public IP of the k3s master node (use this to run kubectl commands)"
  value       = aws_instance.k3s_master.public_ip
}

output "master_private_ip" {
  description = "Private IP of the k3s master node (used internally by the worker to join)"
  value       = aws_instance.k3s_master.private_ip
}

output "worker_public_ip" {
  description = "Public IP of the k3s worker node (access your app here)"
  value       = aws_instance.k3s_worker.public_ip
}

output "app_url" {
  description = "URL to access the CPMS frontend (running on the worker node)"
  value       = "http://${aws_instance.k3s_worker.public_ip}"
}

output "grafana_url" {
  description = "URL to access Grafana dashboard"
  value       = "http://${aws_instance.k3s_worker.public_ip}:3000"
}

output "next_steps" {
  description = "What to do after terraform apply finishes"
  value       = <<-EOT
    ✅ Cluster created! Wait ~2 minutes for k3s to start up, then:

    1. SSH into the MASTER via the AWS Console EC2 Instance Connect.
    2. Run: sudo k3s kubectl get nodes
       (Both master and worker should show as 'Ready')
    3. Apply your K8s manifests:
       sudo k3s kubectl apply -f /home/ec2-user/kubernetes/
    4. Visit your app at: http://${aws_instance.k3s_worker.public_ip}
  EOT
}

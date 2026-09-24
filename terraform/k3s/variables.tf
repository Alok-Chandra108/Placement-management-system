variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-south-1"
}

variable "master_instance_type" {
  description = "EC2 instance type for the k3s master (control plane). t3.small recommended for stability."
  type        = string
  default     = "t3.small"
}

variable "worker_instance_type" {
  description = "EC2 instance type for the k3s worker (data plane)"
  type        = string
  default     = "t3.micro"
}

variable "k3s_token" {
  description = "Shared secret token that allows worker nodes to join the master. Use a strong random string."
  type        = string
  sensitive   = true
  default     = "cpms-k3s-super-secret-token-2024"
}

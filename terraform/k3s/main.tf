terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ──────────────────────────────────────────────
# DATA SOURCES
# ──────────────────────────────────────────────

# Always use the latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# ──────────────────────────────────────────────
# SECURITY GROUPS
# ──────────────────────────────────────────────

# Security Group for the k3s Master (Control Plane)
resource "aws_security_group" "k3s_master_sg" {
  name        = "cpms-k3s-master-sg"
  description = "Security group for k3s master (control plane) node"

  # SSH via AWS EC2 Instance Connect (ap-south-1 range)
  ingress {
    description = "EC2 Instance Connect SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["13.233.177.0/29"]
  }

  # Kubernetes API Server — kubectl talks to this port
  ingress {
    description = "Kubernetes API Server"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # k3s supervisor / agent registration port
  ingress {
    description = "k3s supervisor"
    from_port   = 9345
    to_port     = 9345
    protocol    = "tcp"
    self        = true
  }

  # Flannel VXLAN — pod-to-pod networking between nodes
  ingress {
    description = "Flannel VXLAN (intra-cluster)"
    from_port   = 8472
    to_port     = 8472
    protocol    = "udp"
    self        = true
  }

  # Kubelet metrics — used by the control plane to monitor nodes
  ingress {
    description = "Kubelet metrics (intra-cluster)"
    from_port   = 10250
    to_port     = 10250
    protocol    = "tcp"
    self        = true
  }

  # All outbound traffic allowed
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "cpms-k3s-master-sg"
    Project = "CPMS"
    Role    = "k3s-master"
    Env     = "demo"
  }
}

# Security Group for the k3s Worker (Data Plane)
resource "aws_security_group" "k3s_worker_sg" {
  name        = "cpms-k3s-worker-sg"
  description = "Security group for k3s worker (data plane) node"

  # SSH via AWS EC2 Instance Connect
  ingress {
    description = "EC2 Instance Connect SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["13.233.177.0/29"]
  }

  # Frontend HTTP traffic from the internet
  ingress {
    description = "Frontend HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API traffic from the internet
  ingress {
    description = "Backend API"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana monitoring dashboard
  ingress {
    description = "Grafana"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Prometheus metrics
  ingress {
    description = "Prometheus"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Kubernetes NodePort range — required for LoadBalancer & NodePort services
  ingress {
    description = "Kubernetes NodePort range"
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Flannel VXLAN from master
  ingress {
    description     = "Flannel VXLAN (from master)"
    from_port       = 8472
    to_port         = 8472
    protocol        = "udp"
    security_groups = [aws_security_group.k3s_master_sg.id]
  }

  # Kubelet from master
  ingress {
    description     = "Kubelet (from master)"
    from_port       = 10250
    to_port         = 10250
    protocol        = "tcp"
    security_groups = [aws_security_group.k3s_master_sg.id]
  }

  # All outbound traffic allowed
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "cpms-k3s-worker-sg"
    Project = "CPMS"
    Role    = "k3s-worker"
    Env     = "demo"
  }
}

# ──────────────────────────────────────────────
# EC2 INSTANCES
# ──────────────────────────────────────────────

# k3s Master — Control Plane only (t3.small for stable k3s performance)
resource "aws_instance" "k3s_master" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.master_instance_type
  vpc_security_group_ids = [aws_security_group.k3s_master_sg.id]

  # Bootstrap script: installs k3s server (control plane)
  user_data = templatefile("${path.module}/master_user_data.sh", {
    k3s_token = var.k3s_token
  })

  tags = {
    Name    = "CPMS-k3s-Master"
    Project = "CPMS"
    Role    = "k3s-master"
    Env     = "demo"
  }
}

# k3s Worker — Data Plane (runs your actual application pods)
resource "aws_instance" "k3s_worker" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.worker_instance_type
  vpc_security_group_ids = [aws_security_group.k3s_worker_sg.id]

  # Bootstrap script: installs k3s agent and joins the master
  user_data = templatefile("${path.module}/worker_user_data.sh", {
    k3s_token         = var.k3s_token
    master_private_ip = aws_instance.k3s_master.private_ip
  })

  # Worker must wait for master to be created first
  depends_on = [aws_instance.k3s_master]

  tags = {
    Name    = "CPMS-k3s-Worker"
    Project = "CPMS"
    Role    = "k3s-worker"
    Env     = "demo"
  }
}

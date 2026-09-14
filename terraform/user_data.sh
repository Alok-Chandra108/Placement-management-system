#!/bin/bash
# This script runs automatically when the EC2 instance boots up

# Update the system
dnf update -y

# Install Docker
dnf install -y docker

# Start Docker service and enable it to run on startup
systemctl start docker
systemctl enable docker

# Add ec2-user to the docker group so you don't have to use 'sudo' for docker commands
usermod -aG docker ec2-user

# Install Docker Compose (V2)
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Create a directory for our app
mkdir -p /home/ec2-user/cpms-app
chown ec2-user:ec2-user /home/ec2-user/cpms-app

# (In a real scenario, this is where you would clone your git repository or download your docker-compose.yml)
# For now, the server is fully prepped with Docker and Docker Compose!
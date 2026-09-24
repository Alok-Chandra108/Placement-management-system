#!/bin/bash
# ============================================================
# k3s MASTER NODE BOOTSTRAP SCRIPT
# This runs automatically when the EC2 instance first boots.
# It installs k3s as the control plane (server mode).
# ============================================================
set -euo pipefail

# ── System updates ──────────────────────────────────────────
echo ">>> [1/5] Updating system packages..."
dnf update -y
dnf install -y git curl

# ── Install k3s as SERVER (control plane) ──────────────────
# K3S_TOKEN: pre-shared secret so worker nodes can join
# --disable traefik: we use our own Nginx ingress
# --write-kubeconfig-mode: makes kubeconfig readable without sudo
echo ">>> [2/5] Installing k3s server..."
curl -sfL https://get.k3s.io | K3S_TOKEN="${k3s_token}" sh -s - server \
  --disable traefik \
  --write-kubeconfig-mode 644

# ── Wait for k3s to be fully ready ─────────────────────────
echo ">>> [3/5] Waiting for k3s API server to be ready..."
until k3s kubectl get nodes &>/dev/null; do
  echo "    Waiting for API server..."
  sleep 5
done
echo "    k3s API server is ready!"

# ── Clone the CPMS project ──────────────────────────────────
echo ">>> [4/5] Cloning CPMS project from GitHub..."
git clone https://github.com/Alok-Chandra108/Placement-management-system.git /home/ec2-user/cpms
chown -R ec2-user:ec2-user /home/ec2-user/cpms

# Copy kubernetes manifests to a convenient location
cp -r /home/ec2-user/cpms/kubernetes /home/ec2-user/kubernetes
chown -R ec2-user:ec2-user /home/ec2-user/kubernetes

# ── Configure kubectl for ec2-user (no sudo needed) ────────
echo ">>> [5/5] Configuring kubectl for ec2-user..."
mkdir -p /home/ec2-user/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ec2-user/.kube/config
chown -R ec2-user:ec2-user /home/ec2-user/.kube

echo ""
echo "======================================================"
echo "✅ k3s MASTER is ready! Run: kubectl get nodes"
echo "======================================================"

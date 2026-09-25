#!/bin/bash
# ============================================================
# k3s WORKER NODE BOOTSTRAP SCRIPT
# This runs automatically when the EC2 instance first boots.
# It installs k3s as an agent and joins the master node.
# ============================================================
set -euo pipefail

MASTER_IP="${master_private_ip}"
K3S_TOKEN="${k3s_token}"

# ── System updates ──────────────────────────────────────────
echo ">>> [1/4] Updating system packages..."
dnf update -y
dnf install -y git

# ── Wait for master API server to be reachable ─────────────
# The master node takes ~60s to fully boot and start k3s.
# We retry until the master's API port (9345) is reachable.
echo ">>> [2/4] Waiting for master node to be ready at $MASTER_IP..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -sk "https://$${MASTER_IP}:9345/ping" &>/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "ERROR: Master not reachable after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  echo "    Master not ready yet. Retrying in 10 seconds... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 10
done
echo "    Master is reachable!"

# ── Install k3s as AGENT (worker/data plane) ───────────────
# K3S_URL: points to the master's supervisor port
# K3S_TOKEN: must match the master's token exactly
echo ">>> [3/4] Installing k3s agent and joining master..."
curl -sfL https://get.k3s.io | K3S_URL="https://$${MASTER_IP}:6443" \
  K3S_TOKEN="$K3S_TOKEN" \
  sh -

# ── Verify the agent is running ─────────────────────────────
echo ">>> [4/4] Verifying k3s agent service..."
systemctl status k3s-agent --no-pager

echo ""
echo "======================================================"
echo "✅ k3s WORKER has joined the cluster!"
echo "   Check from master: kubectl get nodes"
echo "======================================================"

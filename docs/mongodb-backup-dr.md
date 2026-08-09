# MongoDB Atlas Backup & Disaster Recovery Strategy

> **Audit finding #28 remediation** — documents the backup and DR policies for CPMS.

---

## 1. Backup Architecture

CPMS uses **MongoDB Atlas Cloud Backup** (continuous, snapshot-based) as its primary
backup mechanism. Atlas Cloud Backup captures consistent, crash-safe snapshots directly
from the replica set's oplog without impacting cluster performance.

### Retention Schedule

| Frequency | Captured Every | Retained For |
|-----------|---------------|--------------|
| Hourly    | 6 hours       | 2 days       |
| Daily     | 24 hours (midnight UTC) | 7 days  |
| Weekly    | Saturday      | 4 weeks      |
| Monthly   | 1st of month  | 12 months    |

**Point-in-Time Restore (PITR) window:** 24 hours
Any moment in the last 24 h can be restored with 1-second granularity.

---

## 2. Enabling the Policy

### Via the automation script (recommended)

Run once after provisioning the Atlas cluster (or after any cluster re-creation):

```bash
# Export your Atlas credentials
export ATLAS_PUBLIC_KEY="<your-public-key>"
export ATLAS_PRIVATE_KEY="<your-private-key>"
export ATLAS_PROJECT_ID="<your-project-id>"
export ATLAS_CLUSTER_NAME="cpms-cluster"   # default

# From the backend directory:
npm run atlas:backup
```

The script (`backend/scripts/configure-atlas-backup.js`) will:
1. Enable `backupEnabled: true` on the cluster via `PATCH /clusters/{clusterName}`.
2. Push the retention policy via `PATCH /clusters/{clusterName}/backup/schedule`.
3. Print a confirmation summary to stdout.

### Via the Atlas UI (manual alternative)

1. Atlas console → Clusters → {cluster} → Backup.
2. Toggle **Cloud Backup** ON.
3. Click **Edit Backup Policy** and enter the schedule above.
4. Enable **Continuous Cloud Backup** for PITR.

---

## 3. Required GitHub / CI Secrets

Add the following secrets to **Settings → Secrets → Actions** in the CPMS repository:

| Secret name           | Description                         |
|-----------------------|-------------------------------------|
| `ATLAS_PUBLIC_KEY`    | Atlas API public key (org-level)    |
| `ATLAS_PRIVATE_KEY`   | Atlas API private key               |
| `ATLAS_PROJECT_ID`    | Atlas project (group) ID            |
| `ATLAS_CLUSTER_NAME`  | Cluster name (default: cpms-cluster)|

---

## 4. Restore Procedures

### 4.1 Point-in-Time Restore (data loss < 24 hours)

Atlas console → Clusters → {cluster} → Backup → Restore →
  Restore Type: Point in Time → choose date + time → Restore

Or via API:
```bash
curl --digest -u "${ATLAS_PUBLIC_KEY}:${ATLAS_PRIVATE_KEY}" \
  -X POST \
  "https://cloud.mongodb.com/api/atlas/v2/groups/${PROJECT_ID}/clusters/${CLUSTER_NAME}/backup/restoreJobs" \
  -H "Content-Type: application/json" \
  -H "Accept: application/vnd.atlas.2023-01-01+json" \
  -d '{
        "deliveryType": "pointInTime",
        "pointInTimeUTCSeconds": 1720000000,
        "targetClusterName": "cpms-restore-target",
        "targetGroupId": "'"${PROJECT_ID}"'"
      }'
```

### 4.2 Snapshot Restore (older than 24 hours)

Atlas console → Clusters → {cluster} → Backup → Snapshots →
  Select snapshot → Restore → choose target cluster → Restore

### 4.3 Download & Self-Managed Restore

Atlas also supports downloading encrypted snapshots (.tar.gz) for local or
offline restoration using mongorestore.

---

## 5. RTO / RPO Targets

| Metric | Target | Mechanism |
|--------|--------|-----------|
| RPO (Recovery Point Objective) | <= 1 second (PITR) / 6 hours (worst-case snapshot) | Continuous cloud backup + PITR |
| RTO (Recovery Time Objective) | <= 4 hours | Atlas automated restore + config re-apply |

---

## 6. DR Runbook

1. **Detect incident** — PagerDuty / Uptime alert fires.
2. **Assess impact** — Determine if data corruption/loss occurred.
3. **Select restore point** — PITR for < 24-hour incidents; snapshot for older events.
4. **Initiate restore** — Use Atlas UI or API to a separate target cluster.
5. **Validate data** — Run smoke tests / record counts against restored cluster.
6. **Cutover** — Update MONGO_URI secret in GitHub Actions and hosting provider, redeploy.
7. **Post-mortem** — Document root cause + prevention measures within 48 hours.

---

## 7. Testing the Backup Policy

Perform a test restore quarterly without touching production:

  Atlas → Clusters → {cluster} → Backup → Snapshots →
    Select any snapshot → Restore to new cluster (test environment)

Document results in the incident-response log.

---

## 8. Alerts & Monitoring

Configure Atlas alerts so your team is notified of backup failures:

  Atlas → Project → Alerts → Add Alert Rule:
    Condition: "Backup is not active" → notify via email / Slack / PagerDuty

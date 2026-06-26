const cron = require('node-cron');
const { runAutoArchive, runPurgeArchived } = require('../controllers/notice.controller');

/**
 * Notice Archive Cron Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs two daily jobs at midnight (00:00) server time:
 *
 *  1. AUTO-ARCHIVE  — Finds all active notices older than 30 days and marks
 *                     them as archived (isArchived: true, archivedAt: now).
 *                     Archived notices are immediately hidden from the student
 *                     dashboard but remain visible in the admin Archive tab.
 *
 *  2. PURGE         — Permanently hard-deletes archived notices whose archivedAt
 *                     timestamp is older than 60 days. This is irreversible.
 *
 * Timeframes (configured in notice.controller.js):
 *   ARCHIVE_AFTER_DAYS = 30
 *   PURGE_AFTER_DAYS   = 60
 */
const startNoticeArchiveCron = () => {
  // ── Job: Daily auto-archive + purge at midnight ────────────────────────────
  cron.schedule('0 0 * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`\n[Notice Cron] ${timestamp} — Running scheduled notice jobs...`);

    try {
      // Step 1: Auto-archive notices older than 30 days
      const archivedCount = await runAutoArchive();
      console.log(`[Notice Cron] ✓ Auto-archived ${archivedCount} notice(s) (>30 days old)`);
    } catch (err) {
      console.error('[Notice Cron] ✗ Auto-archive job failed:', err.message);
    }

    try {
      // Step 2: Purge archived notices older than 60 days from archivedAt
      const purgedCount = await runPurgeArchived();
      console.log(`[Notice Cron] ✓ Permanently deleted ${purgedCount} archived notice(s) (>60 days in archive)`);
    } catch (err) {
      console.error('[Notice Cron] ✗ Purge job failed:', err.message);
    }

    console.log(`[Notice Cron] Jobs complete.\n`);
  }, {
    timezone: 'Asia/Kolkata', // IST — adjust if needed
  });

  console.log('[Notice Cron] Scheduled: auto-archive (30 days) + purge (60 days) @ midnight IST');
};

module.exports = { startNoticeArchiveCron };

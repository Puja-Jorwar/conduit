const db = require('../database/db');
const { addSyncJob } = require('./queue');

/**
 * Scan database for active integrations and add sync jobs
 */
async function schedulePendingSyncs() {
  console.log('🕒 Scheduler: Scanning integrations database for scheduled tasks...');

  try {
    // Select integrations that are active and need syncing based on last_synced_at schedule rules
    const query = `
      SELECT id, name, source_type, schedule, last_synced_at
      FROM integrations
      WHERE is_active = true;
    `;
    const res = await db.query(query);
    const now = new Date();

    for (const integration of res.rows) {
      let shouldSync = false;

      if (!integration.last_synced_at) {
        // Never synced before -> sync immediately
        shouldSync = true;
      } else {
        const lastSync = new Date(integration.last_synced_at);
        const diffMs = now.getTime() - lastSync.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));

        // Evaluate frequency rules
        if (integration.schedule === 'hourly' && diffMins >= 60) {
          shouldSync = true;
        } else if (integration.schedule === 'daily' && diffMins >= 1440) {
          shouldSync = true;
        } else if (integration.schedule === 'weekly' && diffMins >= 10080) {
          shouldSync = true;
        }
      }

      if (shouldSync) {
        console.log(`🕒 Scheduler: Integration "${integration.name}" is due. Queuing sync...`);
        await addSyncJob(integration.id, {
          type: `${integration.source_type}_auto_scheduled_sync`
        });
      }
    }
  } catch (error) {
    console.error('❌ Scheduler Scan Error:', error);
  }
}

// Run every 30 seconds in the background
function startScheduler() {
  console.log('✅ Auto-Scheduler Engine started (running scan every 30 seconds)');
  
  // Initial scan on startup
  schedulePendingSyncs();
  
  // Set interval loop
  setInterval(schedulePendingSyncs, 30000);
}

module.exports = {
  startScheduler
};

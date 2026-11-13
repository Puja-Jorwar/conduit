const { Worker } = require('bullmq');
const db = require('../database/db');
const { decrypt } = require('../utils/encryption');
const { redisConnection } = require('./queue');

// Import connectors
const RazorpayConnector = require('../connectors/razorpay');
const ZohoConnector = require('../connectors/zoho');
const TallyConnector = require('../connectors/tally');

// Helper to update sync log state
async function startSyncLog(integrationId) {
  const query = `
    INSERT INTO sync_logs (integration_id, status, started_at)
    VALUES ($1, 'processing', NOW())
    RETURNING id;
  `;
  const res = await db.query(query, [integrationId]);
  return res.rows[0].id;
}

async function finishSyncLog(logId, status, recordsSynced, errorMessage = null) {
  const query = `
    UPDATE sync_logs
    SET status = $1, records_synced = $2, error_message = $3, finished_at = NOW()
    WHERE id = $4;
  `;
  await db.query(query, [status, recordsSynced, errorMessage, logId]);
}

async function updateIntegrationSuccess(integrationId) {
  const query = `
    UPDATE integrations
    SET last_synced_at = NOW()
    WHERE id = $1;
  `;
  await db.query(query, [integrationId]);
}

// Main job processor logic
const worker = new Worker('integrations-queue', async (job) => {
  const { integrationId, type } = job.data;
  console.log(`🚀 Worker processing job ${job.id} for integration ${integrationId} (${type})`);
  
  const logId = await startSyncLog(integrationId);
  
  try {
    // 1. Fetch integration configurations from DB
    const res = await db.query('SELECT * FROM integrations WHERE id = $1', [integrationId]);
    if (res.rows.length === 0) {
      throw new Error('Integration not found in database');
    }
    
    const integration = res.rows[0];
    if (!integration.is_active) {
      console.log(`⚠️ Integration ${integrationId} is inactive, skipping sync.`);
      await finishSyncLog(logId, 'skipped', 0, 'Integration is inactive');
      return;
    }
    
    // 2. Decrypt configurations (API keys)
    const decryptedConfigStr = decrypt(integration.encrypted_config);
    const config = JSON.parse(decryptedConfigStr);
    
    let recordsSynced = 0;
    
    // 3. Process the sync based on integration type
    if (integration.source_type === 'razorpay') {
      const connector = new RazorpayConnector(config);
      const nowSeconds = Math.floor(Date.now() / 1000);
      const lastSyncedTime = integration.last_synced_at 
        ? Math.floor(new Date(integration.last_synced_at).getTime() / 1000)
        : nowSeconds - (24 * 60 * 60);
      
      console.log(`📥 Fetching payments from ${new Date(lastSyncedTime * 1000).toISOString()} to ${new Date(nowSeconds * 1000).toISOString()}`);
      const rawPayments = await connector.fetchPayments(lastSyncedTime, nowSeconds);
      
      if (rawPayments.length > 0) {
        const normalizedPayments = rawPayments.map(p => connector.normalize(p));
        recordsSynced = normalizedPayments.length;
      }
    } else if (integration.source_type === 'zoho') {
      const connector = new ZohoConnector(config);
      console.log(`📥 Fetching contacts from Zoho CRM...`);
      const rawContacts = await connector.fetchContacts();
      
      if (rawContacts.length > 0) {
        const normalizedContacts = rawContacts.map(c => connector.normalize(c));
        recordsSynced = normalizedContacts.length;
      }
    } else if (integration.source_type === 'tally') {
      const connector = new TallyConnector(config);
      console.log(`📥 Querying local Tally XML Server...`);
      const rawInvoices = await connector.fetchInvoices();
      
      if (rawInvoices.length > 0) {
        const normalizedInvoices = rawInvoices.map(i => connector.normalize(i));
        recordsSynced = normalizedInvoices.length;
      }
    } else {
      throw new Error(`Unsupported integration source type: ${integration.source_type}`);
    }
    
    // 4. Update logs and integration timestamp on success
    await finishSyncLog(logId, 'success', recordsSynced);
    await updateIntegrationSuccess(integrationId);
    console.log(`✅ Worker successfully finished job ${job.id}. Synced ${recordsSynced} records.`);
    
  } catch (error) {
    console.error(`❌ Worker failed job ${job.id}:`, error.message);
    await finishSyncLog(logId, 'failed', 0, error.message);
    
    // Fetch integration customer details to trigger alert
    try {
      const intQuery = await db.query('SELECT customer_id FROM integrations WHERE id = $1', [integrationId]);
      if (intQuery.rows.length > 0) {
        const { createFailureAlert } = require('../monitor/alerts');
        await createFailureAlert(integrationId, intQuery.rows[0].customer_id, error.message);
      }
    } catch (alertErr) {
      console.error('❌ Failed to route alert trigger:', alertErr.message);
    }
    
    throw error; // Re-throw to let BullMQ handle retry logic
  }
}, {
  connection: redisConnection,
  concurrency: 5 // Process up to 5 integrations concurrently
});

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully!`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed with error:`, err.message);
});

module.exports = worker;

const db = require('../database/db');

async function checkLogs() {
  console.log('📋 Fetching Sync Logs from Supabase...');
  try {
    const res = await db.query(`
      SELECT l.id, i.name as integration_name, l.status, l.records_synced, l.error_message, l.started_at, l.finished_at
      FROM sync_logs l
      JOIN integrations i ON l.integration_id = i.id
      ORDER BY l.started_at DESC
      LIMIT 5;
    `);
    
    console.log(`✅ Found ${res.rows.length} logs:`);
    console.table(res.rows);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fetch logs:', error);
    process.exit(1);
  }
}

checkLogs();

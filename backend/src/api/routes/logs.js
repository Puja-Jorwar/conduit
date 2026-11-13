const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// Get all sync logs for a customer (via their integrations)
router.get('/customer/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const status = req.query.status; // optional filter: 'success' | 'failed'

  try {
    let query = `
      SELECT 
        l.id, l.status, l.records_synced, l.error_message,
        l.started_at, l.finished_at,
        i.name as integration_name,
        i.source_type, i.id as integration_id,
        EXTRACT(EPOCH FROM (l.finished_at - l.started_at)) as duration_seconds
      FROM sync_logs l
      JOIN integrations i ON l.integration_id = i.id
      WHERE i.customer_id = $1
    `;
    const params = [customerId];

    if (status) {
      query += ` AND l.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY l.started_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Get Logs Error:', error);
    res.status(500).json({ error: 'Failed to retrieve sync logs' });
  }
});

// Get logs for a specific integration
router.get('/integration/:integrationId', async (req, res) => {
  const { integrationId } = req.params;
  const limit = parseInt(req.query.limit) || 20;

  try {
    const query = `
      SELECT id, status, records_synced, error_message, started_at, finished_at,
        EXTRACT(EPOCH FROM (finished_at - started_at)) as duration_seconds
      FROM sync_logs
      WHERE integration_id = $1
      ORDER BY started_at DESC
      LIMIT $2;
    `;
    const result = await db.query(query, [integrationId, limit]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Get Integration Logs Error:', error);
    res.status(500).json({ error: 'Failed to retrieve integration logs' });
  }
});

// Get summary stats for a customer
router.get('/stats/:customerId', async (req, res) => {
  const { customerId } = req.params;

  try {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE l.status = 'success') as total_success,
        COUNT(*) FILTER (WHERE l.status = 'failed') as total_failed,
        COALESCE(SUM(l.records_synced), 0) as total_records_synced,
        COUNT(DISTINCT l.integration_id) as integrations_active
      FROM sync_logs l
      JOIN integrations i ON l.integration_id = i.id
      WHERE i.customer_id = $1
        AND l.started_at > NOW() - INTERVAL '24 hours';
    `;
    const result = await db.query(query, [customerId]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Get Stats Error:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

module.exports = router;

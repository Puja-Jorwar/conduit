const express = require('express');
const router = express.Router();
const db = require('../../database/db');
const { encrypt } = require('../../utils/encryption');
const { addSyncJob } = require('../../queue/queue');

// 1. Create a new integration
router.post('/', async (req, res) => {
  const { customerId, name, sourceType, destinationType, config, schedule } = req.body;
  
  if (!customerId || !name || !sourceType || !destinationType || !config) {
    return res.status(400).json({ error: 'Missing required configuration fields' });
  }

  try {
    // Encrypt the connection credentials before storing
    const encryptedConfig = encrypt(JSON.stringify(config));
    
    const query = `
      INSERT INTO integrations (customer_id, name, source_type, destination_type, encrypted_config, schedule)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, source_type, destination_type, schedule, is_active, created_at;
    `;
    
    const result = await db.query(query, [
      customerId,
      name,
      sourceType,
      destinationType,
      encryptedConfig,
      schedule || 'hourly'
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Integration Creation Error:', error);
    res.status(500).json({ error: 'Database failed to save integration config' });
  }
});

// 2. Get all integrations for a customer
router.get('/customer/:customerId', async (req, res) => {
  const { customerId } = req.params;
  
  try {
    const query = `
      SELECT id, name, source_type, destination_type, schedule, is_active, last_synced_at, created_at
      FROM integrations
      WHERE customer_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await db.query(query, [customerId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Get Integrations Error:', error);
    res.status(500).json({ error: 'Failed to retrieve integrations' });
  }
});

// 3. Trigger manual sync for an integration
router.post('/:id/sync', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('SELECT source_type, is_active FROM integrations WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    
    const integration = result.rows[0];
    if (!integration.is_active) {
      return res.status(400).json({ error: 'Cannot sync an inactive integration' });
    }
    
    // Add job to BullMQ queue
    const job = await addSyncJob(id, {
      type: `${integration.source_type}_manual_sync`
    });
    
    res.status(200).json({ 
      message: 'Sync job added to queue successfully', 
      jobId: job.id 
    });
  } catch (error) {
    console.error('❌ Manual Sync Trigger Error:', error);
    res.status(500).json({ error: 'Failed to trigger sync' });
  }
});

// 4. Delete an integration
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query('DELETE FROM integrations WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    res.status(200).json({ message: 'Integration deleted successfully', id });
  } catch (error) {
    console.error('❌ Delete Integration Error:', error);
    res.status(500).json({ error: 'Failed to delete integration' });
  }
});

module.exports = router;

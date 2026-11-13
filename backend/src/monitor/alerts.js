const db = require('../database/db');

/**
 * Dispatch an integration failure alert
 * @param {string} integrationId 
 * @param {string} customerId 
 * @param {string} errorMessage 
 */
async function createFailureAlert(integrationId, customerId, errorMessage) {
  console.log(`🔔 ALERT: Integration ${integrationId} failed. Dispatching notifications...`);
  
  try {
    const alertMessage = `Integration Sync Failed. Details: ${errorMessage}`;
    
    // 1. Insert alert record into DB
    const query = `
      INSERT INTO alerts (integration_id, customer_id, message, is_resolved)
      VALUES ($1, $2, $3, false)
      RETURNING id, created_at;
    `;
    await db.query(query, [integrationId, customerId, alertMessage]);
    
    // 2. Email or webhook trigger (mock console log for MVP)
    console.log(`✉️ Alert Email dispatched to customer ${customerId}: "${alertMessage}"`);
    
  } catch (error) {
    console.error('❌ Failed to create alert record:', error);
  }
}

module.exports = {
  createFailureAlert
};

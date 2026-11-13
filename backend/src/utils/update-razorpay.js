const db = require('../database/db');
const { encrypt } = require('./encryption');
require('dotenv').config();

async function updateRazorpayCredentials() {
  console.log('🔐 Updating Razorpay credentials with real test keys...');

  try {
    // Real Razorpay test credentials
    const realCredentials = {
      key_id: 'rzp_test_TEcAvjlVnPg3HJ',
      key_secret: 'CM2Y5oWGoNNDEhgSnmX5gFB7'
    };

    const encryptedConfig = encrypt(JSON.stringify(realCredentials));

    const result = await db.query(`
      UPDATE integrations
      SET encrypted_config = $1
      WHERE source_type = 'razorpay'
      RETURNING id, name, source_type;
    `, [encryptedConfig]);

    if (result.rows.length === 0) {
      console.log('❌ No Razorpay integration found. Creating one...');

      // Get the test customer
      const customerRes = await db.query(`SELECT id FROM customers WHERE email = 'founder@conduit.io'`);
      if (customerRes.rows.length === 0) {
        console.error('❌ Test customer not found. Run test-run.js first.');
        process.exit(1);
      }

      const customerId = customerRes.rows[0].id;
      const newIntegration = await db.query(`
        INSERT INTO integrations (customer_id, name, source_type, destination_type, encrypted_config, schedule)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name;
      `, [customerId, 'Razorpay Payments Sync', 'razorpay', 'postgresql', encryptedConfig, 'hourly']);

      console.log(`✅ New integration created: ${newIntegration.rows[0].name} (ID: ${newIntegration.rows[0].id})`);
    } else {
      console.log(`✅ Updated integration: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    }

    console.log('🎉 Real Razorpay credentials saved (encrypted in Supabase)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updateRazorpayCredentials();

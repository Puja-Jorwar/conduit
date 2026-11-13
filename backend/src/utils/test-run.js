const db = require('../database/db');
const { encrypt } = require('./encryption');
const { addSyncJob } = require('../queue/queue');
require('dotenv').config();

async function runTest() {
  console.log('🧪 Starting Conduit Integration Test...');

  try {
    // 1. Insert a mock customer
    console.log('👤 Creating mock customer...');
    const customerQuery = `
      INSERT INTO customers (name, email, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, email;
    `;
    const customerRes = await db.query(customerQuery, [
      'Test Founder',
      'founder@conduit.io',
      'mock_hashed_password' // Dummy hashed password
    ]);
    const customer = customerRes.rows[0];
    console.log(`✅ Customer ready: ${customer.name} (ID: ${customer.id})`);

    // 2. Mock credentials for Razorpay (use test keys here)
    const mockCredentials = {
      key_id: 'rzp_test_dummyKeyId123',
      key_secret: 'dummySecret456'
    };

    // Encrypt credentials
    const encryptedConfig = encrypt(JSON.stringify(mockCredentials));

    // 3. Insert mock integration linked to customer
    console.log('🔌 Creating mock Razorpay integration...');
    const integrationQuery = `
      INSERT INTO integrations (customer_id, name, source_type, destination_type, encrypted_config, schedule)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, source_type;
    `;
    const integrationRes = await db.query(integrationQuery, [
      customer.id,
      'Razorpay Payments Test Sync',
      'razorpay',
      'postgresql',
      encryptedConfig,
      'hourly'
    ]);
    const integration = integrationRes.rows[0];
    console.log(`✅ Integration ready: ${integration.name} (ID: ${integration.id})`);

    // 4. Trigger sync job by placing it in BullMQ
    console.log('💼 Adding sync job to BullMQ queue...');
    const job = await addSyncJob(integration.id, {
      type: 'razorpay_test_sync',
      customerId: customer.id
    });
    console.log(`✅ Job successfully queued with ID: ${job.id}`);
    console.log('🎉 Test setup complete! Run the server to see the worker pick up the job.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test Setup Failed:', error);
    process.exit(1);
  }
}

runTest();

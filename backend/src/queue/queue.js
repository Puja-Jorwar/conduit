const { Queue } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("❌ ERROR: REDIS_URL is missing in your environment variables!");
  process.exit(1);
}

// Initialize Redis connection
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null // Required by BullMQ
});

connection.on('connect', () => {
  console.log('✅ Connected to Upstash Redis queue successfully!');
});

connection.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

// Create our main integrations queue
const integrationQueue = new Queue('integrations-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3, // Auto-retry 3 times
    backoff: {
      type: 'exponential',
      delay: 5000 // Start retrying after 5 seconds, double duration each time
    },
    removeOnComplete: 100, // Keep last 100 completed jobs in logs
    removeOnFail: 500 // Keep last 500 failed jobs for debugging
  }
});

/**
 * Helper to add a sync job to the queue
 * @param {string} integrationId Database ID of the integration
 * @param {object} payload Task details (e.g. { type: 'razorpay_payment', customerId: '...' })
 */
async function addSyncJob(integrationId, payload) {
  try {
    const job = await integrationQueue.add(`sync:${integrationId}`, {
      integrationId,
      ...payload
    });
    console.log(`💼 Job added to queue: ${job.id} for integration ${integrationId}`);
    return job;
  } catch (error) {
    console.error('❌ Failed to add job to queue:', error);
    throw error;
  }
}

module.exports = {
  integrationQueue,
  addSyncJob,
  redisConnection: connection
};

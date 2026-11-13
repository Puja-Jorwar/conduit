const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERROR: DATABASE_URL is missing in your environment variables!");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase / external connections
  }
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error acquiring database client:', err.stack);
  }
  console.log('✅ Connected to Supabase PostgreSQL Database successfully!');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

const fs = require('fs');
const path = require('path');
const db = require('./db');

async function setupDatabase() {
  console.log('🔄 Starting Database Schema Setup via CLI...');
  
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Schema file loaded successfully. Executing queries...');
    
    // Execute all queries in schema.sql
    await db.query(sql);
    
    console.log('✅ Database setup completed! All tables created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Setup Failed:', error);
    process.exit(1);
  }
}

setupDatabase();

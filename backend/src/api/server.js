const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Ensure db and queue files load
require('../database/db');
require('../queue/queue');
require('../queue/worker');
const { startScheduler } = require('../queue/scheduler');

// Start auto-scheduler
startScheduler();

// Import routers
const integrationsRouter = require('./routes/integrations');
const logsRouter = require('./routes/logs');
const customersRouter = require('./routes/customers');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/integrations', integrationsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/customers', customersRouter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    services: { database: 'connected', queue: 'connected' }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Conduit Backend running on http://localhost:${PORT}`);
  console.log(`📡 API routes:`);
  console.log(`   GET  /health`);
  console.log(`   POST /api/customers/register`);
  console.log(`   POST /api/customers/login`);
  console.log(`   GET  /api/integrations/customer/:id`);
  console.log(`   POST /api/integrations`);
  console.log(`   POST /api/integrations/:id/sync`);
  console.log(`   GET  /api/logs/customer/:id`);
  console.log(`   GET  /api/logs/stats/:id\n`);
});

module.exports = app;

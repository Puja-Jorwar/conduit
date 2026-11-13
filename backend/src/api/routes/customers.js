const express = require('express');
const router = express.Router();
const db = require('../../database/db');

// Register a new customer
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  try {
    // Simple password hash using built-in crypto (replace with bcrypt in production)
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const query = `
      INSERT INTO customers (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, plan, created_at;
    `;
    const result = await db.query(query, [name, email, passwordHash]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'A customer with this email already exists' });
    }
    console.error('❌ Register Error:', error);
    res.status(500).json({ error: 'Failed to register customer' });
  }
});

// Login customer
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const query = `
      SELECT id, name, email, plan, created_at
      FROM customers
      WHERE email = $1 AND password_hash = $2;
    `;
    const result = await db.query(query, [email, passwordHash]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'SELECT id, name, email, plan, created_at FROM customers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Get Customer Error:', error);
    res.status(500).json({ error: 'Failed to retrieve customer' });
  }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve Frontend static assets so opening http://localhost:3000 loads the web app directly
app.use(express.static(path.join(__dirname, '../Frontend')));

// Health check / API status
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Test DB connection endpoint
app.get('/api/test-db', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = ?',
      [process.env.DB_NAME || 'ims']
    );
    res.json({ message: 'MySQL Database Connected Successfully!', tables: rows[0].table_count });
  } catch (err) {
    next(err);
  }
});

// Core API Domain Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/dashboard', require('./routes/dashboard'));

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
});

// Fallback to index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.message);
  const status = err.statusCode || (err.status ? err.status : 500);
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 IMS Backend Server running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend Web App accessible at http://localhost:${PORT}`);
  console.log(`====================================================`);
});
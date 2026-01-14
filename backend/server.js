require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./services/database');

// Route Imports
const bookingRoutes = require('./routes/bookings');
const performerRoutes = require('./routes/performers');
const clientRoutes = require('./routes/clients');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/performers', performerRoutes);
app.use('/api/clients', clientRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

// Ensure DB connectivity before starting
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('PostgreSQL Connected at:', res.rows[0].now);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
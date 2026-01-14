const express = require('express');
const router = express.Router();
const db = require('../services/database');
const bcrypt = require('bcryptjs');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get All Available Performers
router.get('/', async (req, res, next) => {
  try {
    const performers = await db.query('SELECT id, name, tagline, bio, photo_url, gallery_urls, service_areas, service_ids, status FROM performers WHERE status != $1', ['rejected']);
    res.json(performers.rows);
  } catch (err) {
    next(err);
  }
});

// Register New Performer
router.post('/register', async (req, res, next) => {
  const { email, password, name, phone, serviceAreas, serviceIds } = req.body;
  
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO performers (email, password_hash, name, phone, service_areas, service_ids) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name',
      [email, hash, name, phone, JSON.stringify(serviceAreas), JSON.stringify(serviceIds)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update Performer Status (Admin only)
router.put('/:id/status', verifyToken, isAdmin, async (req, res, next) => {
  const { status } = req.body;
  try {
    const result = await db.query('UPDATE performers SET status = $1 WHERE id = $2 RETURNING id, status', [status, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
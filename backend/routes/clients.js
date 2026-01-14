const express = require('express');
const router = express.Router();
const db = require('../services/database');

// Vet Client Request
router.post('/vetting', async (req, res, next) => {
  const { email, phone } = req.body;
  try {
    const dnsMatch = await db.query(
      'SELECT reason FROM do_not_serve WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (dnsMatch.rows.length > 0) {
      return res.status(200).json({ 
        safe: false, 
        reason: 'Client flagged on safety list' 
      });
    }

    res.json({ safe: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
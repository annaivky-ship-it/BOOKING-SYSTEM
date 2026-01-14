const express = require('express');
const router = express.Router();
const db = require('../services/database');
const twilio = require('../services/twilio');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Create Booking Request
router.post('/', async (req, res, next) => {
  const { 
    performerId, clientName, clientEmail, clientPhone, 
    eventDate, eventTime, eventAddress, durationHours,
    servicesRequested, totalAmount, depositAmount, clientMessage
  } = req.body;

  try {
    // 1. Ensure client exists
    let clientRes = await db.query('SELECT id, dns_flagged FROM clients WHERE email = $1', [clientEmail]);
    let clientId;

    if (clientRes.rows.length === 0) {
      const newClient = await db.query(
        'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
        [clientName, clientEmail, clientPhone]
      );
      clientId = newClient.rows[0].id;
    } else {
      if (clientRes.rows[0].dns_flagged) {
        return res.status(403).json({ error: 'Client is on the Do Not Serve list.' });
      }
      clientId = clientRes.rows[0].id;
    }

    // 2. Create Booking
    const bookingRes = await db.query(
      `INSERT INTO bookings 
      (client_id, performer_id, total_amount, deposit_amount, event_date, event_time, event_address, duration_hours, client_message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [clientId, performerId, totalAmount, depositAmount, eventDate, eventTime, eventAddress, durationHours, clientMessage]
    );

    const booking = bookingRes.rows[0];

    // 3. Notify Talent & Admin
    const performerRes = await db.query('SELECT name, phone FROM performers WHERE id = $1', [performerId]);
    const performer = performerRes.rows[0];

    await twilio.sendWhatsApp(performer.phone, `🍑 NEW GIG REQUEST\nClient: ${clientName}\nDate: ${eventDate}\nTime: ${eventTime}\nAddress: ${eventAddress}`);
    await twilio.sendWhatsApp(process.env.ADMIN_WHATSAPP, `📥 New Request from ${clientName} for ${performer.name}`);
    await twilio.sendSMS(clientPhone, `Hi ${clientName}, we've received your request! We'll update you as soon as the talent confirms.`);

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// Update Booking Status
router.put('/:id/status', verifyToken, async (req, res, next) => {
  const { status, eta } = req.body;
  const bookingId = req.params.id;

  try {
    const bookingRes = await db.query(
      'UPDATE bookings SET status = $1, performer_eta_minutes = COALESCE($2, performer_eta_minutes) WHERE id = $3 RETURNING *',
      [status, eta, bookingId]
    );

    if (bookingRes.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    const booking = bookingRes.rows[0];

    // Fetch client for SMS
    const clientRes = await db.query('SELECT phone FROM clients WHERE id = $1', [booking.client_id]);
    const client = clientRes.rows[0];

    // Status Notification Logic
    if (status === 'confirmed') {
      await twilio.sendSMS(client.phone, `🎉 BOOKING CONFIRMED! We look forward to seeing you at ${booking.event_time}.`);
    } else if (status === 'rejected') {
      await twilio.sendSMS(client.phone, `Update: Unfortunately, we cannot proceed with your booking at this time.`);
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
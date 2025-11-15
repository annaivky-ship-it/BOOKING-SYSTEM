# 🗄️ Database Structure - Flavor Entertainers

## Entity Relationship Diagram

```
┌─────────────────┐
│    SERVICES     │
│─────────────────│
│ id (PK)         │◄──────────┐
│ category        │           │
│ name            │           │ Many-to-Many
│ description     │           │ (via arrays)
│ rate            │           │
│ rate_type       │           │
│ min_duration    │           │
│ duration_mins   │           │
└─────────────────┘           │
                              │
┌─────────────────┐           │
│   PERFORMERS    │           │
│─────────────────│           │
│ id (PK)         │───────────┘
│ name            │
│ tagline         │           ┌─────────────────┐
│ photo_url       │           │    BOOKINGS     │
│ bio             │           │─────────────────│
│ service_ids[]   │───────────┤ id (PK)         │
│ service_areas[] │    One    │ performer_id(FK)│
│ status          │    to     │ client_name     │
│ email           │   Many    │ client_email    │
│ phone           │           │ client_phone    │
│ password_hash   │           │ event_date      │
└────────┬────────┘           │ event_time      │
         │                    │ event_address   │
         │                    │ event_type      │
         │                    │ duration_hours  │
         │                    │ num_guests      │
         │                    │ services_req[]  │
         │                    │ status          │
         │                    │ total_cost      │
         │                    │ deposit_amount  │
         │                    └────────┬────────┘
         │                             │
         │                             │ One to Many
         │                             │
         │                             ▼
         │                    ┌─────────────────┐
         │                    │ COMMUNICATIONS  │
         │                    │─────────────────│
         │                    │ id (PK)         │
         │                    │ booking_id (FK) │
         │                    │ sender          │
         │                    │ recipient       │
         │                    │ message         │
         │                    │ type            │
         │                    │ read            │
         │                    └─────────────────┘
         │
         │ One to Many
         │
         ▼
┌─────────────────┐
│DO_NOT_SERVE_LIST│
│─────────────────│
│ id (PK)         │
│ submitted_by(FK)│───────── Performer who submitted
│ client_name     │
│ client_email    │
│ client_phone    │
│ reason          │
│ status          │
└─────────────────┘


┌─────────────────┐
│     CLIENTS     │
│─────────────────│
│ id (PK)         │
│ email (UNIQUE)  │
│ name            │
│ phone           │
│ is_vip          │────── Auto-calculated (3+ confirmed bookings)
│ total_bookings  │
└─────────────────┘


┌─────────────────┐
│     ADMINS      │
│─────────────────│
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ password_hash   │
└─────────────────┘


┌─────────────────┐
│BOOKING_AUDIT_LOG│
│─────────────────│
│ id (PK)         │
│ booking_id (FK) │────── Tracks all booking changes
│ action          │
│ performed_by    │
│ old_status      │
│ new_status      │
│ notes           │
└─────────────────┘
```

---

## Table Relationships

### Services → Performers (Many-to-Many)
- Stored as array in `performers.service_ids[]`
- Example: `['waitress-topless', 'show-hot-cream']`

### Performers → Bookings (One-to-Many)
- Foreign key: `bookings.performer_id`
- One performer can have multiple bookings

### Bookings → Communications (One-to-Many)
- Foreign key: `communications.booking_id`
- Optional: Not all messages are booking-related

### Performers → Do Not Serve List (One-to-Many)
- Foreign key: `do_not_serve_list.submitted_by_performer_id`
- Tracks which performer submitted the entry

### Bookings → Audit Log (One-to-Many)
- Foreign key: `booking_audit_log.booking_id`
- Automatic tracking of all changes

---

## Data Flow

### Booking Workflow

```
1. Client Creates Booking
   ↓
2. Check Do Not Serve List (auto-blocked if on list)
   ↓
3. Status: pending_performer_acceptance
   ↓
4. Performer Accepts/Declines
   ├─ Decline → Status: rejected (END)
   └─ Accept → Status: pending_vetting
              ↓
5. Admin Vets Application (checks ID document)
   ├─ Reject → Status: rejected (END)
   └─ Approve → Status: deposit_pending
               ↓
6. Client Uploads Deposit Receipt
   ↓
7. Status: pending_deposit_confirmation
   ↓
8. Admin Verifies Deposit
   ├─ Invalid → Back to deposit_pending
   └─ Valid → Status: confirmed
             ↓
9. Update Client VIP Status (if 3+ confirmed)
   ↓
10. Booking Complete ✓
```

---

## Field Details

### Service Categories
```
- Waitressing
- Strip Show
- Promotional & Hosting
```

### Service Rate Types
```
- per_hour: Charged hourly (e.g., $110/hr)
- flat: One-time fee (e.g., $500 for show)
```

### Booking Statuses
```
1. pending_performer_acceptance  (New booking)
2. pending_vetting              (Performer accepted)
3. deposit_pending              (Admin vetted)
4. pending_deposit_confirmation (Client paid)
5. confirmed                    (Admin verified payment)
6. rejected                     (Declined at any stage)
```

### Performer Statuses
```
- available: Ready for bookings
- busy: Currently booked
- offline: Not available
```

### Service Areas
```
- Perth North
- Perth South
- Southwest
- Northwest
```

### Do Not Serve Statuses
```
- pending: Awaiting admin review
- approved: Blacklisted (blocks bookings)
- rejected: Not blacklisted
```

---

## Indexes (for Performance)

```sql
-- Bookings
idx_bookings_performer (performer_id)
idx_bookings_status (status)
idx_bookings_event_date (event_date)
idx_bookings_client_email (client_email)

-- Performers
idx_performers_status (status)
idx_performers_email (email)

-- Do Not Serve
idx_dns_email (client_email)
idx_dns_phone (client_phone)
idx_dns_status (status)

-- Communications
idx_communications_recipient (recipient)
idx_communications_booking (booking_id)
idx_communications_read (read)
```

---

## Triggers & Automation

### Auto-Update Timestamps
```sql
-- Fires on UPDATE for all main tables
update_updated_at_column()
```

### Auto-Update VIP Status
```sql
-- Fires when booking.status = 'confirmed'
trigger_update_vip_status()
├─ Counts confirmed bookings
├─ Updates clients.total_bookings
└─ Sets is_vip = true if >= 3 bookings
```

---

## Helper Functions

### is_client_blocked(email, phone)
```sql
-- Returns: boolean
-- Checks if client is on approved DNS list
SELECT is_client_blocked('alex@example.com', '0400111222');
-- Returns: true (blocked)
```

### update_client_vip_status(email)
```sql
-- Returns: void
-- Recalculates VIP status for client
CALL update_client_vip_status('john@example.com');
```

### generate_upload_path(bucket, booking_id, extension)
```sql
-- Returns: text (file path)
-- Creates secure random path for file uploads
SELECT generate_upload_path('booking-documents', 'uuid-here', 'pdf');
-- Returns: 'booking-documents/uuid-here/random-uuid.pdf'
```

---

## Storage Buckets

### booking-documents (Private)
```
Purpose: ID verification uploads
Access: Only uploader and admins
Max Size: 5MB
Types: image/*, application/pdf
```

### deposit-receipts (Private)
```
Purpose: Payment confirmation screenshots
Access: Only uploader and admins
Max Size: 5MB
Types: image/*, application/pdf
```

### performer-photos (Public)
```
Purpose: Profile pictures (CDN)
Access: Public read, performer write
Max Size: 5MB
Types: image/*
```

---

## Views (Pre-Built Queries)

### bookings_with_performers
```sql
-- Joins bookings with performer details
SELECT * FROM bookings_with_performers
WHERE client_email = 'john@example.com';
```

### do_not_serve_with_performers
```sql
-- Joins DNS list with performer who submitted
SELECT * FROM do_not_serve_with_performers
WHERE status = 'approved';
```

---

## Security Model (RLS)

### Public Access
- ✅ services (all can read)
- ✅ performers (all can read basic info)

### Client Access
- ✅ Own bookings (read/create)
- ✅ Own communications (read)

### Performer Access
- ✅ Assigned bookings (read/update)
- ✅ Own profile (update)
- ✅ Submit DNS entries (create)
- ✅ View approved DNS list (read)

### Admin Access
- ✅ Everything (via service role key)

---

## Sample Queries

### Get Available Performers
```sql
SELECT * FROM performers
WHERE status = 'available'
ORDER BY name;
```

### Get Client's Bookings
```sql
SELECT * FROM bookings_with_performers
WHERE client_email = 'john@example.com'
ORDER BY event_date DESC;
```

### Get Pending Admin Actions
```sql
SELECT * FROM bookings
WHERE status IN ('pending_vetting', 'pending_deposit_confirmation')
ORDER BY created_at;
```

### Check if Client is Blocked
```sql
SELECT is_client_blocked('test@example.com', '0400000000');
```

### Get VIP Clients
```sql
SELECT * FROM clients
WHERE is_vip = true
ORDER BY total_bookings DESC;
```

---

## Backup & Recovery

### Free Tier
- Manual backups via Dashboard → Database → Backups
- Export as CSV or SQL dump

### Pro Tier
- Automatic daily backups (7 day retention)
- Point-in-time recovery (up to 7 days)
- Automated weekly backups (kept for 30 days)

---

**Database designed for:**
- 🚀 Performance (indexed queries)
- 🔒 Security (RLS everywhere)
- 📊 Analytics (audit logs)
- 💰 Cost efficiency (optimized storage)
- 🛡️ Safety (DNS blocking)

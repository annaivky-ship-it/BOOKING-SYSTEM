# Booking Platform - Production-Grade Application

A complete booking platform for freelancers and private-event staff built with Next.js 15, Supabase, and Twilio WhatsApp.

## Features

✅ Multi-role system (Admin, Performer, Client)
✅ Real-time performer availability grid
✅ Client ID verification with expiry tracking
✅ Blacklist protection
✅ PayID payment verification (manual)
✅ WhatsApp notifications for all events
✅ Performer ETA tracking and alerts
✅ Complete audit logging
✅ AES-256 encryption for sensitive data
✅ Row Level Security (RLS)
✅ Mobile-first responsive design

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime, RLS)
- **Notifications**: Twilio WhatsApp API
- **Payments**: PayID (manual verification)
- **Timezone**: Australia/Perth (UTC+8)

## Project Structure

```
booking-platform/
├── app/
│   ├── api/
│   │   ├── bookings/
│   │   │   ├── route.ts                    # Create/list bookings
│   │   │   └── [id]/
│   │   │       ├── accept/route.ts         # Accept booking
│   │   │       ├── decline/route.ts        # Decline booking
│   │   │       └── eta/route.ts            # Submit ETA
│   │   ├── payid/
│   │   │   └── verify/route.ts             # Admin verify payment
│   │   ├── vetting/
│   │   │   └── route.ts                    # Submit/review vetting
│   │   └── blacklist/
│   │       └── route.ts                    # Manage blacklist
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── PerformerGrid.tsx                   # Real-time performer grid
│   ├── BookingForm.tsx                     # Multi-step booking form
│   ├── ETAForm.tsx                         # Performer ETA submission
│   ├── AdminDashboard.tsx                  # Admin control panel
│   └── AuditLogTable.tsx                   # Audit trail viewer
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Browser client
│   │   └── server.ts                       # Server client + service role
│   ├── validators.ts                       # Zod schemas
│   ├── encryption.ts                       # AES-256 encryption
│   ├── whatsapp.ts                         # Twilio WhatsApp service
│   ├── audit.ts                            # Audit logging
│   └── utils.ts                            # Helper functions
├── types/
│   ├── database.ts                         # TypeScript types
│   └── supabase.ts                         # Supabase types
├── supabase/
│   ├── schema.sql                          # Database schema
│   └── rls-policies.sql                    # RLS policies
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.example
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account
- Twilio account with WhatsApp enabled
- Australian phone number for WhatsApp

### 2. Clone and Install

```bash
# Navigate to project
cd booking-platform

# Install dependencies
npm install
```

### 3. Supabase Setup

#### Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Create a new project
3. Note your project URL and keys

#### Run Database Schema

1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Execute the SQL
4. Copy contents of `supabase/rls-policies.sql`
5. Execute the SQL

#### Create Storage Buckets

1. Go to Supabase Dashboard > Storage
2. Create bucket `profiles` (public: false)
3. Create bucket `ids` (public: false)
4. Create bucket `receipts` (public: false)

#### Enable Realtime

1. Go to Supabase Dashboard > Database > Replication
2. Add `bookings` table to publication

### 4. Environment Variables

Create `.env.local` file:

```bash
# Copy from example
cp .env.example .env.local
```

Fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+61XXXXXXXXX
ADMIN_WHATSAPP=whatsapp:+61XXXXXXXXX

# PayID
PAYID_EMAIL=yourpayid@example.com

# Encryption (must be exactly 32 characters)
ENCRYPTION_KEY=YOUR_32_CHARACTER_KEY_HERE_32CH

# Timezone
TZ=Australia/Perth

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### 6. Create Admin User

After running the schema, update the default admin:

```sql
UPDATE users
SET email = 'your-admin@example.com',
    phone = '+61400000000',
    full_name = 'Your Name'
WHERE role = 'admin';
```

Then sign up with this email via Supabase Auth.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Import your GitHub repository
3. Add all environment variables from `.env.local`
4. Deploy

### 3. Update Environment

After deployment, update in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Redeploy to apply changes.

## API Routes

### Bookings

- `POST /api/bookings` - Create booking (Client)
- `GET /api/bookings` - List bookings (All roles)
- `POST /api/bookings/[id]/accept` - Accept booking (Performer)
- `POST /api/bookings/[id]/decline` - Decline booking (Performer)
- `POST /api/bookings/[id]/eta` - Submit ETA (Performer)

### Payments

- `POST /api/payid/verify` - Verify/reject payment (Admin)

### Vetting

- `POST /api/vetting` - Submit ID verification (Client)
- `GET /api/vetting` - List applications (Client/Admin)
- `PATCH /api/vetting` - Review application (Admin)

### Blacklist

- `GET /api/blacklist` - List blacklist (Admin)
- `POST /api/blacklist` - Add to blacklist (Admin)
- `DELETE /api/blacklist` - Remove from blacklist (Admin)

## WhatsApp Notifications

The platform sends WhatsApp messages for:

- ✅ New booking created (to Admin)
- ✅ Payment verified (to Client + Performer)
- ✅ Booking accepted (to Client)
- ✅ Booking declined (to Admin)
- ✅ Performer ETA (to Client + Admin)
- ✅ Booking cancelled (to Client + Performer)
- ✅ ID verification status (to Client)

## Security Features

### Row Level Security (RLS)

- Clients can only see their own bookings
- Performers can only see their assigned bookings
- Admins can see everything
- Blacklist is admin-only

### Encryption

- ID documents are stored with encrypted filenames
- Payment receipts are stored with encrypted filenames
- Sensitive paths use AES-256 encryption

### Vetting

- Clients must verify ID before booking
- ID expiry is tracked (6 months)
- Expired IDs trigger re-verification

### Blacklist

- Automatic lookup on booking creation
- Blocks by email or phone number
- Admin-only management

## Audit Logging

Every action is logged with:

- User ID
- Action type
- Resource affected
- Timestamp
- IP address
- User agent
- Additional details (JSON)

View logs in Admin Dashboard > Audit tab.

## Testing

### Test the Full Workflow

1. **Client signs up** → ID verification required
2. **Admin approves ID** → Client can now book
3. **Client creates booking** → Uploads PayID receipt
4. **Admin verifies payment** → Status: Confirmed
5. **Performer accepts** → Client notified
6. **Performer submits ETA** → WhatsApp sent to client + admin
7. **Booking completed** → Logged in audit trail

## Common Issues

### WhatsApp Messages Not Sending

- Verify Twilio WhatsApp sandbox is active
- Check phone number format (+61...)
- Ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct

### RLS Denying Access

- Check user role in database
- Verify JWT token is valid
- Ensure RLS policies are applied

### Realtime Not Working

- Enable Realtime in Supabase Dashboard
- Check publication includes `bookings` table
- Verify network allows WebSocket connections

## Production Checklist

- [ ] Update admin user email and phone
- [ ] Set strong ENCRYPTION_KEY (32 characters)
- [ ] Configure all environment variables
- [ ] Set up Twilio WhatsApp production number
- [ ] Test all WhatsApp templates
- [ ] Enable Supabase RLS on all tables
- [ ] Configure storage bucket policies
- [ ] Set up domain in Vercel
- [ ] Add error monitoring (e.g., Sentry)
- [ ] Set up database backups
- [ ] Test booking flow end-to-end

## Support

For issues or questions:

1. Check this README
2. Review code comments
3. Check Supabase logs
4. Review audit logs

## License

Proprietary - All rights reserved

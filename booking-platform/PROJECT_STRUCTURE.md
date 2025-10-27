# Project Structure Reference

## File Tree

```
booking-platform/
│
├── 📁 app/                           # Next.js App Router
│   ├── 📁 api/                       # API Routes
│   │   ├── 📁 bookings/
│   │   │   ├── route.ts              ✅ Create/List bookings
│   │   │   └── 📁 [id]/
│   │   │       ├── 📁 accept/
│   │   │       │   └── route.ts      ✅ Accept booking
│   │   │       ├── 📁 decline/
│   │   │       │   └── route.ts      ✅ Decline booking
│   │   │       └── 📁 eta/
│   │   │           └── route.ts      ✅ Submit ETA
│   │   ├── 📁 payid/
│   │   │   └── 📁 verify/
│   │   │       └── route.ts          ✅ Verify payment
│   │   ├── 📁 vetting/
│   │   │   └── route.ts              ✅ Submit/Review vetting
│   │   └── 📁 blacklist/
│   │       └── route.ts              ✅ Manage blacklist
│   │
│   ├── layout.tsx                    ✅ Root layout
│   ├── page.tsx                      ✅ Home page
│   └── globals.css                   ✅ Global styles
│
├── 📁 components/                    # React Components
│   └── PerformerGrid.tsx             ✅ Performer grid with realtime
│
├── 📁 lib/                           # Utilities & Services
│   ├── 📁 supabase/
│   │   ├── client.ts                 ✅ Browser client
│   │   └── server.ts                 ✅ Server + service client
│   ├── validators.ts                 ✅ Zod schemas
│   ├── encryption.ts                 ✅ AES-256 encryption
│   ├── whatsapp.ts                   ✅ Twilio WhatsApp service
│   ├── audit.ts                      ✅ Audit logging
│   └── utils.ts                      ✅ Helper functions
│
├── 📁 types/                         # TypeScript Types
│   ├── database.ts                   ✅ Database types
│   └── supabase.ts                   ✅ Supabase types
│
├── 📁 supabase/                      # Database Scripts
│   ├── schema.sql                    ✅ Database schema
│   └── rls-policies.sql              ✅ RLS policies
│
├── 📄 package.json                   ✅ Dependencies
├── 📄 tsconfig.json                  ✅ TypeScript config
├── 📄 tailwind.config.ts             ✅ Tailwind config
├── 📄 next.config.js                 ✅ Next.js config
├── 📄 postcss.config.js              ✅ PostCSS config
├── 📄 .env.example                   ✅ Environment template
├── 📄 .gitignore                     ✅ Git ignore
├── 📄 README.md                      ✅ Main documentation
├── 📄 IMPLEMENTATION_GUIDE.md        ✅ Implementation guide
└── 📄 PROJECT_STRUCTURE.md           ✅ This file
```

## Key Files Explained

### API Routes

| File | Method | Role | Purpose |
|------|--------|------|---------|
| `app/api/bookings/route.ts` | POST | Client | Create booking + upload URL |
| `app/api/bookings/route.ts` | GET | All | List user's bookings |
| `app/api/bookings/[id]/accept/route.ts` | POST | Performer | Accept booking |
| `app/api/bookings/[id]/decline/route.ts` | POST | Performer | Decline booking |
| `app/api/bookings/[id]/eta/route.ts` | POST | Performer | Submit ETA → WhatsApp |
| `app/api/payid/verify/route.ts` | POST | Admin | Verify/reject payment |
| `app/api/vetting/route.ts` | POST | Client | Submit ID verification |
| `app/api/vetting/route.ts` | GET | Client/Admin | List applications |
| `app/api/vetting/route.ts` | PATCH | Admin | Review application |
| `app/api/blacklist/route.ts` | GET | Admin | List blacklist |
| `app/api/blacklist/route.ts` | POST | Admin | Add to blacklist |
| `app/api/blacklist/route.ts` | DELETE | Admin | Remove from blacklist |

### Utilities

| File | Purpose |
|------|---------|
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client + service role |
| `lib/validators.ts` | Zod schemas for all API inputs |
| `lib/encryption.ts` | AES-256 encryption for sensitive data |
| `lib/whatsapp.ts` | 10+ WhatsApp notification templates |
| `lib/audit.ts` | Audit logging system |
| `lib/utils.ts` | Blacklist check, vetting check, formatting |

### Database

| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Complete database schema (5 tables) |
| `supabase/rls-policies.sql` | Row Level Security policies |

### Types

| File | Purpose |
|------|---------|
| `types/database.ts` | TypeScript interfaces for all tables |
| `types/supabase.ts` | Supabase-generated types |

## Database Tables

### users
- Stores all users (admin, performer, client)
- Tracks availability for performers
- Linked to Supabase Auth

### bookings
- Main booking records
- Includes performer_eta field
- Tracks all status changes

### vetting_applications
- Client ID verification
- Status: pending → approved/rejected
- Expiry date tracking

### blacklist
- Blocked clients by email/phone
- Reason + notes
- Admin-only access

### audit_log
- Complete audit trail
- All actions logged
- Includes IP + user agent

## Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| profiles | User avatars | User can upload own |
| ids | ID documents | Client upload, Admin view |
| receipts | PayID receipts | Client upload, Admin view |

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | ✅ Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account ID | ✅ Yes |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | ✅ Yes |
| `TWILIO_WHATSAPP_NUMBER` | Your WhatsApp number | ✅ Yes |
| `ADMIN_WHATSAPP` | Admin WhatsApp number | ✅ Yes |
| `PAYID_EMAIL` | PayID email address | ✅ Yes |
| `ENCRYPTION_KEY` | 32-char encryption key | ✅ Yes |
| `TZ` | Timezone (Australia/Perth) | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | App URL | ✅ Yes |

## Workflows

### 1. Booking Creation Flow
```
Client → Select Performer
      → Fill Event Details
      → Upload PayID Receipt
      → API: POST /api/bookings
      → Database: Insert booking
      → WhatsApp: Notify admin
      → Return: Booking + upload URL
```

### 2. Payment Verification Flow
```
Admin → Review Receipt
      → API: POST /api/payid/verify
      → Database: Update payment_status
      → WhatsApp: Notify client + performer
      → Return: Updated booking
```

### 3. Booking Acceptance Flow
```
Performer → View Booking
          → API: POST /api/bookings/[id]/accept
          → Database: Update status to 'accepted'
          → WhatsApp: Notify client
          → Return: Updated booking
```

### 4. ETA Submission Flow
```
Performer → Enter ETA
          → API: POST /api/bookings/[id]/eta
          → Database: Save performer_eta + timestamp
          → WhatsApp: Notify client + admin
          → Return: Updated booking
```

### 5. Vetting Flow
```
Client → Upload ID + Expiry Date
       → API: POST /api/vetting
       → Database: Insert application
       → Storage: Upload ID document
       → Return: Application + upload URL

Admin → Review Application
      → API: PATCH /api/vetting
      → Database: Update status
      → WhatsApp: Notify client
      → Return: Updated application
```

## Real-time Features

### Performer Availability
- Component: `PerformerGrid.tsx`
- Subscribes to: `users` table
- Updates when: Performer changes `is_available`

### Booking Updates
- Dashboard components subscribe to `bookings`
- Updates when: Status changes, ETA submitted
- Filtered by: User role

## Security Layers

1. **Authentication** - Supabase Auth
2. **Authorization** - RLS policies
3. **Encryption** - AES-256 for files
4. **Validation** - Zod schemas
5. **Audit** - All actions logged
6. **Blacklist** - Automatic checking
7. **Vetting** - ID verification required

## API Response Format

### Success Response
```json
{
  "booking": { ... },
  "notifications": {
    "sent": true,
    "failed": []
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [ ... ]  // Zod validation errors
}
```

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Run development
npm run dev

# Build for production
npm run build

# Start production
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

## Deployment URLs

- **Development**: http://localhost:3000
- **Production**: https://your-app.vercel.app
- **Supabase**: https://your-project.supabase.co

## Support

- **Issues**: Check IMPLEMENTATION_GUIDE.md
- **Setup**: Check README.md
- **API Docs**: Check README.md → API Routes section

# Flavor Entertainers | Premium Entertainment Booking Platform

A production-grade booking platform for entertainment professionals and private event staff. Built with modern web technologies for scalability, security, and real-time capabilities.

![Status](https://img.shields.io/badge/status-active-success)
![Next.js](https://img.shields.io/badge/Next.js-15.1-black)
![React](https://img.shields.io/badge/React-19.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## 🌟 Features

### Core Functionality
- **Multi-Role System**: Admin, Performer, and Client role-based access control
- **Real-time Performer Grid**: Live availability updates with Supabase Realtime
- **Smart Booking Workflow**: Multi-step booking process with validation
- **PayID Integration**: Manual payment verification with receipt upload
- **WhatsApp Notifications**: Automated notifications via Twilio for all booking events
- **Performer ETA Tracking**: Real-time location updates and alerts

### Security & Compliance
- **Client ID Verification**: Required ID upload with expiry tracking (6-month validity)
- **Blacklist Protection**: Automated lookup by email/phone to prevent problematic bookings
- **AES-256 Encryption**: Secure storage of sensitive documents
- **Row Level Security (RLS)**: Database-level access control via Supabase
- **Comprehensive Audit Logging**: Track all user actions with timestamps and metadata

### User Experience
- **Mobile-First Design**: Responsive layouts optimized for all devices
- **Real-time Updates**: Live booking status changes
- **Framer Motion Animations**: Smooth, professional UI transitions
- **Timezone Support**: Australia/Perth (UTC+8) with date-fns-tz

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.3](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion 11](https://www.framer.com/motion/)

### Backend
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth with Row Level Security
- **Storage**: Supabase Storage for document uploads
- **Realtime**: Supabase Realtime for live updates

### Integrations
- **Notifications**: [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- **Payments**: PayID (manual verification workflow)
- **Validation**: [Zod 3.22](https://zod.dev/)
- **Encryption**: crypto-js (AES-256)
- **Date Handling**: date-fns & date-fns-tz

### DevOps
- **Hosting**: [Vercel](https://vercel.com/)
- **Deployment URL**: [booking-system-lrkd-annaivky-ship-its-projects.vercel.app](https://booking-system-lrkd-annaivky-ship-its-projects.vercel.app)
- **Database**: Supabase Cloud at `https://lpnvtoysppumesllsgra.supabase.co`

## 📁 Project Structure

```
BOOKING-SYSTEM/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── bookings/             # Booking management endpoints
│   │   │   ├── route.ts          # Create/list bookings
│   │   │   └── [id]/             # Individual booking actions
│   │   ├── payid/                # Payment verification
│   │   ├── vetting/              # Performer vetting
│   │   └── blacklist/            # Blacklist management
│   ├── dashboard/                # User dashboards
│   │   ├── admin/                # Admin panel
│   │   ├── performer/            # Performer dashboard
│   │   └── client/               # Client dashboard
│   ├── login/                    # Authentication pages
│   ├── signup/                   # Registration pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # Reusable React components
│   ├── PerformerGrid.tsx         # Real-time performer availability
│   ├── BookingForm.tsx           # Multi-step booking wizard
│   ├── PayIDVerification.tsx    # Payment verification UI
│   └── ...                       # Other components
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client configuration
│   ├── auth.ts                   # Authentication helpers
│   ├── encryption.ts             # AES-256 encryption utilities
│   └── ...                       # Other utilities
├── types/                        # TypeScript type definitions
│   ├── database.ts               # Database types
│   └── ...                       # Other types
├── supabase/                     # Supabase configuration
│   ├── migrations/               # Database migrations
│   └── config.toml               # Supabase CLI config
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── vercel.json                   # Vercel deployment config
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.17 or later
- **npm**: 9.x or later (or yarn/pnpm)
- **Git**: Latest version
- **Supabase Account**: For database and authentication
- **Twilio Account**: For WhatsApp notifications (optional)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/annaivky-ship-it/BOOKING-SYSTEM.git
cd BOOKING-SYSTEM
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lpnvtoysppumesllsgra.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

4. **Set up the database**

Run the Supabase migrations to create the database schema:

```bash
# If using Supabase CLI locally
npx supabase db reset

# Or apply migrations manually via Supabase Dashboard
# See supabase/migrations/ for SQL files
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint to check code quality |
| `npm run type-check` | Run TypeScript type checking without emitting files |
| `npm run verify` | Verify the setup and environment configuration |

## 🗄 Database Schema Overview

### Core Tables

- **`users`**: User accounts with role-based access (admin, performer, client)
- **`performers`**: Performer profiles with availability status
- **`bookings`**: Booking records with status tracking
- **`services`**: Available services with pricing
- **`blacklist`**: Blocked emails/phone numbers
- **`vetting_applications`**: Performer verification submissions
- **`audit_logs`**: Comprehensive action logging

### Key Features

- **Row Level Security (RLS)**: All tables protected with PostgreSQL RLS policies
- **Realtime Subscriptions**: Live updates on bookings and performer availability
- **Encrypted Storage**: Sensitive documents stored with AES-256 encryption
- **Automatic Timestamps**: Created/updated timestamps on all records

For detailed schema, see the migration files in `supabase/migrations/`.

## 🔒 Security Notes

### Authentication
- Supabase Auth handles user authentication with JWT tokens
- Multi-role system with strict role-based access control
- Session management via Supabase SSR

### Data Protection
- **Encryption**: ID documents and payment receipts encrypted at rest
- **RLS Policies**: Database-level access control prevents unauthorized data access
- **Input Validation**: All user inputs validated with Zod schemas
- **HTTPS Only**: Production environment requires HTTPS

### Best Practices
- Never commit `.env.local` or any file containing secrets
- Rotate API keys regularly
- Use service role key only in API routes, never in client code
- Monitor audit logs for suspicious activity

### ID Verification
- Clients must verify ID before making bookings
- ID verification expires after 6 months
- Documents stored with encrypted filenames

### Blacklist System
- Automatic lookup on booking creation
- Blocks by email or phone number
- Admin-only management

## 🌐 Deployment

### Vercel Deployment

This application is deployed on Vercel:

**Production URL**: [booking-system-lrkd-annaivky-ship-its-projects.vercel.app](https://booking-system-lrkd-annaivky-ship-its-projects.vercel.app)

#### Deploy Your Own

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**

- Go to [vercel.com](https://vercel.com/)
- Import your GitHub repository
- Configure environment variables (from `.env.example`)
- Deploy

3. **Configure Environment Variables in Vercel**

Add all variables from `.env.example` in the Vercel dashboard under Project Settings → Environment Variables.

#### Vercel Configuration

The `vercel.json` file contains deployment configuration. Key settings:

```json
{
  "framework": "nextjs",
  "buildCommand": "next build"
}
```

### Production Checklist

- [ ] Update Supabase URL and keys in environment variables
- [ ] Configure custom domain in Vercel
- [ ] Set up Twilio WhatsApp production number
- [ ] Test all WhatsApp notification templates
- [ ] Verify all RLS policies are active on production database
- [ ] Configure storage bucket policies in Supabase
- [ ] Set up database backups (Supabase handles this automatically)
- [ ] Add error monitoring (e.g., Sentry)
- [ ] Test complete booking workflow end-to-end
- [ ] Update admin user credentials

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

- Follow existing code style and conventions
- Add TypeScript types for all new code
- Write meaningful commit messages

3. **Test your changes**

```bash
npm run type-check  # Check TypeScript
npm run lint        # Check code quality
npm run build       # Ensure builds successfully
```

4. **Commit and push**

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

5. **Create a pull request**

### Code Style

- Use TypeScript for all new code
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling (no inline styles)
- Component names in PascalCase
- Utility functions in camelCase
- Use meaningful variable names

### Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## 🐛 Known Issues & TODOs

### Known Issues

- WhatsApp notifications may fail if Twilio sandbox is not properly configured
- File upload size limits may need adjustment for high-resolution ID documents
- Timezone handling may require additional testing for daylight saving transitions

### Planned Features

- [ ] Automated payment verification with bank API integration
- [ ] Calendar integration for performers (Google Calendar, Outlook)
- [ ] Advanced analytics dashboard for admins
- [ ] Mobile app (React Native)
- [ ] Automated email notifications as fallback to WhatsApp
- [ ] Multi-language support
- [ ] Performer rating and review system
- [ ] Automated booking reminders

### Performance Improvements

- [ ] Image optimization for performer photos
- [ ] Implement caching strategy for frequently accessed data
- [ ] Add database indexes for common queries
- [ ] Optimize bundle size with code splitting

## 📞 Support & Troubleshooting

### Common Issues

**WhatsApp Messages Not Sending**
- Verify Twilio WhatsApp sandbox is active
- Check phone number format (+61... for Australia)
- Ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct in environment variables

**Database Connection Errors**
- Verify Supabase URL and keys are correct
- Check if Supabase project is active (not paused)
- Ensure RLS policies don't block your queries

**Build Failures**
- Run `npm run type-check` to identify TypeScript errors
- Clear `.next` directory and rebuild
- Verify all environment variables are set

**Realtime Not Working**
- Enable Realtime in Supabase Dashboard → Database → Replication
- Check that publication includes the `bookings` and `performers` tables
- Verify network allows WebSocket connections

### Getting Help

1. Check this README for common solutions
2. Review code comments and inline documentation
3. Check Supabase logs in the Supabase Dashboard
4. Review audit logs in the Admin Dashboard
5. Check GitHub Issues for similar problems

## 📄 License

Proprietary - All rights reserved.

---

**Built with ❤️ for the entertainment industry**

For questions or support, please contact the development team.

# Flavor Entertainers Backend

> Production-ready backend for adult entertainment performer bookings in Western Australia

[![CI](https://github.com/flavor-entertainers/backend/actions/workflows/ci.yml/badge.svg)](https://github.com/flavor-entertainers/backend/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.4+-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd flavor-entertainers-backend
cp .env.example .env

# Install dependencies
pnpm install

# Run database migrations
pnpm db:migrate

# Seed development data
pnpm db:seed

# Start development server
pnpm dev
```

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Development Setup](#-development-setup)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Security](#-security)
- [Contributing](#-contributing)

## ✨ Features

### Core Booking System
- **Complete Booking Flow**: Request → Review → Payment → Confirmation → Completion
- **Client Vetting**: ID verification and background checking system
- **PayID Payment System**: Primary payment method with 15% deposits and receipt verification
- **Stripe Fallback**: Optional Stripe integration for international clients

### Performer Management
- **Availability Scheduling**: Real-time availability windows
- **Service Offerings**: Topless Waitress, Striptease, XXX Show
- **Regional Coverage**: Perth Metro, Hills, Mandurah, Rockingham, Joondalup
- **Rate Management**: Flexible pricing per service type

### Notifications & Communication
- **WhatsApp Integration**: Twilio-powered automated notifications
- **Email Notifications**: Booking confirmations and reminders
- **Admin Alerts**: Real-time notifications for new bookings and payments
- **Payment Reminders**: Automated balance due notifications

### Security & Compliance
- **Row-Level Security**: Supabase RLS policies for data protection
- **Audit Logging**: Comprehensive activity tracking
- **Blacklist Management**: Client blocking and safety features
- **Rate Limiting**: API protection against abuse

### Admin Features
- **KPI Dashboard**: Revenue, conversion rates, booking metrics
- **Vetting Queue**: Streamlined client approval workflow
- **Payment Tracking**: Deposit and balance management
- **Performer Analytics**: Availability and booking statistics

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Admin Panel   │    │   Webhooks      │
│                 │    │                 │    │                 │
│ • Public Site   │    │ • Bookings Mgmt │    │ • Stripe        │
│ • Mobile Apps   │    │ • Performer Mgmt│    │ • Payment       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Fastify API Server    │
                    │                           │
                    │ • Authentication         │
                    │ • Business Logic         │
                    │ • Validation             │
                    │ • Error Handling         │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼───────┐    ┌─────────▼───────┐    ┌─────────▼───────┐
│   Supabase      │    │     Redis       │    │   External      │
│                 │    │                 │    │   Services      │
│ • PostgreSQL    │    │ • Job Queues    │    │                 │
│ • Auth          │    │ • Sessions      │    │ • Stripe        │
│ • Storage       │    │ • Cache         │    │ • Twilio        │
│ • RLS           │    │                 │    │ • Resend        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠 Technology Stack

### Core Framework
- **Runtime**: Node.js 18+
- **Framework**: Fastify (HTTP server)
- **Language**: TypeScript
- **Validation**: Zod schemas
- **Package Manager**: pnpm

### Database & Auth
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **ORM**: Supabase Client
- **Migrations**: Raw SQL with custom runner

### Payments & Messaging
- **Payments**: PayID (Primary), Stripe (Fallback)
- **Messaging**: Twilio WhatsApp
- **Email**: Resend API
- **File Storage**: Supabase Storage

### Infrastructure
- **Job Queues**: BullMQ + Redis
- **Logging**: Pino
- **Monitoring**: Built-in health checks
- **Deployment**: Docker + GitHub Actions

### Development
- **Testing**: Vitest
- **Linting**: ESLint + TypeScript
- **Documentation**: OpenAPI 3.0
- **API Testing**: Postman Collection

## 📁 Project Structure

```
flavor-entertainers-backend/
├── apps/
│   └── api/                    # Main API application
│       ├── src/
│       │   ├── routes/         # API route handlers
│       │   ├── services/       # Business logic services
│       │   ├── middleware/     # Custom middleware
│       │   ├── lib/           # Utilities and clients
│       │   └── index.ts       # Application entry point
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/                 # Shared types and schemas
│       ├── src/
│       │   ├── types.ts       # TypeScript interfaces
│       │   ├── schemas.ts     # Zod validation schemas
│       │   └── constants.ts   # Application constants
│       └── package.json
├── db/
│   ├── migrations/            # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── run.ts            # Migration runner
│   └── seed/                 # Seed data
│       ├── seed_data.sql
│       └── run.ts           # Seed runner
├── openapi/
│   └── openapi.yaml          # OpenAPI specification
├── postman/
│   └── Flavor.postman_collection.json
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-entrypoint.sh
├── tests/                    # Test suites
│   ├── auth.test.ts
│   ├── bookings.test.ts
│   ├── setup.ts
│   └── vitest.config.ts
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD
├── .env.example             # Environment template
├── package.json            # Root package configuration
├── pnpm-workspace.yaml     # pnpm workspace config
└── README.md              # This file
```

## 🚧 Development Setup

### Prerequisites
- Node.js 18+ and pnpm 8+
- Supabase project (hosted or local)
- Stripe account (test mode)
- Twilio account with WhatsApp sandbox
- Redis instance (local or hosted)

### Step-by-Step Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd flavor-entertainers-backend
   pnpm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Database Setup**
   ```bash
   # Run migrations
   pnpm db:migrate

   # Seed development data
   pnpm db:seed
   ```

4. **Start Services**
   ```bash
   # Start Redis (if using Docker)
   docker-compose up redis -d

   # Start API server
   pnpm dev
   ```

5. **Verify Setup**
   ```bash
   # Check health endpoint
   curl http://localhost:8080/healthz

   # View API documentation
   open http://localhost:8080/docs
   ```

### Development Workflow

```bash
# Start development server with hot reload
pnpm dev

# Run tests in watch mode
pnpm test:watch

# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Build for production
pnpm build
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -f docker/Dockerfile -t flavor-entertainers-api .

# Run with Docker Compose
docker-compose up -d
```

### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Fly.io Deployment

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Initialize and deploy
fly launch
fly deploy
```

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Server port | No | `8080` |
| `SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | Yes | `eyJ...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes | `whsec_...` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Yes | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Yes | `...` |
| `REDIS_URL` | Redis connection URL | Yes | `redis://...` |

## 📖 API Documentation

### Interactive Documentation
- **Swagger UI**: `http://localhost:8080/docs`
- **OpenAPI Spec**: `/openapi/openapi.yaml`
- **Postman Collection**: `/postman/Flavor.postman_collection.json`

### Key Endpoints

#### Authentication
```http
POST /auth/register     # Register new user
POST /auth/login        # Login user
POST /auth/magic-link   # Send magic link
```

#### Bookings
```http
POST /bookings/request      # Create booking request
GET  /bookings              # List bookings
GET  /bookings/:id          # Get booking details
POST /bookings/:id/approve  # Approve booking (admin)
POST /bookings/:id/cancel   # Cancel booking
```

#### Webhooks
```http
POST /webhooks/stripe   # Stripe payment webhooks
```

### Authentication

All protected endpoints require a Bearer token:

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:8080/bookings
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test auth.test.ts

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test --coverage
```

### Test Structure

- **Unit Tests**: Service and utility functions
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete workflow testing

### Testing PayID Payments

```bash
# Test PayID payment flow
curl -X POST http://localhost:8080/bookings/request \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","phone":"+61412345678","event_date":"2024-12-31","event_time":"20:00","location":"Perth","service":"Topless Waitress","rate":500}'

# Approve booking (admin) - generates PayID instructions
curl -X POST http://localhost:8080/bookings/{booking_id}/approve \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json"

# Upload receipt (client)
curl -X POST http://localhost:8080/payments/{booking_id}/payid-receipt \
  -H "Authorization: Bearer {client_token}" \
  -H "Content-Type: application/json" \
  -d '{"receipt_file":"file-id"}'

# Verify payment (admin)
curl -X POST http://localhost:8080/payments/{payment_id}/verify \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"verified":true,"notes":"Payment confirmed"}'
```

### Testing Stripe Webhooks (Fallback)

```bash
# Install Stripe CLI (if using fallback)
stripe listen --forward-to localhost:8080/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

## 🔒 Security

### Data Protection
- **Row Level Security**: Database-level access control
- **Input Validation**: Zod schema validation
- **Rate Limiting**: API request throttling
- **CORS**: Cross-origin request protection

### Security Headers
- **Helmet**: Security headers middleware
- **HTTPS**: TLS encryption in production
- **Secrets Management**: Environment variable encryption

### Audit Logging
All sensitive operations are logged:
- User authentication
- Booking modifications
- Payment processing
- Admin actions

### Vulnerability Management
- **npm audit**: Dependency scanning
- **Snyk**: Security vulnerability monitoring
- **Regular Updates**: Automated dependency updates

## 🤝 Contributing

### Development Guidelines

1. **Code Style**
   - TypeScript strict mode
   - ESLint configuration
   - Prettier formatting

2. **Git Workflow**
   - Feature branches
   - Conventional commits
   - Pull request reviews

3. **Testing Requirements**
   - Unit tests for new features
   - Integration tests for API changes
   - Minimum 80% code coverage

### Making Changes

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
pnpm test
pnpm lint

# Commit with conventional commit format
git commit -m "feat: add new booking feature"

# Push and create PR
git push origin feature/new-feature
```

## 📄 License

This project is UNLICENSED - All rights reserved.

## 📞 Support

For questions and support:
- Email: contact@lustandlace.com.au
- Documentation: View `/docs` endpoint when running
- Issues: GitHub Issues (if repository is public)

---

**Built with ❤️ for Flavor Entertainers**
-- =====================================================
-- BOOKING PLATFORM DATABASE SCHEMA
-- Region: Australia/Perth (UTC+8)
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'performer', 'client');
CREATE TYPE booking_status AS ENUM ('pending', 'payment_pending', 'payment_verified', 'confirmed', 'accepted', 'declined', 'completed', 'cancelled');
CREATE TYPE vetting_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');

-- =====================================================
-- TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT false, -- for performers
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Vetting applications table
CREATE TABLE vetting_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status vetting_status DEFAULT 'pending',
  id_document_url TEXT NOT NULL, -- encrypted storage path
  id_expiry_date DATE NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blacklist table
CREATE TABLE blacklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  phone TEXT,
  reason TEXT NOT NULL,
  added_by UUID NOT NULL REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  CONSTRAINT blacklist_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES users(id),
  performer_id UUID NOT NULL REFERENCES users(id),
  status booking_status DEFAULT 'pending',

  -- Event details
  event_date DATE NOT NULL,
  event_start_time TIME NOT NULL,
  event_end_time TIME NOT NULL,
  event_location TEXT NOT NULL,
  event_type TEXT,
  special_requests TEXT,

  -- Payment details
  payment_status payment_status DEFAULT 'pending',
  deposit_amount DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  payid_receipt_url TEXT, -- encrypted storage path
  payment_verified_at TIMESTAMPTZ,
  payment_verified_by UUID REFERENCES users(id),

  -- Performer ETA
  performer_eta TEXT, -- e.g., "Arriving in 25 min" or "15:30"
  eta_sent_at TIMESTAMPTZ,
  eta_sent_to_client BOOLEAN DEFAULT false,
  eta_sent_to_admin BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- e.g., 'booking', 'vetting', 'user'
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_available ON users(is_available) WHERE role = 'performer';

CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_performer ON bookings(performer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_number ON bookings(booking_number);

CREATE INDEX idx_vetting_user ON vetting_applications(user_id);
CREATE INDEX idx_vetting_status ON vetting_applications(status);

CREATE INDEX idx_blacklist_email ON blacklist(email);
CREATE INDEX idx_blacklist_phone ON blacklist(phone);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Generate unique booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    new_number := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM bookings WHERE booking_number = new_number) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate booking number on insert
CREATE OR REPLACE FUNCTION set_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number := generate_booking_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_number
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_booking_number();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vetting_updated_at BEFORE UPDATE ON vetting_applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKETS (Run these via Supabase Dashboard or API)
-- =====================================================

-- Run these commands in Supabase Dashboard > Storage:
-- 1. Create bucket 'profiles' (public: false)
-- 2. Create bucket 'ids' (public: false)
-- 3. Create bucket 'receipts' (public: false)

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create default admin user (update email and details)
INSERT INTO users (email, role, full_name, phone, is_active)
VALUES ('admin@example.com', 'admin', 'System Administrator', '+61400000000', true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'All platform users (admins, performers, clients)';
COMMENT ON TABLE bookings IS 'Booking records with ETA tracking';
COMMENT ON TABLE vetting_applications IS 'Client ID verification records';
COMMENT ON TABLE blacklist IS 'Blocked clients by email/phone';
COMMENT ON TABLE audit_log IS 'Complete audit trail of all actions';

COMMENT ON COLUMN bookings.performer_eta IS 'Performer ETA message sent to client and admin';
COMMENT ON COLUMN bookings.eta_sent_at IS 'Timestamp when ETA was sent';

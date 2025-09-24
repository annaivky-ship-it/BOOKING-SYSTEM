-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'performer', 'client');
CREATE TYPE booking_status AS ENUM ('pending_review', 'awaiting_payment', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('stripe', 'payid', 'cash');
CREATE TYPE payment_status AS ENUM ('requires_action', 'succeeded', 'failed', 'refunded');
CREATE TYPE vetting_status AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE blacklist_status AS ENUM ('active', 'cleared');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email CITEXT UNIQUE NOT NULL,
    role user_role NOT NULL,
    display_name TEXT,
    phone TEXT CHECK (phone ~ '^\+61[0-9]{9}$'),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performers table
CREATE TABLE public.performers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL,
    region TEXT NOT NULL,
    services TEXT[] NOT NULL DEFAULT '{}',
    whatsapp_number TEXT CHECK (whatsapp_number ~ '^\+61[0-9]{9}$'),
    rate_card JSONB NOT NULL DEFAULT '{}',
    available_now BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Availability table
CREATE TABLE public.availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    performer_id UUID NOT NULL REFERENCES public.performers(id) ON DELETE CASCADE,
    start_ts TIMESTAMPTZ NOT NULL,
    end_ts TIMESTAMPTZ NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT availability_valid_timerange CHECK (end_ts > start_ts)
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id),
    performer_id UUID REFERENCES public.performers(id),
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location TEXT NOT NULL,
    service TEXT NOT NULL,
    rate NUMERIC(10,2) NOT NULL CHECK (rate > 0),
    booking_fee NUMERIC(10,2) NOT NULL DEFAULT 25.00,
    total NUMERIC(10,2) NOT NULL CHECK (total > 0),
    message TEXT,
    status booking_status NOT NULL DEFAULT 'pending_review',
    payment_link_url TEXT,
    stripe_payment_intent_id TEXT,
    balance_due NUMERIC(10,2) NOT NULL,
    balance_due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT bookings_future_event CHECK (event_date >= CURRENT_DATE)
);

-- Payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'AUD',
    method payment_method NOT NULL,
    status payment_status NOT NULL,
    provider_ref TEXT,
    receipt_file_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Vetting applications table
CREATE TABLE public.vetting_applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id),
    full_name TEXT NOT NULL,
    email CITEXT NOT NULL,
    mobile TEXT NOT NULL CHECK (mobile ~ '^\+61[0-9]{9}$'),
    event_date DATE NOT NULL,
    event_address TEXT NOT NULL,
    event_type TEXT NOT NULL,
    status vetting_status NOT NULL DEFAULT 'pending',
    reason TEXT,
    submission_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    decision_time TIMESTAMPTZ,
    decision_by UUID REFERENCES public.profiles(id),
    id_valid BOOLEAN,
    file_id TEXT,
    discrepancies TEXT,
    ip_address INET,
    notes TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expiry_date DATE,
    created_by UUID REFERENCES public.profiles(id)
);

-- Blacklist table
CREATE TABLE public.blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT,
    email CITEXT,
    phone TEXT,
    reason TEXT NOT NULL,
    date_added DATE DEFAULT CURRENT_DATE NOT NULL,
    added_by UUID NOT NULL REFERENCES public.profiles(id),
    status blacklist_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT blacklist_has_identifier CHECK (
        full_name IS NOT NULL OR email IS NOT NULL OR phone IS NOT NULL
    )
);

-- Approved clients table
CREATE TABLE public.approved_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    approval_date DATE DEFAULT CURRENT_DATE NOT NULL,
    expiry_date DATE,
    approved_by UUID NOT NULL REFERENCES public.profiles(id),
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(client_id)
);

-- Audit log table
CREATE TABLE public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    event_type TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_user_id UUID REFERENCES public.profiles(id),
    actor_email CITEXT,
    request_id TEXT,
    ip INET,
    details JSONB,
    booking_id UUID REFERENCES public.bookings(id),
    application_id UUID REFERENCES public.vetting_applications(application_id),
    client_email CITEXT,
    performer_id UUID REFERENCES public.performers(id)
);

-- Events processed table (for webhook idempotency)
CREATE TABLE public.events_processed (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_performers_region ON public.performers(region);
CREATE INDEX idx_performers_available_now ON public.performers(available_now);
CREATE INDEX idx_performers_services ON public.performers USING GIN(services);
CREATE INDEX idx_availability_performer_id ON public.availability(performer_id);
CREATE INDEX idx_availability_timerange ON public.availability(start_ts, end_ts);
CREATE INDEX idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX idx_bookings_performer_id ON public.bookings(performer_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at);
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_vetting_status ON public.vetting_applications(status);
CREATE INDEX idx_vetting_email ON public.vetting_applications(email);
CREATE INDEX idx_vetting_submission_time ON public.vetting_applications(submission_time);
CREATE INDEX idx_blacklist_email ON public.blacklist(email);
CREATE INDEX idx_blacklist_phone ON public.blacklist(phone);
CREATE INDEX idx_blacklist_status ON public.blacklist(status);
CREATE INDEX idx_approved_clients_client_id ON public.approved_clients(client_id);
CREATE INDEX idx_audit_log_timestamp ON public.audit_log(timestamp);
CREATE INDEX idx_audit_log_event_type ON public.audit_log(event_type);
CREATE INDEX idx_audit_log_actor_email ON public.audit_log(actor_email);

-- Functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performers_updated_at BEFORE UPDATE ON public.performers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vetting_updated_at BEFORE UPDATE ON public.vetting_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blacklist_updated_at BEFORE UPDATE ON public.blacklist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approved_clients_updated_at BEFORE UPDATE ON public.approved_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
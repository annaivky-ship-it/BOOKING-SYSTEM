-- =====================================================
-- FLAVOR ENTERTAINERS - COMPLETE SUPABASE SCHEMA
-- =====================================================
-- This schema creates all tables, RLS policies, and storage buckets
-- for the Flavor Entertainers booking platform
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. SERVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('Waitressing', 'Strip Show', 'Promotional & Hosting')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    rate DECIMAL(10, 2) NOT NULL CHECK (rate > 0),
    rate_type TEXT NOT NULL CHECK (rate_type IN ('per_hour', 'flat')),
    min_duration_hours INTEGER DEFAULT NULL,
    duration_minutes INTEGER DEFAULT NULL,
    booking_notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PERFORMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.performers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    bio TEXT NOT NULL,
    service_ids TEXT[] NOT NULL DEFAULT '{}',
    service_areas TEXT[] NOT NULL DEFAULT '{}' CHECK (
        service_areas <@ ARRAY['Perth North', 'Perth South', 'Southwest', 'Northwest']
    ),
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'offline')),
    email TEXT UNIQUE,
    phone TEXT,
    password_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    performer_id INTEGER NOT NULL REFERENCES public.performers(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    event_address TEXT NOT NULL,
    event_type TEXT NOT NULL,
    duration_hours INTEGER NOT NULL CHECK (duration_hours > 0),
    number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
    services_requested TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending_performer_acceptance' CHECK (
        status IN (
            'pending_performer_acceptance',
            'pending_vetting',
            'deposit_pending',
            'pending_deposit_confirmation',
            'confirmed',
            'rejected'
        )
    ),
    id_document_path TEXT,
    deposit_receipt_path TEXT,
    verified_by_admin_name TEXT,
    verified_at TIMESTAMPTZ,
    client_message TEXT,
    performer_reassigned_from_id INTEGER REFERENCES public.performers(id),
    performer_eta_minutes INTEGER,
    total_cost DECIMAL(10, 2),
    deposit_amount DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. DO NOT SERVE LIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.do_not_serve_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_by_performer_id INTEGER NOT NULL REFERENCES public.performers(id) ON DELETE CASCADE,
    reviewed_by_admin_name TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_dns_email ON public.do_not_serve_list(client_email);
CREATE INDEX IF NOT EXISTS idx_dns_phone ON public.do_not_serve_list(client_phone);
CREATE INDEX IF NOT EXISTS idx_dns_status ON public.do_not_serve_list(status);

-- =====================================================
-- 5. COMMUNICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('booking_update', 'booking_confirmation', 'admin_message', 'system_alert', 'direct_message')),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster message retrieval
CREATE INDEX IF NOT EXISTS idx_communications_recipient ON public.communications(recipient);
CREATE INDEX IF NOT EXISTS idx_communications_booking ON public.communications(booking_id);
CREATE INDEX IF NOT EXISTS idx_communications_read ON public.communications(read);

-- =====================================================
-- 6. ADMINS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admins (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. CLIENTS TABLE (for VIP client tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    is_vip BOOLEAN DEFAULT FALSE,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. BOOKING HISTORY / AUDIT LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.booking_audit_log (
    id SERIAL PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performers_updated_at BEFORE UPDATE ON public.performers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_do_not_serve_list_updated_at BEFORE UPDATE ON public.do_not_serve_list
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if client is on do not serve list
CREATE OR REPLACE FUNCTION is_client_blocked(
    p_email TEXT,
    p_phone TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.do_not_serve_list
        WHERE status = 'approved'
        AND (client_email = p_email OR client_phone = p_phone)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update client VIP status
CREATE OR REPLACE FUNCTION update_client_vip_status(p_client_email TEXT) RETURNS VOID AS $$
DECLARE
    confirmed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO confirmed_count
    FROM public.bookings
    WHERE client_email = p_client_email
    AND status = 'confirmed';

    -- Update or insert client record
    INSERT INTO public.clients (email, name, total_bookings, is_vip)
    SELECT
        client_email,
        client_name,
        confirmed_count,
        confirmed_count >= 3 -- VIP after 3+ confirmed bookings
    FROM public.bookings
    WHERE client_email = p_client_email
    LIMIT 1
    ON CONFLICT (email) DO UPDATE SET
        total_bookings = EXCLUDED.total_bookings,
        is_vip = EXCLUDED.is_vip;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update VIP status when booking is confirmed
CREATE OR REPLACE FUNCTION trigger_update_vip_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        PERFORM update_client_vip_status(NEW.client_email);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_confirmed_update_vip
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    WHEN (NEW.status = 'confirmed')
    EXECUTE FUNCTION trigger_update_vip_status();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.do_not_serve_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Services: Public read access
CREATE POLICY "Services are viewable by everyone"
    ON public.services FOR SELECT
    USING (true);

-- Performers: Public read access for basic info
CREATE POLICY "Performers are viewable by everyone"
    ON public.performers FOR SELECT
    USING (true);

-- Performers: Only performer can update their own profile
CREATE POLICY "Performers can update own profile"
    ON public.performers FOR UPDATE
    USING (auth.uid()::text = email);

-- Bookings: Clients can create bookings
CREATE POLICY "Anyone can create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (true);

-- Bookings: Clients can view their own bookings
CREATE POLICY "Clients can view own bookings"
    ON public.bookings FOR SELECT
    USING (client_email = auth.jwt()->>'email');

-- Bookings: Performers can view their assigned bookings
CREATE POLICY "Performers can view assigned bookings"
    ON public.bookings FOR SELECT
    USING (performer_id IN (
        SELECT id FROM public.performers WHERE email = auth.jwt()->>'email'
    ));

-- Bookings: Performers can update their assigned bookings
CREATE POLICY "Performers can update assigned bookings"
    ON public.bookings FOR UPDATE
    USING (performer_id IN (
        SELECT id FROM public.performers WHERE email = auth.jwt()->>'email'
    ));

-- Do Not Serve: Performers can insert entries
CREATE POLICY "Performers can submit do not serve entries"
    ON public.do_not_serve_list FOR INSERT
    WITH CHECK (submitted_by_performer_id IN (
        SELECT id FROM public.performers WHERE email = auth.jwt()->>'email'
    ));

-- Do Not Serve: Performers can view all approved entries
CREATE POLICY "Performers can view approved do not serve entries"
    ON public.do_not_serve_list FOR SELECT
    USING (status = 'approved');

-- Communications: Users can view their own messages
CREATE POLICY "Users can view own communications"
    ON public.communications FOR SELECT
    USING (
        recipient = auth.jwt()->>'email'
        OR sender = auth.jwt()->>'email'
    );

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_bookings_performer ON public.bookings(performer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON public.bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_performers_status ON public.performers(status);
CREATE INDEX IF NOT EXISTS idx_performers_email ON public.performers(email);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for bookings with performer details
CREATE OR REPLACE VIEW public.bookings_with_performers AS
SELECT
    b.*,
    p.name as performer_name,
    p.photo_url as performer_photo,
    p.phone as performer_phone
FROM public.bookings b
LEFT JOIN public.performers p ON b.performer_id = p.id;

-- View for do not serve list with performer details
CREATE OR REPLACE VIEW public.do_not_serve_with_performers AS
SELECT
    dns.*,
    p.name as performer_name
FROM public.do_not_serve_list dns
LEFT JOIN public.performers p ON dns.submitted_by_performer_id = p.id;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- COMPLETE! Next: Insert seed data
-- =====================================================

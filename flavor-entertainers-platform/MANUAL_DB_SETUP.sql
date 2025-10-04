-- =============================================================================
-- FLAVOR ENTERTAINERS - MANUAL DATABASE SETUP
-- =============================================================================
-- Copy and paste this SQL into your Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/fmezpefpletmnthrmupu/sql

-- 1. Create necessary enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'performer', 'client');
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled');
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    CREATE TYPE vetting_status AS ENUM ('submitted', 'approved', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create core tables
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role DEFAULT 'client',
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    whatsapp TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_rate NUMERIC DEFAULT 0,
    rate_type TEXT DEFAULT 'per_hour',
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.performers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stage_name TEXT NOT NULL,
    bio TEXT,
    location TEXT,
    slug TEXT UNIQUE,
    services JSONB DEFAULT '{}',
    rate_card JSONB DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    hero_image TEXT,
    gallery_images TEXT[],
    verification_status TEXT DEFAULT 'pending',
    rating NUMERIC DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.performer_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    custom_rate NUMERIC,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(performer_id, service_id)
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_reference TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id),
    event_type TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    event_address TEXT,
    duration_hours NUMERIC DEFAULT 1,
    status booking_status DEFAULT 'pending',
    total_amount NUMERIC DEFAULT 0,
    deposit_amount NUMERIC DEFAULT 0,
    deposit_percent NUMERIC DEFAULT 15,
    referral_percent NUMERIC DEFAULT 0,
    referral_amount NUMERIC DEFAULT 0,
    notes TEXT,
    special_requests TEXT,
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    venue TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    method TEXT DEFAULT 'PAYID',
    status payment_status DEFAULT 'pending',
    transaction_id TEXT,
    receipt_file TEXT,
    payid_reference TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blacklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    email TEXT,
    phone TEXT,
    reason TEXT NOT NULL,
    severity_level INTEGER DEFAULT 2 CHECK (severity_level >= 1 AND severity_level <= 4),
    notes TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vetting_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stage_name TEXT NOT NULL,
    bio TEXT,
    location TEXT,
    services_offered TEXT[],
    experience_years INTEGER,
    portfolio_urls TEXT[],
    id_document_url TEXT,
    insurance_document_url TEXT,
    references JSONB DEFAULT '[]',
    status vetting_status DEFAULT 'submitted',
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'sms' CHECK (message_type IN ('sms', 'whatsapp', 'email')),
    variables TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.message_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID REFERENCES public.profiles(id),
    booking_id UUID REFERENCES public.bookings(id),
    template_id UUID REFERENCES public.message_templates(id),
    message_type TEXT CHECK (message_type IN ('sms', 'whatsapp', 'email')),
    recipient_phone TEXT,
    recipient_email TEXT,
    message_content TEXT NOT NULL,
    twilio_sid TEXT,
    twilio_status TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    error_message TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vetting_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
CREATE POLICY IF NOT EXISTS "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Services are viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Performers are viewable by everyone" ON public.performers FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Performers can update their own profile" ON public.performers FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view their own bookings" ON public.bookings FOR SELECT USING (
    auth.uid() = client_id OR
    auth.uid() IN (SELECT user_id FROM public.performers WHERE id = performer_id) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY IF NOT EXISTS "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = client_id);

-- 6. Create user registration function and trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create useful functions
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    ref TEXT;
BEGIN
    ref := 'FE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    WHILE EXISTS (SELECT 1 FROM public.bookings WHERE booking_reference = ref) LOOP
        ref := 'FE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END LOOP;

    RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- 8. Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performers_updated_at BEFORE UPDATE ON public.performers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert sample data
INSERT INTO public.services (name, description, base_rate, rate_type, category) VALUES
('Topless Waitressing', 'Professional topless waitressing service', 150, 'per_hour', 'Waitressing'),
('Nude Waitressing', 'Professional nude waitressing service', 180, 'per_hour', 'Waitressing'),
('Lingerie Waitressing', 'Professional lingerie waitressing service', 120, 'per_hour', 'Waitressing'),
('Entertainment Show', 'Live entertainment performance', 300, 'per_show', 'Performance'),
('Personal Hosting', 'Professional hosting and companionship', 200, 'per_hour', 'Hosting')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.message_templates (template_key, name, content, message_type, variables) VALUES
('booking_confirmation', 'Booking Confirmation', 'Hi {{client_name}}! Your booking for {{event_date}} has been confirmed. Reference: {{booking_reference}}. We look forward to providing you with an amazing experience!', 'whatsapp', ARRAY['client_name', 'event_date', 'booking_reference']),
('payment_reminder', 'Payment Reminder', 'Hi {{client_name}}! This is a reminder that payment of {{amount}} is due for your booking {{booking_reference}} on {{due_date}}. Please pay via PayID.', 'whatsapp', ARRAY['client_name', 'amount', 'booking_reference', 'due_date']),
('event_reminder', 'Event Reminder', 'Hi {{client_name}}! This is a reminder of your booking tomorrow at {{event_time}} for {{venue}}. Reference: {{booking_reference}}. Looking forward to seeing you!', 'whatsapp', ARRAY['client_name', 'event_time', 'venue', 'booking_reference'])
ON CONFLICT (template_key) DO NOTHING;

-- 10. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Database setup completed! 🎉 Your Flavor Entertainers platform is ready!' as status;
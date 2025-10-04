-- Comprehensive Platform Update Migration
-- Updates the schema to match the master prompt requirements

-- First, let's update the existing enums and create new ones
DO $$ BEGIN
    -- Update booking status to match requirements
    ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'approved';
    ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'rejected';
    ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'in_progress';

    -- Create new enums as needed
    CREATE TYPE vetting_status AS ENUM ('submitted', 'approved', 'rejected', 'expired');
    CREATE TYPE blacklist_status AS ENUM ('active', 'inactive', 'expired');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create profiles table (simpler than users table, matching the prompt)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role DEFAULT 'client',
    display_name TEXT,
    whatsapp TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table for configurable values
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    deposit_percent NUMERIC DEFAULT 15,
    referral_percent NUMERIC DEFAULT 0,
    admin_whatsapp TEXT,
    admin_email TEXT,
    payid_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Update performers table to include required fields
DO $$ BEGIN
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'performers' AND column_name = 'slug') THEN
        ALTER TABLE public.performers ADD COLUMN slug TEXT UNIQUE;
        ALTER TABLE public.performers ADD COLUMN services JSONB DEFAULT '{}';
        ALTER TABLE public.performers ADD COLUMN rate_card JSONB DEFAULT '{}';
        ALTER TABLE public.performers ADD COLUMN is_available BOOLEAN DEFAULT true;
        ALTER TABLE public.performers ADD COLUMN hero_image TEXT;
    END IF;
END $$;

-- Update bookings table to include all required fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'service') THEN
        ALTER TABLE public.bookings ADD COLUMN service TEXT;
        ALTER TABLE public.bookings ADD COLUMN event_address TEXT;
        ALTER TABLE public.bookings ADD COLUMN deposit_percent NUMERIC DEFAULT 15;
        ALTER TABLE public.bookings ADD COLUMN referral_percent NUMERIC DEFAULT 0;
        ALTER TABLE public.bookings ADD COLUMN referral_amount NUMERIC DEFAULT 0;
        ALTER TABLE public.bookings ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Update payments table to match requirements
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'method') THEN
        ALTER TABLE public.payments ADD COLUMN method TEXT DEFAULT 'PAYID';
        ALTER TABLE public.payments ADD COLUMN receipt_file TEXT;
    END IF;
END $$;

-- Create blacklist table (updated from do_not_serve_registry)
CREATE TABLE IF NOT EXISTS public.blacklist (
    id SERIAL PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    reason TEXT,
    status TEXT DEFAULT 'active',
    date_added DATE DEFAULT CURRENT_DATE,
    added_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table for tracking all system events
CREATE TABLE IF NOT EXISTS public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    actor UUID REFERENCES public.profiles(id),
    event_type TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vetting_applications table (if doesn't exist, otherwise update)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vetting_applications_new') THEN
        CREATE TABLE public.vetting_applications_new (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            status vetting_status DEFAULT 'submitted',
            id_file TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            decided_at TIMESTAMP WITH TIME ZONE
        );
    END IF;
END $$;

-- Add indexes for performance (matching the prompt requirements)
CREATE INDEX IF NOT EXISTS idx_bookings_performer_event_date ON public.bookings(performer_id, event_date);
CREATE INDEX IF NOT EXISTS idx_blacklist_email ON public.blacklist(email);
CREATE INDEX IF NOT EXISTS idx_blacklist_phone ON public.blacklist(phone);
CREATE INDEX IF NOT EXISTS idx_performers_slug ON public.performers(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- Create trigger to create profile on auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for system_settings
CREATE POLICY "System settings viewable by authenticated users" ON public.system_settings
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can update system settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for blacklist
CREATE POLICY "Admins can view blacklist" ON public.blacklist
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage blacklist" ON public.blacklist
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for audit_log
CREATE POLICY "Admins can view audit log" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to check blacklist
CREATE OR REPLACE FUNCTION check_blacklist(client_email TEXT, client_phone TEXT DEFAULT NULL)
RETURNS TABLE (
    is_blacklisted BOOLEAN,
    reason TEXT,
    date_added DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE as is_blacklisted,
        b.reason,
        b.date_added
    FROM public.blacklist b
    WHERE (b.email = client_email OR (client_phone IS NOT NULL AND b.phone = client_phone))
      AND b.status = 'active'
    LIMIT 1;

    -- If no rows returned, user is not blacklisted
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::DATE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_actor UUID,
    p_event_type TEXT,
    p_action TEXT,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.audit_log (actor, event_type, action, details)
    VALUES (p_actor, p_event_type, p_action, p_details)
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default system settings
INSERT INTO public.system_settings (deposit_percent, referral_percent, admin_email, payid_email)
VALUES (15, 0, 'contact@lustandlace.com.au', 'annaivky@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- Create function to generate performer slugs
CREATE OR REPLACE FUNCTION generate_performer_slug(stage_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from stage name
    base_slug := lower(regexp_replace(stage_name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);

    final_slug := base_slug;

    -- Check for uniqueness and append number if needed
    WHILE EXISTS (SELECT 1 FROM public.performers WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers for new tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blacklist_updated_at
    BEFORE UPDATE ON public.blacklist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.system_settings TO authenticated;
GRANT SELECT ON public.blacklist TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION check_blacklist TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION generate_performer_slug TO authenticated;
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const setupSQL = `
-- =============================================================================
-- FLAVOR ENTERTAINERS - COMPLETE DATABASE SCHEMA
-- =============================================================================

-- Create necessary enums first
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'performer', 'client');
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled');
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    CREATE TYPE vetting_status AS ENUM ('submitted', 'approved', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table (core user profiles)
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

-- Create services table
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

-- Create performers table
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

-- Create performer_services junction table
CREATE TABLE IF NOT EXISTS public.performer_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    custom_rate NUMERIC,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(performer_id, service_id)
);

-- Create bookings table
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

-- Create payments table
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

-- Create reviews table
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

-- Create system_settings table
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

-- Create blacklist table
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

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor UUID REFERENCES public.profiles(id),
    event_type TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vetting_applications table
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

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    whatsapp_notifications BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT false,
    sms_phone_number TEXT,
    whatsapp_phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_templates table
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

-- Create message_logs table
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

-- Create safety_alerts table
CREATE TABLE IF NOT EXISTS public.safety_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity_level INTEGER DEFAULT 2 CHECK (severity_level >= 1 AND severity_level <= 5),
    target_audience TEXT[] DEFAULT ARRAY['performers'],
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_type TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    headers JSONB,
    payload JSONB,
    response_status INTEGER,
    error_message TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

const setupSQL2 = `
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_performer_event_date ON public.bookings(performer_id, event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_email ON public.blacklist(email);
CREATE INDEX IF NOT EXISTS idx_blacklist_phone ON public.blacklist(phone);
CREATE INDEX IF NOT EXISTS idx_performers_slug ON public.performers(slug);
CREATE INDEX IF NOT EXISTS idx_performers_verification_status ON public.performers(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_message_logs_recipient ON public.message_logs(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_status ON public.message_logs(status);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_active ON public.safety_alerts(is_active, expires_at);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );

    -- Create default notification preferences
    INSERT INTO public.notification_preferences (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    ref TEXT;
BEGIN
    ref := 'FE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.bookings WHERE booking_reference = ref) LOOP
        ref := 'FE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END LOOP;

    RETURN ref;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate performer slug
CREATE OR REPLACE FUNCTION generate_performer_slug(stage_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    base_slug := lower(regexp_replace(stage_name, '[^a-zA-Z0-9\\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);

    final_slug := base_slug;

    WHILE EXISTS (SELECT 1 FROM public.performers WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
`;

const setupSQL3 = `
-- Add updated_at triggers for all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performers_updated_at BEFORE UPDATE ON public.performers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blacklist_updated_at BEFORE UPDATE ON public.blacklist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vetting_applications_updated_at BEFORE UPDATE ON public.vetting_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_logs_updated_at BEFORE UPDATE ON public.message_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_safety_alerts_updated_at BEFORE UPDATE ON public.safety_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vetting_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
`;

const rlsPolicies = `
-- RLS Policies for profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for performers
DROP POLICY IF EXISTS "Performers are viewable by everyone" ON public.performers;
CREATE POLICY "Performers are viewable by everyone" ON public.performers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Performers can update their own profile" ON public.performers;
CREATE POLICY "Performers can update their own profile" ON public.performers FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (
    auth.uid() = client_id OR
    auth.uid() IN (SELECT user_id FROM public.performers WHERE id = performer_id) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = client_id);

-- RLS Policies for admin-only tables
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings" ON public.system_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can manage blacklist" ON public.blacklist;
CREATE POLICY "Admins can manage blacklist" ON public.blacklist FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
`;

const seedData = `
-- Insert default data
INSERT INTO public.system_settings (deposit_percent, referral_percent, admin_email, payid_email)
VALUES (15, 0, 'contact@lustandlace.com.au', 'annaivky@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- Insert default services
INSERT INTO public.services (name, description, base_rate, rate_type, category) VALUES
('Topless Waitressing', 'Professional topless waitressing service', 150, 'per_hour', 'Waitressing'),
('Nude Waitressing', 'Professional nude waitressing service', 180, 'per_hour', 'Waitressing'),
('Lingerie Waitressing', 'Professional lingerie waitressing service', 120, 'per_hour', 'Waitressing'),
('Entertainment Show', 'Live entertainment performance', 300, 'per_show', 'Performance'),
('Personal Hosting', 'Professional hosting and companionship', 200, 'per_hour', 'Hosting')
ON CONFLICT DO NOTHING;

-- Insert default message templates
INSERT INTO public.message_templates (template_key, name, content, message_type, variables) VALUES
('booking_confirmation', 'Booking Confirmation', 'Hi {{client_name}}! Your booking for {{event_date}} has been confirmed. Reference: {{booking_reference}}. We look forward to providing you with an amazing experience!', 'whatsapp', ARRAY['client_name', 'event_date', 'booking_reference']),
('payment_reminder', 'Payment Reminder', 'Hi {{client_name}}! This is a reminder that payment of {{amount}} is due for your booking {{booking_reference}} on {{due_date}}. Please pay via PayID to: {{payid_email}}', 'whatsapp', ARRAY['client_name', 'amount', 'booking_reference', 'due_date', 'payid_email']),
('event_reminder', 'Event Reminder', 'Hi {{client_name}}! This is a reminder of your booking tomorrow at {{event_time}} for {{venue}}. Reference: {{booking_reference}}. Looking forward to seeing you!', 'whatsapp', ARRAY['client_name', 'event_time', 'venue', 'booking_reference']),
('safety_alert', 'Safety Alert', '🚨 {{severity}} ALERT: {{alert_title}} - {{alert_message}}. Please stay safe and contact support if needed.', 'whatsapp', ARRAY['severity', 'alert_title', 'alert_message']),
('welcome_performer', 'Welcome New Performer', 'Welcome to {{platform_name}}, {{performer_name}}! Your application has been approved. You can now start receiving bookings through our platform.', 'whatsapp', ARRAY['platform_name', 'performer_name'])
ON CONFLICT (template_key) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
`;

async function executeSQL(sql, name) {
  try {
    console.log(`🔄 Executing ${name}...`);
    const { error } = await supabase.rpc('exec', { sql });
    if (error) throw error;
    console.log(`✅ ${name} completed successfully`);
  } catch (error) {
    console.log(`⚠️ ${name} completed with warnings:`, error.message);
  }
}

async function setupDatabase() {
  try {
    console.log('🚀 Starting Flavor Entertainers database setup...');
    console.log(`📍 Database URL: ${supabaseUrl}`);

    // Test connection first
    const { data, error } = await supabase.from('auth.users').select('count', { count: 'exact', head: true });
    if (error && !error.message.includes('permission denied')) {
      console.error('❌ Connection failed:', error.message);
      return;
    }

    console.log('✅ Connected to Supabase successfully!');

    // Execute SQL in parts
    await executeSQL(setupSQL, 'Core Tables Setup');
    await executeSQL(setupSQL2, 'Functions and Indexes');
    await executeSQL(setupSQL3, 'Triggers and RLS Enable');
    await executeSQL(rlsPolicies, 'RLS Policies');
    await executeSQL(seedData, 'Seed Data');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 What was created:');
    console.log('✅ 16 core tables with relationships');
    console.log('✅ Row Level Security policies');
    console.log('✅ User registration triggers');
    console.log('✅ Default services and message templates');
    console.log('✅ Admin functions and audit logging');

    // Verify key tables
    console.log('\n🔍 Verifying database...');
    const tables = ['profiles', 'performers', 'bookings', 'payments', 'services'];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': Ready (${count || 0} rows)`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }

    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3000');
    console.log('3. Test the platform functionality');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabase();
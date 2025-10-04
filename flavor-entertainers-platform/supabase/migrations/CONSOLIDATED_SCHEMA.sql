-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'performer', 'client');
CREATE TYPE application_status AS ENUM ('pending', 'needs_review', 'approved', 'rejected', 'expired');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'disputed');
CREATE TYPE payment_method AS ENUM ('payid', 'bank_transfer', 'cash');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'client',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  profile_picture_url TEXT,
  organization_id UUID,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Vetting applications table
CREATE TABLE public.vetting_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  location TEXT NOT NULL,
  performance_type TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  portfolio_urls JSONB DEFAULT '[]',
  documents JSONB DEFAULT '{}',
  status application_status DEFAULT 'pending',
  reviewer_id UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  approval_notes TEXT,
  background_check_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performers table (approved applications)
CREATE TABLE public.performers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.vetting_applications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  stage_name TEXT NOT NULL,
  bio TEXT,
  performance_types JSONB DEFAULT '[]',
  service_areas JSONB DEFAULT '[]',
  base_rate DECIMAL(10,2),
  hourly_rate DECIMAL(10,2),
  availability_calendar JSONB DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  social_media_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours INTEGER NOT NULL,
  location JSONB NOT NULL,
  guest_count INTEGER,
  age_group TEXT,
  special_requirements TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  status booking_status DEFAULT 'pending',
  booking_reference TEXT UNIQUE NOT NULL,
  contract_signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  payid_transaction_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'AUD',
  payment_method payment_method NOT NULL,
  payid_identifier TEXT,
  status payment_status DEFAULT 'pending',
  proof_of_payment_url TEXT,
  confirmed_by UUID REFERENCES public.users(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  response TEXT,
  response_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id UUID,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_vetting_applications_status ON public.vetting_applications(status);
CREATE INDEX idx_vetting_applications_user_id ON public.vetting_applications(user_id);
CREATE INDEX idx_performers_user_id ON public.performers(user_id);
CREATE INDEX idx_performers_featured ON public.performers(featured);
CREATE INDEX idx_performers_rating ON public.performers(rating);
CREATE INDEX idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX idx_bookings_performer_id ON public.bookings(performer_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_reviews_performer_id ON public.reviews(performer_id);
CREATE INDEX idx_messages_booking_id ON public.messages(booking_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vetting_applications_updated_at BEFORE UPDATE ON public.vetting_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performers_updated_at BEFORE UPDATE ON public.performers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'FE-';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update performer rating
CREATE OR REPLACE FUNCTION update_performer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.performers
  SET
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE performer_id = NEW.performer_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE performer_id = NEW.performer_id
    )
  WHERE id = NEW.performer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_performer_rating_trigger
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_performer_rating();

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vetting_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Vetting applications policies
CREATE POLICY "Users can view their own applications" ON public.vetting_applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own applications" ON public.vetting_applications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their pending applications" ON public.vetting_applications FOR UPDATE USING (
  user_id = auth.uid() AND status = 'pending'
);
CREATE POLICY "Admins can view all applications" ON public.vetting_applications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Performers policies
CREATE POLICY "Anyone can view approved performers" ON public.performers FOR SELECT USING (true);
CREATE POLICY "Performers can update their own profile" ON public.performers FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all performers" ON public.performers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (
  client_id = auth.uid() OR
  performer_id IN (SELECT id FROM public.performers WHERE user_id = auth.uid())
);
CREATE POLICY "Clients can create bookings" ON public.bookings FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (
  client_id = auth.uid() OR
  performer_id IN (SELECT id FROM public.performers WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Payments policies
CREATE POLICY "Users can view payments for their bookings" ON public.payments FOR SELECT USING (
  booking_id IN (
    SELECT id FROM public.bookings
    WHERE client_id = auth.uid() OR
    performer_id IN (SELECT id FROM public.performers WHERE user_id = auth.uid())
  )
);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews for their bookings" ON public.reviews FOR INSERT WITH CHECK (
  client_id = auth.uid() AND
  booking_id IN (SELECT id FROM public.bookings WHERE client_id = auth.uid())
);
CREATE POLICY "Performers can respond to their reviews" ON public.reviews FOR UPDATE USING (
  performer_id IN (SELECT id FROM public.performers WHERE user_id = auth.uid())
);

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Audit logs policies (admin only)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default admin user (will be created after auth user is created)
-- This should be run after the first admin signs up through the auth system-- Services System Migration
-- Adds comprehensive services and categories for Flavor Entertainers Platform

-- Create service categories enum
CREATE TYPE service_category AS ENUM (
  'waitressing',
  'lap_dance',
  'strip_show'
);

-- Create rate type enum
CREATE TYPE rate_type AS ENUM (
  'per_hour',
  'flat_rate',
  'per_person'
);

-- Create services table
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category service_category NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_rate DECIMAL(10,2) NOT NULL,
  rate_type rate_type NOT NULL DEFAULT 'flat_rate',
  min_duration_minutes INTEGER,
  booking_notes TEXT,
  is_private_only BOOLEAN DEFAULT false,
  age_restricted BOOLEAN DEFAULT false,
  requires_special_license BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performer_services junction table
CREATE TABLE public.performer_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performer_id UUID NOT NULL REFERENCES public.performers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  custom_rate DECIMAL(10,2), -- Performer can override base rate
  is_available BOOLEAN DEFAULT true,
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(performer_id, service_id)
);

-- Insert service categories and services
INSERT INTO public.services (category, name, description, base_rate, rate_type, min_duration_minutes, booking_notes, is_private_only, age_restricted) VALUES

-- Waitressing Services
('waitressing', 'Clothed (Public Bar)', 'Fully clothed. Suitable for licensed venues.', 35.00, 'per_hour', 60, 'Public bar service', false, false),
('waitressing', 'Skimpy (Public Bar)', 'Bikini or skimpy outfit service in public venues.', 50.00, 'per_hour', 60, 'Public bar service', false, true),
('waitressing', 'Clothed (Private)', 'Fully clothed service for private events.', 90.00, 'per_hour', 60, 'Private events only', true, false),
('waitressing', 'Skimpy / Lingerie (Private)', 'Sexy skimpy or lingerie outfit, engaging service.', 110.00, 'per_hour', 60, 'Private events only', true, true),
('waitressing', 'Topless (Private)', 'Topless waitress for cheeky and bold events.', 160.00, 'per_hour', 60, 'Private events only', true, true),
('waitressing', 'Nude (Private)', 'Fully nude waitress, boldest adult entertainment.', 260.00, 'per_hour', 60, 'Private events only', true, true),

-- Lap Dance Services
('lap_dance', 'Private Lap Dance', '1 song, 1-on-1 dance in private space.', 100.00, 'flat_rate', 3, 'Minimum rate', true, true),
('lap_dance', 'Public Lap Dance', 'Lap dance in front of others, charged per person.', 100.00, 'per_person', 3, 'Becomes strip show; e.g., 3 viewers = $300', false, true),

-- Strip Show Services
('strip_show', 'Hot Classic Strip (HCS)', 'Classic strip show, full of tease and heat.', 400.00, 'flat_rate', 15, 'Minimum charge', true, true),
('strip_show', 'Deluxe Hot Classic Strip (DHCS)', 'Enhanced classic strip with deluxe elements.', 450.00, 'flat_rate', 20, 'Minimum charge', true, true),
('strip_show', 'Toy Show (TOY)', 'Nude strip show including toy play.', 500.00, 'flat_rate', 20, 'Explicit content', true, true),
('strip_show', 'PVC Show (PVC)', 'Pearls Vibrator and cream show', 550.00, 'flat_rate', 30, 'Optional themed outfits', true, true),
('strip_show', 'XXX Show', 'This wild show includes explicit toy play, seductive body interaction, and a full fantasy experience designed to leave your audience breathless.', 850.00, 'flat_rate', 40, 'Premium adult entertainment', true, true),
('strip_show', 'Greek Show', 'Our most exclusive and provocative act — a deluxe full nude strip that includes "Greek" anal toy play. This show delivers intense, adult-only fantasy fulfillment with high-impact visuals and unforgettable performance energy.', 900.00, 'flat_rate', 40, 'Optional themed outfits', true, true),
('strip_show', 'Duo Show (DUO)', 'Two entertainers in explicit fantasy performance.', 0.00, 'flat_rate', 40, 'Enquire for pricing - Premium duo act', true, true);

-- Update display order for logical grouping
UPDATE public.services SET display_order =
  CASE name
    -- Waitressing (1-10)
    WHEN 'Clothed (Public Bar)' THEN 1
    WHEN 'Skimpy (Public Bar)' THEN 2
    WHEN 'Clothed (Private)' THEN 3
    WHEN 'Skimpy / Lingerie (Private)' THEN 4
    WHEN 'Topless (Private)' THEN 5
    WHEN 'Nude (Private)' THEN 6
    -- Lap Dance (11-20)
    WHEN 'Private Lap Dance' THEN 11
    WHEN 'Public Lap Dance' THEN 12
    -- Strip Shows (21-30)
    WHEN 'Hot Classic Strip (HCS)' THEN 21
    WHEN 'Deluxe Hot Classic Strip (DHCS)' THEN 22
    WHEN 'Toy Show (TOY)' THEN 23
    WHEN 'PVC Show (PVC)' THEN 24
    WHEN 'XXX Show' THEN 25
    WHEN 'Greek Show' THEN 26
    WHEN 'Duo Show (DUO)' THEN 27
    ELSE 99
  END;

-- Add indexes for performance
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_services_display_order ON public.services(display_order);
CREATE INDEX idx_performer_services_performer ON public.performer_services(performer_id);
CREATE INDEX idx_performer_services_service ON public.performer_services(service_id);
CREATE INDEX idx_performer_services_available ON public.performer_services(is_available);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performer_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services (public read)
CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for performer_services
CREATE POLICY "Performer services viewable by everyone" ON public.performer_services
  FOR SELECT USING (is_available = true);

CREATE POLICY "Performers can manage their own services" ON public.performer_services
  FOR ALL USING (
    performer_id IN (
      SELECT id FROM public.performers
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all performer services" ON public.performer_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to get services by category
CREATE OR REPLACE FUNCTION get_services_by_category(category_filter service_category DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  category service_category,
  name VARCHAR(100),
  description TEXT,
  base_rate DECIMAL(10,2),
  rate_type rate_type,
  min_duration_minutes INTEGER,
  booking_notes TEXT,
  is_private_only BOOLEAN,
  age_restricted BOOLEAN,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.category,
    s.name,
    s.description,
    s.base_rate,
    s.rate_type,
    s.min_duration_minutes,
    s.booking_notes,
    s.is_private_only,
    s.age_restricted,
    s.display_order
  FROM public.services s
  WHERE s.is_active = true
    AND (category_filter IS NULL OR s.category = category_filter)
  ORDER BY s.display_order, s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get performer's available services
CREATE OR REPLACE FUNCTION get_performer_services(performer_uuid UUID)
RETURNS TABLE (
  service_id UUID,
  service_name VARCHAR(100),
  category service_category,
  description TEXT,
  rate DECIMAL(10,2),
  rate_type rate_type,
  min_duration_minutes INTEGER,
  booking_notes TEXT,
  is_private_only BOOLEAN,
  age_restricted BOOLEAN,
  special_notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as service_id,
    s.name as service_name,
    s.category,
    s.description,
    COALESCE(ps.custom_rate, s.base_rate) as rate,
    s.rate_type,
    s.min_duration_minutes,
    s.booking_notes,
    s.is_private_only,
    s.age_restricted,
    ps.special_notes
  FROM public.services s
  INNER JOIN public.performer_services ps ON s.id = ps.service_id
  WHERE ps.performer_id = performer_uuid
    AND ps.is_available = true
    AND s.is_active = true
  ORDER BY s.display_order, s.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at triggers
CREATE TRIGGER set_timestamp_services
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_performer_services
  BEFORE UPDATE ON public.performer_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for service statistics
CREATE VIEW service_stats AS
SELECT
  s.category,
  s.name,
  COUNT(ps.performer_id) as performer_count,
  AVG(COALESCE(ps.custom_rate, s.base_rate)) as avg_rate,
  MIN(COALESCE(ps.custom_rate, s.base_rate)) as min_rate,
  MAX(COALESCE(ps.custom_rate, s.base_rate)) as max_rate
FROM public.services s
LEFT JOIN public.performer_services ps ON s.id = ps.service_id AND ps.is_available = true
WHERE s.is_active = true
GROUP BY s.id, s.category, s.name, s.display_order
ORDER BY s.display_order;

-- Grant permissions
GRANT SELECT ON service_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_services_by_category TO authenticated;
GRANT EXECUTE ON FUNCTION get_performer_services TO authenticated;-- Do Not Serve System Migration
-- Adds safety and protection features for performers

-- Create report type enum
CREATE TYPE report_type AS ENUM (
  'inappropriate_behavior',
  'non_payment',
  'safety_concern',
  'harassment',
  'boundary_violation',
  'intoxication',
  'other'
);

-- Create report status enum
CREATE TYPE report_status AS ENUM (
  'pending',
  'under_review',
  'verified',
  'dismissed',
  'resolved'
);

-- Create Do Not Serve registry table
CREATE TABLE public.do_not_serve_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  client_name TEXT,
  client_phone TEXT,
  reported_by UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  report_type report_type NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE,
  description TEXT NOT NULL,
  evidence_urls JSONB DEFAULT '[]',
  severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 5) DEFAULT 3,
  status report_status DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create incident reports table (for tracking specific incidents)
CREATE TABLE public.incident_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dns_entry_id UUID REFERENCES public.do_not_serve_registry(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  incident_type report_type NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location_details TEXT,
  witness_information TEXT,
  description TEXT NOT NULL,
  evidence_files JSONB DEFAULT '[]',
  police_report_filed BOOLEAN DEFAULT false,
  police_report_number TEXT,
  medical_attention_required BOOLEAN DEFAULT false,
  immediate_action_taken TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  status report_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create safety alerts table
CREATE TABLE public.safety_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 5) DEFAULT 2,
  target_audience TEXT[] DEFAULT ARRAY['performers'], -- performers, clients, admins
  location_specific TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performer safety preferences table
CREATE TABLE public.performer_safety_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE NOT NULL,
  enable_dns_notifications BOOLEAN DEFAULT true,
  enable_safety_alerts BOOLEAN DEFAULT true,
  enable_location_sharing BOOLEAN DEFAULT false,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  safety_check_interval INTEGER DEFAULT 60, -- minutes
  auto_check_in_required BOOLEAN DEFAULT false,
  blocked_areas JSONB DEFAULT '[]',
  preferred_venues JSONB DEFAULT '[]',
  safety_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(performer_id)
);

-- Create performer check-ins table (for safety tracking)
CREATE TABLE public.performer_check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  performer_id UUID REFERENCES public.performers(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  check_in_type TEXT NOT NULL, -- arrival, departure, safety_check, emergency
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  notes TEXT,
  is_safe BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_dns_registry_client_email ON public.do_not_serve_registry(client_email);
CREATE INDEX idx_dns_registry_status ON public.do_not_serve_registry(status);
CREATE INDEX idx_dns_registry_active ON public.do_not_serve_registry(is_active);
CREATE INDEX idx_dns_registry_severity ON public.do_not_serve_registry(severity_level);
CREATE INDEX idx_incident_reports_status ON public.incident_reports(status);
CREATE INDEX idx_incident_reports_type ON public.incident_reports(incident_type);
CREATE INDEX idx_safety_alerts_active ON public.safety_alerts(is_active);
CREATE INDEX idx_safety_alerts_audience ON public.safety_alerts USING GIN(target_audience);
CREATE INDEX idx_performer_checkins_performer ON public.performer_check_ins(performer_id);
CREATE INDEX idx_performer_checkins_booking ON public.performer_check_ins(booking_id);

-- Enable RLS
ALTER TABLE public.do_not_serve_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performer_safety_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performer_check_ins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Do Not Serve registry
CREATE POLICY "Performers can view DNS entries" ON public.do_not_serve_registry
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.performers p ON u.id = p.user_id
      WHERE u.id = auth.uid() AND u.role = 'performer'
    )
  );

CREATE POLICY "Performers can create DNS entries" ON public.do_not_serve_registry
  FOR INSERT WITH CHECK (
    reported_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.performers p ON u.id = p.user_id
      WHERE u.id = auth.uid() AND u.role = 'performer'
    )
  );

CREATE POLICY "Admins can manage all DNS entries" ON public.do_not_serve_registry
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for incident reports
CREATE POLICY "Users can view their own incident reports" ON public.incident_reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Performers can create incident reports" ON public.incident_reports
  FOR INSERT WITH CHECK (
    reporter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.performers p ON u.id = p.user_id
      WHERE u.id = auth.uid() AND u.role = 'performer'
    )
  );

CREATE POLICY "Admins can manage all incident reports" ON public.incident_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for safety alerts
CREATE POLICY "All users can view active safety alerts" ON public.safety_alerts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage safety alerts" ON public.safety_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for performer safety preferences
CREATE POLICY "Performers can manage their own safety preferences" ON public.performer_safety_preferences
  FOR ALL USING (
    performer_id IN (
      SELECT id FROM public.performers
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for performer check-ins
CREATE POLICY "Performers can manage their own check-ins" ON public.performer_check_ins
  FOR ALL USING (
    performer_id IN (
      SELECT id FROM public.performers
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all check-ins" ON public.performer_check_ins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at triggers
CREATE TRIGGER set_timestamp_dns_registry
  BEFORE UPDATE ON public.do_not_serve_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_incident_reports
  BEFORE UPDATE ON public.incident_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_safety_alerts
  BEFORE UPDATE ON public.safety_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_performer_safety_preferences
  BEFORE UPDATE ON public.performer_safety_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if client is on DNS registry
CREATE OR REPLACE FUNCTION check_dns_status(client_email_input TEXT)
RETURNS TABLE (
  is_listed BOOLEAN,
  entry_count INTEGER,
  highest_severity INTEGER,
  latest_incident TIMESTAMP WITH TIME ZONE,
  active_reports INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE WHEN COUNT(*) > 0 THEN true ELSE false END as is_listed,
    COUNT(*)::INTEGER as entry_count,
    COALESCE(MAX(severity_level), 0)::INTEGER as highest_severity,
    MAX(incident_date) as latest_incident,
    COUNT(CASE WHEN status IN ('pending', 'under_review', 'verified') THEN 1 END)::INTEGER as active_reports
  FROM public.do_not_serve_registry
  WHERE client_email = client_email_input
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get safety statistics
CREATE OR REPLACE FUNCTION get_safety_statistics()
RETURNS TABLE (
  total_dns_entries INTEGER,
  active_dns_entries INTEGER,
  pending_reports INTEGER,
  this_month_incidents INTEGER,
  high_severity_cases INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.do_not_serve_registry) as total_dns_entries,
    (SELECT COUNT(*)::INTEGER FROM public.do_not_serve_registry WHERE is_active = true) as active_dns_entries,
    (SELECT COUNT(*)::INTEGER FROM public.incident_reports WHERE status = 'pending') as pending_reports,
    (SELECT COUNT(*)::INTEGER FROM public.incident_reports
     WHERE created_at >= DATE_TRUNC('month', NOW())) as this_month_incidents,
    (SELECT COUNT(*)::INTEGER FROM public.do_not_serve_registry
     WHERE severity_level >= 4 AND is_active = true) as high_severity_cases;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON public.do_not_serve_registry TO authenticated;
GRANT SELECT ON public.incident_reports TO authenticated;
GRANT SELECT ON public.safety_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION check_dns_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_safety_statistics TO authenticated;-- Twilio and PayID Integration Migration
-- Adds communication and payment features

-- Create communication type enum
CREATE TYPE communication_type AS ENUM (
  'sms',
  'whatsapp',
  'email',
  'push_notification'
);

-- Create message status enum
CREATE TYPE message_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'failed',
  'read'
);

-- Create payment status enum (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM (
      'pending',
      'processing',
      'completed',
      'failed',
      'refunded',
      'cancelled'
    );
  END IF;
END$$;

-- Create payment method enum (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM (
      'payid',
      'bank_transfer',
      'credit_card',
      'digital_wallet',
      'cash'
    );
  END IF;
END$$;

-- Create message logs table
CREATE TABLE public.message_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  message_type communication_type NOT NULL,
  recipient_phone TEXT,
  recipient_email TEXT,
  subject TEXT,
  message_content TEXT NOT NULL,
  template_id TEXT,
  template_variables JSONB DEFAULT '{}',
  twilio_sid TEXT,
  twilio_status TEXT,
  status message_status DEFAULT 'pending',
  error_message TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment transactions table
CREATE TABLE public.payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  payer_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  payment_method payment_method NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'AUD',
  payid_identifier TEXT, -- PayID email or phone
  payid_name TEXT, -- Name associated with PayID
  bank_reference TEXT,
  transaction_reference TEXT,
  external_transaction_id TEXT,
  status payment_status DEFAULT 'pending',
  fee_amount DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2),
  payment_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  failure_reason TEXT,
  refund_reason TEXT,
  refunded_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PayID accounts table
CREATE TABLE public.payid_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  payid_identifier TEXT NOT NULL, -- email or phone number
  payid_type TEXT NOT NULL, -- 'email' or 'mobile'
  account_name TEXT NOT NULL,
  bank_name TEXT,
  bsb TEXT,
  account_number TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, payid_identifier)
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  booking_confirmations BOOLEAN DEFAULT true,
  booking_reminders BOOLEAN DEFAULT true,
  payment_notifications BOOLEAN DEFAULT true,
  safety_alerts BOOLEAN DEFAULT true,
  marketing_communications BOOLEAN DEFAULT false,
  sms_phone_number TEXT,
  whatsapp_phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create automated message templates table
CREATE TABLE public.message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_key TEXT NOT NULL UNIQUE,
  message_type communication_type NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- Array of variable names
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook logs table for external integrations
CREATE TABLE public.webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_type TEXT NOT NULL, -- 'twilio', 'payid', 'stripe', etc.
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  headers JSONB,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_message_logs_recipient ON public.message_logs(recipient_id);
CREATE INDEX idx_message_logs_booking ON public.message_logs(booking_id);
CREATE INDEX idx_message_logs_status ON public.message_logs(status);
CREATE INDEX idx_message_logs_type ON public.message_logs(message_type);
CREATE INDEX idx_message_logs_created ON public.message_logs(created_at);

CREATE INDEX idx_payment_transactions_booking ON public.payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_payer ON public.payment_transactions(payer_id);
CREATE INDEX idx_payment_transactions_recipient ON public.payment_transactions(recipient_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_method ON public.payment_transactions(payment_method);
CREATE INDEX idx_payment_transactions_date ON public.payment_transactions(payment_date);

CREATE INDEX idx_payid_accounts_user ON public.payid_accounts(user_id);
CREATE INDEX idx_payid_accounts_identifier ON public.payid_accounts(payid_identifier);
CREATE INDEX idx_payid_accounts_active ON public.payid_accounts(is_active);

CREATE INDEX idx_webhook_logs_type ON public.webhook_logs(webhook_type);
CREATE INDEX idx_webhook_logs_created ON public.webhook_logs(created_at);

-- Enable RLS
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payid_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message logs
CREATE POLICY "Users can view their own messages" ON public.message_logs
  FOR SELECT USING (
    recipient_id = auth.uid() OR
    sender_id = auth.uid()
  );

CREATE POLICY "Users can create messages" ON public.message_logs
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Admins can manage all messages" ON public.message_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for payment transactions
CREATE POLICY "Users can view their own transactions" ON public.payment_transactions
  FOR SELECT USING (
    payer_id = auth.uid() OR
    recipient_id = auth.uid()
  );

CREATE POLICY "Users can create payment transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (payer_id = auth.uid());

CREATE POLICY "Users can update their own transactions" ON public.payment_transactions
  FOR UPDATE USING (
    payer_id = auth.uid() OR
    recipient_id = auth.uid()
  );

CREATE POLICY "Admins can manage all transactions" ON public.payment_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for PayID accounts
CREATE POLICY "Users can manage their own PayID accounts" ON public.payid_accounts
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for notification preferences
CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for message templates
CREATE POLICY "All users can view active templates" ON public.message_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON public.message_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for webhook logs (admin only)
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at triggers
CREATE TRIGGER set_timestamp_message_logs
  BEFORE UPDATE ON public.message_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_payment_transactions
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_payid_accounts
  BEFORE UPDATE ON public.payid_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_notification_preferences
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_message_templates
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default message templates
INSERT INTO public.message_templates (name, template_key, message_type, subject, content, variables) VALUES
('Booking Confirmation SMS', 'booking_confirmation_sms', 'sms', NULL,
 'Hi {{client_name}}! Your booking with {{performer_name}} on {{event_date}} at {{event_time}} has been confirmed. Venue: {{venue_name}}. Total: ${{total_amount}}. Questions? Reply HELP.',
 '["client_name", "performer_name", "event_date", "event_time", "venue_name", "total_amount"]'),

('Booking Reminder SMS', 'booking_reminder_sms', 'sms', NULL,
 'Reminder: Your booking with {{performer_name}} is tomorrow ({{event_date}}) at {{event_time}}. Venue: {{venue_name}}. Payment due: ${{amount_due}}. PayID: {{payid_identifier}}',
 '["performer_name", "event_date", "event_time", "venue_name", "amount_due", "payid_identifier"]'),

('Payment Request WhatsApp', 'payment_request_whatsapp', 'whatsapp', NULL,
 'Hi {{client_name}}! 💫 Payment request for your booking with {{performer_name}} on {{event_date}}.\n\nAmount: ${{amount}}\nPayID: {{payid_identifier}}\nReference: {{reference}}\n\nPay now to confirm your booking! 🎉',
 '["client_name", "performer_name", "event_date", "amount", "payid_identifier", "reference"]'),

('Payment Received SMS', 'payment_received_sms', 'sms', NULL,
 'Payment received! 🎉 Your booking with {{performer_name}} is now confirmed. Date: {{event_date}} at {{event_time}}. See you there!',
 '["performer_name", "event_date", "event_time"]'),

('Safety Check-in WhatsApp', 'safety_checkin_whatsapp', 'whatsapp', NULL,
 '🛡️ SAFETY CHECK-IN\n\n{{performer_name}} has safely arrived at their booking location.\nTime: {{checkin_time}}\nLocation: {{location}}\n\nThis is an automated safety notification.',
 '["performer_name", "checkin_time", "location"]'),

('Emergency Alert SMS', 'emergency_alert_sms', 'sms', NULL,
 '🚨 EMERGENCY ALERT: {{performer_name}} has triggered an emergency check-in. Last known location: {{location}} at {{timestamp}}. Contact immediately: {{performer_phone}}',
 '["performer_name", "location", "timestamp", "performer_phone"]');

-- Create function to send automated messages
CREATE OR REPLACE FUNCTION send_automated_message(
  template_key_input TEXT,
  recipient_user_id UUID,
  sender_user_id UUID DEFAULT NULL,
  booking_id_input UUID DEFAULT NULL,
  template_vars JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  template_record RECORD;
  message_content_final TEXT;
  recipient_record RECORD;
  message_id UUID;
  var_key TEXT;
  var_value TEXT;
BEGIN
  -- Get template
  SELECT * INTO template_record
  FROM public.message_templates
  WHERE template_key = template_key_input AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found: %', template_key_input;
  END IF;

  -- Get recipient details
  SELECT u.*, np.sms_phone_number, np.whatsapp_phone_number, np.email_notifications, np.sms_notifications, np.whatsapp_notifications
  INTO recipient_record
  FROM public.users u
  LEFT JOIN public.notification_preferences np ON u.id = np.user_id
  WHERE u.id = recipient_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipient not found: %', recipient_user_id;
  END IF;

  -- Check if user has enabled this notification type
  IF template_record.message_type = 'sms' AND recipient_record.sms_notifications = false THEN
    RETURN NULL; -- User has disabled SMS notifications
  END IF;

  IF template_record.message_type = 'whatsapp' AND recipient_record.whatsapp_notifications = false THEN
    RETURN NULL; -- User has disabled WhatsApp notifications
  END IF;

  -- Replace template variables
  message_content_final := template_record.content;
  FOR var_key, var_value IN SELECT * FROM jsonb_each_text(template_vars)
  LOOP
    message_content_final := REPLACE(message_content_final, '{{' || var_key || '}}', var_value);
  END LOOP;

  -- Insert message log
  INSERT INTO public.message_logs (
    recipient_id,
    sender_id,
    booking_id,
    message_type,
    recipient_phone,
    recipient_email,
    subject,
    message_content,
    template_id,
    template_variables,
    status
  ) VALUES (
    recipient_user_id,
    sender_user_id,
    booking_id_input,
    template_record.message_type,
    CASE
      WHEN template_record.message_type = 'sms' THEN recipient_record.sms_phone_number
      WHEN template_record.message_type = 'whatsapp' THEN recipient_record.whatsapp_phone_number
      ELSE NULL
    END,
    recipient_record.email,
    template_record.subject,
    message_content_final,
    template_record.id::TEXT,
    template_vars,
    'pending'
  ) RETURNING id INTO message_id;

  RETURN message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process PayID payment
CREATE OR REPLACE FUNCTION create_payid_payment(
  booking_id_input UUID,
  payer_id_input UUID,
  recipient_id_input UUID,
  amount_input DECIMAL(10, 2),
  payid_identifier_input TEXT,
  description_input TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
  fee_amount_calc DECIMAL(10, 2);
  net_amount_calc DECIMAL(10, 2);
  payid_record RECORD;
BEGIN
  -- Validate PayID account
  SELECT * INTO payid_record
  FROM public.payid_accounts
  WHERE user_id = recipient_id_input
    AND payid_identifier = payid_identifier_input
    AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid PayID account: %', payid_identifier_input;
  END IF;

  -- Calculate fees (2.5% for PayID transactions)
  fee_amount_calc := ROUND(amount_input * 0.025, 2);
  net_amount_calc := amount_input - fee_amount_calc;

  -- Create payment transaction
  INSERT INTO public.payment_transactions (
    booking_id,
    payer_id,
    recipient_id,
    payment_method,
    amount,
    currency,
    payid_identifier,
    payid_name,
    fee_amount,
    net_amount,
    description,
    status,
    due_date
  ) VALUES (
    booking_id_input,
    payer_id_input,
    recipient_id_input,
    'payid',
    amount_input,
    'AUD',
    payid_identifier_input,
    payid_record.account_name,
    fee_amount_calc,
    net_amount_calc,
    description_input,
    'pending',
    NOW() + INTERVAL '24 hours'
  ) RETURNING id INTO transaction_id;

  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.message_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payment_transactions TO authenticated;
GRANT ALL ON public.payid_accounts TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;
GRANT SELECT ON public.message_templates TO authenticated;
GRANT EXECUTE ON FUNCTION send_automated_message TO authenticated;
GRANT EXECUTE ON FUNCTION create_payid_payment TO authenticated;-- Comprehensive Platform Update Migration
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
GRANT EXECUTE ON FUNCTION generate_performer_slug TO authenticated;-- PayID Accounts Table
CREATE TABLE IF NOT EXISTS payid_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    payid_identifier VARCHAR(255) NOT NULL UNIQUE,
    payid_type VARCHAR(20) NOT NULL CHECK (payid_type IN ('email', 'phone', 'abn')),
    account_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    bsb VARCHAR(6),
    account_number VARCHAR(20),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    last_used TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ
);

-- PayID Transactions Table
CREATE TABLE IF NOT EXISTS payid_transactions (
    id VARCHAR(255) PRIMARY KEY,
    sender_payid_id UUID REFERENCES payid_accounts(id) ON DELETE SET NULL,
    recipient_payid_id UUID REFERENCES payid_accounts(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'AUD',
    description TEXT NOT NULL,
    reference VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    transaction_type VARCHAR(20) NOT NULL DEFAULT 'payment'
        CHECK (transaction_type IN ('payment', 'refund', 'chargeback')),
    external_transaction_id VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- PayID Events Log Table (for audit trail)
CREATE TABLE IF NOT EXISTS payid_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payid_account_id UUID REFERENCES payid_accounts(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) REFERENCES payid_transactions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET
);

-- Indexes for performance
CREATE INDEX idx_payid_accounts_user_id ON payid_accounts(user_id);
CREATE INDEX idx_payid_accounts_identifier ON payid_accounts(payid_identifier);
CREATE INDEX idx_payid_accounts_verification_status ON payid_accounts(verification_status);
CREATE INDEX idx_payid_accounts_active ON payid_accounts(is_active, is_verified);

CREATE INDEX idx_payid_transactions_sender ON payid_transactions(sender_payid_id);
CREATE INDEX idx_payid_transactions_recipient ON payid_transactions(recipient_payid_id);
CREATE INDEX idx_payid_transactions_booking ON payid_transactions(booking_id);
CREATE INDEX idx_payid_transactions_status ON payid_transactions(status);
CREATE INDEX idx_payid_transactions_created_at ON payid_transactions(created_at DESC);

CREATE INDEX idx_payid_events_account ON payid_events(payid_account_id);
CREATE INDEX idx_payid_events_transaction ON payid_events(transaction_id);
CREATE INDEX idx_payid_events_type ON payid_events(event_type);
CREATE INDEX idx_payid_events_created_at ON payid_events(created_at DESC);

-- Row Level Security (RLS) Policies

-- PayID Accounts RLS
ALTER TABLE payid_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own PayID accounts" ON payid_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PayID accounts" ON payid_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PayID accounts" ON payid_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PayID accounts" ON payid_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- PayID Transactions RLS
ALTER TABLE payid_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own PayID transactions" ON payid_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM payid_accounts
            WHERE (id = sender_payid_id OR id = recipient_payid_id)
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create PayID transactions" ON payid_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM payid_accounts
            WHERE id = sender_payid_id
            AND user_id = auth.uid()
        )
    );

-- PayID Events RLS
ALTER TABLE payid_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own PayID events" ON payid_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM payid_accounts
            WHERE id = payid_account_id
            AND user_id = auth.uid()
        )
    );

-- Functions for automatic timestamping
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamping
CREATE TRIGGER update_payid_accounts_updated_at
    BEFORE UPDATE ON payid_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payid_transactions_updated_at
    BEFORE UPDATE ON payid_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one primary PayID account per user
CREATE OR REPLACE FUNCTION ensure_single_primary_payid()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        -- Unset primary flag for all other accounts of this user
        UPDATE payid_accounts
        SET is_primary = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_primary_payid_trigger
    BEFORE INSERT OR UPDATE ON payid_accounts
    FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_payid();

-- Add PayID payment method to existing booking tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings'
        AND column_name = 'payment_transaction_id'
    ) THEN
        ALTER TABLE bookings ADD COLUMN payment_transaction_id VARCHAR(255);
        CREATE INDEX idx_bookings_payment_transaction ON bookings(payment_transaction_id);
    END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON payid_accounts TO authenticated;
GRANT ALL ON payid_transactions TO authenticated;
GRANT ALL ON payid_events TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;-- Consolidated schema created from all migrations

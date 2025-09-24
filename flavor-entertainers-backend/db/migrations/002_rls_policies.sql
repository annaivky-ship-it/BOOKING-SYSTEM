-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vetting_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_processed ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is performer
CREATE OR REPLACE FUNCTION is_performer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'performer'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is client
CREATE OR REPLACE FUNCTION is_client()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'client'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Users can view their own profile, admins can view all
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR is_admin()
    );

-- Users can update their own profile, admins can update all
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR is_admin()
    );

-- Only service role can insert profiles (handled by auth triggers)
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (false);

-- PERFORMERS POLICIES
-- Public can view limited performer info, full access for owner and admin
CREATE POLICY "performers_select_policy" ON public.performers
    FOR SELECT USING (
        true -- Public read for limited fields will be handled by API layer
    );

-- Only performer owner and admin can update
CREATE POLICY "performers_update_policy" ON public.performers
    FOR UPDATE USING (
        auth.uid() = id OR is_admin()
    );

-- Only service role can insert performers
CREATE POLICY "performers_insert_policy" ON public.performers
    FOR INSERT WITH CHECK (false);

-- CLIENTS POLICIES
-- Client can view own profile, admin can view all
CREATE POLICY "clients_select_policy" ON public.clients
    FOR SELECT USING (
        auth.uid() = id OR is_admin()
    );

-- Client can update own profile, admin can update all
CREATE POLICY "clients_update_policy" ON public.clients
    FOR UPDATE USING (
        auth.uid() = id OR is_admin()
    );

-- Only service role can insert clients
CREATE POLICY "clients_insert_policy" ON public.clients
    FOR INSERT WITH CHECK (false);

-- AVAILABILITY POLICIES
-- Public can read availability for search, performer can manage own
CREATE POLICY "availability_select_policy" ON public.availability
    FOR SELECT USING (true);

-- Only performer can insert/update/delete their own availability
CREATE POLICY "availability_insert_policy" ON public.availability
    FOR INSERT WITH CHECK (
        auth.uid() = performer_id AND is_performer()
    );

CREATE POLICY "availability_update_policy" ON public.availability
    FOR UPDATE USING (
        auth.uid() = performer_id AND is_performer()
    );

CREATE POLICY "availability_delete_policy" ON public.availability
    FOR DELETE USING (
        auth.uid() = performer_id AND is_performer()
    );

-- BOOKINGS POLICIES
-- Client can view their bookings, performer can view assigned bookings, admin can view all
CREATE POLICY "bookings_select_policy" ON public.bookings
    FOR SELECT USING (
        auth.uid() = client_id OR
        auth.uid() = performer_id OR
        is_admin()
    );

-- Only service role can insert bookings (API handles business logic)
CREATE POLICY "bookings_insert_policy" ON public.bookings
    FOR INSERT WITH CHECK (false);

-- Only admin and service role can update bookings
CREATE POLICY "bookings_update_policy" ON public.bookings
    FOR UPDATE USING (is_admin());

-- Only admin can delete bookings
CREATE POLICY "bookings_delete_policy" ON public.bookings
    FOR DELETE USING (is_admin());

-- PAYMENTS POLICIES
-- View payments through booking relationship, admin sees all
CREATE POLICY "payments_select_policy" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_id AND (
                auth.uid() = b.client_id OR
                auth.uid() = b.performer_id OR
                is_admin()
            )
        )
    );

-- Only service role can modify payments
CREATE POLICY "payments_insert_policy" ON public.payments
    FOR INSERT WITH CHECK (false);

CREATE POLICY "payments_update_policy" ON public.payments
    FOR UPDATE USING (is_admin());

-- VETTING APPLICATIONS POLICIES
-- Admin can view all, client can view own applications
CREATE POLICY "vetting_select_policy" ON public.vetting_applications
    FOR SELECT USING (
        is_admin() OR
        (client_id IS NOT NULL AND auth.uid() = client_id)
    );

-- Public can insert vetting applications (anonymous submissions allowed)
CREATE POLICY "vetting_insert_policy" ON public.vetting_applications
    FOR INSERT WITH CHECK (true);

-- Only admin can update vetting applications
CREATE POLICY "vetting_update_policy" ON public.vetting_applications
    FOR UPDATE USING (is_admin());

-- BLACKLIST POLICIES
-- Only admin can access blacklist
CREATE POLICY "blacklist_admin_only" ON public.blacklist
    FOR ALL USING (is_admin());

-- APPROVED CLIENTS POLICIES
-- Admin can manage, client can view own approval status
CREATE POLICY "approved_clients_select_policy" ON public.approved_clients
    FOR SELECT USING (
        is_admin() OR auth.uid() = client_id
    );

CREATE POLICY "approved_clients_modify_policy" ON public.approved_clients
    FOR ALL USING (is_admin());

-- AUDIT LOG POLICIES
-- Only admin can access audit logs
CREATE POLICY "audit_log_admin_only" ON public.audit_log
    FOR ALL USING (is_admin());

-- EVENTS PROCESSED POLICIES
-- Only service role can access
CREATE POLICY "events_processed_service_only" ON public.events_processed
    FOR ALL USING (false);

-- Function to handle profile creation after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
        NEW.raw_user_meta_data->>'display_name'
    );

    -- Create role-specific record
    IF NEW.raw_user_meta_data->>'role' = 'performer' THEN
        INSERT INTO public.performers (id, stage_name, region, services, rate_card)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'stage_name', 'New Performer'),
            COALESCE(NEW.raw_user_meta_data->>'region', 'Perth Metro'),
            ARRAY[]::TEXT[],
            '{}'::JSONB
        );
    ELSIF NEW.raw_user_meta_data->>'role' = 'client' OR NEW.raw_user_meta_data->>'role' IS NULL THEN
        INSERT INTO public.clients (id, first_name, last_name)
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'first_name',
            NEW.raw_user_meta_data->>'last_name'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check blacklist before booking
CREATE OR REPLACE FUNCTION check_blacklist(
    p_email CITEXT,
    p_phone TEXT DEFAULT NULL,
    p_full_name TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.blacklist
        WHERE status = 'active' AND (
            (email IS NOT NULL AND email = p_email) OR
            (phone IS NOT NULL AND phone = p_phone) OR
            (full_name IS NOT NULL AND full_name = p_full_name)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if client is pre-approved
CREATE OR REPLACE FUNCTION is_client_approved(p_client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.approved_clients
        WHERE client_id = p_client_id
        AND (expiry_date IS NULL OR expiry_date > CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vetting_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Get current user role
-- =====================================================

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
ON users FOR SELECT
USING (get_current_user_role() = 'admin');

-- Clients can read performer profiles (for booking)
CREATE POLICY "Clients can read performers"
ON users FOR SELECT
USING (role = 'performer' AND is_active = true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can insert/update/delete any user
CREATE POLICY "Admins can manage users"
ON users FOR ALL
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- =====================================================
-- VETTING_APPLICATIONS TABLE POLICIES
-- =====================================================

-- Clients can create vetting applications
CREATE POLICY "Clients can create vetting applications"
ON vetting_applications FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  get_current_user_role() = 'client'
);

-- Users can read their own vetting applications
CREATE POLICY "Users can read own vetting"
ON vetting_applications FOR SELECT
USING (auth.uid() = user_id);

-- Admins can read all vetting applications
CREATE POLICY "Admins can read all vetting"
ON vetting_applications FOR SELECT
USING (get_current_user_role() = 'admin');

-- Admins can update vetting applications
CREATE POLICY "Admins can update vetting"
ON vetting_applications FOR UPDATE
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- =====================================================
-- BLACKLIST TABLE POLICIES
-- =====================================================

-- Only admins can access blacklist
CREATE POLICY "Only admins can read blacklist"
ON blacklist FOR SELECT
USING (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can insert blacklist"
ON blacklist FOR INSERT
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can update blacklist"
ON blacklist FOR UPDATE
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "Only admins can delete blacklist"
ON blacklist FOR DELETE
USING (get_current_user_role() = 'admin');

-- =====================================================
-- BOOKINGS TABLE POLICIES
-- =====================================================

-- Clients can create bookings
CREATE POLICY "Clients can create bookings"
ON bookings FOR INSERT
WITH CHECK (
  auth.uid() = client_id AND
  get_current_user_role() = 'client'
);

-- Clients can read their own bookings
CREATE POLICY "Clients can read own bookings"
ON bookings FOR SELECT
USING (
  auth.uid() = client_id AND
  get_current_user_role() = 'client'
);

-- Performers can read bookings assigned to them
CREATE POLICY "Performers can read assigned bookings"
ON bookings FOR SELECT
USING (
  auth.uid() = performer_id AND
  get_current_user_role() = 'performer'
);

-- Performers can update bookings (accept/decline, add ETA)
CREATE POLICY "Performers can update assigned bookings"
ON bookings FOR UPDATE
USING (
  auth.uid() = performer_id AND
  get_current_user_role() = 'performer'
)
WITH CHECK (
  auth.uid() = performer_id AND
  get_current_user_role() = 'performer'
);

-- Admins can read all bookings
CREATE POLICY "Admins can read all bookings"
ON bookings FOR SELECT
USING (get_current_user_role() = 'admin');

-- Admins can update any booking
CREATE POLICY "Admins can update any booking"
ON bookings FOR UPDATE
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Admins can delete bookings
CREATE POLICY "Admins can delete bookings"
ON bookings FOR DELETE
USING (get_current_user_role() = 'admin');

-- =====================================================
-- AUDIT_LOG TABLE POLICIES
-- =====================================================

-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs"
ON audit_log FOR SELECT
USING (auth.uid() = user_id);

-- Admins can read all audit logs
CREATE POLICY "Admins can read all audit logs"
ON audit_log FOR SELECT
USING (get_current_user_role() = 'admin');

-- Everyone can insert audit logs (via service role in API)
-- Note: In production, audit logs should be inserted via service role only
CREATE POLICY "Service can insert audit logs"
ON audit_log FOR INSERT
WITH CHECK (true);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Run these in Supabase Dashboard > Storage > Policies

-- Profiles bucket (avatars)
-- Policy: Users can upload their own avatar
-- INSERT: bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text
-- SELECT: bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text
-- UPDATE: bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text
-- DELETE: bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text

-- IDs bucket (vetting documents)
-- Policy: Clients can upload their ID
-- INSERT: bucket_id = 'ids' AND (storage.foldername(name))[1] = auth.uid()::text
-- SELECT: bucket_id = 'ids' AND ((storage.foldername(name))[1] = auth.uid()::text OR get_current_user_role() = 'admin')

-- Receipts bucket (payment receipts)
-- Policy: Clients can upload receipts for their bookings
-- INSERT: bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text
-- SELECT: bucket_id = 'receipts' AND ((storage.foldername(name))[1] = auth.uid()::text OR get_current_user_role() = 'admin')

-- =====================================================
-- REALTIME
-- =====================================================

-- Enable realtime on bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Note: Configure realtime filters in your Supabase dashboard:
-- - Performers should only receive updates for their bookings
-- - Clients should only receive updates for their bookings
-- - Admins can receive all booking updates

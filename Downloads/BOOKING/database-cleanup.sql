-- ============================================================================
-- FLAVOR ENTERTAINERS - DATABASE CLEANUP SCRIPT
-- ============================================================================
-- WARNING: This will DELETE ALL DATA from your database!
-- Only run this if you want to completely reset the database.
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL TABLES (with CASCADE to handle dependencies)
-- ============================================================================

DROP TABLE IF EXISTS public.booking_audit_log CASCADE;
DROP TABLE IF EXISTS public.communications CASCADE;
DROP TABLE IF EXISTS public.do_not_serve_list CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.performers CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;

-- ============================================================================
-- STEP 2: DROP ALL VIEWS
-- ============================================================================

DROP VIEW IF EXISTS public.bookings_with_performers CASCADE;
DROP VIEW IF EXISTS public.do_not_serve_with_performers CASCADE;

-- ============================================================================
-- STEP 3: DROP ALL FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS is_client_blocked(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_client_vip_status(TEXT) CASCADE;
DROP FUNCTION IF EXISTS trigger_update_vip_status() CASCADE;
DROP FUNCTION IF EXISTS generate_upload_path(TEXT, UUID, TEXT) CASCADE;

-- ============================================================================
-- STEP 4: DROP ALL TRIGGERS
-- ============================================================================

-- Triggers are automatically dropped with CASCADE, but listing for reference:
-- - update_services_updated_at
-- - update_performers_updated_at
-- - update_bookings_updated_at
-- - update_do_not_serve_list_updated_at
-- - update_admins_updated_at
-- - update_clients_updated_at
-- - booking_confirmed_update_vip

-- ============================================================================
-- STEP 5: DROP STORAGE BUCKETS (if they exist)
-- ============================================================================

-- Note: Storage buckets must be deleted via Dashboard or API
-- SQL DELETE won't work due to RLS policies
-- Go to: Storage → Select bucket → Delete

-- Alternatively, if you have service role key:
/*
DELETE FROM storage.buckets WHERE id = 'booking-documents';
DELETE FROM storage.buckets WHERE id = 'deposit-receipts';
DELETE FROM storage.buckets WHERE id = 'performer-photos';
*/

-- ============================================================================
-- STEP 6: VERIFY CLEANUP
-- ============================================================================

-- Check remaining tables
SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should return empty or only system tables

-- ============================================================================
-- CLEANUP COMPLETE
-- ============================================================================

SELECT '✅ Database cleanup complete!' as status,
       'Run supabase-schema-complete.sql to recreate schema' as next_step;

-- ============================================================================
-- OPTIONAL: RECREATE SCHEMA IMMEDIATELY
-- ============================================================================

-- If you want to recreate the schema right after cleanup,
-- uncomment the line below and paste the contents of supabase-schema-complete.sql here
-- Or run it as a separate query

-- \i supabase-schema-complete.sql

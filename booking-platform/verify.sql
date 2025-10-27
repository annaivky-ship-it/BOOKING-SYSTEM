-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'bookings', 'vetting_applications', 'blacklist', 'audit_log')
ORDER BY table_name;

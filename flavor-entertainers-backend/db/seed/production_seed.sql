-- Production seed data for Flavor Entertainers
-- This script creates minimal required data for production deployment

-- Create admin profile (admin user must be created in auth.users manually first)
-- The admin user should be created via Supabase SQL Editor:
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'admin@lustandlace.com.au', crypt('FlavorAdmin2024!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"role": "admin"}'::jsonb);

-- Create admin profile (will be created by trigger after auth user creation)
INSERT INTO public.profiles (id, email, role, display_name, phone, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@lustandlace.com.au',
  'admin',
  'Admin User',
  '+61470253286',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- No demo performers, clients, or bookings for production
-- All data will be created through the application

-- Update table statistics
ANALYZE public.profiles;
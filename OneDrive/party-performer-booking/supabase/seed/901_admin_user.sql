--
-- 901_admin_user.sql  
-- Create admin user annaivky@gmail.com with secure setup
--

-- Create admin user in auth.users
INSERT INTO auth.users (
  id, 
  instance_id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  phone, 
  confirmed_at, 
  app_metadata, 
  user_metadata, 
  created_at, 
  updated_at
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'annaivky@gmail.com',
  crypt('FlavorAdmin2024!', gen_salt('bf')), -- Strong password
  NOW(),
  NULL,
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"role":"admin","display_name":"Anna Ivky"}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = 'annaivky@gmail.com',
  user_metadata = '{"role":"admin","display_name":"Anna Ivky"}'::jsonb,
  updated_at = NOW();

-- Create profile for admin user
INSERT INTO public.profiles (
  id, 
  role, 
  display_name, 
  phone_number
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'admin',
  'Anna Ivky',
  '+61400000000'
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  display_name = 'Anna Ivky',
  updated_at = NOW();

-- Ensure admin has proper role assignment in user_roles table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    INSERT INTO public.user_roles (
      user_id,
      role
    ) VALUES (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
      'admin'
    ) ON CONFLICT (user_id) DO UPDATE SET
      role = 'admin',
      updated_at = NOW();
  END IF;
END $$;

-- Update PayID configuration to use admin email
INSERT INTO public.business_payid_config (
  payid_identifier,
  business_name,
  account_name,
  is_active
) VALUES (
  'annaivky@gmail.com',
  'Flavor Entertainers',
  'Anna Ivky',
  true
) ON CONFLICT (payid_identifier) DO UPDATE SET
  is_active = true,
  updated_at = NOW();

-- Deactivate any other PayID configs
UPDATE public.business_payid_config 
SET is_active = false 
WHERE payid_identifier != 'annaivky@gmail.com';
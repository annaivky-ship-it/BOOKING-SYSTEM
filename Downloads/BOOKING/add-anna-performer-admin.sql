-- =====================================================
-- Add annaivky@gmail.com as Performer AND Admin
-- =====================================================
-- Run this in your Supabase SQL Editor
-- Default password: admin123 (you should change this!)

-- =====================================================
-- 1. Add as PERFORMER
-- =====================================================
INSERT INTO public.performers (
    name,
    tagline,
    photo_url,
    bio,
    service_ids,
    service_areas,
    status,
    email,
    phone,
    password_hash
) VALUES (
    'Anna Ivky',
    'Premium entertainment for unforgettable experiences',
    'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Anna brings elegance and excitement to every event. With years of experience in entertainment and hospitality, she ensures every booking is memorable and professional.',
    ARRAY['waitress-lingerie', 'waitress-topless', 'waitress-nude', 'show-hot-cream', 'show-pearls', 'promotional-hosting'],
    ARRAY['Perth North', 'Perth South', 'Southwest', 'Northwest'],
    'available',
    'annaivky@gmail.com',
    '+61414461008',
    '$2a$10$X5kMqq3LQzQZx7z5VW5bQ.RRQf/SN3VfGPfQv8X3F5J4d1J2C3K4L'
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    photo_url = EXCLUDED.photo_url,
    bio = EXCLUDED.bio,
    service_ids = EXCLUDED.service_ids,
    service_areas = EXCLUDED.service_areas,
    status = EXCLUDED.status,
    phone = EXCLUDED.phone,
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

-- =====================================================
-- 2. Add as ADMIN
-- =====================================================
INSERT INTO public.admins (
    name,
    email,
    password_hash
) VALUES (
    'Anna Ivky',
    'annaivky@gmail.com',
    '$2a$10$X5kMqq3LQzQZx7z5VW5bQ.RRQf/SN3VfGPfQv8X3F5J4d1J2C3K4L'
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

-- =====================================================
-- IMPORTANT SECURITY NOTE
-- =====================================================
-- Default password: admin123
--
-- ⚠️ You MUST change this password immediately after setup!
--
-- To generate a new bcrypt password hash, you can use:
-- - Online tool: https://bcrypt-generator.com/
-- - Node.js: bcrypt.hash('your-password', 10)
--
-- Then update the password with:
-- UPDATE public.admins
-- SET password_hash = 'your-new-hash', updated_at = NOW()
-- WHERE email = 'annaivky@gmail.com';
--
-- UPDATE public.performers
-- SET password_hash = 'your-new-hash', updated_at = NOW()
-- WHERE email = 'annaivky@gmail.com';
-- =====================================================

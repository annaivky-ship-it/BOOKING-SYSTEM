-- =====================================================
-- FLAVOR ENTERTAINERS - SEED DATA
-- =====================================================
-- This file populates the database with initial test data
-- Run this AFTER running supabase-schema-complete.sql
-- =====================================================

-- =====================================================
-- 1. INSERT SERVICES
-- =====================================================
INSERT INTO public.services (id, category, name, description, rate, rate_type, min_duration_hours, duration_minutes, booking_notes) VALUES
-- Waitressing
('waitress-lingerie', 'Waitressing', 'Lingerie Waitress', 'Elegant and flirty. Serves drinks in sexy lingerie.', 110.00, 'per_hour', 1, NULL, 'Private events only'),
('waitress-topless', 'Waitressing', 'Topless Waitress', 'Topless service for fun and cheeky vibes.', 160.00, 'per_hour', 1, NULL, 'Private events only'),
('waitress-nude', 'Waitressing', 'Nude Waitress', 'Bold full nude service. Great for wild private parties.', 260.00, 'per_hour', 1, NULL, 'Private events only'),

-- Strip Shows
('show-hot-cream', 'Strip Show', 'Hot Cream Show', 'Flirty strip ending with whipped cream play.', 380.00, 'flat', NULL, 10, 'Includes cream and strip show'),
('show-pearl', 'Strip Show', 'Pearl Show', 'G-string strip with classic pearl finish.', 500.00, 'flat', NULL, 15, 'Standard solo strip show'),
('show-toy', 'Strip Show', 'Toy Show', 'Full nude strip with toy performance.', 550.00, 'flat', NULL, 15, 'Includes toy play'),
('show-pearls-vibe-cream', 'Strip Show', 'Pearls, Vibe + Cream', 'All-in-one show with cream, pearls, and toy play.', 650.00, 'flat', NULL, 20, 'Multi-prop strip performance'),
('show-works-fruit', 'Strip Show', 'Works + Fruit', 'Full deluxe show with cream, fruit, pearls, and toys.', 650.00, 'flat', NULL, 20, 'Includes fruit play'),
('show-deluxe-works', 'Strip Show', 'Deluxe Works Show', 'Full strip with squirting, toys, and body play.', 700.00, 'flat', NULL, 20, 'Wet show + extras'),
('show-fisting-squirting', 'Strip Show', 'Fisting Squirting', 'Extreme adult show including fisting and squirting.', 750.00, 'flat', NULL, 20, 'Adults-only, explicit content'),
('show-works-greek', 'Strip Show', 'Works + Greek Show', 'Deluxe show plus full "Greek" toy play.', 850.00, 'flat', NULL, 20, 'Adults-only, includes anal toy'),
('show-absolute-works', 'Strip Show', 'The Absolute Works', 'Everything: toys, cream, pearls, squirt, Greek. Ultimate show.', 1000.00, 'flat', NULL, 25, 'Premium full-service show'),

-- Promotional & Hosting Services
('misc-promo-model', 'Promotional & Hosting', 'Promotional Model', 'Professional and engaging model for your product or brand.', 100.00, 'per_hour', 2, NULL, NULL),
('misc-atmospheric', 'Promotional & Hosting', 'Atmospheric Entertainment', 'Adds to the ambiance of your event with grace and style.', 90.00, 'per_hour', 2, NULL, NULL),
('misc-games-host', 'Promotional & Hosting', 'Game Hosting', 'Fun and interactive game hosting for parties.', 120.00, 'per_hour', 1, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. INSERT PERFORMERS
-- =====================================================
INSERT INTO public.performers (id, name, tagline, photo_url, bio, service_ids, service_areas, status) VALUES
(1, 'Scarlett', 'The life of the party, guaranteed.', 'https://images.pexels.com/photos/1485031/pexels-photo-1485031.jpeg?auto=compress&cs=tinysrgb&w=800', 'With over a decade of experience in corporate events and private parties, Scarlett knows exactly how to get the crowd going. Her vibrant personality and professional demeanor make her a favorite for any occasion.',
ARRAY['waitress-topless', 'waitress-nude', 'show-hot-cream', 'misc-atmospheric'],
ARRAY['Perth North', 'Perth South', 'Southwest'],
'available'),

(2, 'Jasmine', 'Elegance and charm for your special event.', 'https://images.pexels.com/photos/2418485/pexels-photo-2418485.jpeg?auto=compress&cs=tinysrgb&w=800', 'Jasmine specializes in high-end events, bringing a touch of class and sophistication. Her background in theatre and performing arts ensures a captivating experience for all guests.',
ARRAY['misc-promo-model', 'misc-atmospheric', 'waitress-lingerie'],
ARRAY['Perth South'],
'busy'),

(3, 'Amber', 'Bringing warmth and energy to every room.', 'https://images.pexels.com/photos/3221164/pexels-photo-3221164.jpeg?auto=compress&cs=tinysrgb&w=800', 'Amber''s infectious energy and friendly approach make her perfect for creating a relaxed and fun atmosphere. She excels at making guests feel comfortable and ensuring everyone has a memorable time.',
ARRAY['waitress-topless', 'misc-games-host', 'show-pearl'],
ARRAY['Perth North', 'Northwest'],
'available'),

(4, 'Chloe', 'Professional, punctual, and always polished.', 'https://images.pexels.com/photos/1640229/pexels-photo-1640229.jpeg?auto=compress&cs=tinysrgb&w=800', 'Chloe prides herself on her professionalism and attention to detail. She seamlessly integrates into any event, providing top-tier service and ensuring everything runs smoothly from start to finish.',
ARRAY['misc-promo-model', 'misc-atmospheric', 'waitress-lingerie'],
ARRAY['Southwest'],
'offline'),

(5, 'April Flavor', 'Sweet, sassy, and always a delight.', 'https://i.imgur.com/fJHc978.jpeg', 'April brings a fresh and exciting energy to every event. With a background in dance and modeling, she captivates audiences and ensures a memorable experience. She is perfect for high-energy parties and promotional events.',
ARRAY['waitress-topless', 'show-hot-cream', 'show-pearl', 'show-deluxe-works', 'misc-promo-model'],
ARRAY['Perth North', 'Perth South'],
'available'),

(6, 'Anna Ivky', 'Sophistication and a hint of mystery.', 'https://i.imgur.com/ece0iUZ.jpeg', 'Anna is the epitome of grace and professionalism. Her experience with exclusive, private events makes her the ideal choice for clients seeking a discreet yet impactful presence. Her poise and charm elevate any gathering.',
ARRAY['waitress-lingerie', 'show-toy', 'show-works-greek', 'show-absolute-works'],
ARRAY['Perth South', 'Southwest'],
'available')
ON CONFLICT (id) DO NOTHING;

-- Reset the sequence for performers
SELECT setval('performers_id_seq', (SELECT MAX(id) FROM public.performers));

-- =====================================================
-- 3. INSERT SAMPLE BOOKINGS
-- =====================================================
INSERT INTO public.bookings (id, performer_id, client_name, client_email, client_phone, event_date, event_time, event_address, event_type, duration_hours, number_of_guests, services_requested, status, verified_by_admin_name, verified_at, client_message, performer_eta_minutes, total_cost, deposit_amount) VALUES
('bfa3e8a7-58d6-44b1-8798-294956e105b6', 1, 'John Smith', 'john.smith@example.com', '0412345678', '2024-08-15', '19:00', '123 Fun Street, Perth WA', 'Corporate Gala', 4, 50, ARRAY['waitress-topless'], 'confirmed', 'Admin Demo', NOW() - INTERVAL '1.5 days', 'Looking for a very energetic performance for a corporate crowd.', 25, 640.00, 128.00),

('9c5e3f5b-b9d1-4a2e-8c6f-7d1a2b3c4d5e', 2, 'Jane Doe', 'jane.d@email.com', '0487654321', '2024-08-22', '20:30', '456 Party Ave, Fremantle WA', 'Birthday Celebration', 3, 20, ARRAY['waitress-lingerie'], 'pending_deposit_confirmation', NULL, NULL, NULL, 30, 330.00, 66.00),

('a1b2c3d4-e5f6-7890-1234-567890abcdef', 5, 'Laurina Sargeant', 'laurina.s@example.com', '0422334455', '2024-09-10', '19:00', '1 Posh Place, Dalkeith WA', 'VIP Birthday Party', 3, 15, ARRAY['waitress-topless', 'show-hot-cream'], 'pending_performer_acceptance', NULL, NULL, 'Please be discreet, this is a surprise party.', NULL, 860.00, 172.00),

('d4c3b2a1-f6e5-0987-4321-fedcba098765', 3, 'Emily White', 'em.white@web.net', '0433445566', '2024-08-18', '17:00', '101 Social Blvd, Joondalup WA', 'Charity Fundraiser', 3, 100, ARRAY['misc-games-host'], 'rejected', NULL, NULL, NULL, NULL, 360.00, 72.00)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. INSERT DO NOT SERVE ENTRIES
-- =====================================================
INSERT INTO public.do_not_serve_list (id, client_name, client_email, client_phone, reason, status, submitted_by_performer_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Aggressive Alex', 'alex.blocked@example.com', '0400111222', 'Became aggressive and refused to follow event guidelines. Made performers uncomfortable.', 'approved', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Problematic Pete', 'pete.problem@example.com', '0499888777', 'Attempted to solicit services outside of the agreed-upon contract during the event.', 'pending', 2),
('550e8400-e29b-41d4-a716-446655440003', 'Difficult Dan', 'dan.the.man@email.com', '0411222333', 'Constant disputes over payment and unreasonable demands.', 'approved', 3)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. INSERT SAMPLE COMMUNICATIONS
-- =====================================================
INSERT INTO public.communications (id, sender, recipient, message, booking_id, read, type) VALUES
('c0000001-0000-0000-0000-000000000001', 'System', 'admin', 'Booking #bfa3e8a7 for John Smith was confirmed.', 'bfa3e8a7-58d6-44b1-8798-294956e105b6', true, 'booking_confirmation'),
('c0000001-0000-0000-0000-000000000002', 'System', '1', 'Your booking with John Smith is confirmed! Details in your dashboard.', 'bfa3e8a7-58d6-44b1-8798-294956e105b6', true, 'booking_confirmation'),
('c0000001-0000-0000-0000-000000000003', 'Jasmine', 'admin', 'New ''Do Not Serve'' entry submitted for Problematic Pete.', NULL, false, 'admin_message')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. CREATE DEMO ADMIN ACCOUNT
-- =====================================================
-- Password: admin123 (hashed with bcrypt)
-- You should change this password immediately after setup!
INSERT INTO public.admins (name, email, password_hash) VALUES
('Demo Admin', 'admin@flavorentertainers.com', '$2a$10$X5kMqq3LQzQZx7z5VW5bQ.RRQf/SN3VfGPfQv8X3F5J4d1J2C3K4L')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 7. UPDATE CLIENT VIP STATUS
-- =====================================================
-- This will mark John Smith as VIP (has confirmed bookings)
INSERT INTO public.clients (name, email, phone, is_vip, total_bookings)
VALUES ('John Smith', 'john.smith@example.com', '0412345678', true, 1)
ON CONFLICT (email) DO UPDATE SET
    total_bookings = EXCLUDED.total_bookings,
    is_vip = EXCLUDED.is_vip;

-- =====================================================
-- COMPLETE! Database seeded with test data
-- =====================================================

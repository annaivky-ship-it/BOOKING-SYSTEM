-- Seed data for Flavor Entertainers Platform
-- This file contains demo data for testing and development

-- Clear existing data (be careful in production!)
TRUNCATE public.performer_services, public.performers, public.profiles CASCADE;

-- Reset sequences
ALTER SEQUENCE public.blacklist_id_seq RESTART WITH 1;

-- Insert demo profiles
INSERT INTO public.profiles (id, role, display_name, whatsapp, phone, email) VALUES
-- Admin user
('00000000-0000-0000-0000-000000000001', 'admin', 'Admin User', '+61470253286', '+61470253286', 'admin@lustandlace.com.au'),

-- Demo performers
('11111111-1111-1111-1111-111111111111', 'performer', 'Scarlett Rose', '+61400123456', '+61400123456', 'scarlett@lustandlace.com.au'),
('22222222-2222-2222-2222-222222222222', 'performer', 'Ruby Diamond', '+61400123457', '+61400123457', 'ruby@lustandlace.com.au'),
('33333333-3333-3333-3333-333333333333', 'performer', 'Amber Fox', '+61400123458', '+61400123458', 'amber@lustandlace.com.au'),
('44444444-4444-4444-4444-444444444444', 'performer', 'Crystal Belle', '+61400123459', '+61400123459', 'crystal@lustandlace.com.au'),
('55555555-5555-5555-5555-555555555555', 'performer', 'Venus Angel', '+61400123460', '+61400123460', 'venus@lustandlace.com.au'),

-- Demo clients
('66666666-6666-6666-6666-666666666666', 'client', 'John Smith', '+61400789123', '+61400789123', 'john.smith@example.com'),
('77777777-7777-7777-7777-777777777777', 'client', 'Mike Johnson', '+61400789124', '+61400789124', 'mike.johnson@example.com');

-- Insert demo performers
INSERT INTO public.performers (id, user_id, stage_name, slug, bio, is_available, hero_image, featured, verified, rating, total_reviews, services, rate_card) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Scarlett Rose', 'scarlett-rose',
'Sophisticated and elegant, Scarlett brings glamour and excitement to every event. With her stunning red hair and captivating presence, she''s perfect for upscale private parties and intimate gatherings.',
true, 'https://images.unsplash.com/photo-1494790108755-2616c65cab4a?w=400&h=600&fit=crop&face=facepad=2', true, true, 4.8, 24,
'{"waitressing": true, "strip_shows": true, "lap_dance": false}',
'{"waitressing": {"clothed_private": 90, "topless_private": 160}, "strip_shows": {"hot_classic": 400, "deluxe_hot_classic": 450}}'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Ruby Diamond', 'ruby-diamond',
'Playful and energetic, Ruby knows how to turn any party into an unforgettable experience. Her bubbly personality and stunning figure make her a crowd favorite for bucks parties and celebrations.',
true, 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&face=facepad=2', true, true, 4.9, 31,
'{"waitressing": true, "strip_shows": true, "lap_dance": true}',
'{"waitressing": {"skimpy_private": 110, "topless_private": 160, "nude_private": 260}, "strip_shows": {"hot_classic": 400, "toy_show": 500}, "lap_dance": {"private": 100}}'),

('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Amber Fox', 'amber-fox',
'Sultry and seductive, Amber specializes in creating intimate atmospheres. Her exotic dancing background and natural charisma make her perfect for sophisticated adult entertainment.',
false, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&face=facepad=2', false, true, 4.7, 18,
'{"waitressing": true, "strip_shows": true, "lap_dance": true}',
'{"waitressing": {"clothed_private": 90, "skimpy_private": 110, "topless_private": 160}, "strip_shows": {"deluxe_hot_classic": 450, "toy_show": 500, "pvc_show": 550}}'),

('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'Crystal Belle', 'crystal-belle',
'Sweet yet provocative, Crystal brings the perfect balance of innocence and allure. Her angelic looks combined with her bold performances create magical moments for any occasion.',
true, 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&face=facepad=2', false, true, 4.6, 15,
'{"waitressing": true, "strip_shows": false, "lap_dance": true}',
'{"waitressing": {"clothed_private": 90, "skimpy_private": 110, "topless_private": 160}, "lap_dance": {"private": 100, "public": 100}}'),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 'Venus Angel', 'venus-angel',
'Experienced and professional, Venus offers the complete entertainment package. From elegant waitressing to spectacular shows, she delivers premium adult entertainment with style and class.',
true, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&face=facepad=2', true, true, 5.0, 42,
'{"waitressing": true, "strip_shows": true, "lap_dance": true}',
'{"waitressing": {"all_levels": true}, "strip_shows": {"all_shows": true}, "lap_dance": {"both_types": true}}');

-- Insert performer services (linking performers to available services)
INSERT INTO public.performer_services (performer_id, service_id, is_available, custom_rate)
SELECT
    p.id as performer_id,
    s.id as service_id,
    true as is_available,
    CASE
        WHEN p.stage_name = 'Scarlett Rose' AND s.name LIKE '%Private%' THEN s.base_rate * 1.1
        WHEN p.stage_name = 'Ruby Diamond' AND s.category = 'strip_show' THEN s.base_rate * 0.9
        WHEN p.stage_name = 'Venus Angel' THEN s.base_rate * 1.2
        ELSE NULL
    END as custom_rate
FROM public.performers p
CROSS JOIN public.services s
WHERE
    -- Scarlett: Waitressing and Strip Shows only
    (p.stage_name = 'Scarlett Rose' AND s.category IN ('waitressing', 'strip_show') AND s.name NOT LIKE '%Public%')
    OR
    -- Ruby: All services
    (p.stage_name = 'Ruby Diamond')
    OR
    -- Amber: All except most basic services (currently unavailable)
    (p.stage_name = 'Amber Fox' AND s.name NOT IN ('Clothed (Public Bar)', 'Skimpy (Public Bar)'))
    OR
    -- Crystal: Waitressing and Lap Dance only
    (p.stage_name = 'Crystal Belle' AND s.category IN ('waitressing', 'lap_dance'))
    OR
    -- Venus: All services (premium performer)
    (p.stage_name = 'Venus Angel');

-- Insert demo bookings
INSERT INTO public.bookings (id, client_id, performer_id, service, event_description, event_date, duration_hours, event_address, total_amount, deposit_amount, deposit_percent, status, booking_reference, created_at) VALUES
('b0000001-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Topless Waitress', 'Bucks party celebration', '2025-10-15 19:00:00+08', 3, '123 Party Street, Perth WA 6000', 480.00, 72.00, 15, 'pending', 'FE-BP001', NOW() - INTERVAL '2 days'),
('b0000002-0000-0000-0000-000000000002', '77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Hot Classic Strip', '30th birthday surprise', '2025-10-20 20:30:00+08', 1, '456 Celebration Ave, Fremantle WA 6160', 400.00, 60.00, 15, 'approved', 'FE-BD002', NOW() - INTERVAL '1 day'),
('b0000003-0000-0000-0000-000000000003', '66666666-6666-6666-6666-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Nude Waitress', 'Private corporate event', '2025-11-01 18:00:00+08', 4, '789 Executive Plaza, Perth WA 6000', 1248.00, 187.20, 15, 'pending', 'FE-CE003', NOW());

-- Insert demo payments
INSERT INTO public.payments (id, booking_id, amount, method, status, receipt_file, created_at) VALUES
('p0000001-0000-0000-0000-000000000001', 'b0000002-0000-0000-0000-000000000002', 60.00, 'PAYID', 'verified', 'receipts/fe-bd002-deposit-receipt.jpg', NOW() - INTERVAL '1 day'),
('p0000002-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 72.00, 'PAYID', 'pending', 'receipts/fe-bp001-deposit-receipt.jpg', NOW() - INTERVAL '6 hours');

-- Insert demo blacklist entries
INSERT INTO public.blacklist (full_name, email, phone, reason, status, added_by) VALUES
('Problem Client One', 'problem1@example.com', '+61400999001', 'Inappropriate behavior and harassment of performer', 'active', '00000000-0000-0000-0000-000000000001'),
('Bad Actor Two', 'badactor@example.com', '+61400999002', 'Non-payment and verbal abuse', 'active', '00000000-0000-0000-0000-000000000001'),
('Former Issue', 'resolved@example.com', '+61400999003', 'Previous boundary violations - resolved and reformed', 'inactive', '00000000-0000-0000-0000-000000000001');

-- Insert demo vetting applications (if the new table exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vetting_applications_new') THEN
        INSERT INTO public.vetting_applications_new (client_id, status, id_file, notes) VALUES
        ('66666666-6666-6666-6666-666666666666', 'approved', 'ids/john-smith-license.jpg', 'Verified via drivers license - approved for all bookings'),
        ('77777777-7777-7777-7777-777777777777', 'submitted', 'ids/mike-johnson-passport.jpg', 'Pending review - passport submitted');
    END IF;
END $$;

-- Insert demo audit log entries
INSERT INTO public.audit_log (actor, event_type, action, details) VALUES
('00000000-0000-0000-0000-000000000001', 'authentication', 'admin_login', '{"ip": "192.168.1.1", "user_agent": "Mozilla/5.0"}'),
('11111111-1111-1111-1111-111111111111', 'availability', 'toggle_availability', '{"previous_status": false, "new_status": true}'),
('00000000-0000-0000-0000-000000000001', 'booking', 'approve_booking', '{"booking_id": "b0000002-0000-0000-0000-000000000002", "booking_reference": "FE-BD002"}'),
('00000000-0000-0000-0000-000000000001', 'payment', 'verify_payment', '{"payment_id": "p0000001-0000-0000-0000-000000000001", "amount": 60.00}'),
('00000000-0000-0000-0000-000000000001', 'blacklist', 'add_entry', '{"email": "problem1@example.com", "reason": "Inappropriate behavior"}');

-- Insert performer safety preferences
INSERT INTO public.performer_safety_preferences (performer_id, enable_dns_notifications, enable_safety_alerts, emergency_contact_name, emergency_contact_phone, safety_check_interval) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true, true, 'Sarah Rose', '+61400111222', 30),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true, true, 'Emma Diamond', '+61400111223', 45),
('cccccccc-cccc-cccc-cccc-cccccccccccc', true, false, 'Alex Fox', '+61400111224', 60),
('dddddddd-dddd-dddd-dddd-dddddddddddd', true, true, 'Grace Belle', '+61400111225', 30),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true, true, 'Michael Angel', '+61400111226', 15);

-- Update system settings with complete information
UPDATE public.system_settings SET
    admin_whatsapp = '+61470253286',
    admin_email = 'contact@lustandlace.com.au',
    payid_email = 'annaivky@gmail.com'
WHERE id = 1;

-- Create some demo reviews
INSERT INTO public.reviews (booking_id, performer_id, client_id, rating, comment, created_at) VALUES
('b0000002-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', 5, 'Absolutely amazing performance! Ruby was professional, entertaining, and made the birthday unforgettable. Highly recommended!', NOW() - INTERVAL '12 hours');

-- Create demo notifications
INSERT INTO public.notifications (user_id, title, message, type, related_id) VALUES
('66666666-6666-6666-6666-666666666666', 'Booking Confirmation', 'Your booking FE-BP001 has been submitted and is pending approval.', 'booking', 'b0000001-0000-0000-0000-000000000001'),
('77777777-7777-7777-7777-777777777777', 'Booking Approved', 'Great news! Your booking FE-BD002 has been approved. Payment verification confirmed.', 'booking', 'b0000002-0000-0000-0000-000000000002'),
('11111111-1111-1111-1111-111111111111', 'New Booking Request', 'You have a new booking request for October 15th. Please review and respond.', 'booking', 'b0000001-0000-0000-0000-000000000001');

-- Add some recent check-ins for performers
INSERT INTO public.performer_check_ins (performer_id, booking_id, check_in_type, location_lat, location_lng, notes, is_safe) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000002-0000-0000-0000-000000000002', 'arrival', -31.9505, 115.8605, 'Arrived safely at venue, client seems nice', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b0000002-0000-0000-0000-000000000002', 'departure', -31.9505, 115.8605, 'Performance completed successfully, departing venue', true);

-- Create sample safety alert
INSERT INTO public.safety_alerts (alert_type, title, message, severity_level, target_audience, is_active, created_by) VALUES
('general', 'Weekend Safety Reminder', 'Remember to check in with emergency contacts during all weekend bookings. Stay safe out there!', 2, ARRAY['performers'], true, '00000000-0000-0000-0000-000000000001');

-- Refresh the materialized views and update statistics
REFRESH MATERIALIZED VIEW IF EXISTS service_stats;

-- Update performer ratings based on reviews
UPDATE public.performers SET
    rating = (SELECT AVG(rating) FROM public.reviews WHERE performer_id = performers.id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE performer_id = performers.id)
WHERE id IN (SELECT DISTINCT performer_id FROM public.reviews);

COMMIT;
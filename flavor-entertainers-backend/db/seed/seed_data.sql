-- Seed data for Flavor Entertainers
-- This script creates test data for development and testing

-- Insert admin user (manual creation required for auth.users first)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'admin@lustandlace.com.au', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW());

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

-- Create test performers
INSERT INTO public.profiles (id, email, role, display_name, phone, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'scarlett@lustandlace.com.au', 'performer', 'Scarlett Rose', '+61412345001', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'madison@lustandlace.com.au', 'performer', 'Madison Star', '+61412345002', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'amber@lustandlace.com.au', 'performer', 'Amber Divine', '+61412345003', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'ruby@lustandlace.com.au', 'performer', 'Ruby Luxe', '+61412345004', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555555', 'jade@lustandlace.com.au', 'performer', 'Jade Eclipse', '+61412345005', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- Create performer details
INSERT INTO public.performers (id, stage_name, region, services, whatsapp_number, rate_card, available_now, created_at, updated_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Scarlett Rose',
    'Perth Metro',
    ARRAY['Topless Waitress', 'Striptease'],
    '+61412345001',
    '{"Topless Waitress": 400, "Striptease": 600}',
    true,
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Madison Star',
    'Perth Metro',
    ARRAY['Topless Waitress', 'Striptease', 'XXX Show'],
    '+61412345002',
    '{"Topless Waitress": 450, "Striptease": 650, "XXX Show": 900}',
    true,
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Amber Divine',
    'Mandurah',
    ARRAY['Topless Waitress'],
    '+61412345003',
    '{"Topless Waitress": 380}',
    false,
    NOW(),
    NOW()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Ruby Luxe',
    'Joondalup',
    ARRAY['Striptease', 'XXX Show'],
    '+61412345004',
    '{"Striptease": 700, "XXX Show": 950}',
    true,
    NOW(),
    NOW()
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Jade Eclipse',
    'Rockingham',
    ARRAY['Topless Waitress', 'Striptease'],
    '+61412345005',
    '{"Topless Waitress": 420, "Striptease": 680}',
    false,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  stage_name = EXCLUDED.stage_name,
  region = EXCLUDED.region,
  services = EXCLUDED.services,
  whatsapp_number = EXCLUDED.whatsapp_number,
  rate_card = EXCLUDED.rate_card,
  available_now = EXCLUDED.available_now,
  updated_at = NOW();

-- Create test clients
INSERT INTO public.profiles (id, email, role, display_name, phone, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'john.smith@example.com', 'client', 'John Smith', '+61412345101', NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sarah.jones@example.com', 'client', 'Sarah Jones', '+61412345102', NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'mike.brown@example.com', 'client', 'Mike Brown', '+61412345103', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  phone = EXCLUDED.phone,
  updated_at = NOW();

-- Create client details
INSERT INTO public.clients (id, first_name, last_name, notes, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'John', 'Smith', 'Regular client, prefers weekend bookings', NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sarah', 'Jones', 'Corporate events organizer', NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mike', 'Brown', 'First time client', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Create sample availability windows
INSERT INTO public.availability (id, performer_id, start_ts, end_ts, note, created_at)
VALUES
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    (CURRENT_DATE + INTERVAL '7 days')::timestamp + TIME '18:00:00',
    (CURRENT_DATE + INTERVAL '7 days')::timestamp + TIME '23:59:59',
    'Available for weekend party',
    NOW()
  ),
  (
    gen_random_uuid(),
    '22222222-2222-2222-2222-222222222222',
    (CURRENT_DATE + INTERVAL '14 days')::timestamp + TIME '19:00:00',
    (CURRENT_DATE + INTERVAL '14 days')::timestamp + TIME '23:59:59',
    'New Year''s Eve available',
    NOW()
  ),
  (
    gen_random_uuid(),
    '44444444-4444-4444-4444-444444444444',
    (CURRENT_DATE + INTERVAL '3 days')::timestamp + TIME '20:00:00',
    (CURRENT_DATE + INTERVAL '3 days')::timestamp + TIME '23:59:59',
    'Available midweek',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Create sample bookings with different statuses
INSERT INTO public.bookings (
  id, client_id, performer_id, event_date, event_time, location, service, rate, booking_fee, total, message, status, balance_due, balance_due_date, created_at, updated_at
)
VALUES
  (
    gen_random_uuid(),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    NULL, -- No performer assigned yet
    CURRENT_DATE + INTERVAL '10 days',
    '20:00:00',
    '123 Party Street, Perth WA 6000',
    'Topless Waitress',
    400.00,
    25.00,
    425.00,
    'Birthday party for 15 guests',
    'pending_review',
    425.00,
    NULL,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    gen_random_uuid(),
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    CURRENT_DATE + INTERVAL '21 days',
    '19:30:00',
    '456 Corporate Ave, Perth WA 6001',
    'Striptease',
    650.00,
    25.00,
    675.00,
    'Corporate end-of-year function',
    'awaiting_deposit',
    573.75, -- After 15% deposit
    CURRENT_DATE + INTERVAL '14 days',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '6 hours'
  ),
  (
    gen_random_uuid(),
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    CURRENT_DATE + INTERVAL '30 days',
    '21:00:00',
    '789 Celebration Rd, Fremantle WA 6160',
    'Topless Waitress',
    400.00,
    25.00,
    425.00,
    'Bucks party - 12 guests',
    'confirmed',
    361.25, -- After 15% deposit paid
    CURRENT_DATE + INTERVAL '14 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT DO NOTHING;

-- Create one approved client
INSERT INTO public.approved_clients (id, client_id, approval_date, approved_by, last_updated)
VALUES (
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  CURRENT_DATE - INTERVAL '30 days',
  '00000000-0000-0000-0000-000000000001',
  NOW()
)
ON CONFLICT DO NOTHING;

-- Create one blacklist entry (example)
INSERT INTO public.blacklist (id, full_name, email, phone, reason, date_added, added_by, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Bad Actor',
  'badactor@example.com',
  '+61412999999',
  'No-show for multiple bookings, unprofessional behavior',
  CURRENT_DATE - INTERVAL '60 days',
  '00000000-0000-0000-0000-000000000001',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Create sample vetting applications
INSERT INTO public.vetting_applications (
  application_id, client_id, full_name, email, mobile, event_date, event_address, event_type, status, submission_time, decision_time, decision_by, notes, last_updated
)
VALUES
  (
    gen_random_uuid(),
    NULL, -- Anonymous application
    'New Client',
    'newclient@example.com',
    '+61412345199',
    CURRENT_DATE + INTERVAL '45 days',
    '321 New Event St, Perth WA 6000',
    'Striptease',
    'pending',
    NOW() - INTERVAL '1 hour',
    NULL,
    NULL,
    'First time application - awaiting ID verification',
    NOW() - INTERVAL '1 hour'
  ),
  (
    gen_random_uuid(),
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Sarah Jones',
    'sarah.jones@example.com',
    '+61412345102',
    CURRENT_DATE + INTERVAL '60 days',
    '654 Approved Event Ave, Perth WA 6001',
    'Topless Waitress',
    'approved',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days',
    '00000000-0000-0000-0000-000000000001',
    'Verified corporate client - pre-approved for future bookings',
    NOW() - INTERVAL '4 days'
  )
ON CONFLICT DO NOTHING;

-- Create sample audit log entries
INSERT INTO public.audit_log (
  timestamp, event_type, action, actor_user_id, actor_email, request_id, ip, details, booking_id, client_email
)
VALUES
  (
    NOW() - INTERVAL '3 days',
    'booking_created',
    'create',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'mike.brown@example.com',
    gen_random_uuid()::text,
    '192.168.1.100',
    '{"service": "Topless Waitress", "rate": 400, "total": 425}',
    NULL, -- Would reference actual booking ID
    'mike.brown@example.com'
  ),
  (
    NOW() - INTERVAL '1 day',
    'booking_approved',
    'approve',
    '00000000-0000-0000-0000-000000000001',
    'admin@lustandlace.com.au',
    gen_random_uuid()::text,
    '192.168.1.1',
    '{"performer_assigned": "11111111-1111-1111-1111-111111111111"}',
    NULL, -- Would reference actual booking ID
    NULL
  ),
  (
    NOW() - INTERVAL '2 hours',
    'vetting_submitted',
    'submit',
    NULL,
    'newclient@example.com',
    gen_random_uuid()::text,
    '203.45.67.89',
    '{"event_type": "Striptease", "event_date": "2024-02-15"}',
    NULL,
    'newclient@example.com'
  )
ON CONFLICT DO NOTHING;

-- Update table statistics
ANALYZE public.profiles;
ANALYZE public.performers;
ANALYZE public.clients;
ANALYZE public.bookings;
ANALYZE public.availability;
ANALYZE public.vetting_applications;
ANALYZE public.approved_clients;
ANALYZE public.blacklist;
ANALYZE public.audit_log;
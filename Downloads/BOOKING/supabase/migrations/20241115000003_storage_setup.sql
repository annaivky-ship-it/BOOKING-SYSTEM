-- =====================================================
-- FLAVOR ENTERTAINERS - STORAGE BUCKET SETUP
-- =====================================================
-- This file sets up storage buckets for file uploads
-- Run this in the Supabase SQL Editor AFTER schema setup
-- =====================================================

-- Note: Storage buckets are typically created via Supabase Dashboard
-- But you can also use the SQL API or client libraries

-- =====================================================
-- STORAGE BUCKETS CONFIGURATION
-- =====================================================
-- You need to create these buckets manually in Supabase Dashboard:
-- 1. Go to Storage in your Supabase project
-- 2. Click "New Bucket"
-- 3. Create the following buckets:

-- Bucket 1: booking-documents
-- - Name: booking-documents
-- - Public: false (private)
-- - File size limit: 5MB
-- - Allowed MIME types: image/*, application/pdf

-- Bucket 2: deposit-receipts
-- - Name: deposit-receipts
-- - Public: false (private)
-- - File size limit: 5MB
-- - Allowed MIME types: image/*, application/pdf

-- Bucket 3: performer-photos
-- - Name: performer-photos
-- - Public: true (for public profile photos)
-- - File size limit: 5MB
-- - Allowed MIME types: image/*

-- =====================================================
-- STORAGE POLICIES (via SQL)
-- =====================================================

-- Policy: Allow authenticated users to upload booking documents
INSERT INTO storage.policies (name, bucket_id, definition, check_definition)
VALUES
('Allow authenticated users to upload booking documents',
 'booking-documents',
 '(auth.role() = ''authenticated'')',
 '(auth.role() = ''authenticated'')');

-- Policy: Allow authenticated users to upload deposit receipts
INSERT INTO storage.policies (name, bucket_id, definition, check_definition)
VALUES
('Allow authenticated users to upload deposit receipts',
 'deposit-receipts',
 '(auth.role() = ''authenticated'')',
 '(auth.role() = ''authenticated'')');

-- Policy: Allow public read access to performer photos
INSERT INTO storage.policies (name, bucket_id, definition, check_definition)
VALUES
('Public read access to performer photos',
 'performer-photos',
 'true',
 'true');

-- =====================================================
-- ALTERNATIVE: Create buckets via SQL (Supabase API)
-- =====================================================
-- If you prefer SQL, run these in the Supabase SQL Editor:

-- Create booking-documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-documents', 'booking-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create deposit-receipts bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit-receipts', 'deposit-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Create performer-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('performer-photos', 'performer-photos', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- RLS POLICIES FOR STORAGE
-- =====================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view public performer photos
CREATE POLICY "Public Access to Performer Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'performer-photos');

-- Policy: Authenticated users can upload booking documents
CREATE POLICY "Authenticated users can upload booking documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'booking-documents'
  AND auth.role() = 'authenticated'
);

-- Policy: Users can view their own booking documents
CREATE POLICY "Users can view own booking documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'booking-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can upload deposit receipts
CREATE POLICY "Authenticated users can upload deposit receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deposit-receipts'
  AND auth.role() = 'authenticated'
);

-- Policy: Users can view their own deposit receipts
CREATE POLICY "Users can view own deposit receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deposit-receipts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- FILE UPLOAD HELPER FUNCTION
-- =====================================================

-- Function to generate a secure file path for uploads
CREATE OR REPLACE FUNCTION generate_upload_path(
  p_bucket TEXT,
  p_booking_id UUID,
  p_file_extension TEXT
) RETURNS TEXT AS $$
BEGIN
  RETURN p_bucket || '/' || p_booking_id::text || '/' || gen_random_uuid()::text || '.' || p_file_extension;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- USAGE EXAMPLES (for reference)
-- =====================================================

/*
-- Upload a booking document (from client code):
const { data, error } = await supabase.storage
  .from('booking-documents')
  .upload(`${bookingId}/${fileName}`, file);

-- Upload a deposit receipt:
const { data, error } = await supabase.storage
  .from('deposit-receipts')
  .upload(`${bookingId}/${fileName}`, file);

-- Get public URL for performer photo:
const { data } = supabase.storage
  .from('performer-photos')
  .getPublicUrl('performer-1/profile.jpg');
*/

-- =====================================================
-- COMPLETE! Storage buckets configured
-- =====================================================

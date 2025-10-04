-- Fix RLS policies to allow public read access to performers and services

-- Enable RLS on tables
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to performers (for browsing)
DROP POLICY IF EXISTS "Public can view active performers" ON public.performers;
CREATE POLICY "Public can view active performers" 
  ON public.performers 
  FOR SELECT 
  USING (true);

-- Allow public read access to services
DROP POLICY IF EXISTS "Public can view services" ON public.services;
CREATE POLICY "Public can view services" 
  ON public.services 
  FOR SELECT 
  USING (true);

-- Users can read their own data
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own data
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own user record
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Performers can update their own profile
DROP POLICY IF EXISTS "Performers can update own profile" ON public.performers;
CREATE POLICY "Performers can update own profile" 
  ON public.performers 
  FOR UPDATE 
  USING (user_id = auth.uid());

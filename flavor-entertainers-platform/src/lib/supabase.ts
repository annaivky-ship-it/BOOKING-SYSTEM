import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Configuration Error:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    env: process.env.NODE_ENV,
  });
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file or deployment configuration.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
}

// Client-side Supabase client
export const createClientComponentClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client
export const createServerComponentClient = () => {
  if (typeof window !== 'undefined') {
    // Client-side fallback
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  // This will be replaced in server components with proper cookie handling
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Admin client with service role key
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }
  return createClient(supabaseUrl, serviceRoleKey);
};

// Test database connection

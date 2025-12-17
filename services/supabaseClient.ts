import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Get Supabase environment variables (using NEXT_PUBLIC_ prefix for client-side access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

// Create Supabase client only if valid credentials are provided
// Otherwise, the app will gracefully fall back to Demo Mode
if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseUrl.startsWith('https://')) {
    supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

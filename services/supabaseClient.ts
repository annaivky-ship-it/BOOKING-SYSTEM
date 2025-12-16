// Supabase client placeholder - currently in demo mode
// To enable Supabase, install @supabase/ssr and uncomment the implementation below
type SupabaseClient = any;

const supabase: SupabaseClient | null = null;

// TODO: Restore Supabase integration after resolving Next.js build compatibility
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseUrl.startsWith('https://')) {
//     supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
// }

export { supabase };

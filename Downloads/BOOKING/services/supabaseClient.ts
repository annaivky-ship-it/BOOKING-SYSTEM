import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://wykwlstsfkiicusjyqiv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5a3dsc3RzZmtpaWN1c2p5cWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMDAyOTQsImV4cCI6MjA3ODU3NjI5NH0.WQ9xDhYbtymSIgwbglXZh3qlENH6pFOUIELc2RaUMvQ';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is connected
export const isSupabaseConnected = (): boolean => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};
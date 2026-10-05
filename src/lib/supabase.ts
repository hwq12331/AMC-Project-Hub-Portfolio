import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { mockSupabase } from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// A fresh clone opens on sample data. Existing configured projects retain their
// Supabase connection; the explicit demo command always uses the local adapter.
export const isDemoMode = import.meta.env.MODE === 'demo'
  || import.meta.env.VITE_APP_MODE === 'demo'
  || (!supabaseUrl && !supabaseAnonKey && import.meta.env.VITE_APP_MODE !== 'supabase');

if (!isDemoMode && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// The demo adapter implements the query operations used by these screens.
export const supabase: SupabaseClient = isDemoMode
  ? mockSupabase as unknown as SupabaseClient
  : createClient(supabaseUrl, supabaseAnonKey);

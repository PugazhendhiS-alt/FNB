import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const SUPABASE_ENABLED = Boolean(supabaseUrl && supabaseAnonKey);
export const SUPABASE_ADMIN_ENABLED = Boolean(supabaseUrl && supabaseServiceRoleKey);

if (!SUPABASE_ENABLED) {
  console.warn('Supabase client not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

if (SUPABASE_ENABLED && !SUPABASE_ADMIN_ENABLED) {
  console.warn('Supabase admin client not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY in your environment to enable admin user creation.');
}

export const supabase: SupabaseClient | null = SUPABASE_ENABLED
  ? createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
  : null;

export const supabaseAdmin: SupabaseClient | null = SUPABASE_ADMIN_ENABLED
  ? createClient(supabaseUrl ?? '', supabaseServiceRoleKey ?? '')
  : null;

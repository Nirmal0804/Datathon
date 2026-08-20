import { createClient } from '@supabase/supabase-js';

// Public browser credentials only. Never place service-role keys, JWT
// signing secrets, or database credentials in this file.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Single centralized browser Supabase client. When the environment is not yet
// configured on this machine the client stays null and authentication reports
// a safe "not configured" state instead of crashing the login screen.
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const SUPABASE_CONFIGURED = Boolean(supabase);
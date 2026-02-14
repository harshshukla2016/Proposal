import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants';

// Add a warning if placeholder values are still in use
// The placeholders are the *initial values* provided in constants.ts, not generic strings.
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use Env vars if available, otherwise fall back to constants
const supabaseUrl = envUrl || SUPABASE_URL;
const supabaseKey = envKey || SUPABASE_ANON_KEY;

// Check if we are using placeholders (either from empty env or default constants)
const isPlaceholder = supabaseUrl.includes('yjjxmqzenrkzuipeylup') || supabaseKey.startsWith('sb_publishable');

if (isPlaceholder) {
  console.warn(
    '⚠️ Supabase client is using placeholder or invalid credentials.\n' +
    'Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, ' +
    'or update constants.ts with your real credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Null when .env.local is missing, so the Campus page can explain the setup instead of crashing. */
export const supabase = url && key
  ? createClient(url, key, {
      // PKCE returns ?code= in the query string; the implicit flow would put tokens in the #, which is our router.
      auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true },
    })
  : null;

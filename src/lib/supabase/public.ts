import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for public data fetching inside "use cache" functions.
 * No cookies — uses anon key + public RLS policies only.
 * Safe for "use cache" because it doesn't touch Request/Headers/Dynamic APIs.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

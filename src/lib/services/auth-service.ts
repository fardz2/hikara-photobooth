import { createClient } from "@/lib/supabase/server";

// ─── Read: no cache (auth always fresh) ───

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

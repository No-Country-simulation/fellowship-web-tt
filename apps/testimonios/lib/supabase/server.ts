import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

/** Lectura anon de `testimonials_public`. Esta app no tiene sesión. */
export async function createClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

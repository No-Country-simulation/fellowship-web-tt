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
    global: {
      // El fetch por defecto se congela en el build. La galería tiene que ver publicados nuevos.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

export function createServiceRoleClient() {
  return createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

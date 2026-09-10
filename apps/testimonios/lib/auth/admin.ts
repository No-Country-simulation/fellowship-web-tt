import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { getAdminEmails, hasSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export function isAdminUser(user: User | null | undefined): user is User {
  if (!user) {
    return false;
  }

  if (user.app_metadata?.role === "admin") {
    return true;
  }

  const email = user.email?.trim().toLowerCase();
  return Boolean(email && getAdminEmails().includes(email));
}

export const getAdminUser = cache(async () => {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return isAdminUser(user) ? user : null;
});

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

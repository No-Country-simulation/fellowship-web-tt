import { getAdminUser, isAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * JSON-friendly admin gate for agent API routes (not redirect).
 */
export async function requireAdminUser(): Promise<
  | { ok: true; userId: string; email: string | undefined }
  | { ok: false; status: number; error: string }
> {
  if (
    process.env.DEV_ADMIN_BYPASS === "true" &&
    process.env.NODE_ENV !== "production"
  ) {
    return { ok: true, userId: "dev-admin", email: "dev@local" };
  }

  if (!hasSupabasePublicEnv()) {
    return {
      ok: false,
      status: 503,
      error: "Auth no disponible. Revisá variables Supabase.",
    };
  }

  try {
    const user = await getAdminUser();
    if (user) {
      return { ok: true, userId: user.id, email: user.email };
    }

    // Distinguish unauthenticated vs forbidden
    const supabase = await createClient();
    const {
      data: { user: anyUser },
    } = await supabase.auth.getUser();
    if (!anyUser) {
      return {
        ok: false,
        status: 401,
        error: "Debés iniciar sesión como admin.",
      };
    }
    if (!isAdminUser(anyUser)) {
      return {
        ok: false,
        status: 403,
        error: "No tenés permisos de admin.",
      };
    }
    return { ok: true, userId: anyUser.id, email: anyUser.email };
  } catch {
    return {
      ok: false,
      status: 503,
      error: "Auth no disponible. Revisá variables Supabase.",
    };
  }
}

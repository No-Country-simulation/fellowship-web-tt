"use server";

import { redirect } from "next/navigation";

import { isAdminUser } from "@/lib/auth/admin";
import type { LoginState } from "@/lib/auth/login-state";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function loginAdmin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!hasSupabasePublicEnv()) {
    return {
      status: "error",
      message: "Faltan NEXT_PUBLIC_SUPABASE_URL y la anon/publishable key.",
    };
  }

  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!email || !password) {
    return {
      status: "error",
      message: "Ingresá email y contraseña.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      status: "error",
      message: "Email o contraseña incorrectos.",
    };
  }

  if (!isAdminUser(data.user)) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "Esta cuenta no es del equipo.",
    };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  if (hasSupabasePublicEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

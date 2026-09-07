import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin-login-form";
import { PageShell } from "@/components/page-shell";
import { getAdminUser } from "@/lib/auth/admin";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Entrar al admin",
};

export default async function AdminLoginPage() {
  const admin = await getAdminUser();
  if (admin) {
    redirect("/admin");
  }

  return (
    <PageShell centered title="Entrar al admin">
      {hasSupabasePublicEnv() ? (
        <AdminLoginForm />
      ) : (
        <p className="mt-md text-body-small text-text-secondary">
          Faltan las variables de Supabase en{" "}
          <code className="text-text-primary">.env.local</code>.
        </p>
      )}
    </PageShell>
  );
}

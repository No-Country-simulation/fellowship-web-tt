import type { ReactNode } from "react";

import { AdminSessionAside } from "@/components/admin-session-aside";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row">
      <AdminSessionAside email={user.email} />
      {children}
    </div>
  );
}

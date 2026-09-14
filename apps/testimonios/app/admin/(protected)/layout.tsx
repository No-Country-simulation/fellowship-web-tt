import type { ReactNode } from "react";

import { AdminInboxShell } from "@/components/admin-inbox-shell";
import { requireAdmin } from "@/lib/auth/admin";
import { loadAdminInbox } from "@/lib/testimonials/admin-inbox";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();
  const inbox = await loadAdminInbox();

  return <AdminInboxShell inbox={inbox}>{children}</AdminInboxShell>;
}

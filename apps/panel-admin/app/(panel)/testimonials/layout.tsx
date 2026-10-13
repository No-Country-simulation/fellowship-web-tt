import type { ReactNode } from "react";

import { InboxShell } from "@features/testimonials/components/InboxShell";
import { loadAdminInbox } from "@features/testimonials/infrastructure/repositories/testimonialRepository";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Testimonios",
};

export default async function TestimonialsLayout({ children }: { children: ReactNode }) {
  const inbox = await loadAdminInbox();

  return <InboxShell inbox={inbox}>{children}</InboxShell>;
}

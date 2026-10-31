import type { ReactNode } from "react";

import { InboxShell } from "@features/testimonials/components/InboxShell";
import { loadAdminInbox } from "@features/testimonials/infrastructure/repositories/testimonialRepository";
import { galleryFormHref } from "@features/testimonials/infrastructure/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Testimonios",
};

export default async function TestimonialsLayout({ children }: { children: ReactNode }) {
  const inbox = await loadAdminInbox();
  const formHref = galleryFormHref();

  return (
    <InboxShell formHref={formHref} inbox={inbox}>
      {children}
    </InboxShell>
  );
}

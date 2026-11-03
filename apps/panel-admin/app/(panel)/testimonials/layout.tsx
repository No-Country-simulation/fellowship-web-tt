import type { ReactNode } from "react";

import { InboxShell } from "@features/testimonials/components/InboxShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Testimonios",
};

export default function TestimonialsLayout({
  children,
  list,
}: {
  children: ReactNode;
  list: ReactNode;
}) {
  return <InboxShell list={list}>{children}</InboxShell>;
}

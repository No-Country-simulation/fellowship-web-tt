import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AdminPublishedPanel } from "@/components/admin-published-panel";
import { AdminReviewForm } from "@/components/admin-review-form";
import { AdminStatusBadge, adminPillClassName } from "@/components/admin-status-badge";
import { AdminSubmission } from "@/components/admin-submission";
import { PageShell, adminShellClassName } from "@/components/page-shell";
import { requireAdmin } from "@/lib/auth/admin";
import { hasCommunityWebhook } from "@/lib/discord";
import {
  adminContextLine,
  formatSubmittedAt,
  toAdminTestimonial,
} from "@/lib/testimonials/admin-view";
import { getTestimonialById } from "@/lib/testimonials/store";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Revisar testimonio",
};

export default async function AdminReviewPage({
  params,
  searchParams,
}: PageProps<"/admin/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const discordParam = firstSearchParam((await searchParams).discord);

  if (!id) {
    notFound();
  }

  const result = await getTestimonialById(id);
  if (!result.ok && result.notFound) {
    notFound();
  }
  if (!result.ok) {
    return (
      <PageShell
        title="No se pudo cargar"
        description={result.message}
        className={adminShellClassName}
        titleStart={<BackToInbox />}
      />
    );
  }

  const testimonial = toAdminTestimonial(result.testimonial);
  const inReview = testimonial.status === "in_review";
  const discordStatus =
    discordParam === "failed" || discordParam === "ok" ? discordParam : null;
  const canRetryDiscord =
    testimonial.status === "published" &&
    !testimonial.discordPostedAt &&
    hasCommunityWebhook();
  const context = adminContextLine(testimonial);
  const submission = <AdminSubmission testimonial={testimonial} />;

  const titleAddon = (
    <span className="ml-auto flex flex-wrap items-center gap-xs">
      <AdminStatusBadge status={testimonial.status} />
      <span
        className={cn(
          adminPillClassName,
          "border-border bg-bg-surface-3 text-text-secondary",
        )}
      >
        {testimonial.typeLabel}
      </span>
    </span>
  );
  const metaLine = `Enviado el ${formatSubmittedAt(testimonial.submittedAt)}${context ? ` · ${context}` : ""}`;

  if (inReview) {
    return (
      <AdminReviewForm
        testimonial={testimonial}
        submission={submission}
        title={testimonial.fullName}
        titleStart={<BackToInbox />}
        titleAddon={titleAddon}
        metaLine={metaLine}
      />
    );
  }

  return (
    <PageShell
      className={adminShellClassName}
      title={testimonial.fullName}
      titleStart={<BackToInbox />}
      titleAddon={titleAddon}
    >
      <p className="mt-sm text-body-small text-text-secondary">{metaLine}</p>
      <div className="mt-lg grid items-start gap-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {submission}
        <AdminPublishedPanel
          testimonial={testimonial}
          discordStatus={discordStatus}
          canRetryDiscord={canRetryDiscord}
        />
      </div>
    </PageShell>
  );
}

function BackToInbox() {
  return (
    <Link
      href="/admin"
      aria-label="Volver al inbox"
      className="grid size-8 shrink-0 place-items-center rounded-button text-text-secondary hover:bg-bg-white-a5 hover:text-text-primary"
    >
      <ArrowLeft className="size-6" />
    </Link>
  );
}

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

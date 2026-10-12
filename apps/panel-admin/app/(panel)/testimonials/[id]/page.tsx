import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailHeader } from "@features/testimonials/components/DetailHeader";
import { PublishedPanel } from "@features/testimonials/components/PublishedPanel";
import { ReviewForm } from "@features/testimonials/components/ReviewForm";
import { Submission } from "@features/testimonials/components/Submission";
import { hasInstagramChannel, hasLinkedInChannel } from "@features/testimonials/lib/buffer";
import { hasCommunityWebhook } from "@features/testimonials/lib/discord";
import { getTestimonialById } from "@features/testimonials/lib/store";
import {
  adminContextLine,
  formatSubmittedAt,
  toAdminTestimonial,
} from "@features/testimonials/lib/view";
import { PageHeader, PageHeaderDescription, PageHeaderTitle, PageBackLink } from "@shared/ui/patterns/PageHeader";

export const metadata: Metadata = {
  title: "Revisar testimonio",
};

export default async function TestimonialDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ discord?: string | string[]; buffer?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const discordParam = firstSearchParam(query.discord);
  const bufferParam = firstSearchParam(query.buffer);

  if (!id) {
    notFound();
  }

  const result = await getTestimonialById(id);
  if (!result.ok && result.notFound) {
    notFound();
  }
  if (!result.ok) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <PageHeader>
          <PageBackLink href="/testimonials">Testimonios</PageBackLink>
          <PageHeaderTitle>No se pudo cargar</PageHeaderTitle>
          <PageHeaderDescription>{result.message}</PageHeaderDescription>
        </PageHeader>
      </div>
    );
  }

  const testimonial = toAdminTestimonial(result.testimonial);
  const inReview = testimonial.status === "in_review";
  const discordStatus =
    discordParam === "failed" || discordParam === "ok" ? discordParam : null;
  const bufferStatus = bufferParam === "failed" || bufferParam === "ok" ? bufferParam : null;
  const canRetryDiscord =
    testimonial.status === "published" && !testimonial.discordPostedAt && hasCommunityWebhook();
  const canRetryInstagram =
    testimonial.status === "published" &&
    !testimonial.bufferInstagramPostedAt &&
    hasInstagramChannel();
  const canRetryLinkedin =
    testimonial.status === "published" &&
    !testimonial.bufferLinkedinPostedAt &&
    hasLinkedInChannel();
  const context = adminContextLine(testimonial);
  const submission = <Submission testimonial={testimonial} />;
  const metaLine = `Enviado el ${formatSubmittedAt(testimonial.submittedAt)}${context ? ` · ${context}` : ""}`;

  if (inReview) {
    return <ReviewForm testimonial={testimonial} submission={submission} metaLine={metaLine} />;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <DetailHeader testimonial={testimonial} metaLine={metaLine} />
      <div className="mt-6 flex min-w-0 flex-col gap-6">
        {submission}
        <PublishedPanel
          testimonial={testimonial}
          discordStatus={discordStatus}
          bufferStatus={bufferStatus}
          canRetryDiscord={canRetryDiscord}
          canRetryInstagram={canRetryInstagram}
          canRetryLinkedin={canRetryLinkedin}
        />
      </div>
    </div>
  );
}

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

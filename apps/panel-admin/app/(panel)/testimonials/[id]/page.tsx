import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ArchivedPanel } from "@features/testimonials/components/ArchivedPanel";
import { DetailHeader } from "@features/testimonials/components/DetailHeader";
import { InboxBackLink } from "@features/testimonials/components/InboxFilters";
import { PublishedPanel } from "@features/testimonials/components/PublishedPanel";
import { RejectedPanel } from "@features/testimonials/components/RejectedPanel";
import { ReviewForm } from "@features/testimonials/components/ReviewForm";
import { Submission } from "@features/testimonials/components/Submission";
import { bufferPublishesImmediately } from "@features/testimonials/infrastructure/buffer";
import {
  canonicalInboxHref,
  inboxParamsFromRecord,
  inboxSearchNeedsCleanup,
} from "@features/testimonials/infrastructure/inboxQuery";
import {
  bufferPostStates,
  getTestimonialById,
  isTestimonialId,
  storedShareCardUrl,
} from "@features/testimonials/infrastructure/repositories/testimonialRepository";
import { galleryTestimonialHref } from "@features/testimonials/infrastructure/site";
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "@shared/ui/patterns/PageHeader";

export const metadata: Metadata = {
  title: "Revisar testimonio",
};

export default async function TestimonialDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;

  if (!isTestimonialId(id)) {
    notFound();
  }

  const inboxParams = inboxParamsFromRecord(query);
  if (inboxSearchNeedsCleanup(inboxParams)) {
    redirect(canonicalInboxHref(`/testimonials/${id}`, inboxParams));
  }

  const shareParam = firstSearchParam(query.share);

  const result = await getTestimonialById(id);
  if (!result.ok && result.notFound) {
    notFound();
  }
  if (!result.ok) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <PageHeader>
          <InboxBackLink>Testimonios</InboxBackLink>
          <PageHeaderTitle>No se pudo cargar</PageHeaderTitle>
          <PageHeaderDescription>{result.message}</PageHeaderDescription>
        </PageHeader>
      </div>
    );
  }

  const { testimonial, channels } = result;
  const inReview = testimonial.status === "in_review";
  const shareStatus = shareParam === "failed" || shareParam === "ok" ? shareParam : null;
  const submission = <Submission testimonial={testimonial} />;

  if (inReview) {
    return (
      <ReviewForm
        key={testimonial.id}
        testimonial={testimonial}
        submission={submission}
        channels={channels}
      />
    );
  }

  const [shareCardUrl, bufferStates] =
    testimonial.status === "published"
      ? await Promise.all([storedShareCardUrl(testimonial.slug), bufferPostStates(testimonial)])
      : [null, null];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <DetailHeader testimonial={testimonial} />
      <div className="mt-6 flex min-w-0 flex-col gap-6">
        {submission}
        {testimonial.status === "published" ? (
          <PublishedPanel
            testimonial={testimonial}
            channels={channels}
            shareStatus={shareStatus}
            shareCardUrl={shareCardUrl}
            bufferStates={bufferStates}
            publicHref={galleryTestimonialHref(testimonial.slug)}
            scheduled={!bufferPublishesImmediately()}
          />
        ) : null}
        {testimonial.status === "archived" ? <ArchivedPanel testimonial={testimonial} /> : null}
        {testimonial.status === "rejected" ? <RejectedPanel testimonial={testimonial} /> : null}
      </div>
    </div>
  );
}

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

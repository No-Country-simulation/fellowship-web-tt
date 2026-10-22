import { PageHeader, PageHeaderTitle } from "@shared/ui/patterns/PageHeader";
import { formatShortDate, formatSubmittedAt } from "../infrastructure/mappers/testimonialMapper";
import type { AdminTestimonial } from "../types/testimonial";
import { InboxBackLink } from "./InboxFilters";
import { TestimonialStatusBadge } from "./TestimonialStatusBadge";

export function DetailHeader({ testimonial }: { testimonial: AdminTestimonial }) {
  return (
    <PageHeader>
      <div className="md:hidden">
        <InboxBackLink>Testimonios</InboxBackLink>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <PageHeaderTitle>{testimonial.fullName}</PageHeaderTitle>
        <TestimonialStatusBadge status={testimonial.status} />
        <time
          dateTime={testimonial.submittedAt}
          title={`Enviado el ${formatSubmittedAt(testimonial.submittedAt)}`}
          className="ml-auto text-admin-caption text-muted-foreground"
        >
          {formatShortDate(testimonial.submittedAt)}
        </time>
      </div>
    </PageHeader>
  );
}

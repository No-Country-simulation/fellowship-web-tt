import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderTitle,
  PageBackLink,
} from "@shared/ui/patterns/PageHeader";
import type { AdminTestimonial } from "../types/testimonial";
import { TestimonialStatusBadge, TypePill } from "./TestimonialStatusBadge";

export function DetailHeader({
  testimonial,
  metaLine,
}: {
  testimonial: AdminTestimonial;
  metaLine: string;
}) {
  return (
    <PageHeader>
      <PageBackLink href="/testimonials">Testimonios</PageBackLink>
      <div className="flex flex-wrap items-center gap-3">
        <PageHeaderTitle>{testimonial.fullName}</PageHeaderTitle>
        <TestimonialStatusBadge status={testimonial.status} />
        <TypePill>{testimonial.typeLabel}</TypePill>
      </div>
      <PageHeaderDescription>{metaLine}</PageHeaderDescription>
    </PageHeader>
  );
}

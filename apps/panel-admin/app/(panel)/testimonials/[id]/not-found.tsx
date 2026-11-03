import { InboxBackLink } from "@features/testimonials/components/InboxFilters";

export default function TestimonialNotFound() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="px-5 pt-5">
        <InboxBackLink>Testimonios</InboxBackLink>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center px-6 py-8">
        <p className="max-w-md text-center text-admin-body text-muted-foreground">
          No encontramos ese testimonio.
        </p>
      </div>
    </div>
  );
}

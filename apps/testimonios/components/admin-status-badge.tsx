import { STATUS_LABELS, type TestimonialStatus } from "@/lib/testimonials/types";
import { cn } from "@/lib/utils";

export const adminPillClassName =
  "inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-full border px-sm text-overline leading-none";

const STATUS_BADGE_CLASS: Record<TestimonialStatus, string> = {
  in_review: "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
  published: "border-accent-mint/40 bg-accent-mint/10 text-accent-mint",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
};

type AdminStatusBadgeProps = {
  status: TestimonialStatus;
};

/** Pill de estado del testimonio (en revisión / publicado / rechazado). */
export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <span className={cn(adminPillClassName, STATUS_BADGE_CLASS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

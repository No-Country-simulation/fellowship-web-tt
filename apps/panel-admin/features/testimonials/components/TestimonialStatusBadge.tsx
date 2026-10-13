import { StatusBadge } from "@shared/ui/patterns/StatusBadge";
import type { VisualTone } from "@shared/ui/patterns/visualTone";
import { STATUS_LABELS, type TestimonialStatus } from "../types/testimonial";

const STATUS: Record<TestimonialStatus, { label: string; tone: VisualTone }> = {
  in_review: { label: STATUS_LABELS.in_review, tone: "warning" },
  published: { label: STATUS_LABELS.published, tone: "success" },
  rejected: { label: STATUS_LABELS.rejected, tone: "destructive" },
};

export function TestimonialStatusBadge({ status }: { status: TestimonialStatus }) {
  const { label, tone } = STATUS[status];
  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}

export function TypePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-border px-1.5 py-0.5 text-admin-micro font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

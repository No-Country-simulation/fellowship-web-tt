import { StatusBadge } from "@shared/ui/patterns/StatusBadge";
import type { VisualTone } from "@shared/ui/patterns/visualTone";
import { STATUS_LABELS, type TestimonialStatus } from "../types/testimonial";

const STATUS: Record<TestimonialStatus, { label: string; tone: VisualTone }> = {
  in_review: { label: STATUS_LABELS.in_review, tone: "warning" },
  published: { label: STATUS_LABELS.published, tone: "success" },
  archived: { label: STATUS_LABELS.archived, tone: "neutral" },
  rejected: { label: STATUS_LABELS.rejected, tone: "destructive" },
};

export function TestimonialStatusBadge({ status }: { status: TestimonialStatus }) {
  const { label, tone } = STATUS[status];
  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}

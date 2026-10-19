import type { VisualTone } from "./visualTone";

const TONE_CLASSES: Record<VisualTone, string> = {
  neutral: "text-tone-neutral border-tone-neutral/40",
  info: "text-tone-info border-tone-info/40",
  success: "text-tone-success border-tone-success/40",
  warning: "text-tone-warning border-tone-warning/40",
  destructive: "text-tone-destructive border-tone-destructive/40",
};

export function StatusBadge({ tone, children }: { tone: VisualTone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-admin-micro font-medium uppercase tracking-wide ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

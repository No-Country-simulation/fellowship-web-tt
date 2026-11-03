import {
  bufferPostStates,
  storedShareCardUrl,
} from "../infrastructure/repositories/testimonialRepository";
import type { ShareChannels } from "../types/share";
import type { AdminTestimonial } from "../types/testimonial";
import { PublishedPanel } from "./PublishedPanel";

/**
 * Bloque de publicación de una ficha ya publicada.
 * Buffer y la card se leen acá, dentro del Suspense de la página.
 */
export async function PublishedPanelSlot({
  testimonial,
  channels,
  shareStatus,
  publicHref,
  scheduled,
}: {
  testimonial: AdminTestimonial;
  channels: ShareChannels;
  shareStatus: "ok" | "failed" | null;
  publicHref: string | null;
  scheduled: boolean;
}) {
  const [shareCardUrl, bufferStates] = await Promise.all([
    storedShareCardUrl(testimonial.slug),
    bufferPostStates(testimonial),
  ]);

  return (
    <PublishedPanel
      testimonial={testimonial}
      channels={channels}
      shareStatus={shareStatus}
      shareCardUrl={shareCardUrl}
      bufferStates={bufferStates}
      publicHref={publicHref}
      scheduled={scheduled}
    />
  );
}

/** Placeholder del bloque de publicación, sin badges, post ni imagen. */
export function PublishedPanelSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-6" aria-busy="true">
      <p className="sr-only">Cargando la publicación</p>
      <div className="animate-pulse rounded-lg border border-border bg-card p-4">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="mt-2 h-3 w-full max-w-lg rounded bg-muted" />
        <div className="mt-4 h-28 rounded border border-border bg-muted" />
      </div>
      <div className="animate-pulse rounded-lg border border-border bg-card p-4">
        <div className="h-5 w-32 rounded bg-muted" />
        <div className="mt-2 h-3 w-full max-w-md rounded bg-muted" />
        <div className="mt-4 h-24 rounded border border-border bg-muted" />
      </div>
    </div>
  );
}

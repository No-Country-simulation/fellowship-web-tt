"use client";

import { useActionState, useState } from "react";
import { buttonVariants } from "@repo/ui/button";

import {
  approveTestimonialVideo,
  processTestimonialVideo,
  rejectTestimonialVideo,
} from "@/lib/testimonials/video-actions";
import type { AdminTestimonial } from "@/lib/testimonials/admin-view";
import { cn } from "@/lib/utils";

type AdminVideoPanelProps = {
  testimonial: AdminTestimonial;
};

const STATUS_LABEL: Record<AdminTestimonial["videoStatus"], string> = {
  none: "Sin video",
  original: "Original listo",
  processing: "Procesando…",
  processed: "Listo para aprobar",
  approved: "Aprobado",
  rejected: "Rechazado (se puede reprocesar)",
};

/**
 * Video aparte del Publicar testimonio: preview + procesar / aprobar / rechazar.
 * Buffer/redes no usan este archivo (opción B).
 */
export function AdminVideoPanel({ testimonial }: AdminVideoPanelProps) {
  if (testimonial.videoStatus === "none") {
    return null;
  }

  const playUrl =
    testimonial.videoStatus === "approved"
      ? testimonial.videoShareUrl
      : testimonial.videoStatus === "processed" ||
          testimonial.videoStatus === "rejected"
        ? (testimonial.videoProcessedUrl ?? testimonial.videoOriginalUrl)
        : testimonial.videoOriginalUrl;

  return (
    <section className="flex flex-col gap-sm rounded-md border border-border bg-card p-md">
      <div className="flex flex-wrap items-baseline justify-between gap-sm">
        <h2 className="text-overline text-text-secondary">Video</h2>
        <p className="text-body-small text-text-muted">
          {STATUS_LABEL[testimonial.videoStatus]}
        </p>
      </div>

      {playUrl ? (
        <video
          key={playUrl}
          controls
          preload="metadata"
          className="aspect-video w-full rounded-md bg-black"
          src={playUrl}
        >
          Tu navegador no reproduce este video.
        </video>
      ) : (
        <p className="text-body-small text-text-muted">
          No hay URL reproducible todavía.
        </p>
      )}

      {testimonial.videoShareUrl ? (
        <div className="flex flex-col gap-xs">
          <p className="text-body-small font-medium text-text-primary">
            Link para el fellow (Supabase)
          </p>
          <a
            href={testimonial.videoShareUrl}
            target="_blank"
            rel="noreferrer"
            className="break-all text-body-small text-accent-cyan underline-offset-4 hover:underline"
          >
            {testimonial.videoShareUrl}
          </a>
        </div>
      ) : null}

      {testimonial.videoError ? (
        <p className="text-body-small text-destructive" role="alert">
          {testimonial.videoError}
        </p>
      ) : null}

      <VideoActions testimonial={testimonial} />
    </section>
  );
}

function VideoActions({ testimonial }: { testimonial: AdminTestimonial }) {
  const [message, setMessage] = useState<string | null>(null);

  const canProcess =
    testimonial.videoStatus === "original" ||
    testimonial.videoStatus === "rejected" ||
    (testimonial.videoStatus === "processed" && Boolean(testimonial.videoError));

  const canApproveReject = testimonial.videoStatus === "processed";

  const processAction = processTestimonialVideo.bind(null, testimonial.id);
  const approveAction = approveTestimonialVideo.bind(null, testimonial.id);
  const rejectAction = rejectTestimonialVideo.bind(null, testimonial.id);

  const [processState, processFormAction, processPending] = useActionState(
    processAction,
    { status: "idle" as const },
  );
  const [approveState, approveFormAction, approvePending] = useActionState(
    approveAction,
    { status: "idle" as const },
  );
  const [rejectState, rejectFormAction, rejectPending] = useActionState(
    rejectAction,
    { status: "idle" as const },
  );

  const pending = processPending || approvePending || rejectPending;
  const feedback =
    message ||
    (processState.status === "error" ? processState.message : null) ||
    (processState.status === "success" ? processState.message : null) ||
    (approveState.status === "error" ? approveState.message : null) ||
    (approveState.status === "success" ? approveState.message : null) ||
    (rejectState.status === "error" ? rejectState.message : null) ||
    (rejectState.status === "success" ? rejectState.message : null);

  return (
    <div className="flex flex-col gap-sm border-t border-border pt-sm">
      <p className="text-body-small text-text-muted">
        Aprobar o rechazar el video no publica el testimonio ni dispara Buffer.
      </p>
      <div className="flex flex-wrap gap-sm">
        {canProcess ? (
          <form action={processFormAction}>
            <button
              type="submit"
              disabled={pending || testimonial.videoStatus === "processing"}
              className={cn(buttonVariants({ variant: "secondary" }))}
              onClick={() => setMessage(null)}
            >
              {processPending || testimonial.videoStatus === "processing"
                ? "Procesando…"
                : "Procesar (FFmpeg Micro)"}
            </button>
          </form>
        ) : null}

        {canApproveReject ? (
          <>
            <form action={approveFormAction}>
              <button
                type="submit"
                disabled={pending}
                className={cn(buttonVariants())}
                onClick={() => setMessage(null)}
              >
                Aprobar video
              </button>
            </form>
            <form action={rejectFormAction}>
              <button
                type="submit"
                disabled={pending}
                className={cn(buttonVariants({ variant: "ghost" }))}
                onClick={() => setMessage(null)}
              >
                Rechazar video
              </button>
            </form>
          </>
        ) : null}
      </div>
      {feedback ? (
        <p
          className={cn(
            "text-body-small",
            feedback.toLowerCase().includes("error") ||
              processState.status === "error" ||
              approveState.status === "error" ||
              rejectState.status === "error"
              ? "text-destructive"
              : "text-text-secondary",
          )}
          role="status"
        >
          {feedback}
        </p>
      ) : null}
    </div>
  );
}

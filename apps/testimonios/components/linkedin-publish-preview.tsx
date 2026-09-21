"use client";

import { useId, useState, useTransition } from "react";
import { buttonVariants } from "@repo/ui/button";

import { youtubeWatchUrl } from "@/lib/testimonials/parse";
import { generateCaption } from "@/lib/testimonials/generate-caption";
import { CAPTION_EDIT_MAX_CHARS } from "@/lib/testimonials/quote";
import type { AdminTestimonial } from "@/lib/testimonials/admin-view";
import { cn } from "@/lib/utils";

type LinkedInEdit = {
  testimonioId: string;
  quote: string;
  onChange: (value: string) => void;
};

type LinkedInPublishPreviewProps = {
  testimonial: AdminTestimonial;
  caption: string;
  /** Copiar caption (después de publicar). */
  showCopy?: boolean;
  /** Editar el caption adentro del preview. */
  edit?: LinkedInEdit;
};

function composeBody(caption: string, video: string | null) {
  return [caption.trim(), video && !caption.includes(video) ? video : null]
    .filter(Boolean)
    .join("\n\n");
}

function LinkedInAttachments({
  video,
  captureUrl,
}: {
  video: string | null;
  captureUrl: string | null;
}) {
  if (!video && !captureUrl) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-col gap-sm">
      {video ? (
        <div className="min-w-0">
          <p className="text-body-small font-medium text-text-secondary">
            Video
          </p>
          <a
            href={video}
            target="_blank"
            rel="noreferrer"
            className="wrap-break-word break-all text-body text-accent-cyan hover:underline"
          >
            {video}
          </a>
        </div>
      ) : null}
      {captureUrl ? (
        // Captura del proyecto: se adjunta al post, no es card generada.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={captureUrl}
          alt="Captura del proyecto"
          className="max-h-72 w-full rounded-md object-contain"
        />
      ) : null}
    </div>
  );
}

/** Post de LinkedIn: un solo campo de texto + adjuntos. Sin cards anidadas. */
export function LinkedInPublishPreview({
  testimonial,
  caption,
  showCopy = false,
  edit,
}: LinkedInPublishPreviewProps) {
  const captionId = useId();
  const countId = `${captionId}-count`;
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const video = testimonial.videoUrl
    ? youtubeWatchUrl(testimonial.videoUrl)
    : null;
  const body = composeBody(caption, video);

  async function copyCaption() {
    if (!body) return;
    await navigator.clipboard.writeText(body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-w-0 flex-col gap-sm">
      {edit ? (
        <>
          <div className="flex items-center justify-between gap-sm">
            <label htmlFor={captionId} className="sr-only">
              Caption de LinkedIn
            </label>
            <p id={countId} className="text-body-small text-text-muted">
              {caption.length}/{CAPTION_EDIT_MAX_CHARS}
            </p>
            <button
              type="button"
              disabled={pending}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              onClick={() => {
                start(async () => {
                  const result = await generateCaption(
                    edit.testimonioId,
                    "linkedin",
                    edit.quote,
                  );
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  setError(null);
                  edit.onChange(result.caption);
                });
              }}
            >
              {pending ? "Generando…" : "Generar con IA"}
            </button>
          </div>
          <div
            className={cn(
              "grid rounded-md border border-border bg-bg-base px-md py-sm",
              "transition-colors focus-within:border-accent-cyan focus-within:ring-2 focus-within:ring-accent-cyan/40",
            )}
          >
            <textarea
              id={captionId}
              name="li_caption"
              value={caption}
              maxLength={CAPTION_EDIT_MAX_CHARS}
              aria-describedby={countId}
              placeholder="Escribí el caption del post…"
              className="col-start-1 row-start-1 min-h-40 w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-body text-text-primary outline-none placeholder:text-text-muted [field-sizing:content]"
              onChange={(event) => edit.onChange(event.target.value)}
            />
            <div
              aria-hidden
              className="invisible col-start-1 row-start-1 min-h-40 whitespace-pre-wrap wrap-break-word text-body"
            >
              {caption || " "}
              {"\n"}
            </div>
          </div>
          {error ? (
            <p className="text-body-small text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </>
      ) : caption.trim() ? (
        <p className="whitespace-pre-wrap wrap-break-word text-body text-text-primary">
          {caption}
        </p>
      ) : (
        <p className="text-body-small text-text-muted">Sin caption.</p>
      )}

      <LinkedInAttachments
        video={video}
        captureUrl={testimonial.captureUrl}
      />

      {showCopy ? (
        <button
          type="button"
          disabled={!body}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          onClick={() => {
            void copyCaption();
          }}
        >
          {copied ? "Caption copiado" : "Copiar caption"}
        </button>
      ) : null}
    </div>
  );
}

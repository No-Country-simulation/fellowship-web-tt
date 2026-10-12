"use client";

import { useId, useState } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { youtubeWatchUrl } from "../infrastructure/youtube";
import { CAPTION_EDIT_MAX_CHARS } from "../infrastructure/quote";
import type { AdminTestimonial } from "../types/testimonial";

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
    <div className="flex min-w-0 flex-col gap-2">
      {video ? (
        <div className="min-w-0">
          <p className="text-admin-caption font-medium text-muted-foreground">Video</p>
          <a
            href={video}
            target="_blank"
            rel="noreferrer"
            className="break-all text-admin-body text-primary hover:underline"
          >
            {video}
          </a>
        </div>
      ) : null}
      {captureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={captureUrl}
          alt="Captura del proyecto"
          className="max-h-72 w-full rounded-lg object-contain"
        />
      ) : null}
    </div>
  );
}

/** Post de LinkedIn: caption editable a mano, más el link de YouTube si hay video. */
export function LinkedInPublishPreview({
  testimonial,
  caption,
  showCopy = false,
  onChange,
}: {
  testimonial: AdminTestimonial;
  caption: string;
  showCopy?: boolean;
  onChange?: (value: string) => void;
}) {
  const captionId = useId();
  const countId = `${captionId}-count`;
  const [copied, setCopied] = useState(false);
  const video = testimonial.videoUrl ? youtubeWatchUrl(testimonial.videoUrl) : null;
  const body = composeBody(caption, video);

  async function copyCaption() {
    if (!body) return;
    await navigator.clipboard.writeText(body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {onChange ? (
        <>
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={captionId} className="text-admin-caption text-foreground">
              Caption de LinkedIn
            </label>
            <p id={countId} className="text-admin-caption text-muted-foreground">
              {caption.length}/{CAPTION_EDIT_MAX_CHARS}
            </p>
          </div>
          <div
            className={cn(
              "grid rounded-lg border border-border bg-background px-3 py-2",
              "transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40",
            )}
          >
            <textarea
              id={captionId}
              value={caption}
              maxLength={CAPTION_EDIT_MAX_CHARS}
              aria-describedby={countId}
              placeholder="Escribí el caption del post…"
              className="col-start-1 row-start-1 min-h-40 w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-admin-body text-foreground outline-none placeholder:text-muted-foreground [field-sizing:content]"
              onChange={(event) => onChange(event.target.value)}
            />
            <div
              aria-hidden
              className="invisible col-start-1 row-start-1 min-h-40 text-admin-body whitespace-pre-wrap wrap-break-word"
            >
              {caption || " "}
              {"\n"}
            </div>
          </div>
        </>
      ) : caption.trim() ? (
        <p className="text-admin-body whitespace-pre-wrap wrap-break-word text-foreground">{caption}</p>
      ) : (
        <p className="text-admin-caption text-muted-foreground">Sin caption.</p>
      )}

      <LinkedInAttachments video={video} captureUrl={testimonial.captureUrl} />

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

"use client";

import { useActionState, useId, useState } from "react";
import { buttonVariants } from "@repo/ui/button";

import { Field, textareaClassName } from "@/components/enviar-fields";
import { TestimonialCard } from "@/components/testimonial-card";
import { YoutubeEmbed } from "@/components/youtube-embed";
import { reviewTestimonial } from "@/lib/testimonials/admin-actions";
import { initialReviewState } from "@/lib/testimonials/review-state";
import type { AdminTestimonial } from "@/lib/testimonials/admin-view";
import { buildIgCaption, CAPTION_EDIT_MAX_CHARS, QUOTE_EDIT_MAX_CHARS } from "@/lib/testimonials/quote";
import { cn } from "@/lib/utils";

type AdminReviewFormProps = {
  testimonial: AdminTestimonial;
};

export function AdminReviewForm({ testimonial }: AdminReviewFormProps) {
  const action = reviewTestimonial.bind(null, testimonial.id);
  const [state, formAction, pending] = useActionState(
    action,
    initialReviewState,
  );
  const [quote, setQuote] = useState(testimonial.quote);
  const [caption, setCaption] = useState(testimonial.igCaption);
  const captionId = useId();
  const captionHintId = `${captionId}-hint`;
  const captionCountId = `${captionId}-count`;
  const captionDescribedBy = `${captionHintId} ${captionCountId}`;

  function onQuoteChange(value: string) {
    setQuote(value);
    setCaption(
      buildIgCaption({
        quote: value,
        fullName: testimonial.fullName,
        instagram: testimonial.instagram,
      }),
    );
  }

  return (
    <form action={formAction} className="mt-lg flex flex-col gap-lg">
      <div className="grid grid-cols-1 gap-x-md gap-y-xs sm:grid-cols-2 sm:grid-rows-[auto_auto_minmax(12rem,auto)_auto]">
        <p className="text-body-small font-medium text-text-primary sm:col-start-1 sm:row-start-1">
          Preview de la card
        </p>
        <p className="text-body-small text-text-secondary sm:col-start-1 sm:row-start-2">
          Así se ve en la galería y en Discord.
        </p>
        <TestimonialCard
          className="min-h-48 min-w-0 sm:col-start-1 sm:row-start-3"
          name={testimonial.fullName}
          typeLabel={testimonial.typeLabel}
          quote={quote || testimonial.quote}
          avatarUrl={testimonial.avatarUrl}
        />
        <label
          htmlFor={captionId}
          className="mt-md text-body-small font-medium text-text-primary sm:col-start-2 sm:row-start-1 sm:mt-0"
        >
          Caption de Instagram
        </label>
        <p
          id={captionHintId}
          className="text-body-small text-text-secondary sm:col-start-2 sm:row-start-2"
        >
          Se arma con el quote; se puede retocar.
        </p>
        <textarea
          id={captionId}
          name="ig_caption"
          value={caption}
          maxLength={CAPTION_EDIT_MAX_CHARS}
          aria-describedby={captionDescribedBy}
          className={cn(
            textareaClassName,
            "min-h-48 min-w-0 resize-none whitespace-pre-wrap sm:col-start-2 sm:row-start-3",
          )}
          onChange={(event) => setCaption(event.target.value)}
        />
        <p
          id={captionCountId}
          className="text-body-small text-text-muted sm:col-start-2 sm:row-start-4"
        >
          {caption.length}/{CAPTION_EDIT_MAX_CHARS}
        </p>
      </div>

      <Field
        label="Quote"
        hint="Sale en la card y en el caption. Al editarlo se actualizan los dos de arriba."
      >
        {({ id, describedBy }) => (
          <>
            <textarea
              id={id}
              name="quote"
              value={quote}
              maxLength={QUOTE_EDIT_MAX_CHARS}
              aria-describedby={describedBy}
              className={textareaClassName}
              onChange={(event) => onQuoteChange(event.target.value)}
            />
            <p className="mt-xs text-body-small text-text-muted">
              {quote.length}/{QUOTE_EDIT_MAX_CHARS}
            </p>
          </>
        )}
      </Field>

      {testimonial.captureUrl ? (
        <section className="flex flex-col gap-sm">
          <p className="text-overline text-text-secondary">
            Captura del proyecto
          </p>
          {/* Remote screenshot from Storage; decorative next to the review copy. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={testimonial.captureUrl}
            alt="Captura del proyecto"
            className="max-h-72 w-auto max-w-full rounded-md border border-border object-contain"
          />
        </section>
      ) : null}

      {testimonial.youtubeEmbedUrl ? (
        <section className="flex flex-col gap-sm">
          <p className="text-overline text-text-secondary">YouTube</p>
          <YoutubeEmbed
            src={testimonial.youtubeEmbedUrl}
            title={`Video de ${testimonial.fullName}`}
          />
        </section>
      ) : null}

      {state.status === "saved" ? (
        <p className="text-body-small text-accent-mint" role="status">
          Guardamos el quote y el caption. Todavía no está publicado.
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className="text-body-small text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-sm">
        <button
          type="submit"
          name="intent"
          value="reject"
          disabled={pending}
          className={cn(buttonVariants({ variant: "destructive", size: "lg" }))}
          onClick={(event) => {
            if (
              !window.confirm(
                "¿Rechazar este testimonio? No sale en la galería ni en Discord.",
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          Rechazar
        </button>
        <div className="flex flex-wrap items-center gap-sm">
          <button
            type="submit"
            name="intent"
            value="save"
            disabled={pending}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={pending}
            className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}
          >
            Publicar
          </button>
        </div>
      </div>
    </form>
  );
}

"use client";

import { startTransition, useActionState, useState, type ReactNode } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { reviewTestimonial } from "../actions/testimonialActions";
import { igCardContent } from "../infrastructure/ig-card";
import { igCardPngBlob } from "../infrastructure/ig-card-canvas";
import {
  buildIgCaption,
  buildLiCaption,
  extractCaptionIntro,
  followsShareCaptionTemplate,
  QUOTE_EDIT_MAX_CHARS,
} from "../infrastructure/quote";
import { initialReviewState } from "../types/reviewState";
import type { AdminTestimonial } from "../types/testimonial";
import { CaptionField } from "./CaptionField";
import { DetailHeader } from "./DetailHeader";
import { DiscordPublishPreview } from "./DiscordPublishPreview";
import { IgShare } from "./IgShare";
import { LinkedInPublishPreview } from "./LinkedInPublishPreview";
import { ShareTabs } from "./ShareTabs";
import { textareaClassName } from "./fields";

type Intent = "save" | "publish" | "reject";

/**
 * Revisión: envío plegado, quote, y preview por tabs (Discord / Instagram / LinkedIn).
 * El quote y los captions se editan a mano.
 */
export function ReviewForm({
  testimonial,
  submission,
  metaLine,
}: {
  testimonial: AdminTestimonial;
  submission: ReactNode;
  metaLine: string;
}) {
  const action = reviewTestimonial.bind(null, testimonial.id);
  const [state, formAction, pending] = useActionState(action, initialReviewState);
  const [quote, setQuote] = useState(testimonial.quote);
  const [caption, setCaption] = useState(testimonial.igCaption);
  const [liCaption, setLiCaption] = useState(testimonial.liCaption);
  const [intent, setIntent] = useState<Intent | null>(null);
  const quoteEmpty = quote.trim().length === 0;

  function onQuoteChange(value: string) {
    setQuote(value);
    setCaption((current) => {
      if (!followsShareCaptionTemplate(current)) {
        return current;
      }
      return buildIgCaption({
        intro: extractCaptionIntro(current) ?? undefined,
        quote: value,
        fullName: testimonial.fullName,
        instagram: testimonial.instagram,
      });
    });
    setLiCaption((current) => {
      if (!followsShareCaptionTemplate(current)) {
        return current;
      }
      return buildLiCaption({
        intro: extractCaptionIntro(current) ?? undefined,
        quote: value,
        fullName: testimonial.fullName,
        linkedin: testimonial.linkedin,
      });
    });
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        const value = submitter instanceof HTMLButtonElement ? submitter.value : "";
        if (value === "reject") {
          return;
        }
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        formData.set("intent", value);
        formData.set("quote", quote);
        formData.set("ig_caption", caption);
        formData.set("li_caption", liCaption);
        if (value !== "publish") {
          setIntent("save");
          startTransition(() => {
            formAction(formData);
          });
          return;
        }
        void (async () => {
          setIntent("publish");
          try {
            const blob = await igCardPngBlob(igCardContent(testimonial, quote));
            formData.set("ig_card", new File([blob], "instagram.png", { type: "image/png" }));
          } catch {
            // Publica igual; Buffer Instagram falla y se puede reintentar.
          }
          startTransition(() => {
            formAction(formData);
          });
        })();
      }}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <textarea hidden readOnly tabIndex={-1} aria-hidden="true" name="quote" value={quote} />
      <textarea hidden readOnly tabIndex={-1} aria-hidden="true" name="ig_caption" value={caption} />
      <textarea hidden readOnly tabIndex={-1} aria-hidden="true" name="li_caption" value={liCaption} />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <DetailHeader testimonial={testimonial} metaLine={metaLine} />

        <div className="mt-6 flex min-w-0 flex-col gap-6">
          {submission}

          <section
            aria-labelledby="admin-edit-title"
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
          >
            <header className="flex flex-col gap-1">
              <h2 id="admin-edit-title" className="text-admin-heading font-semibold text-foreground">
                Quote
              </h2>
              <p id="admin-edit-hint" className="text-admin-caption text-muted-foreground">
                Una o dos frases, cortas y con impacto. Salen en Discord y en la card de
                Instagram; si lo cambiás, los captions se ajustan automáticamente.
              </p>
            </header>

            <div>
              <textarea
                id="admin-quote"
                value={quote}
                maxLength={QUOTE_EDIT_MAX_CHARS}
                aria-labelledby="admin-edit-title"
                aria-describedby="admin-edit-hint"
                aria-invalid={quoteEmpty || undefined}
                className={cn(textareaClassName, "min-h-28")}
                onChange={(event) => onQuoteChange(event.target.value)}
              />
              <p
                className={cn(
                  "mt-1 text-admin-caption",
                  quoteEmpty ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {quoteEmpty
                  ? "El quote no puede estar vacío."
                  : `${quote.length}/${QUOTE_EDIT_MAX_CHARS}`}
              </p>
            </div>
          </section>

          <section aria-labelledby="admin-preview-title" className="flex flex-col gap-3">
            <header className="flex flex-col gap-1">
              <h2 id="admin-preview-title" className="text-admin-heading font-semibold text-foreground">
                Cómo va a quedar
              </h2>
              <p className="text-admin-caption text-muted-foreground">
                Se actualiza mientras escribís. Instagram y LinkedIn tienen caption editable.
              </p>
            </header>

            <ShareTabs
              discord={
                <DiscordPublishPreview testimonial={testimonial} quote={quote || testimonial.quote} />
              }
              instagram={
                <div className="grid items-start gap-4 md:grid-cols-2">
                  <IgShare
                    mode="preview"
                    slug={testimonial.slug}
                    caption={caption}
                    {...igCardContent(testimonial, quote)}
                  />
                  <CaptionField label="Caption de Instagram" value={caption} onChange={setCaption} />
                </div>
              }
              linkedin={
                <LinkedInPublishPreview
                  testimonial={testimonial}
                  caption={liCaption}
                  onChange={setLiCaption}
                />
              }
            />
          </section>
        </div>
      </div>

      <footer className="shrink-0 border-t border-border bg-card px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
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
                return;
              }
              setIntent("reject");
            }}
          >
            {pending && intent === "reject" ? "Rechazando…" : "Rechazar"}
          </button>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            {state.status === "saved" ? (
              <p className="text-admin-caption text-tone-success" role="status">
                Cambios guardados. Todavía no está publicado.
              </p>
            ) : null}
            {state.status === "error" ? (
              <p className="text-admin-caption text-destructive" role="alert">
                {state.message}
              </p>
            ) : null}
            <button
              type="submit"
              name="intent"
              value="save"
              disabled={pending || quoteEmpty}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              onClick={() => setIntent("save")}
            >
              {pending && intent === "save" ? "Guardando…" : "Guardar borrador"}
            </button>
            <button
              type="submit"
              name="intent"
              value="publish"
              disabled={pending || quoteEmpty}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
              onClick={(event) => {
                if (
                  !window.confirm(
                    "¿Publicar este testimonio? Sale en la galería y se postea en Discord, Instagram y LinkedIn.",
                  )
                ) {
                  event.preventDefault();
                  return;
                }
                setIntent("publish");
              }}
            >
              {pending && intent === "publish" ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
      </footer>
    </form>
  );
}

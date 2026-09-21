"use client";

import { useActionState, useState, type ReactNode } from "react";
import { buttonVariants } from "@repo/ui/button";

import { AdminCaptionField } from "@/components/admin-caption-field";
import { AdminIgShare } from "@/components/admin-ig-share";
import { AdminShareTabs } from "@/components/admin-share-tabs";
import { DiscordPublishPreview } from "@/components/discord-publish-preview";
import { LinkedInPublishPreview } from "@/components/linkedin-publish-preview";
import { textareaClassName } from "@/components/enviar-fields";
import { PageShell } from "@/components/page-shell";
import { reviewTestimonial } from "@/lib/testimonials/admin-actions";
import { adminContextLine, type AdminTestimonial } from "@/lib/testimonials/admin-view";
import { igCardPngBlob } from "@/lib/testimonials/ig-card-canvas";
import { initialReviewState } from "@/lib/testimonials/review-state";
import {
  buildIgCaption,
  buildLiCaption,
  extractCaptionIntro,
  followsShareCaptionTemplate,
  QUOTE_EDIT_MAX_CHARS,
} from "@/lib/testimonials/quote";
import { cn } from "@/lib/utils";

type Intent = "save" | "publish" | "reject";

type AdminReviewFormProps = {
  testimonial: AdminTestimonial;
  /** `<AdminSubmission>` renderizado en el server; va arriba, plegado. */
  submission: ReactNode;
  title: string;
  titleStart: ReactNode;
  titleAddon: ReactNode;
  metaLine: string;
};

/**
 * Revisión: envío plegado, quote, y preview por tabs (Discord / Instagram / LinkedIn).
 */
export function AdminReviewForm({
  testimonial,
  submission,
  title,
  titleStart,
  titleAddon,
  metaLine,
}: AdminReviewFormProps) {
  const action = reviewTestimonial.bind(null, testimonial.id);
  const [state, formAction, pending] = useActionState(
    action,
    initialReviewState,
  );
  const [quote, setQuote] = useState(testimonial.quote);
  const [caption, setCaption] = useState(testimonial.igCaption);
  const [liCaption, setLiCaption] = useState(testimonial.liCaption);
  const [intent, setIntent] = useState<Intent | null>(null);
  const quoteEmpty = quote.trim().length === 0;
  const contextLine = adminContextLine(testimonial);

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
        const value =
          submitter instanceof HTMLButtonElement ? submitter.value : "";
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
          formAction(formData);
          return;
        }
        void (async () => {
          setIntent("publish");
          try {
            const blob = await igCardPngBlob({
              quote,
              fullName: testimonial.fullName,
              avatarUrl: testimonial.avatarUrl,
              instagram: testimonial.instagram,
              typeLabel: testimonial.typeLabel,
              contextLine: adminContextLine(testimonial),
            });
            formData.set(
              "ig_card",
              new File([blob], "instagram.png", { type: "image/png" }),
            );
          } catch {
            // Publica igual; Buffer Instagram falla y se puede reintentar.
          }
          formAction(formData);
        })();
      }}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <textarea hidden readOnly tabIndex={-1} aria-hidden="true" name="quote" value={quote} />
      <textarea hidden readOnly tabIndex={-1} aria-hidden="true" name="ig_caption" value={caption} />
      <textarea hidden readOnly tabIndex={-1} aria-hidden="true" name="li_caption" value={liCaption} />
      <PageShell
        fullWidth
        title={title}
        titleStart={titleStart}
        titleAddon={titleAddon}
      >
        <p className="mt-sm text-body-small text-text-secondary">{metaLine}</p>

        <div className="mt-lg flex min-w-0 flex-col gap-lg">
          {submission}

          <section
            aria-labelledby="admin-edit-title"
            className="flex flex-col gap-md rounded-md border border-border bg-card p-md"
          >
            <header className="flex flex-col gap-xs">
              <h2
                id="admin-edit-title"
                className="text-overline text-text-secondary"
              >
                Quote
              </h2>
              <p
                id="admin-edit-hint"
                className="text-body-small text-text-secondary"
              >
                Una o dos frases, cortas y con impacto. Salen en Discord y en
                la card de Instagram; si lo cambiás, los captions se ajustan
                automáticamente.
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
                  "mt-xs text-body-small",
                  quoteEmpty ? "text-destructive" : "text-text-muted",
                )}
              >
                {quoteEmpty
                  ? "El quote no puede estar vacío."
                  : `${quote.length}/${QUOTE_EDIT_MAX_CHARS}`}
              </p>
            </div>
          </section>

          <section
            aria-labelledby="admin-preview-title"
            className="flex flex-col gap-md"
          >
            <header className="flex flex-col gap-xs">
              <h2
                id="admin-preview-title"
                className="text-overline text-text-secondary"
              >
                Cómo va a quedar
              </h2>
              <p className="text-body-small text-text-secondary">
                Se actualiza mientras escribís. Instagram y LinkedIn tienen
                caption editable; podés generarlo con IA.
              </p>
            </header>

            <AdminShareTabs
              discord={
                <DiscordPublishPreview
                  testimonial={testimonial}
                  quote={quote || testimonial.quote}
                  hideLabel
                />
              }
              instagram={
                <div className="grid items-start gap-md md:grid-cols-2">
                  <AdminIgShare
                    mode="preview"
                    slug={testimonial.slug}
                    quote={quote}
                    caption={caption}
                    fullName={testimonial.fullName}
                    avatarUrl={testimonial.avatarUrl}
                    instagram={testimonial.instagram}
                    typeLabel={testimonial.typeLabel}
                    contextLine={contextLine}
                  />
                  <AdminCaptionField
                    plataforma="instagram"
                    testimonioId={testimonial.id}
                    quote={quote}
                    value={caption}
                    onChange={setCaption}
                  />
                </div>
              }
              linkedin={
                <LinkedInPublishPreview
                  testimonial={testimonial}
                  caption={liCaption}
                  edit={{
                    testimonioId: testimonial.id,
                    quote,
                    onChange: setLiCaption,
                  }}
                />
              }
            />
          </section>
        </div>
      </PageShell>

      <footer className="shrink-0 border-t border-border bg-bg-base px-sm py-sm">
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
                return;
              }
              setIntent("reject");
            }}
          >
            {pending && intent === "reject" ? "Rechazando…" : "Rechazar"}
          </button>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-sm">
            {state.status === "saved" ? (
              <p className="text-body-small text-accent-mint" role="status">
                Cambios guardados. Todavía no está publicado.
              </p>
            ) : null}
            {state.status === "error" ? (
              <p className="text-body-small text-destructive" role="alert">
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
              className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}
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

"use client";

import { startTransition, useActionState, useState, type ReactNode } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { reviewTestimonial } from "../actions/testimonialActions";
import { igCardContent } from "../infrastructure/ig-card";
import { igCardPngBlob } from "../infrastructure/ig-card-canvas";
import {
  buildPostCaption,
  extractCaptionIntro,
  followsShareCaptionTemplate,
  QUOTE_EDIT_MAX_CHARS,
} from "../infrastructure/quote";
import { initialReviewState } from "../types/reviewState";
import { formatNetworkList, SHARE_NETWORKS, type ShareChannels } from "../types/share";
import type { AdminTestimonial, CardDesign } from "../types/testimonial";
import { CaptionField } from "./CaptionField";
import { CardDesignField } from "./CardDesignField";
import { DetailHeader } from "./DetailHeader";
import { IgShare } from "./IgShare";
import { ShareTargets } from "./ShareTargets";
import { textareaClassName } from "./fields";

type Intent = "save" | "publish" | "reject";

/**
 * Revisión: envío plegado y una sola publicación (card + texto) para Discord, Instagram y LinkedIn.
 * El quote y el texto se editan a mano.
 */
export function ReviewForm({
  testimonial,
  submission,
  channels,
}: {
  testimonial: AdminTestimonial;
  submission: ReactNode;
  channels: ShareChannels;
}) {
  const action = reviewTestimonial.bind(null, testimonial.id);
  const [state, formAction, pending] = useActionState(action, initialReviewState);
  const [quote, setQuote] = useState(testimonial.quote);
  const [caption, setCaption] = useState(testimonial.caption);
  const [cardDesign, setCardDesign] = useState<CardDesign>("photo");
  const [intent, setIntent] = useState<Intent | null>(null);
  const quoteEmpty = quote.trim().length === 0;
  const quoteTooLong = quote.length > QUOTE_EDIT_MAX_CHARS;
  const quoteInvalid = quoteEmpty || quoteTooLong;
  const templateCaption = buildPostCaption({
    quote,
    fullName: testimonial.fullName,
    instagram: testimonial.instagram,
    linkedin: testimonial.linkedin,
  });
  const targets = SHARE_NETWORKS.filter((network) => channels[network]);

  function onQuoteChange(value: string) {
    setQuote(value);
    setCaption((current) => {
      if (!followsShareCaptionTemplate(current)) {
        return current;
      }
      return buildPostCaption({
        intro: extractCaptionIntro(current) ?? undefined,
        quote: value,
        fullName: testimonial.fullName,
        instagram: testimonial.instagram,
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
        formData.set("caption", caption);
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
            const blob = await igCardPngBlob(igCardContent(testimonial, quote, cardDesign));
            formData.set("share_card", new File([blob], "instagram.png", { type: "image/png" }));
          } catch {
            // Publica igual; las redes fallan sin card y se reintentan desde la ficha.
          }
          startTransition(() => {
            formAction(formData);
          });
        })();
      }}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <textarea hidden readOnly tabIndex={-1} aria-hidden="true" name="quote" value={quote} />
      <textarea hidden readOnly tabIndex={-1} aria-hidden="true" name="caption" value={caption} />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <DetailHeader testimonial={testimonial} />

        <div className="mt-6 flex min-w-0 flex-col gap-6">
          {submission}

          <section
            aria-labelledby="admin-post-title"
            className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4"
          >
            <header className="flex flex-col gap-2">
              <h2 id="admin-post-title" className="text-admin-heading font-semibold text-foreground">
                Publicación
              </h2>
              <p className="text-admin-caption text-muted-foreground">
                Una sola publicación para todas las redes: la misma imagen y el mismo texto. La
                imagen se actualiza mientras escribís y al cambiar el diseño.
              </p>
              <ShareTargets channels={channels} />
            </header>

            <div className="grid items-start gap-5 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
              <figure className="flex min-w-0 flex-col gap-2 md:sticky md:top-0">
                <CardDesignField
                  type={testimonial.type}
                  value={cardDesign}
                  onChange={setCardDesign}
                />
                <IgShare
                  mode="preview"
                  slug={testimonial.slug}
                  caption={caption}
                  {...igCardContent(testimonial, quote, cardDesign)}
                />
                <figcaption className="text-admin-caption text-muted-foreground">
                  Imagen 1080×1350. Se genera al publicar.
                </figcaption>
              </figure>

              <div className="flex min-w-0 flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="admin-quote" className="text-admin-caption text-foreground">
                      Frase de la imagen
                    </label>
                    <p
                      className={`text-admin-caption ${quoteInvalid ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {quoteEmpty
                        ? "No puede estar vacía"
                        : `${quote.length}/${QUOTE_EDIT_MAX_CHARS}${quoteTooLong ? " · Acortala" : ""}`}
                    </p>
                  </div>
                  <p id="admin-quote-hint" className="text-admin-caption text-muted-foreground">
                    Una o dos frases, cortas y con impacto. Si el texto sigue la plantilla, se ajusta
                    solo.
                  </p>
                  <textarea
                    id="admin-quote"
                    value={quote}
                    maxLength={QUOTE_EDIT_MAX_CHARS}
                    aria-describedby="admin-quote-hint"
                    aria-invalid={quoteInvalid || undefined}
                    className={cn(textareaClassName, "min-h-28")}
                    onChange={(event) => onQuoteChange(event.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <CaptionField
                    label="Texto del post"
                    hint={
                      testimonial.videoUrl
                        ? "Mismo texto en todas las redes. En Discord y LinkedIn se suma el link del video."
                        : "Mismo texto en todas las redes."
                    }
                    value={caption}
                    onChange={setCaption}
                  />
                  {caption !== templateCaption ? (
                    <button
                      type="button"
                      className="self-start cursor-pointer text-admin-caption text-primary hover:underline"
                      onClick={() => setCaption(templateCaption)}
                    >
                      Volver a la plantilla
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
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
                  "¿Rechazar este testimonio? No sale en la galería ni en las redes.",
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
              disabled={pending || quoteInvalid}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              onClick={() => setIntent("save")}
            >
              {pending && intent === "save" ? "Guardando…" : "Guardar borrador"}
            </button>
            <button
              type="submit"
              name="intent"
              value="publish"
              disabled={pending || quoteInvalid}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
              onClick={(event) => {
                const where = targets.length
                  ? ` y se publica en ${formatNetworkList(targets)} con la misma imagen y texto`
                  : "";
                if (!window.confirm(`¿Publicar este testimonio? Sale en la galería${where}.`)) {
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

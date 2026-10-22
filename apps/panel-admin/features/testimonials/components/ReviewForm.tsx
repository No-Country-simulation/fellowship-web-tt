"use client";

import {
  startTransition,
  useActionState,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { reviewTestimonial } from "../actions/testimonialActions";
import { INBOX_FILTERS_FIELD } from "../infrastructure/inboxQuery";
import { useInboxFilters } from "./InboxFilters";
import { igCardContent } from "../infrastructure/ig-card";
import { igCardPngBlob, igCardQuoteClipped } from "../infrastructure/ig-card-canvas";
import {
  buildPostCaption,
  extractCaptionIntro,
  followsShareCaptionTemplate,
  QUOTE_EDIT_MAX_CHARS,
} from "../infrastructure/quote";
import { initialReviewState } from "../types/reviewState";
import {
  formatNetworkList,
  SHARE_CARD_MAX_BYTES,
  SHARE_CARD_TOO_LARGE_PUBLISH_MESSAGE,
  SHARE_NETWORKS,
  type ShareChannels,
} from "../types/share";
import type { AdminTestimonial, CardDesign } from "../types/testimonial";
import { CaptionField } from "./CaptionField";
import { CardDesignField } from "./CardDesignField";
import { DetailHeader } from "./DetailHeader";
import { IgShare } from "./IgShare";
import { ShareTargets } from "./ShareTargets";
import { textareaClassName } from "./fields";

type Intent = "save" | "publish" | "reject";

/**
 * Revisión: envío plegado. La misma card en las tres redes. Instagram y LinkedIn
 * comparten el texto; Discord lleva intro + frase.
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
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardAttempt, setCardAttempt] = useState<"publish" | "retry" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { filtersField } = useInboxFilters();
  const preparingCardRef = useRef(false);
  const preparingCard = cardAttempt !== null;
  const quoteEmpty = quote.trim().length === 0;
  const quoteTooLong = quote.length > QUOTE_EDIT_MAX_CHARS;
  const quoteInvalid = quoteEmpty || quoteTooLong;
  const canMeasureCard = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const quoteClipped = useMemo(() => {
    if (!canMeasureCard || quoteEmpty) return false;
    return igCardQuoteClipped(
      igCardContent(testimonial, quote, cardDesign),
      getComputedStyle(document.body).fontFamily || "sans-serif",
    );
  }, [canMeasureCard, cardDesign, quote, quoteEmpty, testimonial]);
  const templateCaption = buildPostCaption({
    quote,
    fullName: testimonial.fullName,
    instagram: testimonial.instagram,
    linkedin: testimonial.linkedin,
  });
  const targets = SHARE_NETWORKS.filter((network) => channels[network]);

  async function publishWithCard(attempt: "publish" | "retry") {
    const form = formRef.current;
    if (!form || preparingCardRef.current) {
      return;
    }
    preparingCardRef.current = true;
    const formData = new FormData(form);
    formData.set("intent", "publish");
    formData.set("quote", quote);
    formData.set("caption", caption);
    setIntent("publish");
    setCardAttempt(attempt);
    let blob: Blob | null = null;
    try {
      blob = await igCardPngBlob(igCardContent(testimonial, quote, cardDesign));
    } catch {
      blob = null;
    }
    preparingCardRef.current = false;
    setCardAttempt(null);
    if (!blob || blob.size === 0) {
      setCardError("No se pudo generar la imagen y el testimonio no se publicó.");
      return;
    }
    if (blob.size > SHARE_CARD_MAX_BYTES) {
      setCardError(SHARE_CARD_TOO_LARGE_PUBLISH_MESSAGE);
      return;
    }
    formData.set("share_card", new File([blob], "instagram.png", { type: "image/png" }));
    setCardError(null);
    startTransition(() => {
      formAction(formData);
    });
  }

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
      ref={formRef}
      action={formAction}
      onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        const value = submitter instanceof HTMLButtonElement ? submitter.value : "";
        if (value === "reject") {
          return;
        }
        event.preventDefault();
        if (value !== "publish") {
          const formData = new FormData(event.currentTarget);
          formData.set("intent", value);
          formData.set("quote", quote);
          formData.set("caption", caption);
          setIntent("save");
          startTransition(() => {
            formAction(formData);
          });
          return;
        }
        void publishWithCard("publish");
      }}
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <input type="hidden" name={INBOX_FILTERS_FIELD} value={filtersField} readOnly />
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
                La misma imagen en todas las redes. Instagram y LinkedIn comparten el texto;
                Discord lleva la intro y la frase. La imagen se actualiza mientras escribís y al
                cambiar el diseño.
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
                      className={cn(
                        "text-admin-caption",
                        quoteInvalid ? "text-destructive" : "text-muted-foreground",
                      )}
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
                  {quoteClipped ? (
                    <p id="admin-quote-clip" className="text-admin-caption text-tone-warning" role="status">
                      En este diseño la card no muestra toda la frase: la corta con “…”.
                    </p>
                  ) : null}
                  <textarea
                    id="admin-quote"
                    value={quote}
                    maxLength={QUOTE_EDIT_MAX_CHARS}
                    aria-describedby={quoteClipped ? "admin-quote-hint admin-quote-clip" : "admin-quote-hint"}
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
                        ? "Este texto va a Instagram y LinkedIn. Discord lleva la intro y la frase. En Discord y LinkedIn se suma el link del video."
                        : "Este texto va a Instagram y LinkedIn. Discord lleva la intro y la frase."
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
            disabled={pending || preparingCard}
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
            {cardError ? (
              <p className="text-admin-caption text-destructive" role="alert">
                {cardError}
              </p>
            ) : null}
            {cardError ? (
              <button
                type="button"
                disabled={pending || preparingCard || quoteInvalid}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                onClick={() => {
                  void publishWithCard("retry");
                }}
              >
                {cardAttempt === "retry" ? "Reintentando…" : "Reintentar imagen"}
              </button>
            ) : null}
            <button
              type="submit"
              name="intent"
              value="save"
              disabled={pending || preparingCard || quoteInvalid}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              onClick={() => setIntent("save")}
            >
              {pending && intent === "save" ? "Guardando…" : "Guardar borrador"}
            </button>
            <button
              type="submit"
              name="intent"
              value="publish"
              disabled={pending || preparingCard || quoteInvalid}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
              onClick={(event) => {
                const where = targets.length
                  ? ` y se publica en ${formatNetworkList(targets)} con la misma imagen y texto`
                  : "";
                const clipNote = quoteClipped
                  ? " En este diseño la card corta la frase con “…”."
                  : "";
                if (
                  !window.confirm(`¿Publicar este testimonio? Sale en la galería${where}.${clipNote}`)
                ) {
                  event.preventDefault();
                  return;
                }
                setIntent("publish");
              }}
            >
              {(pending && intent === "publish") || cardAttempt === "publish"
                ? "Publicando…"
                : "Publicar"}
            </button>
          </div>
        </div>
      </footer>
    </form>
  );
}

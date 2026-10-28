"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { reviewTestimonial } from "../actions/testimonialActions";
import { INBOX_FILTERS_FIELD } from "../infrastructure/inboxQuery";
import { useInboxFilters } from "./InboxFilters";
import { igCardContent } from "../infrastructure/ig-card";
import { igCardPngBlob, igCardQuoteClipped } from "../infrastructure/ig-card-canvas";
import {
  buildDiscordCaption,
  buildIgCaption,
  buildLiCaption,
  CAPTION_MAX_CHARS,
  captionIncludesVideo,
  linkedInMention,
  omitVideoLine,
  QUOTE_EDIT_MAX_CHARS,
  setCaptionVideo,
  videoCaptionLine,
} from "../infrastructure/quote";
import { initialReviewState } from "../types/reviewState";
import {
  formatNetworkList,
  SHARE_CARD_MAX_BYTES,
  SHARE_CARD_TOO_LARGE_PUBLISH_MESSAGE,
  SHARE_NETWORK_LABELS,
  SHARE_NETWORKS,
  type ShareChannels,
} from "../types/share";
import type { AdminTestimonial, CardDesign } from "../types/testimonial";
import { CaptionField } from "./CaptionField";
import {
  CAPTION_NETWORKS,
  CaptionNetworkTabs,
  useRememberedCaptionNetwork,
  type CaptionNetwork,
  type CaptionTabNote,
} from "./CaptionNetworkTabs";
import { CardDesignField } from "./CardDesignField";
import { DetailHeader } from "./DetailHeader";
import { IgShare } from "./IgShare";
import { PublishConfirmDialog } from "./PublishConfirmDialog";
import { textareaClassName } from "./fields";

type Intent = "save" | "publish" | "reject";

type CaptionSnapshot = {
  quote: string;
  igCaption: string;
  liCaption: string;
  discordCaption: string;
};

function captionHint(network: CaptionNetwork) {
  if (network === "discord") {
    return "La descripción que acompaña la imagen en Discord.";
  }
  if (network === "linkedin") {
    return "La descripción que acompaña la imagen en LinkedIn.";
  }
  return "La descripción que acompaña la imagen en Instagram.";
}

/** Deja el link completo o lo saca. Un link cortado no se conserva. */
function settleVideo(caption: string, videoUrl: string | null, include: boolean) {
  return setCaptionVideo(caption, videoUrl, include && Boolean(videoUrl));
}

function captionLead(text: string) {
  const line = text
    .split("\n")
    .map((part) => part.trim())
    .find(Boolean);
  if (!line) {
    return "Sin texto.";
  }
  if (line.length <= 140) {
    return line;
  }
  return `${line.slice(0, 139)}…`;
}

function mentionNote(network: CaptionNetwork, testimonial: AdminTestimonial) {
  if (network === "discord") {
    return null;
  }
  if (network === "instagram") {
    const saved = testimonial.instagram?.trim();
    return saved
      ? `Mención: ${saved}`
      : "Sin Instagram: la plantilla no lleva mención";
  }
  const mention = linkedInMention(testimonial.linkedin);
  return mention
    ? `Mención: ${mention}`
    : "Sin LinkedIn: la plantilla no lleva mención";
}

function openedSnapshot(testimonial: AdminTestimonial): CaptionSnapshot {
  return {
    quote: testimonial.quote,
    igCaption: settleVideo(testimonial.igCaption, testimonial.videoUrl, false),
    liCaption: settleVideo(
      testimonial.liCaption,
      testimonial.videoUrl,
      captionIncludesVideo(testimonial.liCaption, testimonial.videoUrl),
    ),
    discordCaption: settleVideo(
      testimonial.discordCaption,
      testimonial.videoUrl,
      captionIncludesVideo(testimonial.discordCaption, testimonial.videoUrl),
    ),
  };
}

/**
 * Revisión: envío plegado. La misma card en las tres redes.
 * Cada red tiene su texto y su intro. La cita queda en la imagen.
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
  const [opened] = useState(() => openedSnapshot(testimonial));
  const [quote, setQuote] = useState(opened.quote);
  const [igCaption, setIgCaption] = useState(opened.igCaption);
  const [liCaption, setLiCaption] = useState(opened.liCaption);
  const [discordCaption, setDiscordCaption] = useState(opened.discordCaption);
  const [captionNetwork, setCaptionNetwork] = useRememberedCaptionNetwork(testimonial.id);
  const captionPanelId = useId();
  const captionNotesId = useId();
  const [cardDesign, setCardDesign] = useState<CardDesign>("photo");
  const [intent, setIntent] = useState<Intent | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardAttempt, setCardAttempt] = useState<"publish" | "retry" | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [copied, setCopied] = useState(false);
  const [baseline, setBaseline] = useState<CaptionSnapshot>(opened);
  const [appliedSave, setAppliedSave] = useState(initialReviewState);
  const formRef = useRef<HTMLFormElement>(null);
  const allowUnload = useRef(false);
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
  const templates = useMemo(
    () => ({
      instagram: buildIgCaption({
        fullName: testimonial.fullName,
        instagram: testimonial.instagram,
        type: testimonial.type,
      }),
      linkedin: buildLiCaption({
        fullName: testimonial.fullName,
        linkedin: testimonial.linkedin,
        type: testimonial.type,
        videoUrl: testimonial.videoUrl,
      }),
      discord: buildDiscordCaption({
        fullName: testimonial.fullName,
        type: testimonial.type,
        videoUrl: testimonial.videoUrl,
      }),
    }),
    [
      testimonial.fullName,
      testimonial.instagram,
      testimonial.linkedin,
      testimonial.type,
      testimonial.videoUrl,
    ],
  );
  const captions: Record<CaptionNetwork, string> = {
    instagram: igCaption,
    linkedin: liCaption,
    discord: discordCaption,
  };
  if (state.status === "saved" && appliedSave !== state) {
    setAppliedSave(state);
    setBaseline({ quote, igCaption, liCaption, discordCaption });
  }
  const activeCaption = captions[captionNetwork];
  const activeMax = CAPTION_MAX_CHARS[captionNetwork];
  const activeEmpty = channels[captionNetwork] && activeCaption.trim().length === 0;
  const targets = SHARE_NETWORKS.filter((network) => channels[network]);
  const tabNotes: Partial<Record<CaptionNetwork, CaptionTabNote>> = {};
  for (const network of CAPTION_NETWORKS) {
    tabNotes[network] = {
      publishes: channels[network],
      edited: captions[network] !== templates[network],
      text: channels[network] ? undefined : "sin configurar",
    };
  }
  const iconButtonClass = cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "shrink-0");
  const otherCaptionProblems = CAPTION_NETWORKS.flatMap((network) => {
    if (network === captionNetwork) {
      return [];
    }
    const problem = captionProblem(network, captions[network], channels[network]);
    return problem ? [problem] : [];
  });
  const captionInvalid = CAPTION_NETWORKS.some(
    (network) => captionProblem(network, captions[network], channels[network]) !== null,
  );
  const dirty =
    quote !== baseline.quote ||
    igCaption !== baseline.igCaption ||
    liCaption !== baseline.liCaption ||
    discordCaption !== baseline.discordCaption;
  const captionBody = omitVideoLine(activeCaption);
  const videoLine =
    captionNetwork === "instagram" ? null : videoCaptionLine(testimonial.videoUrl);
  const videoIncluded = Boolean(videoLine) && captionIncludesVideo(activeCaption, testimonial.videoUrl);
  const mention = mentionNote(captionNetwork, testimonial);
  const instagramLinks =
    captionNetwork === "instagram" && testimonial.videoUrl ? "Instagram no admite links" : null;
  const showCaptionNotes = Boolean(mention || instagramLinks);
  const publishLead = targets.length
    ? `Sale en la galería y se publica en ${formatNetworkList(targets)} con la misma imagen y el texto de cada red.`
    : "Sale en la galería.";
  const publishSummaries = CAPTION_NETWORKS.map((network) => {
    const lead = captionLead(captions[network]);
    const summary = channels[network]
      ? lead
      : lead === "Sin texto."
        ? "No se publica."
        : `No se publica. ${lead}`;
    return { label: SHARE_NETWORK_LABELS[network], summary };
  });

  useEffect(() => {
    if (state.status === "error") {
      allowUnload.current = false;
    }
  }, [state]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!dirty) {
      return;
    }
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (allowUnload.current) {
        return;
      }
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  async function publishWithCard(attempt: "publish" | "retry") {
    const form = formRef.current;
    if (!form || preparingCardRef.current) {
      return;
    }
    preparingCardRef.current = true;
    const formData = new FormData(form);
    formData.set("intent", "publish");
    formData.set("quote", quote);
    formData.set("ig_caption", igCaption);
    formData.set("li_caption", liCaption);
    formData.set("discord_caption", discordCaption);
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
    allowUnload.current = true;
    startTransition(() => {
      formAction(formData);
    });
  }

  function onQuoteChange(value: string) {
    setQuote(value);
  }

  function setActiveCaption(value: string) {
    if (captionNetwork === "instagram") {
      setIgCaption(value);
      return;
    }
    if (captionNetwork === "linkedin") {
      setLiCaption(value);
      return;
    }
    setDiscordCaption(value);
  }

  function onCaptionBodyChange(body: string) {
    if (captionNetwork === "instagram" || !testimonial.videoUrl) {
      setActiveCaption(omitVideoLine(body));
      return;
    }
    setActiveCaption(
      settleVideo(body, testimonial.videoUrl, captionIncludesVideo(activeCaption, testimonial.videoUrl)),
    );
  }

  function selectNetwork(next: CaptionNetwork) {
    setCaptionNetwork(next);
    setCopied(false);
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(activeCaption);
      setCopied(true);
    } catch {
      setCopied(false);
    }
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
          formData.set("ig_caption", igCaption);
          formData.set("li_caption", liCaption);
          formData.set("discord_caption", discordCaption);
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
      <textarea hidden readOnly tabIndex={-1} aria-hidden="true" name="ig_caption" value={igCaption} />
      <textarea hidden readOnly tabIndex={-1} aria-hidden="true" name="li_caption" value={liCaption} />
      <textarea
        hidden
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        name="discord_caption"
        value={discordCaption}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <DetailHeader testimonial={testimonial} />

        <div className="mt-6 flex min-w-0 flex-col gap-6">
          {submission}

          <section
            aria-labelledby="admin-post-title"
            className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4"
          >
            <header>
              <h2 id="admin-post-title" className="text-admin-heading font-semibold text-foreground">
                Publicación
              </h2>
            </header>

            <div className="grid items-start gap-5 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-4 md:sticky md:top-0">
                <figure className="flex min-w-0 flex-col gap-2">
                  <CardDesignField
                    type={testimonial.type}
                    value={cardDesign}
                    onChange={setCardDesign}
                  />
                  <IgShare
                    mode="preview"
                    slug={testimonial.slug}
                    {...igCardContent(testimonial, quote, cardDesign)}
                  />
                  <figcaption className="text-admin-caption text-muted-foreground">
                    Imagen 1080×1350. Se genera al publicar.
                  </figcaption>
                </figure>
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="admin-quote" className="min-w-0 text-admin-caption text-foreground">
                      Cita de la historia
                    </label>
                    <p
                      className={cn(
                        "shrink-0 text-admin-caption",
                        quoteInvalid ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {quoteEmpty
                        ? "No puede estar vacía"
                        : `${quote.length}/${QUOTE_EDIT_MAX_CHARS}${quoteTooLong ? " · Acortala" : ""}`}
                    </p>
                  </div>
                  <p id="admin-quote-hint" className="text-admin-caption text-muted-foreground">
                    El fragmento de la historia que se lee en la imagen. Una o dos oraciones, cortas y
                    con impacto.
                  </p>
                  {quoteClipped ? (
                    <p id="admin-quote-clip" className="text-admin-caption text-tone-warning" role="status">
                      En este diseño la card no muestra toda la cita: la corta con “…”.
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

                <div className="flex min-w-0 flex-col gap-2">
                  <h3 className="text-admin-body font-semibold text-foreground">Texto por red</h3>
                  <div className="min-w-0">
                    <CaptionNetworkTabs
                      attached
                      value={captionNetwork}
                      onChange={selectNetwork}
                      controls={captionPanelId}
                      notes={tabNotes}
                    />
                    <div
                      id={captionPanelId}
                      role="tabpanel"
                      aria-labelledby={`${captionPanelId}-${captionNetwork}`}
                      className="rounded-b-lg border border-border bg-card p-3"
                    >
                      <CaptionField
                        label={`Descripción en ${SHARE_NETWORK_LABELS[captionNetwork]}`}
                        hint={captionHint(captionNetwork)}
                        value={captionBody}
                        countedText={activeCaption}
                        maxChars={activeMax}
                        emptyInvalid={activeEmpty}
                        describedByExtra={showCaptionNotes ? captionNotesId : undefined}
                        onChange={onCaptionBodyChange}
                        actions={
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                void copyCaption();
                              }}
                              disabled={!activeCaption.trim()}
                              aria-label={copied ? "Texto copiado" : "Copiar texto"}
                              title={copied ? "Texto copiado" : "Copiar texto"}
                              className={iconButtonClass}
                            >
                              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                            </button>
                            {activeCaption !== templates[captionNetwork] ? (
                              <button
                                type="button"
                                aria-label="Volver a la plantilla"
                                title="Volver a la plantilla"
                                className={iconButtonClass}
                                onClick={() => setActiveCaption(templates[captionNetwork])}
                              >
                                <RotateCcw aria-hidden />
                              </button>
                            ) : null}
                          </>
                        }
                        footer={
                          <>
                            {videoLine ? (
                              <label className="flex items-center gap-2 text-admin-caption text-foreground">
                                <input
                                  type="checkbox"
                                  className="shrink-0"
                                  checked={videoIncluded}
                                  onChange={(event) =>
                                    setActiveCaption(
                                      settleVideo(activeCaption, testimonial.videoUrl, event.target.checked),
                                    )
                                  }
                                />
                                Incluir el link del video
                              </label>
                            ) : null}
                            {showCaptionNotes ? (
                              <div id={captionNotesId} className="flex min-w-0 flex-wrap items-center gap-2">
                                {mention ? (
                                  <span className="inline-flex max-w-full items-center rounded-md border border-border px-2 py-0.5 text-admin-micro text-muted-foreground">
                                    {mention}
                                  </span>
                                ) : null}
                                {instagramLinks ? (
                                  <span className="text-admin-caption text-muted-foreground">
                                    {instagramLinks}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                          </>
                        }
                        note={
                          videoLine ? (
                            videoIncluded ? (
                              <p className="text-admin-micro text-muted-foreground">
                                Se publica al final, sin editar: {videoLine}
                              </p>
                            ) : (
                              <p className="text-admin-micro text-muted-foreground">El link no se publica.</p>
                            )
                          ) : null
                        }
                      />
                    </div>
                  </div>
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
              allowUnload.current = true;
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
            {otherCaptionProblems.map((problem) => (
              <p key={problem} className="text-admin-caption text-destructive" role="alert">
                {problem}
              </p>
            ))}
            {cardError ? (
              <p className="text-admin-caption text-destructive" role="alert">
                {cardError}
              </p>
            ) : null}
            {cardError ? (
              <button
                type="button"
                disabled={pending || preparingCard || quoteInvalid || captionInvalid}
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
              disabled={pending || preparingCard || quoteInvalid || captionInvalid}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              onClick={() => setIntent("save")}
            >
              {pending && intent === "save" ? "Guardando…" : "Guardar borrador"}
            </button>
            <button
              type="button"
              disabled={pending || preparingCard || quoteInvalid || captionInvalid}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
              onClick={() => setConfirmPublish(true)}
            >
              {(pending && intent === "publish") || cardAttempt === "publish"
                ? "Publicando…"
                : "Publicar"}
            </button>
          </div>
        </div>
      </footer>
      <PublishConfirmDialog
        open={confirmPublish}
        lead={publishLead}
        clipNote={quoteClipped ? "En este diseño la card corta la cita con “…”." : null}
        networks={publishSummaries}
        onCancel={() => setConfirmPublish(false)}
        onConfirm={() => {
          setConfirmPublish(false);
          setIntent("publish");
          void publishWithCard("publish");
        }}
      />
    </form>
  );
}

function captionProblem(network: CaptionNetwork, text: string, publishes: boolean) {
  const max = CAPTION_MAX_CHARS[network];
  if (text.length > max) {
    return `El texto de ${SHARE_NETWORK_LABELS[network]} puede tener hasta ${max} caracteres.`;
  }
  if (publishes && text.trim().length === 0) {
    return `El texto de ${SHARE_NETWORK_LABELS[network]} no puede estar vacío.`;
  }
  return null;
}

"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Check, ChevronDown, Copy, RotateCcw } from "lucide-react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { reviewTestimonial } from "../actions/testimonialActions";
import { COUNTRY_OPTIONS, isListedCountry, OTHER_COUNTRY_VALUE } from "../infrastructure/countries";
import { INBOX_FILTERS_FIELD } from "../infrastructure/inboxQuery";
import { useInboxFilters } from "./InboxFilters";
import {
  CARD_FIELD_MAX_CHARS,
  CARD_FIELDS_BY_TYPE,
  CARD_NAME_MAX_CHARS,
  cardNameHintLimit,
  readCardInputs,
  sameCardInputs,
  validateCardEdits,
  type CardEdits,
  type CardInputs,
} from "../infrastructure/cardFields";
import { igCardContent } from "../infrastructure/ig-card";
import { igCardPngBlob, igCardQuoteClipped } from "../infrastructure/ig-card-canvas";
import {
  buildDiscordCaption,
  buildIgCaption,
  buildLiCaption,
  CAPTION_MAX_CHARS,
  captionIncludesVideo,
  captionRenameNotice,
  linkedInMention,
  omitVideoLine,
  QUOTE_EDIT_MAX_CHARS,
  rebuildCaptionsForName,
  setCaptionVideo,
  videoCaptionLine,
} from "../infrastructure/quote";
import { initialReviewState } from "../types/reviewState";
import {
  formatNetworkList,
  SHARE_CARD_MAX_BYTES,
  SHARE_CARD_TOO_LARGE_PUBLISH_MESSAGE,
  SHARE_NETWORK_LABELS,
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
import { ModalDialog } from "./ModalDialog";
import {
  PublishConfirmDialog,
  type PublishConfirmNetwork,
} from "./PublishConfirmDialog";
import { inputClassName, textareaClassName } from "./fields";

type Intent = "save" | "publish" | "reject";

type CaptionSnapshot = {
  quote: string;
  igCaption: string;
  liCaption: string;
  discordCaption: string;
};

function captionHint(network: CaptionNetwork) {
  return `La descripción del post en ${SHARE_NETWORK_LABELS[network]}.`;
}

/** Deja el link completo o lo saca. Un link cortado no se conserva. */
function settleVideo(caption: string, videoUrl: string | null, include: boolean) {
  return setCaptionVideo(caption, videoUrl, include && Boolean(videoUrl));
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
  const [openedCards] = useState(() => readCardInputs(testimonial));
  const [quote, setQuote] = useState(opened.quote);
  const [igCaption, setIgCaption] = useState(opened.igCaption);
  const [liCaption, setLiCaption] = useState(opened.liCaption);
  const [discordCaption, setDiscordCaption] = useState(opened.discordCaption);
  const [fields, setFields] = useState<CardInputs>(openedCards);
  const [cardBaseline, setCardBaseline] = useState<CardInputs>(openedCards);
  const [renameNotice, setRenameNotice] = useState<string | null>(null);
  const [captionNetwork, setCaptionNetwork] = useRememberedCaptionNetwork(testimonial.id);
  const captionPanelId = useId();
  const captionNotesId = useId();
  const [cardDesign, setCardDesign] = useState<CardDesign>("photo");
  const [intent, setIntent] = useState<Intent | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardAttempt, setCardAttempt] = useState<"publish" | "retry" | null>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const rejectLock = useRef(false);
  const rejectSawPending = useRef(false);
  const formId = `admin-review-form-${testimonial.id}`;
  const [copied, setCopied] = useState(false);
  const [baseline, setBaseline] = useState<CaptionSnapshot>(opened);
  const [appliedSave, setAppliedSave] = useState(initialReviewState);
  const formRef = useRef<HTMLFormElement>(null);
  const appliedNameRef = useRef(testimonial.fullName.trim());
  const captionsRef = useRef({ igCaption: opened.igCaption, liCaption: opened.liCaption, discordCaption: opened.discordCaption });
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
  const cardEdits = useMemo<CardEdits>(() => ({ ...fields, quote }), [fields, quote]);
  const cardValidation = validateCardEdits(testimonial.type, cardEdits);
  const cardInvalid = !cardValidation.ok;
  const cardMessages = cardValidation.ok ? [] : cardValidation.messages;
  const previewCard = useMemo(
    () => igCardContent(testimonial, quote, cardDesign, cardEdits),
    [cardDesign, cardEdits, quote, testimonial],
  );
  const quoteClipped = useMemo(() => {
    if (!canMeasureCard || quoteEmpty) return false;
    return igCardQuoteClipped(
      previewCard,
      getComputedStyle(document.body).fontFamily || "sans-serif",
    );
  }, [canMeasureCard, previewCard, quoteEmpty]);
  const templates = useMemo(
    () => ({
      instagram: buildIgCaption({
        fullName: fields.fullName,
        instagram: testimonial.instagram,
        type: testimonial.type,
      }),
      linkedin: buildLiCaption({
        fullName: fields.fullName,
        linkedin: testimonial.linkedin,
        type: testimonial.type,
        videoUrl: testimonial.videoUrl,
      }),
      discord: buildDiscordCaption({
        fullName: fields.fullName,
        type: testimonial.type,
        videoUrl: testimonial.videoUrl,
      }),
    }),
    [
      fields.fullName,
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
    setCardBaseline(fields);
  }
  const activeCaption = captions[captionNetwork];
  const activeMax = CAPTION_MAX_CHARS[captionNetwork];
  const activeEmpty = channels[captionNetwork] && activeCaption.trim().length === 0;
  const tabNotes: Partial<Record<CaptionNetwork, CaptionTabNote>> = {};
  for (const network of CAPTION_NETWORKS) {
    tabNotes[network] = {
      publishes: channels[network],
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
    !sameCardInputs(fields, cardBaseline) ||
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
  const configuredNetworks = CAPTION_NETWORKS.filter((network) => channels[network]);
  const publishLead =
    configuredNetworks.length > 0
      ? [
          `Sale en la galería y en ${formatNetworkList(configuredNetworks)}.`,
          "La imagen es la misma. Abajo, la descripción de cada red.",
        ]
      : ["Sale en la galería."];
  const publishNetworks: PublishConfirmNetwork[] = CAPTION_NETWORKS.map((network) => {
    const label = SHARE_NETWORK_LABELS[network];
    if (!channels[network]) {
      return { label, publishes: false };
    }
    return {
      label,
      publishes: true,
      caption: captions[network],
    };
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

  const applyNameToCaptions = useCallback((nextNameRaw: string) => {
    const nextName = nextNameRaw.trim();
    const oldName = appliedNameRef.current.trim();
    const current = captionsRef.current;
    const currentCaptions = {
      instagram: current.igCaption,
      linkedin: current.liCaption,
      discord: current.discordCaption,
    };
    if (!nextName || nextName === oldName) {
      return currentCaptions;
    }
    const result = rebuildCaptionsForName({
      oldName,
      newName: nextName,
      captions: currentCaptions,
      handles: {
        instagram: testimonial.instagram,
        linkedin: testimonial.linkedin,
      },
      type: testimonial.type,
      videoUrl: testimonial.videoUrl,
    });
    captionsRef.current = {
      igCaption: result.captions.instagram,
      liCaption: result.captions.linkedin,
      discordCaption: result.captions.discord,
    };
    appliedNameRef.current = nextName;
    setIgCaption(result.captions.instagram);
    setLiCaption(result.captions.linkedin);
    setDiscordCaption(result.captions.discord);
    if (result.changed) {
      setRenameNotice(captionRenameNotice(result.updated));
    }
    return result.captions;
  }, [testimonial.instagram, testimonial.linkedin, testimonial.type, testimonial.videoUrl]);

  useEffect(() => {
    captionsRef.current = { igCaption, liCaption, discordCaption };
  }, [igCaption, liCaption, discordCaption]);

  useEffect(() => {
    const nextName = fields.fullName.trim();
    if (!nextName || nextName === appliedNameRef.current.trim()) {
      return;
    }
    const timeout = window.setTimeout(() => {
      applyNameToCaptions(fields.fullName);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [applyNameToCaptions, fields.fullName]);

  if (pending && intent === "reject") {
    rejectSawPending.current = true;
  } else if (!pending && rejectSawPending.current) {
    rejectSawPending.current = false;
    rejectLock.current = false;
    if (rejecting) {
      setRejecting(false);
    }
  }

  function submitReject(form: HTMLFormElement) {
    if (rejectLock.current || rejecting || pending || preparingCard) {
      return;
    }
    rejectLock.current = true;
    allowUnload.current = true;
    setIntent("reject");
    setRejecting(true);
    const formData = new FormData(form);
    formData.set("intent", "reject");
    startTransition(() => {
      formAction(formData);
    });
  }

  function closeRejectDialog() {
    if (rejectLock.current || rejecting || (pending && intent === "reject")) {
      return;
    }
    setConfirmReject(false);
  }

  async function publishWithCard(attempt: "publish" | "retry") {
    const form = formRef.current;
    if (!form || preparingCardRef.current) {
      return;
    }
    preparingCardRef.current = true;
    const captionsNow = applyNameToCaptions(fields.fullName);
    const formData = new FormData(form);
    formData.set("intent", "publish");
    formData.set("quote", quote);
    formData.set("ig_caption", captionsNow.instagram);
    formData.set("li_caption", captionsNow.linkedin);
    formData.set("discord_caption", captionsNow.discord);
    setIntent("publish");
    setCardAttempt(attempt);
    let blob: Blob | null = null;
    try {
      blob = await igCardPngBlob(previewCard);
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
      id={formId}
      ref={formRef}
      action={formAction}
      onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        const value = submitter instanceof HTMLButtonElement ? submitter.value : "";
        if (value === "reject") {
          event.preventDefault();
          submitReject(event.currentTarget);
          return;
        }
        event.preventDefault();
        const captionsNow = applyNameToCaptions(fields.fullName);
        if (value !== "publish") {
          const formData = new FormData(event.currentTarget);
          formData.set("intent", value);
          formData.set("quote", quote);
          formData.set("ig_caption", captionsNow.instagram);
          formData.set("li_caption", captionsNow.linkedin);
          formData.set("discord_caption", captionsNow.discord);
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
        <DetailHeader
          testimonial={{ ...testimonial, fullName: fields.fullName.trim() || testimonial.fullName }}
        />

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
                  <IgShare mode="preview" slug={testimonial.slug} {...previewCard} />
                  <figcaption className="text-admin-micro text-muted-foreground">
                    Imagen 1080×1350. Se genera al publicar.
                  </figcaption>
                </figure>
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <section aria-labelledby="admin-card-data-title" className="flex flex-col gap-3">
                  <header className="flex flex-col gap-1">
                    <h3 id="admin-card-data-title" className="text-admin-body font-semibold text-foreground">
                      Datos de la card
                    </h3>
                    <p className="text-admin-micro text-muted-foreground">
                      Se leen en la imagen. El tipo no se edita.
                    </p>
                  </header>
                  <div>
                    <p className="text-admin-caption text-foreground">Tipo</p>
                    <p className="mt-1 text-admin-caption font-medium text-foreground">
                      {testimonial.typeLabel}
                    </p>
                  </div>
                  {fields.fullName.trim().length > cardNameHintLimit(cardDesign) ? (
                    <p id="admin-name-long" className="text-admin-caption text-tone-warning" role="status">
                      Este nombre es un poco largo. En la card se lee mejor si usas iniciales.
                    </p>
                  ) : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <CardTextField
                      label="Nombre"
                      name="full_name"
                      value={fields.fullName}
                      maxLength={CARD_NAME_MAX_CHARS}
                      error={cardValidation.ok ? undefined : cardValidation.errors.fullName}
                      describedBy={
                        fields.fullName.trim().length > cardNameHintLimit(cardDesign)
                          ? "admin-name-long"
                          : undefined
                      }
                      autoComplete="name"
                      onChange={(value) => {
                        setFields((current) => ({ ...current, fullName: value }));
                        setRenameNotice(null);
                      }}
                      onBlur={(value) => {
                        applyNameToCaptions(value);
                      }}
                    />
                    <CountryField
                      value={fields.country}
                      error={cardValidation.ok ? undefined : cardValidation.errors.country}
                      onChange={(value) => setFields((current) => ({ ...current, country: value }))}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {CARD_FIELDS_BY_TYPE[testimonial.type].map((field) => (
                      <CardTextField
                        key={field.key}
                        label={field.label}
                        name={field.key}
                        value={fields[field.key]}
                        maxLength={CARD_FIELD_MAX_CHARS}
                        error={cardValidation.ok ? undefined : cardValidation.errors[field.key]}
                        onChange={(value) => {
                          setFields((current) => ({ ...current, [field.key]: value }));
                        }}
                      />
                    ))}
                  </div>
                  {renameNotice ? (
                    <p className="text-admin-caption text-muted-foreground" role="status">
                      {renameNotice}
                    </p>
                  ) : null}
                </section>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="admin-quote" className="min-w-0 text-admin-caption text-foreground">
                      Cita de la historia
                    </label>
                    <p
                      className={`${quoteEmpty ? "text-admin-caption" : "text-admin-micro"} shrink-0 ${
                        quoteInvalid ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {quoteEmpty
                        ? "No puede estar vacía"
                        : `${quote.length}/${QUOTE_EDIT_MAX_CHARS}${quoteTooLong ? " · Acortala" : ""}`}
                    </p>
                  </div>
                  <p id="admin-quote-hint" className="text-admin-micro text-muted-foreground">
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
                    className={textareaClassName}
                    onChange={(event) => onQuoteChange(event.target.value)}
                  />
                </div>

                <div className="flex min-w-0 flex-col gap-2">
                  <h3 className="text-admin-body font-semibold text-foreground">Descripción del post</h3>
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
                        label="Descripción del post"
                        hint={captionHint(captionNetwork)}
                        value={captionBody}
                        countedText={activeCaption}
                        maxChars={activeMax}
                        emptyInvalid={activeEmpty}
                        emptyMessage="No puede estar vacía"
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
                              aria-label={copied ? "Descripción copiada" : "Copiar descripción"}
                              title={copied ? "Descripción copiada" : "Copiar descripción"}
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
                                  <span className="text-admin-micro text-muted-foreground">
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
            type="button"
            disabled={pending || preparingCard || rejecting}
            className={cn(buttonVariants({ variant: "destructive", size: "lg" }))}
            aria-haspopup="dialog"
            aria-expanded={confirmReject}
            onClick={() => setConfirmReject(true)}
          >
            {rejecting || (pending && intent === "reject") ? "Rechazando…" : "Rechazar"}
          </button>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            {state.status === "saved" ? (
              <p className="text-admin-caption text-tone-success" role="status">
                Cambios guardados. Todavía no está publicado.
              </p>
            ) : null}
            {state.status === "error" && !(confirmReject && intent === "reject") ? (
              <p className="text-admin-caption text-destructive" role="alert">
                {state.message}
              </p>
            ) : null}
            {cardMessages.map((problem) => (
              <p key={problem} className="text-admin-caption text-destructive" role="alert">
                {problem}
              </p>
            ))}
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
                disabled={pending || preparingCard || quoteInvalid || captionInvalid || cardInvalid}
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
              disabled={pending || preparingCard || quoteInvalid || captionInvalid || cardInvalid}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              onClick={() => setIntent("save")}
            >
              {pending && intent === "save" ? "Guardando…" : "Guardar borrador"}
            </button>
            <button
              type="button"
              disabled={pending || preparingCard || quoteInvalid || captionInvalid || cardInvalid}
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
        clipNote={quoteClipped ? "En la imagen, la cita se corta con “…”." : null}
        networks={publishNetworks}
        onCancel={() => setConfirmPublish(false)}
        onConfirm={() => {
          setConfirmPublish(false);
          setIntent("publish");
          void publishWithCard("publish");
        }}
      />
      <RejectConfirmDialog
        open={confirmReject}
        formId={formId}
        pending={pending || preparingCard || rejecting}
        submitting={rejecting || (pending && intent === "reject")}
        error={intent === "reject" && state.status === "error" ? state.message : null}
        onCancel={closeRejectDialog}
        onFallbackSubmit={submitReject}
      />
    </form>
  );
}

function RejectConfirmDialog({
  open,
  formId,
  pending,
  submitting,
  error,
  onCancel,
  onFallbackSubmit,
}: {
  open: boolean;
  formId: string;
  pending: boolean;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onFallbackSubmit: (form: HTMLFormElement) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const errorId = useId();

  return (
    <ModalDialog open={open} onClose={onCancel} titleId={titleId} descriptionId={descriptionId}>
      <div className="flex flex-col gap-2">
        <h2 id={titleId} className="text-admin-heading font-semibold text-foreground">
          ¿Rechazar este testimonio?
        </h2>
        <p id={descriptionId} className="text-admin-caption text-muted-foreground">
          No sale en la galería ni en las redes.
        </p>
      </div>
      {error ? (
        <p id={errorId} className="text-admin-caption text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={pending}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="submit"
          form={formId}
          name="intent"
          value="reject"
          disabled={pending}
          className={cn(buttonVariants({ variant: "destructive", size: "lg" }))}
          onClick={(event) => {
            if (pending) {
              event.preventDefault();
              return;
            }
            const form = document.getElementById(formId);
            if (!(form instanceof HTMLFormElement) || event.currentTarget.form !== form) {
              event.preventDefault();
              if (form instanceof HTMLFormElement) {
                onFallbackSubmit(form);
              }
            }
          }}
        >
          {submitting ? "Rechazando…" : "Rechazar"}
        </button>
      </div>
    </ModalDialog>
  );
}

function captionProblem(network: CaptionNetwork, text: string, publishes: boolean) {
  const max = CAPTION_MAX_CHARS[network];
  if (text.length > max) {
    return `La descripción del post de ${SHARE_NETWORK_LABELS[network]} puede tener hasta ${max} caracteres.`;
  }
  if (publishes && text.trim().length === 0) {
    return `La descripción del post de ${SHARE_NETWORK_LABELS[network]} no puede estar vacía.`;
  }
  return null;
}

function CountryField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const selectId = useId();
  const errorId = `${selectId}-error`;
  const [selection, setSelection] = useState(() =>
    value ? (isListedCountry(value) ? value : OTHER_COUNTRY_VALUE) : "",
  );
  const [custom, setCustom] = useState(() => (value && !isListedCountry(value) ? value : ""));
  const isOther = selection === OTHER_COUNTRY_VALUE;
  const selectInvalid = Boolean(error) && !isOther;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <input type="hidden" name="country" value={value} />
      <div className="flex min-w-0 flex-col gap-2">
        <label htmlFor={selectId} className="min-w-0 text-admin-caption text-foreground">
          País
        </label>
        <div className="relative">
          <select
            id={selectId}
            value={selection}
            autoComplete="country-name"
            aria-invalid={selectInvalid || undefined}
            aria-describedby={selectInvalid ? errorId : undefined}
            className={`${inputClassName} cursor-pointer appearance-none pr-9 ${
              selection ? "" : "text-muted-foreground"
            }`}
            onChange={(event) => {
              const next = event.target.value;
              setSelection(next);
              onChange(next === OTHER_COUNTRY_VALUE ? custom : next);
            }}
          >
            <option value="">Seleccioná un país</option>
            {COUNTRY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value={OTHER_COUNTRY_VALUE}>Otro país</option>
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
        {selectInvalid ? (
          <p id={errorId} className="text-admin-caption text-destructive">
            {error}
          </p>
        ) : null}
      </div>
      {isOther ? (
        <CardTextField
          label="Especificá el país"
          value={custom}
          maxLength={CARD_FIELD_MAX_CHARS}
          error={error}
          autoComplete="country-name"
          onChange={(next) => {
            setCustom(next);
            onChange(next);
          }}
        />
      ) : null}
    </div>
  );
}

function CardTextField({
  label,
  name,
  value,
  maxLength,
  error,
  describedBy,
  autoComplete,
  onChange,
  onBlur,
}: {
  label: string;
  name?: string;
  value: string;
  maxLength: number;
  error?: string;
  describedBy?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const countId = `${id}-count`;
  const invalid = Boolean(error);
  const describedByIds = [describedBy, countId, invalid ? errorId : null].filter(Boolean).join(" ");
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="min-w-0 text-admin-caption text-foreground">
          {label}
        </label>
        <p
          id={countId}
          className={`shrink-0 text-admin-micro ${
            invalid ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {value.length}/{maxLength}
        </p>
      </div>
      <input
        id={id}
        name={name}
        type="text"
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={describedByIds}
        className={inputClassName}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur ? (event) => onBlur(event.currentTarget.value) : undefined}
      />
      {error ? (
        <p id={errorId} className="text-admin-caption text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

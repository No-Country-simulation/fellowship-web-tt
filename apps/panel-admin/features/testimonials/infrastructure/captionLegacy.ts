import type { TestimonialType } from "../types/testimonial";
import {
  buildShareCaption,
  currentCaptionIntros,
  defaultCaptionIntro,
  linkedInMention,
  nameVideoLine,
  normalizeCaption,
  omitVideoLine,
  stripWrappingQuotes,
  withVideoLine,
} from "./captionTemplates";

/**
 * Intros que el formulario o un panel anterior usaron y ya no están en
 * `CAPTION_INTROS`. Las vigentes se suman acá, no se copian a mano.
 */
const HISTORICAL_CAPTION_INTROS = [
  "Talento de No Country 👇",
  "Desde No Country compartimos esta historia de nuestro talento:",
  "Desde No Country compartimos esta historia de nuestro talento",
  "Desde No Country compartimos esta historia de nuestro talento en Instagram",
  "Desde No Country compartimos esta historia de nuestro talento en LinkedIn",
  "Desde No Country compartimos esta historia de nuestro talento en Discord",
  "Una imagen, una historia y alguien de nuestro talento detrás.",
  "Compartimos el recorrido profesional de alguien de nuestro talento.",
  "Comunidad, les dejamos otra historia de No Country.",
  "Una simulación, una imagen y alguien de nuestro talento detrás.",
  "Compartimos el recorrido de alguien que pasó por una simulación laboral.",
  "Comunidad, les dejamos una historia de simulación.",
  "Un primer empleo, una imagen y alguien de nuestro talento detrás.",
  "Compartimos el recorrido de alguien que consiguió su primer empleo.",
  "Comunidad, les dejamos una historia de primer empleo.",
  "Una reconversión, una imagen y alguien de nuestro talento detrás.",
  "Compartimos el recorrido de alguien que se reconvirtió.",
  "Comunidad, les dejamos una historia de reconversión.",
] as const;

const KNOWN_DEFAULT_INTROS = new Set<string>([
  ...HISTORICAL_CAPTION_INTROS,
  ...currentCaptionIntros(),
]);

type CaptionSource = {
  fullName: string;
  type: TestimonialType;
  instagram: string | null;
  linkedin: string | null;
  quote: string;
  igCaption: string;
  liCaption: string;
  discordCaption: string;
  videoUrl?: string | null;
};

type OmitQuotedOptions = {
  quote?: string | null;
  fullName?: string;
  handleSets?: (string | null | undefined)[][];
};

const QUOTED_BLOCK = /^([\s\S]*?)\n\n["“«]([^\n]*)["”»]\n\n/;

/**
 * Texto de cada tab al abrir la ficha.
 * Cada red usa su intro. Si el texto está vacío, es copia de otra red o sigue
 * la plantilla con la intro genérica, arranca con la plantilla de esa red.
 * Un texto viejo con las dos redes (`@ig` y el perfil de LinkedIn) también.
 * Discord, si sigue la plantilla, no lleva hashtags.
 * La plantilla nueva de LinkedIn y Discord trae el link del video en el texto.
 * Si esa descripción ya está guardada sin el link, no se vuelve a poner.
 * Instagram no lleva el link. Un texto editado a mano, que no sigue la plantilla, queda.
 */
export function reviewCaptions(input: CaptionSource): {
  igCaption: string;
  liCaption: string;
  discordCaption: string;
} {
  const context = omitContext(input);
  const ig = normalizeCaption(input.igCaption);
  const li = normalizeCaption(input.liCaption);
  const discord = normalizeCaption(input.discordCaption);
  const shared = !li || li === ig;
  const liProfileUrl = usesLinkedInProfileUrl(input, li, context);
  const defaultTemplate = (stored: string) => isDefaultTemplate(stored, input, context);
  const currentDiscord = buildShareCaption({
    intro: defaultCaptionIntro("discord", input.type),
    fullName: input.fullName,
    hashtags: false,
  });
  const discordAlreadyCurrent =
    omitVideoLine(omitQuotedCaption(discord, context)) === currentDiscord;

  return {
    igCaption: resolveCaption({
      stored: ig,
      replace: shared && defaultTemplate(ig),
      fullName: input.fullName,
      handles: [input.instagram],
      networkIntro: defaultCaptionIntro("instagram", input.type),
      context,
    }).text,
    liCaption: applyDefaultVideo(
      resolveCaption({
        stored: li,
        replace: (shared && defaultTemplate(li)) || liProfileUrl,
        force: liProfileUrl,
        fullName: input.fullName,
        handles: [linkedInMention(input.linkedin)],
        networkIntro: defaultCaptionIntro("linkedin", input.type),
        context,
      }),
      input.videoUrl,
    ),
    discordCaption: applyDefaultVideo(
      resolveCaption({
        stored: discord,
        replace: defaultTemplate(discord) && !discordAlreadyCurrent,
        fullName: input.fullName,
        handles: [],
        networkIntro: defaultCaptionIntro("discord", input.type),
        hashtags: false,
        context,
      }),
      input.videoUrl,
    ),
  };
}

/**
 * Saca la cita de un párrafo entre comillas solo si ese párrafo es el quote
 * guardado, o si el texto sigue la plantilla vieja (intro conocida + cita +
 * nombre y redes). Un texto editado a mano conserva sus comillas.
 */
export function omitQuotedCaption(caption: string, options?: OmitQuotedOptions): string {
  const text = normalizeCaption(caption);
  const match = text.match(QUOTED_BLOCK);
  if (!match) {
    return text;
  }
  const intro = match[1] ?? "";
  const inner = (match[2] ?? "").trim();
  const rest = text.slice(match[0].length);
  if (!shouldOmitQuotedBlock(intro, inner, rest, options)) {
    return text;
  }
  return `${intro}\n\n${rest}`.trim();
}

const SHARE_CAPTION_QUOTE = /^([\s\S]*?)\n\n["“]/;

/** Recupera el intro si el caption sigue el template (antes del quote). */
export function extractCaptionIntro(caption: string): string | null {
  const match = normalizeCaption(caption).match(SHARE_CAPTION_QUOTE);
  const intro = match?.[1]?.trim();
  if (!intro || KNOWN_DEFAULT_INTROS.has(intro)) {
    return null;
  }
  return intro;
}

/** True si el caption sigue intro + quote entre comillas. Los libres no. */
export function followsShareCaptionTemplate(caption: string): boolean {
  return SHARE_CAPTION_QUOTE.test(normalizeCaption(caption));
}

function omitContext(input: CaptionSource): OmitQuotedOptions {
  return {
    quote: input.quote,
    fullName: input.fullName,
    handleSets: legacyHandleSets(input),
  };
}

/** Una red, o las dos juntas: el panel anterior guardaba `@ig` y LinkedIn en el mismo texto. */
function legacyHandleSets(input: CaptionSource): (string | null | undefined)[][] {
  const mention = linkedInMention(input.linkedin);
  return [
    [input.instagram],
    [mention],
    [input.linkedin],
    [input.instagram, mention],
    [input.instagram, input.linkedin],
    [],
  ];
}

function shouldOmitQuotedBlock(
  intro: string,
  inner: string,
  rest: string,
  options: OmitQuotedOptions | undefined,
): boolean {
  if (!options) {
    return false;
  }
  const saved = options.quote?.trim();
  if (saved && stripWrappingQuotes(inner) === stripWrappingQuotes(saved)) {
    return true;
  }
  const knownIntro = intro.trim();
  if (!KNOWN_DEFAULT_INTROS.has(knownIntro) || !options.fullName) {
    return false;
  }
  return (options.handleSets ?? []).some(
    (handles) =>
      rest === templateRest(options.fullName ?? "", handles, true) ||
      rest === templateRest(options.fullName ?? "", handles, false),
  );
}

function isDefaultTemplate(stored: string, input: CaptionSource, context: OmitQuotedOptions) {
  const text = omitVideoLine(omitQuotedCaption(stored, context));
  const parts = captionParts(text);
  if (!parts || !KNOWN_DEFAULT_INTROS.has(parts.intro)) {
    return false;
  }
  return legacyHandleSets(input).some(
    (handles) => parts.rest === templateRest(input.fullName, handles),
  );
}

/** Plantilla vieja de LinkedIn: el renglón de la red es el link, solo o debajo de `@ig`. */
function usesLinkedInProfileUrl(input: CaptionSource, stored: string, context: OmitQuotedOptions) {
  const text = omitVideoLine(omitQuotedCaption(stored, context));
  if (!text) {
    return false;
  }
  const intro = captionParts(text)?.intro || defaultCaptionIntro("linkedin", input.type);
  const handleSets: (string | null | undefined)[][] = [[input.linkedin]];
  if (input.linkedin?.trim()) {
    handleSets.push([input.instagram, input.linkedin]);
  }
  return handleSets.some(
    (handles) =>
      text ===
      buildShareCaption({
        intro,
        fullName: input.fullName,
        handles,
      }),
  );
}

function resolveCaption(options: {
  stored: string;
  replace: boolean;
  force?: boolean;
  fullName: string;
  handles: (string | null | undefined)[];
  networkIntro: string;
  hashtags?: boolean;
  context: OmitQuotedOptions;
}): { text: string; rebuilt: boolean } {
  const hashtags = options.hashtags !== false;
  const raw = omitQuotedCaption(options.stored, options.context);
  const text = omitVideoLine(raw);
  const parts = captionParts(text);
  const onTemplate = Boolean(
    parts && parts.rest === templateRest(options.fullName, options.handles, hashtags),
  );
  const customIntro =
    parts && !KNOWN_DEFAULT_INTROS.has(parts.intro) ? parts.intro : undefined;
  const rebuild = !text || options.force || options.replace;

  if (rebuild) {
    return {
      text: buildShareCaption({
        intro: customIntro || options.networkIntro,
        fullName: options.fullName,
        handles: options.handles,
        hashtags,
      }),
      rebuilt: true,
    };
  }

  if (
    onTemplate &&
    parts &&
    KNOWN_DEFAULT_INTROS.has(parts.intro) &&
    parts.intro !== options.networkIntro
  ) {
    return {
      text: buildShareCaption({
        intro: options.networkIntro,
        fullName: options.fullName,
        handles: options.handles,
        hashtags,
      }),
      rebuilt: true,
    };
  }

  return { text: raw, rebuilt: false };
}

/** La plantilla nueva trae el link. Un texto ya guardado conserva si el link está o no. */
function applyDefaultVideo(
  resolved: { text: string; rebuilt: boolean },
  videoUrl: string | null | undefined,
) {
  if (!resolved.rebuilt) {
    return nameVideoLine(resolved.text);
  }
  return withVideoLine(resolved.text, videoUrl);
}

function captionParts(caption: string): { intro: string; rest: string } | null {
  const text = normalizeCaption(caption);
  const index = text.indexOf("\n\n");
  if (index <= 0) {
    return null;
  }
  return { intro: text.slice(0, index).trim(), rest: text.slice(index + 2) };
}

function templateRest(
  fullName: string,
  handles: (string | null | undefined)[],
  hashtags = true,
) {
  const built = buildShareCaption({ intro: "intro", fullName, handles, hashtags });
  return built.slice(built.indexOf("\n\n") + 2);
}

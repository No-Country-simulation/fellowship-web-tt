export const QUOTE_MIN_CHARS = 80;
export const QUOTE_MAX_CHARS = 200;
export const QUOTE_EDIT_MAX_CHARS = 200;
export const CAPTION_EDIT_MAX_CHARS = 2000;

export const IG_HASHTAGS = [
  "#NoCountry",
  "#DemoDay",
  "#TalentoIT",
] as const;

export const DEFAULT_POST_INTRO =
  "Desde No Country compartimos esta historia de nuestro talento";

const LEGACY_DEFAULT_INTROS = new Set([
  "Talento de No Country 👇",
  "Desde No Country compartimos esta historia de nuestro talento:",
]);

export function stripWrappingQuotes(value: string): string {
  return value.replace(/^["“«]+|[»"”]+$/g, "").trim();
}

/** Quote siempre entre comillas, sin duplicarlas. */
export function formatQuotedQuote(quote: string): string {
  const text = stripWrappingQuotes(quote.trim());
  return text ? `"${text}"` : "";
}

/** Primera o dos primeras frases, sin pasar de QUOTE_MAX_CHARS. */
export function excerptQuote(story: string): string {
  const text = story.trim().replace(/\s+/g, " ");
  if (!text) {
    return "";
  }

  const twoSentences = firstSentences(text, 2);
  if (twoSentences.length <= QUOTE_MAX_CHARS) {
    return twoSentences;
  }

  const oneSentence = firstSentences(text, 1);
  if (oneSentence.length >= QUOTE_MIN_CHARS && oneSentence.length <= QUOTE_MAX_CHARS) {
    return oneSentence;
  }

  return cutAtBoundary(text, QUOTE_MIN_CHARS, QUOTE_MAX_CHARS);
}

/** intro + quote + nombre + redes (una por línea) + hashtags. */
export function buildShareCaption(input: {
  intro: string;
  quote: string;
  fullName: string;
  handles?: (string | null | undefined)[];
}): string {
  const lines = [
    input.intro.trim(),
    "",
    formatQuotedQuote(input.quote),
    "",
    input.fullName.trim(),
  ];
  for (const handle of input.handles ?? []) {
    const value = handle?.trim();
    if (value) {
      lines.push(value);
    }
  }
  lines.push("", IG_HASHTAGS.join(" "));
  return lines.join("\n");
}

/** Texto único del post: el mismo sale en Discord, Instagram y LinkedIn, con las dos redes de la persona. */
export function buildPostCaption(input: {
  quote: string;
  fullName: string;
  instagram: string | null;
  linkedin: string | null;
  intro?: string;
}): string {
  return buildShareCaption({
    intro: input.intro?.trim() || DEFAULT_POST_INTRO,
    quote: input.quote,
    fullName: input.fullName,
    handles: [input.instagram, input.linkedin],
  });
}

const SHARE_CAPTION_QUOTE = /^([\s\S]*?)\n\n["“]/;

/** Recupera el intro si el caption sigue el template (antes del quote). */
export function extractCaptionIntro(caption: string): string | null {
  const match = caption.match(SHARE_CAPTION_QUOTE);
  const intro = match?.[1]?.trim();
  if (!intro || LEGACY_DEFAULT_INTROS.has(intro)) {
    return null;
  }
  return intro;
}

/** True si el caption sigue intro + quote entre comillas. Los libres no. */
export function followsShareCaptionTemplate(caption: string): boolean {
  return SHARE_CAPTION_QUOTE.test(caption);
}

function firstSentences(text: string, count: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) ?? [text];
  return sentences
    .slice(0, count)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .join(" ");
}

function cutAtBoundary(text: string, min: number, max: number): string {
  const window = text.slice(0, max);
  const sentenceEnd = lastIndexOfAny(window, [". ", "! ", "? "], min - 1);

  if (sentenceEnd >= min - 1) {
    return window.slice(0, sentenceEnd + 1).trim();
  }

  const punctuation = lastIndexOfAny(window, [".", "!", "?"], min - 1);
  if (punctuation >= min - 1) {
    return window.slice(0, punctuation + 1).trim();
  }

  const words = text.slice(0, max - 1);
  const space = words.lastIndexOf(" ");
  const cut = (space > 0 ? words.slice(0, space) : words).replace(/[\s,;:]+$/, "");
  return `${cut}…`;
}

function lastIndexOfAny(
  value: string,
  needles: string[],
  afterInclusive: number,
): number {
  let best = -1;
  for (const needle of needles) {
    const index = value.lastIndexOf(needle);
    if (index >= afterInclusive && index > best) {
      best = index;
    }
  }
  return best;
}

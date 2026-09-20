export const QUOTE_MIN_CHARS = 200;
export const QUOTE_MAX_CHARS = 240;
export const QUOTE_EDIT_MAX_CHARS = 400;
export const CAPTION_EDIT_MAX_CHARS = 2000;

export const IG_HASHTAGS = [
  "#NoCountry",
  "#DemoDay",
  "#TalentoIT",
] as const;

export const DEFAULT_POST_INTRO =
  "Desde No Country compartimos esta historia de nuestro talento";
export const DEFAULT_IG_INTRO = DEFAULT_POST_INTRO;
export const DEFAULT_DISCORD_INTRO = DEFAULT_POST_INTRO;
export const DEFAULT_LI_INTRO = DEFAULT_POST_INTRO;

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

export function buildDiscordDescription(quote: string): string {
  const quoted = formatQuotedQuote(quote);
  return [DEFAULT_POST_INTRO, quoted].filter(Boolean).join("\n\n");
}

export function excerptQuote(story: string): string {
  const text = story.trim().replace(/\s+/g, " ");
  if (!text) {
    return "";
  }
  if (text.length <= QUOTE_MAX_CHARS) {
    return text;
  }

  const twoSentences = firstSentences(text, 2);
  if (twoSentences && twoSentences.length <= QUOTE_MAX_CHARS) {
    return twoSentences;
  }

  return cutAtBoundary(text, QUOTE_MIN_CHARS, QUOTE_MAX_CHARS);
}

/** intro + quote + nombre + red + hashtags. */
export function buildShareCaption(input: {
  intro: string;
  quote: string;
  fullName: string;
  handle?: string | null;
}): string {
  const lines = [
    input.intro.trim(),
    "",
    formatQuotedQuote(input.quote),
    "",
    input.fullName.trim(),
  ];
  const handle = input.handle?.trim();
  if (handle) {
    lines.push(handle);
  }
  lines.push("", IG_HASHTAGS.join(" "));
  return lines.join("\n");
}

export function buildIgCaption(input: {
  quote: string;
  fullName: string;
  instagram: string | null;
  intro?: string;
}): string {
  return buildShareCaption({
    intro: input.intro?.trim() || DEFAULT_POST_INTRO,
    quote: input.quote,
    fullName: input.fullName,
    handle: input.instagram,
  });
}

export function buildLiCaption(input: {
  quote: string;
  fullName: string;
  linkedin?: string | null;
  intro?: string;
}): string {
  return buildShareCaption({
    intro: input.intro?.trim() || DEFAULT_POST_INTRO,
    quote: input.quote,
    fullName: input.fullName,
    handle: input.linkedin,
  });
}

/** Recupera el intro si el caption sigue el template (antes del quote). */
export function extractCaptionIntro(caption: string): string | null {
  const match = caption.match(/^([\s\S]*?)\n\n["“]/);
  const intro = match?.[1]?.trim();
  if (!intro || LEGACY_DEFAULT_INTROS.has(intro)) {
    return null;
  }
  return intro;
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

  const space = window.lastIndexOf(" ");
  if (space > 0) {
    return window.slice(0, space).trim();
  }

  return window.trim();
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

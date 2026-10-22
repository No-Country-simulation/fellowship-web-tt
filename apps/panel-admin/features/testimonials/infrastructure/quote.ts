export const QUOTE_EDIT_MAX_CHARS = 400;
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

/** Intro + frase. Igual que la app pública: Discord no lleva nombre, red ni hashtags. */
export function buildDiscordDescription(quote: string): string {
  const quoted = formatQuotedQuote(quote);
  return [DEFAULT_POST_INTRO, quoted].filter(Boolean).join("\n\n");
}

/** Texto de Instagram y LinkedIn. Si hay las dos, van las dos: es una sola publicación. */
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

export const QUOTE_MIN_CHARS = 200;
export const QUOTE_MAX_CHARS = 240;
export const QUOTE_EDIT_MAX_CHARS = 400;
export const CAPTION_EDIT_MAX_CHARS = 2000;

export const IG_HASHTAGS = [
  "#NoCountry",
  "#DemoDay",
  "#TalentoIT",
] as const;

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

export function buildIgCaption(input: {
  quote: string;
  fullName: string;
  instagram: string | null;
}): string {
  const lines = [`"${input.quote}"`, "", input.fullName];
  if (input.instagram) {
    lines.push(input.instagram);
  }
  lines.push("", IG_HASHTAGS.join(" "));
  return lines.join("\n");
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

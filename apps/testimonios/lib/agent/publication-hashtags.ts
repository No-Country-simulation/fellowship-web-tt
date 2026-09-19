/** Required No Country hashtags (same set as prod captions). */
export const PUBLICATION_HASHTAGS = [
  "#NoCountry",
  "#DemoDay",
  "#TalentoIT",
] as const;

export const PUBLICATION_HASHTAGS_LINE = PUBLICATION_HASHTAGS.join(" ");

/**
 * Strict normalization: strip all hashtags from body, then append exact final block.
 * Final form: `${body}\n\n#NoCountry #DemoDay #TalentoIT`
 */
export function ensurePublicationHashtags(draft: string): string {
  const trimmed = draft.trim();
  const withoutTags = trimmed
    .replace(/#[\p{L}\p{N}_]+/gu, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!withoutTags) {
    return PUBLICATION_HASHTAGS_LINE;
  }

  return `${withoutTags}\n\n${PUBLICATION_HASHTAGS_LINE}`;
}

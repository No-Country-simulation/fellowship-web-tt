import type { Plataforma } from "./types";

/** Injectable port for understand/transcribe + platform draft text. */
export type CopyGenerator = {
  /**
   * Understand / transcribe source material before drafting.
   * Text-only: summarize story. Media path is context only — never rewrite binaries.
   */
  understandAndTranscribe: (input: {
    sourceText: string;
    mediaAssetPath?: string | null;
  }) => Promise<string>;

  /** Produce platform-specific draft copy (text only). */
  draftForPlatform: (input: {
    plataforma: Plataforma;
    understanding: string;
    sourceText: string;
  }) => Promise<string>;
};

/** Platform briefs that force distinct IG vs LinkedIn voice. */
export const PLATFORM_COPY_BRIEFS: Readonly<Record<Plataforma, string>> = {
  instagram:
    "Instagram: tono cercano, líneas cortas, 1–2 emojis máx, CTA suave; sin hashtags excesivos.",
  linkedin:
    "LinkedIn: tono profesional, 2–3 párrafos, aprendizaje / impacto laboral; sin emojis casuales.",
};

/**
 * Domain helper: generate platform copy via injected generator.
 * MUST produce different briefs/paths for instagram vs linkedin.
 */
export async function generatePlatformCopy(
  input: {
    plataforma: Plataforma;
    sourceText: string;
    mediaAssetPath?: string | null;
  },
  generator: CopyGenerator,
): Promise<{ understanding: string; draftCopy: string }> {
  const understanding = await generator.understandAndTranscribe({
    sourceText: input.sourceText,
    mediaAssetPath: input.mediaAssetPath,
  });

  const draftCopy = await generator.draftForPlatform({
    plataforma: input.plataforma,
    understanding,
    sourceText: input.sourceText,
  });

  return { understanding, draftCopy };
}

/** Deterministic fake for tests — distinct IG vs LI without network. */
export function createFakeCopyGenerator(
  overrides?: Partial<CopyGenerator>,
): CopyGenerator {
  return {
    async understandAndTranscribe({ sourceText }) {
      return `understanding:${sourceText.slice(0, 80)}`;
    },
    async draftForPlatform({ plataforma, understanding, sourceText }) {
      const brief = PLATFORM_COPY_BRIEFS[plataforma];
      return `[${plataforma}] ${brief} | ${understanding} | ${sourceText}`;
    },
    ...overrides,
  };
}

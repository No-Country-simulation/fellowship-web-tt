import type { TestimonialType } from "@/lib/testimonials/types";
import {
  validateCopy,
} from "./copy-validator";
import {
  isFidelityLlmEnabled,
  mergeFidelityIssues,
  runFidelityLlmCheck,
} from "./fidelity-llm";
import {
  getNarrativeStrategy,
  narrativeStrategyToPromptBlock,
} from "./narrative-strategy";
import { ensurePublicationHashtags } from "./publication-hashtags";
import {
  parseTestimonialUnderstanding,
  resolveTestimonialType,
  understandingToPromptJson,
  validateUnderstanding,
  type TestimonialUnderstanding,
} from "./understanding";
import type { Plataforma } from "./types";

/** Injectable port for understand/transcribe + platform draft text. */
export type CopyGenerator = {
  /**
   * Understand / extract structured understanding as JSON string (or free text fallback).
   * Media path is context only — never rewrite binaries.
   */
  understandAndTranscribe: (input: {
    sourceText: string;
    mediaAssetPath?: string | null;
    typeHint?: TestimonialType;
  }) => Promise<string>;

  /** Produce platform-specific draft copy (text only). */
  draftForPlatform: (input: {
    plataforma: Plataforma;
    understanding: string;
    sourceText: string;
    testimonialType?: TestimonialType;
    narrativeStrategy?: string;
  }) => Promise<string>;

  /** Optional single-pass repair when validation fails. */
  repairDraft?: (input: {
    draft: string;
    errors: string[];
    sourceText: string;
    understanding: string;
    plataforma: Plataforma;
    testimonialType: TestimonialType;
    narrativeStrategy: string;
  }) => Promise<string>;
};

export {
  PUBLICATION_HASHTAGS,
  PUBLICATION_HASHTAGS_LINE,
  ensurePublicationHashtags,
} from "./publication-hashtags";

/** Platform briefs that force distinct IG vs LinkedIn voice (legacy + prompt glue). */
export const PLATFORM_COPY_BRIEFS: Readonly<Record<Plataforma, string>> = {
  instagram:
    "Instagram: testimonio en PRIMERA PERSONA (yo/me/mi). Tono cercano, líneas cortas, 1–2 emojis máx, CTA suave como la misma persona (ej. 'si estás en la misma, contame'). NUNCA narres en tercera persona ni como marca hablando de alguien. Terminá SIEMPRE con una línea en blanco y exactamente estos hashtags: #NoCountry #DemoDay #TalentoIT (no inventes otros).",
  linkedin:
    "LinkedIn: testimonio en PRIMERA PERSONA (yo/me/mi). Tono profesional, 2–3 párrafos, aprendizaje / impacto laboral; sin emojis casuales. NUNCA tercera persona ni nota de prensa. Terminá SIEMPRE con una línea en blanco y exactamente estos hashtags: #NoCountry #DemoDay #TalentoIT (no inventes otros).",
};

const MAX_REPAIR_ATTEMPTS = 1;

function logCopyStage(payload: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      scope: "agent.copy",
      ...payload,
    }),
  );
}

/**
 * Domain helper: structured understand → strategy → draft → validate → repair → hashtags.
 * MUST produce different briefs/paths for instagram vs linkedin.
 */
export async function generatePlatformCopy(
  input: {
    plataforma: Plataforma;
    sourceText: string;
    mediaAssetPath?: string | null;
    /** Form type when available (preferred over model classification). */
    typeHint?: string | null;
  },
  generator: CopyGenerator,
): Promise<{ understanding: string; draftCopy: string }> {
  const started = Date.now();
  const testimonialType = resolveTestimonialType(input.typeHint);

  const rawUnderstanding = await generator.understandAndTranscribe({
    sourceText: input.sourceText,
    mediaAssetPath: input.mediaAssetPath,
    typeHint: testimonialType,
  });

  let understanding: TestimonialUnderstanding = parseTestimonialUnderstanding(
    rawUnderstanding,
    testimonialType,
  );

  const uCheck = validateUnderstanding(understanding);
  if (!uCheck.ok) {
    understanding = {
      ...understanding,
      summary:
        understanding.summary.trim() ||
        input.sourceText.trim().slice(0, 280) ||
        "(sin resumen)",
    };
  }

  const strategy = getNarrativeStrategy(
    understanding.testimonialType,
    input.plataforma,
  );
  const strategyBlock = narrativeStrategyToPromptBlock(strategy);
  const understandingJson = understandingToPromptJson(understanding);

  let rawDraft = await generator.draftForPlatform({
    plataforma: input.plataforma,
    understanding: understandingJson,
    sourceText: input.sourceText,
    testimonialType: understanding.testimonialType,
    narrativeStrategy: strategyBlock,
  });

  let draftCopy = ensurePublicationHashtags(rawDraft);
  let repairCount = 0;
  let fidelityIssueCount = 0;

  let validation = validateCopy(draftCopy, {
    plataforma: input.plataforma,
    sourceText: input.sourceText,
    understanding,
  });

  // Optional semantic check: code defines issue codes; 2.5-lite fills them.
  if (isFidelityLlmEnabled()) {
    const fidelityIssues = await runFidelityLlmCheck({
      plataforma: input.plataforma,
      sourceText: input.sourceText,
      understandingJson,
      draft: draftCopy,
    });
    fidelityIssueCount = fidelityIssues.length;
    validation = mergeFidelityIssues(validation, fidelityIssues);
  }

  if (
    !validation.valid &&
    generator.repairDraft &&
    repairCount < MAX_REPAIR_ATTEMPTS
  ) {
    repairCount += 1;
    const repaired = await generator.repairDraft({
      draft: draftCopy,
      errors: validation.errors.map((e) => e.message),
      sourceText: input.sourceText,
      understanding: understandingJson,
      plataforma: input.plataforma,
      testimonialType: understanding.testimonialType,
      narrativeStrategy: strategyBlock,
    });
    draftCopy = ensurePublicationHashtags(repaired);
    validation = validateCopy(draftCopy, {
      plataforma: input.plataforma,
      sourceText: input.sourceText,
      understanding,
    });
    if (isFidelityLlmEnabled()) {
      const fidelityIssues = await runFidelityLlmCheck({
        plataforma: input.plataforma,
        sourceText: input.sourceText,
        understandingJson,
        draft: draftCopy,
      });
      fidelityIssueCount += fidelityIssues.length;
      validation = mergeFidelityIssues(validation, fidelityIssues);
    }
  }

  // Always normalize hashtags as last step.
  draftCopy = ensurePublicationHashtags(draftCopy);

  logCopyStage({
    stage: "generatePlatformCopy",
    plataforma: input.plataforma,
    testimonialType: understanding.testimonialType,
    repairCount,
    fidelityLlm: isFidelityLlmEnabled(),
    fidelityIssueCount,
    valid: validation.valid,
    errorCodes: validation.errors.map((e) => e.code),
    warningCodes: validation.warnings.map((e) => e.code),
    durationMs: Date.now() - started,
  });

  return {
    understanding: understandingJson,
    draftCopy,
  };
}

/** Deterministic fake for tests — distinct IG vs LI without network. */
export function createFakeCopyGenerator(
  overrides?: Partial<CopyGenerator>,
): CopyGenerator {
  return {
    async understandAndTranscribe({ sourceText, typeHint }) {
      const type = resolveTestimonialType(typeHint);
      return JSON.stringify({
        testimonialType: type,
        summary: sourceText.slice(0, 120),
        speaker: null,
        experience: [sourceText.slice(0, 80)],
        challenges: [],
        transformation: [],
        learnings: [],
        outcomes: [],
        emotions: [],
        organizations: [],
        technologies: [],
        programs: [],
        dates: [],
        numbers: [],
        directQuotes: [],
        factualClaims: [],
        expectations: [],
        unsupportedOrAmbiguousClaims: [],
      });
    },
    async draftForPlatform({
      plataforma,
      understanding,
      sourceText,
      narrativeStrategy,
    }) {
      const brief = PLATFORM_COPY_BRIEFS[plataforma];
      let summary = understanding;
      try {
        const parsed = JSON.parse(understanding) as { summary?: string };
        if (typeof parsed.summary === "string") summary = parsed.summary;
      } catch {
        // keep raw understanding string
      }
      return `[${plataforma}] ${brief} | ${narrativeStrategy ?? ""} | ${summary} | ${sourceText}`;
    },
    async repairDraft({ draft, errors }) {
      let next = draft.replace(/\p{Extended_Pictographic}/gu, "");
      if (errors.some((e) => /JSON/i.test(e))) {
        // Drop accidental JSON blobs but keep platform-prefixed body when possible.
        next = next.replace(/\{[\s\S]*\}/g, "[understanding]").trim();
        if (!next || looksLikeWholeJson(next)) {
          next = `${draft.split("|")[0]?.trim() || "Borrador"} reparado.`;
        }
      }
      return next;
    },
    ...overrides,
  };
}

function looksLikeWholeJson(text: string): boolean {
  const t = text.trim();
  return (
    (t.startsWith("{") && t.endsWith("}")) ||
    (t.startsWith("[") && t.endsWith("]"))
  );
}

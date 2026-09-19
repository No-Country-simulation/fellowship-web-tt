import {
  isTestimonialType,
  type TestimonialType,
} from "@/lib/testimonials/types";

/** Claim kind for anti-hallucination separation. */
export const CLAIM_KINDS = {
  FACT: "fact",
  EXPECTATION: "expectation",
  INTERPRETATION: "interpretation",
  CONFIRMED_OUTCOME: "confirmed_outcome",
  AMBIGUOUS: "ambiguous",
} as const;

export type ClaimKind = (typeof CLAIM_KINDS)[keyof typeof CLAIM_KINDS];

export type UnderstandingClaim = {
  text: string;
  kind: ClaimKind;
};

/**
 * Structured extraction from a testimonio.
 * Arrays empty when unknown; optional fields null when absent.
 * Must never invent data not present in the source text.
 */
export type TestimonialUnderstanding = {
  testimonialType: TestimonialType;
  summary: string;
  speaker: string | null;
  experience: string[];
  challenges: string[];
  transformation: string[];
  learnings: string[];
  outcomes: string[];
  emotions: string[];
  organizations: string[];
  technologies: string[];
  programs: string[];
  dates: string[];
  numbers: string[];
  directQuotes: string[];
  factualClaims: UnderstandingClaim[];
  expectations: string[];
  unsupportedOrAmbiguousClaims: string[];
};

const STRING_ARRAY_KEYS = [
  "experience",
  "challenges",
  "transformation",
  "learnings",
  "outcomes",
  "emotions",
  "organizations",
  "technologies",
  "programs",
  "dates",
  "numbers",
  "directQuotes",
  "expectations",
  "unsupportedOrAmbiguousClaims",
] as const;

const CLAIM_KIND_SET = new Set<string>(Object.values(CLAIM_KINDS));

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asClaims(value: unknown): UnderstandingClaim[] {
  if (!Array.isArray(value)) return [];
  const out: UnderstandingClaim[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const text = typeof row.text === "string" ? row.text.trim() : "";
    const kind = typeof row.kind === "string" ? row.kind : "";
    if (!text || !CLAIM_KIND_SET.has(kind)) continue;
    out.push({ text, kind: kind as ClaimKind });
  }
  return out;
}

export function emptyUnderstanding(
  testimonialType: TestimonialType,
  summary = "",
): TestimonialUnderstanding {
  return {
    testimonialType,
    summary,
    speaker: null,
    experience: [],
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
  };
}

/**
 * Prefer form type when valid; otherwise default to simulation
 * (same fallback used elsewhere in admin inbox).
 */
export function resolveTestimonialType(
  typeHint?: string | null,
): TestimonialType {
  if (typeHint && isTestimonialType(typeHint)) return typeHint;
  return "simulation";
}

/** Extract first JSON object from a model response (allows markdown fences). */
export function extractJsonObject(raw: string): string | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  return candidate.slice(start, end + 1);
}

export function parseTestimonialUnderstanding(
  raw: string,
  typeHint?: string | null,
): TestimonialUnderstanding {
  const fallbackType = resolveTestimonialType(typeHint);
  const json = extractJsonObject(raw);
  if (!json) {
    return emptyUnderstanding(fallbackType, raw.trim().slice(0, 400));
  }

  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return emptyUnderstanding(fallbackType, raw.trim().slice(0, 400));
  }

  if (!data || typeof data !== "object") {
    return emptyUnderstanding(fallbackType, raw.trim().slice(0, 400));
  }

  const row = data as Record<string, unknown>;
  const parsedType =
    typeof row.testimonialType === "string" &&
    isTestimonialType(row.testimonialType)
      ? row.testimonialType
      : fallbackType;

  const understanding = emptyUnderstanding(parsedType);
  understanding.summary =
    typeof row.summary === "string" ? row.summary.trim() : "";
  understanding.speaker =
    typeof row.speaker === "string" && row.speaker.trim()
      ? row.speaker.trim()
      : null;

  for (const key of STRING_ARRAY_KEYS) {
    understanding[key] = asStringArray(row[key]);
  }
  understanding.factualClaims = asClaims(row.factualClaims);

  // Form type wins when provided.
  if (typeHint && isTestimonialType(typeHint)) {
    understanding.testimonialType = typeHint;
  }

  return understanding;
}

export function validateUnderstanding(
  understanding: TestimonialUnderstanding,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!isTestimonialType(understanding.testimonialType)) {
    errors.push("testimonialType inválido");
  }
  if (!understanding.summary.trim()) {
    errors.push("summary vacío");
  }
  return { ok: errors.length === 0, errors };
}

export function understandingToPromptJson(
  understanding: TestimonialUnderstanding,
): string {
  return JSON.stringify(understanding, null, 2);
}

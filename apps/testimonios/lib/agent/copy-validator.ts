import type { NarrativeStrategy } from "./narrative-strategy";
import {
  PUBLICATION_HASHTAGS,
  PUBLICATION_HASHTAGS_LINE,
} from "./publication-hashtags";
import type { TestimonialUnderstanding } from "./understanding";
import type { Plataforma } from "./types";

export type CopyValidationIssue = {
  code: string;
  message: string;
  severity: "error" | "warning";
};

export type CopyValidationResult = {
  valid: boolean;
  errors: CopyValidationIssue[];
  warnings: CopyValidationIssue[];
};

const FIRST_PERSON_RE =
  /\b(yo|me|mi|mis|conmigo|estuve|empec[eé]|pas[eé]|aprend[ií]|entr[eé]|consegu[ií]|viv[ií]|trabaj[eé]|sent[ií]|busco|sigo)\b/iu;
const THIRD_PERSON_NARRATOR_RE =
  /\b(?:él|ella)\s+(?:consiguió|vivió|aprendió|entró|trabajó|pasó)\b|\bsu (?:experiencia|historia|testimonio)\b|\besta persona\b|\bel talento\b/iu;
const IMPERSONAL_OPENER_RE =
  /^(entrar al|buscar|conseguir|trabajar en|el mundo (it|de)|muchas personas|es común)\b/iu;
/** Brand/community-manager CTAs that break testimonio voice. */
const BRAND_CTA_RE =
  /\b(te leo(?:\s+en\s+(?:los\s+)?comentarios)?|dej[aá]nos?(?:\s+tu|\s+un)?|seguinos|etiquet[aá]nos|¿estás buscando)\b/iu;
const EMOJI_RE = /\p{Extended_Pictographic}/gu;
const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;
/**
 * Affirmative employment outcomes only.
 * Does NOT match mere mentions like "busco mi primer empleo" / "espero conseguir trabajo".
 */
const CONFIRMED_JOB_OUTCOME_RE =
  /\b(?:consegu[ií]|obtuve)\s+(?:mi\s+)?(?:primer\s+)?(?:empleo|trabajo)\b|\bme\s+contrataron\b|\bya\s+tengo\s+(?:empleo|trabajo)\b|\bfirm[eé]\s+(?:el\s+)?contrato\b|\bme\s+ofrecieron\s+(?:el\s+)?(?:empleo|trabajo)\b|\bahora\s+trabajo(?:\s+como|\s+en|\s+de)\b|\btrabajo\s+como\s+[\p{L}]+/iu;
const COMPANY_CLAIM_RE =
  /\b(en\s+[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ]+)?)\b/u;
const NUMBER_RE = /\b\d+(?:[.,]\d+)?%?\b/g;

/** True when text asserts a landed job / hire — not job-seeking language. */
export function hasConfirmedJobOutcome(text: string): boolean {
  return CONFIRMED_JOB_OUTCOME_RE.test(text);
}

function countEmojis(text: string): number {
  return (text.match(EMOJI_RE) ?? []).length;
}

function paragraphCount(text: string): number {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean).length;
}

function stripHashtagLines(text: string): string {
  return text
    .replace(HASHTAG_RE, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function looksLikeJson(text: string): boolean {
  const t = text.trim();
  if (
    (t.startsWith("{") && t.endsWith("}")) ||
    (t.startsWith("[") && t.endsWith("]"))
  ) {
    try {
      JSON.parse(t);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function sourceSupportsPhrase(source: string, phrase: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "");
  return norm(source).includes(norm(phrase));
}

/**
 * Deterministic copy validation (platform rules + light fidelity heuristics).
 */
export function validateCopy(
  draft: string,
  context: {
    plataforma: Plataforma;
    sourceText: string;
    understanding: TestimonialUnderstanding;
  },
): CopyValidationResult {
  const errors: CopyValidationIssue[] = [];
  const warnings: CopyValidationIssue[] = [];
  const trimmed = draft.trim();

  if (!trimmed) {
    errors.push({
      code: "empty",
      message: "Draft vacío",
      severity: "error",
    });
    return { valid: false, errors, warnings };
  }

  if (looksLikeJson(trimmed)) {
    errors.push({
      code: "json_leak",
      message: "El draft parece JSON, no una publicación",
      severity: "error",
    });
  }

  if (
    /\b(genera(r|ción)?\s+video|instrucciones?\s+de\s+edici[oó]n|ejecut[aá]\s+ffmpeg|edita\s+el\s+binario)\b/i.test(
      trimmed,
    )
  ) {
    errors.push({
      code: "media_instructions",
      message: "Contiene instrucciones de video/edición",
      severity: "error",
    });
  }

  const tags = trimmed.match(HASHTAG_RE) ?? [];
  const allowed = new Set(
    PUBLICATION_HASHTAGS.map((t) => t.toLowerCase()),
  );
  const extra = tags.filter((t) => !allowed.has(t.toLowerCase()));
  if (extra.length > 0) {
    errors.push({
      code: "extra_hashtags",
      message: `Hashtags no permitidos: ${extra.join(", ")}`,
      severity: "error",
    });
  }

  const endsCorrectly = trimmed.endsWith(PUBLICATION_HASHTAGS_LINE);
  const hasBlankBefore =
    trimmed.endsWith(`\n\n${PUBLICATION_HASHTAGS_LINE}`) ||
    trimmed === PUBLICATION_HASHTAGS_LINE;
  if (!endsCorrectly || !hasBlankBefore) {
    // Soft: normalizer will fix; warn only if tags appear mid-body.
    const body = stripHashtagLines(trimmed);
    if (HASHTAG_RE.test(body)) {
      warnings.push({
        code: "hashtags_mid_body",
        message: "Hashtags fuera del bloque final",
        severity: "warning",
      });
    }
  }

  if (context.plataforma === "instagram") {
    const emojis = countEmojis(stripHashtagLines(trimmed));
    if (emojis > 2) {
      errors.push({
        code: "too_many_emojis",
        message: `Instagram permite máx 2 emojis (hay ${emojis})`,
        severity: "error",
      });
    }
  }

  const bodyForVoice = stripHashtagLines(trimmed);
  if (THIRD_PERSON_NARRATOR_RE.test(bodyForVoice)) {
    errors.push({
      code: "third_person_voice",
      message:
        "El draft narra en tercera persona; debe ser un testimonio en primera persona (yo/me/mi)",
      severity: "error",
    });
  } else if (
    bodyForVoice.length > 60 &&
    !FIRST_PERSON_RE.test(bodyForVoice)
  ) {
    errors.push({
      code: "missing_first_person",
      message: "Falta voz en primera persona (yo/me/mi) propia de un testimonio",
      severity: "error",
    });
  }
  const firstLine = bodyForVoice.split(/\n/)[0]?.trim() ?? "";
  if (IMPERSONAL_OPENER_RE.test(firstLine)) {
    errors.push({
      code: "impersonal_opener",
      message:
        "Apertura impersonal/ensayo; empezá desde la experiencia personal en primera persona",
      severity: "error",
    });
  }
  if (BRAND_CTA_RE.test(bodyForVoice)) {
    errors.push({
      code: "brand_cta",
      message:
        "CTA de marca/community ('te leo', 'seguinos'); el testimonio debe cerrar en primera persona",
      severity: "error",
    });
  }

  if (context.plataforma === "linkedin") {
    if (countEmojis(stripHashtagLines(trimmed)) > 0) {
      errors.push({
        code: "casual_emoji",
        message: "LinkedIn no debe usar emojis casuales",
        severity: "error",
      });
    }
    const paras = paragraphCount(stripHashtagLines(trimmed));
    if (paras < 2 || paras > 4) {
      warnings.push({
        code: "paragraph_count",
        message: `LinkedIn suele tener 2–3 párrafos (hay ${paras})`,
        severity: "warning",
      });
    }
  }

  // Fidelity: affirmative job outcome in draft must be backed by source/outcomes.
  const body = stripHashtagLines(trimmed);
  const draftClaimsJob = hasConfirmedJobOutcome(body);
  if (draftClaimsJob) {
    const sourceClaimsJob = hasConfirmedJobOutcome(context.sourceText);
    const understandingClaimsJob = context.understanding.outcomes.some((o) =>
      hasConfirmedJobOutcome(o),
    );
    const expectationOnly =
      context.understanding.expectations.length > 0 &&
      context.understanding.outcomes.length === 0;

    if (!sourceClaimsJob && !understandingClaimsJob) {
      errors.push({
        code: expectationOnly
          ? "expectation_as_outcome"
          : "unbacked_job_claim",
        message: expectationOnly
          ? "Convierte una expectativa en resultado laboral"
          : "El draft afirma un resultado laboral no respaldado por el testimonio",
        severity: "error",
      });
    }
  }

  // Numbers in draft not present in source (ignore tiny bullets like 1–2 from briefs).
  const draftNumbers = (body.match(NUMBER_RE) ?? []).filter((n) => {
    const value = Number(n.replace("%", "").replace(",", "."));
    return !Number.isFinite(value) || value >= 10 || n.includes("%");
  });
  const sourceNumbers = new Set(context.sourceText.match(NUMBER_RE) ?? []);
  for (const n of draftNumbers) {
    if (!sourceNumbers.has(n)) {
      warnings.push({
        code: "unbacked_number",
        message: `Cifra no encontrada en el testimonio: ${n}`,
        severity: "warning",
      });
    }
  }

  // Organizations mentioned in draft but not in understanding/source.
  for (const org of context.understanding.organizations) {
    if (org && body.toLowerCase().includes(org.toLowerCase())) continue;
  }
  const companyHit = body.match(COMPANY_CLAIM_RE);
  if (companyHit?.[1]) {
    const name = companyHit[1].replace(/^en\s+/i, "").trim();
    if (
      name.length > 2 &&
      !sourceSupportsPhrase(context.sourceText, name) &&
      !context.understanding.organizations.some((o) =>
        sourceSupportsPhrase(o, name),
      )
    ) {
      // Avoid flagging common Spanish words after "en"
      if (!/^(la|el|los|las|un|una|mi|su|esta|este|no|el)$/i.test(name)) {
        warnings.push({
          code: "possible_unbacked_org",
          message: `Posible organización no respaldada: ${name}`,
          severity: "warning",
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function buildRepairPrompt(input: {
  draft: string;
  errors: CopyValidationIssue[];
  sourceText: string;
  understandingJson: string;
  strategy: NarrativeStrategy;
}): string {
  const errorList = input.errors
    .map((e) => `- [${e.code}] ${e.message}`)
    .join("\n");
  return [
    "Corregí SOLO los errores detectados en el borrador de publicación.",
    "NO inventes información.",
    "NO cambies hechos ni el significado.",
    "NO agregues nuevos resultados, cargos, empresas ni cifras.",
    "NO introduzcas información externa.",
    "Si el error es un resultado laboral no respaldado: reescribí en clave de búsqueda/preparación/aprendizaje; NUNCA digas que consiguió empleo si el testimonio no lo afirma.",
    "Mencionar 'primer empleo' como meta o búsqueda está bien; afirmar que ya lo consiguió no lo está sin respaldo.",
    "Si el error es de voz (tercera persona / apertura impersonal / CTA de marca): reescribí TODO en primera persona (yo/me/mi), como testimonio de quien lo vivió — no como narrador ni marca. Sacá CTAs tipo 'te leo en comentarios'.",
    "Devolvé únicamente el texto corregido de la publicación (sin JSON ni explicación).",
    `Plataforma: ${input.strategy.plataforma}`,
    `Tipo: ${input.strategy.testimonialType}`,
    "",
    "Errores a corregir:",
    errorList,
    "",
    "Understanding (referencia organizada; no inventes más allá del testimonio):",
    input.understandingJson,
    "",
    "Testimonio original (fuente de verdad):",
    input.sourceText,
    "",
    "Borrador actual:",
    input.draft,
  ].join("\n");
}

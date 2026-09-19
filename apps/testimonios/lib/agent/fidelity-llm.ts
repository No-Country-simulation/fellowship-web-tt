import { geminiGenerateText } from "./gemini-client";
import type { CopyValidationIssue } from "./copy-validator";
import { extractJsonObject } from "./understanding";
import type { Plataforma } from "./types";

/**
 * Fidelity LLM uses a quota-friendlier fixed model (not the draft primary).
 * Code defines allowed issue codes; the model only fills those — it does not invent schema.
 */
export const FIDELITY_LLM_MODEL = "gemini-2.5-flash-lite";
export const FIDELITY_TEMPERATURE = 0.1;

/** Issue codes the fidelity LLM is allowed to emit (defined in code). */
export const FIDELITY_ISSUE_CODES = [
  "unbacked_job_claim",
  "expectation_as_outcome",
  "unbacked_number",
  "unbacked_org",
  "invented_fact",
  "exaggerated_claim",
] as const;

export type FidelityIssueCode = (typeof FIDELITY_ISSUE_CODES)[number];

const CODE_SET = new Set<string>(FIDELITY_ISSUE_CODES);

export function isFidelityLlmEnabled(): boolean {
  return process.env.GEMINI_FIDELITY_LLM === "true";
}

export function buildFidelityPrompt(input: {
  plataforma: Plataforma;
  sourceText: string;
  understandingJson: string;
  draft: string;
}): string {
  return [
    "Sos un validador de fidelidad. NO reescribas el draft.",
    "Compará el DRAFT contra el TESTIMONIO (fuente de verdad) y el understanding.",
    "El código define los únicos códigos de error permitidos. Devolvé SOLO JSON válido.",
    "NO inventes hechos. Si el draft solo reformula lo del testimonio, ok=true.",
    "Distinguí búsqueda/expectativa ('busco primer empleo') de resultado ('conseguí empleo').",
    "",
    "Schema exacto:",
    JSON.stringify({
      ok: true,
      issues: [
        {
          code: "unbacked_job_claim|expectation_as_outcome|unbacked_number|unbacked_org|invented_fact|exaggerated_claim",
          message: "string breve en español",
          severity: "error",
        },
      ],
    }),
    "Si no hay problemas: {\"ok\":true,\"issues\":[]}",
    `Códigos permitidos: ${FIDELITY_ISSUE_CODES.join(", ")}`,
    "",
    `Plataforma: ${input.plataforma}`,
    "",
    "Testimonio original:",
    input.sourceText,
    "",
    "Understanding (organizado en código; no es fuente de hechos nuevos):",
    input.understandingJson,
    "",
    "Draft a validar:",
    input.draft,
  ].join("\n");
}

/**
 * Parse fidelity LLM JSON. Unknown codes are dropped (code owns the schema).
 */
export function parseFidelityResponse(raw: string): CopyValidationIssue[] {
  const json = extractJsonObject(raw);
  if (!json) return [];

  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return [];
  }
  if (!data || typeof data !== "object") return [];

  const row = data as Record<string, unknown>;
  if (row.ok === true && (!Array.isArray(row.issues) || row.issues.length === 0)) {
    return [];
  }

  const issues = Array.isArray(row.issues) ? row.issues : [];
  const out: CopyValidationIssue[] = [];
  for (const item of issues) {
    if (!item || typeof item !== "object") continue;
    const issue = item as Record<string, unknown>;
    const code = typeof issue.code === "string" ? issue.code : "";
    const message =
      typeof issue.message === "string" ? issue.message.trim() : "";
    if (!CODE_SET.has(code) || !message) continue;
    out.push({
      code,
      message,
      severity: "error",
    });
  }
  return out;
}

/**
 * Optional semantic fidelity check via Gemini 2.5 Flash-Lite.
 * Fail-open on API errors (returns [] so heuristics still govern).
 */
export async function runFidelityLlmCheck(input: {
  plataforma: Plataforma;
  sourceText: string;
  understandingJson: string;
  draft: string;
  apiKey?: string;
}): Promise<CopyValidationIssue[]> {
  if (!isFidelityLlmEnabled()) return [];

  try {
    const raw = await geminiGenerateText(buildFidelityPrompt(input), {
      apiKey: input.apiKey,
      model: FIDELITY_LLM_MODEL,
      temperature: FIDELITY_TEMPERATURE,
      maxOutputTokens: 512,
    });
    return parseFidelityResponse(raw);
  } catch (err) {
    console.info(
      JSON.stringify({
        scope: "agent.copy",
        stage: "fidelityLlm",
        ok: false,
        error: err instanceof Error ? err.message.slice(0, 120) : "error",
      }),
    );
    return [];
  }
}

export function mergeFidelityIssues(
  base: { errors: CopyValidationIssue[]; warnings: CopyValidationIssue[] },
  fidelityIssues: CopyValidationIssue[],
): {
  valid: boolean;
  errors: CopyValidationIssue[];
  warnings: CopyValidationIssue[];
} {
  const seen = new Set(base.errors.map((e) => `${e.code}:${e.message}`));
  const errors = [...base.errors];
  for (const issue of fidelityIssues) {
    const key = `${issue.code}:${issue.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    errors.push(issue);
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings: base.warnings,
  };
}

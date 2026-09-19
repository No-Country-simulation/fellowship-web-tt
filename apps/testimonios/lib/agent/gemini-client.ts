import { TYPE_LABELS, type TestimonialType } from "@/lib/testimonials/types";
import type { CopyGenerator } from "./copy-generator";
import { PLATFORM_COPY_BRIEFS } from "./copy-generator";
import { antiHallucinationBlock } from "./copy-rules";
import { buildRepairPrompt } from "./copy-validator";
import {
  getNarrativeStrategy,
  narrativeStrategyToPromptBlock,
} from "./narrative-strategy";
import type { Plataforma } from "./types";

/**
 * Primary: Gemini 3.1 Flash-Lite (better quality when available).
 * Fallback: 2.5 Flash-Lite when 3.x returns 503/429/empty text.
 * Override primary with GEMINI_MODEL; fallback with GEMINI_FALLBACK_MODEL.
 * Pro previews (`gemini-3.1-pro-preview`) return 429 without billing.
 */
export const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";
export const DEFAULT_GEMINI_FALLBACK_MODEL = "gemini-2.5-flash-lite";

/** Understanding: prefer precision / fidelity. */
export const UNDERSTAND_TEMPERATURE = 0.2;
/** Draft / repair: moderate creativity for natural copy. */
export const DRAFT_TEMPERATURE = 0.7;

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string; thought?: boolean }> };
  }>;
};

function requireApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY no configurado. Copy generation requiere la clave (sin secretos en el repo).",
    );
  }
  return key;
}

export function resolvePrimaryModel(override?: string): string {
  return (
    override?.trim() ||
    process.env.GEMINI_MODEL?.trim() ||
    DEFAULT_GEMINI_MODEL
  );
}

export function resolveFallbackModel(primary: string): string | null {
  const fallback =
    process.env.GEMINI_FALLBACK_MODEL?.trim() ||
    DEFAULT_GEMINI_FALLBACK_MODEL;
  if (!fallback || fallback === primary) return null;
  return fallback;
}

function extractText(data: GeminiGenerateResponse): string {
  return (
    data.candidates?.[0]?.content?.parts
      ?.filter((p) => !p.thought)
      .map((p) => p.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

/**
 * Single-model generateContent call (text-only).
 */
export async function geminiGenerateTextOnce(
  prompt: string,
  opts: {
    apiKey: string;
    model: string;
    temperature?: number;
    maxOutputTokens?: number;
  },
): Promise<string> {
  const url = `${GEMINI_BASE}/${opts.model}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: opts.temperature ?? DRAFT_TEMPERATURE,
        // Flash 3.x spends tokens on thinking; keep headroom for the caption.
        maxOutputTokens: opts.maxOutputTokens ?? 2048,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as GeminiGenerateResponse;
  const text = extractText(data);
  if (!text) {
    throw new Error("Gemini no devolvió texto.");
  }
  return text;
}

/**
 * Call Gemini generateContent (text-only). Tries primary model, then fallback.
 * MUST NOT send/receive video binaries for generative rewrite —
 * mediaAssetPath is mention-only context.
 */
export async function geminiGenerateText(
  prompt: string,
  opts?: {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
  },
): Promise<string> {
  const apiKey = opts?.apiKey ?? requireApiKey();
  const primary = resolvePrimaryModel(opts?.model);
  const fallback = resolveFallbackModel(primary);
  const onceOpts = {
    temperature: opts?.temperature,
    maxOutputTokens: opts?.maxOutputTokens,
  };

  try {
    return await geminiGenerateTextOnce(prompt, {
      apiKey,
      model: primary,
      ...onceOpts,
    });
  } catch (primaryErr) {
    if (!fallback) throw primaryErr;
    try {
      return await geminiGenerateTextOnce(prompt, {
        apiKey,
        model: fallback,
        ...onceOpts,
      });
    } catch (fallbackErr) {
      const primaryMsg =
        primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      const fallbackMsg =
        fallbackErr instanceof Error
          ? fallbackErr.message
          : String(fallbackErr);
      throw new Error(
        `Gemini falló en ${primary} (${primaryMsg}) y en fallback ${fallback} (${fallbackMsg})`,
      );
    }
  }
}

export function buildUnderstandPrompt(
  sourceText: string,
  mediaAssetPath?: string | null,
  typeHint?: TestimonialType,
): string {
  const mediaNote = mediaAssetPath
    ? `\nMedia asset (FFmpeg path, do not rewrite video): ${mediaAssetPath}`
    : "\nNo media — text-only testimonio.";
  const typeNote = typeHint
    ? `Tipo declarado en el formulario (usar como testimonialType salvo que el texto contradiga de forma clara): ${typeHint} (${TYPE_LABELS[typeHint]}).`
    : "Si el tipo no está claro, usá simulation.";

  return [
    "Extraé un understanding ESTRUCTURADO en JSON del testimonio.",
    "Devolvé ÚNICAMENTE un objeto JSON válido (sin markdown, sin explicación).",
    antiHallucinationBlock(),
    typeNote,
    "Usá únicamente información presente en el testimonio.",
    "NO inventes hechos, logros, empleos, cargos, empresas, cifras, fechas ni tecnologías.",
    "NO transformes expectativas en resultados ni opiniones en hechos.",
    "Conservá nombres, cifras, fechas y términos relevantes.",
    "Identificá citas textuales e información ambigua.",
    "Usá arrays vacíos [] cuando no haya datos; null para speaker si no aplica.",
    "Clasificá testimonialType como uno de: simulation | first_job | career_change.",
    "factualClaims: array de { text, kind } donde kind es fact | expectation | interpretation | confirmed_outcome | ambiguous.",
    "Schema exacto de claves:",
    JSON.stringify({
      testimonialType: "simulation|first_job|career_change",
      summary: "string",
      speaker: "string|null",
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
      factualClaims: [{ text: "string", kind: "fact" }],
      expectations: [],
      unsupportedOrAmbiguousClaims: [],
    }),
    mediaNote,
    "",
    "Testimonio:",
    sourceText,
  ].join("\n");
}

export function buildDraftPrompt(
  plataforma: Plataforma,
  understanding: string,
  sourceText: string,
  opts?: {
    testimonialType?: TestimonialType;
    narrativeStrategy?: string;
  },
): string {
  const brief = PLATFORM_COPY_BRIEFS[plataforma];
  const type =
    opts?.testimonialType ??
    (plataforma === "linkedin" ? "simulation" : "simulation");
  const strategy =
    opts?.narrativeStrategy ??
    narrativeStrategyToPromptBlock(getNarrativeStrategy(type, plataforma));

  return [
    "Redactá un borrador de publicación (solo texto) para la plataforma indicada.",
    "Es un TESTIMONIO: la voz es la de la persona que vivió la historia, SIEMPRE en primera persona (yo, me, mi, mis).",
    "PROHIBIDO: narrar en tercera persona (él/ella/su historia); sonar a marca, copywriter o presentador contando 'la historia de alguien'.",
    "PROHIBIDO: abrir con frases impersonales tipo ensayo ('Entrar al mundo IT puede…') — empezá desde la experiencia personal.",
    "El CTA, si hay, también en primera persona (no 'te leo en comentarios' ni tono de cuenta de marca).",
    "El texto original es la fuente de verdad.",
    "El understanding es una representación organizada del testimonio.",
    "NO agregues información que no esté respaldada por el texto original.",
    "La existencia de un campo en el understanding no autoriza a inventar detalles adicionales.",
    antiHallucinationBlock(),
    `Plataforma: ${plataforma}`,
    `Brief de plataforma: ${brief}`,
    strategy,
    "NO generes video ni instrucciones de edición de binarios.",
    "Los hashtags #NoCountry #DemoDay #TalentoIT son OBLIGATORIOS al final (línea en blanco + exactamente esos tres; no inventes otros; no los repartas en el cuerpo).",
    "",
    "Understanding estructurado:",
    understanding,
    "",
    "Texto original:",
    sourceText,
  ].join("\n");
}

/**
 * Real Gemini CopyGenerator gated on GEMINI_API_KEY.
 * Text-only output; never mutates media binaries/paths.
 */
export function createGeminiCopyGenerator(
  opts?: { apiKey?: string; model?: string },
): CopyGenerator {
  return {
    async understandAndTranscribe({ sourceText, mediaAssetPath, typeHint }) {
      return geminiGenerateText(
        buildUnderstandPrompt(sourceText, mediaAssetPath, typeHint),
        {
          ...opts,
          temperature: UNDERSTAND_TEMPERATURE,
        },
      );
    },
    async draftForPlatform({
      plataforma,
      understanding,
      sourceText,
      testimonialType,
      narrativeStrategy,
    }) {
      return geminiGenerateText(
        buildDraftPrompt(plataforma, understanding, sourceText, {
          testimonialType,
          narrativeStrategy,
        }),
        {
          ...opts,
          temperature: DRAFT_TEMPERATURE,
        },
      );
    },
    async repairDraft({
      draft,
      errors,
      sourceText,
      understanding,
      plataforma,
      testimonialType,
      narrativeStrategy,
    }) {
      const strategy =
        narrativeStrategy ||
        narrativeStrategyToPromptBlock(
          getNarrativeStrategy(testimonialType, plataforma),
        );
      return geminiGenerateText(
        buildRepairPrompt({
          draft,
          errors: errors.map((message) => ({
            code: "repair",
            message,
            severity: "error" as const,
          })),
          sourceText,
          understandingJson: understanding,
          strategy: getNarrativeStrategy(testimonialType, plataforma),
        }) + `\n\nEstrategia:\n${strategy}`,
        {
          ...opts,
          temperature: DRAFT_TEMPERATURE,
        },
      );
    },
  };
}

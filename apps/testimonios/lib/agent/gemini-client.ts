import {
  PLATFORM_COPY_BRIEFS,
  type CopyGenerator,
} from "./copy-generator";
import type { Plataforma } from "./types";

const DEFAULT_MODEL = "gemini-2.0-flash";
const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
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

/**
 * Call Gemini generateContent (text-only). MUST NOT send/receive video binaries
 * for generative rewrite — mediaAssetPath is mention-only context.
 */
export async function geminiGenerateText(
  prompt: string,
  opts?: { apiKey?: string; model?: string },
): Promise<string> {
  const apiKey = opts?.apiKey ?? requireApiKey();
  const model = opts?.model ?? DEFAULT_MODEL;
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as GeminiGenerateResponse;
  const text = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini no devolvió texto.");
  }
  return text;
}

function buildUnderstandPrompt(
  sourceText: string,
  mediaAssetPath?: string | null,
): string {
  const mediaNote = mediaAssetPath
    ? `\nMedia asset (FFmpeg path, do not rewrite video): ${mediaAssetPath}`
    : "\nNo media — text-only testimonio.";
  return [
    "Eres un asistente que entiende y transcribe el sentido de un testimonio.",
    "Devuelve solo un resumen/transcripción textual breve (español).",
    "NO generes ni reescribas video. Solo texto.",
    mediaNote,
    "",
    "Testimonio:",
    sourceText,
  ].join("\n");
}

function buildDraftPrompt(
  plataforma: Plataforma,
  understanding: string,
  sourceText: string,
): string {
  const brief = PLATFORM_COPY_BRIEFS[plataforma];
  return [
    "Redacta un borrador de publicación (solo texto) para la plataforma indicada.",
    `Plataforma: ${plataforma}`,
    `Brief: ${brief}`,
    "NO generes video ni instrucciones de edición de binarios.",
    "",
    "Comprensión/transcripción:",
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
    async understandAndTranscribe({ sourceText, mediaAssetPath }) {
      return geminiGenerateText(
        buildUnderstandPrompt(sourceText, mediaAssetPath),
        opts,
      );
    },
    async draftForPlatform({ plataforma, understanding, sourceText }) {
      return geminiGenerateText(
        buildDraftPrompt(plataforma, understanding, sourceText),
        opts,
      );
    },
  };
}

/**
 * Primary: Gemini 3.1 Flash-Lite (better quality when available).
 * Fallback: 2.5 Flash-Lite when 3.x returns 503/429/empty text.
 * Override primary with GEMINI_MODEL; fallback with GEMINI_FALLBACK_MODEL.
 */
export const DEFAULT_GEMINI_MODEL = "gemini-3.1-flash-lite";
export const DEFAULT_GEMINI_FALLBACK_MODEL = "gemini-2.5-flash-lite";

const DEFAULT_TEMPERATURE = 0.4;

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

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
        temperature: opts.temperature ?? DEFAULT_TEMPERATURE,
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

/** Call Gemini generateContent (text-only). Tries primary model, then fallback. */
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

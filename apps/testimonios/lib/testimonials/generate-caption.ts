"use server";

import { geminiGenerateText } from "@/lib/agent";
import type { Plataforma } from "@/lib/agent";
import { requireAdmin } from "@/lib/auth/admin";
import { TYPE_LABELS } from "@/lib/testimonials/types";

import { getTestimonialById } from "./store";
import {
  buildIgCaption,
  buildLiCaption,
  CAPTION_EDIT_MAX_CHARS,
} from "./quote";

const PLATFORMS = new Set<Plataforma>(["instagram", "linkedin"]);

export type GenerateCaptionResult =
  | { ok: true; caption: string }
  | { ok: false; error: string };

/**
 * Gemini writes only a short No Country intro.
 * Quote, name, handle and hashtags are assembled here.
 */
export async function generateCaption(
  testimonioId: string,
  plataforma: Plataforma,
  quote?: string,
): Promise<GenerateCaptionResult> {
  await requireAdmin();

  if (!PLATFORMS.has(plataforma)) {
    return { ok: false, error: "Plataforma no válida." };
  }

  if (!process.env.GEMINI_API_KEY?.trim()) {
    return { ok: false, error: "Falta GEMINI_API_KEY." };
  }

  const current = await getTestimonialById(testimonioId);
  if (!current.ok) {
    return { ok: false, error: current.message };
  }

  const row = current.testimonial;
  const finalQuote = quote?.trim() || row.quote;
  const typeLabel = TYPE_LABELS[row.type] ?? row.type;

  try {
    const intro = sanitizeIntro(
      await geminiGenerateText(buildIntroPrompt(plataforma, typeLabel, row.story, finalQuote), {
        temperature: 0.4,
        maxOutputTokens: 120,
      }),
    );
    if (!intro) {
      return { ok: false, error: "Gemini no devolvió un intro." };
    }

    const caption =
      plataforma === "instagram"
        ? buildIgCaption({
            intro,
            quote: finalQuote,
            fullName: row.full_name,
            instagram: row.instagram,
          })
        : buildLiCaption({
            intro,
            quote: finalQuote,
            fullName: row.full_name,
            linkedin: row.linkedin,
          });

    return { ok: true, caption: caption.slice(0, CAPTION_EDIT_MAX_CHARS) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo generar el caption.",
    };
  }
}

function buildIntroPrompt(
  plataforma: Plataforma,
  typeLabel: string,
  story: string,
  quote: string,
): string {
  const tone =
    plataforma === "instagram"
      ? "Cercano, 1 emoji como máximo."
      : "Profesional, sin emojis.";

  return [
    "Escribí un intro corto (1 o 2 oraciones) en nombre de No Country para un post.",
    "Vos sos la cuenta de la comunidad, no la persona del testimonio.",
    "Presentá el testimonio. NO copies el quote. NO pongas hashtags, nombre ni redes.",
    "NO inventes empresas, puestos, clientes ni resultados.",
    "Respondé SOLO con el intro, listo para pegar. Una sola versión.",
    "PROHIBIDO: preámbulos, disculpas, 'acá te dejo', 'te comparto', 'algunas opciones', listas, numeración, comillas envolviendo todo, explicación.",
    tone,
    `Plataforma: ${plataforma}`,
    `Tipo de historia: ${typeLabel}`,
    "",
    "Quote (no lo copies):",
    quote,
    "",
    "Historia (solo contexto):",
    story.trim().slice(0, 800) || "(sin historia)",
  ].join("\n");
}

const INTRO_PREAMBLE =
  /^(acá|aquí|aqui)\s+(te|van|va|tenés|tienes|hay)\b|te\s+comparto|te\s+dejo|algunas\s+opciones|opciones\s+para|estas\s+son\b|^(claro|por supuesto|perfecto|ok|dale)[!.,](\s|$)|^(opción|opcion|alternativa)\s*\d/i;

function isPreambleLine(line: string): boolean {
  return INTRO_PREAMBLE.test(line);
}

function stripOptionPrefix(line: string): string {
  return line
    .replace(/^(opción|opcion|alternativa)\s*\d+\s*[:.)-]\s*/i, "")
    .replace(/^\d+[\.)]\s+/, "")
    .replace(/^[-*•]\s+/, "")
    .trim();
}

function firstSentences(text: string, max = 2): string {
  const parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!parts) {
    return text;
  }
  return parts
    .slice(0, max)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

function sanitizeIntro(raw: string): string {
  const unfenced = raw.replace(/```(?:\w+)?\s*([\s\S]*?)```/g, "$1").trim();
  const blocks = unfenced
    .split(/\n+/)
    .map((line) => {
      const cleaned = stripOptionPrefix(line.replace(/#\w+/g, "").trim());
      if (isPreambleLine(cleaned) && cleaned.includes(":")) {
        return stripOptionPrefix(cleaned.slice(cleaned.indexOf(":") + 1).trim());
      }
      return cleaned;
    })
    .filter((line) => line && !isPreambleLine(line));

  const picked = (blocks[0] ?? unfenced)
    .replace(/^["“]+|["”]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!picked || isPreambleLine(picked)) {
    return "";
  }

  return firstSentences(picked);
}

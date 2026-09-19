import { TYPE_LABELS, type TestimonialType } from "@/lib/testimonials/types";
import type { Plataforma } from "./types";

export type NarrativeStrategy = {
  testimonialType: TestimonialType;
  plataforma: Plataforma;
  typeLabel: string;
  structure: string;
  priorities: string;
  platformVoice: string;
};

const PLATFORM_VOICE: Readonly<Record<Plataforma, string>> = {
  instagram:
    "Instagram: SIEMPRE en primera persona (yo/me/mi), como si la persona del testimonio hablara. Cercano, humano, natural; líneas cortas; máx 2 emojis; CTA suave en primera persona. PROHIBIDO narrar en tercera persona o sonar a marca/copywriting sobre 'alguien'.",
  linkedin:
    "LinkedIn: SIEMPRE en primera persona (yo/me/mi), testimonio personal. Profesional, natural, claro; aprendizaje y experiencia; sin emojis casuales; sin frases publicitarias. PROHIBIDO tercera persona o tono de nota de prensa sobre la persona.",
};

const STRUCTURE: Readonly<
  Record<TestimonialType, Record<Plataforma, string>>
> = {
  career_change: {
    instagram:
      "Hook en YO → Mi experiencia → Qué aprendí / cómo cambié → Cierre/CTA en primera persona",
    linkedin:
      "Mi contexto → Mi experiencia/aprendizaje → Mi reflexión profesional (siempre yo)",
  },
  first_job: {
    instagram:
      "Hook en YO → Mi experiencia → Qué aprendí → Cierre/CTA en primera persona",
    linkedin:
      "Mi situación inicial → Mi preparación/aprendizaje → Mi reflexión (resultado laboral solo si el texto lo confirma)",
  },
  simulation: {
    instagram:
      "Hook en YO → Mi experiencia práctica → Qué aprendí → Cierre/CTA en primera persona",
    linkedin:
      "El desafío que viví → Mi experiencia/colaboración → Mi aprendizaje y reflexión",
  },
};

const PRIORITIES: Readonly<
  Record<TestimonialType, Record<Plataforma, string>>
> = {
  career_change: {
    instagram:
      "Priorizá: situación anterior, decisión, transición, aprendizaje, transformación. Nunca inventes el 'antes' ni un empleo posterior.",
    linkedin:
      "Priorizá: trayectoria anterior, motivo/contexto de transición, experiencia, habilidades desarrolladas, transformación, reflexión profesional. Sin empleo inventado.",
  },
  first_job: {
    instagram:
      "Priorizá: punto de partida, preparación, experiencia, aprendizaje. Resultado laboral SOLO si está confirmado en el testimonio.",
    linkedin:
      "Priorizá: situación inicial, preparación, aprendizaje, desarrollo profesional. Resultado laboral SOLO si está confirmado explícitamente.",
  },
  simulation: {
    instagram:
      "Priorizá: desafío, experiencia práctica, colaboración, aprendizaje, resultado o reflexión. No presentes la simulación como empleo real ni inventes clientes.",
    linkedin:
      "Priorizá: problema, experiencia práctica, colaboración, herramientas, habilidades, aprendizaje, reflexión. No conviertas la simulación en empleo real ni inventes impacto comercial.",
  },
};

export function getNarrativeStrategy(
  testimonialType: TestimonialType,
  plataforma: Plataforma,
): NarrativeStrategy {
  return {
    testimonialType,
    plataforma,
    typeLabel: TYPE_LABELS[testimonialType],
    structure: STRUCTURE[testimonialType][plataforma],
    priorities: PRIORITIES[testimonialType][plataforma],
    platformVoice: PLATFORM_VOICE[plataforma],
  };
}

export function narrativeStrategyToPromptBlock(
  strategy: NarrativeStrategy,
): string {
  return [
    `Tipo de testimonio: ${strategy.testimonialType} (${strategy.typeLabel})`,
    `Plataforma: ${strategy.plataforma}`,
    `Voz: ${strategy.platformVoice}`,
    `Estructura narrativa: ${strategy.structure}`,
    `Prioridades: ${strategy.priorities}`,
  ].join("\n");
}

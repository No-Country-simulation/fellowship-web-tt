import type {
  CareerChangePayload,
  FirstJobPayload,
  SimulationPayload,
  TestimonialType,
} from "./types";

/** Instagram feed portrait, 4:5. */
export const IG_CARD_WIDTH = 1080;
export const IG_CARD_HEIGHT = 1350;
/** Franja de foto arriba de la card. 16:9 sobre 1080 de ancho. */
export const IG_PHOTO_HEIGHT = Math.round((IG_CARD_WIDTH * 9) / 16);

export type IgCardContent = {
  type: TestimonialType;
  quote: string;
  fullName: string;
  country: string | null;
  avatarUrl: string;
  captureUrl: string | null;
  company: string | null;
  role: string | null;
  previousRole: string | null;
};

export function igCardFilename(slug: string) {
  return `testimonio-${slug}.png`;
}

export function igCardContent(
  source: {
    type: TestimonialType;
    fullName: string;
    country: string | null;
    avatarUrl: string;
    captureUrl: string | null;
    simulation: SimulationPayload | null;
    firstJob: FirstJobPayload | null;
    careerChange: CareerChangePayload | null;
  },
  quote: string,
): IgCardContent {
  return {
    type: source.type,
    quote,
    fullName: source.fullName,
    country: source.country,
    avatarUrl: source.avatarUrl,
    captureUrl: source.captureUrl,
    company: source.firstJob?.company ?? null,
    role: capitalizeFirst(
      source.simulation?.primary_role ??
        source.firstJob?.role_achieved ??
        source.careerChange?.new_role ??
        null,
    ),
    previousRole: source.careerChange?.previous_profession ?? null,
  };
}

function capitalizeFirst(value: string | null) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return null;
  }
  return trimmed.charAt(0).toLocaleUpperCase("es") + trimmed.slice(1);
}

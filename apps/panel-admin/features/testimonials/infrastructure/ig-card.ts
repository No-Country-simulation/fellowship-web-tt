import type {
  CardDesign,
  CareerChangePayload,
  FirstJobPayload,
  SimulationPayload,
  TestimonialType,
} from "../types/testimonial";
import { applyCardEdits, readCardEdits, type CardEdits } from "./cardFields";

/** Instagram feed portrait, 4:5. */
export const IG_CARD_WIDTH = 1080;
export const IG_CARD_HEIGHT = 1350;
/** Franja de foto arriba de la card. 16:9 sobre 1080 de ancho. */
export const IG_PHOTO_HEIGHT = Math.round((IG_CARD_WIDTH * 9) / 16);

export type IgCardContent = {
  type: TestimonialType;
  design: CardDesign;
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
  design: CardDesign,
  edits?: CardEdits,
): IgCardContent {
  const base = { ...source, quote };
  const edited = applyCardEdits(base, edits ?? readCardEdits(base));
  return {
    type: edited.type,
    design,
    quote: edited.quote,
    fullName: edited.fullName,
    country: edited.country,
    avatarUrl: source.avatarUrl,
    captureUrl: source.captureUrl,
    company: blankToNull(edited.firstJob?.company),
    role: capitalizeFirst(
      edited.simulation?.primary_role ??
        edited.firstJob?.role_achieved ??
        edited.careerChange?.new_role ??
        null,
    ),
    previousRole: blankToNull(edited.careerChange?.previous_profession),
  };
}

function capitalizeFirst(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return null;
  }
  return trimmed.charAt(0).toLocaleUpperCase("es") + trimmed.slice(1);
}

function blankToNull(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

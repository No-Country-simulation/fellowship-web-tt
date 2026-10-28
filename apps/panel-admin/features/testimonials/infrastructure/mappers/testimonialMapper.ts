import type { TestimonialDto } from "../dtos/testimonialDto";
import { reviewCaptions } from "../quote";
import { youtubeEmbedSrc } from "../youtube";
import {
  careerChangeFields,
  firstJobFields,
  simulationFields,
  typeOption,
  type AdminInboxItem,
  type AdminTestimonial,
} from "../../types/testimonial";

type TestimonialMedia = {
  avatarUrl: string;
  captureUrl: string | null;
};

export const TestimonialMapper = {
  fromDto(dto: TestimonialDto, media: TestimonialMedia): AdminTestimonial {
    const typeLabel = typeOption(dto.type).label;
    const simulation = simulationFields(dto.payload);
    const firstJob = firstJobFields(dto.payload);
    const careerChange = careerChangeFields(dto.payload);
    const { quote, igCaption, liCaption, discordCaption } = reviewQuoteAndCaptions(dto);

    return {
      id: dto.id,
      slug: dto.slug,
      type: dto.type,
      typeLabel,
      status: dto.status,
      archiveReason: dto.archive_reason ?? null,
      fullName: dto.full_name,
      country: dto.country,
      email: dto.email,
      instagram: dto.instagram,
      linkedin: dto.linkedin ?? null,
      story: dto.story,
      quote,
      igCaption,
      liCaption,
      discordCaption,
      avatarUrl: media.avatarUrl,
      captureUrl: media.captureUrl,
      videoUrl: dto.video_url,
      youtubeEmbedUrl: dto.video_url ? youtubeEmbedSrc(dto.video_url) : null,
      simulation,
      firstJob,
      careerChange,
      submittedAt: dto.submitted_at,
      publishedAt: dto.published_at,
      discordPostedAt: dto.discord_posted_at ?? null,
      bufferInstagramPostedAt: dto.buffer_instagram_posted_at ?? null,
      bufferLinkedinPostedAt: dto.buffer_linkedin_posted_at ?? null,
      bufferInstagramPostId: dto.buffer_instagram_post_id ?? null,
      bufferLinkedinPostId: dto.buffer_linkedin_post_id ?? null,
    };
  },

  toInboxItem(dto: TestimonialDto, media: TestimonialMedia): AdminInboxItem {
    const view = this.fromDto(dto, media);
    return {
      id: view.id,
      type: view.type,
      typeLabel: view.typeLabel,
      status: view.status,
      fullName: view.fullName,
      quote: view.quote,
      avatarUrl: view.avatarUrl,
      submittedAt: view.submittedAt,
    };
  },
};

export function formatSubmittedAt(iso: string) {
  return formatEsAr(
    new Date(iso).toLocaleString("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Argentina/Buenos_Aires",
    }),
  );
}

/** Fecha corta, sin hora: "13 oct 2026". */
export function formatShortDate(iso: string) {
  const parts = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value.replace(/\./g, "") ?? "";
  return `${part("day")} ${part("month")} ${part("year")}`;
}

export function inboxItemMeta(item: Pick<AdminInboxItem, "typeLabel" | "submittedAt">) {
  return `${item.typeLabel} · ${formatSubmittedAt(item.submittedAt)}`;
}

/**
 * En revisión, si `li_caption` está vacío o es copia de `ig_caption`, cada tab
 * arranca con su plantilla. Publicado y rechazado muestran el texto guardado:
 * es el que salió, o el que se va a copiar a mano.
 */
function reviewQuoteAndCaptions(dto: TestimonialDto) {
  const igCaption = dto.ig_caption ?? "";
  const liCaption = dto.li_caption ?? "";
  const discordCaption = dto.discord_caption ?? "";
  if (dto.status !== "in_review") {
    return { quote: dto.quote, igCaption, liCaption, discordCaption };
  }
  return {
    quote: dto.quote,
    ...reviewCaptions({
      fullName: dto.full_name,
      type: dto.type,
      instagram: dto.instagram,
      linkedin: dto.linkedin ?? null,
      quote: dto.quote,
      igCaption,
      liCaption,
      discordCaption,
      videoUrl: dto.video_url,
    }),
  };
}

function formatEsAr(value: string) {
  return value.replace(/[\u00a0\u202f]/g, " ");
}

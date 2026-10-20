import type { TestimonialDto } from "../dtos/testimonialDto";
import {
  buildPostCaption,
  excerptQuote,
  extractCaptionIntro,
  followsShareCaptionTemplate,
  QUOTE_MAX_CHARS,
} from "../quote";
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
    const { quote, caption } = reviewQuoteAndCaption(dto);

    return {
      id: dto.id,
      slug: dto.slug,
      type: dto.type,
      typeLabel,
      status: dto.status,
      fullName: dto.full_name,
      country: dto.country,
      email: dto.email,
      instagram: dto.instagram,
      linkedin: dto.linkedin ?? null,
      story: dto.story,
      quote,
      caption,
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
 * Envíos viejos traen quotes de hasta 240 caracteres. Sin publicar, se recortan al límite
 * actual y el texto del post se ajusta si sigue la plantilla. Los publicados no se tocan.
 */
function reviewQuoteAndCaption(dto: TestimonialDto) {
  const tooLong = dto.status !== "published" && dto.quote.length > QUOTE_MAX_CHARS;
  const quote = tooLong ? excerptQuote(dto.quote) : dto.quote;
  const template = (intro?: string) =>
    buildPostCaption({
      intro,
      quote,
      fullName: dto.full_name,
      instagram: dto.instagram,
      linkedin: dto.linkedin ?? null,
    });

  if (!dto.ig_caption.trim()) {
    return { quote, caption: template() };
  }
  if (tooLong && followsShareCaptionTemplate(dto.ig_caption)) {
    return { quote, caption: template(extractCaptionIntro(dto.ig_caption) ?? undefined) };
  }
  return { quote, caption: dto.ig_caption };
}

function formatEsAr(value: string) {
  return value.replace(/[\u00a0\u202f]/g, " ");
}

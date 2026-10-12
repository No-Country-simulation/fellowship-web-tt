import type { TestimonialDto } from "../dtos/testimonialDto";
import { buildIgCaption, buildLiCaption } from "../quote";
import { youtubeEmbedSrc } from "../youtube";
import {
  careerChangeFields,
  firstJobFields,
  simulationFields,
  storyContextLine,
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
      quote: dto.quote,
      igCaption: dto.ig_caption.trim()
        ? dto.ig_caption
        : buildIgCaption({
            quote: dto.quote,
            fullName: dto.full_name,
            instagram: dto.instagram,
          }),
      liCaption: dto.li_caption?.trim()
        ? dto.li_caption
        : buildLiCaption({
            quote: dto.quote,
            fullName: dto.full_name,
            linkedin: dto.linkedin,
          }),
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
    };
  },

  toInboxItem(dto: TestimonialDto, media: TestimonialMedia): AdminInboxItem {
    const view = this.fromDto(dto, media);
    return {
      id: view.id,
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
    }),
  );
}

export function inboxItemMeta(item: Pick<AdminInboxItem, "typeLabel" | "submittedAt">) {
  return `${item.typeLabel} · ${formatSubmittedAt(item.submittedAt)}`;
}

export function adminContextLine(testimonial: AdminTestimonial) {
  return storyContextLine({
    simulation: testimonial.simulation,
    firstJob: testimonial.firstJob,
    careerChange: testimonial.careerChange,
  });
}

function formatEsAr(value: string) {
  return value.replace(/[\u00a0\u202f]/g, " ");
}

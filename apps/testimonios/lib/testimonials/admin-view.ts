import type { TestimonialRow } from "@/lib/supabase/database";
import {
  AVATARS_BUCKET,
  CAPTURES_BUCKET,
  publicStorageUrl,
} from "@/lib/supabase/storage";

import { youtubeEmbedSrc } from "./parse";
import { buildIgCaption, buildLiCaption, extractCaptionIntro } from "./quote";
import {
  careerChangeFields,
  firstJobFields,
  storyContextLine,
  typeOption,
  type CareerChangePayload,
  type FirstJobPayload,
  type TestimonialStatus,
  type TestimonialType,
} from "./types";

export type AdminTestimonial = {
  id: string;
  slug: string;
  type: TestimonialType;
  typeLabel: string;
  status: TestimonialStatus;
  fullName: string;
  email: string;
  instagram: string | null;
  linkedin: string | null;
  story: string;
  quote: string;
  igCaption: string;
  liCaption: string;
  avatarUrl: string;
  captureUrl: string | null;
  videoUrl: string | null;
  youtubeEmbedUrl: string | null;
  firstJob: FirstJobPayload | null;
  careerChange: CareerChangePayload | null;
  submittedAt: string;
  publishedAt: string | null;
  discordPostedAt: string | null;
};

export type AdminInboxItem = {
  id: string;
  typeLabel: string;
  status: TestimonialStatus;
  fullName: string;
  quote: string;
  avatarUrl: string;
  submittedAt: string;
};

export function toAdminTestimonial(row: TestimonialRow): AdminTestimonial {
  const typeLabel = typeOption(row.type).label;
  const firstJob = firstJobFields(row.payload);
  const careerChange = careerChangeFields(row.payload);

  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    typeLabel,
    status: row.status,
    fullName: row.full_name,
    email: row.email,
    instagram: row.instagram,
    linkedin: row.linkedin ?? null,
    story: row.story,
    quote: row.quote,
    igCaption:
      row.ig_caption.trim() && extractCaptionIntro(row.ig_caption)
        ? row.ig_caption
        : buildIgCaption({
            quote: row.quote,
            fullName: row.full_name,
            instagram: row.instagram,
          }),
    liCaption:
      row.li_caption?.trim() && extractCaptionIntro(row.li_caption)
        ? row.li_caption
        : buildLiCaption({
            quote: row.quote,
            fullName: row.full_name,
            linkedin: row.linkedin,
          }),
    avatarUrl: publicStorageUrl(AVATARS_BUCKET, row.avatar_path),
    captureUrl: row.capture_path
      ? publicStorageUrl(CAPTURES_BUCKET, row.capture_path)
      : null,
    videoUrl: row.video_url,
    youtubeEmbedUrl: row.video_url ? youtubeEmbedSrc(row.video_url) : null,
    firstJob,
    careerChange,
    submittedAt: row.submitted_at,
    publishedAt: row.published_at,
    discordPostedAt: row.discord_posted_at ?? null,
  };
}

export function toInboxItem(row: TestimonialRow): AdminInboxItem {
  const view = toAdminTestimonial(row);
  return {
    id: view.id,
    typeLabel: view.typeLabel,
    status: view.status,
    fullName: view.fullName,
    quote: view.quote,
    avatarUrl: view.avatarUrl,
    submittedAt: view.submittedAt,
  };
}

export function formatSubmittedAt(iso: string) {
  return formatEsAr(new Date(iso).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }));
}

function formatEsAr(value: string) {
  return value.replace(/[\u00a0\u202f]/g, " ");
}

export function adminContextLine(testimonial: AdminTestimonial) {
  return storyContextLine({
    firstJob: testimonial.firstJob,
    careerChange: testimonial.careerChange,
  });
}

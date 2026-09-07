import type { TestimonialRow } from "@/lib/supabase/database";
import {
  AVATARS_BUCKET,
  CAPTURES_BUCKET,
  publicStorageUrl,
} from "@/lib/supabase/storage";

import { youtubeEmbedSrc } from "./parse";
import {
  careerChangeFields,
  firstJobFields,
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
  story: string;
  quote: string;
  igCaption: string;
  avatarUrl: string;
  captureUrl: string | null;
  videoUrl: string | null;
  youtubeEmbedUrl: string | null;
  firstJob: FirstJobPayload | null;
  careerChange: CareerChangePayload | null;
  submittedAt: string;
  publishedAt: string | null;
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
  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    typeLabel: typeOption(row.type).label,
    status: row.status,
    fullName: row.full_name,
    email: row.email,
    instagram: row.instagram,
    story: row.story,
    quote: row.quote,
    igCaption: row.ig_caption,
    avatarUrl: publicStorageUrl(AVATARS_BUCKET, row.avatar_path),
    captureUrl: row.capture_path
      ? publicStorageUrl(CAPTURES_BUCKET, row.capture_path)
      : null,
    videoUrl: row.video_url,
    youtubeEmbedUrl: row.video_url ? youtubeEmbedSrc(row.video_url) : null,
    firstJob: firstJobFields(row.payload),
    careerChange: careerChangeFields(row.payload),
    submittedAt: row.submitted_at,
    publishedAt: row.published_at,
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
  return new Date(iso).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

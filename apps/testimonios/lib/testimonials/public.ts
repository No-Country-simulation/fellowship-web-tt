import { cache } from "react";

import type { TestimonialPublicRow } from "@/lib/supabase/database";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  AVATARS_BUCKET,
  CAPTURES_BUCKET,
  publicStorageUrl,
} from "@/lib/supabase/storage";

import { youtubeEmbedSrc } from "./parse";
import {
  careerChangeFields,
  firstJobFields,
  isTestimonialType,
  typeOption,
  type CareerChangePayload,
  type FirstJobPayload,
  type TestimonialType,
} from "./types";

export type PublicTestimonial = {
  id: string;
  slug: string;
  type: TestimonialType;
  typeLabel: string;
  fullName: string;
  story: string;
  quote: string;
  avatarUrl: string;
  captureUrl: string | null;
  videoUrl: string | null;
  youtubeEmbedUrl: string | null;
  firstJob: FirstJobPayload | null;
  careerChange: CareerChangePayload | null;
  publishedAt: string | null;
};

const loadError = "No pudimos cargar los testimonios. Probá de nuevo.";

export async function listPublishedTestimonials(): Promise<
  | { ok: true; testimonials: PublicTestimonial[] }
  | { ok: false; message: string }
> {
  if (!hasSupabasePublicEnv()) {
    return { ok: false, message: loadError };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials_public")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    return { ok: false, message: loadError };
  }

  return {
    ok: true,
    testimonials: (data ?? []).flatMap((row) => {
      const view = toPublicTestimonial(row);
      return view ? [view] : [];
    }),
  };
}

export const getPublishedTestimonialBySlug = cache(
  async (
    slug: string,
  ): Promise<
    | { ok: true; testimonial: PublicTestimonial }
    | { ok: false; notFound?: boolean; message: string }
  > => {
    if (!slug) {
      return { ok: false, notFound: true, message: "No encontramos ese testimonio." };
    }

    if (!hasSupabasePublicEnv()) {
      return { ok: false, message: loadError };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials_public")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      return { ok: false, message: loadError };
    }

    const testimonial = data ? toPublicTestimonial(data) : null;
    if (!testimonial) {
      return {
        ok: false,
        notFound: true,
        message: "No encontramos ese testimonio.",
      };
    }

    return { ok: true, testimonial };
  },
);

export function formatPublishedAt(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    dateStyle: "medium",
  });
}

function toPublicTestimonial(
  row: TestimonialPublicRow,
): PublicTestimonial | null {
  if (
    !row.id ||
    !row.slug ||
    !row.full_name ||
    !row.story ||
    !row.quote ||
    !row.avatar_path ||
    !row.type ||
    !isTestimonialType(row.type)
  ) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    typeLabel: typeOption(row.type).label,
    fullName: row.full_name,
    story: row.story,
    quote: row.quote,
    avatarUrl: publicStorageUrl(AVATARS_BUCKET, row.avatar_path),
    captureUrl: row.capture_path
      ? publicStorageUrl(CAPTURES_BUCKET, row.capture_path)
      : null,
    videoUrl: row.video_url,
    youtubeEmbedUrl: row.video_url ? youtubeEmbedSrc(row.video_url) : null,
    firstJob: firstJobFields(row.payload),
    careerChange: careerChangeFields(row.payload),
    publishedAt: row.published_at,
  };
}

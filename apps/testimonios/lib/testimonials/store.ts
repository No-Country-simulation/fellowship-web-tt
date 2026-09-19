import type { TestimonialRow } from "@/lib/supabase/database";
import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/env";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { AVATARS_BUCKET, CAPTURES_BUCKET } from "@/lib/supabase/storage";

import type { ParsedTestimonial } from "./parse";
import { TESTIMONIAL_STATUSES, type TestimonialStatus } from "./types";

export type StoredTestimonial = {
  id: string;
  slug: string;
};

const SLUG_MAX_BASE = 40;

export async function saveTestimonial(
  data: ParsedTestimonial,
): Promise<
  | { ok: true; testimonial: StoredTestimonial }
  | { ok: false; message: string }
> {
  if (!hasSupabaseServiceRoleEnv()) {
    return {
      ok: false,
      message:
        "Falta SUPABASE_SERVICE_ROLE_KEY. El envío no se puede guardar todavía.",
    };
  }

  const supabase = createServiceRoleClient();
  const id = crypto.randomUUID();
  const avatarPath = `${id}/avatar.${imageExtension(data.avatar)}`;
  const capturePath = data.capture
    ? `${id}/capture.${imageExtension(data.capture)}`
    : null;

  const avatarUpload = await uploadImage(
    supabase,
    AVATARS_BUCKET,
    avatarPath,
    data.avatar,
  );
  if (!avatarUpload.ok) {
    return avatarUpload;
  }

  if (data.capture && capturePath) {
    const captureUpload = await uploadImage(
      supabase,
      CAPTURES_BUCKET,
      capturePath,
      data.capture,
    );
    if (!captureUpload.ok) {
      await removeUploaded(supabase, AVATARS_BUCKET, avatarPath);
      return captureUpload;
    }
  }

  let lastError: string | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = buildSlug(data.fullName);
    const { error } = await supabase.from("testimonials").insert({
      id,
      type: data.type,
      status: "in_review",
      slug,
      full_name: data.fullName,
      email: data.email,
      instagram: data.instagram,
      story: data.story,
      quote: data.quote,
      ig_caption: data.igCaption,
      avatar_path: avatarPath,
      capture_path: capturePath,
      video_url: data.videoUrl,
      payload: data.payload,
      consent_at: data.consentAt,
    });

    if (!error) {
      return { ok: true, testimonial: { id, slug } };
    }

    lastError = error.message;
    if (error.code !== "23505") {
      break;
    }
  }

  await removeUploaded(supabase, AVATARS_BUCKET, avatarPath);
  if (capturePath) {
    await removeUploaded(supabase, CAPTURES_BUCKET, capturePath);
  }

  return {
    ok: false,
    message: lastError ?? "No pudimos guardar el testimonio. Probá de nuevo.",
  };
}

const missingServiceRole =
  "Falta SUPABASE_SERVICE_ROLE_KEY. El inbox no puede leer ni publicar todavía.";

export async function listTestimonials(
  status?: TestimonialStatus,
): Promise<
  | { ok: true; testimonials: TestimonialRow[] }
  | { ok: false; message: string }
> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("testimonials")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;

  if (error) {
    return {
      ok: false,
      message: "No pudimos cargar el inbox. Probá de nuevo.",
    };
  }

  return { ok: true, testimonials: data };
}

export async function countTestimonialsByStatus(): Promise<
  | { ok: true; counts: Record<TestimonialStatus, number> }
  | { ok: false; message: string }
> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  const counts = {
    in_review: 0,
    published: 0,
    rejected: 0,
  } satisfies Record<TestimonialStatus, number>;

  const results = await Promise.all(
    TESTIMONIAL_STATUSES.map(async (status) => {
      const { count, error } = await supabase
        .from("testimonials")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      return { status, count: count ?? 0, error };
    }),
  );

  if (results.some((result) => result.error)) {
    return {
      ok: false,
      message: "No pudimos cargar el inbox. Probá de nuevo.",
    };
  }

  for (const result of results) {
    counts[result.status] = result.count;
  }

  return { ok: true, counts };
}

export async function getTestimonialById(id: string): Promise<
  | { ok: true; testimonial: TestimonialRow }
  | { ok: false; message: string; notFound?: boolean }
> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message: "No pudimos cargar el testimonio. Probá de nuevo.",
    };
  }

  if (!data) {
    return {
      ok: false,
      notFound: true,
      message: "No encontramos ese testimonio.",
    };
  }

  return { ok: true, testimonial: data };
}

export async function saveReviewEdits(
  id: string,
  edits: { quote: string; igCaption: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  return updateReviewRow(id, {
    quote: edits.quote,
    ig_caption: edits.igCaption,
  });
}

export async function publishTestimonial(
  id: string,
  edits: { quote: string; igCaption: string },
): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  const updated = await updateReviewRow(
    id,
    {
      quote: edits.quote,
      ig_caption: edits.igCaption,
      status: "published",
      published_at: new Date().toISOString(),
    },
    "published",
  );

  if (!updated.ok) {
    return updated;
  }

  return { ok: true, slug: updated.slug };
}

export async function markDiscordPosted(
  id: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update({ discord_posted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "published")
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message: "No pudimos marcar el post de Discord.",
    };
  }

  if (!data) {
    return {
      ok: false,
      message: "Este envío no está publicado.",
    };
  }

  return { ok: true };
}

export async function markBufferPosted(
  id: string,
  network: "instagram" | "linkedin",
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  const postedAt = new Date().toISOString();
  const values =
    network === "instagram"
      ? { buffer_instagram_posted_at: postedAt }
      : { buffer_linkedin_posted_at: postedAt };
  const { data, error } = await supabase
    .from("testimonials")
    .update(values)
    .eq("id", id)
    .eq("status", "published")
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message: "No pudimos marcar el post de Buffer.",
    };
  }

  if (!data) {
    return {
      ok: false,
      message: "Este envío no está publicado.",
    };
  }

  return { ok: true };
}

export async function rejectTestimonial(
  id: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const updated = await updateReviewRow(id, { status: "rejected" });
  return updated.ok ? { ok: true } : updated;
}

async function updateReviewRow(
  id: string,
  values: {
    quote?: string;
    ig_caption?: string;
    status?: TestimonialStatus;
    published_at?: string;
  },
  alreadyDoneStatus?: TestimonialStatus,
): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const current = await getTestimonialById(id);
  if (!current.ok) {
    return { ok: false, message: current.message };
  }

  if (current.testimonial.status !== "in_review") {
    if (
      alreadyDoneStatus &&
      current.testimonial.status === alreadyDoneStatus
    ) {
      return { ok: true, slug: current.testimonial.slug };
    }
    return {
      ok: false,
      message: "Este envío ya no está en revisión.",
    };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update(values)
    .eq("id", id)
    .eq("status", "in_review")
    .select("slug")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message: "No pudimos guardar el cambio. Probá de nuevo.",
    };
  }

  if (!data) {
    return {
      ok: false,
      message: "Este envío ya no está en revisión.",
    };
  }

  return { ok: true, slug: data.slug };
}

function buildSlug(fullName: string) {
  const base =
    fullName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, SLUG_MAX_BASE) || "testimonio";
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${base}-${suffix}`;
}

function imageExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName === "jpeg" || fromName === "jpg") {
    return "jpg";
  }
  if (fromName === "png" || fromName === "webp") {
    return fromName;
  }
  if (file.type === "image/png") {
    return "png";
  }
  if (file.type === "image/webp") {
    return "webp";
  }
  return "jpg";
}

async function uploadImage(
  supabase: ReturnType<typeof createServiceRoleClient>,
  bucket: string,
  path: string,
  file: File,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) {
    return {
      ok: false,
      message: "No pudimos subir la imagen. Probá con jpg, png o webp.",
    };
  }

  return { ok: true };
}

async function removeUploaded(
  supabase: ReturnType<typeof createServiceRoleClient>,
  bucket: string,
  path: string,
) {
  await supabase.storage.from(bucket).remove([path]);
}

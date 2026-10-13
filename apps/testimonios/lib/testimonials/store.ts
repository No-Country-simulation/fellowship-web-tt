import { hasSupabaseServiceRoleEnv } from "@/lib/supabase/env";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { AVATARS_BUCKET, CAPTURES_BUCKET } from "@/lib/supabase/storage";

import type { ParsedTestimonial } from "./parse";

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
      country: data.country,
      email: data.email,
      instagram: data.instagram,
      linkedin: data.linkedin,
      story: data.story,
      quote: data.quote,
      ig_caption: data.igCaption,
      li_caption: data.liCaption,
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

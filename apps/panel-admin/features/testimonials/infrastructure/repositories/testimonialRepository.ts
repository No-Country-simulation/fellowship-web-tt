import type { AdminInboxData, AdminTestimonial, TestimonialStatus } from "../../types/testimonial";
import { hasInstagramChannel, hasLinkedInChannel } from "../buffer";
import type { TestimonialDto } from "../dtos/testimonialDto";
import { hasCommunityWebhook } from "../discord";
import {
  adminContextLine,
  formatSubmittedAt,
  TestimonialMapper,
} from "../mappers/testimonialMapper";
import { hasSupabaseServiceRoleEnv } from "../supabase/env";
import { createServiceRoleClient } from "../supabase/service-role";
import {
  AVATARS_BUCKET,
  CAPTURES_BUCKET,
  SHARE_CARDS_BUCKET,
  publicStorageUrl,
} from "../supabase/storage";

const missingServiceRole =
  "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. El inbox no puede leer ni publicar todavía.";

const SHARE_CARD_NAME = "instagram.png";

// Back real: tabla `testimonials` con service_role. No hay mock.
export async function loadAdminInbox(): Promise<AdminInboxData> {
  const listed = await listTestimonials();

  return {
    items: listed.ok
      ? listed.testimonials.map((row) => TestimonialMapper.toInboxItem(row, mediaFor(row)))
      : [],
    loadError: listed.ok ? null : listed.message,
  };
}

export async function getTestimonialById(id: string): Promise<
  | {
      ok: true;
      testimonial: AdminTestimonial;
      metaLine: string;
      canRetryDiscord: boolean;
      canRetryInstagram: boolean;
      canRetryLinkedin: boolean;
    }
  | { ok: false; message: string; notFound?: boolean }
> {
  const row = await getTestimonialRow(id);
  if (!row.ok) {
    return row;
  }

  const testimonial = mapTestimonial(row.testimonial);
  const published = testimonial.status === "published";
  const context = adminContextLine(testimonial);

  return {
    ok: true,
    testimonial,
    metaLine: `Enviado el ${formatSubmittedAt(testimonial.submittedAt)}${context ? ` · ${context}` : ""}`,
    canRetryDiscord: published && !testimonial.discordPostedAt && hasCommunityWebhook(),
    canRetryInstagram:
      published && !testimonial.bufferInstagramPostedAt && hasInstagramChannel(),
    canRetryLinkedin: published && !testimonial.bufferLinkedinPostedAt && hasLinkedInChannel(),
  };
}

export async function saveReviewEdits(
  id: string,
  edits: { quote: string; igCaption: string; liCaption: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  return updateReviewRow(id, {
    quote: edits.quote,
    ig_caption: edits.igCaption,
    li_caption: edits.liCaption,
  });
}

export async function publishTestimonial(
  id: string,
  edits: { quote: string; igCaption: string; liCaption: string },
): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  const updated = await updateReviewRow(
    id,
    {
      quote: edits.quote,
      ig_caption: edits.igCaption,
      li_caption: edits.liCaption,
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

/** Sube la card de Instagram o confirma que ya está. Devuelve la URL pública. */
export async function prepareShareCard(slug: string, file: File | null): Promise<string | null> {
  const path = `${slug}/${SHARE_CARD_NAME}`;
  if (file) {
    const uploaded = await uploadShareCard(path, file);
    if (!uploaded) {
      return null;
    }
  } else if (!(await shareCardExists(path))) {
    console.error("Buffer Instagram failed: missing share card");
    return null;
  }

  return publicStorageUrl(SHARE_CARDS_BUCKET, path);
}

async function listTestimonials(
  status?: TestimonialStatus,
): Promise<{ ok: true; testimonials: TestimonialDto[] } | { ok: false; message: string }> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  let query = supabase.from("testimonials").select("*").order("submitted_at", { ascending: false });
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

async function getTestimonialRow(id: string): Promise<
  | { ok: true; testimonial: TestimonialDto }
  | { ok: false; message: string; notFound?: boolean }
> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("testimonials").select("*").eq("id", id).maybeSingle();

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

async function updateReviewRow(
  id: string,
  values: {
    quote?: string;
    ig_caption?: string;
    li_caption?: string;
    status?: TestimonialStatus;
    published_at?: string;
  },
  alreadyDoneStatus?: TestimonialStatus,
): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const current = await getTestimonialRow(id);
  if (!current.ok) {
    return { ok: false, message: current.message };
  }

  if (current.testimonial.status !== "in_review") {
    if (alreadyDoneStatus && current.testimonial.status === alreadyDoneStatus) {
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

function mapTestimonial(row: TestimonialDto): AdminTestimonial {
  return TestimonialMapper.fromDto(row, mediaFor(row));
}

function mediaFor(row: TestimonialDto) {
  return {
    avatarUrl: publicStorageUrl(AVATARS_BUCKET, row.avatar_path),
    captureUrl: row.capture_path ? publicStorageUrl(CAPTURES_BUCKET, row.capture_path) : null,
  };
}

async function uploadShareCard(path: string, file: File) {
  if (!hasSupabaseServiceRoleEnv()) {
    return false;
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.storage.from(SHARE_CARDS_BUCKET).upload(path, file, {
    contentType: "image/png",
    upsert: true,
  });

  if (error) {
    console.error("Buffer share-cards upload failed");
    return false;
  }

  return true;
}

async function shareCardExists(path: string) {
  if (!hasSupabaseServiceRoleEnv()) {
    return false;
  }

  const slash = path.lastIndexOf("/");
  const folder = slash === -1 ? "" : path.slice(0, slash);
  const name = slash === -1 ? path : path.slice(slash + 1);
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.storage.from(SHARE_CARDS_BUCKET).list(folder, { search: name });

  if (error) {
    return false;
  }

  return Boolean(data?.some((object) => object.name === name));
}

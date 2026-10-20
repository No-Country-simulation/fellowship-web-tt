import type { BufferPostStates, ShareChannels } from "../../types/share";
import type {
  AdminInboxData,
  AdminTestimonial,
  TestimonialStatus,
} from "../../types/testimonial";
import { getPost, hasInstagramChannel, hasLinkedInChannel } from "../buffer";
import type { TestimonialDto } from "../dtos/testimonialDto";
import { hasCommunityWebhook } from "../discord";
import { TestimonialMapper } from "../mappers/testimonialMapper";
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
      channels: ShareChannels;
    }
  | { ok: false; message: string; notFound?: boolean }
> {
  const row = await getTestimonialRow(id);
  if (!row.ok) {
    return row;
  }

  const testimonial = mapTestimonial(row.testimonial);

  return {
    ok: true,
    testimonial,
    channels: {
      discord: hasCommunityWebhook(),
      instagram: hasInstagramChannel(),
      linkedin: hasLinkedInChannel(),
    },
  };
}

/** `li_caption` guarda el mismo texto: hay una sola publicación para las tres redes. */
export async function saveReviewEdits(
  id: string,
  edits: { quote: string; caption: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  return updateReviewRow(id, {
    quote: edits.quote,
    ig_caption: edits.caption,
    li_caption: edits.caption,
  });
}

export async function publishTestimonial(
  id: string,
  edits: { quote: string; caption: string },
): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  const updated = await updateReviewRow(
    id,
    {
      quote: edits.quote,
      ig_caption: edits.caption,
      li_caption: edits.caption,
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
  postId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  const postedAt = new Date().toISOString();
  const values =
    network === "instagram"
      ? { buffer_instagram_posted_at: postedAt, buffer_instagram_post_id: postId }
      : { buffer_linkedin_posted_at: postedAt, buffer_linkedin_post_id: postId };
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

/** URL pública de la card que se guardó al publicar, o `null` si no quedó ninguna. */
export async function storedShareCardUrl(slug: string): Promise<string | null> {
  const path = `${slug}/${SHARE_CARD_NAME}`;
  return (await shareCardExists(path)) ? publicStorageUrl(SHARE_CARDS_BUCKET, path) : null;
}

/** Estado de los posts de Buffer con id guardado. Sin id (envíos viejos) la red queda en `null`. */
export async function bufferPostStates(testimonial: AdminTestimonial): Promise<BufferPostStates> {
  const { bufferInstagramPostId, bufferLinkedinPostId } = testimonial;
  const [instagram, linkedin] = await Promise.all([
    bufferInstagramPostId ? getPost(bufferInstagramPostId) : null,
    bufferLinkedinPostId ? getPost(bufferLinkedinPostId) : null,
  ]);
  return { instagram, linkedin };
}

/** Sube la card del post (la misma para las tres redes) o confirma que ya está. Devuelve la URL pública. */
export async function prepareShareCard(slug: string, file: File | null): Promise<string | null> {
  const path = `${slug}/${SHARE_CARD_NAME}`;
  if (file) {
    const uploaded = await uploadShareCard(path, file);
    if (!uploaded) {
      return null;
    }
  } else if (!(await shareCardExists(path))) {
    console.error("Share failed: missing share card");
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
    console.error("Share card upload failed");
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

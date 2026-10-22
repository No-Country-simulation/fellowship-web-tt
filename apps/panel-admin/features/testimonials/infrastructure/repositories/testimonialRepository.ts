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

/** `testimonials.id` es uuid. Otro formato hace fallar PostgREST en lugar de devolver vacío. */
const TESTIMONIAL_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const testimonialNotFound = {
  ok: false as const,
  notFound: true as const,
  message: "No encontramos ese testimonio.",
};

export function isTestimonialId(id: string) {
  return TESTIMONIAL_ID.test(id);
}

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

/** `li_caption` guarda el mismo texto que `ig_caption`. Discord no usa este caption. */
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
): Promise<{ ok: true; slug: string } | { ok: false; lost: true } | { ok: false; message: string }> {
  const updated = await updateReviewRow(id, {
    quote: edits.quote,
    ig_caption: edits.caption,
    li_caption: edits.caption,
    status: "published",
    published_at: new Date().toISOString(),
  });

  if (!updated.ok) {
    if (updated.lost) {
      return { ok: false, lost: true };
    }
    return { ok: false, message: updated.message };
  }

  return { ok: true, slug: updated.slug };
}

/**
 * La card no se pudo guardar: vuelve a revisión solo si sigue publicado.
 * Otro request no llega a subir, así que no pisa el PNG.
 */
export async function revertPublishedTestimonial(
  id: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isTestimonialId(id)) {
    return { ok: false, message: testimonialNotFound.message };
  }

  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update({ status: "in_review", published_at: null })
    .eq("id", id)
    .eq("status", "published")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      message: "No pudimos guardar la imagen. El testimonio quedó publicado y no se posteó.",
    };
  }

  return { ok: true };
}

export type ShareClaim = "claimed" | "taken" | "error";

/** Reserva Discord solo si la fecha sigue vacía y el envío está publicado. */
export async function claimDiscordPost(id: string): Promise<ShareClaim> {
  return claimPostedAt(id, "discord_posted_at");
}

/** Suelta la reserva si el webhook no salió, para que Reintentar pueda. */
export async function releaseDiscordPost(id: string): Promise<void> {
  await releasePostedAt(id, "discord_posted_at");
}

/** Reserva Instagram o LinkedIn solo si esa fecha sigue vacía. No guarda el id del post. */
export async function claimBufferPost(
  id: string,
  network: "instagram" | "linkedin",
): Promise<ShareClaim> {
  return claimPostedAt(
    id,
    network === "instagram" ? "buffer_instagram_posted_at" : "buffer_linkedin_posted_at",
  );
}

export async function releaseBufferPost(
  id: string,
  network: "instagram" | "linkedin",
): Promise<void> {
  await releasePostedAt(
    id,
    network === "instagram" ? "buffer_instagram_posted_at" : "buffer_linkedin_posted_at",
  );
}

/**
 * Suelta fecha e id de un post que Buffer marcó en error.
 * El `where` exige el id consultado: si dos reintentos se cruzan, solo uno borra.
 */
export async function clearErroredBufferPost(
  id: string,
  network: "instagram" | "linkedin",
  postId: string,
): Promise<boolean> {
  if (!isTestimonialId(id) || !postId) {
    return false;
  }

  if (!hasSupabaseServiceRoleEnv()) {
    return false;
  }

  const postIdColumn =
    network === "instagram" ? "buffer_instagram_post_id" : "buffer_linkedin_post_id";
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update(clearedBufferPost(network))
    .eq("id", id)
    .eq("status", "published")
    .eq(postIdColumn, postId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Buffer error retry clear failed");
    return false;
  }

  return Boolean(data);
}

/**
 * El post de Buffer ya existe. Si esto falla, la fecha de la reserva queda:
 * la ficha dice que salió y Reintentar no crea otro.
 */
export async function saveBufferPostId(
  id: string,
  network: "instagram" | "linkedin",
  postId: string,
): Promise<boolean> {
  if (!isTestimonialId(id)) {
    return false;
  }

  if (!hasSupabaseServiceRoleEnv()) {
    return false;
  }

  const values =
    network === "instagram"
      ? { buffer_instagram_post_id: postId }
      : { buffer_linkedin_post_id: postId };
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update(values)
    .eq("id", id)
    .eq("status", "published")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Buffer post id was not saved");
    return false;
  }

  return true;
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
  if (!isTestimonialId(id)) {
    return testimonialNotFound;
  }

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
    return testimonialNotFound;
  }

  return { ok: true, testimonial: data };
}

type PostedAtColumn =
  | "discord_posted_at"
  | "buffer_instagram_posted_at"
  | "buffer_linkedin_posted_at";

async function claimPostedAt(id: string, column: PostedAtColumn): Promise<ShareClaim> {
  if (!isTestimonialId(id)) {
    return "error";
  }

  if (!hasSupabaseServiceRoleEnv()) {
    return "error";
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update(postedAtValue(column, new Date().toISOString()))
    .eq("id", id)
    .eq("status", "published")
    .is(column, null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Share claim failed");
    return "error";
  }

  return data ? "claimed" : "taken";
}

async function releasePostedAt(id: string, column: PostedAtColumn): Promise<void> {
  if (!isTestimonialId(id) || !hasSupabaseServiceRoleEnv()) {
    return;
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("testimonials")
    .update(postedAtValue(column, null))
    .eq("id", id)
    .eq("status", "published");

  if (error) {
    console.error("Share release failed");
  }
}

function postedAtValue(column: PostedAtColumn, value: string | null) {
  if (column === "discord_posted_at") {
    return { discord_posted_at: value };
  }
  if (column === "buffer_instagram_posted_at") {
    return { buffer_instagram_posted_at: value };
  }
  return { buffer_linkedin_posted_at: value };
}

function clearedBufferPost(network: "instagram" | "linkedin") {
  if (network === "instagram") {
    return { buffer_instagram_posted_at: null, buffer_instagram_post_id: null };
  }
  return { buffer_linkedin_posted_at: null, buffer_linkedin_post_id: null };
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
): Promise<{ ok: true; slug: string } | { ok: false; message: string; lost?: boolean }> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const current = await getTestimonialRow(id);
  if (!current.ok) {
    return { ok: false, message: current.message };
  }

  if (current.testimonial.status !== "in_review") {
    return {
      ok: false,
      lost: current.testimonial.status === "published",
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
      lost: true,
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

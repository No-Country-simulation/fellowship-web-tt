import { SHARE_CARD_MAX_BYTES, type ShareOutcome, type ShareResult } from "../types/share";
import type { AdminTestimonial } from "../types/testimonial";
import { createPost, getPost, hasInstagramChannel, hasLinkedInChannel } from "./buffer";
import { buildDiscordCaption } from "./quote";
import { hasCommunityWebhook, postCommunityTestimonial } from "./discord";
import {
  claimBufferPost,
  claimDiscordPost,
  clearErroredBufferPost,
  prepareShareCard,
  releaseBufferPost,
  releaseDiscordPost,
  saveBufferPostId,
} from "./repositories/testimonialRepository";

type ShareSource = Pick<
  AdminTestimonial,
  | "id"
  | "slug"
  | "fullName"
  | "type"
  | "avatarUrl"
  | "quote"
  | "igCaption"
  | "liCaption"
  | "discordCaption"
  | "videoUrl"
  | "discordPostedAt"
  | "bufferInstagramPostedAt"
  | "bufferLinkedinPostedAt"
>;

export type ShareCardRead =
  | { status: "ok"; file: File }
  | { status: "missing" }
  | { status: "too_large" };

export function readShareCard(formData: FormData): ShareCardRead {
  const value = formData.get("share_card");
  if (!(value instanceof File) || value.size === 0) {
    return { status: "missing" };
  }
  const png = value.type === "image/png" || value.name.toLowerCase().endsWith(".png");
  if (!png) {
    return { status: "missing" };
  }
  if (value.size > SHARE_CARD_MAX_BYTES) {
    return { status: "too_large" };
  }
  return { status: "ok", file: value };
}

/**
 * Instagram o LinkedIn en error vuelven a poder postearse: se consulta Buffer con el
 * id guardado y, si el estado es `error`, se borran fecha e id. La red queda sin fecha
 * solo en este objeto si ese update ganó, y `sharePublished` reserva y postea.
 * Si Buffer no responde, o no hay id, la fecha no se toca.
 */
export async function prepareErroredBufferRetries(
  testimonial: AdminTestimonial,
): Promise<AdminTestimonial> {
  const [instagram, linkedin] = await Promise.all([
    clearBufferNetworkInError(testimonial, "instagram"),
    clearBufferNetworkInError(testimonial, "linkedin"),
  ]);

  if (!instagram && !linkedin) {
    return testimonial;
  }

  return {
    ...testimonial,
    bufferInstagramPostedAt: instagram ? null : testimonial.bufferInstagramPostedAt,
    bufferLinkedinPostedAt: linkedin ? null : testimonial.bufferLinkedinPostedAt,
    bufferInstagramPostId: instagram ? null : testimonial.bufferInstagramPostId,
    bufferLinkedinPostId: linkedin ? null : testimonial.bufferLinkedinPostId,
  };
}

async function clearBufferNetworkInError(
  testimonial: AdminTestimonial,
  network: "instagram" | "linkedin",
): Promise<boolean> {
  const postId =
    network === "instagram" ? testimonial.bufferInstagramPostId : testimonial.bufferLinkedinPostId;
  const postedAt =
    network === "instagram" ? testimonial.bufferInstagramPostedAt : testimonial.bufferLinkedinPostedAt;
  const configured = network === "instagram" ? hasInstagramChannel() : hasLinkedInChannel();

  if (!configured || !postedAt || !postId) {
    return false;
  }

  const state = await getPost(postId);
  if (!state || state.status !== "error") {
    return false;
  }

  return clearErroredBufferPost(testimonial.id, network, postId);
}

/**
 * Una sola card para las tres redes. Cada red lleva su texto.
 * Discord tiene el suyo: sin mención ni hashtags; la cita queda en la imagen.
 * Cada red se reserva en la fila antes de la llamada. Si la reserva no toca
 * ninguna fila, no se llama a Discord ni a Buffer.
 */
export async function sharePublished(
  testimonial: ShareSource,
  card: File | null,
): Promise<ShareResult> {
  const pending = {
    discord: hasCommunityWebhook() && !testimonial.discordPostedAt,
    instagram: hasInstagramChannel() && !testimonial.bufferInstagramPostedAt,
    linkedin: hasLinkedInChannel() && !testimonial.bufferLinkedinPostedAt,
  };

  if (!pending.discord && !pending.instagram && !pending.linkedin) {
    return { discord: "skipped", instagram: "skipped", linkedin: "skipped" };
  }

  const imageUrl = await prepareShareCard(testimonial.slug, card);
  if (!imageUrl) {
    return {
      discord: pending.discord ? "failed" : "skipped",
      instagram: pending.instagram ? "failed" : "skipped",
      linkedin: pending.linkedin ? "failed" : "skipped",
    };
  }

  const [discord, instagram, linkedin] = await Promise.all([
    pending.discord ? postDiscord(testimonial, imageUrl) : ("skipped" as const),
    pending.instagram ? postBuffer(testimonial, "instagram", imageUrl) : ("skipped" as const),
    pending.linkedin ? postBuffer(testimonial, "linkedin", imageUrl) : ("skipped" as const),
  ]);

  return { discord, instagram, linkedin };
}

async function postDiscord(testimonial: ShareSource, imageUrl: string): Promise<ShareOutcome> {
  const claim = await claimDiscordPost(testimonial.id);
  if (claim !== "claimed") {
    return claim === "taken" ? "skipped" : "failed";
  }

  // Publicados anteriores a la migración tienen discord_caption vacío.
  // El fallback no se guarda: solo es el texto del embed.
  const text = testimonial.discordCaption.trim()
    ? testimonial.discordCaption
    : buildDiscordCaption({
        fullName: testimonial.fullName,
        type: testimonial.type,
        videoUrl: testimonial.videoUrl,
      });

  const status = await postCommunityTestimonial({
    fullName: testimonial.fullName,
    avatarUrl: testimonial.avatarUrl,
    text,
    imageUrl,
  });
  if (status !== "posted") {
    await releaseDiscordPost(testimonial.id);
    return status;
  }

  return "posted";
}

async function postBuffer(
  testimonial: ShareSource,
  network: "instagram" | "linkedin",
  imageUrl: string,
): Promise<ShareOutcome> {
  const claim = await claimBufferPost(testimonial.id, network);
  if (claim !== "claimed") {
    return claim === "taken" ? "skipped" : "failed";
  }

  const created = await createPost({
    network,
    text: network === "instagram" ? testimonial.igCaption : testimonial.liCaption,
    imageUrl,
  });
  if (created.status !== "created") {
    await releaseBufferPost(testimonial.id, network);
    return created.status === "skipped" ? "skipped" : "failed";
  }

  await saveBufferPostId(testimonial.id, network, created.post.id);
  return "posted";
}

import type { ShareOutcome, ShareResult } from "../types/share";
import type { AdminTestimonial } from "../types/testimonial";
import { createPost, hasInstagramChannel, hasLinkedInChannel } from "./buffer";
import type { BufferCreatePostResult } from "./buffer";
import { hasCommunityWebhook, postCommunityTestimonial } from "./discord";
import { prepareShareCard } from "./repositories/testimonialRepository";

const SHARE_CARD_MAX_BYTES = 5 * 1024 * 1024;

type ShareSource = Pick<
  AdminTestimonial,
  | "slug"
  | "fullName"
  | "avatarUrl"
  | "caption"
  | "videoUrl"
  | "discordPostedAt"
  | "bufferInstagramPostedAt"
  | "bufferLinkedinPostedAt"
>;

export function readShareCard(formData: FormData): File | null {
  const value = formData.get("share_card");
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }
  const png = value.type === "image/png" || value.name.toLowerCase().endsWith(".png");
  if (!png || value.size > SHARE_CARD_MAX_BYTES) {
    return null;
  }
  return value;
}

/**
 * Una sola publicación para las tres redes: el mismo texto y la misma card.
 * Solo manda a las redes configuradas que todavía no salieron.
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
    pending.discord
      ? postCommunityTestimonial({
          fullName: testimonial.fullName,
          avatarUrl: testimonial.avatarUrl,
          caption: testimonial.caption,
          imageUrl,
          videoUrl: testimonial.videoUrl,
        })
      : ("skipped" as const),
    pending.instagram
      ? createPost({ network: "instagram", text: testimonial.caption, imageUrl }).then(toOutcome)
      : ("skipped" as const),
    pending.linkedin
      ? createPost({
          network: "linkedin",
          text: testimonial.caption,
          imageUrl,
          videoUrl: testimonial.videoUrl,
        }).then(toOutcome)
      : ("skipped" as const),
  ]);

  return { discord, instagram, linkedin };
}

function toOutcome(result: BufferCreatePostResult): ShareOutcome {
  if (result.status === "created") {
    return "posted";
  }
  return result.status;
}

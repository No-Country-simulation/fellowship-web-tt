import type { AdminTestimonial } from "../types/testimonial";
import {
  createPost,
  hasInstagramChannel,
  hasLinkedInChannel,
} from "./buffer";
import type { BufferCreatePostResult } from "./buffer";
import { prepareShareCard } from "./repositories/testimonialRepository";

const SHARE_CARD_MAX_BYTES = 5 * 1024 * 1024;

export type BufferShareResult = {
  instagram: BufferCreatePostResult;
  linkedin: BufferCreatePostResult;
};

type ShareSource = Pick<
  AdminTestimonial,
  | "slug"
  | "igCaption"
  | "liCaption"
  | "captureUrl"
  | "videoUrl"
  | "bufferInstagramPostedAt"
  | "bufferLinkedinPostedAt"
>;

export function readIgCard(formData: FormData): File | null {
  const value = formData.get("ig_card");
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }
  const png = value.type === "image/png" || value.name.toLowerCase().endsWith(".png");
  if (!png || value.size > SHARE_CARD_MAX_BYTES) {
    return null;
  }
  return value;
}

export async function sharePublishedToBuffer(
  testimonial: ShareSource,
  igCard: File | null,
): Promise<BufferShareResult> {
  const [instagram, linkedin] = await Promise.all([
    testimonial.bufferInstagramPostedAt ? alreadyPosted() : shareInstagram(testimonial, igCard),
    testimonial.bufferLinkedinPostedAt ? alreadyPosted() : shareLinkedIn(testimonial),
  ]);

  return { instagram, linkedin };
}

async function shareInstagram(
  testimonial: ShareSource,
  igCard: File | null,
): Promise<BufferCreatePostResult> {
  if (!hasInstagramChannel()) {
    return { status: "skipped" };
  }

  const imageUrl = await prepareShareCard(testimonial.slug, igCard);
  if (!imageUrl) {
    return { status: "failed" };
  }

  return createPost({
    network: "instagram",
    text: testimonial.igCaption,
    imageUrl,
  });
}

async function shareLinkedIn(testimonial: ShareSource): Promise<BufferCreatePostResult> {
  if (!hasLinkedInChannel()) {
    return { status: "skipped" };
  }

  return createPost({
    network: "linkedin",
    text: testimonial.liCaption || testimonial.igCaption,
    imageUrl: testimonial.captureUrl,
    videoUrl: testimonial.videoUrl,
  });
}

function alreadyPosted(): BufferCreatePostResult {
  return {
    status: "created",
    post: { id: "", status: "scheduled", sentAt: null },
  };
}

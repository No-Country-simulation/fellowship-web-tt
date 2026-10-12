"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { BufferCreatePostResult } from "../infrastructure/buffer";
import { readIgCard, sharePublishedToBuffer } from "../infrastructure/buffer-share";
import { postCommunityTestimonial } from "../infrastructure/discord";
import type { DiscordPostStatus } from "../infrastructure/discord";
import {
  buildIgCaption,
  buildLiCaption,
  CAPTION_EDIT_MAX_CHARS,
  QUOTE_EDIT_MAX_CHARS,
} from "../infrastructure/quote";
import {
  getTestimonialById,
  markBufferPosted,
  markDiscordPosted,
  publishTestimonial,
  rejectTestimonial,
  saveReviewEdits,
} from "../infrastructure/repositories/testimonialRepository";
import type { ReviewState } from "../types/reviewState";
import type { AdminTestimonial } from "../types/testimonial";

export async function reviewTestimonial(
  id: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const intent = formData.get("intent");
  if (intent !== "save" && intent !== "publish" && intent !== "reject") {
    return { status: "error", message: "Acción no válida." };
  }

  const current = await getTestimonialById(id);
  if (!current.ok) {
    return { status: "error", message: current.message };
  }

  if (intent === "reject") {
    const rejected = await rejectTestimonial(id);
    if (!rejected.ok) {
      return { status: "error", message: rejected.message };
    }
    revalidateTestimonials(id);
    redirect("/testimonials");
  }

  const quote = readString(formData, "quote");
  if (!quote) {
    return { status: "error", message: "El quote no puede estar vacío." };
  }
  if (quote.length > QUOTE_EDIT_MAX_CHARS) {
    return {
      status: "error",
      message: `El quote puede tener hasta ${QUOTE_EDIT_MAX_CHARS} caracteres.`,
    };
  }

  let igCaption = readString(formData, "ig_caption");
  if (!igCaption) {
    igCaption = buildIgCaption({
      quote,
      fullName: current.testimonial.fullName,
      instagram: current.testimonial.instagram,
    });
  }
  if (igCaption.length > CAPTION_EDIT_MAX_CHARS) {
    return {
      status: "error",
      message: `El caption de Instagram puede tener hasta ${CAPTION_EDIT_MAX_CHARS} caracteres.`,
    };
  }

  let liCaption = readString(formData, "li_caption");
  if (!liCaption) {
    liCaption = buildLiCaption({
      quote,
      fullName: current.testimonial.fullName,
      linkedin: current.testimonial.linkedin,
    });
  }
  if (liCaption.length > CAPTION_EDIT_MAX_CHARS) {
    return {
      status: "error",
      message: `El caption de LinkedIn puede tener hasta ${CAPTION_EDIT_MAX_CHARS} caracteres.`,
    };
  }

  if (intent === "save") {
    const saved = await saveReviewEdits(id, { quote, igCaption, liCaption });
    if (!saved.ok) {
      return { status: "error", message: saved.message };
    }
    revalidateTestimonials(id);
    return { status: "saved" };
  }

  const published = await publishTestimonial(id, { quote, igCaption, liCaption });
  if (!published.ok) {
    return { status: "error", message: published.message };
  }

  const latest = await getTestimonialById(id);
  const discord = latest.ok ? await postCommunityTestimonial(latest.testimonial) : "failed";

  if (discord === "posted") {
    await markDiscordPosted(id);
  }

  const buffer = latest.ok
    ? await sharePublishedToBuffer(latest.testimonial, readIgCard(formData))
    : { instagram: failedBuffer(), linkedin: failedBuffer() };

  if (latest.ok) {
    await recordBufferShare(id, latest.testimonial, buffer);
  }

  revalidateTestimonials(id);
  redirectPublished(id, discord, buffer.instagram, buffer.linkedin);
}

export async function retryCommunityDiscord(id: string) {
  const current = await getTestimonialById(id);
  if (!current.ok) {
    redirect("/testimonials");
  }

  if (current.testimonial.status !== "published") {
    redirect(`/testimonials/${id}`);
  }

  if (current.testimonial.discordPostedAt) {
    redirect(`/testimonials/${id}?discord=ok`);
  }

  const discord = await postCommunityTestimonial(current.testimonial);
  if (discord === "posted") {
    await markDiscordPosted(id);
    revalidateTestimonials(id);
    redirect(`/testimonials/${id}?discord=ok`);
  }

  revalidateTestimonials(id);

  if (discord === "skipped") {
    redirect(`/testimonials/${id}`);
  }

  redirect(`/testimonials/${id}?discord=failed`);
}

export async function retryBufferShare(id: string, formData: FormData) {
  const current = await getTestimonialById(id);
  if (!current.ok) {
    redirect("/testimonials");
  }

  if (current.testimonial.status !== "published") {
    redirect(`/testimonials/${id}`);
  }

  const buffer = await sharePublishedToBuffer(current.testimonial, readIgCard(formData));
  await recordBufferShare(id, current.testimonial, buffer);
  revalidateTestimonials(id);
  redirectPublished(id, "skipped", buffer.instagram, buffer.linkedin);
}

function revalidateTestimonials(id: string) {
  revalidatePath("/testimonials");
  revalidatePath(`/testimonials/${id}`);
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function failedBuffer(): BufferCreatePostResult {
  return { status: "failed" };
}

async function recordBufferShare(
  id: string,
  testimonial: Pick<AdminTestimonial, "bufferInstagramPostedAt" | "bufferLinkedinPostedAt">,
  buffer: {
    instagram: BufferCreatePostResult;
    linkedin: BufferCreatePostResult;
  },
) {
  if (buffer.instagram.status === "created" && !testimonial.bufferInstagramPostedAt) {
    await markBufferPosted(id, "instagram");
  }
  if (buffer.linkedin.status === "created" && !testimonial.bufferLinkedinPostedAt) {
    await markBufferPosted(id, "linkedin");
  }
}

function redirectPublished(
  id: string,
  discord: DiscordPostStatus,
  instagram: BufferCreatePostResult,
  linkedin: BufferCreatePostResult,
): never {
  const params = new URLSearchParams();
  if (discord === "failed") {
    params.set("discord", "failed");
  } else if (discord === "posted") {
    params.set("discord", "ok");
  }
  if (instagram.status === "failed" || linkedin.status === "failed") {
    params.set("buffer", "failed");
  } else if (instagram.status === "created" || linkedin.status === "created") {
    params.set("buffer", "ok");
  }
  const query = params.toString();
  redirect(query ? `/testimonials/${id}?${query}` : `/testimonials/${id}`);
}

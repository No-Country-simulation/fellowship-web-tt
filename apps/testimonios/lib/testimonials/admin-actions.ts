"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import type { BufferCreatePostResult } from "@/lib/buffer";
import { postCommunityTestimonial } from "@/lib/discord";
import type { DiscordPostStatus } from "@/lib/discord";

import {
  readIgCard,
  sharePublishedToBuffer,
} from "./buffer-share";
import { buildIgCaption, CAPTION_EDIT_MAX_CHARS, QUOTE_EDIT_MAX_CHARS } from "./quote";
import {
  getTestimonialById,
  markBufferPosted,
  markDiscordPosted,
  publishTestimonial,
  rejectTestimonial,
  saveReviewEdits,
} from "./store";
import type { ReviewState } from "./review-state";
import {
  careerChangeFields,
  firstJobFields,
  storyContextLine,
  typeOption,
} from "./types";

export async function reviewTestimonial(
  id: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  await requireAdmin();

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
    revalidateAdmin(id, current.testimonial.slug);
    redirect("/admin");
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
      fullName: current.testimonial.full_name,
      instagram: current.testimonial.instagram,
      typeLabel: typeOption(current.testimonial.type).label,
      contextLine: storyContextLine({
        firstJob: firstJobFields(current.testimonial.payload),
        careerChange: careerChangeFields(current.testimonial.payload),
      }),
    });
  }
  if (igCaption.length > CAPTION_EDIT_MAX_CHARS) {
    return {
      status: "error",
      message: `El caption puede tener hasta ${CAPTION_EDIT_MAX_CHARS} caracteres.`,
    };
  }

  if (intent === "save") {
    const saved = await saveReviewEdits(id, { quote, igCaption });
    if (!saved.ok) {
      return { status: "error", message: saved.message };
    }
    revalidateAdmin(id, current.testimonial.slug);
    return { status: "saved" };
  }

  const published = await publishTestimonial(id, { quote, igCaption });
  if (!published.ok) {
    return { status: "error", message: published.message };
  }

  const latest = await getTestimonialById(id);
  const discord = latest.ok
    ? await postCommunityTestimonial(latest.testimonial)
    : "failed";

  if (discord === "posted") {
    await markDiscordPosted(id);
  }

  const buffer = latest.ok
    ? await sharePublishedToBuffer(latest.testimonial, readIgCard(formData))
    : { instagram: failedBuffer(), linkedin: failedBuffer() };

  if (latest.ok) {
    await recordBufferShare(id, latest.testimonial, buffer);
  }

  revalidateAdmin(id, published.slug);
  redirectPublished(id, discord, buffer.instagram, buffer.linkedin);
}

export async function retryCommunityDiscord(id: string) {
  await requireAdmin();

  const current = await getTestimonialById(id);
  if (!current.ok) {
    redirect("/admin");
  }

  if (current.testimonial.status !== "published") {
    redirect(`/admin/${id}`);
  }

  if (current.testimonial.discord_posted_at) {
    redirect(`/admin/${id}?discord=ok`);
  }

  const discord = await postCommunityTestimonial(current.testimonial);
  if (discord === "posted") {
    await markDiscordPosted(id);
    revalidateAdmin(id, current.testimonial.slug);
    redirect(`/admin/${id}?discord=ok`);
  }

  revalidateAdmin(id, current.testimonial.slug);

  if (discord === "skipped") {
    redirect(`/admin/${id}`);
  }

  redirect(`/admin/${id}?discord=failed`);
}

export async function retryBufferShare(id: string, formData: FormData) {
  await requireAdmin();

  const current = await getTestimonialById(id);
  if (!current.ok) {
    redirect("/admin");
  }

  if (current.testimonial.status !== "published") {
    redirect(`/admin/${id}`);
  }

  const buffer = await sharePublishedToBuffer(
    current.testimonial,
    readIgCard(formData),
  );
  await recordBufferShare(id, current.testimonial, buffer);
  revalidateAdmin(id, current.testimonial.slug);
  redirectPublished(id, "skipped", buffer.instagram, buffer.linkedin);
}

function revalidateAdmin(id: string, slug: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  revalidatePath("/");
  revalidatePath(`/t/${slug}`);
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
  row: {
    buffer_instagram_posted_at: string | null;
    buffer_linkedin_posted_at: string | null;
  },
  buffer: {
    instagram: BufferCreatePostResult;
    linkedin: BufferCreatePostResult;
  },
) {
  if (buffer.instagram.status === "created" && !row.buffer_instagram_posted_at) {
    await markBufferPosted(id, "instagram");
  }
  if (buffer.linkedin.status === "created" && !row.buffer_linkedin_posted_at) {
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
  redirect(query ? `/admin/${id}?${query}` : `/admin/${id}`);
}

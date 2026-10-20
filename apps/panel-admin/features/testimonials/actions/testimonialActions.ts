"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildPostCaption, CAPTION_EDIT_MAX_CHARS, QUOTE_EDIT_MAX_CHARS } from "../infrastructure/quote";
import {
  getTestimonialById,
  markBufferPosted,
  markDiscordPosted,
  prepareShareCard,
  publishTestimonial,
  rejectTestimonial,
  saveReviewEdits,
  storedShareCardUrl,
} from "../infrastructure/repositories/testimonialRepository";
import { readShareCard, sharePublished } from "../infrastructure/share";
import type { ReviewState } from "../types/reviewState";
import type { ShareReport, ShareResult } from "../types/share";

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

  let caption = readString(formData, "caption");
  if (!caption) {
    caption = buildPostCaption({
      quote,
      fullName: current.testimonial.fullName,
      instagram: current.testimonial.instagram,
      linkedin: current.testimonial.linkedin,
    });
  }
  if (caption.length > CAPTION_EDIT_MAX_CHARS) {
    return {
      status: "error",
      message: `El texto del post puede tener hasta ${CAPTION_EDIT_MAX_CHARS} caracteres.`,
    };
  }

  if (intent === "save") {
    const saved = await saveReviewEdits(id, { quote, caption });
    if (!saved.ok) {
      return { status: "error", message: saved.message };
    }
    revalidateTestimonials(id);
    return { status: "saved" };
  }

  if (current.testimonial.status !== "in_review") {
    return { status: "error", message: "Este envío ya no está en revisión." };
  }

  const card = readShareCard(formData);
  if (!card) {
    return { status: "error", message: "No llegó la imagen. El testimonio no se publicó." };
  }

  const cardUrl = await prepareShareCard(current.testimonial.slug, card);
  if (!cardUrl) {
    return { status: "error", message: "No pudimos guardar la imagen. El testimonio no se publicó." };
  }

  const published = await publishTestimonial(id, { quote, caption });
  if (!published.ok) {
    return { status: "error", message: published.message };
  }

  const latest = await getTestimonialById(id);
  const share: ShareReport = latest.ok
    ? await sharePublished(latest.testimonial, null)
    : {
        result: { discord: "failed", instagram: "failed", linkedin: "failed" },
        bufferPostIds: { instagram: null, linkedin: null },
      };

  await recordShare(id, share);
  revalidateTestimonials(id);
  redirectShared(id, share.result);
}

/** Reintenta las redes que faltan con la card guardada al publicar. Solo sube una si no quedó ninguna. */
export async function retryShare(id: string, formData: FormData) {
  const current = await getTestimonialById(id);
  if (!current.ok) {
    redirect("/testimonials");
  }

  if (current.testimonial.status !== "published") {
    redirect(`/testimonials/${id}`);
  }

  const stored = await storedShareCardUrl(current.testimonial.slug);
  const share = await sharePublished(
    current.testimonial,
    stored ? null : readShareCard(formData),
  );
  await recordShare(id, share);
  revalidateTestimonials(id);
  redirectShared(id, share.result);
}

function revalidateTestimonials(id: string) {
  revalidatePath("/testimonials");
  revalidatePath(`/testimonials/${id}`);
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function recordShare(id: string, { result, bufferPostIds }: ShareReport) {
  const { instagram, linkedin } = bufferPostIds;
  await Promise.all([
    result.discord === "posted" ? markDiscordPosted(id) : null,
    result.instagram === "posted" && instagram ? markBufferPosted(id, "instagram", instagram) : null,
    result.linkedin === "posted" && linkedin ? markBufferPosted(id, "linkedin", linkedin) : null,
  ]);
}

function redirectShared(id: string, share: ShareResult): never {
  const outcomes = Object.values(share);
  if (outcomes.includes("failed")) {
    redirect(`/testimonials/${id}?share=failed`);
  }
  if (outcomes.includes("posted")) {
    redirect(`/testimonials/${id}?share=ok`);
  }
  redirect(`/testimonials/${id}`);
}

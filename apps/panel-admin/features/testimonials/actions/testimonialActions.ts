"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { inboxHref, inboxQueryFromField } from "../infrastructure/inboxQuery";
import { hasInstagramChannel, hasLinkedInChannel } from "../infrastructure/buffer";
import { hasCommunityWebhook } from "../infrastructure/discord";
import { CAPTION_MAX_CHARS, QUOTE_EDIT_MAX_CHARS } from "../infrastructure/quote";
import {
  getTestimonialById,
  isTestimonialId,
  prepareShareCard,
  publishTestimonial,
  rejectTestimonial,
  revertPublishedTestimonial,
  saveReviewEdits,
  storedShareCardUrl,
} from "../infrastructure/repositories/testimonialRepository";
import { prepareErroredBufferRetries, readShareCard, sharePublished } from "../infrastructure/share";
import type { ReviewState } from "../types/reviewState";
import {
  SHARE_CARD_TOO_LARGE_MESSAGE,
  SHARE_CARD_TOO_LARGE_PUBLISH_MESSAGE,
  type ShareResult,
} from "../types/share";

export async function reviewTestimonial(
  id: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  if (!isTestimonialId(id)) {
    return { status: "error", message: "No encontramos ese testimonio." };
  }

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
    redirectWithFilters("/testimonials", formData);
  }

  if (intent === "publish" && current.testimonial.status === "published") {
    revalidateTestimonials(id);
    redirectWithFilters(`/testimonials/${id}`, formData);
  }

  const quote = readString(formData, "quote");
  if (!quote) {
    return { status: "error", message: "La cita de la historia no puede estar vacía." };
  }
  if (quote.length > QUOTE_EDIT_MAX_CHARS) {
    return {
      status: "error",
      message: `La cita de la historia puede tener hasta ${QUOTE_EDIT_MAX_CHARS} caracteres.`,
    };
  }

  const captions = readCaptions(formData);
  if ("message" in captions) {
    return { status: "error", message: captions.message };
  }

  if (intent === "save") {
    const saved = await saveReviewEdits(id, { quote, ...captions });
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
  if (card.status === "too_large") {
    return { status: "error", message: SHARE_CARD_TOO_LARGE_PUBLISH_MESSAGE };
  }
  if (card.status !== "ok") {
    return { status: "error", message: "No llegó la imagen. El testimonio no se publicó." };
  }

  const published = await publishTestimonial(id, { quote, ...captions });
  if (!published.ok) {
    if ("lost" in published) {
      revalidateTestimonials(id);
      redirectWithFilters(`/testimonials/${id}`, formData);
    }
    return { status: "error", message: published.message };
  }

  const cardUrl = await prepareShareCard(published.slug, card.file);
  if (!cardUrl) {
    const reverted = await revertPublishedTestimonial(id);
    revalidateTestimonials(id);
    return {
      status: "error",
      message: reverted.ok
        ? "No pudimos guardar la imagen. El testimonio no se publicó."
        : reverted.message,
    };
  }

  const latest = await getTestimonialById(id);
  const share = latest.ok
    ? await sharePublished(latest.testimonial, null)
    : {
        discord: "failed" as const,
        instagram: "failed" as const,
        linkedin: "failed" as const,
      };

  revalidateTestimonials(id);
  redirectShared(id, share, formData);
}

/**
 * Reintenta las redes sin fecha y las de Buffer que siguen en error.
 * El estado se consulta acá con el id guardado: un flag del cliente no decide.
 */
export async function retryShare(id: string, formData: FormData) {
  if (!isTestimonialId(id)) {
    redirectWithFilters("/testimonials", formData);
  }

  const current = await getTestimonialById(id);
  if (!current.ok) {
    redirectWithFilters("/testimonials", formData);
  }

  if (current.testimonial.status !== "published") {
    redirectWithFilters(`/testimonials/${id}`, formData);
  }

  const stored = await storedShareCardUrl(current.testimonial.slug);
  let card: File | null = null;
  if (!stored) {
    const read = readShareCard(formData);
    if (read.status === "too_large") {
      return { status: "error", message: SHARE_CARD_TOO_LARGE_MESSAGE };
    }
    card = read.status === "ok" ? read.file : null;
  }

  const source = await prepareErroredBufferRetries(current.testimonial);
  const share = await sharePublished(source, card);
  revalidateTestimonials(id);
  redirectShared(id, share, formData);
}

function revalidateTestimonials(id: string) {
  revalidatePath("/testimonials");
  revalidatePath(`/testimonials/${id}`);
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const CAPTION_INPUTS = [
  {
    field: "ig_caption",
    network: "instagram",
    label: "Instagram",
    publishes: hasInstagramChannel,
  },
  {
    field: "li_caption",
    network: "linkedin",
    label: "LinkedIn",
    publishes: hasLinkedInChannel,
  },
  {
    field: "discord_caption",
    network: "discord",
    label: "Discord",
    publishes: hasCommunityWebhook,
  },
] as const;

function readCaptions(
  formData: FormData,
): { igCaption: string; liCaption: string; discordCaption: string } | { message: string } {
  const values = {
    ig_caption: readString(formData, "ig_caption"),
    li_caption: readString(formData, "li_caption"),
    discord_caption: readString(formData, "discord_caption"),
  };

  for (const item of CAPTION_INPUTS) {
    const text = values[item.field];
    if (!text && item.publishes()) {
      return { message: `El texto de ${item.label} no puede estar vacío.` };
    }
    const max = CAPTION_MAX_CHARS[item.network];
    if (text.length > max) {
      return {
        message: `El texto de ${item.label} puede tener hasta ${max} caracteres.`,
      };
    }
  }

  return {
    igCaption: values.ig_caption,
    liCaption: values.li_caption,
    discordCaption: values.discord_caption,
  };
}

function redirectWithFilters(
  path: string,
  formData: FormData,
  extra?: Record<string, string>,
): never {
  redirect(inboxHref(path, inboxQueryFromField(formData.get("filters")), extra));
}

function redirectShared(id: string, share: ShareResult, formData: FormData): never {
  const outcomes = Object.values(share);
  if (outcomes.includes("failed")) {
    redirectWithFilters(`/testimonials/${id}`, formData, { share: "failed" });
  }
  if (outcomes.includes("posted")) {
    redirectWithFilters(`/testimonials/${id}`, formData, { share: "ok" });
  }
  redirectWithFilters(`/testimonials/${id}`, formData);
}

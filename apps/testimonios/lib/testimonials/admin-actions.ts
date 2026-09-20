"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { postCommunityTestimonial } from "@/lib/discord";

import {
  buildIgCaption,
  buildLiCaption,
  CAPTION_EDIT_MAX_CHARS,
  QUOTE_EDIT_MAX_CHARS,
} from "./quote";
import {
  getTestimonialById,
  markDiscordPosted,
  publishTestimonial,
  rejectTestimonial,
  saveReviewEdits,
} from "./store";
import type { ReviewState } from "./review-state";

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
      fullName: current.testimonial.full_name,
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
    revalidateAdmin(id, current.testimonial.slug);
    return { status: "saved" };
  }

  const published = await publishTestimonial(id, { quote, igCaption, liCaption });
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

  revalidateAdmin(id, published.slug);

  // Queda en el testimonio: el siguiente paso es descargar la card y subirla a IG.
  if (discord === "failed") {
    redirect(`/admin/${id}?discord=failed`);
  }
  if (discord === "posted") {
    redirect(`/admin/${id}?discord=ok`);
  }
  redirect(`/admin/${id}`);
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

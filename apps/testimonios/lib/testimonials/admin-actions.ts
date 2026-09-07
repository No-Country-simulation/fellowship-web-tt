"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";

import { buildIgCaption, CAPTION_EDIT_MAX_CHARS, QUOTE_EDIT_MAX_CHARS } from "./quote";
import {
  getTestimonialById,
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

  revalidateAdmin(id, published.slug);
  redirect("/admin");
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

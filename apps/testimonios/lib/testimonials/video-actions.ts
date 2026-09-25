"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { getTestimonialById } from "@/lib/testimonials/store";
import {
  approveProcessedVideo,
  processTestimonialVideoRow,
  rejectProcessedVideo,
} from "@/lib/testimonials/video-pipeline";

export type VideoActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function processTestimonialVideo(
  id: string,
  _prev: VideoActionState,
  _formData: FormData,
): Promise<VideoActionState> {
  await requireAdmin();
  const current = await getTestimonialById(id);
  if (!current.ok) {
    return { status: "error", message: current.message };
  }

  const result = await processTestimonialVideoRow(current.testimonial);
  revalidatePath(`/admin/${id}`);
  revalidatePath("/admin");

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  return {
    status: "success",
    message: "Video procesado. Revisalo y aprobá o rechazá.",
  };
}

export async function approveTestimonialVideo(
  id: string,
  _prev: VideoActionState,
  _formData: FormData,
): Promise<VideoActionState> {
  await requireAdmin();
  const current = await getTestimonialById(id);
  if (!current.ok) {
    return { status: "error", message: current.message };
  }

  const result = await approveProcessedVideo(current.testimonial);
  revalidatePath(`/admin/${id}`);
  revalidatePath("/admin");

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  return {
    status: "success",
    message: `Video aprobado. Link para el fellow: ${result.shareUrl}`,
  };
}

export async function rejectTestimonialVideo(
  id: string,
  _prev: VideoActionState,
  _formData: FormData,
): Promise<VideoActionState> {
  await requireAdmin();
  const current = await getTestimonialById(id);
  if (!current.ok) {
    return { status: "error", message: current.message };
  }

  const result = await rejectProcessedVideo(current.testimonial);
  revalidatePath(`/admin/${id}`);
  revalidatePath("/admin");

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  return {
    status: "success",
    message: "Video rechazado. Podés procesar de nuevo.",
  };
}

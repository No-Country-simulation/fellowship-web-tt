"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { INBOX_FILTERS_FIELD, inboxHref, inboxQueryFromField } from "../infrastructure/inboxQuery";
import { hasInstagramChannel, hasLinkedInChannel } from "../infrastructure/buffer";
import { hasCommunityWebhook } from "../infrastructure/discord";
import { validateCardEdits } from "../infrastructure/cardFields";
import { CAPTION_MAX_CHARS, QUOTE_EDIT_MAX_CHARS } from "../infrastructure/quote";
import {
  archiveTestimonial,
  getTestimonialById,
  isTestimonialId,
  prepareShareCard,
  publishTestimonial,
  deleteRejectedTestimonials,
  rejectArchivedTestimonial,
  rejectTestimonial,
  republishTestimonial,
  returnRejectedToReview,
  revertPublishedTestimonial,
  saveReviewEdits,
  storedShareCardUrl,
} from "../infrastructure/repositories/testimonialRepository";
import { prepareErroredBufferRetries, readShareCard, sharePublished } from "../infrastructure/share";
import type {
  ArchiveState,
  BulkDeleteState,
  ReturnToReviewState,
  ReviewState,
} from "../types/reviewState";
import { ARCHIVE_REASON_MAX_CHARS, BULK_DELETE_MAX } from "../types/testimonial";
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

  const cardFields = validateCardEdits(current.testimonial.type, {
    fullName: readString(formData, "full_name"),
    country: readString(formData, "country"),
    quote,
    primary_role: readString(formData, "primary_role"),
    company: readString(formData, "company"),
    role_achieved: readString(formData, "role_achieved"),
    previous_profession: readString(formData, "previous_profession"),
    new_role: readString(formData, "new_role"),
  });
  if (!cardFields.ok) {
    return { status: "error", message: cardFields.message };
  }

  const captions = readCaptions(formData);
  if ("message" in captions) {
    return { status: "error", message: captions.message };
  }

  const reviewEdits = {
    quote,
    ...captions,
    fullName: cardFields.fullName,
    country: cardFields.country,
    payload: cardFields.payload,
  };

  if (intent === "save") {
    const saved = await saveReviewEdits(id, reviewEdits);
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

  const published = await publishTestimonial(id, reviewEdits);
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

/**
 * Publicado → archivado. El motivo sale del formulario (`reason`), no del cliente de confianza.
 * Error para `useActionState`. Éxito: detalle con el filtro `archived`.
 */
export async function archiveAction(
  id: string,
  _prev: ArchiveState,
  formData: FormData,
): Promise<ArchiveState> {
  if (!isTestimonialId(id)) {
    return { status: "error", message: "No encontramos ese testimonio." };
  }

  const current = await getTestimonialById(id);
  if (!current.ok) {
    return { status: "error", message: current.message };
  }

  if (current.testimonial.status !== "published") {
    return { status: "error", message: "Este testimonio ya no está publicado." };
  }

  const reason = readString(formData, "reason");
  if (!reason) {
    return { status: "error", message: "El motivo no puede estar vacío." };
  }
  if (reason.length > ARCHIVE_REASON_MAX_CHARS) {
    return {
      status: "error",
      message: `El motivo puede tener hasta ${ARCHIVE_REASON_MAX_CHARS} caracteres.`,
    };
  }

  const archived = await archiveTestimonial(id, reason);
  if (!archived.ok) {
    return { status: "error", message: archived.message };
  }

  revalidateTestimonials(id);
  redirectWithFilters(`/testimonials/${id}`, formData, { status: "archived" });
}

/**
 * Archivado → publicado. No llama a `sharePublished`: vuelve a la galería
 * sin reenviar a Discord, Instagram ni LinkedIn.
 */
export async function republishAction(id: string, formData: FormData): Promise<void> {
  if (!isTestimonialId(id)) {
    redirectWithFilters("/testimonials", formData);
  }

  const current = await getTestimonialById(id);
  if (!current.ok) {
    redirectWithFilters("/testimonials", formData);
  }

  if (current.testimonial.status !== "archived") {
    redirectWithFilters(`/testimonials/${id}`, formData);
  }

  const republished = await republishTestimonial(id);
  if (!republished.ok) {
    redirectWithFilters(`/testimonials/${id}`, formData);
  }

  revalidateTestimonials(id);
  redirectWithFilters(`/testimonials/${id}`, formData, { status: "published" });
}

/**
 * Rechazado → en revisión. No publica ni toca archivos.
 * Error para `useActionState`. Éxito: detalle con el filtro `in_review`.
 */
export async function returnRejectedToReviewAction(
  id: string,
  _prev: ReturnToReviewState,
  formData: FormData,
): Promise<ReturnToReviewState> {
  if (!isTestimonialId(id)) {
    return { status: "error", message: "No encontramos ese testimonio." };
  }

  const current = await getTestimonialById(id);
  if (!current.ok) {
    return { status: "error", message: current.message };
  }

  if (current.testimonial.status !== "rejected") {
    return { status: "error", message: "Este testimonio ya no está rechazado." };
  }

  const restored = await returnRejectedToReview(id);
  if (!restored.ok) {
    return { status: "error", message: restored.message };
  }

  revalidateTestimonials(id);
  redirectWithFilters(`/testimonials/${id}`, formData, { status: "in_review" });
}

/** Archivado → rechazado. Igual que el rechazo de revisión: inbox con los filtros del form. */
export async function rejectArchivedAction(id: string, formData: FormData): Promise<void> {
  if (!isTestimonialId(id)) {
    redirectWithFilters("/testimonials", formData);
  }

  const current = await getTestimonialById(id);
  if (!current.ok) {
    redirectWithFilters("/testimonials", formData);
  }

  if (current.testimonial.status !== "archived") {
    redirectWithFilters(`/testimonials/${id}`, formData);
  }

  const rejected = await rejectArchivedTestimonial(id);
  if (!rejected.ok) {
    redirectWithFilters(`/testimonials/${id}`, formData);
  }

  revalidateTestimonials(id);
  redirectWithFilters("/testimonials", formData);
}

/**
 * Borra los rechazados marcados. No redirige: la URL y sus filtros quedan.
 * Solo confía en los ids; el repositorio vuelve a leer la fila y exige `rejected`.
 * No revalida: el render que sigue a `revalidatePath` pide de nuevo la ficha
 * abierta y, si esa fila ya no está, `notFound()` parpadea. La lista se refresca
 * en el cliente.
 */
export async function deleteRejectedAction(formData: FormData): Promise<BulkDeleteState> {
  const ids = readIdList(formData);
  if (ids.length === 0) {
    return { status: "error", message: "Elegí al menos un testimonio rechazado." };
  }
  if (ids.length > BULK_DELETE_MAX) {
    return {
      status: "error",
      message: `Podés eliminar hasta ${BULK_DELETE_MAX} testimonios por vez.`,
    };
  }

  const deleted = await deleteRejectedTestimonials(ids);
  if (!deleted.ok) {
    return { status: "error", message: deleted.message };
  }

  return {
    status: "done",
    deletedIds: deleted.deletedIds,
    failed: deleted.failedIds.length,
    skipped: deleted.skippedIds.length,
  };
}

function revalidateTestimonials(id: string | readonly string[]) {
  revalidatePath("/testimonials");
  const ids = typeof id === "string" ? [id] : id;
  for (const itemId of ids) {
    if (isTestimonialId(itemId)) {
      revalidatePath(`/testimonials/${itemId}`);
    }
  }
}

function readIdList(formData: FormData) {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const value of formData.getAll("ids")) {
    if (typeof value !== "string" || seen.has(value)) continue;
    seen.add(value);
    ids.push(value);
  }
  return ids;
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
      return { message: `La descripción del post de ${item.label} no puede estar vacía.` };
    }
    const max = CAPTION_MAX_CHARS[item.network];
    if (text.length > max) {
      return {
        message: `La descripción del post de ${item.label} puede tener hasta ${max} caracteres.`,
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
  redirect(inboxHref(path, inboxQueryFromField(formData.get(INBOX_FILTERS_FIELD)), extra));
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

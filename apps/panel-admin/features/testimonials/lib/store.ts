import type { TestimonialRow } from "./supabase/database";
import { hasSupabaseServiceRoleEnv } from "./supabase/env";
import { createServiceRoleClient } from "./supabase/service-role";
import type { TestimonialStatus } from "./types";

const missingServiceRole =
  "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. El inbox no puede leer ni publicar todavía.";

export async function listTestimonials(
  status?: TestimonialStatus,
): Promise<
  | { ok: true; testimonials: TestimonialRow[] }
  | { ok: false; message: string }
> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("testimonials")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;

  if (error) {
    return {
      ok: false,
      message: "No pudimos cargar el inbox. Probá de nuevo.",
    };
  }

  return { ok: true, testimonials: data };
}

export async function getTestimonialById(id: string): Promise<
  | { ok: true; testimonial: TestimonialRow }
  | { ok: false; message: string; notFound?: boolean }
> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message: "No pudimos cargar el testimonio. Probá de nuevo.",
    };
  }

  if (!data) {
    return {
      ok: false,
      notFound: true,
      message: "No encontramos ese testimonio.",
    };
  }

  return { ok: true, testimonial: data };
}

export async function saveReviewEdits(
  id: string,
  edits: { quote: string; igCaption: string; liCaption: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  return updateReviewRow(id, {
    quote: edits.quote,
    ig_caption: edits.igCaption,
    li_caption: edits.liCaption,
  });
}

export async function publishTestimonial(
  id: string,
  edits: { quote: string; igCaption: string; liCaption: string },
): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  const updated = await updateReviewRow(
    id,
    {
      quote: edits.quote,
      ig_caption: edits.igCaption,
      li_caption: edits.liCaption,
      status: "published",
      published_at: new Date().toISOString(),
    },
    "published",
  );

  if (!updated.ok) {
    return updated;
  }

  return { ok: true, slug: updated.slug };
}

export async function markDiscordPosted(
  id: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update({ discord_posted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "published")
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message: "No pudimos marcar el post de Discord.",
    };
  }

  if (!data) {
    return {
      ok: false,
      message: "Este envío no está publicado.",
    };
  }

  return { ok: true };
}

export async function markBufferPosted(
  id: string,
  network: "instagram" | "linkedin",
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const supabase = createServiceRoleClient();
  const postedAt = new Date().toISOString();
  const values =
    network === "instagram"
      ? { buffer_instagram_posted_at: postedAt }
      : { buffer_linkedin_posted_at: postedAt };
  const { data, error } = await supabase
    .from("testimonials")
    .update(values)
    .eq("id", id)
    .eq("status", "published")
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message: "No pudimos marcar el post de Buffer.",
    };
  }

  if (!data) {
    return {
      ok: false,
      message: "Este envío no está publicado.",
    };
  }

  return { ok: true };
}

export async function rejectTestimonial(
  id: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const updated = await updateReviewRow(id, { status: "rejected" });
  return updated.ok ? { ok: true } : updated;
}

async function updateReviewRow(
  id: string,
  values: {
    quote?: string;
    ig_caption?: string;
    li_caption?: string;
    status?: TestimonialStatus;
    published_at?: string;
  },
  alreadyDoneStatus?: TestimonialStatus,
): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  if (!hasSupabaseServiceRoleEnv()) {
    return { ok: false, message: missingServiceRole };
  }

  const current = await getTestimonialById(id);
  if (!current.ok) {
    return { ok: false, message: current.message };
  }

  if (current.testimonial.status !== "in_review") {
    if (
      alreadyDoneStatus &&
      current.testimonial.status === alreadyDoneStatus
    ) {
      return { ok: true, slug: current.testimonial.slug };
    }
    return {
      ok: false,
      message: "Este envío ya no está en revisión.",
    };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update(values)
    .eq("id", id)
    .eq("status", "in_review")
    .select("slug")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message: "No pudimos guardar el cambio. Probá de nuevo.",
    };
  }

  if (!data) {
    return {
      ok: false,
      message: "Este envío ya no está en revisión.",
    };
  }

  return { ok: true, slug: data.slug };
}

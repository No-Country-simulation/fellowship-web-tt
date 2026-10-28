export const SITE_BRAND = "No Country";

/** App pública de testimonios: galería y ficha `/t/[slug]`. No es el origen del panel. */
export function getGalleryUrl() {
  const fromEnv = process.env.GALLERY_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("GALLERY_URL missing: origin of apps/testimonios (not the panel).");
  }

  return "http://localhost:3001";
}

/** Null si falta el origen en producción: armar el link no debe tirar en el render. */
export function galleryTestimonialHref(slug: string): string | null {
  try {
    return `${getGalleryUrl()}/t/${slug}`;
  } catch {
    return null;
  }
}

/** Formulario público `/enviar`. Null si falta el origen en producción. */
export function galleryFormHref(): string | null {
  try {
    return `${getGalleryUrl()}/enviar`;
  } catch {
    return null;
  }
}

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

export function galleryTestimonialHref(slug: string) {
  return `${getGalleryUrl()}/t/${slug}`;
}

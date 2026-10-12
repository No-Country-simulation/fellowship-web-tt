export const SITE_BRAND = "No Country";

/** App pública de testimonios: galería y ficha `/t/[slug]`. */
export function getPublicSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return "http://localhost:3001";
}

export function publicTestimonialHref(slug: string) {
  return `${getPublicSiteUrl()}/t/${slug}`;
}

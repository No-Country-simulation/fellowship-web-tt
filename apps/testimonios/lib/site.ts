export const SITE_NAME = "Testimonios";
export const SITE_BRAND = "No Country";
export const SITE_TITLE = "Testimonios · No Country";
export const SITE_DESCRIPTION =
  "Historias de talento de No Country: simulación, primer empleo y reconversión.";

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return "http://localhost:3001";
}

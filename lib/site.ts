/**
 * Canonical public origin. Set `NEXT_PUBLIC_SITE_URL` in production
 * (no trailing slash), e.g. `https://fellowship.example`.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  const vercelProduction =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    return `https://${vercelProduction.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

/**
 * Canonical public origin. In production set `NEXT_PUBLIC_SITE_URL`
 * (no trailing slash), e.g. `https://fellowship.nocountry.tech`.
 * Localhost is only allowed in development.
 */
export function getSiteUrl(): string {
  const fromEnv = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (fromEnv) {
    return fromEnv;
  }

  const vercelProduction = normalizeHost(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  );
  if (vercelProduction) {
    return `https://${vercelProduction}`;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is required in production so canonical, sitemap and JSON-LD do not use localhost."
    );
  }

  return "http://localhost:3000";
}

function normalizeOrigin(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/\/$/, "");
}

function normalizeHost(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * Canonical public origin for sitemap, JSON-LD and `canonical`.
 *
 * `NEXT_PUBLIC_SITE_URL` is optional. Set it after the first deploy, once
 * the stable (custom) domain exists. Until then Vercel system env vars
 * cover the build: project production host, then this deployment's host.
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

  // First Vercel deploy: project URL may not exist yet; deployment URL does.
  const vercelDeployment = normalizeHost(process.env.VERCEL_URL);
  if (vercelDeployment) {
    return `https://${vercelDeployment}`;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "No public origin for canonical/sitemap/JSON-LD. On Vercel this is injected automatically; otherwise set NEXT_PUBLIC_SITE_URL after the first deploy (never localhost)."
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

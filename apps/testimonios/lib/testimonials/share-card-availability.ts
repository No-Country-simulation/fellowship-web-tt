import "server-only";

import { unstable_cache } from "next/cache";

type Availability = "available" | "unavailable" | "unknown";

/** Per-source metadata cache, separate from Next's optimized image cache. */
export const SHARE_CARD_REVALIDATE_SECONDS = 300;
const PROBE_TIMEOUT_MS = 800;
const PROBE_CONCURRENCY = 6;
const pending = new Map<string, Promise<Availability>>();

async function probe(url: string): Promise<Availability> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (response.ok) {
      return /^image\/(png|webp|jpeg)(?:;|$)/i.test(response.headers.get("content-type") ?? "")
        ? "available" : "unavailable";
    }
    // Supabase returns HTTP 400 for NoSuchKey. HEAD cannot establish its JSON cause.
    if ([400, 404, 410].includes(response.status)) return "unavailable";
    return "unknown";
  } catch {
    // Includes timeout/network/redirect failure; never log arbitrary upstream errors.
    return "unknown";
  }
}

const cachedAvailability = unstable_cache(async (url: string): Promise<Availability> => {
  // Coalesce cold probes from concurrent renders in this process, not just within one render.
  const existing = pending.get(url);
  if (existing) return existing;
  const request = probe(url).finally(() => pending.delete(url));
  pending.set(url, request);
  return request;
}, ["hero-share-card-availability-v1"], { revalidate: SHARE_CARD_REVALIDATE_SECONDS });

/** Checks only published candidates, with cached HEADs and bounded concurrency; never lists Storage. */
export async function availableShareCardUrls(urls: readonly string[], available = new Set<string>()): Promise<Set<string>> {
  const candidates = [...new Set(urls)];
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(PROBE_CONCURRENCY, candidates.length) }, async () => {
    while (next < candidates.length) {
      const url = candidates[next++];
      try {
        if (await cachedAvailability(url) === "available") available.add(url);
      } catch {
        // A cache infrastructure failure must not break /enviar or claim that an image exists.
      }
    }
  }));
  return available;
}

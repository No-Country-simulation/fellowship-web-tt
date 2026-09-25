import { createClient, type SanityClient } from "@sanity/client";

import {
  sanityApiToken,
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "./env";

let cached: SanityClient | null = null;

/** Write client for video assets. Server-only. */
export function createSanityWriteClient(): SanityClient {
  if (cached) {
    return cached;
  }

  cached = createClient({
    projectId: sanityProjectId(),
    dataset: sanityDataset(),
    apiVersion: sanityApiVersion(),
    token: sanityApiToken(),
    useCdn: false,
  });

  return cached;
}

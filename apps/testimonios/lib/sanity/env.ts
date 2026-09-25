export function hasSanityEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() &&
      process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() &&
      process.env.SANITY_API_TOKEN?.trim(),
  );
}

export function sanityProjectId() {
  const value = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  if (!value) {
    throw new Error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID.");
  }
  return value;
}

export function sanityDataset() {
  const value = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim();
  if (!value) {
    throw new Error("Falta NEXT_PUBLIC_SANITY_DATASET.");
  }
  return value;
}

export function sanityApiToken() {
  const value = process.env.SANITY_API_TOKEN?.trim();
  if (!value) {
    throw new Error("Falta SANITY_API_TOKEN (write).");
  }
  return value;
}

export function sanityApiVersion() {
  return process.env.SANITY_API_VERSION?.trim() || "2025-01-01";
}

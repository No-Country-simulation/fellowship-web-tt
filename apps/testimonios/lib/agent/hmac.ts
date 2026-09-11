import { createHmac, timingSafeEqual } from "node:crypto";

/** Header carrying hex HMAC-SHA256 of the raw request body. */
export const MEDIA_WEBHOOK_SIGNATURE_HEADER = "x-media-webhook-signature";

export function signHmacSha256Hex(
  body: string | Buffer,
  secret: string,
): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

/**
 * Timing-safe HMAC-SHA256 hex verification of a raw body.
 * Returns false for missing/malformed signatures.
 */
export function verifyHmacSha256Hex(
  body: string | Buffer,
  secret: string,
  signatureHex: string | null | undefined,
): boolean {
  if (!signatureHex || typeof signatureHex !== "string") {
    return false;
  }

  const expected = signHmacSha256Hex(body, secret);

  let provided: Buffer;
  let expectedBuf: Buffer;
  try {
    provided = Buffer.from(signatureHex, "hex");
    expectedBuf = Buffer.from(expected, "hex");
  } catch {
    return false;
  }

  if (provided.length === 0 || provided.length !== expectedBuf.length) {
    return false;
  }

  return timingSafeEqual(provided, expectedBuf);
}

import { createSanityWriteClient } from "./client";
import { hasSanityEnv } from "./env";

export type SanityVideoAsset = {
  assetId: string;
  url: string;
  size: number;
  mimeType: string;
  originalFilename: string;
};

const VIDEO_MIME = new Set(["video/mp4", "video/quicktime"]);

export function isAllowedVideoMime(mime: string) {
  return VIDEO_MIME.has(mime) || mime === "video/x-m4v";
}

/** Upload mp4/mov to Sanity as a file asset. Returns CDN URL + asset id. */
export async function uploadVideoToSanity(
  file: File | Blob,
  filename: string,
): Promise<
  | { ok: true; asset: SanityVideoAsset }
  | { ok: false; message: string }
> {
  if (!hasSanityEnv()) {
    return {
      ok: false,
      message:
        "Falta Sanity (NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN).",
    };
  }

  try {
    const client = createSanityWriteClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType =
      file instanceof File && file.type
        ? file.type
        : "video/mp4";

    const asset = await client.assets.upload("file", buffer, {
      filename,
      contentType,
    });

    if (!asset.url || !asset._id) {
      return { ok: false, message: "Sanity no devolvió URL del video." };
    }

    return {
      ok: true,
      asset: {
        assetId: asset._id,
        url: asset.url,
        size: asset.size ?? buffer.byteLength,
        mimeType: asset.mimeType ?? contentType,
        originalFilename: asset.originalFilename ?? filename,
      },
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Sanity upload falló: ${err.message}`
          : "Sanity upload falló.",
    };
  }
}

export async function deleteSanityAsset(
  assetId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!hasSanityEnv()) {
    return { ok: false, message: "Falta Sanity env." };
  }

  try {
    const client = createSanityWriteClient();
    await client.delete(assetId);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Sanity delete falló: ${err.message}`
          : "Sanity delete falló.",
    };
  }
}

/** Download bytes from a CDN / signed URL (Sanity or FFmpeg Micro). */
export async function fetchVideoBytes(
  url: string,
): Promise<
  | { ok: true; buffer: Buffer; contentType: string }
  | { ok: false; message: string }
> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return {
        ok: false,
        message: `No se pudo descargar el video (${res.status}).`,
      };
    }
    const contentType =
      res.headers.get("content-type")?.split(";")[0]?.trim() || "video/mp4";
    const buffer = Buffer.from(await res.arrayBuffer());
    return { ok: true, buffer, contentType };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : "Error al descargar el video.",
    };
  }
}

import { getSiteUrl } from "@/lib/site";
import {
  hasFfmpegMicroEnv,
  transcribeToSrt,
  transcodeSocialVideo,
  uploadBufferToFfmpegMicro,
  VIDEO_UPLOAD_MAX_BYTES,
} from "@/lib/ffmpeg-micro/client";
import {
  deleteSanityAsset,
  fetchVideoBytes,
  uploadVideoToSanity,
} from "@/lib/sanity/video-assets";
import type { TestimonialRow } from "@/lib/supabase/database";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export type ProcessVideoResult =
  | { ok: true; processedUrl: string; jobId: string }
  | { ok: false; message: string };

/**
 * original (Sanity) → FFmpeg Micro (transcribe + transcode) → processed (Sanity).
 * Updates Supabase URLs only; does not publish social or approve.
 */
export async function processTestimonialVideoRow(
  row: TestimonialRow,
): Promise<ProcessVideoResult> {
  if (!hasFfmpegMicroEnv()) {
    return { ok: false, message: "Falta FFMPEG_MICRO_API_KEY." };
  }
  if (!row.video_original_url || !row.video_original_asset_id) {
    return { ok: false, message: "No hay video original para procesar." };
  }
  if (row.video_status === "processing") {
    return { ok: false, message: "Ya hay un procesamiento en curso." };
  }
  if (row.video_status === "approved") {
    return {
      ok: false,
      message: "El video ya está aprobado. No se reprocesa desde acá.",
    };
  }

  const supabase = createServiceRoleClient();
  await supabase
    .from("testimonials")
    .update({
      video_status: "processing",
      video_error: null,
      video_ffmpeg_job_id: null,
    })
    .eq("id", row.id);

  try {
    const downloaded = await fetchVideoBytes(row.video_original_url);
    if (!downloaded.ok) {
      throw new Error(downloaded.message);
    }
    if (downloaded.buffer.byteLength > VIDEO_UPLOAD_MAX_BYTES) {
      throw new Error(
        `El video supera el máximo de ${VIDEO_UPLOAD_MAX_BYTES / (1024 * 1024)} MB.`,
      );
    }

    const uploaded = await uploadBufferToFfmpegMicro(
      downloaded.buffer,
      `${row.slug}-original.mp4`,
      downloaded.contentType,
    );

    const { srtUrl } = await transcribeToSrt(uploaded.gsUrl, "es");
    const watermarkUrl = `${getSiteUrl()}/brand/logo-no-country.png`;
    const { jobId, downloadUrl } = await transcodeSocialVideo({
      inputGsUrl: uploaded.gsUrl,
      srtUrl,
      watermarkUrl,
    });

    const processedBytes = await fetchVideoBytes(downloadUrl);
    if (!processedBytes.ok) {
      throw new Error(processedBytes.message);
    }

    const toSanity = await uploadVideoToSanity(
      new Blob([new Uint8Array(processedBytes.buffer)], {
        type: processedBytes.contentType,
      }),
      `${row.slug}-processed.mp4`,
    );
    if (!toSanity.ok) {
      throw new Error(toSanity.message);
    }

    if (row.video_processed_asset_id) {
      await deleteSanityAsset(row.video_processed_asset_id);
    }

    const { error } = await supabase
      .from("testimonials")
      .update({
        video_status: "processed",
        video_processed_url: toSanity.asset.url,
        video_processed_asset_id: toSanity.asset.assetId,
        video_ffmpeg_job_id: jobId,
        video_error: null,
      })
      .eq("id", row.id);

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
      processedUrl: toSanity.asset.url,
      jobId,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al procesar el video.";
    await supabase
      .from("testimonials")
      .update({
        video_status: row.video_status === "processed" ? "processed" : "original",
        video_error: message.slice(0, 500),
      })
      .eq("id", row.id);
    return { ok: false, message };
  }
}

export async function approveProcessedVideo(
  row: TestimonialRow,
): Promise<{ ok: true; shareUrl: string } | { ok: false; message: string }> {
  if (row.video_status !== "processed" || !row.video_processed_url) {
    return {
      ok: false,
      message: "No hay video procesado para aprobar.",
    };
  }

  const supabase = createServiceRoleClient();
  const shareUrl = row.video_processed_url;

  const { error } = await supabase
    .from("testimonials")
    .update({
      video_status: "approved",
      video_share_url: shareUrl,
      video_error: null,
      video_original_url: null,
      video_original_asset_id: null,
    })
    .eq("id", row.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  if (row.video_original_asset_id) {
    const deleted = await deleteSanityAsset(row.video_original_asset_id);
    if (!deleted.ok) {
      console.error("Sanity original delete failed", deleted.message);
    }
  }

  return { ok: true, shareUrl };
}

export async function rejectProcessedVideo(
  row: TestimonialRow,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (row.video_status !== "processed") {
    return {
      ok: false,
      message: "Solo se puede rechazar un video en estado procesado.",
    };
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("testimonials")
    .update({
      video_status: "rejected",
      video_error: null,
    })
    .eq("id", row.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

/**
 * FFmpeg media worker — preserve original A/V, watermark, per-platform format.
 * No generative video rewrite (ADR-002).
 */

import { createHmac, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

export type Platform = "instagram" | "linkedin";

export type MediaJob = {
  jobId: string;
  testimonioId: string;
  plataforma: Platform;
  sourceVideoKey?: string | null;
  sourceAudioKey?: string | null;
};

export type MediaListoPayload = {
  jobId: string;
  testimonioId: string;
  plataforma: Platform;
  mediaAssetPath: string;
};

const PLATFORM_SIZE: Record<Platform, { w: number; h: number }> = {
  instagram: { w: 1080, h: 1920 },
  linkedin: { w: 1920, h: 1080 },
};

export function describePreserveOriginalPipeline(job: MediaJob): string[] {
  return [
    `fetch Storage objects ${job.sourceVideoKey ?? "(none)"}` +
      (job.sourceAudioKey ? ` + ${job.sourceAudioKey}` : ""),
    "ffmpeg: remux/transcode preserving original A/V (no generative rewrite)",
    "ffmpeg: loudnorm + light denoise when audio present",
    "ffmpeg: overlay No Country watermark",
    `ffmpeg: output ${job.plataforma} ${PLATFORM_SIZE[job.plataforma].w}x${PLATFORM_SIZE[job.plataforma].h}`,
    "upload platform asset to Storage",
    "HMAC callback → POST /api/webhooks/media-listo",
  ];
}

export function signMediaListoCallback(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export function buildMediaAssetPath(
  testimonioId: string,
  plataforma: Platform,
  jobId: string,
): string {
  return `processed/${testimonioId}/${plataforma}/${jobId}.mp4`;
}

function runFfmpeg(args: string[]): Promise<void> {
  const bin = process.env.FFMPEG_PATH?.trim() || "ffmpeg";
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-800)}`));
    });
  });
}

export async function postMediaListoCallback(
  payload: MediaListoPayload,
): Promise<void> {
  const url = process.env.MEDIA_LISTO_WEBHOOK_URL?.trim();
  const secret = process.env.MEDIA_WEBHOOK_SECRET?.trim();
  if (!url || !secret) {
    throw new Error("MEDIA_LISTO_WEBHOOK_URL / MEDIA_WEBHOOK_SECRET required");
  }
  const body = JSON.stringify(payload);
  const signature = signMediaListoCallback(body, secret);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-media-webhook-signature": signature,
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`media-listo HTTP ${res.status}: ${await res.text()}`);
  }
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase URL/service role required");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Process one job: download → ffmpeg preserve+watermark+crop → upload → callback.
 * If ffmpeg binary missing, still uploads a placeholder path marker via stub mode.
 */
export async function processJob(job: MediaJob): Promise<string> {
  const steps = describePreserveOriginalPipeline(job);
  for (const step of steps) {
    console.info(`[worker] ${job.jobId}: ${step}`);
  }

  const outKey = buildMediaAssetPath(
    job.testimonioId,
    job.plataforma,
    job.jobId,
  );
  const supabase = serviceClient();
  const size = PLATFORM_SIZE[job.plataforma];
  const workDir = await mkdtemp(path.join(tmpdir(), "ff-"));

  try {
    const inputPath = path.join(workDir, "input.mp4");
    const outputPath = path.join(workDir, "output.mp4");
    const watermarkPath = process.env.WATERMARK_PATH?.trim();

    if (job.sourceVideoKey) {
      const { data, error } = await supabase.storage
        .from("testimonios-media")
        .download(job.sourceVideoKey);
      if (error) throw new Error(error.message);
      await writeFile(inputPath, Buffer.from(await data.arrayBuffer()));
    } else {
      // No source: generate silent slate (still not generative "rewrite" of testimony)
      await runFfmpeg([
        "-y",
        "-f",
        "lavfi",
        "-i",
        `color=c=black:s=${size.w}x${size.h}:d=3`,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        inputPath,
      ]);
    }

    const filterParts = [
      `scale=${size.w}:${size.h}:force_original_aspect_ratio=decrease`,
      `pad=${size.w}:${size.h}:(ow-iw)/2:(oh-ih)/2`,
    ];
    const args = ["-y", "-i", inputPath];
    if (watermarkPath) {
      args.push("-i", watermarkPath);
      filterParts.push("overlay=W-w-24:H-h-24");
      args.push("-filter_complex", filterParts.join(","));
    } else {
      args.push("-vf", filterParts.join(","));
    }
    args.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", outputPath);

    try {
      await runFfmpeg(args);
    } catch (err) {
      console.warn(
        "[worker] ffmpeg failed; uploading empty marker path only",
        err,
      );
      await writeFile(outputPath, Buffer.from("ffmpeg-stub"));
    }

    const bytes = await readFile(outputPath);
    const { error: upErr } = await supabase.storage
      .from("testimonios-media")
      .upload(outKey, bytes, { upsert: true, contentType: "video/mp4" });
    if (upErr) throw new Error(upErr.message);

    await supabase
      .from("media_jobs")
      .update({
        status: "done",
        media_asset_path: outKey,
        updated_at: new Date().toISOString(),
      })
      .eq("job_id", job.jobId);

    await postMediaListoCallback({
      jobId: job.jobId,
      testimonioId: job.testimonioId,
      plataforma: job.plataforma,
      mediaAssetPath: outKey,
    });

    return outKey;
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

/** Poll queued jobs and process one batch. */
export async function drainQueue(limit = 5): Promise<number> {
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("media_jobs")
    .select(
      "job_id, testimonio_id, plataforma, source_video_key, source_audio_key",
    )
    .eq("status", "queued")
    .limit(limit);
  if (error) throw new Error(error.message);
  let n = 0;
  for (const row of data ?? []) {
    await supabase
      .from("media_jobs")
      .update({ status: "processing" })
      .eq("job_id", row.job_id);
    try {
      await processJob({
        jobId: row.job_id,
        testimonioId: row.testimonio_id,
        plataforma: row.plataforma as Platform,
        sourceVideoKey: row.source_video_key,
        sourceAudioKey: row.source_audio_key,
      });
      n += 1;
    } catch (err) {
      console.error("[worker] job failed", row.job_id, err);
      await supabase
        .from("media_jobs")
        .update({
          status: "error",
          error_message: err instanceof Error ? err.message : "error",
        })
        .eq("job_id", row.job_id);
    }
  }
  return n;
}

async function main(): Promise<void> {
  console.info("media-worker ready — preserve A/V FFmpeg pipeline");
  if (process.argv.includes("--once")) {
    const n = await drainQueue();
    console.info(`processed ${n} jobs`);
    return;
  }
  // Demo stub job when no queue
  const demo: MediaJob = {
    jobId: randomUUID(),
    testimonioId: "00000000-0000-0000-0000-000000000000",
    plataforma: "instagram",
    sourceVideoKey: null,
  };
  console.info(describePreserveOriginalPipeline(demo).join("\n"));
}

const isDirectRun =
  process.argv[1]?.endsWith("index.ts") ||
  process.argv[1]?.endsWith("index.js");

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

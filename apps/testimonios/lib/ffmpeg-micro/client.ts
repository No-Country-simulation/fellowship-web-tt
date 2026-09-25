const API_BASE = "https://api.ffmpeg-micro.com";

/** Free tier hard limit. */
export const FFMPEG_MICRO_MAX_INPUT_BYTES = 250 * 1024 * 1024;

/** Practical cap for Next server upload (under free tier). */
export const VIDEO_UPLOAD_MAX_BYTES = 100 * 1024 * 1024;

const POLL_MS = 4000;
const POLL_MAX_ATTEMPTS = 90; // ~6 min

type PresignResult = {
  uploadUrl: string;
  filename: string;
};

type ConfirmResult = {
  fileUrl?: string;
  filename?: string;
};

type JobEnvelope = {
  id?: string;
  jobId?: string;
  status?: string;
  outputUrl?: string;
  media_url?: string;
};

function apiKey() {
  const key = process.env.FFMPEG_MICRO_API_KEY?.trim();
  if (!key) {
    throw new Error("Falta FFMPEG_MICRO_API_KEY.");
  }
  return key;
}

export function hasFfmpegMicroEnv() {
  return Boolean(process.env.FFMPEG_MICRO_API_KEY?.trim());
}

async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = (await res.json().catch(() => ({}))) as T & {
    success?: boolean;
    result?: T;
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(
      body.message ||
        body.error ||
        `FFmpeg Micro ${path} → ${res.status}`,
    );
  }

  if (body.result && typeof body.result === "object") {
    return body.result as T;
  }

  return body as T;
}

export async function uploadBufferToFfmpegMicro(
  buffer: Buffer,
  filename: string,
  contentType = "video/mp4",
): Promise<{ gsUrl: string; storedFilename: string }> {
  const presign = await api<PresignResult>("/v1/upload/presigned-url", {
    method: "POST",
    body: JSON.stringify({
      filename,
      contentType,
      fileSize: buffer.byteLength,
    }),
  });

  const put = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: new Uint8Array(buffer),
  });
  if (!put.ok) {
    throw new Error(`FFmpeg Micro PUT upload falló (${put.status}).`);
  }

  const confirm = await api<ConfirmResult>("/v1/upload/confirm", {
    method: "POST",
    body: JSON.stringify({
      filename: presign.filename,
      fileSize: buffer.byteLength,
    }),
  });

  const gsUrl = confirm.fileUrl;
  if (!gsUrl) {
    throw new Error("FFmpeg Micro confirm no devolvió fileUrl.");
  }

  return { gsUrl, storedFilename: confirm.filename ?? presign.filename };
}

async function pollJob(
  kind: "transcodes" | "transcribe",
  jobId: string,
): Promise<JobEnvelope> {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i += 1) {
    const job = await api<JobEnvelope>(`/v1/${kind}/${jobId}`, {
      method: "GET",
    });
    const status = (job.status ?? "").toLowerCase();
    if (status === "completed" || status === "complete" || status === "succeeded") {
      return job;
    }
    if (status === "failed" || status === "error") {
      throw new Error(`FFmpeg Micro job ${jobId} falló (${status}).`);
    }
    await sleep(POLL_MS);
  }
  throw new Error(`FFmpeg Micro job ${jobId} timeout.`);
}

function jobIdOf(job: JobEnvelope) {
  const id = job.id || job.jobId;
  if (!id) {
    throw new Error("FFmpeg Micro no devolvió job id.");
  }
  return id;
}

export async function transcribeToSrt(
  mediaGsUrl: string,
  language = "es",
): Promise<{ jobId: string; srtUrl: string }> {
  const created = await api<JobEnvelope>("/v1/transcribe", {
    method: "POST",
    body: JSON.stringify({
      media_url: mediaGsUrl,
      language,
      task: "transcribe",
    }),
  });
  const jobId = jobIdOf(created);
  await pollJob("transcribe", jobId);

  const download = await api<{ url: string }>(
    `/v1/transcribe/${jobId}/download`,
    { method: "GET" },
  );
  if (!download.url) {
    throw new Error("FFmpeg Micro no devolvió URL del SRT.");
  }
  return { jobId, srtUrl: download.url };
}

export type TranscodeSocialOptions = {
  inputGsUrl: string;
  /** Signed or public HTTPS URL to SRT (from transcribe download). */
  srtUrl: string;
  /** Public HTTPS logo for watermark (bottom-right). */
  watermarkUrl: string;
};

/**
 * Burn subtitles + watermark + web-quality encode.
 * Free tier: no filter_complex; uses -vf chain + quality preset.
 * Stabilization is not exposed on free virtual options — skipped.
 */
export async function transcodeSocialVideo(
  opts: TranscodeSocialOptions,
): Promise<{ jobId: string; downloadUrl: string }> {
  const subtitleFilter = `subtitles='${escapeFilterPath(opts.srtUrl)}':force_style='FontName=DejaVu Sans,FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H80000000,BorderStyle=3,Alignment=2,MarginV=70'`;

  const created = await api<JobEnvelope>("/v1/transcodes", {
    method: "POST",
    body: JSON.stringify({
      inputs: [{ url: opts.inputGsUrl }],
      outputFormat: "mp4",
      preset: {
        quality: "high",
        resolution: "1080p",
      },
      options: [
        { option: "-c:v", argument: "libx264" },
        { option: "-crf", argument: "20" },
        { option: "-preset", argument: "medium" },
        { option: "-c:a", argument: "aac" },
        { option: "-b:a", argument: "192k" },
        { option: "-vf", argument: subtitleFilter },
        {
          option: "@text-overlay",
          argument: {
            text: "No Country",
            style: {
              position: "bottom-right",
              fontSize: 28,
              outlineThickness: 4,
              margin: 40,
            },
          },
        },
      ],
    }),
  });

  const jobId = jobIdOf(created);
  await pollJob("transcodes", jobId);

  const download = await api<{ url: string }>(
    `/v1/transcodes/${jobId}/download`,
    { method: "GET" },
  );
  if (!download.url) {
    throw new Error("FFmpeg Micro no devolvió URL del video procesado.");
  }

  // watermarkUrl reserved for future image overlay when API supports 2nd input without filter_complex
  void opts.watermarkUrl;

  return { jobId, downloadUrl: download.url };
}

function escapeFilterPath(url: string) {
  return url.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

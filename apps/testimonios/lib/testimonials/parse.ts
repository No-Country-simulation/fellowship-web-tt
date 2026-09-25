import { excerptQuote, buildIgCaption, buildLiCaption } from "./quote";
import {
  isTestimonialType,
  type TestimonialPayload,
  type TestimonialType,
} from "./types";

export const STORY_MIN_CHARS = 20;
export const STORY_MAX_CHARS = 4000;
export const NAME_MAX_CHARS = 120;
export const FIELD_MAX_CHARS = 120;
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const CAPTURE_MAX_BYTES = 8 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 100 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);
const VIDEO_ID_PATTERN = /^[\w-]{11}$/;
const INSTAGRAM_HANDLE_PATTERN = /^[A-Za-z0-9._]{1,30}$/;

export type FieldErrors = Partial<Record<FormField, string>>;

export type FormField =
  | "type"
  | "full_name"
  | "country"
  | "email"
  | "story"
  | "company"
  | "primary_role"
  | "role_achieved"
  | "previous_profession"
  | "new_role"
  | "avatar"
  | "capture"
  | "video"
  | "video_url"
  | "instagram"
  | "linkedin"
  | "consent";

export const FIELD_STEP: Record<FormField, number> = {
  type: 1,
  full_name: 2,
  country: 2,
  email: 2,
  avatar: 2,
  story: 3,
  company: 3,
  primary_role: 3,
  role_achieved: 3,
  previous_profession: 3,
  new_role: 3,
  capture: 4,
  video: 4,
  video_url: 4,
  instagram: 4,
  linkedin: 4,
  consent: 5,
};

export type ParsedTestimonial = {
  type: TestimonialType;
  fullName: string;
  country: string;
  email: string;
  story: string;
  instagram: string | null;
  linkedin: string | null;
  videoUrl: string | null;
  video: File | null;
  payload: TestimonialPayload;
  quote: string;
  igCaption: string;
  liCaption: string;
  consentAt: string;
  avatar: File;
  capture: File | null;
};

export type ParseResult =
  | { ok: true; data: ParsedTestimonial }
  | { ok: false; fieldErrors: FieldErrors; message: string };

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function youtubeVideoId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  if (host === "youtu.be" || host === "www.youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return VIDEO_ID_PATTERN.test(id ?? "") ? (id ?? null) : null;
  }

  const watchId = url.searchParams.get("v");
  if (watchId && VIDEO_ID_PATTERN.test(watchId)) {
    return watchId;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  const [kind, maybeId] = parts;
  if (
    (kind === "embed" || kind === "shorts" || kind === "live") &&
    VIDEO_ID_PATTERN.test(maybeId ?? "")
  ) {
    return maybeId ?? null;
  }

  return null;
}

export function youtubeEmbedSrc(raw: string): string | null {
  const id = youtubeVideoId(raw);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function youtubeWatchUrl(raw: string) {
  const id = youtubeVideoId(raw);
  if (!id) {
    return raw;
  }

  const watch = new URL("https://www.youtube.com/watch");
  watch.searchParams.set("v", id);

  try {
    const t = new URL(raw).searchParams.get("t");
    if (t) {
      watch.searchParams.set("t", t);
    }
  } catch {
    // keep watch?v=id
  }

  return watch.toString();
}

export function normalizeYouTubeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  return youtubeVideoId(trimmed) ? trimmed : null;
}

export function normalizeInstagram(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const asUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(asUrl);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "instagram.com") {
      const handle = url.pathname.split("/").filter(Boolean)[0];
      if (handle && INSTAGRAM_HANDLE_PATTERN.test(handle)) {
        return `@${handle}`;
      }
      return null;
    }
    if (trimmed.includes("/")) {
      return null;
    }
  } catch {
    // Handle-only input.
  }

  const handle = trimmed.replace(/^@/, "");
  return INSTAGRAM_HANDLE_PATTERN.test(handle) ? `@${handle}` : null;
}

const LINKEDIN_IN_PATTERN = /^[A-Za-z0-9_-]{3,100}$/;

export function normalizeLinkedIn(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const asUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(asUrl);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "linkedin.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "in" && parts[1] && LINKEDIN_IN_PATTERN.test(parts[1])) {
        return `https://www.linkedin.com/in/${parts[1]}`;
      }
      return null;
    }
  } catch {
    // Handle-only input.
  }

  const handle = trimmed.replace(/^@/, "").replace(/^in\//, "");
  return LINKEDIN_IN_PATTERN.test(handle)
    ? `https://www.linkedin.com/in/${handle}`
    : null;
}

export function validateImageFile(
  file: File | null,
  options: { required: boolean; maxBytes: number; label: string },
): string | undefined {
  if (!file) {
    return options.required
      ? `${options.label} es obligatorio.`
      : undefined;
  }

  if (!isAllowedImage(file)) {
    return `${options.label}: usá jpg, png o webp.`;
  }

  if (file.size > options.maxBytes) {
    const maxMb = Math.round(options.maxBytes / (1024 * 1024));
    return `${options.label}: máximo ${maxMb} MB.`;
  }

  return undefined;
}

export function validateVideoFile(
  file: File | null,
  options: { required: boolean; maxBytes: number },
): string | undefined {
  if (!file) {
    return options.required ? "El video es obligatorio." : undefined;
  }

  if (!isAllowedVideo(file)) {
    return "Video: usá mp4 (o mov).";
  }

  if (file.size > options.maxBytes) {
    const maxMb = Math.round(options.maxBytes / (1024 * 1024));
    return `Video: máximo ${maxMb} MB (límite free de FFmpeg Micro).`;
  }

  return undefined;
}

export function parseTestimonialForm(formData: FormData): ParseResult {
  const fieldErrors: FieldErrors = {};
  const typeRaw = readString(formData, "type");
  const fullName = readString(formData, "full_name");
  const country = readString(formData, "country");
  const email = readString(formData, "email");
  const story = readString(formData, "story");
  const instagramRaw = readString(formData, "instagram");
  const linkedinRaw = readString(formData, "linkedin");
  const videoRaw = readString(formData, "video_url");
  const company = readString(formData, "company");
  const primaryRole = readString(formData, "primary_role");
  const roleAchieved = readString(formData, "role_achieved");
  const previousProfession = readString(formData, "previous_profession");
  const newRole = readString(formData, "new_role");
  const consent = formData.get("consent") === "1";
  const avatar = readFile(formData, "avatar");
  const capture = readFile(formData, "capture");
  const video = readFile(formData, "video");

  if (!isTestimonialType(typeRaw)) {
    fieldErrors.type = "Elegí qué querés contar.";
  }

  if (!fullName) {
    fieldErrors.full_name = "El nombre es obligatorio.";
  } else if (fullName.length > NAME_MAX_CHARS) {
    fieldErrors.full_name = `Máximo ${NAME_MAX_CHARS} caracteres.`;
  }

  if (!country) {
    fieldErrors.country = "El país es obligatorio.";
  } else if (country.length > FIELD_MAX_CHARS) {
    fieldErrors.country = `Máximo ${FIELD_MAX_CHARS} caracteres.`;
  }

  if (!email) {
    fieldErrors.email = "El email es obligatorio. No se muestra en público.";
  } else if (!isValidEmail(email)) {
    fieldErrors.email = "Ingresá un email válido.";
  }

  if (!story) {
    fieldErrors.story = "Contanos tu historia.";
  } else if (story.length < STORY_MIN_CHARS) {
    fieldErrors.story = `Escribí al menos ${STORY_MIN_CHARS} caracteres.`;
  } else if (story.length > STORY_MAX_CHARS) {
    fieldErrors.story = `Máximo ${STORY_MAX_CHARS} caracteres.`;
  }

  const type = isTestimonialType(typeRaw) ? typeRaw : null;
  let payload: TestimonialPayload = {};

  if (type === "simulation" && primaryRole) {
    if (primaryRole.length > FIELD_MAX_CHARS) {
      fieldErrors.primary_role = `Máximo ${FIELD_MAX_CHARS} caracteres.`;
    } else {
      payload = { primary_role: primaryRole };
    }
  }

  if (type === "first_job") {
    if (!company) {
      fieldErrors.company = "La empresa es obligatoria.";
    } else if (company.length > FIELD_MAX_CHARS) {
      fieldErrors.company = `Máximo ${FIELD_MAX_CHARS} caracteres.`;
    }
    if (!roleAchieved) {
      fieldErrors.role_achieved = "El puesto es obligatorio.";
    } else if (roleAchieved.length > FIELD_MAX_CHARS) {
      fieldErrors.role_achieved = `Máximo ${FIELD_MAX_CHARS} caracteres.`;
    }
    if (company && roleAchieved) {
      payload = { company, role_achieved: roleAchieved };
    }
  }

  if (type === "career_change") {
    if (!previousProfession) {
      fieldErrors.previous_profession = "El oficio anterior es obligatorio.";
    } else if (previousProfession.length > FIELD_MAX_CHARS) {
      fieldErrors.previous_profession = `Máximo ${FIELD_MAX_CHARS} caracteres.`;
    }
    if (!newRole) {
      fieldErrors.new_role = "El rol nuevo es obligatorio.";
    } else if (newRole.length > FIELD_MAX_CHARS) {
      fieldErrors.new_role = `Máximo ${FIELD_MAX_CHARS} caracteres.`;
    }
    if (previousProfession && newRole) {
      payload = {
        previous_profession: previousProfession,
        new_role: newRole,
      };
    }
  }

  const avatarError = validateImageFile(avatar, {
    required: true,
    maxBytes: AVATAR_MAX_BYTES,
    label: "La foto de perfil",
  });
  if (avatarError) {
    fieldErrors.avatar = avatarError;
  }

  const captureError = validateImageFile(capture, {
    required: false,
    maxBytes: CAPTURE_MAX_BYTES,
    label: "La captura del proyecto",
  });
  if (captureError) {
    fieldErrors.capture = captureError;
  }

  const videoError = validateVideoFile(video, {
    required: false,
    maxBytes: VIDEO_MAX_BYTES,
  });
  if (videoError) {
    fieldErrors.video = videoError;
  }

  let videoUrl: string | null = null;
  if (videoRaw) {
    videoUrl = normalizeYouTubeUrl(videoRaw);
    if (!videoUrl) {
      fieldErrors.video_url = "Pegá un link de YouTube (youtube.com o youtu.be).";
    }
  }

  let instagram: string | null = null;
  if (instagramRaw) {
    instagram = normalizeInstagram(instagramRaw);
    if (!instagram) {
      fieldErrors.instagram = "Usá tu usuario (@nombre) o el link de Instagram.";
    }
  }

  let linkedin: string | null = null;
  if (linkedinRaw) {
    linkedin = normalizeLinkedIn(linkedinRaw);
    if (!linkedin) {
      fieldErrors.linkedin = "Pegá tu perfil (linkedin.com/in/…) o tu usuario.";
    }
  }

  if (!consent) {
    fieldErrors.consent = "Tenés que aceptar para enviar.";
  }

  if (Object.keys(fieldErrors).length > 0 || !type || !avatar) {
    return {
      ok: false,
      fieldErrors,
      message: "Revisá los campos marcados.",
    };
  }

  const quote = excerptQuote(story);
  const igCaption = buildIgCaption({
    quote,
    fullName,
    instagram,
  });
  const liCaption = buildLiCaption({
    quote,
    fullName,
    linkedin,
  });

  return {
    ok: true,
    data: {
      type,
      fullName,
      country,
      email,
      story,
      instagram,
      linkedin,
      videoUrl,
      video,
      payload,
      quote,
      igCaption,
      liCaption,
      consentAt: new Date().toISOString(),
      avatar,
      capture,
    },
  };
}

export function firstErrorStep(fieldErrors: FieldErrors): number {
  const steps = Object.keys(fieldErrors)
    .map((key) => FIELD_STEP[key as FormField])
    .filter((step): step is number => typeof step === "number");
  return steps.length ? Math.min(...steps) : 1;
}

function isAllowedVideo(file: File): boolean {
  if (
    ALLOWED_VIDEO_TYPES.includes(
      file.type as (typeof ALLOWED_VIDEO_TYPES)[number],
    )
  ) {
    return true;
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension === "mp4" || extension === "mov" || extension === "m4v";
}

function isAllowedImage(file: File): boolean {
  if (
    ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    )
  ) {
    return true;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  return (
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "webp"
  );
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  if (value instanceof File && value.size > 0 && value.name) {
    return value;
  }
  return null;
}

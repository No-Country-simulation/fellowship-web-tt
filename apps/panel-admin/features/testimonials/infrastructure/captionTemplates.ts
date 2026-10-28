import type { TestimonialType } from "../types/testimonial";
import { youtubeWatchUrl } from "./youtube";

export const QUOTE_EDIT_MAX_CHARS = 400;

/** Tope de la descripción en cada red. El de la cita es `QUOTE_EDIT_MAX_CHARS`. */
export const CAPTION_MAX_CHARS = {
  instagram: 2200,
  linkedin: 3000,
  discord: 4096,
} as const;

export const IG_HASHTAGS = ["#NoCountry", "#DemoDay", "#TalentoIT"] as const;

const CAPTION_INTROS: Record<
  TestimonialType,
  Record<"instagram" | "linkedin" | "discord", string>
> = {
  simulation: {
    instagram:
      "Hay simulaciones que se cuentan en una imagen. Esta es la de alguien de nuestro talento.",
    linkedin:
      "Compartimos el recorrido de alguien que pasó por una simulación laboral y dio el paso hacia un rol en tecnología.",
    discord:
      "Comunidad, les dejamos otra historia de simulación: un equipo, un rol y alguien de No Country que lo vivió.",
  },
  first_job: {
    instagram:
      "Un primer empleo también se puede contar en una imagen. Esta es la de alguien de nuestro talento.",
    linkedin:
      "Compartimos el recorrido de alguien que consiguió su primer empleo después de pasar por No Country.",
    discord:
      "Comunidad, les dejamos una historia de primer empleo: el puente entre la simulación y el trabajo.",
  },
  career_change: {
    instagram:
      "Una reconversión también cabe en una imagen. Esta es la de alguien de nuestro talento.",
    linkedin:
      "Compartimos el recorrido de alguien que se reconvirtió y cambió de oficio con No Country.",
    discord:
      "Comunidad, les dejamos una historia de reconversión: el oficio de antes y el rol de ahora.",
  },
};

/** Intros vigentes. La lista de textos viejos se arma aparte y se suma a estas. */
export function currentCaptionIntros(): string[] {
  return Object.values(CAPTION_INTROS).flatMap((row) => Object.values(row));
}

/** Intro de esa red y de ese tipo de testimonio. */
export function defaultCaptionIntro(
  network: "instagram" | "linkedin" | "discord",
  type: TestimonialType,
): string {
  return CAPTION_INTROS[type][network];
}

export function stripWrappingQuotes(value: string): string {
  return value.replace(/^["“«]+|[»"”]+$/g, "").trim();
}

export function normalizeCaption(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

/** Intro + nombre + redes (una por línea). Instagram y LinkedIn cierran con hashtags. */
export function buildShareCaption(input: {
  intro: string;
  fullName: string;
  handles?: (string | null | undefined)[];
  hashtags?: boolean;
}): string {
  const lines = [input.intro.trim(), "", input.fullName.trim()];
  for (const handle of input.handles ?? []) {
    const value = handle?.trim();
    if (value) {
      lines.push(value);
    }
  }
  if (input.hashtags !== false) {
    lines.push("", IG_HASHTAGS.join(" "));
  }
  return lines.join("\n");
}

/** Misma plantilla que las otras redes, sin mención y sin hashtags. Si hay video, el link va al final. */
export function buildDiscordCaption(input: {
  fullName: string;
  type: TestimonialType;
  intro?: string;
  videoUrl?: string | null;
}): string {
  return withVideoLine(
    buildShareCaption({
      intro: input.intro?.trim() || defaultCaptionIntro("discord", input.type),
      fullName: input.fullName,
      hashtags: false,
    }),
    input.videoUrl,
  );
}

const LINKEDIN_IN_PATTERN = /^[A-Za-z0-9_-]{3,100}$/;

/** `@usuario` a partir de `linkedin.com/in/{usuario}` o de un handle suelto. */
export function linkedInMention(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const asUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(asUrl);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "linkedin.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      const handle = parts[0] === "in" ? parts[1] : null;
      return handle && LINKEDIN_IN_PATTERN.test(handle) ? `@${handle}` : null;
    }
  } catch {
    // Handle suelto, sin URL.
  }

  const handle = trimmed.replace(/^@/, "").replace(/^in\//i, "");
  if (handle.includes("/")) {
    return null;
  }
  return LINKEDIN_IN_PATTERN.test(handle) ? `@${handle}` : null;
}

/** Texto de Instagram. Usa el valor guardado (`@usuario`). Sin red, esa línea no va. */
export function buildIgCaption(input: {
  fullName: string;
  instagram: string | null;
  type: TestimonialType;
  intro?: string;
}): string {
  return buildShareCaption({
    intro: input.intro?.trim() || defaultCaptionIntro("instagram", input.type),
    fullName: input.fullName,
    handles: [input.instagram],
  });
}

/** Texto de LinkedIn. La mención es `@usuario`, no el link del perfil. Si hay video, el link va al final. */
export function buildLiCaption(input: {
  fullName: string;
  linkedin: string | null;
  type: TestimonialType;
  intro?: string;
  videoUrl?: string | null;
}): string {
  return withVideoLine(
    buildShareCaption({
      intro: input.intro?.trim() || defaultCaptionIntro("linkedin", input.type),
      fullName: input.fullName,
      handles: [linkedInMention(input.linkedin)],
    }),
    input.videoUrl,
  );
}

/** Cualquier renglón final de video, aunque el link esté cortado. */
const ANY_VIDEO_LINE = /\n*Video(?: testimonial)?:[^\n]*\s*$/i;

const LABELED_VIDEO_URL = /\n+Video(?: testimonial)?: (https?:\/\/\S+)\s*$/i;

/** Línea que se publica. Siempre el link completo del testimonio. */
export function videoCaptionLine(videoUrl: string | null | undefined): string | null {
  const video = videoUrl?.trim();
  if (!video) {
    return null;
  }
  return `Video testimonial: ${youtubeWatchUrl(video)}`;
}

export function withVideoLine(caption: string, videoUrl: string | null | undefined) {
  const line = videoCaptionLine(videoUrl);
  if (!line) {
    return caption;
  }
  return `${caption}\n\n${line}`;
}

/** El renglón viejo decía "Video:". En el texto queda "Video testimonial:". */
export function nameVideoLine(caption: string) {
  return caption.replace(LABELED_VIDEO_URL, "\n\nVideo testimonial: $1");
}

export function omitVideoLine(caption: string) {
  return caption.replace(ANY_VIDEO_LINE, "").trim();
}

/** True si la descripción ya trae el link de ese video. */
export function captionIncludesVideo(caption: string, videoUrl: string | null | undefined): boolean {
  const video = videoUrl?.trim();
  if (!video) {
    return false;
  }
  return normalizeCaption(caption).includes(youtubeWatchUrl(video));
}

/** Deja o saca el link del final de la descripción. */
export function setCaptionVideo(
  caption: string,
  videoUrl: string | null | undefined,
  include: boolean,
): string {
  const body = omitVideoLine(caption);
  return include ? withVideoLine(body, videoUrl) : body;
}

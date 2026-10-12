const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);
const VIDEO_ID_PATTERN = /^[\w-]{11}$/;

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

/** Link `watch?v=` para Discord y LinkedIn. Instagram no postea el video. */
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

import { IG_CARD_SIZE } from "./ig-card";

const BG = "#000115";
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "#999999";
const AVATAR_FALLBACK = "#12132a";
const ACCENT = "#fe0096";
const LOGO_WIDTH = 380;
const AVATAR_SIZE = 220;
const PAD = 80;
const BAR = 8;
const LOGO_SRC = "/brand/logo-no-country.png";

const imageCache = new Map<string, ImageBitmap | null>();

export async function drawIgCard(
  canvas: HTMLCanvasElement,
  input: {
    quote: string;
    fullName: string;
    avatarUrl: string;
    instagram: string | null;
    typeLabel: string;
    contextLine: string | null;
  },
) {
  canvas.width = IG_CARD_SIZE;
  canvas.height = IG_CARD_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No pudimos generar la imagen.");
  }

  await document.fonts.ready;
  const [logo, avatar] = await Promise.all([
    loadImage(LOGO_SRC),
    input.avatarUrl ? loadImage(input.avatarUrl) : Promise.resolve(null),
  ]);

  const fontFamily =
    getComputedStyle(document.body).fontFamily || "sans-serif";

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, IG_CARD_SIZE, IG_CARD_SIZE);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 0, IG_CARD_SIZE, BAR);

  const cx = IG_CARD_SIZE / 2;
  let y = BAR + PAD;

  const logoHeight = logo
    ? Math.round((LOGO_WIDTH * logo.height) / logo.width)
    : 36;

  if (logo) {
    ctx.drawImage(logo, cx - LOGO_WIDTH / 2, y, LOGO_WIDTH, logoHeight);
  } else {
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.font = `500 36px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("No Country", cx, y);
  }

  const typeSize = 32;
  y += logoHeight + 20;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `500 ${typeSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(input.typeLabel.toUpperCase(), cx, y);
  y += typeSize + 32;

  drawAvatar(ctx, avatar, input.fullName, cx, y, fontFamily);
  y += AVATAR_SIZE + 36;

  const nameSize = 32;
  const igSize = 26;
  const igGap = 8;
  const contextSize = 26;
  const contextGap = 12;
  const handle = input.instagram?.trim() || null;
  const context = input.contextLine?.trim() || null;
  const footerHeight =
    (context ? contextSize + contextGap : 0) +
    nameSize +
    (handle ? igGap + igSize : 0);
  const footerTop = IG_CARD_SIZE - PAD - footerHeight;
  const quoteMaxWidth = IG_CARD_SIZE - PAD * 2;
  const quoteMaxHeight = footerTop - 32 - y;
  drawQuote(
    ctx,
    `“${input.quote}”`,
    cx,
    y,
    quoteMaxWidth,
    quoteMaxHeight,
    fontFamily,
  );

  let footerY = footerTop;
  if (context) {
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.font = `400 ${contextSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(truncateToWidth(ctx, context, quoteMaxWidth), cx, footerY);
    footerY += contextSize + contextGap;
  }

  ctx.fillStyle = TEXT_SECONDARY;
  ctx.font = `500 ${nameSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(input.fullName, cx, footerY);

  if (handle) {
    ctx.font = `400 ${igSize}px ${fontFamily}`;
    ctx.fillText(handle, cx, footerY + nameSize + igGap);
  }
}

export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("No pudimos generar la imagen."));
    }, "image/png");
  });
}

export async function igCardPngBlob(
  input: Parameters<typeof drawIgCard>[1],
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await drawIgCard(canvas, input);
  return canvasToPng(canvas);
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  avatar: ImageBitmap | null,
  fullName: string,
  cx: number,
  y: number,
  fontFamily: string,
) {
  const r = AVATAR_SIZE / 2;
  if (avatar) {
    const scale = Math.max(
      AVATAR_SIZE / avatar.width,
      AVATAR_SIZE / avatar.height,
    );
    const w = avatar.width * scale;
    const h = avatar.height * scale;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, y + r, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, cx - w / 2, y + r - h / 2, w, h);
    ctx.restore();
    return;
  }

  ctx.fillStyle = AVATAR_FALLBACK;
  ctx.beginPath();
  ctx.arc(cx, y + r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.font = `500 80px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initialOf(fullName), cx, y + r);
}

function drawQuote(
  ctx: CanvasRenderingContext2D,
  quote: string,
  cx: number,
  top: number,
  maxWidth: number,
  maxHeight: number,
  fontFamily: string,
) {
  let fontSize = quote.length > 220 ? 34 : quote.length > 160 ? 38 : 42;
  let lines: string[] = [];
  let lineHeight = fontSize * 1.35;

  while (fontSize >= 28) {
    ctx.font = `400 ${fontSize}px ${fontFamily}`;
    lines = wrapText(ctx, quote, maxWidth);
    lineHeight = fontSize * 1.35;
    if (lines.length * lineHeight <= maxHeight) {
      break;
    }
    fontSize -= 2;
  }

  const used = Math.min(lines.length, Math.max(1, Math.floor(maxHeight / lineHeight)));
  const startY = top + (maxHeight - used * lineHeight) / 2;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  for (let i = 0; i < used; i += 1) {
    ctx.fillText(lines[i] ?? "", cx, startY + i * lineHeight);
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth) {
      line = trial;
      continue;
    }
    if (line) {
      lines.push(line);
    }
    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
      continue;
    }
    let chunk = "";
    for (const ch of word) {
      const next = chunk + ch;
      if (ctx.measureText(next).width <= maxWidth) {
        chunk = next;
      } else {
        if (chunk) {
          lines.push(chunk);
        }
        chunk = ch;
      }
    }
    line = chunk;
  }

  if (line) {
    lines.push(line);
  }
  return lines;
}

async function loadImage(src: string) {
  const cached = imageCache.get(src);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await fetch(src, { mode: "cors", cache: "force-cache" });
    if (!response.ok) {
      imageCache.set(src, null);
      return null;
    }
    const bitmap = await createImageBitmap(await response.blob());
    imageCache.set(src, bitmap);
    return bitmap;
  } catch {
    imageCache.set(src, null);
    return null;
  }
}

function initialOf(name: string) {
  const initial = name.trim().charAt(0);
  return initial ? initial.toUpperCase() : "N";
}

function truncateToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }
  const ellipsis = "…";
  let cut = text;
  while (cut.length > 0 && ctx.measureText(`${cut}${ellipsis}`).width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut}${ellipsis}`;
}

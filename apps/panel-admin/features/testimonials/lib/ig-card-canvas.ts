import {
  IG_CARD_HEIGHT,
  IG_CARD_WIDTH,
  IG_PHOTO_HEIGHT,
  type IgCardContent,
} from "./ig-card";
import { stripWrappingQuotes } from "./quote";
import type { TestimonialType } from "./types";

const LOGO_SRC = "/brand/logo-no-country.png";
const FALLBACK_PHOTO_SRC = "/brand/ig-fallback.jpg";
const PAD = 52;
const AUTHOR_H = 168;

const PINK = "#ff3d9a";
const INK = "#16132b";

type Variant = "learning" | "job" | "change";

const COPY: Record<
  Variant,
  { badge: string; kicker: string }
> = {
  learning: { badge: "APRENDIZAJE", kicker: "LO QUE APRENDÍ" },
  job: { badge: "PRIMER EMPLEO", kicker: "MI PRIMER EMPLEO" },
  change: { badge: "RECONVERSIÓN PROFESIONAL", kicker: "MI RECONVERSIÓN" },
};

const imageCache = new Map<string, ImageBitmap | null>();

export async function drawIgCard(
  canvas: HTMLCanvasElement,
  input: IgCardContent,
) {
  canvas.width = IG_CARD_WIDTH;
  canvas.height = IG_CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No pudimos generar la imagen.");
  }

  await document.fonts.ready;
  const [logo, avatar, capture, fallbackPhoto] = await Promise.all([
    loadImage(LOGO_SRC),
    input.avatarUrl ? loadImage(input.avatarUrl) : Promise.resolve(null),
    input.captureUrl ? loadImage(input.captureUrl) : Promise.resolve(null),
    loadImage(FALLBACK_PHOTO_SRC),
  ]);
  const photo = capture ?? fallbackPhoto;

  const fontFamily =
    getComputedStyle(document.body).fontFamily || "sans-serif";
  const variant = variantOf(input.type);
  const copy = COPY[variant];

  const hasPhoto = Boolean(photo);
  ctx.imageSmoothingQuality = "high";
  if (photo) {
    drawPhoto(ctx, photo, variant);
    drawTopScrim(ctx);
  } else {
    drawBody(ctx, variant, 0);
  }
  drawLogo(
    ctx,
    logo,
    fontFamily,
    variant === "job" && !hasPhoto ? INK : "#ffffff",
  );
  drawBadge(ctx, copy.badge, variant, fontFamily);
  if (hasPhoto) {
    drawBody(ctx, variant, IG_PHOTO_HEIGHT);
  }

  const authorTop = IG_CARD_HEIGHT - PAD - AUTHOR_H;
  const kickerSize = 26;
  const headerBottom = 156;
  let contentTop = headerBottom;
  if (hasPhoto) {
    contentTop = IG_PHOTO_HEIGHT + (variant === "job" ? 72 : 44);
    if (variant === "job") {
      drawHiredPill(ctx, input.company, fontFamily, IG_PHOTO_HEIGHT - 38);
    }
  } else if (variant === "job" && input.company?.trim()) {
    drawHiredPill(ctx, input.company, fontFamily, headerBottom);
    contentTop = headerBottom + 76 + 40;
  }

  const showPills = variant === "change" && Boolean(input.previousRole && input.role);
  const pillsBlock = showPills ? 28 + 56 : 0;
  const quoteMaxWidth = IG_CARD_WIDTH - PAD * 2;
  const quoteMaxHeight = Math.max(
    80,
    authorTop - 36 - contentTop - kickerSize - 28 - pillsBlock,
  );
  const quoteLayout = layoutQuote(
    ctx,
    `“${stripWrappingQuotes(input.quote)}”`,
    quoteMaxWidth,
    quoteMaxHeight,
    fontFamily,
    hasPhoto ? 48 : 56,
  );
  const block =
    kickerSize + 28 + quoteLayout.height + pillsBlock;
  const room = authorTop - 36 - contentTop;
  const kickerY = hasPhoto
    ? contentTop
    : contentTop + Math.max(0, (room - block) / 2);
  drawKicker(ctx, copy.kicker, variant, PAD, kickerY, fontFamily);

  const quoteTop = kickerY + kickerSize + 28;
  paintQuote(ctx, quoteLayout, PAD, quoteTop, quoteMaxWidth, variant, fontFamily);

  if (showPills && input.previousRole && input.role) {
    drawTransition(
      ctx,
      input.previousRole,
      input.role,
      PAD,
      quoteTop + quoteLayout.height + 28,
      quoteMaxWidth,
      fontFamily,
    );
  }

  drawAuthor(ctx, {
    variant,
    fullName: input.fullName,
    country: input.country,
    role: input.role,
    avatar,
    fontFamily,
    y: authorTop,
  });
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

export async function igCardPngBlob(input: IgCardContent): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await drawIgCard(canvas, input);
  return canvasToPng(canvas);
}

function variantOf(type: TestimonialType): Variant {
  if (type === "first_job") {
    return "job";
  }
  if (type === "career_change") {
    return "change";
  }
  return "learning";
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  capture: ImageBitmap,
  variant: Variant,
) {
  if (variant === "job") {
    ctx.fillStyle = "#f4f2f6";
  } else if (variant === "change") {
    ctx.fillStyle = "#070b18";
  } else {
    ctx.fillStyle = learningGradient(ctx, 0, 0, IG_CARD_WIDTH);
  }
  ctx.fillRect(0, 0, IG_CARD_WIDTH, IG_PHOTO_HEIGHT);
  drawContain(ctx, capture, 0, 0, IG_CARD_WIDTH, IG_PHOTO_HEIGHT);
}

function drawTopScrim(ctx: CanvasRenderingContext2D) {
  const scrim = ctx.createLinearGradient(0, 0, 0, 220);
  scrim.addColorStop(0, "rgba(0,0,0,0.5)");
  scrim.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, IG_CARD_WIDTH, 220);
}

function drawLogo(
  ctx: CanvasRenderingContext2D,
  logo: ImageBitmap | null,
  fontFamily: string,
  fallbackColor: string,
) {
  const y = 44;
  if (!logo) {
    ctx.fillStyle = fallbackColor;
    ctx.font = `600 36px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("No Country", PAD, y);
    return;
  }
  const width = 300;
  const height = Math.round((width * logo.height) / logo.width);
  ctx.drawImage(tintLogo(logo, width, height, "#ffffff"), PAD, y);
}

function tintLogo(
  logo: ImageBitmap,
  width: number,
  height: number,
  color: string,
) {
  const surface = document.createElement("canvas");
  surface.width = width;
  surface.height = height;
  const ctx = surface.getContext("2d");
  if (!ctx) {
    return logo;
  }
  ctx.drawImage(logo, 0, 0, width, height);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  return surface;
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  label: string,
  variant: Variant,
  fontFamily: string,
) {
  const fontSize = 22;
  const tracking = 1.4;
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  const textWidth = measureTracked(ctx, label, tracking);
  const padX = 22;
  const height = 58;
  const width = textWidth + padX * 2;
  const x = IG_CARD_WIDTH - PAD - width;
  const y = 46;

  ctx.beginPath();
  roundRect(ctx, x, y, width, height, height / 2);
  if (variant === "learning") {
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.fillStyle = INK;
  } else if (variant === "job") {
    const fill = ctx.createLinearGradient(x, y, x + width, y);
    fill.addColorStop(0, PINK);
    fill.addColorStop(1, "#38bdf8");
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
  } else {
    const fill = ctx.createLinearGradient(x, y, x + width, y);
    fill.addColorStop(0, "#c026d3");
    fill.addColorStop(1, "#7c3aed");
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  fillTracked(ctx, label, x + padX, y + height / 2, tracking);
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  variant: Variant,
  fromY: number,
) {
  const height = IG_CARD_HEIGHT - fromY;
  if (variant === "job") {
    ctx.fillStyle = "#f4f2f6";
    ctx.fillRect(0, fromY, IG_CARD_WIDTH, height);
    return;
  }
  if (variant === "change") {
    ctx.fillStyle = "#070b18";
    ctx.fillRect(0, fromY, IG_CARD_WIDTH, height);
    return;
  }
  const fill = learningGradient(ctx, 0, fromY, IG_CARD_WIDTH);
  ctx.fillStyle = fill;
  ctx.fillRect(0, fromY, IG_CARD_WIDTH, height);
}

/** Horizontal y más oscuro que `--gradient-brand`: magenta → índigo. */
function learningGradient(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
) {
  const fill = ctx.createLinearGradient(x, y, x + width, y);
  fill.addColorStop(0, "#e63292");
  fill.addColorStop(1, "#0e1f99");
  return fill;
}

function drawHiredPill(
  ctx: CanvasRenderingContext2D,
  company: string | null,
  fontFamily: string,
  top: number,
) {
  const name = company?.trim();
  if (!name) {
    return;
  }

  const height = 76;
  const y = top;
  ctx.font = `700 18px ${fontFamily}`;
  const label = "CONTRATADO POR";
  const labelWidth = measureTracked(ctx, label, 1.2);
  ctx.font = `700 34px ${fontFamily}`;
  const nameWidth = ctx.measureText(name).width;
  const check = 28;
  const leftW = 28 + check + 14 + labelWidth + 26;
  const rightW = 32 + nameWidth + 32;
  const maxRight = IG_CARD_WIDTH - PAD * 2 - leftW;
  const usedRight = Math.min(rightW, Math.max(160, maxRight));
  const total = leftW + usedRight;
  const x = (IG_CARD_WIDTH - total) / 2;

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, total, height, height / 2);
  ctx.clip();
  const left = ctx.createLinearGradient(x, y, x + leftW, y + height);
  left.addColorStop(0, "#ff2d8a");
  left.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = left;
  ctx.fillRect(x, y, leftW, height);
  const right = ctx.createLinearGradient(x + leftW, y, x + total, y);
  right.addColorStop(0, "#6366f1");
  right.addColorStop(1, "#38bdf8");
  ctx.fillStyle = right;
  ctx.fillRect(x + leftW, y, usedRight, height);
  ctx.restore();

  const midY = y + height / 2;
  drawCheck(ctx, x + 28, midY);
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 18px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  fillTracked(ctx, label, x + 28 + check + 14, midY, 1.2);

  ctx.font = `700 34px ${fontFamily}`;
  const shown = truncateToWidth(ctx, name, usedRight - 64);
  ctx.fillText(shown, x + leftW + 32, midY);
}

function drawKicker(
  ctx: CanvasRenderingContext2D,
  label: string,
  variant: Variant,
  x: number,
  y: number,
  fontFamily: string,
) {
  ctx.font = `700 26px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = variant === "learning" ? "rgba(255,255,255,0.92)" : PINK;
  fillTracked(ctx, label, x, y, 3.2);
}

function layoutQuote(
  ctx: CanvasRenderingContext2D,
  quote: string,
  maxWidth: number,
  maxHeight: number,
  fontFamily: string,
  maxFont: number,
) {
  let fontSize = maxFont;
  let lines: string[] = [];
  let lineHeight = fontSize * 1.28;

  while (fontSize >= 30) {
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    lines = wrapText(ctx, quote, maxWidth);
    lineHeight = fontSize * 1.28;
    if (lines.length * lineHeight <= maxHeight) {
      break;
    }
    fontSize -= 2;
  }

  const used = Math.min(
    lines.length,
    Math.max(1, Math.floor(maxHeight / lineHeight)),
  );
  return { fontSize, lines, lineHeight, used, height: used * lineHeight };
}

function paintQuote(
  ctx: CanvasRenderingContext2D,
  layout: ReturnType<typeof layoutQuote>,
  x: number,
  top: number,
  maxWidth: number,
  variant: Variant,
  fontFamily: string,
) {
  ctx.fillStyle = variant === "job" ? INK : "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `600 ${layout.fontSize}px ${fontFamily}`;
  for (let i = 0; i < layout.used; i += 1) {
    const line = layout.lines[i] ?? "";
    const shown =
      i === layout.used - 1 && layout.lines.length > layout.used
        ? truncateToWidth(ctx, line, maxWidth)
        : line;
    ctx.fillText(shown, x, top + i * layout.lineHeight);
  }
}

function drawTransition(
  ctx: CanvasRenderingContext2D,
  previousRole: string,
  role: string,
  x: number,
  y: number,
  maxWidth: number,
  fontFamily: string,
) {
  const height = 56;
  const fontSize = 24;
  ctx.font = `600 ${fontSize}px ${fontFamily}`;
  const before = `Antes · ${previousRole}`;
  const after = `Ahora · ${role}`;
  const beforeW = Math.min(ctx.measureText(before).width + 40, maxWidth * 0.42);
  const afterW = Math.min(ctx.measureText(after).width + 44, maxWidth * 0.42);
  const arrowW = 56;

  drawPill(ctx, x, y, beforeW, height, "rgba(255,255,255,0.14)");
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(truncateToWidth(ctx, before, beforeW - 28), x + beforeW / 2, y + height / 2);

  ctx.fillStyle = PINK;
  ctx.font = `600 28px ${fontFamily}`;
  ctx.fillText("→", x + beforeW + arrowW / 2, y + height / 2);

  const afterX = x + beforeW + arrowW;
  ctx.font = `600 ${fontSize}px ${fontFamily}`;
  drawPill(ctx, afterX, y, afterW, height, "rgba(255,61,154,0.16)", PINK);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(
    truncateToWidth(ctx, after, afterW - 28),
    afterX + afterW / 2,
    y + height / 2,
  );
}

function drawAuthor(
  ctx: CanvasRenderingContext2D,
  input: {
    variant: Variant;
    fullName: string;
    country: string | null;
    role: string | null;
    avatar: ImageBitmap | null;
    fontFamily: string;
    y: number;
  },
) {
  const x = PAD;
  const width = IG_CARD_WIDTH - PAD * 2;
  const light = input.variant === "job";

  ctx.save();
  if (light) {
    ctx.shadowColor = "rgba(24, 16, 48, 0.12)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 10;
  }
  ctx.beginPath();
  roundRect(ctx, x, input.y, width, AUTHOR_H, 28);
  ctx.fillStyle = light
    ? "#ffffff"
    : input.variant === "learning"
      ? "rgba(4, 0, 18, 0.28)"
      : "rgba(255,255,255,0.08)";
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  roundRect(ctx, x, input.y, width, AUTHOR_H, 28);
  ctx.strokeStyle = light
    ? "#ece7f3"
    : input.variant === "learning"
      ? "rgba(255,255,255,0.16)"
      : "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const hexR = 52;
  const hexCx = x + 40 + hexR;
  const hexCy = input.y + AUTHOR_H / 2;
  drawHexAvatar(ctx, input.avatar, input.fullName, hexCx, hexCy, hexR, input.fontFamily);

  const textX = hexCx + hexR + 28;
  const textMax = x + width - 36 - textX;
  const role = input.role?.trim() || null;
  const country = input.country?.trim() || null;
  ctx.textAlign = "left";
  ctx.fillStyle = light ? INK : "#ffffff";
  if (role) {
    const block = 40 + 10 + 28;
    const textY = hexCy - block / 2;
    ctx.textBaseline = "top";
    drawNameAndCountry(ctx, input.fullName, country, textX, textY, textMax, input.fontFamily, light);
    ctx.font = `600 28px ${input.fontFamily}`;
    ctx.fillStyle = light ? PINK : "#ffffff";
    ctx.fillText(truncateToWidth(ctx, role, textMax), textX, textY + 50);
    return;
  }

  ctx.textBaseline = "middle";
  drawNameAndCountry(
    ctx,
    input.fullName,
    country,
    textX,
    hexCy - 20,
    textMax,
    input.fontFamily,
    light,
  );
}

function drawNameAndCountry(
  ctx: CanvasRenderingContext2D,
  fullName: string,
  country: string | null,
  x: number,
  y: number,
  maxWidth: number,
  fontFamily: string,
  light: boolean,
) {
  ctx.textBaseline = "top";
  ctx.font = `700 40px ${fontFamily}`;
  ctx.fillStyle = light ? INK : "#ffffff";
  if (!country) {
    ctx.fillText(truncateToWidth(ctx, fullName, maxWidth), x, y);
    return;
  }

  const gap = 14;
  ctx.font = `600 28px ${fontFamily}`;
  const countryLabel = `· ${country}`;
  const countryWidth = Math.min(ctx.measureText(countryLabel).width, maxWidth * 0.42);
  ctx.font = `700 40px ${fontFamily}`;
  ctx.fillStyle = light ? INK : "#ffffff";
  const nameMax = Math.max(80, maxWidth - gap - countryWidth);
  const name = truncateToWidth(ctx, fullName, nameMax);
  ctx.fillText(name, x, y);
  const nameWidth = ctx.measureText(name).width;
  ctx.font = `600 28px ${fontFamily}`;
  ctx.fillStyle = light ? "#5c5670" : "rgba(255,255,255,0.82)";
  ctx.fillText(
    truncateToWidth(ctx, countryLabel, maxWidth - nameWidth - gap),
    x + nameWidth + gap,
    y + 8,
  );
}

function drawHexAvatar(
  ctx: CanvasRenderingContext2D,
  avatar: ImageBitmap | null,
  fullName: string,
  cx: number,
  cy: number,
  r: number,
  fontFamily: string,
) {
  hexPath(ctx, cx, cy, r);
  ctx.save();
  ctx.clip();
  if (avatar) {
    const size = r * 2;
    const scale = Math.max(size / avatar.width, size / avatar.height);
    const w = avatar.width * scale;
    const h = avatar.height * scale;
    ctx.drawImage(avatar, cx - w / 2, cy - h / 2, w, h);
  } else {
    ctx.fillStyle = "#24143f";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 42px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initialOf(fullName), cx, cy);
  }
  ctx.restore();

  hexPath(ctx, cx, cy, r);
  ctx.strokeStyle = PINK;
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  image: ImageBitmap,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.min(width / image.width, height / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, x + (width - w) / 2, y + (height - h) / 2, w, h);
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke?: string,
) {
  ctx.beginPath();
  roundRect(ctx, x, y, width, height, height / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawCheck(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 8, y + 8);
  ctx.lineTo(x + 22, y - 8);
  ctx.stroke();
  ctx.restore();
}

function hexPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
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

function measureTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  tracking: number,
) {
  let width = 0;
  for (const ch of text) {
    width += ctx.measureText(ch).width + tracking;
  }
  return Math.max(0, width - tracking);
}

function fillTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
) {
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + tracking;
  }
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
  return `${cut.trimEnd()}${ellipsis}`;
}

import {
  IG_CARD_HEIGHT,
  IG_CARD_WIDTH,
  IG_PHOTO_HEIGHT,
  type IgCardContent,
} from "./ig-card";
import { stripWrappingQuotes } from "./quote";
import type { CardDesign, TestimonialType } from "../types/testimonial";

const LOGO_SRC = "/brand/logo-no-country.png";
const FALLBACK_PHOTO_SRC = "/brand/ig-fallback.jpg";
const PAD = 52;
const AUTHOR_H = 168;
const INLINE_AUTHOR_H = 132;

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
  const fontFamily =
    getComputedStyle(document.body).fontFamily || "sans-serif";
  const variant = variantOf(input.type);
  ctx.imageSmoothingQuality = "high";

  const scene: Scene = {
    ctx,
    input,
    variant,
    copy: COPY[variant],
    logo,
    avatar,
    photo: capture ?? fallbackPhoto,
    fontFamily,
  };
  DESIGNS[input.design](scene);
}

const DESIGNS: Record<CardDesign, (scene: Scene) => void> = {
  photo: drawPhotoDesign,
  quote: drawQuoteDesign,
  portrait: drawPortraitDesign,
  offer: drawOfferDesign,
  journey: drawJourneyDesign,
  shift: drawShiftDesign,
  cover: drawCoverDesign,
};

type Scene = {
  ctx: CanvasRenderingContext2D;
  input: IgCardContent;
  variant: Variant;
  copy: { badge: string; kicker: string };
  logo: ImageBitmap | null;
  avatar: ImageBitmap | null;
  photo: ImageBitmap | null;
  fontFamily: string;
};

/** Foto en la franja de arriba, frase y autor en caja abajo. */
function drawPhotoDesign({ ctx, input, variant, copy, logo, avatar, photo, fontFamily }: Scene) {
  const hasPhoto = Boolean(photo);
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
  paintQuote(
    ctx,
    quoteLayout,
    PAD,
    quoteTop,
    quoteMaxWidth,
    variant === "job" ? INK : "#ffffff",
    fontFamily,
  );

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

/** Sin foto: la frase grande con comilla decorativa y el autor abajo. */
function drawQuoteDesign({ ctx, input, variant, copy, logo, avatar, fontFamily }: Scene) {
  const light = variant === "job";
  drawBody(ctx, variant, 0);
  drawHexDecoration(ctx, variant);
  drawLogo(ctx, logo, fontFamily, light ? INK : "#ffffff");
  drawBadge(ctx, copy.badge, variant, fontFamily);

  const authorTop = IG_CARD_HEIGHT - PAD - INLINE_AUTHOR_H;
  const contentTop = 340;
  const contentBottom = authorTop - 72;
  const kickerBlock = 26 + 28;
  const company = variant === "job" ? input.company?.trim() || null : null;
  const showPills = variant === "change" && Boolean(input.previousRole && input.role);
  const extras = company ? 44 + 76 : showPills ? 32 + 56 : 0;
  const quoteMaxWidth = IG_CARD_WIDTH - PAD * 2;
  const quoteLayout = layoutQuote(
    ctx,
    stripWrappingQuotes(input.quote),
    quoteMaxWidth,
    Math.max(80, contentBottom - contentTop - kickerBlock - extras),
    fontFamily,
    68,
  );
  const block = kickerBlock + quoteLayout.height + extras;
  const kickerY = contentTop + Math.max(0, (contentBottom - contentTop - block) / 2);

  ctx.font = `800 300px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = variant === "learning" ? "rgba(255,255,255,0.32)" : PINK;
  ctx.fillText("“", PAD - 10, kickerY + 96);

  drawKicker(ctx, copy.kicker, variant, PAD, kickerY, fontFamily);
  const quoteTop = kickerY + kickerBlock;
  paintQuote(
    ctx,
    quoteLayout,
    PAD,
    quoteTop,
    quoteMaxWidth,
    light ? INK : "#ffffff",
    fontFamily,
  );

  const extrasTop = quoteTop + quoteLayout.height;
  if (company) {
    drawHiredPill(ctx, company, fontFamily, extrasTop + 44, PAD);
  } else if (showPills && input.previousRole && input.role) {
    drawTransition(ctx, input.previousRole, input.role, PAD, extrasTop + 32, quoteMaxWidth, fontFamily);
  }

  ctx.fillStyle = light ? "#e2dcea" : "rgba(255,255,255,0.18)";
  ctx.fillRect(PAD, authorTop - 36, IG_CARD_WIDTH - PAD * 2, 2);
  drawAuthorInline(ctx, {
    fullName: input.fullName,
    country: input.country,
    role: input.role,
    avatar,
    fontFamily,
    y: authorTop,
    light,
  });
}

/** Foto a sangre completa con velo del color del tipo y el texto encima. */
function drawCoverDesign({ ctx, input, variant, copy, logo, avatar, photo, fontFamily }: Scene) {
  if (photo) {
    drawCover(ctx, photo);
  } else {
    drawBody(ctx, variant, 0);
  }
  drawTopScrim(ctx);
  drawCoverScrim(ctx, variant);
  drawLogo(ctx, logo, fontFamily, "#ffffff");
  drawBadge(ctx, copy.badge, variant, fontFamily);

  const barH = 12;
  ctx.fillStyle = accentGradient(ctx, variant, 0, IG_CARD_WIDTH);
  ctx.fillRect(0, IG_CARD_HEIGHT - barH, IG_CARD_WIDTH, barH);

  const authorTop = IG_CARD_HEIGHT - barH - 44 - INLINE_AUTHOR_H;
  const minTop = 560;
  const kickerBlock = 26 + 28;
  const company = variant === "job" ? input.company?.trim() || null : null;
  const hiredBlock = company ? 76 + 36 : 0;
  const showPills = variant === "change" && Boolean(input.previousRole && input.role);
  const pillsBlock = showPills ? 28 + 56 : 0;
  const quoteBottom = authorTop - 48 - pillsBlock;
  const quoteMaxWidth = IG_CARD_WIDTH - PAD * 2;
  const quoteLayout = layoutQuote(
    ctx,
    `“${stripWrappingQuotes(input.quote)}”`,
    quoteMaxWidth,
    Math.max(80, quoteBottom - kickerBlock - hiredBlock - minTop),
    fontFamily,
    56,
  );
  const quoteTop = quoteBottom - quoteLayout.height;
  const kickerY = quoteTop - kickerBlock;

  if (company) {
    drawHiredPill(ctx, company, fontFamily, kickerY - hiredBlock, PAD);
  }
  drawKicker(ctx, copy.kicker, variant, PAD, kickerY, fontFamily);
  paintQuote(ctx, quoteLayout, PAD, quoteTop, quoteMaxWidth, "#ffffff", fontFamily);
  if (showPills && input.previousRole && input.role) {
    drawTransition(
      ctx,
      input.previousRole,
      input.role,
      PAD,
      quoteBottom + 28,
      quoteMaxWidth,
      fontFamily,
    );
  }

  drawAuthorInline(ctx, {
    fullName: input.fullName,
    country: input.country,
    role: input.role,
    avatar,
    fontFamily,
    y: authorTop,
    light: false,
  });
}

/** Simulación: la persona al centro en un hexágono grande y la frase debajo. */
function drawPortraitDesign({ ctx, input, variant, copy, logo, avatar, fontFamily }: Scene) {
  drawBody(ctx, variant, 0);
  drawLogo(ctx, logo, fontFamily, "#ffffff");
  drawBadge(ctx, copy.badge, variant, fontFamily);

  const cx = IG_CARD_WIDTH / 2;
  const cy = 420;
  const r = 170;
  ctx.save();
  ctx.lineWidth = 3;
  for (const [radius, alpha] of [
    [r + 40, 0.24],
    [r + 80, 0.12],
  ] as const) {
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    hexPath(ctx, cx, cy, radius);
    ctx.stroke();
  }
  ctx.restore();
  drawHexAvatar(ctx, avatar, input.fullName, cx, cy, r, fontFamily);

  const maxWidth = IG_CARD_WIDTH - PAD * 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 54px ${fontFamily}`;
  ctx.fillText(truncateToWidth(ctx, input.fullName, maxWidth), cx, 700);
  const meta = [input.role?.trim(), input.country?.trim()].filter(Boolean).join(" · ");
  if (meta) {
    ctx.font = `600 30px ${fontFamily}`;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(truncateToWidth(ctx, meta, maxWidth), cx, 770);
  }
  ctx.textAlign = "left";

  const contentTop = 850;
  const kickerBlock = 26 + 28;
  const room = IG_CARD_HEIGHT - PAD - contentTop;
  const quoteLayout = layoutQuote(
    ctx,
    `“${stripWrappingQuotes(input.quote)}”`,
    maxWidth,
    room - kickerBlock,
    fontFamily,
    52,
  );
  const kickerY = contentTop + Math.max(0, (room - kickerBlock - quoteLayout.height) / 2);
  drawKicker(ctx, copy.kicker, variant, cx, kickerY, fontFamily, true);
  paintQuote(
    ctx,
    quoteLayout,
    PAD,
    kickerY + kickerBlock,
    maxWidth,
    "#ffffff",
    fontFamily,
    "center",
  );
}

/** Primer empleo: la empresa que lo contrató es la protagonista. */
function drawOfferDesign({ ctx, input, variant, copy, logo, avatar, fontFamily }: Scene) {
  drawBody(ctx, variant, 0);
  const edge = ctx.createLinearGradient(0, 0, 0, IG_CARD_HEIGHT);
  edge.addColorStop(0, PINK);
  edge.addColorStop(1, "#38bdf8");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, 14, IG_CARD_HEIGHT);
  drawLogo(ctx, logo, fontFamily, INK);
  drawBadge(ctx, copy.badge, variant, fontFamily);

  const maxWidth = IG_CARD_WIDTH - PAD * 2;
  ctx.font = `700 26px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = PINK;
  fillTracked(ctx, "CONTRATADO POR", PAD, 230, 3.2);

  const company = input.company?.trim() || input.role?.trim() || input.fullName;
  const size = fitFont(ctx, company, maxWidth, 128, 56, 800, fontFamily);
  ctx.font = `800 ${size}px ${fontFamily}`;
  const shown = truncateToWidth(ctx, company, maxWidth);
  const companyWidth = ctx.measureText(shown).width;
  const fill = ctx.createLinearGradient(PAD, 0, PAD + companyWidth, 0);
  fill.addColorStop(0, PINK);
  fill.addColorStop(0.55, "#6366f1");
  fill.addColorStop(1, "#38bdf8");
  ctx.fillStyle = fill;
  ctx.fillText(shown, PAD, 280);

  let y = 280 + size * 1.15;
  const role = input.role?.trim();
  if (role) {
    ctx.font = `600 38px ${fontFamily}`;
    ctx.fillStyle = "#5c5670";
    ctx.fillText(truncateToWidth(ctx, `como ${role}`, maxWidth), PAD, y);
    y += 38;
  }
  y += 48;
  ctx.fillStyle = "#e2dcea";
  ctx.fillRect(PAD, y, maxWidth, 2);
  y += 56;

  const authorTop = IG_CARD_HEIGHT - PAD - INLINE_AUTHOR_H;
  const quoteLayout = layoutQuote(
    ctx,
    `“${stripWrappingQuotes(input.quote)}”`,
    maxWidth,
    Math.max(80, authorTop - 56 - y),
    fontFamily,
    52,
  );
  paintQuote(ctx, quoteLayout, PAD, y, maxWidth, INK, fontFamily);

  drawAuthorInline(ctx, {
    fullName: input.fullName,
    country: input.country,
    role: null,
    avatar,
    fontFamily,
    y: authorTop,
    light: true,
  });
}

/** Primer empleo: línea de recorrido desde la simulación hasta el puesto, con la frase abajo. */
function drawJourneyDesign({ ctx, input, variant, copy, logo, avatar, fontFamily }: Scene) {
  const bg = ctx.createLinearGradient(0, 0, 0, IG_CARD_HEIGHT);
  bg.addColorStop(0, "#150a33");
  bg.addColorStop(1, "#1b0d3f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, IG_CARD_WIDTH, IG_CARD_HEIGHT);
  drawGlow(ctx, 0, 560, 520, "255, 61, 154", 0.28);
  drawGlow(ctx, IG_CARD_WIDTH, 1000, 560, "139, 92, 246", 0.22);
  drawLogo(ctx, logo, fontFamily, "#ffffff");
  drawBadge(ctx, copy.badge, variant, fontFamily);

  const r = 160;
  const cx = 124 + r * (Math.sqrt(3) / 2);
  const cy = 610;
  const lineTop = 190;
  const lineBottom = cy + r + 80;
  const nodeY = 320;

  const line = ctx.createLinearGradient(0, lineTop, 0, lineBottom);
  line.addColorStop(0, PINK);
  line.addColorStop(0.5, "#8b5cf6");
  line.addColorStop(1, "#38bdf8");
  ctx.fillStyle = line;
  ctx.beginPath();
  roundRect(ctx, cx - 4, lineTop, 8, lineBottom - lineTop, 4);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, nodeY, 18, 0, Math.PI * 2);
  ctx.fillStyle = "#150a33";
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#c04bd6";
  ctx.stroke();

  const nodeX = cx + 50;
  ctx.font = `600 40px ${fontFamily}`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const nodeLines = wrapText(ctx, "Simulación en No Country", IG_CARD_WIDTH - PAD - nodeX).slice(0, 2);
  const nodeLineH = 50;
  const nodeTop = nodeY - (nodeLines.length * nodeLineH) / 2 + 4;
  nodeLines.forEach((text, i) => ctx.fillText(text, nodeX, nodeTop + i * nodeLineH));

  const ring = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  ring.addColorStop(0, "#e04fd0");
  ring.addColorStop(0.5, "#8b5cf6");
  ring.addColorStop(1, "#38bdf8");
  hexPath(ctx, cx, cy, r + 14);
  ctx.fillStyle = "#150a33";
  ctx.fill();
  ctx.save();
  ctx.shadowColor = "rgba(192, 75, 214, 0.85)";
  ctx.shadowBlur = 40;
  ctx.lineWidth = 7;
  ctx.strokeStyle = ring;
  ctx.stroke();
  ctx.restore();
  drawHexAvatar(ctx, avatar, input.fullName, cx, cy, r - 6, fontFamily);

  const textX = cx + r * (Math.sqrt(3) / 2) + 56;
  const textW = IG_CARD_WIDTH - PAD - textX;
  const role = input.role?.trim() || "Primer empleo";
  const roleFit = fitLines(ctx, role, textW, 80, 40, 800, fontFamily, 3);
  const roleLineH = roleFit.size * 1.1;
  const company = input.company?.trim();
  ctx.font = `700 44px ${fontFamily}`;
  const companyWrapped = company ? wrapText(ctx, `en ${company}`, textW) : [];
  const companyLines =
    companyWrapped.length > 2
      ? [companyWrapped[0] ?? "", truncateToWidth(ctx, `${companyWrapped.slice(1).join(" ")}…`, textW)]
      : companyWrapped;
  const companyLineH = 54;
  const blockH =
    roleFit.lines.length * roleLineH + (companyLines.length ? 14 + companyLines.length * companyLineH : 0);
  let y = cy - blockH / 2;

  ctx.font = `800 ${roleFit.size}px ${fontFamily}`;
  const roleFill = ctx.createLinearGradient(textX, 0, textX + textW, 0);
  roleFill.addColorStop(0, "#e04fd0");
  roleFill.addColorStop(0.55, "#8b5cf6");
  roleFill.addColorStop(1, "#38bdf8");
  ctx.fillStyle = roleFill;
  roleFit.lines.forEach((text, i) => ctx.fillText(text, textX, y + i * roleLineH));
  y += roleFit.lines.length * roleLineH + 14;

  if (companyLines.length) {
    ctx.font = `700 44px ${fontFamily}`;
    ctx.fillStyle = "#ffffff";
    companyLines.forEach((text, i) => ctx.fillText(text, textX, y + i * companyLineH));
  }

  const quoteX = PAD + 44;
  const quoteW = IG_CARD_WIDTH - PAD - quoteX;
  const authorH = 30;
  const authorGap = 28;
  const quoteTop = lineBottom + 70;
  const room = IG_CARD_HEIGHT - PAD - quoteTop - authorH - authorGap;
  const quoteLayout = layoutQuote(
    ctx,
    `“${stripWrappingQuotes(input.quote)}”`,
    quoteW,
    room,
    fontFamily,
    52,
  );
  const blockTop =
    quoteTop + Math.max(0, (room - quoteLayout.height) / 2);
  const authorY = blockTop + quoteLayout.height + authorGap;

  const bar = ctx.createLinearGradient(0, blockTop, 0, authorY + authorH);
  bar.addColorStop(0, PINK);
  bar.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = bar;
  ctx.beginPath();
  roundRect(ctx, PAD, blockTop + 4, 6, authorY + authorH - blockTop - 4, 3);
  ctx.fill();

  paintQuote(ctx, quoteLayout, quoteX, blockTop, quoteW, "#ffffff", fontFamily);

  const country = input.country?.trim();
  ctx.font = `600 30px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#e04fd0";
  ctx.fillText(
    truncateToWidth(ctx, `— ${input.fullName}${country ? ` · ${country}` : ""}`, quoteW),
    quoteX,
    authorY,
  );
}

/** Reconversión: el oficio de antes en contorno y tachado, una flecha y el rol de ahora en grande. */
function drawShiftDesign(scene: Scene) {
  const { ctx, input, variant, copy, logo, avatar, fontFamily } = scene;
  const previous = input.previousRole?.trim();
  const role = input.role?.trim();
  if (!previous || !role) {
    drawQuoteDesign(scene);
    return;
  }

  drawBody(ctx, variant, 0);
  drawGlow(ctx, 930, 560, 560, "192, 38, 211", 0.34);
  drawGlow(ctx, 90, 1240, 520, "124, 58, 237", 0.26);
  drawDotGrid(ctx, 0.05);
  drawLogo(ctx, logo, fontFamily, "#ffffff");
  drawBadge(ctx, copy.badge, variant, fontFamily);

  const x = PAD;
  const width = IG_CARD_WIDTH - PAD * 2;

  const beforeLabelY = 200;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `700 24px ${fontFamily}`;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  fillTracked(ctx, "ANTES", x, beforeLabelY, 4);
  const beforeLabelW = measureTracked(ctx, "ANTES", 4);
  ctx.fillRect(x + beforeLabelW + 18, beforeLabelY + 11, 64, 2);

  const beforeTop = beforeLabelY + 44;
  const before = fitLines(ctx, previous, width, 96, 48, 800, fontFamily, 2);
  const beforeLineH = before.size * 1.04;
  ctx.font = `800 ${before.size}px ${fontFamily}`;
  ctx.lineJoin = "round";
  before.lines.forEach((line, i) => {
    const lineTop = beforeTop + i * beforeLineH;
    const lineW = ctx.measureText(line).width;
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillText(line, x, lineTop);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2.5;
    ctx.strokeText(line, x, lineTop);
    ctx.save();
    ctx.strokeStyle = PINK;
    ctx.lineWidth = Math.max(5, before.size * 0.07);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 6, lineTop + before.size * 0.64);
    ctx.lineTo(x + lineW + 10, lineTop + before.size * 0.4);
    ctx.stroke();
    ctx.restore();
  });
  const beforeBottom = beforeTop + before.lines.length * beforeLineH;

  const arrowTop = beforeBottom + 20;
  const arrowX = x + 34;
  const arrowEndX = x + 150;
  const arrowEndY = arrowTop + 118;
  const arrow = ctx.createLinearGradient(arrowX, arrowTop, arrowEndX, arrowEndY);
  arrow.addColorStop(0, "rgba(255,61,154,0.35)");
  arrow.addColorStop(1, PINK);
  ctx.save();
  ctx.strokeStyle = arrow;
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(arrowX, arrowTop);
  ctx.bezierCurveTo(arrowX, arrowTop + 88, arrowX + 30, arrowEndY, arrowEndX, arrowEndY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(arrowEndX - 22, arrowEndY - 20);
  ctx.lineTo(arrowEndX + 2, arrowEndY);
  ctx.lineTo(arrowEndX - 22, arrowEndY + 20);
  ctx.strokeStyle = PINK;
  ctx.stroke();
  ctx.restore();

  ctx.font = `800 26px ${fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = PINK;
  fillTracked(ctx, "AHORA", arrowEndX + 28, arrowEndY + 1, 4);
  ctx.textBaseline = "top";

  const afterTop = arrowEndY + 48;
  const after = fitLines(ctx, role, width, 124, 56, 800, fontFamily, 2);
  ctx.font = `800 ${after.size}px ${fontFamily}`;
  const afterFill = ctx.createLinearGradient(x, 0, x + width, 0);
  afterFill.addColorStop(0, "#ff5fae");
  afterFill.addColorStop(0.5, "#d946ef");
  afterFill.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = afterFill;
  const afterLineH = after.size * 1.04;
  after.lines.forEach((line, i) => ctx.fillText(line, x, afterTop + i * afterLineH));
  const afterBottom = afterTop + after.lines.length * afterLineH;

  const authorTop = IG_CARD_HEIGHT - PAD - INLINE_AUTHOR_H;
  const quoteTop = afterBottom + 56;
  const quoteX = x + 34;
  const quoteMax = width - 34;
  const quoteLayout = layoutQuote(
    ctx,
    stripWrappingQuotes(input.quote),
    quoteMax,
    Math.max(80, authorTop - 64 - quoteTop),
    fontFamily,
    44,
  );
  const bar = ctx.createLinearGradient(0, quoteTop, 0, quoteTop + quoteLayout.height);
  bar.addColorStop(0, PINK);
  bar.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = bar;
  ctx.beginPath();
  roundRect(ctx, x, quoteTop + 4, 6, Math.max(20, quoteLayout.height - 8), 3);
  ctx.fill();
  paintQuote(ctx, quoteLayout, quoteX, quoteTop, quoteMax, "rgba(255,255,255,0.94)", fontFamily);

  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(PAD, authorTop - 36, width, 2);
  drawAuthorInline(ctx, {
    fullName: input.fullName,
    country: input.country,
    role: null,
    avatar,
    fontFamily,
    y: authorTop,
    light: false,
  });
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rgb: string,
  alpha: number,
) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, `rgba(${rgb}, ${alpha})`);
  glow.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawDotGrid(ctx: CanvasRenderingContext2D, alpha: number) {
  ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  for (let y = 24; y < IG_CARD_HEIGHT; y += 36) {
    for (let x = 24; x < IG_CARD_WIDTH; x += 36) {
      ctx.fillRect(x, y, 3, 3);
    }
  }
}

/** Tamaño más grande en que el texto entra en `maxLines` líneas. */
function fitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
  weight: number,
  fontFamily: string,
  maxLines: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  for (let size = maxSize; size > minSize; size -= 4) {
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    const lines = wrapText(ctx, text, maxWidth);
    const wordsFit = words.every((word) => ctx.measureText(word).width <= maxWidth);
    if (wordsFit && lines.length <= maxLines) {
      return { size, lines };
    }
  }
  ctx.font = `${weight} ${minSize}px ${fontFamily}`;
  const lines = wrapText(ctx, text, maxWidth).slice(0, maxLines);
  const last = lines.length - 1;
  lines[last] = truncateToWidth(ctx, lines[last] ?? "", maxWidth);
  return { size: minSize, lines };
}

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
  weight: number,
  fontFamily: string,
) {
  for (let size = maxSize; size > minSize; size -= 4) {
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) {
      return size;
    }
  }
  return minSize;
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

function drawCover(ctx: CanvasRenderingContext2D, image: ImageBitmap) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, IG_CARD_WIDTH, IG_CARD_HEIGHT);
  const scale = Math.max(IG_CARD_WIDTH / image.width, IG_CARD_HEIGHT / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (IG_CARD_WIDTH - w) / 2, (IG_CARD_HEIGHT - h) / 2, w, h);
}

const COVER_TINT: Record<Variant, string> = {
  learning: "42, 10, 92",
  job: "22, 19, 43",
  change: "7, 11, 24",
};

function drawCoverScrim(ctx: CanvasRenderingContext2D, variant: Variant) {
  const top = Math.round(IG_CARD_HEIGHT * 0.22);
  const tint = COVER_TINT[variant];
  const fill = ctx.createLinearGradient(0, top, 0, IG_CARD_HEIGHT);
  fill.addColorStop(0, `rgba(${tint}, 0)`);
  fill.addColorStop(0.4, `rgba(${tint}, 0.78)`);
  fill.addColorStop(1, `rgba(${tint}, 0.97)`);
  ctx.fillStyle = fill;
  ctx.fillRect(0, top, IG_CARD_WIDTH, IG_CARD_HEIGHT - top);
}

function accentGradient(
  ctx: CanvasRenderingContext2D,
  variant: Variant,
  x: number,
  width: number,
) {
  const fill = ctx.createLinearGradient(x, 0, x + width, 0);
  if (variant === "change") {
    fill.addColorStop(0, "#c026d3");
    fill.addColorStop(1, "#7c3aed");
  } else if (variant === "job") {
    fill.addColorStop(0, PINK);
    fill.addColorStop(1, "#38bdf8");
  } else {
    fill.addColorStop(0, "#e63292");
    fill.addColorStop(1, "#6366f1");
  }
  return fill;
}

function drawHexDecoration(ctx: CanvasRenderingContext2D, variant: Variant) {
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle =
    variant === "job"
      ? "rgba(255, 61, 154, 0.16)"
      : variant === "change"
        ? "rgba(255, 61, 154, 0.22)"
        : "rgba(255, 255, 255, 0.14)";
  hexPath(ctx, IG_CARD_WIDTH - 90, 430, 250);
  ctx.stroke();
  hexPath(ctx, IG_CARD_WIDTH - 90, 430, 170);
  ctx.stroke();
  ctx.restore();
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
  color: string,
) {
  const y = 44;
  if (!logo) {
    ctx.fillStyle = color;
    ctx.font = `600 36px ${fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("No Country", PAD, y);
    return;
  }
  const width = 300;
  const height = Math.round((width * logo.height) / logo.width);
  ctx.drawImage(tintLogo(logo, width, height, color), PAD, y);
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
  pillX?: number,
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
  const x = pillX ?? (IG_CARD_WIDTH - total) / 2;

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
  centered = false,
) {
  ctx.font = `700 26px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = variant === "learning" ? "rgba(255,255,255,0.92)" : PINK;
  const startX = centered ? x - measureTracked(ctx, label, 3.2) / 2 : x;
  fillTracked(ctx, label, startX, y, 3.2);
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
  color: string,
  fontFamily: string,
  align: "left" | "center" = "left",
) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.font = `600 ${layout.fontSize}px ${fontFamily}`;
  const lineX = align === "center" ? x + maxWidth / 2 : x;
  for (let i = 0; i < layout.used; i += 1) {
    const line = layout.lines[i] ?? "";
    const shown =
      i === layout.used - 1 && layout.lines.length > layout.used
        ? truncateToWidth(ctx, line, maxWidth)
        : line;
    ctx.fillText(shown, lineX, top + i * layout.lineHeight);
  }
  ctx.textAlign = "left";
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
  drawAuthorText(ctx, {
    fullName: input.fullName,
    country: input.country,
    role: input.role,
    fontFamily: input.fontFamily,
    light,
    x: textX,
    cy: hexCy,
    maxWidth: x + width - 36 - textX,
  });
}

/** Autor sin caja: hexágono grande y texto al lado. */
function drawAuthorInline(
  ctx: CanvasRenderingContext2D,
  input: {
    fullName: string;
    country: string | null;
    role: string | null;
    avatar: ImageBitmap | null;
    fontFamily: string;
    y: number;
    light: boolean;
  },
) {
  const hexR = 60;
  const hexCx = PAD + hexR;
  const hexCy = input.y + INLINE_AUTHOR_H / 2;
  drawHexAvatar(ctx, input.avatar, input.fullName, hexCx, hexCy, hexR, input.fontFamily);

  const textX = hexCx + hexR + 32;
  drawAuthorText(ctx, {
    fullName: input.fullName,
    country: input.country,
    role: input.role,
    fontFamily: input.fontFamily,
    light: input.light,
    x: textX,
    cy: hexCy,
    maxWidth: IG_CARD_WIDTH - PAD - textX,
  });
}

function drawAuthorText(
  ctx: CanvasRenderingContext2D,
  input: {
    fullName: string;
    country: string | null;
    role: string | null;
    fontFamily: string;
    light: boolean;
    x: number;
    cy: number;
    maxWidth: number;
  },
) {
  const role = input.role?.trim() || null;
  const country = input.country?.trim() || null;
  const { light } = input;
  ctx.textAlign = "left";
  ctx.fillStyle = light ? INK : "#ffffff";
  if (role) {
    const block = 40 + 10 + 28;
    const textY = input.cy - block / 2;
    ctx.textBaseline = "top";
    drawNameAndCountry(
      ctx,
      input.fullName,
      country,
      input.x,
      textY,
      input.maxWidth,
      input.fontFamily,
      light,
    );
    ctx.font = `600 28px ${input.fontFamily}`;
    ctx.fillStyle = light ? PINK : "#ffffff";
    ctx.fillText(truncateToWidth(ctx, role, input.maxWidth), input.x, textY + 50);
    return;
  }

  ctx.textBaseline = "middle";
  drawNameAndCountry(
    ctx,
    input.fullName,
    country,
    input.x,
    input.cy - 20,
    input.maxWidth,
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
    ctx.font = `700 ${Math.round(r * 0.8)}px ${fontFamily}`;
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

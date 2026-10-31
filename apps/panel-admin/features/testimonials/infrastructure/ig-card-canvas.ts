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
/** Las fotos testimoniales se recortan en 16:9 al subirlas. */
const PHOTO_ASPECT = 16 / 9;
const AUTHOR_H = 168;
const INLINE_AUTHOR_H = 132;
/** Formato cita: avatar, nombre y datos de la persona más grandes que en el resto. */
const QUOTE_AUTHOR_H = 208;
const QUOTE_AVATAR_R = 92;
const QUOTE_NAME_SIZE = 56;
const QUOTE_META_SIZE = 36;

const PINK = "#ff3d9a";
const INK = "#16132b";

type Variant = "learning" | "job" | "change";

const COPY: Record<
  Variant,
  { badge: string; kicker: string }
> = {
  learning: { badge: "APRENDIZAJE", kicker: "LO QUE APRENDÍ" },
  job: { badge: "Conseguí empleo", kicker: "MI PRIMER EMPLEO" },
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
  profile: drawProfileDesign,
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

  const placed = photoQuotePlacement(input, variant, hasPhoto);
  if (hasPhoto && variant === "job") {
    drawHiredPill(ctx, input.company, fontFamily, IG_PHOTO_HEIGHT - 38, PAD);
  } else if (!hasPhoto && variant === "job" && input.company?.trim()) {
    drawHiredPill(ctx, input.company, fontFamily, 156, PAD);
  }

  const quoteLayout = layoutQuote(ctx, placed.frame, fontFamily);
  const block =
    placed.kickerSize + 28 + quoteLayout.height + placed.pillsBlock;
  const room = placed.authorTop - 36 - placed.contentTop;
  const kickerY = hasPhoto
    ? placed.contentTop
    : placed.contentTop + Math.max(0, (room - block) / 2);
  drawKicker(ctx, copy.kicker, variant, PAD, kickerY, fontFamily);

  const quoteTop = kickerY + placed.kickerSize + 28;
  paintQuote(
    ctx,
    quoteLayout,
    PAD,
    quoteTop,
    placed.frame.maxWidth,
    variant === "job" ? INK : "#ffffff",
    fontFamily,
  );

  if (placed.showPills && input.previousRole && input.role) {
    drawTransition(
      ctx,
      input.previousRole,
      input.role,
      PAD,
      quoteTop + quoteLayout.height + 28,
      placed.frame.maxWidth,
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
    y: placed.authorTop,
  });
}

/** Sin foto: la frase grande con comilla decorativa y el autor abajo. */
function drawQuoteDesign({ ctx, input, variant, copy, logo, avatar, fontFamily }: Scene) {
  const light = variant === "job";
  drawBody(ctx, variant, 0);
  drawHexDecoration(ctx, variant);
  drawLogo(ctx, logo, fontFamily, light ? INK : "#ffffff");
  drawBadge(ctx, copy.badge, variant, fontFamily);

  const placed = quoteDesignPlacement(input, variant);
  const quoteLayout = layoutQuote(ctx, placed.frame, fontFamily);
  const block = placed.kickerBlock + quoteLayout.height + placed.extras;
  const kickerY =
    placed.contentTop +
    Math.max(0, (placed.contentBottom - placed.contentTop - block) / 2);

  ctx.font = `800 300px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = variant === "learning" ? "rgba(255,255,255,0.32)" : PINK;
  ctx.fillText("“", PAD - 10, kickerY + 96);

  drawKicker(ctx, copy.kicker, variant, PAD, kickerY, fontFamily);
  const quoteTop = kickerY + placed.kickerBlock;
  paintQuote(
    ctx,
    quoteLayout,
    PAD,
    quoteTop,
    placed.frame.maxWidth,
    light ? INK : "#ffffff",
    fontFamily,
  );

  const extrasTop = quoteTop + quoteLayout.height;
  if (placed.company) {
    drawHiredPill(ctx, placed.company, fontFamily, extrasTop + 44, PAD);
  } else if (placed.showPills && input.previousRole && input.role) {
    drawTransition(
      ctx,
      input.previousRole,
      input.role,
      PAD,
      extrasTop + 32,
      placed.frame.maxWidth,
      fontFamily,
    );
  }

  ctx.fillStyle = light ? "#e2dcea" : "rgba(255,255,255,0.18)";
  ctx.fillRect(PAD, placed.authorTop - 36, IG_CARD_WIDTH - PAD * 2, 2);
  drawAuthorInline(ctx, {
    fullName: input.fullName,
    country: input.country,
    role: input.role,
    avatar,
    fontFamily,
    y: placed.authorTop,
    light,
    hexR: QUOTE_AVATAR_R,
    blockH: QUOTE_AUTHOR_H,
    nameSize: QUOTE_NAME_SIZE,
    metaSize: QUOTE_META_SIZE,
  });
}

/** Reconversión: tarjeta de perfil con la foto como portada 16:9, avatar, rol nuevo y la frase. */
function drawProfileDesign({ ctx, input, variant, copy, logo, avatar, photo, fontFamily }: Scene) {
  const bg = ctx.createLinearGradient(0, 0, 0, IG_CARD_HEIGHT);
  bg.addColorStop(0, "#150a33");
  bg.addColorStop(1, "#1b0d3f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, IG_CARD_WIDTH, IG_CARD_HEIGHT);
  drawGlow(ctx, 0, 760, 520, "255, 61, 154", 0.3);
  drawGlow(ctx, IG_CARD_WIDTH, 620, 520, "139, 92, 246", 0.26);
  drawLogo(ctx, logo, fontFamily, "#ffffff");
  drawBadge(ctx, copy.badge, variant, fontFamily);

  const cardX = PAD;
  const cardY = 150;
  const cardW = IG_CARD_WIDTH - PAD * 2;
  const cardH = IG_CARD_HEIGHT - PAD - cardY;
  ctx.beginPath();
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.stroke();

  const inset = 20;
  const bannerX = cardX + inset;
  const bannerY = cardY + inset;
  const bannerW = cardW - inset * 2;
  const bannerH = Math.round(bannerW / PHOTO_ASPECT);
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, bannerX, bannerY, bannerW, bannerH, 24);
  ctx.clip();
  ctx.fillStyle = "#0d0722";
  ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
  if (photo) {
    drawContain(ctx, photo, bannerX, bannerY, bannerW, bannerH);
  }
  ctx.restore();
  const bannerBottom = bannerY + bannerH;

  const r = 112;
  const hexHalfW = r * (Math.sqrt(3) / 2);
  const avatarX = bannerX + 36 + hexHalfW;
  const avatarY = bannerBottom;
  const ring = ctx.createLinearGradient(avatarX - r, avatarY - r, avatarX + r, avatarY + r);
  ring.addColorStop(0, PINK);
  ring.addColorStop(0.5, "#8b5cf6");
  ring.addColorStop(1, "#38bdf8");
  hexPath(ctx, avatarX, avatarY, r + 12);
  ctx.fillStyle = ring;
  ctx.fill();
  hexPath(ctx, avatarX, avatarY, r + 5);
  ctx.fillStyle = "#150a33";
  ctx.fill();
  drawHexAvatar(ctx, avatar, input.fullName, avatarX, avatarY, r, fontFamily);

  const sideX = avatarX + hexHalfW + 40;
  const sideW = cardX + cardW - 40 - sideX;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const nameSize = fitFont(ctx, input.fullName, sideW, 52, 34, 800, fontFamily);
  ctx.font = `800 ${nameSize}px ${fontFamily}`;
  ctx.fillStyle = "#ffffff";
  const nameY = bannerBottom + 22;
  ctx.fillText(truncateToWidth(ctx, input.fullName, sideW), sideX, nameY);
  drawPreviousLine(ctx, {
    previous: input.previousRole?.trim() || null,
    country: input.country?.trim() || null,
    x: sideX,
    y: nameY + nameSize + 14,
    maxWidth: sideW,
    fontFamily,
  });

  const placed = profileQuotePlacement(ctx, input, fontFamily);
  ctx.font = `800 ${placed.roleFit.size}px ${fontFamily}`;
  const roleFill = ctx.createLinearGradient(placed.innerX, 0, placed.innerX + placed.innerW, 0);
  roleFill.addColorStop(0, "#ff5fae");
  roleFill.addColorStop(0.55, "#8b5cf6");
  roleFill.addColorStop(1, "#38bdf8");
  ctx.fillStyle = roleFill;
  placed.roleFit.lines.forEach((line, i) =>
    ctx.fillText(line, placed.innerX, placed.roleTop + i * placed.roleLineH),
  );

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(placed.innerX, placed.dividerY, placed.innerW, 2);

  const quoteLayout = layoutQuote(ctx, placed.frame, fontFamily);
  paintQuote(
    ctx,
    quoteLayout,
    placed.innerX,
    placed.quoteTop + Math.max(0, (placed.quoteRoom - quoteLayout.height) / 2),
    placed.innerW,
    "#ffffff",
    fontFamily,
  );
}

/** "Antes: rol tachado · país", recortado al ancho. */
function drawPreviousLine(
  ctx: CanvasRenderingContext2D,
  {
    previous,
    country,
    x,
    y,
    maxWidth,
    fontFamily,
  }: {
    previous: string | null;
    country: string | null;
    x: number;
    y: number;
    maxWidth: number;
    fontFamily: string;
  },
) {
  const size = 30;
  ctx.font = `500 ${size}px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  if (!previous) {
    if (country) {
      ctx.fillText(truncateToWidth(ctx, country, maxWidth), x, y);
    }
    return;
  }

  const label = "Antes: ";
  const labelW = ctx.measureText(label).width;
  const withCountry = country ? ` · ${country}` : "";
  const fitsAll = labelW + ctx.measureText(`${previous}${withCountry}`).width <= maxWidth;
  const suffix = fitsAll ? withCountry : "";
  const shown = truncateToWidth(ctx, previous, maxWidth - labelW);
  const shownW = ctx.measureText(shown).width;
  ctx.fillText(label, x, y);
  ctx.fillText(shown, x + labelW, y);
  if (suffix) {
    ctx.fillText(suffix, x + labelW + shownW, y);
  }

  ctx.fillStyle = PINK;
  ctx.fillRect(x + labelW - 2, y + size * 0.56, shownW + 4, 3);
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

  const placed = portraitQuotePlacement(input);
  const quoteLayout = layoutQuote(ctx, placed.frame, fontFamily);
  const kickerY =
    placed.contentTop + Math.max(0, (placed.room - placed.kickerBlock - quoteLayout.height) / 2);
  drawKicker(ctx, copy.kicker, variant, cx, kickerY, fontFamily, true);
  paintQuote(
    ctx,
    quoteLayout,
    PAD,
    kickerY + placed.kickerBlock,
    placed.maxWidth,
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

  ctx.font = `700 26px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = PINK;
  fillTracked(ctx, "CONTRATADO POR", PAD, 230, 3.2);

  const placed = offerQuotePlacement(ctx, input, fontFamily);
  ctx.font = `800 ${placed.size}px ${fontFamily}`;
  const shown = truncateToWidth(ctx, placed.company, placed.maxWidth);
  const companyWidth = ctx.measureText(shown).width;
  const fill = ctx.createLinearGradient(PAD, 0, PAD + companyWidth, 0);
  fill.addColorStop(0, PINK);
  fill.addColorStop(0.55, "#6366f1");
  fill.addColorStop(1, "#38bdf8");
  ctx.fillStyle = fill;
  ctx.fillText(shown, PAD, 280);

  const dividerY = placed.quoteTop - 56;
  if (placed.role) {
    ctx.font = `600 38px ${fontFamily}`;
    ctx.fillStyle = "#5c5670";
    ctx.fillText(
      truncateToWidth(ctx, `como ${placed.role}`, placed.maxWidth),
      PAD,
      dividerY - 48 - 38,
    );
  }
  ctx.fillStyle = "#e2dcea";
  ctx.fillRect(PAD, dividerY, placed.maxWidth, 2);

  const quoteLayout = layoutQuote(ctx, placed.frame, fontFamily);
  paintQuote(ctx, quoteLayout, PAD, placed.quoteTop, placed.maxWidth, INK, fontFamily);

  drawAuthorInline(ctx, {
    fullName: input.fullName,
    country: input.country,
    role: null,
    avatar,
    fontFamily,
    y: placed.authorTop,
    light: true,
  });
}

/** Primer empleo: línea de recorrido desde la simulación hasta el puesto, con la frase abajo. */
function drawJourneyDesign(scene: Scene) {
  const company = scene.input.company?.trim();
  drawTimelineCard(scene, {
    nodeLabel: "Simulación Laboral",
    headline: scene.input.role?.trim() || "Primer empleo",
    subline: company ? `en ${company}` : null,
  });
}

/** Reconversión: el mismo recorrido, del oficio de antes al rol de ahora. */
function drawShiftDesign(scene: Scene) {
  const previous = scene.input.previousRole?.trim();
  const role = scene.input.role?.trim();
  if (!previous || !role) {
    drawQuoteDesign(scene);
    return;
  }
  drawTimelineCard(scene, {
    nodeLabel: previous,
    headline: role,
    subline: null,
  });
}

type TimelineCopy = {
  nodeLabel: string;
  headline: string;
  subline: string | null;
};

function drawTimelineCard(
  { ctx, input, variant, copy, logo, avatar, fontFamily }: Scene,
  timeline: TimelineCopy,
) {
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
  const nodeMax = IG_CARD_WIDTH - PAD - nodeX;
  ctx.font = `600 40px ${fontFamily}`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const wrappedNode = wrapText(ctx, timeline.nodeLabel, nodeMax);
  const nodeLines = wrappedNode.slice(0, 2);
  if (wrappedNode.length > nodeLines.length) {
    const last = nodeLines.length - 1;
    nodeLines[last] = ellipsizeLine(ctx, nodeLines[last] ?? "", nodeMax);
  }
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
  const headlineFit = fitLines(ctx, timeline.headline, textW, 80, 40, 800, fontFamily, 3);
  const headlineLineH = headlineFit.size * 1.1;
  const subline = timeline.subline?.trim() || null;
  ctx.font = `700 44px ${fontFamily}`;
  const sublineWrapped = subline ? wrapText(ctx, subline, textW) : [];
  const sublineLines =
    sublineWrapped.length > 2
      ? [sublineWrapped[0] ?? "", truncateToWidth(ctx, `${sublineWrapped.slice(1).join(" ")}…`, textW)]
      : sublineWrapped;
  const sublineLineH = 54;
  const blockH =
    headlineFit.lines.length * headlineLineH +
    (sublineLines.length ? 14 + sublineLines.length * sublineLineH : 0);
  let y = cy - blockH / 2;

  ctx.font = `800 ${headlineFit.size}px ${fontFamily}`;
  const headlineFill = ctx.createLinearGradient(textX, 0, textX + textW, 0);
  headlineFill.addColorStop(0, "#e04fd0");
  headlineFill.addColorStop(0.55, "#8b5cf6");
  headlineFill.addColorStop(1, "#38bdf8");
  ctx.fillStyle = headlineFill;
  headlineFit.lines.forEach((text, i) => ctx.fillText(text, textX, y + i * headlineLineH));
  y += headlineFit.lines.length * headlineLineH + 14;

  if (sublineLines.length) {
    ctx.font = `700 44px ${fontFamily}`;
    ctx.fillStyle = "#ffffff";
    sublineLines.forEach((text, i) => ctx.fillText(text, textX, y + i * sublineLineH));
  }

  const placed = journeyQuotePlacement(input);
  const quoteLayout = layoutQuote(ctx, placed.frame, fontFamily);
  const blockTop = placed.quoteTop + Math.max(0, (placed.room - quoteLayout.height) / 2);
  const authorY = blockTop + quoteLayout.height + placed.authorGap;

  const bar = ctx.createLinearGradient(0, blockTop, 0, authorY + placed.authorH);
  bar.addColorStop(0, PINK);
  bar.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = bar;
  ctx.beginPath();
  roundRect(ctx, PAD, blockTop + 4, 6, authorY + placed.authorH - blockTop - 4, 3);
  ctx.fill();

  paintQuote(ctx, quoteLayout, placed.quoteX, blockTop, placed.quoteW, "#ffffff", fontFamily);

  const country = input.country?.trim();
  ctx.font = `600 30px ${fontFamily}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#e04fd0";
  ctx.fillText(
    truncateToWidth(ctx, `— ${input.fullName}${country ? ` · ${country}` : ""}`, placed.quoteW),
    placed.quoteX,
    authorY,
  );
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

const QUOTE_MIN_FONT = 30;

type QuoteFrame = {
  text: string;
  maxWidth: number;
  maxHeight: number;
  maxFont: number;
};

/** True si este diseño no entra la frase ni a 30 px y la card la corta con "…". */
export function igCardQuoteClipped(input: IgCardContent, fontFamily: string): boolean {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return false;
  }
  const hasPhoto = input.design === "photo";
  return layoutQuote(ctx, quoteFrame(ctx, input, fontFamily, hasPhoto), fontFamily).clipped;
}

function quoteFrame(
  ctx: CanvasRenderingContext2D,
  input: IgCardContent,
  fontFamily: string,
  hasPhoto: boolean,
): QuoteFrame {
  const variant = variantOf(input.type);
  switch (input.design) {
    case "photo":
      return photoQuotePlacement(input, variant, hasPhoto).frame;
    case "quote":
      return quoteDesignPlacement(input, variant).frame;
    case "portrait":
      return portraitQuotePlacement(input).frame;
    case "offer":
      return offerQuotePlacement(ctx, input, fontFamily).frame;
    case "journey":
      return journeyQuotePlacement(input).frame;
    case "shift": {
      const previous = input.previousRole?.trim();
      const role = input.role?.trim();
      if (!previous || !role) {
        return quoteDesignPlacement(input, variant).frame;
      }
      return journeyQuotePlacement(input).frame;
    }
    case "profile":
      return profileQuotePlacement(ctx, input, fontFamily).frame;
  }
}

function photoQuotePlacement(input: IgCardContent, variant: Variant, hasPhoto: boolean) {
  const authorTop = IG_CARD_HEIGHT - PAD - AUTHOR_H;
  const kickerSize = 26;
  const headerBottom = 156;
  let contentTop = headerBottom;
  if (hasPhoto) {
    contentTop = IG_PHOTO_HEIGHT + (variant === "job" ? 72 : 44);
  } else if (variant === "job" && input.company?.trim()) {
    contentTop = headerBottom + 76 + 40;
  }
  const showPills = variant === "change" && Boolean(input.previousRole && input.role);
  const pillsBlock = showPills ? 28 + 56 : 0;
  const maxWidth = IG_CARD_WIDTH - PAD * 2;
  return {
    authorTop,
    kickerSize,
    contentTop,
    showPills,
    pillsBlock,
    frame: {
      text: `“${stripWrappingQuotes(input.quote)}”`,
      maxWidth,
      maxHeight: Math.max(80, authorTop - 36 - contentTop - kickerSize - 28 - pillsBlock),
      maxFont: hasPhoto ? 48 : 56,
    },
  };
}

function quoteDesignPlacement(input: IgCardContent, variant: Variant) {
  const authorTop = IG_CARD_HEIGHT - PAD - QUOTE_AUTHOR_H;
  const contentTop = 340;
  const contentBottom = authorTop - 72;
  const kickerBlock = 26 + 28;
  const company = variant === "job" ? input.company?.trim() || null : null;
  const showPills = variant === "change" && Boolean(input.previousRole && input.role);
  const extras = company ? 44 + 76 : showPills ? 32 + 56 : 0;
  const maxWidth = IG_CARD_WIDTH - PAD * 2;
  return {
    authorTop,
    contentTop,
    contentBottom,
    kickerBlock,
    company,
    showPills,
    extras,
    frame: {
      text: stripWrappingQuotes(input.quote),
      maxWidth,
      maxHeight: Math.max(80, contentBottom - contentTop - kickerBlock - extras),
      maxFont: 68,
    },
  };
}

function portraitQuotePlacement(input: IgCardContent) {
  const maxWidth = IG_CARD_WIDTH - PAD * 2;
  const contentTop = 850;
  const kickerBlock = 26 + 28;
  const room = IG_CARD_HEIGHT - PAD - contentTop;
  return {
    maxWidth,
    contentTop,
    kickerBlock,
    room,
    frame: {
      text: `“${stripWrappingQuotes(input.quote)}”`,
      maxWidth,
      maxHeight: room - kickerBlock,
      maxFont: 52,
    },
  };
}

function offerQuotePlacement(
  ctx: CanvasRenderingContext2D,
  input: IgCardContent,
  fontFamily: string,
) {
  const maxWidth = IG_CARD_WIDTH - PAD * 2;
  const company = input.company?.trim() || input.role?.trim() || input.fullName;
  const size = fitFont(ctx, company, maxWidth, 128, 56, 800, fontFamily);
  let quoteTop = 280 + size * 1.15;
  const role = input.role?.trim() || null;
  if (role) {
    quoteTop += 38;
  }
  quoteTop += 48 + 56;
  const authorTop = IG_CARD_HEIGHT - PAD - INLINE_AUTHOR_H;
  return {
    maxWidth,
    company,
    size,
    role,
    quoteTop,
    authorTop,
    frame: {
      text: `“${stripWrappingQuotes(input.quote)}”`,
      maxWidth,
      maxHeight: Math.max(80, authorTop - 56 - quoteTop),
      maxFont: 52,
    },
  };
}

function journeyQuotePlacement(input: IgCardContent) {
  const r = 160;
  const cy = 610;
  const lineBottom = cy + r + 80;
  const quoteX = PAD + 44;
  const quoteW = IG_CARD_WIDTH - PAD - quoteX;
  const authorH = 30;
  const authorGap = 28;
  const quoteTop = lineBottom + 70;
  const room = IG_CARD_HEIGHT - PAD - quoteTop - authorH - authorGap;
  return {
    quoteX,
    quoteW,
    authorH,
    authorGap,
    quoteTop,
    room,
    frame: {
      text: `“${stripWrappingQuotes(input.quote)}”`,
      maxWidth: quoteW,
      maxHeight: room,
      maxFont: 52,
    },
  };
}

function profileQuotePlacement(
  ctx: CanvasRenderingContext2D,
  input: IgCardContent,
  fontFamily: string,
) {
  const cardX = PAD;
  const cardY = 150;
  const cardW = IG_CARD_WIDTH - PAD * 2;
  const cardH = IG_CARD_HEIGHT - PAD - cardY;
  const bannerW = cardW - 40;
  const bannerH = Math.round(bannerW / PHOTO_ASPECT);
  const bannerBottom = cardY + 20 + bannerH;
  const r = 112;
  const innerX = cardX + 40;
  const innerW = cardW - 80;
  const roleTop = bannerBottom + r + 36;
  const roleFit = fitLines(
    ctx,
    input.role?.trim() || "Nuevo rol",
    innerW,
    76,
    44,
    800,
    fontFamily,
    2,
  );
  const roleLineH = roleFit.size * 1.08;
  const dividerY = roleTop + roleFit.lines.length * roleLineH + 26;
  const quoteTop = dividerY + 30;
  const quoteRoom = cardY + cardH - 40 - quoteTop;
  return {
    innerX,
    innerW,
    roleFit,
    roleTop,
    roleLineH,
    dividerY,
    quoteTop,
    quoteRoom,
    frame: {
      text: `“${stripWrappingQuotes(input.quote)}”`,
      maxWidth: innerW,
      maxHeight: Math.max(60, quoteRoom),
      maxFont: 44,
    },
  };
}

function layoutQuote(
  ctx: CanvasRenderingContext2D,
  frame: QuoteFrame,
  fontFamily: string,
) {
  let fontSize = Math.max(frame.maxFont, QUOTE_MIN_FONT);
  let lines: string[] = [];
  let lineHeight = fontSize * 1.28;

  for (;;) {
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    lines = wrapText(ctx, frame.text, frame.maxWidth);
    lineHeight = fontSize * 1.28;
    if (lines.length * lineHeight <= frame.maxHeight || fontSize <= QUOTE_MIN_FONT) {
      break;
    }
    fontSize = Math.max(QUOTE_MIN_FONT, fontSize - 2);
  }

  const capacity = Math.max(1, Math.floor(frame.maxHeight / lineHeight));
  const used = Math.min(lines.length, capacity);
  return {
    fontSize,
    lines,
    lineHeight,
    used,
    height: used * lineHeight,
    clipped: lines.length > used,
  };
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
      i === layout.used - 1 && layout.clipped ? ellipsizeLine(ctx, line, maxWidth) : line;
    ctx.fillText(shown, lineX, top + i * layout.lineHeight);
  }
  ctx.textAlign = "left";
}

function ellipsizeLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const ellipsis = "…";
  let cut = text.replace(/[…\s]+$/u, "");
  const fits = (value: string) => ctx.measureText(`${value}${ellipsis}`).width <= maxWidth;
  if (!fits(cut)) {
    const words = cut.split(" ");
    while (words.length > 1 && !fits(words.join(" "))) {
      words.pop();
    }
    cut = words.join(" ");
    while (cut.length > 0 && !fits(cut)) {
      cut = cut.slice(0, -1);
    }
    cut = cut.trimEnd();
  }
  return `${cut}${ellipsis}`;
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

/** Autor sin caja: hexágono y texto al lado. El formato cita pasa tamaños más grandes. */
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
    hexR?: number;
    blockH?: number;
    nameSize?: number;
    metaSize?: number;
  },
) {
  const hexR = input.hexR ?? 60;
  const blockH = input.blockH ?? INLINE_AUTHOR_H;
  const hexCx = PAD + hexR;
  const hexCy = input.y + blockH / 2;
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
    nameSize: input.nameSize ?? 40,
    metaSize: input.metaSize ?? 28,
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
    nameSize?: number;
    metaSize?: number;
  },
) {
  const role = input.role?.trim() || null;
  const country = input.country?.trim() || null;
  const { light } = input;
  const nameSize = input.nameSize ?? 40;
  const metaSize = input.metaSize ?? 28;
  const nameGap = 10;
  ctx.textAlign = "left";
  ctx.fillStyle = light ? INK : "#ffffff";
  if (role) {
    const block = nameSize + nameGap + metaSize;
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
      nameSize,
      metaSize,
    );
    ctx.font = `600 ${metaSize}px ${input.fontFamily}`;
    ctx.fillStyle = light ? PINK : "#ffffff";
    ctx.fillText(
      truncateToWidth(ctx, role, input.maxWidth),
      input.x,
      textY + nameSize + nameGap,
    );
    return;
  }

  ctx.textBaseline = "middle";
  drawNameAndCountry(
    ctx,
    input.fullName,
    country,
    input.x,
    input.cy - nameSize / 2,
    input.maxWidth,
    input.fontFamily,
    light,
    nameSize,
    metaSize,
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
  nameSize: number,
  metaSize: number,
) {
  ctx.textBaseline = "top";
  ctx.font = `700 ${nameSize}px ${fontFamily}`;
  ctx.fillStyle = light ? INK : "#ffffff";
  if (!country) {
    ctx.fillText(truncateToWidth(ctx, fullName, maxWidth), x, y);
    return;
  }

  const gap = 14;
  ctx.font = `600 ${metaSize}px ${fontFamily}`;
  const countryLabel = `· ${country}`;
  const countryWidth = Math.min(ctx.measureText(countryLabel).width, maxWidth * 0.42);
  ctx.font = `700 ${nameSize}px ${fontFamily}`;
  ctx.fillStyle = light ? INK : "#ffffff";
  const nameMax = Math.max(80, maxWidth - gap - countryWidth);
  const name = truncateToWidth(ctx, fullName, nameMax);
  ctx.fillText(name, x, y);
  const nameWidth = ctx.measureText(name).width;
  ctx.font = `600 ${metaSize}px ${fontFamily}`;
  ctx.fillStyle = light ? "#5c5670" : "rgba(255,255,255,0.82)";
  ctx.fillText(
    truncateToWidth(ctx, countryLabel, maxWidth - nameWidth - gap),
    x + nameWidth + gap,
    y + Math.round((nameSize - metaSize) * 0.65),
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

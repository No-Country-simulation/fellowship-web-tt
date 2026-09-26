import { IG_CARD_WIDTH, IG_PHOTO_HEIGHT } from "./ig-card";

export const CAPTURE_ASPECT = 16 / 9;
export const AVATAR_ASPECT = 1;
export const AVATAR_SIZE = 720;

export type ImageCropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Recorta el área 16:9 y la deja en 1080 de ancho, para la card. */
export function cropCaptureFile(file: File, area: ImageCropArea) {
  return cropImageFile(file, area, IG_CARD_WIDTH, IG_PHOTO_HEIGHT, "foto-testimonial");
}

/** Recorta el área cuadrada de la foto de perfil. */
export function cropAvatarFile(file: File, area: ImageCropArea) {
  return cropImageFile(file, area, AVATAR_SIZE, AVATAR_SIZE, "foto-perfil");
}

async function cropImageFile(
  file: File,
  area: ImageCropArea,
  width: number,
  height: number,
  fallbackName: string,
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const sx = Math.max(0, Math.round(area.x));
  const sy = Math.max(0, Math.round(area.y));
  const sw = Math.max(1, Math.round(area.width));
  const sh = Math.max(1, Math.round(area.height));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("No pudimos recortar la foto.");
  }

  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await canvasToJpeg(canvas);
  const name = file.name.replace(/\.[^.]+$/, "") || fallbackName;
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("No pudimos recortar la foto."));
      },
      "image/jpeg",
      0.9,
    );
  });
}

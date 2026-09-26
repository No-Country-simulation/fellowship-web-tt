"use client";

import { useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@repo/ui/button";

import {
  AVATAR_ASPECT,
  CAPTURE_ASPECT,
} from "@/lib/testimonials/prepare-image";
import { cn } from "@/lib/utils";

type CropKind = "capture" | "avatar";

const COPY: Record<
  CropKind,
  { title: string; description: string; frameClass: string; aspect: number }
> = {
  capture: {
    title: "Recortá la foto",
    description: "Mové la foto o hacé zoom hasta que quede como te guste. Así se va a ver en tu testimonio.",
    frameClass: "aspect-video",
    aspect: CAPTURE_ASPECT,
  },
  avatar: {
    title: "Recortá la foto",
    description: "Mové la foto o hacé zoom hasta que tu cara quede centrada. Así se va a ver junto a tu nombre.",
    frameClass: "mx-auto size-[min(18rem,40vh)]",
    aspect: AVATAR_ASPECT,
  },
};

type CaptureCropDialogProps = {
  imageUrl: string;
  kind?: CropKind;
  onCancel: () => void;
  onConfirm: (area: Area) => void;
  confirming?: boolean;
};

/** Preview para recortar la foto justo después de subirla. 16:9 o cuadrado. */
export function CaptureCropDialog({
  imageUrl,
  kind = "capture",
  onCancel,
  onConfirm,
  confirming = false,
}: CaptureCropDialogProps) {
  const copy = COPY[kind];
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !confirming) {
        onCancel();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-md"
      role="presentation"
      onClick={() => {
        if (!confirming) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="capture-crop-title"
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col gap-md overflow-y-auto rounded-md border border-border bg-card p-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <h2
            id="capture-crop-title"
            className="text-heading-3 text-text-primary"
          >
            {copy.title}
          </h2>
          <p className="mt-xs text-body-small text-text-secondary">
            {copy.description}
          </p>
        </div>
        <div
          className={cn(
            "relative overflow-hidden rounded-md bg-bg-base",
            copy.frameClass,
          )}
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={copy.aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedAreaPixels) => {
              setArea(croppedAreaPixels);
            }}
          />
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-body-small text-text-secondary">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            className="w-full accent-accent-cyan"
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
        <div className="flex justify-end gap-sm">
          <Button
            type="button"
            variant="outline"
            disabled={confirming}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="gradient"
            disabled={!area || confirming}
            onClick={() => {
              if (area) {
                onConfirm(area);
              }
            }}
          >
            {confirming ? "Recortando…" : "Usar recorte"}
          </Button>
        </div>
      </div>
    </div>
  );
}

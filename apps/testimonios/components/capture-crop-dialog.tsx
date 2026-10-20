"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from "react";
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
    frameClass: "mx-auto aspect-square w-[min(18rem,40vh)] max-w-full",
    aspect: AVATAR_ASPECT,
  },
};

type CaptureCropDialogProps = {
  imageUrl: string;
  kind?: CropKind;
  onCancel: () => void;
  onConfirm: (area: Area) => void;
  confirming?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

/** Recorte modal nativo, con teclado y retorno del foco. 16:9 o cuadrado. */
export function CaptureCropDialog({
  imageUrl,
  kind = "capture",
  onCancel,
  onConfirm,
  confirming = false,
  returnFocusRef,
}: CaptureCropDialogProps) {
  const copy = COPY[kind];
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closingRef = useRef(false);
  const confirmingRef = useRef(false);
  const backdropPointerDown = useRef(false);
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const keyboardHintId = `${id}-keyboard`;

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = returnFocusRef?.current ?? document.activeElement;
    if (!dialog) return;
    dialog.showModal();
    titleRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [returnFocusRef]);

  function cancel() {
    if (confirming || confirmingRef.current || closingRef.current) return;
    closingRef.current = true;
    onCancel();
  }

  function isOutside(event: React.PointerEvent<HTMLDialogElement> | React.MouseEvent<HTMLDialogElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancel();
      return;
    }
    if (event.key !== "Tab") return;
    const dialog = event.currentTarget;
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>(
      "button:not(:disabled), input:not(:disabled), [tabindex='0']:not(:disabled)",
    )).filter((control) => !control.closest("[inert]"));
    const first = controls[0];
    const last = controls.at(-1);
    const active = dialog.ownerDocument.activeElement;
    if (!first) {
      event.preventDefault();
      titleRef.current?.focus();
    } else if (event.shiftKey && (active === first || active === titleRef.current || active === dialog)) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Todos los cierres pasan por cancel() para proteger la confirmación en curso.
  return (
    <dialog
      ref={dialogRef}
      closedby="none"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={confirming}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-md border border-border bg-card p-md text-text-primary backdrop:bg-black/70"
      onCancel={(event) => {
        event.preventDefault();
        cancel();
      }}
      onPointerDown={(event) => {
        backdropPointerDown.current = event.target === event.currentTarget && isOutside(event);
      }}
      onClick={(event) => {
        if (backdropPointerDown.current && event.target === event.currentTarget && isOutside(event)) {
          cancel();
        }
        backdropPointerDown.current = false;
      }}
    >
      <div className="flex flex-col gap-md">
        <div>
          <h2
            ref={titleRef}
            id={titleId}
            tabIndex={-1}
            className="text-heading-3 text-text-primary"
          >
            {copy.title}
          </h2>
          <p id={descriptionId} className="mt-xs text-body-small text-text-secondary">
            {copy.description}
          </p>
        </div>
        <div
          inert={confirming}
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
            mediaProps={{ alt: "Foto para recortar" }}
            cropperProps={{
              role: "group",
              "aria-label": "Área de recorte",
              "aria-describedby": keyboardHintId,
            }}
            classes={{
              cropAreaClassName: "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-cyan",
            }}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedAreaPixels) => {
              setArea(croppedAreaPixels);
            }}
          />
        </div>
        <p id={keyboardHintId} className="sr-only">
          Usá las flechas para mover la foto. Mantené Shift para ajustar con más precisión.
        </p>
        <label className="flex flex-col gap-1">
          <span className="text-body-small text-text-secondary">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            disabled={confirming}
            className="w-full accent-accent-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan"
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
        <div className="flex flex-wrap justify-end gap-sm">
          <Button
            type="button"
            variant="outline"
            disabled={confirming}
            onClick={cancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="gradient"
            disabled={!area || confirming}
            onClick={() => {
              if (area && !confirming && !confirmingRef.current && !closingRef.current) {
                confirmingRef.current = true;
                onConfirm(area);
              }
            }}
          >
            {confirming ? "Recortando…" : "Usar recorte"}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

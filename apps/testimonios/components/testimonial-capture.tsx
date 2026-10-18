"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Expand, X } from "lucide-react";

import { cn } from "@/lib/utils";

type TestimonialCaptureProps = {
  src: string;
  participantName: string;
};

/** Captura con carga y error accesibles, aparición suave y ampliación en diálogo nativo. */
export function TestimonialCapture(props: TestimonialCaptureProps) {
  // Cada URL tiene su propio estado y nodo: una decodificación anterior no puede revelarla.
  return <CaptureWithLoading key={props.src} {...props} />;
}

/** Conserva el tamaño natural y habilita la ampliación cuando la captura está decodificada. */
function CaptureWithLoading({
  src,
  participantName,
}: TestimonialCaptureProps) {
  const dialogId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const sizeObserverRef = useRef<ResizeObserver | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const caption = `Captura del proyecto de ${participantName}`;

  const readDimensions = useCallback((image: HTMLImageElement) => {
    if (imageRef.current !== image || !image.naturalWidth || !image.naturalHeight) {
      return false;
    }
    const { naturalWidth: width, naturalHeight: height } = image;
    setDimensions((current) =>
      current?.width === width && current.height === height
        ? current
        : { width, height },
    );
    sizeObserverRef.current?.disconnect();
    return true;
  }, []);

  const revealImage = useCallback(
    async (image: HTMLImageElement) => {
      readDimensions(image);
      try {
        await image.decode();
        if (imageRef.current === image) setStatus("ready");
      } catch {
        if (imageRef.current === image) setStatus("error");
      }
    },
    [readDimensions],
  );

  const attachImage = useCallback(
    (image: HTMLImageElement | null) => {
      sizeObserverRef.current?.disconnect();
      imageRef.current = image;
      if (!image) return;
      const hasDimensions = readDimensions(image);
      // El evento load puede haber ocurrido antes de la hidratación o venir de caché.
      if (image.complete) {
        if (image.naturalWidth > 0) void revealImage(image);
        else setStatus("error");
      } else if (!hasDimensions) {
        // El tamaño intrínseco puede aparecer al leer la cabecera, antes de terminar la descarga.
        sizeObserverRef.current = new ResizeObserver(() => readDimensions(image));
        sizeObserverRef.current.observe(image);
      }
    },
    [readDimensions, revealImage],
  );

  return (
    <figure className="relative" aria-busy={status === "loading"}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={
          status === "ready"
            ? `Ampliar captura del proyecto de ${participantName}`
            : caption
        }
        aria-haspopup="dialog"
        aria-controls={dialogId}
        disabled={status !== "ready"}
        className={cn(
          "block w-full max-w-full cursor-zoom-in rounded-card border border-border bg-bg-surface-2 p-xs text-left transition-colors hover:border-accent-cyan/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan disabled:cursor-default disabled:hover:border-border motion-reduce:transition-none",
          dimensions && "w-fit",
        )}
        onClick={() => {
          dialogRef.current?.showModal();
          closeRef.current?.focus();
        }}
      >
        <span
          className={cn(
            "relative block max-w-full overflow-hidden rounded-md",
            status !== "ready" && "bg-bg-surface-3",
          )}
          style={{
            width: dimensions?.width,
            aspectRatio: dimensions
              ? `${dimensions.width} / ${dimensions.height}`
              : "16 / 9",
          }}
        >
          {/* Sin dimensiones conocidas: conservar el tamaño y la proporción intrínsecos. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={attachImage}
            src={src}
            alt={caption}
            loading="lazy"
            decoding="async"
            onLoad={(event) => void revealImage(event.currentTarget)}
            onError={() => {
              sizeObserverRef.current?.disconnect();
              setStatus("error");
            }}
            className={cn(
              "absolute top-0 left-0 block h-auto w-auto max-w-full rounded-md opacity-0 transition-opacity duration-200 motion-reduce:transition-none",
              status === "ready" && "opacity-100",
              status === "error" && "hidden",
            )}
          />
          {status === "error" ? (
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center p-sm text-center text-sm leading-relaxed text-text-secondary"
            >
              No pudimos cargar la captura.
            </span>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className="mt-xs grid min-h-8 items-center px-xs text-xs font-medium text-text-primary/90"
        >
          <span
            className={cn(
              "col-start-1 row-start-1 flex items-center justify-end gap-xs",
              status !== "ready" && "invisible",
            )}
          >
            <Expand className="size-4 shrink-0 text-accent-cyan" />
            Ampliar captura
          </span>
          <span
            className={cn(
              "col-start-1 row-start-1 text-right",
              status === "ready" && "invisible",
            )}
          >
            {status === "error" ? "Captura no disponible" : "Cargando captura…"}
          </span>
        </span>
      </button>
      <span role="status" className="sr-only">
        {status === "loading"
          ? "Cargando captura…"
          : status === "error"
            ? "No pudimos cargar la captura."
            : ""}
      </span>
      <figcaption className="mt-sm text-sm leading-relaxed text-text-secondary">
        {caption}
      </figcaption>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label={`${caption}, vista ampliada`}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none flex-col items-center justify-center border-0 bg-bg-base/95 px-sm pt-20 pb-md text-text-primary backdrop:bg-black/90 open:flex md:px-lg"
        onClose={() => triggerRef.current?.focus({ preventScroll: true })}
      >
        <button
          ref={closeRef}
          type="button"
          className="absolute top-sm right-sm inline-flex min-h-11 items-center gap-xs rounded-md border border-border bg-bg-surface-3 px-sm text-sm font-medium hover:bg-bg-surface-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan md:right-lg"
          onClick={() => dialogRef.current?.close()}
        >
          <X aria-hidden="true" className="size-4" />
          Cerrar
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={caption}
          loading="lazy"
          decoding="async"
          className="block h-auto w-auto max-w-full min-h-0 max-h-full rounded-md object-contain"
        />
      </dialog>
    </figure>
  );
}

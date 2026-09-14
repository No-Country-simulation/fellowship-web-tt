"use client";

import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@repo/ui/button";

import { canvasToPng, drawIgCard } from "@/lib/testimonials/ig-card-canvas";
import { igCardFilename, IG_CARD_SIZE } from "@/lib/testimonials/ig-card";
import { cn } from "@/lib/utils";

type AdminIgShareProps = {
  slug: string;
  quote: string;
  caption: string;
  fullName: string;
  avatarUrl: string;
  instagram: string | null;
  typeLabel: string;
  contextLine: string | null;
  /**
   * `preview`: solo el canvas, para ver cómo queda mientras se edita.
   * `share`: canvas + caption + descargar/copiar, para subir a Instagram.
   */
  mode?: "preview" | "share";
};

/** Preview, descarga PNG 1080×1080 y copia el caption de Instagram. */
export function AdminIgShare({
  slug,
  quote,
  caption,
  fullName,
  avatarUrl,
  instagram,
  typeLabel,
  contextLine,
  mode = "share",
}: AdminIgShareProps) {
  const previewOnly = mode === "preview";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewQuote, setPreviewQuote] = useState(quote);
  const [previewCaption, setPreviewCaption] = useState(caption);
  const [copied, setCopied] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPreviewQuote(quote), 400);
    return () => window.clearTimeout(timeout);
  }, [quote]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPreviewCaption(caption), 400);
    return () => window.clearTimeout(timeout);
  }, [caption]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !previewQuote) {
      return;
    }

    let cancelled = false;
    setPreviewFailed(false);
    void drawIgCard(canvas, {
      quote: previewQuote,
      fullName,
      avatarUrl,
      instagram,
      typeLabel,
      contextLine,
    }).then(
      () => {
        if (!cancelled) {
          setPreviewFailed(false);
        }
      },
      () => {
        if (!cancelled) {
          setPreviewFailed(true);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [previewQuote, fullName, avatarUrl, instagram, typeLabel, contextLine]);

  async function downloadCard() {
    setDownloadError(null);
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      await drawIgCard(canvas, {
        quote: quote || previewQuote,
        fullName,
        avatarUrl,
        instagram,
        typeLabel,
        contextLine,
      });
      const blob = await canvasToPng(canvas);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = igCardFilename(slug);
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("No pudimos generar la imagen.");
    } finally {
      setDownloading(false);
    }
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const canvas = (
    <>
      {previewFailed ? (
        <div className="grid aspect-square w-full place-items-center rounded-md border border-border bg-bg-surface-3 p-md text-center">
          <p className="text-body-small text-destructive">
            No pudimos generar la card. Probá descargar de nuevo.
          </p>
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        width={IG_CARD_SIZE}
        height={IG_CARD_SIZE}
        aria-label={`Card de Instagram de ${fullName}`}
        className={cn(
          "aspect-square w-full rounded-md border border-border bg-bg-surface-3",
          previewFailed && "hidden",
        )}
      />
    </>
  );

  if (previewOnly) {
    return canvas;
  }

  return (
    <div className="grid items-start gap-md md:grid-cols-2">
      <div className="min-w-0">{canvas}</div>
      <div className="flex min-w-0 flex-col gap-sm">
        <div className="grid gap-sm sm:grid-cols-2">
          <button
            type="button"
            onClick={downloadCard}
            disabled={downloading || !quote}
            className={cn(
              buttonVariants({ variant: "gradient", size: "lg" }),
              "w-full",
            )}
          >
            {downloading ? "Generando…" : "Descargar imagen"}
          </button>
          <button
            type="button"
            onClick={copyCaption}
            disabled={!caption}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full",
            )}
          >
            {copied ? "Caption copiado" : "Copiar caption"}
          </button>
        </div>
        {downloadError ? (
          <p className="text-body-small text-destructive" role="alert">
            {downloadError}
          </p>
        ) : null}
        {previewCaption ? (
          <p className="whitespace-pre-wrap text-body-small text-text-secondary">
            {previewCaption}
          </p>
        ) : (
          <p className="text-body-small text-text-muted">Sin caption.</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { canvasToPng, drawIgCard } from "../infrastructure/ig-card-canvas";
import {
  igCardFilename,
  IG_CARD_HEIGHT,
  IG_CARD_WIDTH,
  type IgCardContent,
} from "../infrastructure/ig-card";

type IgShareProps = IgCardContent & {
  slug: string;
  caption: string;
  /** `preview` muestra solo el canvas. `share` suma descarga y copia del caption. */
  mode?: "preview" | "share";
};

/** Preview, descarga PNG 1080×1350 y copia el caption de Instagram. */
export function IgShare({
  slug,
  quote,
  caption,
  type,
  fullName,
  country,
  avatarUrl,
  captureUrl,
  company,
  role,
  previousRole,
  mode = "share",
}: IgShareProps) {
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
      type,
      quote: previewQuote,
      fullName,
      country,
      avatarUrl,
      captureUrl,
      company,
      role,
      previousRole,
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
  }, [
    previewQuote,
    type,
    fullName,
    country,
    avatarUrl,
    captureUrl,
    company,
    role,
    previousRole,
  ]);

  async function downloadCard() {
    setDownloadError(null);
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      await drawIgCard(canvas, {
        type,
        quote: quote || previewQuote,
        fullName,
        country,
        avatarUrl,
        captureUrl,
        company,
        role,
        previousRole,
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
    <div className="w-full max-w-md">
      {previewFailed ? (
        <div className="grid aspect-4/5 w-full place-items-center rounded-lg border border-border bg-muted p-4 text-center">
          <p className="text-admin-caption text-destructive">
            No pudimos generar la card. Probá descargar de nuevo.
          </p>
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        width={IG_CARD_WIDTH}
        height={IG_CARD_HEIGHT}
        aria-label={`Card de Instagram de ${fullName}`}
        className={cn(
          "aspect-4/5 w-full rounded-lg border border-border bg-muted",
          previewFailed && "hidden",
        )}
      />
    </div>
  );

  if (previewOnly) {
    return canvas;
  }

  return (
    <div className="grid items-start gap-4 md:grid-cols-2">
      <div className="min-w-0">{canvas}</div>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={downloadCard}
            disabled={downloading || !quote}
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full")}
          >
            {downloading ? "Generando…" : "Descargar imagen"}
          </button>
          <button
            type="button"
            onClick={copyCaption}
            disabled={!caption}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
          >
            {copied ? "Caption copiado" : "Copiar caption"}
          </button>
        </div>
        {downloadError ? (
          <p className="text-admin-caption text-destructive" role="alert">
            {downloadError}
          </p>
        ) : null}
        {previewCaption ? (
          <p className="whitespace-pre-wrap text-admin-caption text-muted-foreground">
            {previewCaption}
          </p>
        ) : (
          <p className="text-admin-caption text-muted-foreground">Sin caption.</p>
        )}
      </div>
    </div>
  );
}

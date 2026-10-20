"use client";

import { useState, type FormEvent } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { retryShare } from "../actions/testimonialActions";
import type { IgCardContent } from "../infrastructure/ig-card";
import { igCardPngBlob } from "../infrastructure/ig-card-canvas";
import { SHARE_CARD_MAX_BYTES } from "../types/share";

/** Reintenta las redes que faltan. Con `card` genera el PNG; sin ella usa el guardado al publicar. */
export function ShareRetry({
  id,
  card,
  label,
}: {
  id: string;
  card: IgCardContent | null;
  label: string;
}) {
  const [pending, setPending] = useState(false);
  const [cardFailed, setCardFailed] = useState(false);
  const retry = retryShare.bind(null, id);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const formData = new FormData();
      if (card) {
        let blob: Blob;
        try {
          blob = await igCardPngBlob(card);
        } catch {
          setCardFailed(true);
          return;
        }
        if (blob.size === 0 || blob.size > SHARE_CARD_MAX_BYTES) {
          setCardFailed(true);
          return;
        }
        formData.set("share_card", new File([blob], "instagram.png", { type: "image/png" }));
      }
      setCardFailed(false);
      await retry(formData);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center justify-end gap-2">
      {cardFailed ? (
        <p className="text-admin-caption text-destructive" role="alert">
          No se pudo generar la imagen.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        {pending ? "Enviando…" : label}
      </button>
    </form>
  );
}

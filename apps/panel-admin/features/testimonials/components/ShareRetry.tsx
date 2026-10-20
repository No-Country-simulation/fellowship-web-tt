"use client";

import { useState, type FormEvent } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { retryShare } from "../actions/testimonialActions";
import type { IgCardContent } from "../infrastructure/ig-card";
import { igCardPngBlob } from "../infrastructure/ig-card-canvas";

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
  const retry = retryShare.bind(null, id);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const formData = new FormData();
    if (card) {
      try {
        const blob = await igCardPngBlob(card);
        formData.set("share_card", new File([blob], "instagram.png", { type: "image/png" }));
      } catch {
        // Sin PNG nuevo, el action usa la card que ya está en Storage.
      }
    }
    try {
      await retry(formData);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
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

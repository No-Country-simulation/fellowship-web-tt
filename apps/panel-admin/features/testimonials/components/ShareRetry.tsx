"use client";

import { useState, type FormEvent } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { retryShare } from "../actions/testimonialActions";
import { INBOX_FILTERS_FIELD } from "../infrastructure/inboxQuery";
import { useInboxFilters } from "./InboxFilters";
import type { IgCardContent } from "../infrastructure/ig-card";
import { igCardImageDetail, igCardPngBlob } from "../infrastructure/ig-card-canvas";
import { SHARE_CARD_MAX_BYTES, SHARE_CARD_TOO_LARGE_MESSAGE } from "../types/share";

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
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardImageDetail, setCardImageDetail] = useState<string | null>(null);
  const { filtersField } = useInboxFilters();
  const retry = retryShare.bind(null, id);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    try {
      let shareCard: File | null = null;
      if (card) {
        let blob: Blob;
        try {
          blob = await igCardPngBlob(card);
        } catch (error) {
          setCardError("No se pudo generar la imagen.");
          setCardImageDetail(igCardImageDetail(error));
          return;
        }
        if (blob.size === 0) {
          setCardError("No se pudo generar la imagen.");
          setCardImageDetail(null);
          return;
        }
        if (blob.size > SHARE_CARD_MAX_BYTES) {
          setCardError(SHARE_CARD_TOO_LARGE_MESSAGE);
          setCardImageDetail(null);
          return;
        }
        shareCard = new File([blob], "instagram.png", { type: "image/png" });
      }
      const formData = new FormData(form);
      if (shareCard) {
        formData.set("share_card", shareCard);
      }
      setCardError(null);
      setCardImageDetail(null);
      const result = await retry(formData);
      if (result?.status === "error") {
        setCardError(result.message);
        setCardImageDetail(null);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name={INBOX_FILTERS_FIELD} value={filtersField} readOnly />
      {cardError ? (
        <div className="text-admin-caption text-destructive" role="alert">
          <p>{cardError}</p>
          {cardImageDetail ? <p>{cardImageDetail}</p> : null}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10 md:h-7")}
      >
        {pending ? "Enviando…" : label}
      </button>
    </form>
  );
}

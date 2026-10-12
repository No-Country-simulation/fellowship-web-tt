"use client";

import { useState, type FormEvent } from "react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import { retryBufferShare } from "../lib/actions";
import { formatSubmittedAt } from "../lib/view";
import type { IgCardContent } from "../lib/ig-card";
import { igCardPngBlob } from "../lib/ig-card-canvas";

/** Estado de Instagram y LinkedIn en Buffer, con reintento si falló. */
export function BufferRetry({
  id,
  instagramPostedAt,
  linkedinPostedAt,
  bufferStatus,
  canRetryInstagram,
  canRetryLinkedin,
  igCard,
}: {
  id: string;
  instagramPostedAt: string | null;
  linkedinPostedAt: string | null;
  bufferStatus: "ok" | "failed" | null;
  canRetryInstagram: boolean;
  canRetryLinkedin: boolean;
  igCard: IgCardContent;
}) {
  const [pending, setPending] = useState(false);
  const retry = retryBufferShare.bind(null, id);
  const canRetry = canRetryInstagram || canRetryLinkedin;

  if (instagramPostedAt && linkedinPostedAt) {
    return (
      <p className="text-admin-caption text-tone-success" role="status">
        En Buffer · Instagram {formatSubmittedAt(instagramPostedAt)} · LinkedIn{" "}
        {formatSubmittedAt(linkedinPostedAt)}.
      </p>
    );
  }

  if (!canRetry && bufferStatus !== "failed") {
    if (instagramPostedAt) {
      return (
        <p className="text-admin-caption text-tone-success" role="status">
          En Buffer (Instagram) el {formatSubmittedAt(instagramPostedAt)}.
        </p>
      );
    }
    if (linkedinPostedAt) {
      return (
        <p className="text-admin-caption text-tone-success" role="status">
          En Buffer (LinkedIn) el {formatSubmittedAt(linkedinPostedAt)}.
        </p>
      );
    }
    return (
      <p className="text-admin-caption text-muted-foreground">
        Buffer no está configurado; Instagram y LinkedIn no se postean solos.
      </p>
    );
  }

  if (!canRetry) {
    return (
      <p className="text-admin-caption text-tone-success" role="status">
        Enviado a Buffer.
      </p>
    );
  }

  const missing = [
    canRetryInstagram ? "Instagram" : null,
    canRetryLinkedin ? "LinkedIn" : null,
  ].filter(Boolean);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const formData = new FormData();
    if (canRetryInstagram) {
      try {
        const blob = await igCardPngBlob(igCard);
        formData.set("ig_card", new File([blob], "instagram.png", { type: "image/png" }));
      } catch {
        // El action falla Instagram si no hay PNG ni archivo en Storage.
      }
    }
    try {
      await retry(formData);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
      <p className="text-admin-caption text-destructive" role="alert">
        {bufferStatus === "failed"
          ? `Quedó publicado, pero Buffer falló (${missing.join(" y ")}).`
          : `Todavía no está en Buffer (${missing.join(" y ")}).`}
      </p>
      <form onSubmit={onSubmit}>
        <button
          type="submit"
          disabled={pending}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          {pending ? "Enviando…" : "Reintentar Buffer"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useId, useState, useTransition } from "react";
import { buttonVariants } from "@repo/ui/button";

import { textareaClassName } from "@/components/enviar-fields";
import type { Plataforma } from "@/lib/agent";
import { generateCaption } from "@/lib/testimonials/generate-caption";
import { CAPTION_EDIT_MAX_CHARS } from "@/lib/testimonials/quote";
import { cn } from "@/lib/utils";

type AdminCaptionFieldProps = {
  name: "ig_caption" | "li_caption";
  plataforma: Plataforma;
  testimonioId: string;
  quote: string;
  value: string;
  hint?: string;
  onChange: (value: string) => void;
};

/** Textarea de caption + generar con Gemini. No persiste hasta Guardar / Publicar. */
export function AdminCaptionField({
  name,
  plataforma,
  testimonioId,
  quote,
  value,
  hint,
  onChange,
}: AdminCaptionFieldProps) {
  const captionId = useId();
  const hintId = `${captionId}-hint`;
  const countId = `${captionId}-count`;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const describedBy = [hint ? hintId : null, countId].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-center justify-between gap-sm">
        <label htmlFor={captionId} className="sr-only">
          {plataforma === "linkedin" ? "Caption de LinkedIn" : "Caption de Instagram"}
        </label>
        <p id={countId} className="text-body-small text-text-muted">
          {value.length}/{CAPTION_EDIT_MAX_CHARS}
        </p>
        <button
          type="button"
          disabled={pending}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          onClick={() => {
            start(async () => {
              const result = await generateCaption(
                testimonioId,
                plataforma,
                quote,
              );
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setError(null);
              onChange(result.caption);
            });
          }}
        >
          {pending ? "Generando…" : "Generar con IA"}
        </button>
      </div>
      {hint ? (
        <p id={hintId} className="text-body-small text-text-secondary">
          {hint}
        </p>
      ) : null}
      <textarea
        id={captionId}
        name={name}
        value={value}
        maxLength={CAPTION_EDIT_MAX_CHARS}
        aria-describedby={describedBy}
        className={cn(textareaClassName, "min-h-32 resize-y whitespace-pre-wrap")}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p className="text-body-small text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

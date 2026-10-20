"use client";

import { useId } from "react";
import { cn } from "@repo/ui/utils";

import { CAPTION_EDIT_MAX_CHARS } from "../infrastructure/quote";
import { textareaClassName } from "./fields";

/** Textarea de caption. Se edita a mano; no se persiste hasta Guardar o Publicar. */
export function CaptionField({
  label,
  value,
  hint,
  onChange,
}: {
  label: string;
  value: string;
  hint?: string;
  onChange: (value: string) => void;
}) {
  const captionId = useId();
  const hintId = `${captionId}-hint`;
  const countId = `${captionId}-count`;
  const describedBy = [hint ? hintId : null, countId].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={captionId} className="text-admin-caption text-foreground">
          {label}
        </label>
        <p id={countId} className="text-admin-caption text-muted-foreground">
          {value.length}/{CAPTION_EDIT_MAX_CHARS}
        </p>
      </div>
      {hint ? (
        <p id={hintId} className="text-admin-caption text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <textarea
        id={captionId}
        value={value}
        maxLength={CAPTION_EDIT_MAX_CHARS}
        aria-describedby={describedBy}
        className={cn(textareaClassName, "min-h-48 resize-y whitespace-pre-wrap [field-sizing:content]")}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

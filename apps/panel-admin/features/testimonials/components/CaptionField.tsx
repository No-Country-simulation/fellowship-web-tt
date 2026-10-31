"use client";

import { useId, type ReactNode } from "react";

import { textareaClassName } from "./fields";

/** Textarea de caption. Se edita a mano; no se persiste hasta Guardar o Publicar. */
export function CaptionField({
  label,
  value,
  hint,
  maxChars,
  emptyInvalid = false,
  emptyMessage = "No puede estar vacío",
  describedByExtra,
  actions,
  footer,
  note,
  countedText,
  onChange,
}: {
  label: string;
  value: string;
  hint?: string;
  maxChars: number;
  /** La red se publica y el texto, ya recortado, está vacío. */
  emptyInvalid?: boolean;
  /** Reemplaza el contador cuando el texto está vacío. */
  emptyMessage?: string;
  describedByExtra?: string;
  /** Botones a la derecha del label. */
  actions?: ReactNode;
  /** Pie a la izquierda del contador, debajo del textarea. */
  footer?: ReactNode;
  /** Línea debajo del pie, a lo ancho. */
  note?: ReactNode;
  /** Texto que se guarda, si es más largo que el del textarea. */
  countedText?: string;
  onChange: (value: string) => void;
}) {
  const captionId = useId();
  const hintId = `${captionId}-hint`;
  const countId = `${captionId}-count`;
  const counted = countedText ?? value;
  const over = counted.length > maxChars;
  const reserved = Math.max(0, counted.length - value.length);
  const describedBy = [hint ? hintId : null, countId, describedByExtra]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={captionId} className="min-w-0 text-admin-caption text-foreground">
          {label}
        </label>
        {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
      </div>
      {hint ? (
        <p id={hintId} className="text-admin-micro text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <textarea
        id={captionId}
        value={value}
        maxLength={Math.max(0, maxChars - reserved)}
        aria-describedby={describedBy}
        aria-invalid={emptyInvalid || over || undefined}
        className={`${textareaClassName.replace("min-h-28", "min-h-32")} whitespace-pre-wrap [field-sizing:content]`}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">{footer}</div>
          <p
            id={countId}
            className={`ml-auto shrink-0 ${emptyInvalid ? "text-admin-caption" : "text-admin-micro"} ${
              emptyInvalid || over ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {emptyInvalid
              ? emptyMessage
              : `${counted.length}/${maxChars}${over ? " · Acortala" : ""}`}
          </p>
        </div>
        {note ? <div className="min-w-0">{note}</div> : null}
      </div>
    </div>
  );
}

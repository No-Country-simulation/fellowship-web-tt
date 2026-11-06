"use client";

import { useId } from "react";

import { textareaClassName } from "./fields";

/** Motivo obligatorio con contador. Lo usan los diálogos de archivar y rechazar. */
export function ReasonField({
  value,
  maxChars,
  error,
  onChange,
}: {
  value: string;
  maxChars: number;
  error: string | null;
  onChange: (value: string) => void;
}) {
  const reasonId = useId();
  const countId = useId();
  const errorId = useId();

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={reasonId} className="min-w-0 text-admin-caption text-foreground">
          Motivo (obligatorio)
        </label>
        <p id={countId} className="shrink-0 text-admin-micro text-muted-foreground">
          {value.length}/{maxChars}
        </p>
      </div>
      <textarea
        id={reasonId}
        name="reason"
        value={value}
        maxLength={maxChars}
        rows={4}
        required
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${countId} ${errorId}` : countId}
        className={textareaClassName}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="text-admin-caption text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

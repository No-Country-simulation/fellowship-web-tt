import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export const fieldClassName = cn(
  "h-11 w-full rounded-md border border-border bg-bg-base px-md text-body text-text-primary outline-none",
  "placeholder:text-text-muted",
  "focus-visible:border-accent-cyan focus-visible:ring-2 focus-visible:ring-accent-cyan/40",
  "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
);

export const textareaClassName = cn(
  "min-h-36 w-full resize-y rounded-md border border-border bg-bg-base px-md py-sm text-body text-text-primary outline-none",
  "placeholder:text-text-muted",
  "focus-visible:border-accent-cyan focus-visible:ring-2 focus-visible:ring-accent-cyan/40",
  "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
);

type FieldProps = {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  labelAs?: "label" | "span";
  hideLabel?: boolean;
  className?: string;
  children: (control: {
    id: string;
    describedBy?: string;
    invalid: boolean;
  }) => ReactNode;
};

/** Label, hint y error. El control lo arma `children` con `{ id, describedBy, invalid }`. */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  labelAs = "label",
  hideLabel,
  className,
  children,
}: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const labelClassName = cn(
    "text-body-small font-medium text-text-primary",
    hideLabel && "sr-only",
  );
  const labelContent = (
    <>
      {label}
      {optional ? (
        <span className="ml-1 font-normal text-text-muted">Opcional</span>
      ) : null}
    </>
  );

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {labelAs === "span" ? (
        <span className={labelClassName}>{labelContent}</span>
      ) : (
        <label htmlFor={fieldId} className={labelClassName}>
          {labelContent}
        </label>
      )}
      {hint ? (
        <p id={hintId} className="text-body-small text-text-secondary">
          {hint}
        </p>
      ) : null}
      {children({ id: fieldId, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} className="text-body-small text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FileFieldProps = {
  name: string;
  label: string;
  hint: string;
  error?: string;
  optional?: boolean;
  hideLabel?: boolean;
  className?: string;
  accept: string;
  preview: "avatar" | "capture" | "none";
  onFileChange: (file: File | null) => void;
};

/** Upload con preview local. `none` = sin thumbnail (p. ej. video). */
export function FileField({
  name,
  label,
  hint,
  error,
  optional,
  hideLabel,
  className,
  accept,
  preview,
  onFileChange,
}: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function clearFile() {
    setFileName(null);
    setObjectUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileChange(null);
  }

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const isVideo = preview === "none";

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      hideLabel={hideLabel}
      labelAs="span"
      className={cn(
        preview === "avatar" || preview === "capture" ? "w-full" : undefined,
        className,
      )}
    >
      {({ id, describedBy, invalid }) => (
        <div className="relative">
        <label
          htmlFor={id}
          className={cn(
            "flex cursor-pointer rounded-md border border-dashed border-border bg-bg-base",
            "hover:border-accent-cyan/70 hover:bg-bg-white-a5",
            preview === "avatar" || preview === "capture"
              ? "relative aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl p-md text-center"
              : "items-center gap-md p-md",
            invalid && "border-destructive",
          )}
        >
          {objectUrl && !isVideo ? (
            // Preview of the file the user just picked (not a remote asset).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={objectUrl}
              alt=""
              className={cn(
                "shrink-0 object-cover",
                preview === "avatar" || preview === "capture"
                  ? "absolute inset-0 size-full"
                  : "h-16 w-24 rounded-sm",
              )}
            />
          ) : (
            <span
              className={cn(
                "text-body text-text-muted",
                isVideo &&
                  "grid size-16 shrink-0 place-items-center rounded-sm bg-bg-surface-3 text-overline",
              )}
            >
              {preview === "avatar"
                ? "Foto"
                : preview === "capture"
                  ? "Captura"
                  : "Video"}
            </span>
          )}
          {isVideo ? (
            <span className="min-w-0 break-all text-body-small text-text-secondary">
              {fileName ?? "Elegí un archivo mp4"}
            </span>
          ) : null}
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            accept={accept}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setFileName(file?.name ?? null);
              setObjectUrl((current) => {
                if (current) {
                  URL.revokeObjectURL(current);
                }
                if (!file || isVideo) {
                  return null;
                }
                return URL.createObjectURL(file);
              });
              onFileChange(file);
            }}
          />
        </label>
        {objectUrl ? (
          <button
            type="button"
            aria-label={preview === "avatar" ? "Quitar foto" : "Quitar captura"}
            className="absolute top-sm right-sm grid size-8 place-items-center rounded-full bg-bg-base text-body text-text-primary shadow-sm"
            onClick={clearFile}
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
        </div>
      )}
    </Field>
  );
}

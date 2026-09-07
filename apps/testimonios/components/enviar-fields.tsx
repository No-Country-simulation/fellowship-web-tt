import { useEffect, useId, useState, type ReactNode } from "react";

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
  className,
  children,
}: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const labelClassName = "text-body-small font-medium text-text-primary";
  const labelContent = (
    <>
      {label}
      {optional ? (
        <span className="ml-1 font-normal text-text-muted">Opcional</span>
      ) : null}
    </>
  );

  return (
    <div className={cn("flex flex-col gap-xs", className)}>
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
  accept: string;
  preview: "avatar" | "capture";
  onFileChange: (file: File | null) => void;
};

/** Upload de imagen con preview local. `preview="avatar"` redondo; `"capture"` rectangular. */
export function FileField({
  name,
  label,
  hint,
  error,
  optional,
  accept,
  preview,
  onFileChange,
}: FileFieldProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      labelAs="span"
    >
      {({ id, describedBy, invalid }) => (
        <label
          htmlFor={id}
          className={cn(
            "flex cursor-pointer items-center gap-md rounded-md border border-dashed border-border bg-bg-base p-md",
            "hover:border-accent-cyan/70 hover:bg-bg-white-a5",
            invalid && "border-destructive",
          )}
        >
          {objectUrl ? (
            // Preview of the file the user just picked (not a remote asset).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={objectUrl}
              alt=""
              className={cn(
                "shrink-0 object-cover",
                preview === "avatar"
                  ? "size-16 rounded-full"
                  : "h-16 w-24 rounded-sm",
              )}
            />
          ) : (
            <span
              className={cn(
                "grid shrink-0 place-items-center bg-bg-surface-3 text-overline text-text-muted",
                preview === "avatar"
                  ? "size-16 rounded-full"
                  : "h-16 w-24 rounded-sm",
              )}
            >
              {preview === "avatar" ? "Foto" : "Demo"}
            </span>
          )}
          <span className="text-body-small text-text-secondary">
            {objectUrl
              ? "Cambiar imagen"
              : "Elegí un archivo jpg, png o webp"}
          </span>
          <input
            id={id}
            name={name}
            type="file"
            accept={accept}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setObjectUrl((current) => {
                if (current) {
                  URL.revokeObjectURL(current);
                }
                return file ? URL.createObjectURL(file) : null;
              });
              onFileChange(file);
            }}
          />
        </label>
      )}
    </Field>
  );
}

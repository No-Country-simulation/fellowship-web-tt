import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Area } from "react-easy-crop";

import { CaptureCropDialog } from "./capture-crop-dialog";
import { cropAvatarFile, cropCaptureFile } from "@/lib/testimonials/prepare-image";
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
    labelledBy: string;
    describedBy?: string;
    invalid: boolean;
  }) => ReactNode;
};

/** Label, hint y error; `children` recibe id, labelledBy, describedBy e invalid. */
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
  const labelId = `${fieldId}-label`;
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
    <div data-field="" className={cn("flex flex-col gap-1", className)}>
      {labelAs === "span" ? (
        <span id={labelId} className={labelClassName}>{labelContent}</span>
      ) : (
        <label id={labelId} htmlFor={fieldId} className={labelClassName}>
          {labelContent}
        </label>
      )}
      {hint ? (
        <p id={hintId} className="text-body-small text-text-secondary">
          {hint}
        </p>
      ) : null}
      {children({ id: fieldId, labelledBy: labelId, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} className="text-body-small text-destructive">
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
  preview: "avatar" | "capture";
  onFileChange: (file: File | null) => void;
  onInvalid?: (message: string | undefined) => void;
};

/** Imagen confirmada con preview local; el reemplazo solo se aplica tras recortarlo. */
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
  onInvalid,
}: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const [cropping, setCropping] = useState(false);
  const objectUrls = useRef(new Set<string>());
  const operation = useRef(0);
  const processing = useRef(false);

  function createObjectUrl(file: File) {
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    return url;
  }

  function clearFile() {
    setObjectUrl(null);
    closeCrop();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileChange(null);
    onInvalid?.(undefined);
    inputRef.current?.focus({ preventScroll: true });
  }

  function closeCrop() {
    operation.current += 1;
    processing.current = false;
    setCropping(false);
    setCropSource(null);
  }

  function cancelCrop() {
    closeCrop();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function confirmCrop(area: Area) {
    if (!cropSource || processing.current) {
      return;
    }
    const currentOperation = operation.current;
    processing.current = true;
    setCropping(true);
    const cropFile = preview === "avatar" ? cropAvatarFile : cropCaptureFile;
    void cropFile(cropSource.file, area)
      .then((prepared) => {
        if (currentOperation !== operation.current) return;
        setObjectUrl(createObjectUrl(prepared));
        onFileChange(prepared);
        closeCrop();
      })
      .catch(() => {
        if (currentOperation !== operation.current) return;
        onInvalid?.("No pudimos recortar la foto.");
        closeCrop();
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      });
  }

  // Liberar solo URLs que el DOM ya dejó de usar; nunca desde un updater.
  useEffect(() => {
    for (const url of objectUrls.current) {
      if (url !== objectUrl && url !== cropSource?.url) {
        URL.revokeObjectURL(url);
        objectUrls.current.delete(url);
      }
    }
  }, [objectUrl, cropSource]);

  useLayoutEffect(() => {
    const urls = objectUrls.current;
    return () => {
      operation.current += 1;
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

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
      {({ id, labelledBy, describedBy, invalid }) => (
        <div className="relative">
        <label
          htmlFor={id}
          className={cn(
            "flex cursor-pointer rounded-md border border-dashed border-border bg-bg-base",
            "hover:border-accent-cyan/70 hover:bg-bg-white-a5",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-accent-cyan",
            preview === "avatar"
              ? "relative aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-2xl p-md text-center"
              : preview === "capture"
                ? "relative aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-md p-md text-center"
                : "items-center gap-md p-md",
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
                "shrink-0",
                preview === "avatar"
                  ? "absolute inset-0 size-full object-cover"
                  : preview === "capture"
                    ? "absolute inset-0 size-full object-cover"
                    : "h-16 w-24 rounded-sm object-cover",
              )}
            />
          ) : (
            <span className="text-body text-text-muted">
              {cropSource
                ? "Recortando…"
                : preview === "avatar"
                  ? "Foto"
                  : "Captura"}
            </span>
          )}
          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            accept={accept}
            aria-labelledby={labelledBy}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              // Permitir elegir el mismo original otra vez, incluso tras cancelar.
              event.target.value = "";
              if (!file) return;
              closeCrop();
              setCropSource({ file, url: createObjectUrl(file) });
            }}
          />
        </label>
        {objectUrl ? (
          <button
            type="button"
            aria-label={preview === "avatar" ? "Quitar foto" : "Quitar captura"}
            className="absolute top-sm right-sm grid size-11 place-items-center rounded-full bg-bg-base text-body text-text-primary shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan"
            onClick={clearFile}
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
        {cropSource ? (
          <CaptureCropDialog
            key={cropSource.url}
            imageUrl={cropSource.url}
            kind={preview}
            confirming={cropping}
            returnFocusRef={inputRef}
            onCancel={cancelCrop}
            onConfirm={confirmCrop}
          />
        ) : null}
        </div>
      )}
    </Field>
  );
}

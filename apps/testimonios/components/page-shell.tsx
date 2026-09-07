import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Ancho del inbox/login admin. Pasarlo como `className` de `PageShell`. */
export const adminShellClassName = "max-w-content";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  titleStart?: ReactNode;
  titleAddon?: ReactNode;
  description?: string;
  children?: ReactNode;
  className?: string;
  /** Centra el bloque en el viewport (login). */
  centered?: boolean;
};

/** `<main>` de página: eyebrow, H1 y cuerpo. Un solo por ruta. */
export function PageShell({
  eyebrow,
  title,
  titleStart,
  titleAddon,
  description,
  children,
  className,
  centered = false,
}: PageShellProps) {
  return (
    <main
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-md py-md",
        centered && "items-center justify-center",
      )}
    >
      <div
        className={cn(
          centered ? "w-full max-w-sm" : "container-content max-w-3xl",
          className,
        )}
      >
        {eyebrow ? (
          <p className="text-overline text-text-secondary">{eyebrow}</p>
        ) : null}
        <div
          className={cn(
            "mt-xs flex flex-wrap items-center gap-sm",
            centered && "justify-center",
          )}
        >
          {titleStart}
          <h1 className="text-heading-3 text-text-primary">{title}</h1>
          {titleAddon}
        </div>
        {description ? (
          <p className="mt-sm ml-auto text-body-large text-text-secondary">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </main>
  );
}

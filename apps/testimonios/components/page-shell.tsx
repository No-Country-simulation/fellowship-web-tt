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
}: PageShellProps) {
  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-md py-md">
      <div className={cn("container-content max-w-3xl", className)}>
        {eyebrow ? (
          <p className="text-overline text-text-secondary">{eyebrow}</p>
        ) : null}
        <div className="mt-xs flex flex-wrap items-center gap-sm">
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

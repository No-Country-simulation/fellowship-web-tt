import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  variant?: "default" | "featured";
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** `<main>` en el flujo del documento. `featured` destaca el encabezado; `actions` admite CTAs. */
export function PageShell({
  eyebrow,
  title,
  description,
  variant = "default",
  actions,
  children,
  className,
}: PageShellProps) {
  const featured = variant === "featured";

  return (
    <main className="flex min-w-0 flex-1 flex-col px-md py-md">
      <div className={cn("container-content max-w-3xl", className)}>
        {eyebrow ? (
          <p
            className={
              featured
                ? "type-eyebrow text-text-secondary"
                : "text-overline text-text-secondary"
            }
          >
            {eyebrow}
          </p>
        ) : null}
        <div
          className={
            featured
              ? "mt-xs flex min-w-0 flex-col items-start gap-sm md:flex-row md:items-center md:justify-between"
              : "mt-xs flex flex-wrap items-center gap-sm"
          }
        >
          <h1
            className={
              featured
                ? "type-section min-w-0 text-text-primary"
                : "text-heading-3 text-text-primary"
            }
          >
            {title}
          </h1>
          {actions ? (
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-xs md:shrink-0">
              {actions}
            </div>
          ) : null}
        </div>
        {description ? (
          <p
            className={
              featured
                ? "mt-sm max-w-[45rem] text-body-large text-text-secondary"
                : "mt-sm ml-auto text-body-large text-text-secondary"
            }
          >
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </main>
  );
}

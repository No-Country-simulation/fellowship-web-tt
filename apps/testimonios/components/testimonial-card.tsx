import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type TestimonialCardProps = {
  name: string;
  typeLabel: string;
  quote: string;
  avatarUrl: string;
  href?: string;
  footer?: ReactNode;
  cta?: string;
  lineClamp?: 2 | 3 | 4 | 5 | 6;
  className?: string;
};

const LINE_CLAMP_CLASS = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
} as const;

/** Card de testimonio. Con `href`, enlace con hover y foco de teclado; sin `href`, bloque informativo. */
export function TestimonialCard({
  name,
  typeLabel,
  quote,
  avatarUrl,
  href,
  footer,
  cta,
  lineClamp,
  className,
}: TestimonialCardProps) {
  const clamp = lineClamp ?? (href ? 3 : undefined);

  const content = (
    <>
      <div className="flex min-w-0 shrink-0 items-center gap-sm">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-bg-surface-3">
          <Image
            src={avatarUrl}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 w-0 flex-1">
          <p className="type-eyebrow text-text-secondary">{typeLabel}</p>
          <p className="truncate text-base font-semibold text-text-primary">
            {name}
          </p>
        </div>
      </div>
      <blockquote
        className={cn(
          "mt-sm min-w-0 overflow-hidden wrap-anywhere text-base leading-relaxed text-text-secondary",
          clamp && LINE_CLAMP_CLASS[clamp],
        )}
      >
        “{quote}”
      </blockquote>
      {cta ? (
        <p className="mt-sm shrink-0 text-body-small text-accent-cyan">{cta}</p>
      ) : null}
      {footer ? (
        <p className="mt-auto shrink-0 pt-sm text-overline text-text-muted">
          {footer}
        </p>
      ) : null}
    </>
  );

  const classes = cn(
    "flex min-w-0 flex-col rounded-card border border-border bg-card p-md",
    href && [
      "h-full transition-[border-color,box-shadow,translate] duration-200 ease-out",
      "group-hover/card:border-accent-cyan/70 group-hover/card:shadow-card-hover motion-safe:group-hover/card:-translate-y-1",
      "focus-visible:border-accent-cyan focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-cyan",
      "motion-reduce:transition-none",
    ],
  );

  if (href) {
    return (
      <article className={cn("group/card h-full min-w-0", className)}>
        <Link href={href} className={cn(classes, "h-full")}>
          {content}
        </Link>
      </article>
    );
  }

  return <article className={cn(classes, className)}>{content}</article>;
}

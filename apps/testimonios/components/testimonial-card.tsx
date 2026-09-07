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

/** Card de testimonio: avatar, tipo, nombre y quote. Con `href` es un link. */
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
        <div className="min-w-0">
          <p className="text-overline text-text-secondary">{typeLabel}</p>
          <p className="truncate text-body font-medium text-text-primary">
            {name}
          </p>
        </div>
      </div>
      <blockquote
        className={cn(
          "mt-sm min-w-0 overflow-hidden break-words text-body-small leading-normal text-text-secondary",
          clamp ? LINE_CLAMP_CLASS[clamp] : "text-body",
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
    "flex min-w-0 flex-col rounded-md border border-border bg-card p-md",
    href && "h-full transition-colors hover:border-accent-cyan/70",
  );

  if (href) {
    return (
      <article className={cn("h-full min-w-0", className)}>
        <Link href={href} className={cn(classes, "h-full")}>
          {content}
        </Link>
      </article>
    );
  }

  return <article className={cn(classes, className)}>{content}</article>;
}

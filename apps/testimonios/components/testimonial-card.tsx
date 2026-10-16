import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
  variant?: "default" | "gallery";
};

const LINE_CLAMP_CLASS = {
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
} as const;

/** Card con enlace opcional. `gallery` separa la categoría y destaca la acción; el default conserva la ficha. */
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
  variant = "default",
}: TestimonialCardProps) {
  const clamp = lineClamp ?? (href ? 3 : undefined);
  const gallery = variant === "gallery";
  const category = (
    <p className="type-eyebrow text-text-secondary">{typeLabel}</p>
  );

  const content = (
    <>
      {gallery ? category : null}
      <div
        className={cn(
          "flex min-w-0 shrink-0 items-center gap-sm",
          gallery && "mt-sm",
        )}
      >
        <div
          className={cn(
            "relative size-14 shrink-0 overflow-hidden rounded-full bg-bg-surface-3",
            gallery && "size-11",
          )}
        >
          <Image
            src={avatarUrl}
            alt=""
            fill
            sizes={gallery ? "44px" : "56px"}
            className="object-cover"
          />
        </div>
        <div className="min-w-0 w-0 flex-1">
          {gallery ? null : category}
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
        <p
          className={
            gallery
              ? "mt-auto flex shrink-0 items-center gap-xs pt-sm text-sm font-semibold text-accent-cyan"
              : "mt-sm shrink-0 text-body-small text-accent-cyan"
          }
        >
          {cta}
          {gallery ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
        </p>
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
    gallery && "min-h-[17rem]",
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

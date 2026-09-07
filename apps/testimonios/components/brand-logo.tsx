import type { ComponentProps, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** Ancho visual. Default header 152. */
  width?: number;
  priority?: boolean;
  loading?: "eager" | "lazy";
  children?: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "children">;

/** Wordmark No Country. Siempre linkea a `/`. */
function BrandLogo({
  className,
  width = 152,
  priority = false,
  loading,
  children,
  ...props
}: BrandLogoProps) {
  const height = Math.round((width * 32) / 190);

  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center gap-sm", className)}
      {...props}
    >
      <Image
        src="/brand/logo-no-country.png"
        alt="No Country"
        width={width}
        height={height}
        priority={priority}
        loading={priority ? undefined : loading}
        className="h-auto max-w-full"
      />
      {children}
    </Link>
  );
}

export { BrandLogo };
export type { BrandLogoProps };

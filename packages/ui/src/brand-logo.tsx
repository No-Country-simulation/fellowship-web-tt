import type { ComponentProps, ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

import { cn } from "./utils"

type BrandLogoProps = {
  className?: string
  /** Ancho visual. Default header 152. */
  width?: number
  priority?: boolean
  loading?: "eager" | "lazy"
  /** Path en `public/` de la app. Default: wordmark PNG. */
  src?: string
  children?: ReactNode
} & Omit<ComponentProps<typeof Link>, "href" | "children">

/**
 * Wordmark No Country. Siempre linkea a `/`.
 *
 * Docs: `packages/ui/docs/brand-logo.md`
 *
 * @example
 * <BrandLogo loading="eager" />
 */
function BrandLogo({
  className,
  width = 152,
  priority = false,
  loading,
  src = "/brand/logo-no-country.png",
  children,
  ...props
}: BrandLogoProps) {
  const height = Math.round((width * 32) / 190)

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0",
        children && "items-center gap-sm",
        className
      )}
      {...props}
    >
      <Image
        src={src}
        alt="No Country"
        width={width}
        height={height}
        priority={priority}
        loading={priority ? undefined : loading}
        className="h-auto max-w-full"
      />
      {children}
    </Link>
  )
}

export { BrandLogo }
export type { BrandLogoProps }

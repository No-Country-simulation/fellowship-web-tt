import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
  /** Ancho visual. Default header 152. */
  width?: number
  priority?: boolean
  loading?: "eager" | "lazy"
}

/**
 * Wordmark NoCountry (HF Desktop 1440).
 */
function BrandLogo({
  className,
  width = 152,
  priority = false,
  loading,
}: BrandLogoProps) {
  const height = Math.round((width * 32) / 190)

  return (
    <Link href="/" className={cn("inline-flex shrink-0", className)}>
      <Image
        src="/brand/logo-no-country.svg"
        alt="No Country"
        width={width}
        height={height}
        priority={priority}
        loading={priority ? undefined : loading}
        className="h-auto max-w-full"
        unoptimized
      />
    </Link>
  )
}

export { BrandLogo }
export type { BrandLogoProps }

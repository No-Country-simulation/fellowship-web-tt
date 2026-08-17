import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
  /** Ancho visual. Default header 152. */
  width?: number
  priority?: boolean
}

/**
 * Wordmark NoCountry (HF Desktop 1440).
 */
function BrandLogo({
  className,
  width = 152,
  priority = false,
}: BrandLogoProps) {
  const height = Math.round((width * 64) / 380)

  return (
    <Link href="/" className={cn("inline-flex shrink-0", className)}>
      <Image
        src="/brand/nocountry-logo.png"
        alt="No Country"
        width={width}
        height={height}
        priority={priority}
        className="h-auto max-w-full"
      />
    </Link>
  )
}

export { BrandLogo }
export type { BrandLogoProps }

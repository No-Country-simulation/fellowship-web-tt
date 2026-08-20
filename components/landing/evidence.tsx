import Image from "next/image"
import {
  BarChart3Icon,
  FileCheckIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Section } from "@/components/section"
import {
  evidenceHeading,
  evidenceItems,
  evidencePreviews,
} from "@/lib/landing"
import { cn } from "@/lib/utils"

const featureIcons = [
  BarChart3Icon,
  RefreshCwIcon,
  ShieldCheckIcon,
  FileCheckIcon,
] as const

const featureIconWrap = [
  "bg-accent-cyan/10 text-accent-cyan",
  "bg-accent-cyan/10 text-accent-cyan",
  "bg-accent-indigo/10 text-accent-indigo-light",
  "bg-accent-indigo/10 text-accent-indigo-light",
] as const

/**
 * Evidencia HF: H2, 4 cards con icono y capturas de métricas + feedback.
 */
function Evidence() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="evidencia">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 mx-auto max-w-4xl text-center text-pretty text-text-primary">
          {evidenceHeading}
        </h2>

        <div className="grid min-w-0 gap-md sm:grid-cols-2 lg:grid-cols-4 lg:*:min-w-0">
          {evidenceItems.map((item, index) => {
            const Icon = featureIcons[index]

            return (
              <article
                key={item.title}
                className="flex min-w-0 flex-col gap-sm rounded-md border border-border/60 bg-bg-surface-1/70 p-md backdrop-blur-sm"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-md",
                    featureIconWrap[index]
                  )}
                >
                  <Icon className="size-5 stroke-[1.5]" />
                </span>
                <h3 className="text-heading-3 text-text-primary">
                  {item.title}
                </h3>
                <p className="text-body text-text-secondary">{item.body}</p>
              </article>
            )
          })}
        </div>

        <div className="flex min-w-0 flex-col gap-md rounded-lg border border-accent-cyan/50 bg-accent-cyan/10 p-md md:gap-lg md:p-lg">
          <EvidencePreview
            preview={evidencePreviews.metrics}
            sizes="100vw"
          />
          <div className="grid min-w-0 gap-md md:grid-cols-2 md:gap-lg md:*:min-w-0">
            <EvidencePreview
              preview={evidencePreviews.strengths}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <EvidencePreview
              preview={evidencePreviews.improvements}
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </div>
    </Section>
  )
}

function EvidencePreview({
  preview,
  sizes,
}: {
  preview: (typeof evidencePreviews)[keyof typeof evidencePreviews]
  sizes: string
}) {
  return (
    <figure className="min-w-0 overflow-hidden rounded-md">
      <Image
        src={preview.src}
        alt={preview.alt}
        width={preview.width}
        height={preview.height}
        className="h-auto w-full"
        sizes={sizes}
        unoptimized
      />
    </figure>
  )
}

export { Evidence }

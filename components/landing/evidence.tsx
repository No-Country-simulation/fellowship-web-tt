import Image from "next/image"

import { Section } from "@/components/section"
import {
  evidenceHeading,
  evidenceItems,
  evidencePreviews,
} from "@/lib/landing"
import { cn } from "@/lib/utils"

const accents = [
  "bg-accent-cyan",
  "bg-accent-mint",
  "bg-accent-indigo-light",
  "bg-accent-yellow",
] as const

/**
 * Evidencia HF: H2 centrado, 4 cards con acento, conector y capturas de producto.
 */
function Evidence() {
  const [
    peerReviewPreview,
    strengthsPreview,
    improvementsPreview,
    metricsPreview,
  ] = evidencePreviews

  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="evidencia">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 mx-auto max-w-4xl text-center text-pretty text-text-primary">
          {evidenceHeading}
        </h2>

        <div className="grid min-w-0 gap-md sm:grid-cols-2 lg:grid-cols-4 lg:*:min-w-0">
          {evidenceItems.map((item, index) => (
            <article
              key={item.title}
              className="flex min-w-0 flex-col gap-sm rounded-md bg-bg-surface-1/70 p-md backdrop-blur-sm"
            >
              <span
                aria-hidden
                className={cn("size-6 shrink-0 rounded-full", accents[index])}
              />
              <h3 className="text-heading-3 text-text-primary">{item.title}</h3>
              <p className="text-body text-text-secondary">{item.body}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-col">
          <EvidenceConnector />
          <div className="grid min-w-0 items-start gap-md lg:grid-cols-3 lg:*:min-w-0">
            <div className="flex min-w-0 flex-col gap-md lg:col-span-2">
              <EvidencePreview
                preview={peerReviewPreview}
                sizes="(min-width: 1024px) 66vw, 100vw"
              />
              <EvidencePreview
                preview={metricsPreview}
                sizes="(min-width: 1024px) 66vw, 100vw"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-md">
              <EvidencePreview
                preview={strengthsPreview}
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
              <EvidencePreview
                preview={improvementsPreview}
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

function EvidencePreview({
  preview,
  sizes,
  className,
}: {
  preview: (typeof evidencePreviews)[number]
  sizes: string
  className?: string
}) {
  return (
    <figure
      className={cn(
        "min-w-0 rounded-md border border-accent-cyan/50 bg-accent-cyan/10 p-sm",
        className
      )}
    >
      <Image
        src={preview.src}
        alt={preview.alt}
        width={preview.width}
        height={preview.height}
        className="h-auto w-full rounded-sm"
        sizes={sizes}
        unoptimized
      />
    </figure>
  )
}

function EvidenceConnector() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 80"
      className="hidden h-16 w-full text-text-muted lg:block"
      fill="none"
    >
      <path
        d="M600 0 V22"
        stroke="currentColor"
        strokeDasharray="2.5 5"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M600 22 C600 52 400 36 400 80"
        stroke="currentColor"
        strokeDasharray="2.5 5"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M600 22 C600 52 1000 36 1000 80"
        stroke="currentColor"
        strokeDasharray="2.5 5"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export { Evidence }

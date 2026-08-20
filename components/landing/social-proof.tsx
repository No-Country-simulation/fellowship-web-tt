"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Section } from "@/components/section"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  socialProofEyebrow,
  socialProofHeading,
  socialProofQuotes,
  socialProofStats,
} from "@/lib/landing"
import { cn } from "@/lib/utils"

type SocialProofQuote = (typeof socialProofQuotes)[number]

/**
 * Caso de éxito HF: pill + H2, testimonial en card con carrusel y dos métricas.
 */
function SocialProof() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="casos">
      <div className="flex flex-col gap-xl">
        <div className="flex flex-col items-center gap-sm text-center">
          <SectionEyebrow className="text-accent-cyan">
            {socialProofEyebrow}
          </SectionEyebrow>
          <h2 className="text-heading-2 max-w-4xl text-pretty text-text-primary">
            {socialProofHeading}
          </h2>
        </div>

        <div className="grid min-w-0 items-stretch gap-md lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:*:min-w-0">
          <TestimonialCarousel quotes={socialProofQuotes} />

          <div className="grid min-w-0 gap-md sm:grid-cols-2 lg:grid-cols-1 lg:*:min-w-0">
            {socialProofStats.map((stat) => (
              <article
                key={stat.label}
                className="flex min-w-0 flex-col justify-center gap-sm rounded-md border border-accent-cyan/50 bg-bg-surface-1/40 bg-brand-gradient-secondary p-md backdrop-blur-sm"
              >
                <p className="text-heading-2 text-text-primary">{stat.value}</p>
                <p className="text-data-label text-pretty text-text-primary">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function TestimonialCarousel({
  quotes,
}: {
  quotes: readonly SocialProofQuote[]
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const quoteCount = quotes.length
  const quote = quotes[activeIndex]

  if (!quote) {
    return null
  }

  function goTo(index: number) {
    setActiveIndex((index + quoteCount) % quoteCount)
  }

  return (
    <article
      aria-label="Testimonios de casos de éxito"
      aria-roledescription="carrusel"
      className="flex min-w-0 flex-col gap-md rounded-md border border-border bg-bg-surface-1 p-md"
    >
      <TestimonialCard quote={quote} index={activeIndex} total={quoteCount} />

      <div className="mt-auto flex items-center justify-between gap-sm">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Testimonio anterior"
          className="size-10 border-text-primary/40 bg-transparent text-text-primary hover:bg-text-primary/10"
          onClick={() => goTo(activeIndex - 1)}
        >
          <ChevronLeftIcon />
        </Button>

        <div className="flex items-center gap-xs">
          {quotes.map((item, index) => {
            const isActive = index === activeIndex

            return (
              <button
                key={item.name}
                type="button"
                aria-label={`Ir al testimonio ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all",
                  isActive
                    ? "w-6 bg-accent-cyan"
                    : "w-2 bg-text-muted hover:bg-text-secondary"
                )}
                onClick={() => goTo(index)}
              />
            )
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Testimonio siguiente"
          className="size-10 border-text-primary/40 bg-transparent text-text-primary hover:bg-text-primary/10"
          onClick={() => goTo(activeIndex + 1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </article>
  )
}

function TestimonialCard({
  quote,
  index,
  total,
}: {
  quote: SocialProofQuote
  index: number
  total: number
}) {
  return (
    <figure
      aria-live="polite"
      aria-atomic="true"
      className="flex min-w-0 flex-1 flex-col gap-md"
    >
      <QuoteAvatar avatar={quote.avatar} />

      <blockquote className="text-heading-3 font-normal text-pretty text-text-primary">
        “{quote.quote}”
      </blockquote>

      <Separator className="bg-text-primary/40" />

      <figcaption className="flex min-w-0 flex-wrap items-center justify-between gap-md">
        <div className="flex min-w-0 flex-col gap-1">
          <cite className="text-body font-semibold not-italic text-text-primary">
            {quote.name}
          </cite>
          <p className="text-body-small text-text-secondary">{quote.role}</p>
        </div>
        <div className="flex h-12 shrink-0 items-center justify-center rounded-full border border-accent-cyan/40 px-md">
          <Image
            src={encodeURI(quote.logo.src)}
            alt={quote.logo.alt}
            width={quote.logo.width}
            height={quote.logo.height}
            unoptimized
            className="h-8 w-auto max-w-none object-contain"
          />
        </div>
      </figcaption>

      <p className="sr-only">
        Testimonio {index + 1} de {total}
      </p>
    </figure>
  )
}

function QuoteAvatar({ avatar }: { avatar: SocialProofQuote["avatar"] }) {
  return (
    <Image
      src={avatar.src}
      alt=""
      width={avatar.width}
      height={avatar.height}
      unoptimized
      className="size-14 rounded-full object-cover"
    />
  )
}

export { SocialProof }

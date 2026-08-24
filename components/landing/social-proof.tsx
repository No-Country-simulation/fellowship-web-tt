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
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const quoteCount = quotes.length

  function goTo(index: number) {
    const nextIndex = (index + quoteCount) % quoteCount

    if (nextIndex === activeIndex) {
      return
    }

    const stepsForward = (nextIndex - activeIndex + quoteCount) % quoteCount
    setDirection(stepsForward <= quoteCount / 2 ? 1 : -1)
    setOutgoingIndex(activeIndex)
    setActiveIndex(nextIndex)
  }

  return (
    <article
      aria-label="Testimonios de casos de éxito"
      aria-roledescription="carrusel"
      className="flex h-full min-w-0 flex-col gap-md rounded-md border border-border p-md"
    >
      <div className="grid min-w-0 flex-1 overflow-hidden">
        {quotes.map((item, index) => (
          <TestimonialCard
            key={item.name}
            quote={item}
            index={index}
            total={quoteCount}
            inactive={index !== activeIndex}
            outgoing={index === outgoingIndex}
            entering={index === activeIndex && outgoingIndex !== null}
            direction={direction}
          />
        ))}
      </div>

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
  inactive,
  outgoing,
  entering,
  direction,
}: {
  quote: SocialProofQuote
  index: number
  total: number
  inactive: boolean
  outgoing: boolean
  entering: boolean
  direction: 1 | -1
}) {
  return (
    <figure
      aria-live={inactive ? undefined : "polite"}
      aria-atomic={inactive ? undefined : "true"}
      aria-hidden={inactive || undefined}
      className={cn(
        "col-start-1 row-start-1 flex min-w-0 flex-col gap-md duration-300 ease-out motion-reduce:animate-none motion-reduce:translate-x-0",
        (inactive || outgoing) && "pointer-events-none",
        !inactive && !entering && "z-10 opacity-100",
        inactive && !outgoing && "opacity-0",
        outgoing &&
          (direction === 1
            ? "z-0 animate-out fade-out-0 slide-out-to-left-4 fill-mode-forwards motion-reduce:opacity-0"
            : "z-0 animate-out fade-out-0 slide-out-to-right-4 fill-mode-forwards motion-reduce:opacity-0"),
        entering &&
          (direction === 1
            ? "z-10 animate-in fade-in-0 slide-in-from-right-4 motion-reduce:opacity-100"
            : "z-10 animate-in fade-in-0 slide-in-from-left-4 motion-reduce:opacity-100")
      )}
    >
      <QuoteAvatar avatar={quote.avatar} />

      <blockquote className="flex-1 text-heading-3 font-normal text-pretty text-text-primary">
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
        <Image
          src={encodeURI(quote.logo.src)}
          alt={quote.logo.alt}
          width={quote.logo.width}
          height={quote.logo.height}
          unoptimized
          className="h-8 w-auto max-w-none object-contain"
        />
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

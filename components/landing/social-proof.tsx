"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Section } from "@/components/section"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { Button } from "@/components/ui/button"
import {
  socialProofEyebrow,
  socialProofHeading,
  socialProofQuotes,
} from "@/lib/landing"
import { cn } from "@/lib/utils"

type SocialProofQuote = (typeof socialProofQuotes)[number]

const MOBILE_PAGE_SIZE = 1
const DESKTOP_PAGE_SIZE = 2
const DESKTOP_CAROUSEL_QUERY = "(min-width: 768px)"

/**
 * Testimonios HF: pill + H2, carrusel de 2 cards (1 en mobile).
 * Mobile: flechas debajo de la card, atribución centrada. Desktop: flechas laterales.
 */
function SocialProof() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="testimonios">
      <div className="flex flex-col gap-xl">
        <div className="flex flex-col items-center gap-sm text-center">
          <SectionEyebrow className="text-accent-cyan">
            {socialProofEyebrow}
          </SectionEyebrow>
          <h2 className="text-heading-2 max-w-4xl text-pretty text-text-primary">
            {socialProofHeading}
          </h2>
        </div>

        <TestimonialCarousel quotes={socialProofQuotes} />
      </div>
    </Section>
  )
}

function useCarouselPageSize() {
  const [pageSize, setPageSize] = useState(DESKTOP_PAGE_SIZE)

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_CAROUSEL_QUERY)

    function updatePageSize() {
      setPageSize(media.matches ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE)
    }

    updatePageSize()
    media.addEventListener("change", updatePageSize)

    return () => media.removeEventListener("change", updatePageSize)
  }, [])

  return pageSize
}

function paginateQuotes(
  quotes: readonly SocialProofQuote[],
  pageSize: number
) {
  const pages: SocialProofQuote[][] = []

  for (let index = 0; index < quotes.length; index += pageSize) {
    pages.push([...quotes.slice(index, index + pageSize)])
  }

  return pages
}

function TestimonialCarousel({
  quotes,
}: {
  quotes: readonly SocialProofQuote[]
}) {
  const pageSize = useCarouselPageSize()
  const pages = paginateQuotes(quotes, pageSize)
  const pageCount = Math.max(pages.length, 1)
  const [activeIndex, setActiveIndex] = useState(0)
  const [outgoingIndex, setOutgoingIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)
  const pageIndex = Math.min(activeIndex, pageCount - 1)
  const outgoingPage =
    outgoingIndex !== null && outgoingIndex < pageCount ? outgoingIndex : null

  function goTo(index: number) {
    const nextIndex = (index + pageCount) % pageCount

    if (nextIndex === pageIndex) {
      return
    }

    const stepsForward = (nextIndex - pageIndex + pageCount) % pageCount
    setDirection(stepsForward <= pageCount / 2 ? 1 : -1)
    setOutgoingIndex(pageIndex)
    setActiveIndex(nextIndex)
  }

  const navButtonClassName =
    "size-10 shrink-0 border-border bg-transparent text-text-primary hover:bg-text-primary/10"

  return (
    <div
      aria-label="Testimonios"
      aria-roledescription="carrusel"
      className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-sm gap-y-md md:gap-x-md"
    >
      <div className="col-span-3 grid min-w-0 overflow-hidden md:col-span-1 md:col-start-2 md:row-start-1">
        {pages.map((pageQuotes, index) => (
          <TestimonialPage
            key={pageQuotes.map((item) => item.name).join("-")}
            quotes={pageQuotes}
            index={index}
            total={pageCount}
            inactive={index !== pageIndex}
            outgoing={index === outgoingPage}
            entering={index === pageIndex && outgoingPage !== null}
            direction={direction}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Testimonios anteriores"
        className={cn(navButtonClassName, "col-start-1 row-start-2 md:row-start-1")}
        onClick={() => goTo(pageIndex - 1)}
      >
        <ChevronLeftIcon />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Testimonios siguientes"
        className={cn(
          navButtonClassName,
          "col-start-3 row-start-2 md:col-start-3 md:row-start-1"
        )}
        onClick={() => goTo(pageIndex + 1)}
      >
        <ChevronRightIcon />
      </Button>

      <div className="col-start-2 row-start-2 flex items-center justify-center gap-xs md:col-span-3 md:col-start-1">
        {pages.map((pageQuotes, index) => {
          const isActive = index === pageIndex

          return (
            <button
              key={pageQuotes.map((item) => item.name).join("-")}
              type="button"
              aria-label={`Ir a la página ${index + 1} de testimonios`}
              aria-current={isActive ? "true" : undefined}
              className="group flex size-6 items-center justify-center"
              onClick={() => goTo(index)}
            >
              <span
                aria-hidden
                className={cn(
                  "rounded-full transition-all",
                  isActive
                    ? "h-2 w-6 bg-accent-cyan"
                    : "size-2 bg-text-muted group-hover:bg-text-secondary"
                )}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TestimonialPage({
  quotes,
  index,
  total,
  inactive,
  outgoing,
  entering,
  direction,
}: {
  quotes: SocialProofQuote[]
  index: number
  total: number
  inactive: boolean
  outgoing: boolean
  entering: boolean
  direction: 1 | -1
}) {
  return (
    <div
      aria-label={`Página ${index + 1} de ${total}`}
      aria-live={inactive ? undefined : "polite"}
      aria-atomic={inactive ? undefined : "true"}
      aria-hidden={inactive || undefined}
      className={cn(
        "col-start-1 row-start-1 grid min-w-0 grid-cols-1 gap-md duration-300 ease-out motion-reduce:animate-none motion-reduce:translate-x-0 md:grid-cols-2 md:*:min-w-0",
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
      {quotes.map((quote) => (
        <TestimonialCard key={quote.name} quote={quote} />
      ))}
    </div>
  )
}

function TestimonialCard({ quote }: { quote: SocialProofQuote }) {
  return (
    <figure className="flex h-full min-w-0 flex-col gap-md rounded-md border border-border bg-transparent p-md">
      <Image
        src={quote.avatar.src}
        alt=""
        width={quote.avatar.width}
        height={quote.avatar.height}
        unoptimized
        className="mx-auto size-20 rounded-full object-cover"
      />

      <blockquote className="flex-1 text-center text-body-large font-normal text-pretty text-text-primary">
        “{quote.quote}”
      </blockquote>

      <figcaption className="mt-auto flex min-w-0 flex-col items-center gap-sm border-t border-border pt-md text-center md:flex-row md:items-end md:justify-between md:gap-md md:border-t-0 md:pt-0 md:text-left">
        <div className="flex min-w-0 flex-col gap-1">
          <cite className="text-body-large font-semibold not-italic text-text-primary">
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
          className="h-8 w-auto max-w-28 shrink-0 object-contain sm:max-w-none"
        />
      </figcaption>
    </figure>
  )
}

export { SocialProof }

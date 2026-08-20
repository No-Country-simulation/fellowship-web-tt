import { CheckIcon, ChevronRightIcon, XIcon } from "lucide-react"
import Image from "next/image"

import { Section } from "@/components/section"
import { SectionEyebrow } from "@/components/section-eyebrow"
import {
  differentialContrasts,
  differentialHeading,
  differentialNoCountryItems,
  differentialTraditionalItems,
} from "@/lib/landing"
import { cn } from "@/lib/utils"

/**
 * Comparativa HF: card tradicional, columna de contraste y card No Country.
 */
function Differential() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="diferencial">
      <div className="flex flex-col items-center">
        <div className="mb-xl flex flex-col items-center gap-sm text-center">
          <SectionEyebrow>El diferencial</SectionEyebrow>
          <h2 className="text-heading-2 max-w-3xl text-pretty text-text-primary">
            {differentialHeading}
          </h2>
        </div>

        <div className="grid w-full min-w-0 items-stretch gap-md lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-lg">
          <ComparisonCard
            title="CV o entrevista tradicional"
            items={differentialTraditionalItems}
            tone="negative"
          />
          <ContrastColumn />
          <ComparisonCard
            items={differentialNoCountryItems}
            tone="positive"
          />
        </div>
      </div>
    </Section>
  )
}

function ContrastColumn() {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-sm lg:w-72">
      <p className="text-overline text-text-secondary">El contraste</p>
      <ul className="flex w-full flex-col gap-sm">
        {differentialContrasts.map((item) => (
          <li
            key={`${item.from}-${item.to}`}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-xs rounded-md bg-bg-surface-3 px-md py-sm"
          >
            <span className="text-overline text-left text-text-secondary">
              {item.from}
            </span>
            <ChevronRightIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-accent-cyan"
            />
            <span className="text-overline text-right text-text-primary">{item.to}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ComparisonCard({
  title,
  items,
  tone,
}: {
  title?: string
  items: readonly string[]
  tone: "negative" | "positive"
}) {
  const Icon = tone === "positive" ? CheckIcon : XIcon

  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col justify-start gap-md rounded-md bg-bg-surface-1 p-md backdrop-blur-sm",
        tone === "positive"
          ? "border-2 border-solid border-accent-cyan"
          : "border-2 border-solid border-transparent"
      )}
    >
      {title ? (
        <h3 className="text-heading-3 text-text-primary">{title}</h3>
      ) : (
        <h3>
          <Image
            src="/brand/logo-no-country.svg"
            alt="No Country"
            width={152}
            height={26}
            unoptimized
            className="h-auto w-38 max-w-full"
          />
        </h3>
      )}
      <ul className="flex flex-col gap-sm">
        {items.map((item) => (
          <li
            key={item}
            className="flex min-w-0 gap-sm text-body text-text-secondary"
          >
            <Icon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 stroke-[1.5] text-text-primary"
            />
            <span className="min-w-0 text-pretty">{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export { Differential }

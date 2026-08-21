import type { ReactNode } from "react"
import {
  BarChart3Icon,
  FileCheckIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  StarIcon,
  TrendingDownIcon,
} from "lucide-react"

import { Section } from "@/components/section"
import {
  evidenceHeading,
  evidenceImprovements,
  evidenceItems,
  evidenceMetricHighlights,
  evidenceMetricStats,
  evidenceStrengths,
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
 * Evidencia HF: H2, 4 cards con icono y panel compacto de métricas + feedback.
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

        <div className="flex min-w-0 flex-col gap-md rounded-lg border border-border bg-bg-surface-1/70 p-md backdrop-blur-sm">
          <EvidenceMetrics />
          <EvidenceFeedback />
        </div>
      </div>
    </Section>
  )
}

function EvidenceMetrics() {
  const metrics = [
    ...evidenceMetricHighlights.map((item) => ({
      key: item.label,
      value: item.value,
      suffix: item.suffix,
      label: item.label,
      starred: "starred" in item && Boolean(item.starred),
    })),
    ...evidenceMetricStats.map((item) => ({
      key: item.label,
      value: item.value,
      suffix: undefined as string | undefined,
      label: item.label,
      starred: false,
    })),
  ]

  return (
    <div className="grid min-w-0 grid-cols-2 gap-xs sm:grid-cols-3 lg:grid-cols-6">
      {metrics.map((item) => (
        <article
          key={item.key}
          className="flex min-w-0 flex-col justify-center rounded-md bg-bg-surface-4 px-sm py-sm"
        >
          <p className="flex min-h-8 min-w-0 items-baseline gap-1">
            <span className="text-heading-3 tabular-nums text-text-primary">
              {item.value}
            </span>
            {item.starred ? (
              <StarIcon
                aria-hidden
                className="size-3.5 shrink-0 fill-accent-yellow text-accent-yellow"
              />
            ) : null}
            {item.suffix ? (
              <span className="text-body-small text-text-muted">{item.suffix}</span>
            ) : null}
          </p>
          <p className="text-body-small text-pretty text-text-muted">{item.label}</p>
        </article>
      ))}
    </div>
  )
}

function FeedbackColumn({
  title,
  icon,
  iconClassName,
  items,
}: {
  title: string
  icon: ReactNode
  iconClassName: string
  items: readonly { quote: string; source: string }[]
}) {
  return (
    <div className="flex min-w-0 flex-col gap-xs">
      <div className="flex items-center gap-xs">
        <span
          aria-hidden
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md border",
            iconClassName
          )}
        >
          {icon}
        </span>
        <h3 className="text-body font-semibold text-text-primary">{title}</h3>
      </div>
      {items.map((item) => (
        <blockquote
          key={item.quote}
          className="rounded-md bg-bg-surface-4 px-sm py-xs"
        >
          <p className="text-body-small text-pretty text-text-primary">
            “{item.quote}”
          </p>
          <footer className="mt-1 text-overline font-normal tracking-normal text-text-muted normal-case">
            {item.source}
          </footer>
        </blockquote>
      ))}
    </div>
  )
}

function EvidenceFeedback() {
  return (
    <div className="grid min-w-0 gap-md md:grid-cols-2 md:*:min-w-0">
      <FeedbackColumn
        title="Áreas de fortaleza"
        iconClassName="border-accent-mint/40 bg-accent-mint/10"
        icon={<StarIcon className="size-3.5 fill-accent-mint text-accent-mint" />}
        items={evidenceStrengths.slice(0, 2)}
      />
      <FeedbackColumn
        title="Áreas de mejora"
        iconClassName="border-accent-yellow/40 bg-accent-yellow/10"
        icon={<TrendingDownIcon className="size-3.5 text-accent-yellow" />}
        items={evidenceImprovements.slice(0, 2)}
      />
    </div>
  )
}

export { Evidence }

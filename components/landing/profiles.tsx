import { Section } from "@/components/section"
import { Badge } from "@/components/ui/badge"
import { countriesServed, roles, verticals } from "@/lib/geo"
import { profileStats, profilesHeading } from "@/lib/landing"

const chipClassName =
  "h-8 border-transparent bg-bg-base px-sm text-body-small text-text-primary"

/**
 * Perfiles HF: mapa a sección completa, stats en gradiente + Roles / Verticales / Geografías.
 */
function Profiles() {
  return (
    <Section
      className="bg-landing-map scroll-mt-2xl py-2xl md:py-3xl"
      id="perfiles"
    >
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 mx-auto max-w-4xl text-center text-pretty text-text-primary">
          {profilesHeading}
        </h2>

        <div className="grid min-w-0 gap-md sm:grid-cols-3 sm:*:min-w-0">
          {profileStats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-0 flex-col items-center gap-xs text-center"
            >
              <p className="text-heading-2 text-brand-gradient">{stat.value}</p>
              <p className="text-data-label text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid min-w-0 items-start gap-md lg:grid-cols-3 lg:*:min-w-0">
          <ChipGroup title="Roles" items={roles} />
          <ChipGroup title="Verticales" items={verticals} />
          <ChipGroup
            title="Geografías"
            items={countriesServed}
            footnote="y otros países"
          />
        </div>
      </div>
    </Section>
  )
}

function ChipGroup({
  title,
  items,
  footnote,
}: {
  title: string
  items: readonly string[]
  footnote?: string
}) {
  return (
    <div className="rounded-md bg-bg-surface-1/40 p-md backdrop-blur-sm">
      <p className="text-body-small mb-sm text-text-secondary">{title}</p>
      <ul className="flex flex-wrap items-center gap-xs">
        {items.map((item) => (
          <li key={item}>
            <Badge variant="outline" className={chipClassName}>
              {item}
            </Badge>
          </li>
        ))}
        {footnote ? (
          <li className="text-body-small text-text-secondary">{footnote}</li>
        ) : null}
      </ul>
    </div>
  )
}

export { Profiles }

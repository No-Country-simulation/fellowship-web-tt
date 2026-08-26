import type { CSSProperties } from "react"

import { Section } from "@/components/section"
import { conocimientos, roles } from "@/lib/geo"
import { profileStats, profilesHeading } from "@/lib/landing"
import { cn } from "@/lib/utils"

type ChipAccent =
  | "cyan"
  | "indigo"
  | "indigo-light"
  | "mint"
  | "orange"
  | "yellow"
  | "red"
  | "pink"
  | "violet"

const chipAccentVar: Record<ChipAccent, string> = {
  cyan: "var(--accent-cyan)",
  indigo: "var(--accent-indigo)",
  "indigo-light": "var(--accent-indigo-light)",
  mint: "var(--accent-mint)",
  orange: "var(--accent-orange)",
  yellow: "var(--accent-yellow)",
  red: "var(--accent-red)",
  pink: "var(--brand-pink)",
  violet: "var(--brand-violet)",
}

const conocimientoAccents: Record<(typeof conocimientos)[number], ChipAccent> = {
  Web: "violet",
  Mobile: "mint",
  Data: "indigo",
  UX: "pink",
  Producto: "yellow",
  Growth: "orange",
  IA: "violet",
  Agentes: "indigo",
  Cloud: "cyan",
  Videojuegos: "red",
  Ciberseguridad: "pink",
}

const roleAccents: Record<(typeof roles)[number] | "otros", ChipAccent> = {
  "AI Engineer": "indigo-light",
  Frontend: "indigo",
  Backend: "cyan",
  "UX/UI": "pink",
  "Data Analyst": "mint",
  "Product Designer": "yellow",
  Growth: "orange",
  otros: "pink",
}

const profileRoles = [...roles, "otros"] as const

/**
 * Perfiles HF: mapa a sección completa, stats en gradiente + Conocimientos / Roles.
 */
function Profiles() {
  return (
    <Section
      className="bg-landing-map scroll-mt-2xl py-2xl md:py-3xl"
      id="perfiles"
    >
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 mx-auto w-full text-center text-text-primary">
          {profilesHeading}
        </h2>

        <div className="grid min-w-0 gap-md sm:grid-cols-3 sm:*:min-w-0">
          {profileStats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-0 flex-col items-center gap-xs text-center"
            >
              <p className="text-heading-1 text-brand-gradient leading-none">
                {stat.value}
              </p>
              <p className="text-data-label text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-sm md:gap-md">
          <ChipRow
            title="Conocimientos"
            titleClassName="text-accent-cyan"
            items={conocimientos.map((label) => ({
              label,
              accent: conocimientoAccents[label],
            }))}
          />
          <ChipRow
            title="Roles"
            titleClassName="text-brand-pink"
            items={profileRoles.map((label) => ({
              label,
              accent: roleAccents[label],
            }))}
          />
        </div>
      </div>
    </Section>
  )
}

function ChipRow({
  title,
  titleClassName,
  items,
}: {
  title: string
  titleClassName: string
  items: readonly { label: string; accent: ChipAccent }[]
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-xs">
      <p className={cn("text-overline shrink-0 pr-xs", titleClassName)}>
        {title}
      </p>
      {items.map((item) => (
        <span
          key={item.label}
          className="profile-chip inline-flex h-8 items-center rounded-full border px-sm text-body-small"
          style={
            {
              "--chip-accent": chipAccentVar[item.accent],
            } as CSSProperties
          }
        >
          {item.label}
        </span>
      ))}
    </div>
  )
}

export { Profiles }

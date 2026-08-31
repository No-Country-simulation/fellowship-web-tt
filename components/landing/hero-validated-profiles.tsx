import { StarIcon } from "lucide-react"

import { heroValidatedProfiles } from "@/lib/landing"
import { cn } from "@/lib/utils"

type HeroProfile = (typeof heroValidatedProfiles)[number]

/**
 * Fichas compactas del hero: métricas + peer review.
 * Rotan en el mismo lugar (CSS, sin JS).
 */
function HeroValidatedProfiles() {
  return (
    <ul
      aria-label="Perfiles junior validados"
      className="hero-profile-rotator grid min-w-0"
    >
      {heroValidatedProfiles.map((profile) => (
        <li key={profile.name} className="hero-profile-cycle col-start-1 row-start-1 min-w-0">
          <HeroProfileCard profile={profile} />
        </li>
      ))}
    </ul>
  )
}

function HeroProfileCard({ profile }: { profile: HeroProfile }) {
  return (
    <article className="flex h-full min-w-0 flex-col gap-sm rounded-md border border-border/40 px-sm py-sm">
      <div className="flex min-w-0 items-start justify-between gap-xs">
        <div className="min-w-0">
          <p className="text-body-small truncate font-semibold text-text-primary">
            {profile.name}
          </p>
          <p className="text-overline truncate text-text-secondary">
            {profile.role} · {profile.country}
          </p>
        </div>
        <p className="flex shrink-0 items-center gap-1 text-body-small font-semibold text-text-primary">
          {profile.rating.toFixed(1)}
          <StarIcon
            aria-hidden
            className="size-3 fill-accent-yellow text-accent-yellow"
          />
        </p>
      </div>

      <ul className="grid min-w-0 grid-cols-4 gap-xs">
        {profile.metrics.map((metric, index) => (
          <li
            key={metric.label}
            className="flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md border border-border/60 bg-brand-gradient-secondary px-xs py-1 text-center"
          >
            <p
              className={cn(
                "text-body-small font-semibold tabular-nums leading-none",
                index === 0 ? "text-brand-gradient" : "text-text-primary"
              )}
            >
              {metric.value}
            </p>
            <p className="text-overline leading-none text-text-secondary">
              {metric.label}
            </p>
          </li>
        ))}
      </ul>

      <div className="flex min-w-0 flex-col gap-xs">
        <p className="text-overline text-text-muted">Peer reviews</p>
        {profile.peerReviews.map((item) => (
          <div key={item.skill} className="flex min-w-0 flex-col gap-1">
            <div className="flex min-w-0 items-baseline justify-between gap-xs">
              <p className="text-body-small min-w-0 truncate text-text-secondary">
                {item.skill}
              </p>
              <p className="text-body-small shrink-0 font-medium tabular-nums text-text-primary">
                {item.score.toFixed(1)}
              </p>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-bg-surface-4"
              role="meter"
              aria-label={item.skill}
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={item.score}
            >
              <div
                className="h-full rounded-full bg-brand-gradient"
                style={{ width: `${item.score * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

export { HeroValidatedProfiles }

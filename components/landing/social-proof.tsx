import { Section } from "@/components/section"
import {
  socialProofHeading,
  socialProofQuote,
  socialProofStats,
} from "@/lib/landing"

/**
 * Caso real HF: H2 centrado, testimonial ancho + dos métricas.
 */
function SocialProof() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="casos">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 mx-auto max-w-4xl text-center text-pretty text-text-primary">
          {socialProofHeading}
        </h2>

        <div className="grid min-w-0 gap-md lg:grid-cols-[2fr_1fr_1fr] lg:*:min-w-0">
          <article className="flex min-w-0 flex-col justify-between gap-md rounded-md bg-bg-surface-1 p-md">
            <blockquote className="text-body-large text-pretty text-text-primary">
              “{socialProofQuote.quote}”
            </blockquote>
            <footer className="flex flex-col gap-1">
              <cite className="text-body font-semibold not-italic text-text-primary">
                {socialProofQuote.name}
              </cite>
              <p className="text-body-small text-text-secondary">
                {socialProofQuote.role}
              </p>
            </footer>
          </article>

          {socialProofStats.map((stat) => (
            <article
              key={stat.label}
              className="flex min-w-0 flex-col justify-center gap-sm rounded-md bg-bg-surface-1 p-md"
            >
              <p className="text-heading-2 text-text-primary">{stat.value}</p>
              <p className="text-data-label text-text-primary">{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}

export { SocialProof }

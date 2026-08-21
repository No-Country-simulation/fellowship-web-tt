import Image from "next/image"

import { Section } from "@/components/section"
import {
  howItWorksHeading,
  howItWorksProfilePreviews,
  howItWorksProfilesHeading,
  howItWorksProfilesIntro,
  howItWorksSteps,
} from "@/lib/landing"

/**
 * Cómo funciona HF: H2 centrado, 4 pasos numerados y perfiles validados.
 */
function HowItWorks() {
  return (
    <Section className="scroll-mt-2xl py-2xl md:py-3xl" id="como-funciona">
      <div className="flex flex-col gap-xl">
        <h2 className="text-heading-2 mx-auto max-w-4xl text-center text-pretty text-text-primary">
          {howItWorksHeading}
        </h2>

        <ol className="grid min-w-0 gap-lg sm:grid-cols-2 lg:grid-cols-4 lg:[&>*]:min-w-0">
          {howItWorksSteps.map((item) => (
            <li
              key={item.step}
              className="flex min-w-0 flex-col items-start gap-sm"
            >
              <span
                aria-hidden
                className="flex size-10 items-center justify-center rounded-full bg-brand-gradient text-body font-semibold text-white"
              >
                {item.step}
              </span>
              <p className="text-body-small text-text-secondary">
                Paso {item.step}
              </p>
              <h3 className="text-heading-3 text-text-primary">{item.title}</h3>
              <p className="text-body text-text-secondary">{item.body}</p>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-lg rounded-lg border border-border bg-bg-surface-1 px-md py-lg md:px-xl md:py-xl">
          <div className="flex flex-col items-center gap-sm text-center">
            <h3 className="text-heading-3 text-pretty text-text-primary">
              <span className="text-brand-gradient">
                {howItWorksProfilesHeading.lead}
              </span>{" "}
              {howItWorksProfilesHeading.rest}
            </h3>
            <p className="text-body-small max-w-3xl text-text-secondary">
              {howItWorksProfilesIntro}
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-3 gap-sm md:gap-md *:min-w-0">
            {howItWorksProfilePreviews.map((preview) => (
              <figure key={preview.src} className="min-w-0">
                <Image
                  src={preview.src}
                  alt={preview.alt}
                  width={preview.width}
                  height={preview.height}
                  className="h-auto w-full"
                  sizes="33vw"
                  unoptimized
                />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

export { HowItWorks }

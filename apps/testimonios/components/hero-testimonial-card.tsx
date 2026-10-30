import Image from "next/image";

import { stripWrappingQuotes } from "@/lib/testimonials/quote";
import type { TestimonialType } from "@/lib/testimonials/types";

import styles from "./hero-testimonial-card.module.css";

export type HeroTestimonialCardContent = {
  type: TestimonialType;
  quote: string;
  fullName: string;
  country: string | null;
  avatarUrl: string;
  role: string | null;
  company: string | null;
  previousRole: string | null;
};

// Copy de la plantilla Canvas, no modifica las categorías del formulario.
const COPY = {
  simulation: { badge: "APRENDIZAJE", kicker: "LO QUE APRENDÍ" },
  first_job: { badge: "Conseguí empleo", kicker: "MI PRIMER EMPLEO" },
  career_change: { badge: "RECONVERSIÓN PROFESIONAL", kicker: "MI RECONVERSIÓN" },
} as const;

/** Cita compacta: recorte solo visual, datos completos y autor en tres filas. No genera PNG. */
export function HeroTestimonialCard({ story }: { story: HeroTestimonialCardContent }) {
  const copy = COPY[story.type];

  return (
    <div className={styles.frame}>
      <figure className={styles.publication} data-type={story.type}>
        <svg className={styles.decoration} viewBox="0 0 1080 1350" preserveAspectRatio="xMaxYMin meet" aria-hidden="true">
          {/* drawHexDecoration: centro (990, 430), radios 250 y 170. */}
          <polygon points="990,180 1206.506,305 1206.506,555 990,680 773.494,555 773.494,305" />
          <polygon points="990,260 1137.224,345 1137.224,515 990,600 842.776,515 842.776,345" />
        </svg>

        <div className={styles.header} data-publication-content>
          <span className={styles.logo} role="img" aria-label="No Country" />
          <p className={styles.badge}>{copy.badge}</p>
        </div>

        <div className={styles.content} data-publication-content>
          <div className={styles.quoteGroup}>
            <span className={styles.quoteMark} aria-hidden="true">“</span>
            <p className={styles.kicker}>{copy.kicker}</p>
            <blockquote className={styles.quote}>
              <p className={styles.quoteText}>{stripWrappingQuotes(story.quote)}</p>
            </blockquote>

            {story.type === "first_job" && story.company ? (
              <p className={styles.company}>
                <span className={styles.companyLabel}>
                  <svg viewBox="0 0 28 24" aria-hidden="true" className={styles.check}>
                    <path d="M3 12 11 20 25 4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Contratado por
                </span>
                <span className={styles.companyName}>{story.company}</span>
              </p>
            ) : story.type === "career_change" && story.previousRole && story.role ? (
              <p className={styles.transition}>
                <span className={styles.previousRole}>Antes · {story.previousRole}</span>
                <span className={styles.arrow} aria-hidden="true">→</span>
                <span className={styles.newRole}>Ahora · {story.role}</span>
              </p>
            ) : null}
          </div>
        </div>

        <figcaption className={styles.author} data-publication-content>
          <span className={styles.avatarBorder} aria-hidden="true">
            <span className={styles.avatar}>
              {story.avatarUrl ? (
                <Image src={story.avatarUrl} alt="" fill sizes="52px" className={styles.avatarImage} />
              ) : (
                <span>{story.fullName.trim().charAt(0).toLocaleUpperCase("es")}</span>
              )}
            </span>
          </span>
          <div className={styles.authorDetails}>
            <p className={styles.name}>{story.fullName}</p>
            {story.country ? <p className={styles.country}>{story.country}</p> : null}
            {story.role ? <p className={styles.role}>{story.role}</p> : null}
          </div>
        </figcaption>
      </figure>
    </div>
  );
}

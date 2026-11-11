"use client";

import { useState } from "react";
import Image from "next/image";

import { getFormMessages } from "@/lib/form-i18n/messages";
import type { FormLocale } from "@/lib/form-i18n/locales";
import type { TestimonialType } from "@/lib/testimonials/types";

import styles from "./hero-testimonial-card.module.css";

export type HeroTestimonialCardContent = {
  type: TestimonialType;
  quote: string;
  story: string;
  fullName: string;
  country: string | null;
  imageUrl: string | null;
  role: string | null;
  company: string | null;
  previousRole: string | null;
};

/** Administrative artwork only. The carousel provides its single semantic text equivalent. */
export function HeroTestimonialCard({ story, locale, requested }: {
  story: HeroTestimonialCardContent;
  locale: FormLocale;
  requested: boolean;
}) {
  const copy = getFormMessages(locale).form.hero;
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");

  return (
    <div className={styles.frame} aria-hidden="true" data-hero-artwork>
      <p className={styles.placeholder} hidden={status === "loaded"}>
        {status === "failed" || !story.imageUrl ? copy.imageUnavailable : copy.imageLoading}
      </p>
      {requested && story.imageUrl && status !== "failed" ? (
        <Image
          src={story.imageUrl}
          alt=""
          width={1080}
          height={1350}
          sizes="(max-width: 387px) calc(100vw - 48px), 340px"
          loading="eager"
          fetchPriority="high"
          className={styles.image}
          data-loaded={status === "loaded"}
          data-publication-content
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("failed")}
        />
      ) : null}
    </div>
  );
}

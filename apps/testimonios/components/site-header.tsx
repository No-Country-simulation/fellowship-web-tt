import Image from "next/image";

import { institutionalDestinations } from "@/lib/nav";

import { SiteNavigation } from "./site-navigation";
import styles from "./site-header.module.css";

/** Header institucional sticky de servidor; la navegación interactiva queda aislada. */
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <SiteNavigation
        logo={
          <a
            href={institutionalDestinations.home.href}
            title="Ir al inicio de No Country"
            className={styles.logo}>
            <Image
              src="/brand/logo-no-country.png"
              alt="No Country"
              width={1229}
              height={207}
              sizes="(min-width: 1024px) 190px, 143px"
              loading="eager"
              className={styles.logoImage}
            />
          </a>
        }
      />
    </header>
  );
}

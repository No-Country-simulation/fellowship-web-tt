import Image from "next/image";

import { footerNavigation, footerPendingLabels, footerSocialLinks, institutionalDestinations } from "@/lib/nav";

import styles from "./site-footer.module.css";

// Trazados decorativos de los iconos sociales de la referencia oficial.
const socialPaths = {
  whatsapp: "M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.764.459 3.483 1.332 5.001L2 22l5.143-1.337c1.472.802 3.136 1.226 4.864 1.227h.005c5.505 0 9.988-4.478 9.99-9.985 0-2.667-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm5.795 14.153c-.244.688-1.42 1.314-1.956 1.365-.503.048-1.156.072-3.665-.964-3.21-1.326-5.267-4.606-5.427-4.82-.16-.214-1.306-1.74-1.306-3.32 0-1.58.823-2.358 1.116-2.68.293-.322.639-.403.852-.403.214 0 .428.002.614.011.199.01.464-.075.726.554.267.641.91 2.222.99 2.383.08.16.133.348.026.561-.106.214-.16.347-.32.534-.16.187-.336.417-.48.56-.16.16-.327.334-.141.653.187.32.83 1.368 1.782 2.217 1.225 1.093 2.257 1.432 2.577 1.593.32.16.507.133.694-.08.187-.213.799-.933 1.012-1.253.213-.32.427-.267.72-.16.293.107 1.866.88 2.186 1.04.32.16.533.24.613.373.08.133.08.773-.164 1.461z",
  linkedin: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
} as const;

/** Footer institucional de servidor, compartido por las rutas públicas y sus estados. */
export function SiteFooter() {
  return (
    <footer id="footer" className={styles.footer}>
      <div aria-hidden="true" className={styles.decoration}>
        <div className={styles.pinkGlow} />
        <div className={styles.cyanGlow} />
        <div className={styles.leftShape} />
        <div className={styles.rightShape} />
      </div>
      <div className={styles.container}>
        <div className={styles.columns}>
          <div className={styles.brand}>
            <a href={institutionalDestinations.home.href} className={styles.logo}>
              <Image src="/brand/logo-no-country.png" alt="No Country" width={1229} height={207}
                sizes="238px" className={styles.logoImage} />
            </a>
            <p className={styles.description}>
              Infraestructura de Simulación Laboral para programas de formación, instituciones y organizaciones que desarrollan talento.
            </p>
            <div className={styles.socials}>
              {footerSocialLinks.map(({ destination, icon }) => (
                <a key={destination} href={institutionalDestinations[destination].href}
                  aria-label={`${institutionalDestinations[destination].label} (abre en otra pestaña)`}
                  target="_blank" rel="noopener noreferrer" data-social={icon} className={styles.socialLink}>
                  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
                    <path d={socialPaths[icon]} fillRule="evenodd" clipRule="evenodd" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          {footerNavigation.map(({ id, label, items }) => (
            <nav key={id} aria-labelledby={`footer-${id}`} className={styles.group}>
              <h2 id={`footer-${id}`} className={`type-eyebrow ${styles.heading}`}>
                <span aria-hidden="true" className={styles.dot} data-group={id} />{label}
              </h2>
              <ul className={styles.links}>
                {items.map((item) => "destination" in item ? (
                  <li key={item.destination}>
                    <a href={institutionalDestinations[item.destination].href} className={styles.textLink}
                      target={"newTab" in item && item.newTab ? "_blank" : undefined}
                      rel={"newTab" in item && item.newTab ? "noopener noreferrer" : undefined}>
                      {"label" in item ? item.label : institutionalDestinations[item.destination].label}
                      {"newTab" in item && item.newTab ? <span className="sr-only"> (abre en otra pestaña)</span> : null}
                    </a>
                  </li>
                ) : (
                  <li key={item.pending}><span className={styles.pending}>{footerPendingLabels[item.pending]}</span></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className={styles.bottom}>
          <p>© 2026 No Country. Todos los derechos reservados.</p>
          <div className={styles.legal}>
            <span>{footerPendingLabels.terms}</span>
            <span>{footerPendingLabels.privacy}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

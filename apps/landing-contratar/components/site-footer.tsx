import Image from "next/image"

import { BrandLogo } from "@/components/brand-logo"
import { Separator } from "@/components/ui/separator"
import {
  footerCopyright,
  footerNavegacion,
  footerPlataforma,
  footerTagline,
  instagramUrl,
  linkedinUrl,
  whatsappUrl,
  type NavLink,
} from "@/lib/nav"

const socials = [
  {
    label: "LinkedIn",
    href: linkedinUrl,
    src: "/brand/icon-linkedin.svg",
  },
  {
    label: "Instagram",
    href: instagramUrl,
    src: "/brand/icon-instagram.svg",
  },
  {
    label: "WhatsApp",
    href: whatsappUrl,
    src: "/brand/icon-whatsapp.svg",
  },
] as const

/**
 * Footer HF: 4 columnas en el container + copyright. Sin overflow horizontal.
 */
function SiteFooter() {
  return (
    <footer className="mt-auto w-full min-w-0 overflow-x-clip">
      <div className="px-md py-2xl md:px-3xl">
        <div className="container-content flex min-w-0 flex-col gap-xl">
          <div className="grid min-w-0 grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-4 lg:*:min-w-0">
            <FooterColumn title="Navegación" links={footerNavegacion} />
            <FooterColumn title="Plataforma" links={footerPlataforma} />
            <div className="flex min-w-0 flex-col gap-sm">
              <p className="text-body font-semibold text-text-primary">
                Síguenos
              </p>
              <div className="flex gap-sm" aria-label="Redes sociales">
                {socials.map((social) => {
                  const isExternal = social.href.startsWith("https://")

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      className="text-text-primary transition-opacity hover:opacity-80"
                      aria-label={social.label}
                      {...(isExternal
                        ? {
                            target: "_blank",
                            rel: "noopener noreferrer",
                          }
                        : {})}
                    >
                      <Image
                        src={social.src}
                        alt=""
                        width={24}
                        height={24}
                        unoptimized
                        className="size-6"
                      />
                    </a>
                  )
                })}
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-md h-fit">
              <BrandLogo
                width={120}
                className=" my-auto"
              />
              <span
                aria-hidden
                className="hidden h-12 w-px shrink-0 bg-border sm:block"
              />
              <p className="text-body-small min-w-0 text-pretty text-text-secondary">
                {footerTagline}
              </p>
            </div>
          </div>

          <Separator />

          <p className="text-body-small text-text-muted">{footerCopyright}</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-sm">
      <p className="text-body font-semibold text-text-primary">{title}</p>
      <ul className="flex flex-col gap-xs">
        {links.map((link) => (
          <li key={link.label}>
            <FooterLink link={link} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function FooterLink({ link }: { link: NavLink }) {
  const className =
    "text-body-small text-text-secondary transition-colors hover:text-text-primary"

  return (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  )
}

export { SiteFooter }

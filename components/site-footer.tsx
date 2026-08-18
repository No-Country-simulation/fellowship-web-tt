import { BrandLogo } from "@/components/brand-logo"
import { Separator } from "@/components/ui/separator"
import {
  footerCopyright,
  footerNavegacion,
  footerPlataforma,
  footerTagline,
  instagramUrl,
  linkedinUrl,
  PLACEHOLDER_HREF,
  type NavLink,
} from "@/lib/nav"
import { cn } from "@/lib/utils"

const socials = [
  { label: "LinkedIn", href: linkedinUrl, icon: LinkedInIcon },
  { label: "Instagram", href: instagramUrl, icon: InstagramIcon },
  { label: "WhatsApp", href: PLACEHOLDER_HREF, icon: WhatsAppIcon },
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
                      className="text-text-secondary transition-colors hover:text-text-primary"
                      aria-label={social.label}
                      {...(isExternal
                        ? {
                            target: "_blank",
                            rel: "noopener noreferrer",
                          }
                        : {})}
                    >
                      <social.icon className="size-5" />
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

function SocialGlyph({
  className,
  path,
}: {
  className?: string
  path: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("fill-current", className)}
      aria-hidden
    >
      <path d={path} />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <SocialGlyph
      className={className}
      path="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.46c.98 0 1.77-.78 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z"
    />
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <SocialGlyph
      className={className}
      path="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98C23.99 15.67 24 15.26 24 12s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-10.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z"
    />
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <SocialGlyph
      className={className}
      path="M17.47 14.38c-.3-.15-1.76-.87-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35ZM12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.33 4.94L2 22l5.39-1.41a10.1 10.1 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2Zm0 17.95h-.01a8.4 8.4 0 0 1-4.28-1.17l-.31-.18-3.2.84.85-3.11-.2-.32a8.32 8.32 0 0 1-1.28-4.45c0-4.6 3.77-8.34 8.42-8.34 4.48 0 8.41 3.62 8.42 8.08 0 4.6-3.77 8.65-8.41 8.65Z"
    />
  )
}

export { SiteFooter }

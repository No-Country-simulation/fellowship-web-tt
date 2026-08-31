/**
 * IA del chrome (header / footer).
 * Destinos sin página en este lote: `PLACEHOLDER_HREF`.
 * No crear páginas vacías.
 */

export const PLACEHOLDER_HREF = "#"

export const empresasUrl = "https://nocountry.tech/"
export const homeUrl = empresasUrl
export const talentoUrl = "https://nocountry.tech/talent"
export const showcaseUrl =
  "https://nocountry.tech/showcase/teams/simulaciones"
export const simulacionUrl = "https://companies.nocountry.tech/simulation"
export const loginUrl = "https://companies.nocountry.tech/login"
export const instagramUrl = "https://www.instagram.com/nocountry.tech/"
export const linkedinUrl = "https://www.linkedin.com/company/nocountrytalent/"
export const whatsappUrl = "https://wa.me/5491173591034"

export type NavLink = {
  label: string
  href: string
  disabled?: boolean
}

export type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "group"; label: string; children: NavLink[] }

export const headerNav: NavItem[] = [
  { type: "link", label: "Home", href: homeUrl },
  {
    type: "group",
    label: "Simulación Laboral",
    children: [
      { label: "Paradigma", href: PLACEHOLDER_HREF },
      { label: "Cómo funciona", href: PLACEHOLDER_HREF },
      { label: "Qué observamos", href: PLACEHOLDER_HREF },
      { label: "Qué insights genera", href: PLACEHOLDER_HREF },
    ],
  },
  { type: "link", label: "Para Talento", href: talentoUrl },
  { type: "link", label: "Para Instituciones", href: PLACEHOLDER_HREF },
  {
    type: "group",
    label: "Para Empresas",
    children: [
      { label: "Contratar talento", href: "/" },
      { label: "Producto", href: PLACEHOLDER_HREF },
      { label: "Expansión de marca", href: PLACEHOLDER_HREF },
    ],
  },
  {
    type: "group",
    label: "Sobre Nosotros",
    children: [
      { label: "Manifiesto", href: PLACEHOLDER_HREF },
      { label: "Showcase", href: showcaseUrl },
      { label: "Casos de Éxito", href: PLACEHOLDER_HREF },
    ],
  },
]

export const loginNav: NavLink = {
  label: "Iniciar Sesión",
  href: loginUrl,
}

export const footerNavegacion: NavLink[] = [
  { label: "Showcase", href: showcaseUrl },
  { label: "Para Talento", href: talentoUrl },
  { label: "Para Empresas", href: empresasUrl },
  { label: "Sobre No Country", href: PLACEHOLDER_HREF },
]

export const footerShowcase: NavLink[] = [
  { label: "Ver todos los proyectos", href: showcaseUrl },
]

export const footerPlataforma: NavLink[] = [
  { label: "Talento", href: talentoUrl },
  { label: "Empresas", href: empresasUrl },
]

export const footerTagline = "Evidenciemos el valor del talento digital"

export const footerCopyright = "Copyright © 2026 Todos los derechos reservados"

export const footerPrivacy: NavLink = {
  label: "Políticas de Privacidad",
  href: PLACEHOLDER_HREF,
}

/** Slots de redes: la HF no lista URLs. */
export const socialSlotCount = 3

export function isNavGroup(
  item: NavItem
): item is Extract<NavItem, { type: "group" }> {
  return item.type === "group"
}

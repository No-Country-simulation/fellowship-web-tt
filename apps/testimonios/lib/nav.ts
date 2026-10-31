export const publicNav = [
  { href: "/", label: "Inicio" },
  { href: "/enviar", label: "Enviar" },
] as const;

type InstitutionalDestination = { label: string; href: `https://${string}` };
const OFFICIAL_ORIGIN = "https://www.nocountry.tech";

/** Destinos públicos verificados; las rutas de Testimonios permanecen locales. */
export const institutionalDestinations = {
  home: { label: "Inicio de No Country", href: `${OFFICIAL_ORIGIN}/` },
  paradigm: { label: "Paradigma", href: `${OFFICIAL_ORIGIN}/simulacion-laboral/paradigma` },
  howItWorks: { label: "Cómo funciona", href: `${OFFICIAL_ORIGIN}/simulacion-laboral/como-funciona` },
  observations: { label: "Qué observamos", href: `${OFFICIAL_ORIGIN}/simulacion-laboral/que-observamos` },
  insights: { label: "Qué insights genera", href: `${OFFICIAL_ORIGIN}/simulacion-laboral/que-insights-genera` },
  hire: { label: "Contratar talento", href: `${OFFICIAL_ORIGIN}/para-empresas/contratar` },
  productValidation: { label: "Validación de producto", href: `${OFFICIAL_ORIGIN}/para-empresas/validacion-de-producto` },
  institutions: { label: "Para instituciones", href: `${OFFICIAL_ORIGIN}/para-instituciones` },
  talent: { label: "Para Talento", href: `${OFFICIAL_ORIGIN}/talento/reconversion-profesional` },
  showcase: { label: "Showcase", href: `${OFFICIAL_ORIGIN}/showcase` },
  successStories: { label: "Casos de éxito", href: `${OFFICIAL_ORIGIN}/casos-de-exito` },
  live: { label: "Simulación en curso", href: `${OFFICIAL_ORIGIN}/#live` },
  talentPortal: { label: "Talento", href: "https://talent.nocountry.tech/" },
  companyPortal: { label: "Empresas", href: "https://companies.nocountry.tech/" },
  faq: { label: "Preguntas frecuentes", href: `${OFFICIAL_ORIGIN}/#faq` },
  contact: { label: "Contacto", href: "https://wa.me/5491173591034" },
  communityWhatsApp: { label: "WhatsApp", href: "https://chat.whatsapp.com/I4LvahrbJLH3SYMd2WFrkp?mode=wwt" },
  linkedIn: { label: "LinkedIn", href: "https://www.linkedin.com/company/nocountrytalent/posts/?feedView=all" },
  instagram: { label: "Instagram", href: "https://www.instagram.com/nocountry.tech/?hl=es" },
} as const satisfies Record<string, InstitutionalDestination>;

export type InstitutionalDestinationId = keyof typeof institutionalDestinations;

export const navigationGroups = {
  simulation: { label: "Simulación Laboral", destinations: ["paradigm", "howItWorks", "observations", "insights"] },
  companies: { label: "Para Empresas", destinations: ["hire", "productValidation"] },
  login: { label: "Iniciar sesión", destinations: ["talentPortal", "companyPortal"] },
} as const satisfies Record<string, { label: string; destinations: readonly InstitutionalDestinationId[] }>;

export type NavigationGroupId = keyof typeof navigationGroups;

type InstitutionalNavigationItem =
  | { kind: "group"; group: NavigationGroupId }
  | { kind: "link"; destination: InstitutionalDestinationId };

export const institutionalNavigation = [
  { kind: "group", group: "simulation" },
  { kind: "group", group: "companies" },
  { kind: "link", destination: "institutions" },
  { kind: "link", destination: "talent" },
  { kind: "link", destination: "showcase" },
  { kind: "link", destination: "successStories" },
] as const satisfies readonly InstitutionalNavigationItem[];

/** Sin URL aprobada: se presentan como texto, nunca como enlaces ficticios. */
export const footerPendingLabels = {
  openSimulations: "Simulaciones abiertas",
  validationModel: "Modelo de validación",
  terms: "Términos de servicio",
  privacy: "Políticas de privacidad",
} as const;

type FooterNavigationItem =
  | { destination: InstitutionalDestinationId; label?: string; newTab?: boolean }
  | { pending: keyof typeof footerPendingLabels };

export const footerNavigation = [
  { id: "talent", label: "PARA TALENTO", items: [
    { pending: "openSimulations" },
    { destination: "successStories", label: "Historias de éxito" },
    { destination: "faq" },
  ] },
  { id: "companies", label: "PARA EMPRESAS", items: [
    { destination: "hire" },
    { pending: "validationModel" },
  ] },
  { id: "ecosystem", label: "ECOSISTEMA", items: [
    { destination: "showcase" },
    { destination: "productValidation", label: "Hackathon" },
    { destination: "contact", newTab: true },
  ] },
] as const satisfies readonly { id: string; label: string; items: readonly FooterNavigationItem[] }[];

export const footerSocialLinks = [
  { destination: "communityWhatsApp", icon: "whatsapp" },
  { destination: "linkedIn", icon: "linkedin" },
  { destination: "instagram", icon: "instagram" },
] as const satisfies readonly { destination: InstitutionalDestinationId; icon: string }[];

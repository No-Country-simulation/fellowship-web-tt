import {
  countriesServed,
  getAnsweredFaqs,
  metricsAsOf,
  productFacts,
  productSummary,
  roles,
  serviceName,
  siteDescription,
  siteName,
  verticals,
} from "@/lib/geo";
import {
  evidenceHeading,
  evidenceItems,
  guaranteeHeading,
  guaranteeItems,
  howItWorksHeading,
  howItWorksSteps,
  profilesHeading,
  profileStats,
} from "@/lib/landing";
import {
  empresasUrl,
  instagramUrl,
  linkedinUrl,
  loginUrl,
  showcaseUrl,
  simulacionUrl,
  talentoUrl,
} from "@/lib/nav";
import { getSiteUrl } from "@/lib/site";

export function getLlmsTxt(): string {
  const siteUrl = getSiteUrl();
  const facts = productFacts.map((fact) => `- ${fact}`).join("\n");
  const faqLines = getAnsweredFaqs()
    .map((faq) => `- ${faq.question} ${faq.answer}`)
    .join("\n");

  return `# ${siteName}

> ${siteDescription}

${productSummary}

Hechos del servicio:

${facts}

Preguntas frecuentes:

${faqLines}

## Páginas

- [Buscar talento](${siteUrl}): Landing para empresas que contratan perfiles junior y junior-mid con evidencia real.
- [Documentación completa](${siteUrl}/llms-full.txt): Pasos, garantía, evidencia, perfiles y FAQs en texto plano.
`;
}

export function getLlmsFullTxt(): string {
  const siteUrl = getSiteUrl();
  const facts = productFacts.map((fact) => `- ${fact}`).join("\n");
  const steps = howItWorksSteps
    .map((item) => `${item.step}. ${item.title}: ${item.body}`)
    .join("\n");
  const guarantee = guaranteeItems.map((item) => `- ${item}`).join("\n");
  const evidence = evidenceItems
    .map((item) => `- ${item.title}: ${item.body}`)
    .join("\n");
  const stats = [
    ...profileStats.map((item) => `- ${item.value} ${item.label}`),
    `- Cifras a ${metricsAsOf}.`,
  ].join("\n");
  const faqs = getAnsweredFaqs()
    .map((faq) => `### ${faq.question}\n\n${faq.answer}`)
    .join("\n\n");

  return `# ${siteName}

> ${siteDescription}

${productSummary}

## Servicio

${serviceName}

${facts}

## ${howItWorksHeading}

${steps}

## ${guaranteeHeading}

${guarantee}

## ${evidenceHeading}

${evidence}

## ${profilesHeading}

Roles: ${roles.join(", ")}.
Verticales: ${verticals.join(", ")}.
Geografías con talento activo: ${countriesServed.join(", ")} y más de 100 países.

${stats}

## Preguntas frecuentes

${faqs}

## Enlaces

- [Buscar talento](${siteUrl}): Landing para empresas.
- [Resumen para modelos](${siteUrl}/llms.txt): Versión corta de este documento.
- [Empresas](${empresasUrl}): Sitio No Country para empresas.
- [Talento](${talentoUrl}): Sitio No Country para talento.
- [Showcase](${showcaseUrl}): Simulaciones y equipos.
- [Simulación laboral](${simulacionUrl}): Producto de simulación.
- [Dashboard](${loginUrl}): Acceso con email corporativo.
- [LinkedIn](${linkedinUrl})
- [Instagram](${instagramUrl})
`;
}

import {
  countriesServed,
  getAnsweredFaqs,
  productSummary,
  serviceName,
  siteDescription,
  siteName,
  siteTitle,
} from "@/lib/geo";
import { howItWorksHeading, howItWorksSteps } from "@/lib/landing";
import { empresasUrl, instagramUrl, linkedinUrl, showcaseUrl, simulacionUrl, talentoUrl } from "@/lib/nav";
import { getSiteUrl } from "@/lib/site";

type IdRef = { "@id": string };

type ImageObjectNode = {
  "@type": "ImageObject";
  url: string;
  contentUrl: string;
  width: number;
  height: number;
  caption: string;
};

type OrganizationNode = {
  "@type": "Organization";
  "@id": string;
  name: string;
  url: string;
  logo: ImageObjectNode;
  image: string;
  sameAs: string[];
  description: string;
  knowsAbout: string[];
};

type WebSiteNode = {
  "@type": "WebSite";
  "@id": string;
  name: string;
  url: string;
  inLanguage: string;
  description: string;
  publisher: IdRef;
};

type WebPageNode = {
  "@type": "WebPage";
  "@id": string;
  url: string;
  name: string;
  inLanguage: string;
  description: string;
  isPartOf: IdRef;
  about: IdRef;
  mainEntity: IdRef;
};

type ServiceNode = {
  "@type": "Service";
  "@id": string;
  name: string;
  serviceType: string;
  description: string;
  provider: IdRef;
  areaServed: Array<{ "@type": "Country"; name: string }>;
  audience: {
    "@type": "BusinessAudience";
    audienceType: string;
  };
};

type FaqPageNode = {
  "@type": "FAQPage";
  "@id": string;
  isPartOf: IdRef;
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
};

type HowToNode = {
  "@type": "HowTo";
  "@id": string;
  name: string;
  description: string;
  inLanguage: string;
  url: string;
  isPartOf: IdRef;
  step: Array<{
    "@type": "HowToStep";
    position: number;
    name: string;
    text: string;
    url: string;
  }>;
};

export type JsonLdGraph = {
  "@context": "https://schema.org";
  "@graph": Array<
    | OrganizationNode
    | WebSiteNode
    | WebPageNode
    | ServiceNode
    | FaqPageNode
    | HowToNode
  >;
};

const BRAND_LOGO_PATH = "/brand/logo-no-country.jpg";
const BRAND_LOGO_WIDTH = 1024;
const BRAND_LOGO_HEIGHT = 1024;

function getIds() {
  const siteUrl = getSiteUrl();

  return {
    siteUrl,
    organizationId: `${siteUrl}/#organization`,
    websiteId: `${siteUrl}/#website`,
    webpageId: `${siteUrl}/#webpage`,
    serviceId: `${siteUrl}/#service`,
    faqId: `${siteUrl}/#faq`,
    howToId: `${siteUrl}/#howto`,
    howToUrl: `${siteUrl}/#como-funciona`,
    logoUrl: `${siteUrl}${BRAND_LOGO_PATH}`,
  };
}

export function getSiteJsonLd(): JsonLdGraph {
  const { siteUrl, organizationId, websiteId, logoUrl } = getIds();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteName,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
          contentUrl: logoUrl,
          width: BRAND_LOGO_WIDTH,
          height: BRAND_LOGO_HEIGHT,
          caption: siteName,
        },
        image: logoUrl,
        sameAs: [
          empresasUrl,
          talentoUrl,
          showcaseUrl,
          simulacionUrl,
          linkedinUrl,
          instagramUrl,
        ],
        description: siteDescription,
        knowsAbout: [
          "Talento junior",
          "Evidencia conductual",
          "Simulaciones laborales",
          "Peer review",
          "Garantía de reemplazo",
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: siteName,
        url: siteUrl,
        inLanguage: "es",
        description: siteDescription,
        publisher: { "@id": organizationId },
      },
    ],
  };
}

export function getLandingJsonLd(): JsonLdGraph {
  const {
    siteUrl,
    organizationId,
    websiteId,
    webpageId,
    serviceId,
    faqId,
    howToId,
    howToUrl,
  } = getIds();

  const answeredFaqs = getAnsweredFaqs();
  const processTimeline = answeredFaqs.find((faq) =>
    faq.question.startsWith("¿Cuánto tiempo tarda el proceso")
  );

  const graph: JsonLdGraph["@graph"] = [
    {
      "@type": "WebPage",
      "@id": webpageId,
      url: siteUrl,
      name: `${siteTitle} | ${siteName}`,
      inLanguage: "es",
      description: siteDescription,
      isPartOf: { "@id": websiteId },
      about: { "@id": serviceId },
      mainEntity: { "@id": serviceId },
    },
    {
      "@type": "Service",
      "@id": serviceId,
      name: serviceName,
      serviceType: "Staffing",
      description: productSummary,
      provider: { "@id": organizationId },
      areaServed: countriesServed.map((name) => ({
        "@type": "Country" as const,
        name,
      })),
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Empresas que buscan talento junior",
      },
    },
    {
      "@type": "HowTo",
      "@id": howToId,
      name: howItWorksHeading,
      description: processTimeline?.answer ?? howItWorksHeading,
      inLanguage: "es",
      url: howToUrl,
      isPartOf: { "@id": webpageId },
      step: howItWorksSteps.map((item) => ({
        "@type": "HowToStep" as const,
        position: Number(item.step),
        name: item.title,
        text: item.body,
        url: howToUrl,
      })),
    },
  ];

  if (answeredFaqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": faqId,
      isPartOf: { "@id": webpageId },
      mainEntity: answeredFaqs.map((faq) => ({
        "@type": "Question" as const,
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

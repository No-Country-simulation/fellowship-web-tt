import type { Metadata } from "next";
import {
  keywords,
  siteDescription,
  siteName,
  siteTitle,
} from "@/lib/geo";
import { getSiteUrl } from "@/lib/site";

export function getSiteMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const title = `${siteTitle} | ${siteName}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    applicationName: siteName,
    keywords: [...keywords],
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    publisher: siteName,
    alternates: {
      canonical: "/",
      types: {
        "text/plain": [
          { url: "/llms.txt", title: "llms.txt" },
          { url: "/llms-full.txt", title: "llms-full.txt" },
        ],
      },
    },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url: "/",
      siteName,
      title,
      description: siteDescription,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: siteDescription,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

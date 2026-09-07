import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";

import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${dmSans.variable} dark h-full`}>
      <body className="flex h-full flex-col overflow-hidden bg-bg-base font-sans">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}

import { DM_Sans, Inter } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import { getSiteJsonLd } from "@/lib/json-ld";
import { getSiteMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-data",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata = getSiteMetadata();

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${dmSans.variable} dark h-full`}
    >
      <head>
        <link rel="describedby" href={`${getSiteUrl()}/llms.txt`} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <JsonLd data={getSiteJsonLd()} />
        {children}
      </body>
    </html>
  );
}

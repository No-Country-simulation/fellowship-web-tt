import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "NoCountry Admin",
    template: "%s · NoCountry Admin",
  },
  description: "Esqueleto del panel de administración de No Country, con datos de ejemplo.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}

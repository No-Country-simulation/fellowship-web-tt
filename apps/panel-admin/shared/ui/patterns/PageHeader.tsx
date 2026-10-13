import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Encabezado de página. Un solo `h1` por pantalla. */
export function PageHeader({ children }: { children: React.ReactNode }) {
  return <header className="space-y-1">{children}</header>;
}

export function PageHeaderTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>;
}

export function PageHeaderDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-admin-body text-muted-foreground">{children}</p>;
}

export function PageBackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-admin-caption text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3" />
      {children}
    </Link>
  );
}

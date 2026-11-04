import Link from "next/link";
import { buttonVariants } from "@repo/ui/button";
import { PageShell } from "@/components/page-shell";

export default function PublicNotFound() {
  return (
    <PageShell eyebrow="404" title="Página no encontrada" description="La página que buscas no existe.">
      <Link href="/" className={buttonVariants({ variant: "outline" })}>Volver al inicio</Link>
    </PageShell>
  );
}

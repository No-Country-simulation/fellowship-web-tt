import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import { getLandingJsonLd } from "@/lib/json-ld";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-bg-base">
      <JsonLd data={getLandingJsonLd()} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-brand-gradient-secondary"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] size-[28rem] rounded-full bg-accent-indigo/25 blur-3xl"
      />

      <section className="relative flex flex-1 flex-col justify-center px-md py-2xl md:px-3xl">
        <div className="container-content flex flex-col gap-md">
          <p className="animate-in fade-in slide-in-from-bottom-2 text-overline text-text-secondary duration-700">
            Fellowship
          </p>
          <h1 className="animate-in fade-in slide-in-from-bottom-3 text-heading-1 max-w-3xl text-text-primary duration-700 [animation-delay:80ms] [animation-fill-mode:both]">
            Talento junior con{" "}
            <span className="text-brand-gradient">evidencia real</span>
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom-3 text-body-large max-w-xl text-text-secondary duration-700 [animation-delay:160ms] [animation-fill-mode:both]">
            Semanas de comportamiento documentado en simulaciones reales. Sin
            compromiso. Sin costo.
          </p>
          <div className="animate-in fade-in slide-in-from-bottom-3 flex flex-wrap gap-sm pt-xs duration-700 [animation-delay:240ms] [animation-fill-mode:both]">
            <Button size="lg" className="shadow-glow">
              Buscar talento
            </Button>
            <Button size="lg" variant="outline">
              Cómo funciona
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

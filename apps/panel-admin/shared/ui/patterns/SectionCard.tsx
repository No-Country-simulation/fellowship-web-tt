/** Sección con superficie. El título es un heading real. */
export function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      {title && <h2 className="mb-4 text-admin-heading font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

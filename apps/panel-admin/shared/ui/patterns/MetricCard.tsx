/** Métrica label + valor, como `dl/dt/dd`. */
export function MetricCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <dl className="rounded-lg border border-border bg-card p-4">
      <dt className="text-admin-micro uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-3xl font-semibold tabular-nums">{value}</dd>
      {hint && <dd className="mt-1 text-admin-caption text-muted-foreground">{hint}</dd>}
    </dl>
  );
}

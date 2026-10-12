export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-10 text-center">
      <p className="text-admin-heading font-medium">{title}</p>
      {description && <p className="mt-1 text-admin-body text-muted-foreground">{description}</p>}
    </div>
  );
}

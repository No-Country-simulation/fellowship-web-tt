/**
 * Marco accesible de tabla. No es una tabla genérica por schema: cada feature
 * arma sus filas, esto solo aporta caption, headers con scope y el vacío.
 */
export function DataTable({
  caption,
  columns,
  isEmpty,
  emptyMessage = "No hay datos para mostrar.",
  children,
}: {
  caption: string;
  columns: string[];
  isEmpty: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-admin-body">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-border text-left text-admin-caption text-muted-foreground">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-2.5 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Cell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}

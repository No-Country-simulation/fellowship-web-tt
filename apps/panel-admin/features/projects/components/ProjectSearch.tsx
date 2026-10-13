/**
 * Búsqueda como <form method="get">: el término queda en la URL (`?s=`) y la
 * página (Server Component) vuelve a pedir los datos. Cero estado de cliente.
 */
export function ProjectSearch({ defaultValue }: { defaultValue?: string }) {
  return (
    <form className="flex items-center gap-2" role="search">
      <label htmlFor="project-search" className="text-admin-caption text-muted-foreground">
        Buscar
      </label>
      <input
        id="project-search"
        name="s"
        defaultValue={defaultValue}
        className="h-8 w-64 rounded-md border border-input bg-background px-3 text-admin-body outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </form>
  );
}

import { Button } from "@repo/ui/button";

import { logoutAdmin } from "@/lib/auth/actions";

type AdminSessionProps = {
  email: string | undefined;
};

/** Email y logout en el header, a la derecha. */
export function AdminSession({ email }: AdminSessionProps) {
  return (
    <div
      aria-label="Sesión"
      className="flex min-w-0 items-center justify-end gap-sm"
    >
      <p
        title={email}
        className="hidden min-w-0 truncate text-body-small text-text-secondary sm:block"
      >
        {email ?? "Sin email"}
      </p>
      <form action={logoutAdmin} className="shrink-0">
        <Button type="submit" variant="outline" size="sm">
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}

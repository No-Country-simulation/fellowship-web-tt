import { Button } from "@repo/ui/button";

import { logoutAdmin } from "@/lib/auth/actions";

type AdminSessionAsideProps = {
  email: string | undefined;
};

export function AdminSessionAside({ email }: AdminSessionAsideProps) {
  return (
    <aside
      aria-label="Sesión"
      className="shrink-0 border-b border-border bg-bg-surface-1 px-md py-md md:w-56 md:border-b-0 md:border-r"
    >
      <p className="text-overline text-text-secondary">Sesión</p>
      <p className="mt-xs break-all text-body-small text-text-primary">
        {email ?? "Sin email"}
      </p>
      <form action={logoutAdmin} className="mt-md">
        <Button type="submit" variant="outline" size="sm">
          Cerrar sesión
        </Button>
      </form>
    </aside>
  );
}

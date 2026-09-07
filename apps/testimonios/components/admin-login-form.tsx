"use client";

import { useActionState } from "react";
import { Button } from "@repo/ui/button";

import { loginAdmin } from "@/lib/auth/actions";
import { initialLoginState } from "@/lib/auth/login-state";

import { Field, fieldClassName } from "./enviar-fields";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAdmin,
    initialLoginState,
  );

  return (
    <form action={formAction} className="mt-md flex w-full flex-col gap-sm">
      <Field label="Email">
        {({ id, describedBy, invalid }) => (
          <input
            id={id}
            name="email"
            type="email"
            autoComplete="username"
            required
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={fieldClassName}
          />
        )}
      </Field>
      <Field label="Contraseña">
        {({ id, describedBy, invalid }) => (
          <input
            id={id}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={fieldClassName}
          />
        )}
      </Field>
      {state.status === "error" ? (
        <p className="text-body-small text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" variant="gradient" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}

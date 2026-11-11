"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { NavLinks } from "./NavLinks";

/** Menú hamburguesa: reemplaza al sidebar por debajo de `md`. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen(true)}
        className="-ml-2 flex size-10 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
      >
        <Menu className="size-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-foreground/25" aria-hidden />
          <aside
            id="mobile-nav"
            onClick={(event) => event.stopPropagation()}
            className="relative flex h-dvh w-64 max-w-[85vw] flex-col border-r border-border bg-sidebar shadow-lg"
          >
            <div className="flex h-12 items-center justify-between gap-2 border-b border-border pl-4 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">NoCountry</span>
                <span className="rounded border border-border px-1.5 py-0.5 text-admin-micro uppercase tracking-widest text-muted-foreground">
                  Admin
                </span>
              </div>
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
                className="flex size-10 cursor-pointer items-center justify-center rounded text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <NavLinks onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}

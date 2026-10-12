import Link from "next/link";

import { BrandLogo } from "@repo/ui/brand-logo";

import { publicNav } from "@/lib/nav";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Chrome del layout: logo y nav. Solo en `app/layout.tsx`. */
export function SiteHeader() {
  return (
    <header className="shrink-0 border-b border-border bg-bg-surface-1 px-md">
      <div className="container-content grid grid-cols-[1fr_auto_1fr] items-center gap-sm py-sm">
        <BrandLogo loading="eager" className="justify-self-start">
          <span className="hidden text-body-small text-text-secondary sm:inline">
            {SITE_NAME}
          </span>
        </BrandLogo>
        <nav
          aria-label="Principal"
          className="flex items-center justify-center gap-xs"
        >
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-button px-xs py-1 text-body-small text-text-secondary",
                "hover:bg-bg-white-a5 hover:text-text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0 justify-self-end" />
      </div>
    </header>
  );
}

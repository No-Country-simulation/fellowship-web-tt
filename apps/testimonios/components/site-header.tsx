import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { publicNav, staffNav } from "@/lib/nav";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Chrome del layout: logo + nav. Solo en `app/layout.tsx`. */
export function SiteHeader() {
  return (
    <header className="shrink-0 border-b border-border bg-bg-surface-1 px-md">
      <div className="container-content flex items-center justify-between gap-sm py-sm">
        <BrandLogo loading="eager">
          <span className="text-body-small text-text-secondary">{SITE_NAME}</span>
        </BrandLogo>
        <nav aria-label="Principal" className="flex items-center gap-xs">
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
          {staffNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-button px-xs py-1 text-body-small text-text-muted",
                "hover:bg-bg-white-a5 hover:text-text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

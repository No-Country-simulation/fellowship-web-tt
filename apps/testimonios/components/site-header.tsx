import Link from "next/link";

import { BrandLogo } from "@repo/ui/brand-logo";

import { AdminSession } from "@/components/admin-session";
import { getAdminUser } from "@/lib/auth/admin";
import { publicNav, staffNav } from "@/lib/nav";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Chrome del layout: logo | nav | sesión. Solo en `app/layout.tsx`. */
export async function SiteHeader() {
  const admin = await getAdminUser();

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
        <div className="min-w-0 justify-self-end">
          {admin ? <AdminSession email={admin.email} /> : null}
        </div>
      </div>
    </header>
  );
}

"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { ChevronDownIcon, MenuIcon } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  headerNav,
  isNavGroup,
  loginNav,
  PLACEHOLDER_HREF,
  type NavLink,
} from "@/lib/nav"
import { cn } from "@/lib/utils"

/**
 * Header HF: logo a la izquierda, nav en línea, “Iniciar sesión” como
 * link de texto a la derecha.
 */
function SiteHeader() {
  return (
    <header className="relative z-40 min-w-0 overflow-x-clip bg-transparent">
      <div className="px-md md:px-3xl">
        <div className="container-content flex h-[4.5rem] min-w-0 items-center gap-lg">
          <BrandLogo priority />
          <DesktopNav />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

function DesktopNav() {
  return (
    <div className="hidden min-w-0 flex-1 items-center xl:flex">
      <NavigationMenu aria-label="Principal" className="min-w-0 max-w-full">
        <NavigationMenuList>
          {headerNav.map((item) => (
            <NavigationMenuItem key={item.label}>
              {isNavGroup(item) ? (
                <NavDropdown label={item.label} items={item.children} />
              ) : (
                <NavigationMenuLink
                  render={<ChromeAnchor href={item.href} />}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent text-text-secondary hover:bg-transparent hover:text-text-primary"
                  )}
                >
                  {item.label}
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <a
        href={loginNav.href}
        className="ml-auto text-body text-text-secondary transition-colors hover:text-text-primary"
      >
        {loginNav.label}
      </a>
    </div>
  )
}

function NavDropdown({ label, items }: { label: string; items: NavLink[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="bg-transparent text-text-secondary hover:bg-transparent hover:text-text-primary"
          />
        }
      >
        {label}
        <ChevronDownIcon className="size-3" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            disabled={item.disabled}
            nativeButton={false}
            render={
              item.disabled ? undefined : <ChromeAnchor href={item.href} />
            }
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="ml-auto xl:hidden" />
        }
      >
        <MenuIcon />
        <span className="sr-only">Abrir menú</span>
      </SheetTrigger>
      <SheetContent side="right" className="xl:hidden">
        <SheetHeader>
          <SheetTitle>Menú</SheetTitle>
          <SheetDescription className="sr-only">
            Navegación del sitio
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-sm px-4">
          {headerNav.map((item) =>
            isNavGroup(item) ? (
              <div key={item.label} className="flex flex-col gap-1">
                <p className="text-overline px-2 text-text-muted">
                  {item.label}
                </p>
                {item.children.map((child) => (
                  <MobileNavLink key={child.label} item={child} />
                ))}
              </div>
            ) : (
              <MobileNavLink key={item.label} item={item} />
            )
          )}
        </nav>
        <SheetFooter>
          <SheetClose
            nativeButton={false}
            render={
              <a
                href={loginNav.href}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full"
                )}
              />
            }
          >
            {loginNav.label}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function MobileNavLink({ item }: { item: NavLink }) {
  if (item.disabled) {
    return (
      <span className="rounded-md px-2 py-1.5 text-sm text-text-muted">
        {item.label}
      </span>
    )
  }

  return (
    <SheetClose
      nativeButton={false}
      render={
        <ChromeAnchor
          href={item.href}
          className="rounded-md px-2 py-1.5 text-sm text-text-primary hover:bg-muted"
        />
      }
    >
      {item.label}
    </SheetClose>
  )
}

function ChromeAnchor({
  href,
  className,
  children,
  ...props
}: ComponentProps<"a"> & { href: string }) {
  if (href === PLACEHOLDER_HREF) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  )
}

export { SiteHeader }

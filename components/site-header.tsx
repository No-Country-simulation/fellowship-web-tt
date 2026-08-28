"use client"

import type { ComponentProps } from "react"
import Link from "next/link"
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react"

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

const loginButtonClassName = cn(
  buttonVariants({ variant: "outline" }),
  "h-9 border-brand-pink bg-transparent px-5 text-brand-pink hover:bg-brand-pink/10 hover:text-brand-pink dark:border-brand-pink dark:bg-transparent dark:hover:bg-brand-pink/10 dark:hover:text-brand-pink"
)

const navLinkClassName = cn(
  navigationMenuTriggerStyle(),
  "h-auto bg-transparent px-0 py-0 font-normal whitespace-nowrap text-text-secondary hover:bg-transparent hover:text-text-primary focus:bg-transparent"
)

/**
 * Header: logo a la izquierda, nav centrado, “Iniciar Sesión”
 * como botón outlined a la derecha. Padding más compacto que
 * el frame de página (`Section` / footer).
 */
function SiteHeader() {
  return (
    <header className="relative z-40 min-w-0 overflow-x-clip bg-transparent">
      <div className="relative flex h-[4.5rem] min-w-0 items-center justify-between gap-lg px-sm md:px-lg">
        <BrandLogo loading="eager" />
        <DesktopNav />
        <div className="flex shrink-0 items-center">
          <ChromeAnchor
            href={loginNav.href}
            className={cn(loginButtonClassName, "hidden xl:inline-flex")}
          >
            {loginNav.label}
          </ChromeAnchor>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

function DesktopNav() {
  return (
    <NavigationMenu
      aria-label="Principal"
      className="absolute top-1/2 left-1/2 hidden min-w-0 max-w-[calc(100%-22rem)] -translate-x-1/2 -translate-y-1/2 xl:flex"
    >
      <NavigationMenuList className="gap-6">
        {headerNav.map((item) => (
          <NavigationMenuItem key={item.label}>
            {isNavGroup(item) ? (
              <NavDropdown label={item.label} items={item.children} />
            ) : (
              <NavigationMenuLink
                render={<ChromeAnchor href={item.href} />}
                className={navLinkClassName}
              >
                {item.label}
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
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
      <SheetContent
        side="right"
        showCloseButton={false}
        className="inset-0 h-dvh w-full gap-0 overflow-y-auto border-0 bg-bg-base p-0 shadow-none data-[side=right]:w-full data-[side=right]:border-0 data-[side=right]:sm:max-w-none xl:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menú</SheetTitle>
          <SheetDescription>Navegación del sitio</SheetDescription>
        </SheetHeader>
        <div className="flex h-[4.5rem] shrink-0 items-center justify-between gap-lg px-sm md:px-lg">
          <SheetClose
            nativeButton={false}
            render={<BrandLogo loading="eager" />}
          />
          <SheetClose
            render={
              <Button
                variant="outline"
                size="icon"
                className="border-border bg-transparent text-text-primary hover:bg-muted hover:text-text-primary"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Cerrar menú</span>
          </SheetClose>
        </div>
        <nav className="flex flex-col px-sm pt-md md:px-lg">
          {headerNav.map((item) =>
            isNavGroup(item) ? (
              <div key={item.label} className="flex flex-col">
                <p className="text-overline py-sm text-text-muted">
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
        <SheetFooter className="px-sm pt-0 pb-lg md:px-lg">
          <SheetClose
            nativeButton={false}
            render={
              <ChromeAnchor
                href={loginNav.href}
                className={cn(loginButtonClassName, "h-10 w-full")}
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
  const className = "text-body py-sm text-text-secondary transition-colors"

  if (item.disabled) {
    return <span className={cn(className, "text-text-muted")}>{item.label}</span>
  }

  return (
    <SheetClose
      nativeButton={false}
      render={
        <ChromeAnchor
          href={item.href}
          className={cn(className, "hover:text-text-primary")}
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
  const isExternal = href.startsWith("http://") || href.startsWith("https://")

  if (href === PLACEHOLDER_HREF || isExternal) {
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

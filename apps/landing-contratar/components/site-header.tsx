"use client"

import { useState, type ComponentProps } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react"
import { Button, buttonVariants } from "@repo/ui/button"

import { BrandLogo } from "@/components/brand-logo"
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
  type NavItem,
  type NavLink,
} from "@/lib/nav"
import { cn } from "@/lib/utils"

const loginButtonClassName = cn(
  buttonVariants({ variant: "outline" }),
  "h-9 border-brand-pink bg-transparent px-5 text-brand-pink hover:bg-bg-pink-a10 hover:text-brand-pink dark:border-brand-pink dark:bg-transparent dark:hover:bg-bg-pink-a10 dark:hover:text-brand-pink"
)

const navChromeClassName = cn(
  "nav-item-type inline-flex items-center gap-1 rounded-md px-xs py-xs -mx-xs whitespace-nowrap outline-none transition-colors",
  "bg-transparent data-open:bg-transparent data-popup-open:bg-transparent aria-expanded:bg-transparent",
  "data-open:hover:bg-bg-white-a5 data-popup-open:hover:bg-bg-white-a5"
)

const navPopoverClassName = cn(
  "flex w-max min-w-0 flex-col gap-0 rounded-md border border-border bg-bg-surface-1 p-xs text-text-secondary shadow-none ring-0"
)

function isCurrentHref(href: string, pathname: string) {
  return href === pathname
}

function isCurrentNavItem(item: NavItem, pathname: string) {
  if (isNavGroup(item)) {
    return item.children.some((child) => isCurrentHref(child.href, pathname))
  }

  return isCurrentHref(item.href, pathname)
}

function navItemClassName(isCurrent: boolean) {
  return cn(
    navChromeClassName,
    isCurrent
      ? "hover:bg-transparent data-open:hover:bg-transparent data-popup-open:hover:bg-transparent"
      : "text-text-secondary hover:bg-bg-white-a5 hover:text-text-primary"
  )
}

/**
 * Header: logo a la izquierda, nav centrado, “Iniciar Sesión”
 * como botón outlined a la derecha. Padding más compacto que
 * el frame de página (`Section` / footer).
 */
function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="relative z-40 min-w-0 overflow-x-clip bg-transparent">
      <div className="relative flex h-[4.5rem] min-w-0 items-center justify-between gap-lg px-sm md:px-lg">
        <BrandLogo loading="eager" />
        <DesktopNav pathname={pathname} />
        <div className="flex shrink-0 items-center">
          <ChromeAnchor
            href={loginNav.href}
            className={cn(loginButtonClassName, "hidden xl:inline-flex")}
          >
            {loginNav.label}
          </ChromeAnchor>
          <MobileNav pathname={pathname} />
        </div>
      </div>
    </header>
  )
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <NavigationMenu
      aria-label="Principal"
      className="absolute top-1/2 left-1/2 hidden min-w-0 max-w-[calc(100%-22rem)] -translate-x-1/2 -translate-y-1/2 xl:flex"
    >
      <NavigationMenuList className="gap-md">
        {headerNav.map((item) => {
          const isCurrent = isCurrentNavItem(item, pathname)

          return (
            <NavigationMenuItem key={item.label}>
              {isNavGroup(item) ? (
                <NavDropdown
                  label={item.label}
                  items={item.children}
                  isCurrent={isCurrent}
                  pathname={pathname}
                />
              ) : (
                <NavigationMenuLink
                  active={isCurrent}
                  render={<ChromeAnchor href={item.href} />}
                  className={navItemClassName(isCurrent)}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {item.label}
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function NavDropdown({
  label,
  items,
  isCurrent,
  pathname,
}: {
  label: string
  items: NavLink[]
  isCurrent: boolean
  pathname: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={navItemClassName(isCurrent)}>
        <span className={isCurrent ? "text-brand-gradient" : undefined}>
          {label}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-3 shrink-0",
            isCurrent ? "text-brand-cyan" : "text-current"
          )}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className={navPopoverClassName}
      >
        {items.map((item) => {
          const itemIsCurrent = isCurrentHref(item.href, pathname)

          return (
            <DropdownMenuItem
              key={item.label}
              disabled={item.disabled}
              nativeButton={false}
              className={cn(
                "nav-item-type cursor-pointer rounded-md px-sm py-xs whitespace-nowrap outline-none",
                itemIsCurrent
                  ? "hover:bg-transparent focus:bg-transparent data-highlighted:bg-transparent data-[highlighted]:bg-transparent"
                  : "bg-transparent text-text-secondary hover:bg-bg-white-a5 hover:text-text-primary focus:bg-bg-white-a5 focus:text-text-primary data-highlighted:bg-bg-white-a5 data-highlighted:text-text-primary data-[highlighted]:bg-bg-white-a5 data-[highlighted]:text-text-primary"
              )}
              render={
                item.disabled ? undefined : <ChromeAnchor href={item.href} />
              }
            >
              <span className={itemIsCurrent ? "text-brand-gradient" : undefined}>
                {item.label}
              </span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileNav({ pathname }: { pathname: string }) {
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
        <nav className="flex flex-1 flex-col px-sm pt-md md:px-lg">
          {headerNav.map((item) =>
            isNavGroup(item) ? (
              <MobileNavGroup
                key={item.label}
                label={item.label}
                items={item.children}
                pathname={pathname}
              />
            ) : (
              <MobileNavLink
                key={item.label}
                item={item}
                isCurrent={isCurrentHref(item.href, pathname)}
              />
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

function MobileNavGroup({
  label,
  items,
  pathname,
}: {
  label: string
  items: NavLink[]
  pathname: string
}) {
  const isCurrent = items.some((item) => isCurrentHref(item.href, pathname))
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col">
      <button
        type="button"
        className={cn(
          "nav-item-type inline-flex items-center gap-1 py-sm text-left transition-colors",
          !isCurrent && "text-text-secondary hover:text-text-primary"
        )}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={isCurrent ? "text-brand-gradient" : undefined}>
          {label}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-3 shrink-0 transition-transform",
            isCurrent ? "text-brand-cyan" : "text-current",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div className="flex flex-col pl-md">
          {items.map((item) => (
            <MobileNavLink
              key={item.label}
              item={item}
              isCurrent={isCurrentHref(item.href, pathname)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function MobileNavLink({
  item,
  isCurrent,
}: {
  item: NavLink
  isCurrent: boolean
}) {
  const className = cn(
    "nav-item-type inline-flex self-start py-sm",
    !isCurrent && "text-text-secondary hover:text-text-primary"
  )

  const label = (
    <span className={isCurrent ? "text-brand-gradient" : undefined}>
      {item.label}
    </span>
  )

  if (item.disabled) {
    return <span className={cn(className, "text-text-muted")}>{label}</span>
  }

  return (
    <SheetClose
      nativeButton={false}
      render={
        <ChromeAnchor
          href={item.href}
          className={className}
          aria-current={isCurrent ? "page" : undefined}
        />
      }
    >
      {label}
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

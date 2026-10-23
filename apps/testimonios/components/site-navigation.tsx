"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";

import {
  institutionalDestinations,
  institutionalNavigation,
  navigationGroups,
  type NavigationGroupId,
} from "@/lib/nav";

import styles from "./site-header.module.css";

type DisclosureProps = {
  group: NavigationGroupId;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  mobile?: boolean;
  onNavigate?: () => void;
};

function NavigationDisclosure({ group, expanded, onExpandedChange, mobile = false, onNavigate }: DisclosureProps) {
  const id = useId();
  const itemRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const definition = navigationGroups[group];

  useEffect(() => {
    if (!expanded || mobile) return;
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !itemRef.current?.contains(event.target)) onExpandedChange(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [expanded, mobile, onExpandedChange]);

  return (
    <li ref={itemRef} className={mobile ? styles.mobileGroup : styles.desktopGroup}
      onBlur={mobile ? undefined : (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onExpandedChange(false);
      }}
      onKeyDown={mobile ? undefined : (event) => {
        if (event.key === "Escape" && expanded) {
          event.preventDefault();
          event.stopPropagation();
          onExpandedChange(false);
          triggerRef.current?.focus({ preventScroll: true });
        }
      }}>
      <button ref={triggerRef} id={`${id}-trigger`} type="button" aria-expanded={expanded}
        aria-controls={`${id}-links`} className={styles.disclosureTrigger}
        onClick={() => onExpandedChange(!expanded)}>
        <span>{definition.label}</span>
        <ChevronDown aria-hidden="true" className={styles.chevron} />
      </button>
      <ul id={`${id}-links`} aria-labelledby={`${id}-trigger`} aria-hidden={!expanded}
        inert={!expanded} hidden={mobile && !expanded} data-open={expanded}
        className={mobile ? styles.mobilePanel : styles.desktopPanel}>
        {definition.destinations.map((destination) => {
          const item = institutionalDestinations[destination];
          return (
            <li key={destination}>
              <a href={item.href} className={styles.panelLink} onClick={(event) => {
                if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                  onExpandedChange(false);
                  onNavigate?.();
                }
              }}>{item.label}</a>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

function LiveSignal() {
  const id = useId();
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 36 14" width="36" height="14" className={styles.liveSignal}>
      <defs>
        <linearGradient id={`${id}-stroke`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--brand-pink)" />
          <stop offset="1" stopColor="var(--brand-cyan)" />
        </linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.45" stopColor="white" />
        </linearGradient>
        <mask id={`${id}-mask`}><rect width="36" height="14" fill={`url(#${id}-fade)`} /></mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <path d="M0,8 L3,6 L6,9 L9,4 L12,7 L15,2 L18,8 L21,5 L24,10 L27,3 L30,7 L33,8 L36,8 L39,6 L42,9 L45,4 L48,7 L51,2 L54,8 L57,5 L60,10 L63,3 L66,7 L69,8 L72,8" fill="none" stroke={`url(#${id}-stroke)`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

function LiveLink({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <a href={institutionalDestinations.live.href} className={styles.liveLink} onClick={onNavigate}>
      <LiveSignal /><span>{institutionalDestinations.live.label}</span>
    </a>
  );
}

/** Límite cliente del header: disclosures, ajuste por espacio real y diálogo móvil. */
export function SiteNavigation({ logo }: { logo: ReactNode }) {
  const id = useId();
  const [compact, setCompact] = useState(true);
  const [desktopOpen, setDesktopOpen] = useState<NavigationGroupId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroups, setMobileGroups] = useState<NavigationGroupId[]>([]);
  const compactRef = useRef(true);
  const rowRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const logoElement = logoRef.current;
    const primary = primaryRef.current;
    const actions = actionsRef.current;
    const header = row?.closest("header");
    if (!row || !logoElement || !primary || !actions || !header) return;
    const root = document.documentElement;
    const previousHeight = root.style.getPropertyValue("--site-header-height");
    let mounted = true;
    let focusFrame = 0;

    function measure() {
      if (!mounted || !row || !logoElement || !primary || !actions || !header) return;
      const rowStyle = getComputedStyle(row);
      const available = row.clientWidth - parseFloat(rowStyle.paddingLeft) - parseFloat(rowStyle.paddingRight);
      // Los dos gaps coinciden con los de la fila y el bloque desktop.
      const required = logoElement.getBoundingClientRect().width + primary.getBoundingClientRect().width +
        actions.getBoundingClientRect().width + 2 * parseFloat(rowStyle.columnGap);
      const nextCompact = window.innerWidth < 1280 || required > available;
      if (compactRef.current !== nextCompact) {
        const active = document.activeElement;
        const desktopHadFocus = primary.contains(active) || actions.contains(active);
        compactRef.current = nextCompact;
        setCompact(nextCompact);
        setDesktopOpen(null);
        if (nextCompact && desktopHadFocus) {
          focusFrame = requestAnimationFrame(() => toggleRef.current?.focus({ preventScroll: true }));
        } else if (!nextCompact) {
          if (dialogRef.current?.open) dialogRef.current.close();
          else if (active === toggleRef.current) {
            focusFrame = requestAnimationFrame(() => primary.querySelector<HTMLElement>("button, a")?.focus({ preventScroll: true }));
          }
        }
      }
      root.style.setProperty("--site-header-height", `${header.getBoundingClientRect().height}px`);
    }

    const observer = new ResizeObserver(measure);
    [row, logoElement, primary, actions].forEach((element) => observer.observe(element));
    measure();
    void document.fonts.ready.then(measure);
    return () => {
      mounted = false;
      observer.disconnect();
      cancelAnimationFrame(focusFrame);
      if (previousHeight) root.style.setProperty("--site-header-height", previousHeight);
      else root.style.removeProperty("--site-header-height");
    };
  }, []);

  function closeMobile() { dialogRef.current?.close(); }

  function containMobileTab(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)"))
      .filter((element) => !element.closest("[inert]") && element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function changeMobileGroup(group: NavigationGroupId, expanded: boolean) {
    setMobileGroups((groups) => expanded ? [...groups, group] : groups.filter((item) => item !== group));
  }

  const mobileDisclosure = (group: NavigationGroupId) => (
    <NavigationDisclosure key={group} group={group} mobile expanded={mobileGroups.includes(group)}
      onExpandedChange={(expanded) => changeMobileGroup(group, expanded)} onNavigate={closeMobile} />
  );

  return (
    <>
      <div ref={rowRef} className={styles.row} data-compact={compact}>
        <div ref={logoRef} className={styles.logoSlot}>{logo}</div>
        <div className={styles.desktopSlot} inert={compact} aria-hidden={compact}>
          <div className={styles.desktop}>
            <nav ref={primaryRef} aria-label="No Country" className={styles.primary}>
              <ul className={styles.primaryList}>
                {institutionalNavigation.map((item) => item.kind === "group" ? (
                  <NavigationDisclosure key={item.group} group={item.group} expanded={desktopOpen === item.group}
                    onExpandedChange={(expanded) => setDesktopOpen(expanded ? item.group : null)} />
                ) : (
                  <li key={item.destination}>
                    <a href={institutionalDestinations[item.destination].href} className={styles.directLink}>
                      {institutionalDestinations[item.destination].label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <ul ref={actionsRef} className={styles.actions} aria-label="Simulación y acceso a portales">
              <li><LiveLink /></li>
              <NavigationDisclosure group="login" expanded={desktopOpen === "login"}
                onExpandedChange={(expanded) => setDesktopOpen(expanded ? "login" : null)} />
            </ul>
          </div>
        </div>
        <button ref={toggleRef} type="button" className={styles.mobileToggle} aria-label="Abrir navegación"
          aria-haspopup="dialog" aria-expanded={mobileOpen} aria-controls={`${id}-mobile`}
          onClick={() => {
            dialogRef.current?.showModal();
            setMobileOpen(true);
            closeRef.current?.focus({ preventScroll: true });
          }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            className="lucide lucide-menu" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <dialog ref={dialogRef} id={`${id}-mobile`} aria-labelledby={`${id}-title`} className={styles.mobileDialog}
        onKeyDown={containMobileTab}
        onClose={() => {
          setMobileOpen(false);
          setMobileGroups([]);
          requestAnimationFrame(() => {
            if (dialogRef.current?.open) return;
            const target = compactRef.current ? toggleRef.current : primaryRef.current?.querySelector<HTMLElement>("button, a");
            target?.focus({ preventScroll: true });
          });
        }}>
        <h2 id={`${id}-title`} className="sr-only">Navegación de No Country</h2>
        <div className={styles.mobileToolbar}>
          <div className={styles.logoSlot}>{logo}</div>
          <button ref={closeRef} type="button" aria-label="Cerrar navegación" className={styles.closeButton} onClick={closeMobile}>
            <X aria-hidden="true" size={24} />
          </button>
        </div>
        <nav aria-label="No Country" className={styles.mobileContent}>
          <ul className={styles.mobileList}>
            {institutionalNavigation.map((item) => item.kind === "group" ? mobileDisclosure(item.group) : (
              <li key={item.destination}>
                <a href={institutionalDestinations[item.destination].href} className={styles.directLink} onClick={closeMobile}>
                  {institutionalDestinations[item.destination].label}
                </a>
              </li>
            ))}
            <li><LiveLink onNavigate={closeMobile} /></li>
            {mobileDisclosure("login")}
          </ul>
        </nav>
      </dialog>
    </>
  );
}

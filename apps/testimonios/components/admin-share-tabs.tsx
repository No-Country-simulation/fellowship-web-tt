"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const TABS = [
  { id: "discord", label: "Discord" },
  { id: "instagram", label: "Instagram" },
] as const;

type ShareTab = (typeof TABS)[number]["id"];

type AdminShareTabsProps = {
  discord: ReactNode;
  instagram: ReactNode;
};

/** Tabs de preview por red. Discord primero. Los paneles quedan montados. */
export function AdminShareTabs({ discord, instagram }: AdminShareTabsProps) {
  const [tab, setTab] = useState<ShareTab>("discord");
  const baseId = useId();
  const tabRefs = useRef<Partial<Record<ShareTab, HTMLButtonElement | null>>>({});

  function selectTab(next: ShareTab) {
    setTab(next);
    tabRefs.current[next]?.focus();
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }
    event.preventDefault();
    selectTab(tab === "discord" ? "instagram" : "discord");
  }

  return (
    <div className="flex min-w-0 flex-col gap-md">
      <div
        role="tablist"
        aria-label="Red social"
        className="flex flex-wrap gap-xs"
      >
        {TABS.map(({ id, label }) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              id={`${baseId}-${id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-${id}-panel`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "rounded-button border px-sm py-xs text-body-small transition-colors",
                selected
                  ? "border-accent-cyan/70 bg-bg-surface-3 text-text-primary"
                  : "border-border bg-card text-text-secondary hover:border-accent-cyan/40 hover:text-text-primary",
              )}
              ref={(node) => {
                tabRefs.current[id] = node;
              }}
              onClick={() => setTab(id)}
              onKeyDown={onTabKeyDown}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        id={`${baseId}-discord-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-discord`}
        hidden={tab !== "discord"}
        className="min-w-0 rounded-md border border-border bg-card p-md"
      >
        <div className="w-full md:w-1/2">{discord}</div>
      </div>
      <div
        id={`${baseId}-instagram-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-instagram`}
        hidden={tab !== "instagram"}
        className="min-w-0 rounded-md border border-border bg-card p-md"
      >
        {instagram}
      </div>
    </div>
  );
}

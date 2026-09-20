"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const TABS = [
  { id: "discord", label: "Discord" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
] as const;

type ShareTab = (typeof TABS)[number]["id"];

type AdminShareTabsProps = {
  discord: ReactNode;
  instagram: ReactNode;
  linkedin: ReactNode;
};

/** Tabs de preview por red. Discord primero. Los paneles quedan montados. */
export function AdminShareTabs({
  discord,
  instagram,
  linkedin,
}: AdminShareTabsProps) {
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
    const index = TABS.findIndex((item) => item.id === tab);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = TABS[(index + delta + TABS.length) % TABS.length];
    if (next) {
      selectTab(next.id);
    }
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

      {(
        [
          { id: "discord", content: discord },
          { id: "instagram", content: instagram },
          { id: "linkedin", content: linkedin },
        ] as const
      ).map(({ id, content }) => (
        <div
          key={id}
          id={`${baseId}-${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-${id}`}
          hidden={tab !== id}
          className="min-w-0 rounded-md border border-border bg-card p-md"
        >
          <div className="w-full">{content}</div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { cn } from "@repo/ui/utils";

import {
  CARD_DESIGN_OPTIONS,
  type CardDesign,
  type TestimonialType,
} from "../types/testimonial";

/** Elige el diseño de la card entre los del tipo. La preview se redibuja al cambiar. */
export function CardDesignField({
  type,
  value,
  onChange,
}: {
  type: TestimonialType;
  value: CardDesign;
  onChange: (value: CardDesign) => void;
}) {
  const options = CARD_DESIGN_OPTIONS[type];
  const selected = options.find((option) => option.value === value);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-admin-caption text-foreground">Diseño de la imagen</legend>
      <div className="grid grid-cols-3 gap-0.5 rounded-md border border-border bg-muted p-0.5">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={`text-admin-micro ${cn(
                "cursor-pointer rounded px-1.5 py-1 text-center transition-colors",
                "has-focus-visible:ring-2 has-focus-visible:ring-ring/40",
                checked
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}`}
            >
              <input
                type="radio"
                name="card_design"
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {selected ? (
        <p className="text-admin-caption text-muted-foreground">{selected.description}</p>
      ) : null}
    </fieldset>
  );
}

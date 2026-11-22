import { Button } from "@rakazo/ui-web";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

export type FilterChipOption<Key extends string> = { key: Key | null; label: ReactNode };

/**
 * One row of filter chips with a fixed height. On a phone the row scrolls sideways instead of
 * wrapping, so picking a chip never changes the row's height or moves what's below it.
 */
export function FilterChips<Key extends string>({
  options,
  value,
  onChange,
  label,
  testId,
  className = "",
}: {
  options: readonly FilterChipOption<Key>[];
  value: Key | null;
  onChange: (key: Key | null) => void;
  label: string;
  testId?: string;
  /** e.g. negative margins so the sideways-scrolling row runs to the panel's edges. */
  className?: string;
}) {
  const row = useRef<HTMLFieldSetElement>(null);
  // Keep the picked chip in view when the row scrolls sideways, without scrolling the page.
  useEffect(() => {
    const element = row.current;
    const chip = element?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!element || !chip) return;
    const start = chip.offsetLeft - element.offsetLeft;
    const end = start + chip.offsetWidth;
    if (start < element.scrollLeft) element.scrollLeft = start;
    else if (end > element.scrollLeft + element.clientWidth)
      element.scrollLeft = end - element.clientWidth;
  }, [value]);
  return (
    <fieldset
      ref={row}
      aria-label={label}
      data-testid={testId}
      className={`no-scrollbar m-0 flex h-8 min-w-0 shrink-0 flex-nowrap gap-2 overflow-x-auto border-0 p-0 sm:h-auto sm:flex-wrap sm:overflow-visible ${className}`}
    >
      {options.map((option) => (
        <Button
          key={option.key ?? "all"}
          type="button"
          variant={value === option.key ? "default" : "secondary"}
          aria-pressed={value === option.key}
          className="shrink-0 rounded-full px-3.5 text-body-sm active:not-aria-[haspopup]:translate-y-0"
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </Button>
      ))}
    </fieldset>
  );
}

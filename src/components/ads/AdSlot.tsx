interface AdSlotProps {
  variant: "leaderboard" | "in-article" | "sidebar";
  className?: string;
}

const DIMENSIONS: Record<AdSlotProps["variant"], string> = {
  leaderboard: "min-h-[90px] w-full max-w-[728px] mx-auto",
  "in-article": "min-h-[250px] w-full",
  sidebar: "min-h-[600px] w-full max-w-[300px]",
};

/**
 * Empty ad placeholder. Intentionally renders nothing but a labeled,
 * correctly-sized reserved space — no fake ad content. Swap the body
 * of this component for real AdSense markup once the account is approved;
 * the reserved dimensions prevent layout shift when that happens.
 */
export function AdSlot({ variant, className = "" }: AdSlotProps) {
  return (
    <div
      data-ad-slot={variant}
      className={`${DIMENSIONS[variant]} ${className} flex items-center justify-center rounded border border-dashed border-neutral-300 bg-neutral-50 text-xs text-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-600`}
      aria-hidden="true"
    >
      Ad space reserved ({variant})
    </div>
  );
}

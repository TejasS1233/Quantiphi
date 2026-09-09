import { cn } from "@/lib/utils";

/** Pill toggles for switching currency pairs on any visual. */
export function PairPicker({ pairs, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {pairs.map(([b, t]) => {
        const key = `${b}-${t}`;
        const on = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-bold tabular-nums transition-all",
              on
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {b} → {t}
          </button>
        );
      })}
    </div>
  );
}

/** Pill toggles for day ranges. */
export function DaysPicker({ options = ["14", "30", "90"], value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-bold transition-all",
            String(value) === String(d)
              ? "border-primary/60 bg-primary/10 text-foreground"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          {d}D
        </button>
      ))}
    </div>
  );
}

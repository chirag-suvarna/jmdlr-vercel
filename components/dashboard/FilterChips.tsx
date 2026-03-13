export type FilterChip = {
  value: string;
  label: string;
  count?: number;
};

export type FilterChipsProps = {
  options: FilterChip[];
  active: string;
  onChange: (value: string) => void;
};

export default function FilterChips({ options, active, onChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.value === active;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              isActive
                ? "border-transparent bg-[color:var(--color-accent)] text-[color:var(--color-bg-primary)]"
                : "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)]"
            }`}
          >
            {option.label}
            {typeof option.count === "number" ? (
              <span className="ml-2 text-[11px] opacity-80">{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

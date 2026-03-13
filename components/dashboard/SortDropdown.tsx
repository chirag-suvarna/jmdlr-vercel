export type SortOption = {
  value: string;
  label: string;
};

export type SortDropdownProps = {
  value: string;
  options: SortOption[];
  onChange: (value: string) => void;
};

export default function SortDropdown({ value, options, onChange }: SortDropdownProps) {
  return (
    <div className="min-w-[180px]">
      <label className="sr-only" htmlFor="paper-sort">
        Sort papers
      </label>
      <select
        id="paper-sort"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-4 py-3 text-sm font-semibold text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)] transition duration-200 focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

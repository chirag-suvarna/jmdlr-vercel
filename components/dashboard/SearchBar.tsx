export type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <svg
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-secondary)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "Search papers"}
        className="w-full rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] py-3 pl-11 pr-4 text-sm text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)] transition duration-200 placeholder:text-[color:var(--color-text-secondary)] focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
      />
    </div>
  );
}

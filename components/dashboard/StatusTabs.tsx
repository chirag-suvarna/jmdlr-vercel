export type StatusTab = {
  value: string;
  label: string;
  count?: number;
};

export type StatusTabsProps = {
  active: string;
  onChange: (value: string) => void;
  tabs: StatusTab[];
};

export default function StatusTabs({ active, onChange, tabs }: StatusTabsProps) {
  return (
    <div className="flex items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-1 shadow-[var(--shadow-card)]">
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition duration-200 ${
              isActive
                ? "bg-[color:var(--color-link)] text-[color:var(--color-bg-primary)]"
                : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" ? ` (${tab.count})` : ""}
          </button>
        );
      })}
    </div>
  );
}

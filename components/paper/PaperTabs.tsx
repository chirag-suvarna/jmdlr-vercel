export type PaperTabOption = {
  id: "details" | "metrics";
  label: string;
};

export type PaperTabsProps = {
  tabs: PaperTabOption[];
  activeTab: PaperTabOption["id"];
  onChange: (tab: PaperTabOption["id"]) => void;
};

export default function PaperTabs({ tabs, activeTab, onChange }: PaperTabsProps) {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeTab)
  );

  return (
    <div
      className="relative flex w-full max-w-sm items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-1 text-xs font-semibold text-[color:var(--color-text-secondary)]"
      role="tablist"
      aria-label="Paper detail tabs"
    >
      <span
        className="pointer-events-none absolute inset-y-1 left-1 rounded-full bg-[color:var(--color-accent)] shadow-[var(--shadow-card)] transition-transform duration-200"
        style={{
          width: `${100 / tabs.length}%`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
        aria-hidden
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            const direction = event.key === "ArrowRight" ? 1 : -1;
            const nextIndex = (activeIndex + direction + tabs.length) % tabs.length;
            onChange(tabs[nextIndex].id);
          }}
          className={`relative z-10 flex-1 rounded-full px-4 py-1.5 transition duration-200 ${
            activeTab === tab.id
              ? "text-[color:var(--color-bg-primary)]"
              : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

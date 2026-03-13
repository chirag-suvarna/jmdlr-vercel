"use client";

export type SidebarTab = "metrics" | "comments";

export type SidebarTabsProps = {
  activeTab: SidebarTab;
  onChange: (tab: SidebarTab) => void;
};

export default function SidebarTabs({ activeTab, onChange }: SidebarTabsProps) {
  const tabClass = (tab: SidebarTab) =>
    `flex-1 rounded-full px-4 py-2 text-xs font-semibold transition duration-200 ${
      activeTab === tab
        ? "bg-[color:var(--color-accent)] text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)]"
        : "text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
    }`;

  return (
    <div className="flex items-center rounded-full border border-[color:var(--color-border)] bg-white/5 p-1">
      <button
        type="button"
        onClick={() => onChange("metrics")}
        className={tabClass("metrics")}
        aria-pressed={activeTab === "metrics"}
      >
        Metrics
      </button>
      <button
        type="button"
        onClick={() => onChange("comments")}
        className={tabClass("comments")}
        aria-pressed={activeTab === "comments"}
      >
        Comments
      </button>
    </div>
  );
}

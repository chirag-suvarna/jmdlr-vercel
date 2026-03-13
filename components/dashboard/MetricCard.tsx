import type { ReactNode } from "react";

export type MetricCardProps = {
  label: string;
  value: number | string;
  icon: ReactNode;
};

export default function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-4 py-3 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--color-bg-muted)] text-[color:var(--color-accent)]">
        {icon}
      </div>
      <div>
        <div className="text-lg font-semibold text-[color:var(--color-text-primary)]">
          {value}
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
          {label}
        </div>
      </div>
    </div>
  );
}

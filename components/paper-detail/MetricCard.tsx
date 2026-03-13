import type { ReactNode } from "react";

export type MetricCardProps = {
  icon: ReactNode;
  label: string;
  value: number | string;
};

const formatValue = (value: number | string) => {
  if (typeof value === "number") return value.toLocaleString();
  return value;
};

export default function MetricCard({ icon, label, value }: MetricCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-5 text-center shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5">
      <span className="text-[color:var(--color-link)]">{icon}</span>
      <span className="text-lg font-semibold text-[color:var(--color-text-primary)]">
        {formatValue(value)}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
        {label}
      </span>
    </div>
  );
}

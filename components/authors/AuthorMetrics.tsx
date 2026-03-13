type StatItem = {
  label: string;
  value: number | string;
};

type AuthorMetricsProps = {
  stats: StatItem[];
};

export default function AuthorMetrics({ stats }: AuthorMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
            {stat.label}
          </p>
          <p className="mt-1 text-lg font-semibold text-[color:var(--color-text-primary)]">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

type Stats = {
  papers?: number | null;
  authors?: number | null;
  citations?: number | null;
  downloads?: number | null;
};

type StatsSectionProps = {
  stats?: Stats | null;
};

const formatStat = (value?: number | null) => {
  if (typeof value !== "number") return "—";
  return value.toLocaleString();
};

export default function StatsSection({ stats }: StatsSectionProps) {
  const items = [
    { value: formatStat(stats?.papers), label: "Papers Published" },
    { value: formatStat(stats?.authors), label: "Authors" },
    { value: formatStat(stats?.citations), label: "Citations" },
    { value: formatStat(stats?.downloads), label: "Downloads" },
  ];

  return (
    <section className="px-6 pb-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid gap-6 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-6 py-6 text-center shadow-[var(--shadow-card)] sm:grid-cols-2 lg:grid-cols-4">
          {items.map((stat, index) => (
            <div key={stat.label} className="relative">
              <div className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
                {stat.value}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-secondary)]">
                {stat.label}
              </div>
              {index < items.length - 1 ? (
                <span className="absolute right-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-[color:var(--color-border)] lg:block" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

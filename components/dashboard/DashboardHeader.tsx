export type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  onUpload: () => void;
};

export default function DashboardHeader({
  title,
  subtitle,
  onUpload,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-[color:var(--color-text-primary)] sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-sm text-[color:var(--color-text-secondary)]">{subtitle}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onUpload}
        className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-xs font-semibold text-[color:var(--color-bg-primary)] shadow-[var(--shadow-card)] transition duration-200 hover:scale-[1.02] hover:bg-[color:var(--color-accent-hover)]"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
          +
        </span>
        Upload Paper
      </button>
    </div>
  );
}

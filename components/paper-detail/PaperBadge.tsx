export type PaperBadgeProps = {
  label: string;
};

export default function PaperBadge({ label }: PaperBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
      {label}
    </span>
  );
}

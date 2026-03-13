export type AbstractSectionProps = {
  abstract?: string | null;
};

export default function AbstractSection({ abstract }: AbstractSectionProps) {
  if (!abstract) return null;

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-5 shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
        Abstract
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-text-primary)]">
        {abstract}
      </p>
    </div>
  );
}

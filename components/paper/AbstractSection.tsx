export type AbstractSectionProps = {
  abstract?: string | null;
};

export default function AbstractSection({ abstract }: AbstractSectionProps) {
  if (!abstract) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
        Abstract
      </h3>
      <p className="max-w-[65ch] text-[16px] leading-[1.7] text-[color:var(--color-text-secondary)]">
        {abstract}
      </p>
    </section>
  );
}

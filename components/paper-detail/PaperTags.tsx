export type PaperTagsProps = {
  tags: string[];
};

export default function PaperTags({ tags }: PaperTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-5 shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
        Tags
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-primary)]"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export type TagsSectionProps = {
  tags: string[];
};

export default function TagsSection({ tags }: TagsSectionProps) {
  if (!tags.length) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
        Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-secondary)]"
          >
            #{tag}
          </span>
        ))}
      </div>
    </section>
  );
}

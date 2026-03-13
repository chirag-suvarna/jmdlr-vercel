import type { PaperReferenceItem } from "@/components/paper/types";

export type ReferencesSectionProps = {
  items: PaperReferenceItem[];
  loading?: boolean;
  onPaperSelect: (paper: PaperReferenceItem) => void;
  onAuthorSelect?: (paper: PaperReferenceItem) => void;
};

export default function ReferencesSection({
  items,
  loading,
  onPaperSelect,
  onAuthorSelect,
}: ReferencesSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
        References
      </h3>
      {loading ? (
        <p className="text-sm text-[color:var(--color-text-secondary)]">Loading...</p>
      ) : items.length > 0 ? (
        <ul className="space-y-2 text-sm text-[color:var(--color-text-secondary)]">
          {items.slice(0, 5).map((paper) => (
            <li key={paper.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onPaperSelect(paper)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onPaperSelect(paper);
                  }
                }}
                className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-2 transition hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)]"
              >
                <p className="font-semibold text-[color:var(--color-text-primary)]">
                  {paper.title}
                </p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onAuthorSelect?.(paper);
                  }}
                  className="text-xs font-semibold text-[color:var(--color-link)] hover:text-[color:var(--color-text-primary)]"
                >
                  {paper.author}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          No references available.
        </p>
      )}
    </section>
  );
}

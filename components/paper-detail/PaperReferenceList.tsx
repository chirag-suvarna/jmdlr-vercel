import type { AuthorProfile } from "@/components/paper-detail/types";

export type PaperReferenceItem = {
  id: number;
  title: string;
  author: string;
  authorProfiles?: AuthorProfile[] | null;
  primaryAuthorId?: number | null;
};

export type PaperReferenceListProps = {
  items: PaperReferenceItem[];
  loading?: boolean;
  emptyMessage: string;
  onPaperSelect: (paper: PaperReferenceItem) => void;
  onAuthorSelect?: (paper: PaperReferenceItem) => void;
};

export default function PaperReferenceList({
  items,
  loading,
  emptyMessage,
  onPaperSelect,
  onAuthorSelect,
}: PaperReferenceListProps) {
  if (loading) {
    return <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">Loading...</p>;
  }

  if (!items.length) {
    return (
      <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-text-secondary)]">
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
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)]"
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
  );
}

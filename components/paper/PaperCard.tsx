import type { RelatedPaperItem } from "@/components/paper/types";

export type RelatedPaperCardProps = {
  paper: RelatedPaperItem;
  onClick: () => void;
};

export default function PaperCard({ paper, onClick }: RelatedPaperCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="flex h-full min-w-[220px] flex-col rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-4 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)]"
    >
      <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
        {paper.title}
      </h4>
      <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
        {paper.author}
      </p>
      {paper.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {paper.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-text-secondary)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-[11px] text-[color:var(--color-text-secondary)]">
        <span className="inline-flex items-center gap-1">
          <svg
            aria-hidden
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7-10.5-7-10.5-7z"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {paper.views.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1">
          <svg
            aria-hidden
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v10m0 0 4-4m-4 4-4-4"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 17h16" />
          </svg>
          {paper.downloads.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1">
          <svg
            aria-hidden
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.8 8.6a5 5 0 0 0-7.1 0L12 10.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 22l7.1-4.6 1.7-1.7a5 5 0 0 0 0-7.1z"
            />
          </svg>
          {paper.likes.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1">
          <svg
            aria-hidden
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3V11.5A7.5 7.5 0 0 1 10.5 4H13.5A7.5 7.5 0 0 1 21 11.5z"
            />
          </svg>
          {paper.comments.toLocaleString()}
        </span>
        <span className="inline-flex items-center gap-1">
          <svg
            aria-hidden
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 4h12a2 2 0 0 1 2 2v16l-8-4-8 4V6a2 2 0 0 1 2-2z"
            />
          </svg>
          {paper.bookmarks.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

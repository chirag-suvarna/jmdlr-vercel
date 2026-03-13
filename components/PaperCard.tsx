type PaperCardProps = {
  title: string;
  abstract: string;
  tags: string[];
  date?: string;
  author: string;
  onAuthorClick?: () => void;
  doi?: string;
  views: number | string;
  downloads?: number;
  likes?: number;
  comments?: number;
  bookmarks?: number;
};

const formatCount = (value?: number | string) => {
  if (value === null || value === undefined) return "0";
  if (typeof value === "number") return value.toLocaleString();
  return value;
};

export default function PaperCard({
  title,
  abstract,
  tags,
  author,
  onAuthorClick,
  views,
  downloads = 0,
  likes = 0,
  comments = 0,
  bookmarks = 0,
}: PaperCardProps) {
  return (
    <article
      className="flex h-full min-h-[260px] flex-col rounded-[18px] border border-[color:var(--color-border)] p-5 shadow-[var(--shadow-card)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-[color:var(--color-border-strong)]"
      style={{
        background:
          "linear-gradient(160deg, var(--color-bg-surface), var(--color-bg-secondary-70))",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug text-[color:var(--color-text-primary)] sm:text-lg">
          {title}
        </h3>
      </div>
      {onAuthorClick ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAuthorClick();
          }}
          className="mt-2 inline-flex w-fit max-w-full self-start items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] px-2.5 py-0.5 text-[11px] font-semibold text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-border-strong)]"
        >
          <span
            className="max-w-[160px] truncate whitespace-nowrap"
            title={author}
          >
            {author}
          </span>
        </button>
      ) : (
        <div className="mt-2 inline-flex w-fit max-w-full self-start items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] px-2.5 py-0.5 text-[11px] font-semibold text-[color:var(--color-text-secondary)]">
          <span className="max-w-[160px] truncate whitespace-nowrap" title={author}>
            {author}
          </span>
        </div>
      )}
      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] px-2.5 py-0.5 text-[10px] font-medium text-[color:var(--color-text-secondary)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[color:var(--color-border)] pt-3 text-[11px] text-[color:var(--color-text-secondary)]">
        <span className="flex items-center gap-1 text-[color:var(--color-text-secondary)]">
          <svg
            aria-hidden
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
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
          {formatCount(views)}
        </span>
        <span className="flex items-center gap-1">
          <svg
            aria-hidden
            className="h-3.5 w-3.5 text-[color:var(--color-text-secondary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v10m0 0 4-4m-4 4-4-4"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 17h16"
            />
          </svg>
          {formatCount(downloads)}
        </span>
        <span className="flex items-center gap-1">
          <svg
            aria-hidden
            className="h-3.5 w-3.5 text-[color:var(--color-text-secondary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.8 8.6a5 5 0 0 0-7.1 0L12 10.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 22l7.1-4.6 1.7-1.7a5 5 0 0 0 0-7.1z"
            />
          </svg>
          {formatCount(likes)}
        </span>
        <span className="flex items-center gap-1">
          <svg
            aria-hidden
            className="h-3.5 w-3.5 text-[color:var(--color-text-secondary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3V11.5A7.5 7.5 0 0 1 10.5 4H13.5A7.5 7.5 0 0 1 21 11.5z"
            />
          </svg>
          {formatCount(comments)}
        </span>
        <span className="flex items-center gap-1">
          <svg
            aria-hidden
            className="h-3.5 w-3.5 text-[color:var(--color-text-secondary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 4h12a2 2 0 0 1 2 2v16l-8-4-8 4V6a2 2 0 0 1 2-2z"
            />
          </svg>
          {formatCount(bookmarks)}
        </span>
      </div>
    </article>
  );
}

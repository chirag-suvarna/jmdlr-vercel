export type PaperActionsProps = {
  onPreview: () => void;
  onDownload: () => void;
  onBookmark: () => void;
  onLike: () => void;
  bookmarked?: boolean;
  liked?: boolean;
};

const baseButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-secondary)] shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]";

export default function PaperActions({
  onPreview,
  onDownload,
  onBookmark,
  onLike,
  bookmarked,
  liked,
}: PaperActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button type="button" onClick={onPreview} className={baseButton} aria-label="Preview">
        <svg
          aria-hidden
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7-10.5-7-10.5-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button type="button" onClick={onDownload} className={baseButton} aria-label="Download">
        <svg
          aria-hidden
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v10m0 0 4-4m-4 4-4-4" />
          <path d="M4 17h16" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onBookmark}
        aria-label="Bookmark"
        className={`${baseButton} ${
          bookmarked
            ? "border-transparent bg-[color:var(--color-accent)] text-[color:var(--color-bg-primary)]"
            : ""
        }`}
      >
        <svg
          aria-hidden
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill={bookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 4h12a2 2 0 0 1 2 2v16l-8-4-8 4V6a2 2 0 0 1 2-2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onLike}
        aria-label="Like"
        className={`${baseButton} ${
          liked
            ? "border-transparent bg-[color:var(--color-bg-surface)] text-[color:var(--color-bg-primary)]"
            : ""
        }`}
      >
        <svg
          aria-hidden
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.8 8.6a5 5 0 0 0-7.1 0L12 10.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 22l7.1-4.6 1.7-1.7a5 5 0 0 0 0-7.1z" />
        </svg>
      </button>
    </div>
  );
}

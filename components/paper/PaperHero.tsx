import PaperMeta from "@/components/paper/PaperMeta";

export type PaperHeroProps = {
  title: string;
  authorLabel: string;
  doi?: string | null;
  publishedLabel?: string | null;
  onAuthorClick?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onBookmark: () => void;
  onLike: () => void;
  bookmarked?: boolean;
  liked?: boolean;
};

const actionButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-secondary)] shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]";

export default function PaperHero({
  title,
  authorLabel,
  doi,
  publishedLabel,
  onAuthorClick,
  showBack,
  onBack,
  onPreview,
  onDownload,
  onBookmark,
  onLike,
  bookmarked,
  liked,
}: PaperHeroProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-6">
      <div className="min-w-[240px] flex-1">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
          >
            <svg
              aria-hidden
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </button>
        ) : null}
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
          Paper Overview
        </p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight text-[color:var(--color-text-primary)] sm:text-3xl">
          {title}
        </h1>
        <div className="mt-3">
          <PaperMeta
            authorLabel={authorLabel}
            doi={doi}
            publishedLabel={publishedLabel}
            onAuthorClick={onAuthorClick}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button type="button" onClick={onPreview} className={actionButton} aria-label="View">
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
        <button type="button" onClick={onDownload} className={actionButton} aria-label="Download">
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
          className={`${actionButton} ${
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
          className={`${actionButton} ${
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
    </div>
  );
}

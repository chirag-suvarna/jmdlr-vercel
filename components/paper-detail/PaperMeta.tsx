export type PaperMetaProps = {
  authorLabel: string;
  doi?: string | null;
  publishedLabel?: string | null;
  onAuthorClick?: () => void;
};

export default function PaperMeta({
  authorLabel,
  doi,
  publishedLabel,
  onAuthorClick,
}: PaperMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-text-secondary)]">
      {onAuthorClick ? (
        <button
          type="button"
          onClick={onAuthorClick}
          className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
          aria-label={`View author ${authorLabel}`}
        >
          {authorLabel}
        </button>
      ) : (
        <span className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-primary)]">
          {authorLabel}
        </span>
      )}
      {doi ? (
        <a
          href={`https://doi.org/${doi}`}
          target="_blank"
          rel="noreferrer"
          className="text-[color:var(--color-text-secondary)] underline-offset-4 hover:text-[color:var(--color-text-primary)] hover:underline"
        >
          DOI: {doi}
        </a>
      ) : null}
      {publishedLabel ? <span>{publishedLabel}</span> : null}
    </div>
  );
}

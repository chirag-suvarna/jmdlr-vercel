import AuthorInfo from "@/components/paper/AuthorInfo";

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
  const items: JSX.Element[] = [];

  items.push(
    onAuthorClick ? (
      <span
        key="author"
        role="button"
        tabIndex={0}
        onClick={onAuthorClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onAuthorClick();
          }
        }}
        className="inline-flex rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-border-strong)]"
      >
        <AuthorInfo name={authorLabel} />
      </span>
    ) : (
      <span
        key="author"
        className="inline-flex rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-1"
      >
        <AuthorInfo name={authorLabel} />
      </span>
    )
  );

  if (doi) {
    items.push(
      <a
        key="doi"
        href={`https://doi.org/${doi}`}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-[color:var(--color-text-secondary)] underline-offset-4 hover:text-[color:var(--color-text-primary)] hover:underline"
      >
        DOI: {doi}
      </a>
    );
  }

  if (publishedLabel) {
    items.push(
      <span key="published" className="text-xs text-[color:var(--color-text-secondary)]">
        {publishedLabel}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      {items.map((item, index) => (
        <div key={`meta-${index}`} className="flex items-center gap-3">
          {item}
          {index < items.length - 1 ? (
            <span className="hidden h-4 w-px bg-[color:var(--color-border)] sm:inline-block" aria-hidden />
          ) : null}
        </div>
      ))}
    </div>
  );
}

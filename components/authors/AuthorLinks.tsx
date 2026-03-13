type AuthorLinksProps = {
  orcid?: string | null;
  googleScholar?: string | null;
  linkedin?: string | null;
};

export default function AuthorLinks({
  orcid,
  googleScholar,
  linkedin,
}: AuthorLinksProps) {
  const hasLinks = Boolean(orcid || googleScholar || linkedin);
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
        Links
      </p>
      {hasLinks ? (
        <div className="flex flex-wrap gap-3">
          {orcid ? (
            <a
              href={orcid}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-border-strong)]"
            >
              <svg
                aria-hidden
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" fill="var(--color-bg-secondary)" />
              </svg>
              ORCID
            </a>
          ) : null}
          {googleScholar ? (
            <a
              href={googleScholar}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-border-strong)]"
            >
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
                <path d="M12 3 3 8l9 5 9-5-9-5Z" />
                <path d="M7 12v4c0 2 2.5 4 5 4s5-2 5-4v-4" />
              </svg>
              Google Scholar
            </a>
          ) : null}
          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-border-strong)]"
            >
              <svg
                aria-hidden
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4.98 3.5a2.5 2.5 0 1 1-2.5 2.5 2.5 2.5 0 0 1 2.5-2.5Zm-2 6h4v11h-4Zm7 0h3.8v1.5h.1a4.2 4.2 0 0 1 3.8-2.1c4.1 0 4.8 2.7 4.8 6.2v6.4h-4v-5.7c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v5.8h-4Z" />
              </svg>
              LinkedIn
            </a>
          ) : null}
        </div>
      ) : (
        <span className="text-xs text-[color:var(--color-text-secondary)]">—</span>
      )}
    </div>
  );
}

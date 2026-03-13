type AuthorPaper = {
  id: number;
  title: string;
  tags?: string[];
  views?: number;
  citations?: number;
};

type AuthorPapersProps = {
  papers: AuthorPaper[];
};

export default function AuthorPapers({ papers }: AuthorPapersProps) {
  if (papers.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-4 py-6 text-sm text-[color:var(--color-text-secondary)]">
        No published papers found for this author.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-5">
      <div className="space-y-4">
        {papers.map((paper) => (
          <div
            key={paper.id}
            className="border-b border-[color:var(--color-border)]/60 pb-4 last:border-none last:pb-0"
          >
            <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
              {paper.title}
            </p>
            {paper.tags && paper.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[color:var(--color-text-secondary)]">
                {paper.tags.slice(0, 4).map((tag) => (
                  <span
                    key={`${paper.id}-${tag}`}
                    className="rounded-full border border-[color:var(--color-border)] px-2 py-0.5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-[color:var(--color-text-secondary)]">
              <span>👁 {paper.views ?? 0}</span>
              <span>📚 {paper.citations ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

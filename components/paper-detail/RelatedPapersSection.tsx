import PaperCard from "@/components/PaperCard";
import type { AuthorProfile } from "@/components/paper-detail/types";

export type RelatedPaperItem = {
  id: number;
  title: string;
  abstract: string;
  tags: string[];
  author: string;
  authorProfiles?: AuthorProfile[] | null;
  primaryAuthorId?: number | null;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  bookmarks: number;
};

export type RelatedPapersSectionProps = {
  papers: RelatedPaperItem[];
  onPaperSelect: (paper: RelatedPaperItem) => void;
  onAuthorSelect?: (paper: RelatedPaperItem) => void;
};

export default function RelatedPapersSection({
  papers,
  onPaperSelect,
  onAuthorSelect,
}: RelatedPapersSectionProps) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
          Related Papers
        </p>
        <span className="text-[11px] text-[color:var(--color-text-secondary)]">
          Based on tags
        </span>
      </div>
      {papers.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {papers.map((paper) => (
            <div
              key={paper.id}
              role="button"
              tabIndex={0}
              onClick={() => onPaperSelect(paper)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onPaperSelect(paper);
                }
              }}
              className="text-left"
            >
              <PaperCard
                title={paper.title}
                abstract={paper.abstract}
                tags={paper.tags}
                author={paper.author}
                views={paper.views}
                downloads={paper.downloads}
                likes={paper.likes}
                comments={paper.comments}
                bookmarks={paper.bookmarks}
                onAuthorClick={() => onAuthorSelect?.(paper)}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[color:var(--color-text-secondary)]">
          No related papers found.
        </p>
      )}
    </div>
  );
}

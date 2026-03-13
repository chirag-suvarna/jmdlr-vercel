import PaperRow from "@/components/dashboard/PaperRow";
import PaperCardMobile from "@/components/dashboard/PaperCardMobile";

export type PapersTableProps = {
  papers: Array<{
    id: number;
    title: string;
    abstract?: string | null;
    keywords?: string[] | null;
    published_date?: string | null;
    created_date?: string | null;
    metrics?: {
      views?: number;
      downloads?: number;
      bookmarks?: number;
      likes?: number;
    } | null;
  }>;
  getStatus: (paper: any) => string;
  getStatusClass: (status: string) => string;
  canEdit: (paper: any) => boolean;
  deletingId: number | null;
  onView: (paper: any) => void;
  onEdit: (paper: any) => void;
  onDelete: (paper: any) => void;
  onPayment: (paper: any) => void;
  formatDate: (value?: string | null) => string;
};

export default function PapersTable({
  papers,
  getStatus,
  getStatusClass,
  canEdit,
  deletingId,
  onView,
  onEdit,
  onDelete,
  onPayment,
  formatDate,
}: PapersTableProps) {
  return (
    <>
      <div className="space-y-4 md:hidden">
        {papers.map((paper) => {
          const status = getStatus(paper);
          return (
            <PaperCardMobile
              key={paper.id}
              title={paper.title}
              abstract={paper.abstract}
              tags={paper.keywords ?? []}
              statusLabel={status}
              statusClass={getStatusClass(status)}
              metrics={paper.metrics}
              publishedLabel={formatDate(paper.published_date || paper.created_date)}
              onView={() => onView(paper)}
              onEdit={() => onEdit(paper)}
              onDelete={() => onDelete(paper)}
              onPayment={() => onPayment(paper)}
              canEdit={canEdit(paper)}
              deleting={deletingId === paper.id}
            />
          );
        })}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-sm">
          <thead className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
            <tr className="border-b border-[color:var(--color-border)]/60">
              <th className="px-4 py-3 text-left">Paper</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">
                <span className="sr-only">Views</span>
                <svg
                  aria-hidden
                  className="mx-auto h-4 w-4 text-[color:var(--color-text-secondary)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="sr-only">Downloads</span>
                <svg
                  aria-hidden
                  className="mx-auto h-4 w-4 text-[color:var(--color-text-secondary)]"
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
              </th>
              <th className="px-4 py-3 text-center">
                <span className="sr-only">Bookmarks</span>
                <svg
                  aria-hidden
                  className="mx-auto h-4 w-4 text-[color:var(--color-text-secondary)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 4h12a2 2 0 0 1 2 2v16l-8-4-8 4V6a2 2 0 0 1 2-2z" />
                </svg>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="sr-only">Likes</span>
                <svg
                  aria-hidden
                  className="mx-auto h-4 w-4 text-[color:var(--color-text-secondary)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.8 8.6a5 5 0 0 0-7.1 0L12 10.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 22l7.1-4.6 1.7-1.7a5 5 0 0 0 0-7.1z" />
                </svg>
              </th>
              <th className="px-4 py-3 text-center">Published Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper) => {
              const status = getStatus(paper);
              return (
                <PaperRow
                  key={paper.id}
                  paper={paper}
                  statusLabel={status}
                  statusClass={getStatusClass(status)}
                  canEdit={canEdit(paper)}
                  deleting={deletingId === paper.id}
                  onView={() => onView(paper)}
                  onEdit={() => onEdit(paper)}
                  onDelete={() => onDelete(paper)}
                  onPayment={() => onPayment(paper)}
                  formatDate={formatDate}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

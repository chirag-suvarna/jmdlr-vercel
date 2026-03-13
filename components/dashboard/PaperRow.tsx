type PaperMetrics = {
  views?: number;
  downloads?: number;
  bookmarks?: number;
  likes?: number;
};

export type PaperRowProps = {
  paper: {
    id: number;
    title: string;
    abstract?: string | null;
    keywords?: string[] | null;
    published_date?: string | null;
    created_date?: string | null;
    metrics?: PaperMetrics | null;
  };
  statusLabel: string;
  statusClass: string;
  canEdit: boolean;
  deleting: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPayment?: () => void;
  formatDate: (value?: string | null) => string;
};

export default function PaperRow({
  paper,
  statusLabel,
  statusClass,
  canEdit,
  deleting,
  onView,
  onEdit,
  onDelete,
  onPayment,
  formatDate,
}: PaperRowProps) {
  const metrics = paper.metrics ?? {};
  return (
    <tr className="border-b border-[color:var(--color-border)]/60 last:border-none hover:bg-[color:var(--color-bg-muted)]/40">
      <td className="px-4 py-4 text-left">
        <div className="max-w-[360px] text-[13px] font-semibold leading-snug text-[color:var(--color-text-primary)]">
          {paper.title}
        </div>
      </td>
      <td className="px-4 py-4 text-center whitespace-nowrap">
        {statusLabel === "Payment Due" && onPayment ? (
          <button
            type="button"
            onClick={onPayment}
            className="whitespace-nowrap rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-bg-primary)] shadow-[var(--shadow-card)] transition hover:bg-[color:var(--color-accent-hover)]"
          >
            Make Payment
          </button>
        ) : (
          <span
            className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
          >
            {statusLabel}
          </span>
        )}
      </td>
      <td className="px-4 py-4 text-center text-sm text-[color:var(--color-text-primary)]">
        {metrics.views ?? 0}
      </td>
      <td className="px-4 py-4 text-center text-sm text-[color:var(--color-text-primary)]">
        {metrics.downloads ?? 0}
      </td>
      <td className="px-4 py-4 text-center text-sm text-[color:var(--color-text-primary)]">
        {metrics.bookmarks ?? 0}
      </td>
      <td className="px-4 py-4 text-center text-sm text-[color:var(--color-text-primary)]">
        {metrics.likes ?? 0}
      </td>
      <td className="px-4 py-4 text-center text-sm text-[color:var(--color-text-secondary)]">
        {formatDate(paper.published_date || paper.created_date)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onView}
            aria-label="View paper"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
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
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          {canEdit ? (
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit paper"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
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
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
              </svg>
            </button>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              aria-label="Delete paper"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-danger)] text-[color:var(--color-danger)] transition hover:bg-[color:var(--color-danger)] hover:text-[color:var(--color-bg-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? (
                <svg
                  aria-hidden
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v4" />
                  <path d="M12 18v4" />
                  <path d="M4.93 4.93l2.83 2.83" />
                  <path d="M16.24 16.24l2.83 2.83" />
                  <path d="M2 12h4" />
                  <path d="M18 12h4" />
                  <path d="M4.93 19.07l2.83-2.83" />
                  <path d="M16.24 7.76l2.83-2.83" />
                </svg>
              ) : (
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
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M6 6l1 14h10l1-14" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              )}
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

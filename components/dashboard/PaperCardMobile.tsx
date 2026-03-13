export type PaperCardMobileProps = {
  title: string;
  abstract?: string | null;
  tags?: string[] | null;
  statusLabel: string;
  statusClass: string;
  metrics?: {
    views?: number;
    downloads?: number;
    bookmarks?: number;
    likes?: number;
  } | null;
  publishedLabel: string;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPayment?: () => void;
  canEdit: boolean;
  deleting: boolean;
};

const truncate = (value?: string | null, max = 120) => {
  if (!value) return "No abstract available.";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
};

export default function PaperCardMobile({
  title,
  abstract,
  tags,
  statusLabel,
  statusClass,
  metrics,
  publishedLabel,
  onView,
  onEdit,
  onDelete,
  onPayment,
  canEdit,
  deleting,
}: PaperCardMobileProps) {
  const metricsData = metrics ?? {};
  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-4 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
            {title}
          </h3>
          <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
            {truncate(abstract)}
          </p>
        </div>
        {statusLabel === "Payment Due" && onPayment ? (
          <button
            type="button"
            onClick={onPayment}
            className="rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-bg-primary)]"
          >
            Pay
          </button>
      ) : (
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusClass}`}
        >
          {statusLabel}
        </span>
      )}
    </div>
      {tags && tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[color:var(--color-text-secondary)]">
          {tags.slice(0, 3).map((tag) => (
            <span key={`${title}-tag-${tag}`} className="rounded-full border px-2 py-0.5">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-[color:var(--color-text-secondary)]">
        <span>👁 {metricsData.views ?? 0}</span>
        <span>⬇ {metricsData.downloads ?? 0}</span>
        <span>🔖 {metricsData.bookmarks ?? 0}</span>
        <span>❤ {metricsData.likes ?? 0}</span>
      </div>
      <div className="mt-3 text-[11px] text-[color:var(--color-text-secondary)]">
        Published: {publishedLabel}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onView}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)]"
          aria-label="View paper"
        >
          👁
        </button>
        {canEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)]"
            aria-label="Edit paper"
          >
            ✎
          </button>
        ) : null}
        {canEdit ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-danger)] text-[color:var(--color-danger)] disabled:opacity-60"
            aria-label="Delete paper"
          >
            {deleting ? "…" : "✕"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

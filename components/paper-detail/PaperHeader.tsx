import PaperActions, { type PaperActionsProps } from "@/components/paper-detail/PaperActions";
import PaperBadge from "@/components/paper-detail/PaperBadge";
import PaperMeta from "@/components/paper-detail/PaperMeta";
import PaperTitle from "@/components/paper-detail/PaperTitle";

export type PaperHeaderProps = {
  badgeLabel: string;
  title: string;
  authorLabel: string;
  doi?: string | null;
  publishedLabel?: string | null;
  onAuthorClick?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  actions: PaperActionsProps;
};

export default function PaperHeader({
  badgeLabel,
  title,
  authorLabel,
  doi,
  publishedLabel,
  onAuthorClick,
  showBack,
  onBack,
  actions,
}: PaperHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-6">
      <div className="min-w-[220px] flex-1 space-y-3">
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
        <PaperBadge label={badgeLabel} />
        <PaperTitle title={title} />
        <PaperMeta
          authorLabel={authorLabel}
          doi={doi}
          publishedLabel={publishedLabel}
          onAuthorClick={onAuthorClick}
        />
      </div>
      <div className="flex flex-col items-end gap-3">
        <PaperActions {...actions} />
      </div>
    </div>
  );
}

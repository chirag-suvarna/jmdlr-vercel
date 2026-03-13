"use client";

import PaperDetailPage from "@/components/paper-detail/PaperDetailPage";
import type { PaperReferenceItem } from "@/components/paper-detail/PaperReferenceList";
import type { PaperDetailData } from "@/components/paper-detail/types";
import type { RelatedPaperItem } from "@/components/paper-detail/RelatedPapersSection";

export type PaperDetailModalProps = {
  open: boolean;
  paper: PaperDetailData | null;
  badgeLabel?: string;
  publishedLabel?: string | null;
  onClose: () => void;
  onBack?: () => void;
  showBack?: boolean;
  onAuthorClick?: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onBookmark: () => void;
  onLike: () => void;
  activeTab: "details" | "metrics";
  onTabChange: (tab: "details" | "metrics") => void;
  references: PaperReferenceItem[];
  citations: PaperReferenceItem[];
  detailsLoading: boolean;
  onPaperSelect: (paper: PaperReferenceItem) => void;
  onAuthorSelect?: (paper: PaperReferenceItem) => void;
  relatedPapers?: RelatedPaperItem[];
  onRelatedSelect?: (paper: RelatedPaperItem) => void;
  onRelatedAuthorSelect?: (paper: RelatedPaperItem) => void;
  commentText: string;
  onCommentChange: (value: string) => void;
  onCommentSubmit: () => void;
  isAuthenticated: boolean;
  actionMessage?: string;
  metricsLabel: string;
  metricsRange: "month" | "week" | "day" | "hour";
  metricsType: "all" | "views" | "downloads" | "likes" | "comments" | "bookmarks";
  metricsSeries: number[];
  metricsLabels: string[];
  metricsLoading: boolean;
  onMetricsRangeChange: (range: "month" | "week" | "day" | "hour") => void;
  onMetricsTypeChange: (
    metric: "all" | "views" | "downloads" | "likes" | "comments" | "bookmarks"
  ) => void;
};

export default function PaperDetailModal({
  open,
  paper,
  badgeLabel = "Paper Overview",
  publishedLabel,
  onClose,
  onBack,
  showBack,
  onAuthorClick,
  onPreview,
  onDownload,
  onBookmark,
  onLike,
  activeTab,
  onTabChange,
  references,
  citations,
  detailsLoading,
  onPaperSelect,
  onAuthorSelect,
  relatedPapers,
  onRelatedSelect,
  onRelatedAuthorSelect,
  commentText,
  onCommentChange,
  onCommentSubmit,
  isAuthenticated,
  actionMessage,
  metricsLabel,
  metricsRange,
  metricsType,
  metricsSeries,
  metricsLabels,
  metricsLoading,
  onMetricsRangeChange,
  onMetricsTypeChange,
}: PaperDetailModalProps) {
  if (!open || !paper) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--color-bg-primary-60)] px-6 py-10 backdrop-blur-lg"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="scrollbar-hidden max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-secondary-90)] p-6 shadow-[var(--shadow-soft)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-2 text-[color:var(--color-text-secondary)] shadow-[var(--shadow-card)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
            aria-label="Close"
          >
            <svg
              aria-hidden
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6l-12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <PaperDetailPage
            paper={paper}
            badgeLabel={badgeLabel}
            publishedLabel={publishedLabel}
            onAuthorClick={onAuthorClick}
            showBack={showBack}
            onBack={onBack}
            onPreview={onPreview}
            onDownload={onDownload}
            onBookmark={onBookmark}
            onLike={onLike}
            activeTab={activeTab}
            onTabChange={onTabChange}
            references={references}
            citations={citations}
            detailsLoading={detailsLoading}
            onPaperSelect={onPaperSelect}
            onAuthorSelect={onAuthorSelect}
            relatedPapers={relatedPapers}
            onRelatedSelect={onRelatedSelect}
            onRelatedAuthorSelect={onRelatedAuthorSelect}
            commentText={commentText}
            onCommentChange={onCommentChange}
            onCommentSubmit={onCommentSubmit}
            isAuthenticated={isAuthenticated}
            actionMessage={actionMessage}
            metricsLabel={metricsLabel}
            metricsRange={metricsRange}
            metricsType={metricsType}
            metricsSeries={metricsSeries}
            metricsLabels={metricsLabels}
            metricsLoading={metricsLoading}
            onMetricsRangeChange={onMetricsRangeChange}
            onMetricsTypeChange={onMetricsTypeChange}
          />
        </div>
      </div>
    </div>
  );
}

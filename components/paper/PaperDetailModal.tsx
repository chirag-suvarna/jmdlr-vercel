"use client";

import PaperDetailPage from "@/components/paper/PaperDetailPage";
import type {
  CommentItem,
  PaperDetailData,
  PaperReferenceItem,
  RelatedPaperItem,
} from "@/components/paper/types";

export type PaperDetailModalProps = {
  open: boolean;
  paper: PaperDetailData | null;
  publishedLabel?: string | null;
  onClose: () => void;
  showBack?: boolean;
  onBack?: () => void;
  onAuthorClick?: () => void;
  onPreview: () => void;
  onDownload: () => void;
  onBookmark: () => void;
  onLike: () => void;
  references: PaperReferenceItem[];
  citations: PaperReferenceItem[];
  detailsLoading: boolean;
  onPaperSelect: (paper: PaperReferenceItem) => void;
  onAuthorSelect?: (paper: PaperReferenceItem) => void;
  relatedPapers?: RelatedPaperItem[];
  onRelatedSelect?: (paper: RelatedPaperItem) => void;
  commentText: string;
  onCommentChange: (value: string) => void;
  onCommentSubmit: () => void;
  isAuthenticated: boolean;
  actionMessage?: string;
  comments?: CommentItem[];
  currentUserId?: number | null;
  paperAuthorIds?: number[];
  onCommentDelete?: (commentId: number | string) => void;
  onCommentEdit?: (commentId: number | string, nextText: string) => Promise<void> | void;
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
  publishedLabel,
  onClose,
  showBack,
  onBack,
  onAuthorClick,
  onPreview,
  onDownload,
  onBookmark,
  onLike,
  references,
  citations,
  detailsLoading,
  onPaperSelect,
  onAuthorSelect,
  relatedPapers,
  onRelatedSelect,
  commentText,
  onCommentChange,
  onCommentSubmit,
  isAuthenticated,
  actionMessage,
  comments,
  currentUserId,
  paperAuthorIds,
  onCommentDelete,
  onCommentEdit,
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
        className="scrollbar-hidden max-h-[90vh] w-full max-w-[80vw] overflow-y-auto rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-90)] p-6 shadow-[var(--shadow-soft)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div>
          <PaperDetailPage
            paper={paper}
            publishedLabel={publishedLabel}
            showBack={showBack}
            onBack={onBack}
            onAuthorClick={onAuthorClick}
            onPreview={onPreview}
            onDownload={onDownload}
            onBookmark={onBookmark}
            onLike={onLike}
            references={references}
            citations={citations}
            detailsLoading={detailsLoading}
            onPaperSelect={onPaperSelect}
            onAuthorSelect={onAuthorSelect}
            relatedPapers={relatedPapers}
            onRelatedSelect={onRelatedSelect}
            commentText={commentText}
            onCommentChange={onCommentChange}
            onCommentSubmit={onCommentSubmit}
            isAuthenticated={isAuthenticated}
            actionMessage={actionMessage}
            comments={comments}
            currentUserId={currentUserId}
            paperAuthorIds={paperAuthorIds}
            onCommentDelete={onCommentDelete}
            onCommentEdit={onCommentEdit}
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

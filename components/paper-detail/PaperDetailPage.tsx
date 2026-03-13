"use client";

import CommentSection from "@/components/paper-detail/CommentSection";
import DataTab from "@/components/paper-detail/DataTab";
import MetricsTab from "@/components/paper-detail/MetricsTab";
import PaperHeader from "@/components/paper-detail/PaperHeader";
import PaperTabs from "@/components/paper-detail/PaperTabs";
import type { PaperReferenceItem } from "@/components/paper-detail/PaperReferenceList";
import type { PaperDetailData } from "@/components/paper-detail/types";
import type { RelatedPaperItem } from "@/components/paper-detail/RelatedPapersSection";

export type PaperDetailPageProps = {
  paper: PaperDetailData;
  badgeLabel: string;
  publishedLabel?: string | null;
  onAuthorClick?: () => void;
  showBack?: boolean;
  onBack?: () => void;
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

export default function PaperDetailPage({
  paper,
  badgeLabel,
  publishedLabel,
  onAuthorClick,
  showBack,
  onBack,
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
}: PaperDetailPageProps) {
  return (
    <div className="space-y-8">
      <PaperHeader
        badgeLabel={badgeLabel}
        title={paper.title}
        authorLabel={paper.author}
        doi={paper.doi}
        publishedLabel={publishedLabel}
        onAuthorClick={onAuthorClick}
        showBack={showBack}
        onBack={onBack}
        actions={{
          onPreview,
          onDownload,
          onBookmark,
          onLike,
          bookmarked: paper.bookmarked,
          liked: paper.liked,
        }}
      />

      <PaperTabs
        tabs={[
          { id: "details", label: "Data" },
          { id: "metrics", label: "Metrics" },
        ]}
        activeTab={activeTab}
        onChange={onTabChange}
      />

      {activeTab === "details" ? (
        <DataTab
          tags={paper.tags}
          abstract={paper.abstract}
          references={references}
          citations={citations}
          loading={detailsLoading}
          onPaperSelect={onPaperSelect}
          onAuthorSelect={onAuthorSelect}
          relatedPapers={relatedPapers}
          onRelatedSelect={onRelatedSelect}
          onRelatedAuthorSelect={onRelatedAuthorSelect}
        />
      ) : (
        <MetricsTab
          metricsLabel={metricsLabel}
          metricsRange={metricsRange}
          metricsType={metricsType}
          metricsSeries={metricsSeries}
          metricsLabels={metricsLabels}
          metricsLoading={metricsLoading}
          onMetricsRangeChange={onMetricsRangeChange}
          onMetricsTypeChange={onMetricsTypeChange}
          views={paper.views}
          downloads={paper.downloads}
          likes={paper.likes}
          comments={paper.comments}
          bookmarks={paper.bookmarks}
        />
      )}

      <CommentSection
        value={commentText}
        onChange={onCommentChange}
        onSubmit={onCommentSubmit}
        disabled={!isAuthenticated}
        actionMessage={actionMessage}
      />
    </div>
  );
}

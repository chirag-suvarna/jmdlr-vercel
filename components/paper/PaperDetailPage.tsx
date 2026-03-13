"use client";

import AbstractSection from "@/components/paper/AbstractSection";
import CitationsSection from "@/components/paper/CitationsSection";
import PaperHero from "@/components/paper/PaperHero";
import ReferencesSection from "@/components/paper/ReferencesSection";
import RelatedPapersCarousel from "@/components/paper/RelatedPapersCarousel";
import TagsSection from "@/components/paper/TagsSection";
import RightSidebar from "@/components/paper/sidebar/RightSidebar";
import type {
  CommentItem,
  PaperDetailData,
  PaperReferenceItem,
  RelatedPaperItem,
} from "@/components/paper/types";

export type PaperDetailPageProps = {
  paper: PaperDetailData;
  publishedLabel?: string | null;
  onAuthorClick?: () => void;
  showBack?: boolean;
  onBack?: () => void;
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

export default function PaperDetailPage({
  paper,
  publishedLabel,
  onAuthorClick,
  showBack,
  onBack,
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
}: PaperDetailPageProps) {
  return (
    <div className="space-y-6">
      <PaperHero
        title={paper.title}
        authorLabel={paper.author}
        doi={paper.doi}
        publishedLabel={publishedLabel}
        onAuthorClick={onAuthorClick}
        showBack={showBack}
        onBack={onBack}
        onPreview={onPreview}
        onDownload={onDownload}
        onBookmark={onBookmark}
        onLike={onLike}
        bookmarked={paper.bookmarked}
        liked={paper.liked}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div>
          <div className="space-y-8">
            {(() => {
              const sections = [
                paper.tags.length > 0 ? (
                  <TagsSection key="tags" tags={paper.tags} />
                ) : null,
                paper.abstract ? (
                  <AbstractSection key="abstract" abstract={paper.abstract} />
                ) : null,
                <div key="refs-citations" className="grid gap-6 md:grid-cols-2">
                  <ReferencesSection
                    items={references}
                    loading={detailsLoading}
                    onPaperSelect={onPaperSelect}
                    onAuthorSelect={onAuthorSelect}
                  />
                  <div className="md:border-l md:border-[color:var(--color-border)] md:pl-6">
                    <CitationsSection
                      items={citations}
                      loading={detailsLoading}
                      onPaperSelect={onPaperSelect}
                      onAuthorSelect={onAuthorSelect}
                    />
                  </div>
                </div>,
                <RelatedPapersCarousel
                  key="related"
                  papers={relatedPapers ?? []}
                  onSelect={(paperItem) => onRelatedSelect?.(paperItem)}
                />,
              ].filter(Boolean) as JSX.Element[];

              return sections.map((section, index) => (
                <div
                  key={`section-${index}`}
                  className={index === 0 ? "" : "border-t border-[color:var(--color-border)] pt-8"}
                >
                  {section}
                </div>
              ));
            })()}
          </div>
        </div>

        <RightSidebar
          views={paper.views}
          downloads={paper.downloads}
          likes={paper.likes}
          comments={paper.comments}
          bookmarks={paper.bookmarks}
          metricsLabel={metricsLabel}
          metricsRange={metricsRange}
          metricsType={metricsType}
          metricsSeries={metricsSeries}
          metricsLabels={metricsLabels}
          metricsLoading={metricsLoading}
          onMetricsRangeChange={onMetricsRangeChange}
          onMetricsTypeChange={onMetricsTypeChange}
          commentText={commentText}
          onCommentChange={onCommentChange}
          onCommentSubmit={onCommentSubmit}
          isAuthenticated={isAuthenticated}
          actionMessage={actionMessage}
          commentList={comments}
          currentUserId={currentUserId}
          paperAuthorIds={paperAuthorIds}
          onCommentDelete={onCommentDelete}
          onCommentEdit={onCommentEdit}
        />
      </div>
    </div>
  );
}

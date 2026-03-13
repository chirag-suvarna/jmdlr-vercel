"use client";

import { useState } from "react";
import CommentsPanel from "@/components/paper/sidebar/CommentsPanel";
import MetricsPanel from "@/components/paper/sidebar/MetricsPanel";
import SidebarTabs, { type SidebarTab } from "@/components/paper/sidebar/SidebarTabs";
import type { CommentItem } from "@/components/paper/types";

export type RightSidebarProps = {
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  bookmarks: number;
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
  commentText: string;
  onCommentChange: (value: string) => void;
  onCommentSubmit: () => void;
  isAuthenticated: boolean;
  actionMessage?: string;
  commentList?: CommentItem[];
  currentUserId?: number | null;
  paperAuthorIds?: number[];
  onCommentDelete?: (commentId: number | string) => void;
  onCommentEdit?: (commentId: number | string, nextText: string) => Promise<void> | void;
};

export default function RightSidebar({
  views,
  downloads,
  likes,
  comments,
  bookmarks,
  metricsLabel,
  metricsRange,
  metricsType,
  metricsSeries,
  metricsLabels,
  metricsLoading,
  onMetricsRangeChange,
  onMetricsTypeChange,
  commentText,
  onCommentChange,
  onCommentSubmit,
  isAuthenticated,
  actionMessage,
  commentList,
  currentUserId,
  paperAuthorIds,
  onCommentDelete,
  onCommentEdit,
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("metrics");

  return (
    <div className="lg:sticky lg:top-[120px]">
      <div className="relative rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] shadow-[var(--shadow-card)]">
        <div className="absolute left-4 -top-4 z-10">
          <SidebarTabs activeTab={activeTab} onChange={setActiveTab} />
        </div>
        <div className="px-4 pb-5 pt-10">
          {activeTab === "metrics" ? (
            <MetricsPanel
              views={views}
              downloads={downloads}
              likes={likes}
              comments={comments}
              bookmarks={bookmarks}
              metricsLabel={metricsLabel}
              metricsRange={metricsRange}
              metricsType={metricsType}
              metricsSeries={metricsSeries}
              metricsLabels={metricsLabels}
              metricsLoading={metricsLoading}
              onMetricsRangeChange={onMetricsRangeChange}
              onMetricsTypeChange={onMetricsTypeChange}
            />
          ) : (
            <CommentsPanel
              value={commentText}
              onChange={onCommentChange}
              onSubmit={onCommentSubmit}
              disabled={!isAuthenticated}
              actionMessage={actionMessage}
              comments={commentList}
              currentUserId={currentUserId}
              paperAuthorIds={paperAuthorIds}
              onDelete={onCommentDelete}
              onEdit={onCommentEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

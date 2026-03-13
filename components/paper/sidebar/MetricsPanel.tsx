import MetricsChart from "@/components/paper/MetricsChart";
import MetricsSummary from "@/components/paper/MetricsSummary";

export type MetricsPanelProps = {
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
};

export default function MetricsPanel({
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
}: MetricsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-4 shadow-[var(--shadow-card)]">
        <MetricsChart
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
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-4 shadow-[var(--shadow-card)]">
        <MetricsSummary
          views={views}
          downloads={downloads}
          likes={likes}
          comments={comments}
          bookmarks={bookmarks}
        />
      </div>
    </div>
  );
}

"use client";

import ActivityChart from "@/components/paper/ActivityChart";

export type MetricsChartProps = {
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

export default function MetricsChart({
  metricsLabel,
  metricsRange,
  metricsType,
  metricsSeries,
  metricsLabels,
  metricsLoading,
  onMetricsRangeChange,
  onMetricsTypeChange,
}: MetricsChartProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
            Activity
          </p>
          <p className="text-xs text-[color:var(--color-text-secondary)]">
            {metricsLabel} trend
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="metric-type">
            Metric type
          </label>
          <select
            id="metric-type"
            value={metricsType}
            onChange={(event) =>
              onMetricsTypeChange(
                event.target.value as
                  | "all"
                  | "views"
                  | "downloads"
                  | "likes"
                  | "comments"
                  | "bookmarks"
              )
            }
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-text-secondary)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
          >
            <option value="all">All metrics</option>
            <option value="views">Views</option>
            <option value="downloads">Downloads</option>
            <option value="likes">Likes</option>
            <option value="comments">Comments</option>
            <option value="bookmarks">Bookmarks</option>
          </select>
          {(["month", "week", "day", "hour"] as const).map((range) => {
            const active = metricsRange === range;
            const label =
              range === "month"
                ? "Month"
                : range === "week"
                ? "Week"
                : range === "day"
                ? "Day"
                : "Hour";
            return (
              <button
                key={range}
                type="button"
                onClick={() => onMetricsRangeChange(range)}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                  active
                    ? "border-transparent bg-[color:var(--color-accent)] text-[color:var(--color-bg-primary)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="border-t border-[color:var(--color-border)]/70 pt-4">
        <ActivityChart labels={metricsLabels} values={metricsSeries} loading={metricsLoading} />
      </div>
    </div>
  );
}

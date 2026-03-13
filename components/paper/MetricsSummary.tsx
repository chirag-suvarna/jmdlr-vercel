export type MetricsSummaryProps = {
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  bookmarks: number;
};

import type { ReactNode } from "react";

const MetricRow = ({
  icon,
  value,
  ariaLabel,
  label,
}: {
  icon: ReactNode;
  value: number;
  ariaLabel: string;
  label: string;
}) => (
  <div className="flex items-center justify-between py-2 text-sm" aria-label={ariaLabel}>
    <div className="flex items-center gap-2 text-[color:var(--color-text-secondary)]">
      <span className="text-[color:var(--color-link)]">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
    <span className="font-semibold text-[color:var(--color-text-primary)]">
      {value.toLocaleString()}
    </span>
  </div>
);

export default function MetricsSummary({
  views,
  downloads,
  likes,
  comments,
  bookmarks,
}: MetricsSummaryProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
          Metrics
        </h3>
        <span className="h-px flex-1 bg-[color:var(--color-border)]/70 ml-3" aria-hidden />
      </div>
      <div className="divide-y divide-[color:var(--color-border)]/70">
        <MetricRow
          value={views}
          ariaLabel="Views"
          label="Views"
          icon={
            <svg
              aria-hidden
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7-10.5-7-10.5-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        />
        <MetricRow
          value={downloads}
          ariaLabel="Downloads"
          label="Downloads"
          icon={
            <svg
              aria-hidden
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v10m0 0 4-4m-4 4-4-4" />
              <path d="M4 17h16" />
            </svg>
          }
        />
        <MetricRow
          value={likes}
          ariaLabel="Likes"
          label="Likes"
          icon={
            <svg
              aria-hidden
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.8 8.6a5 5 0 0 0-7.1 0L12 10.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 22l7.1-4.6 1.7-1.7a5 5 0 0 0 0-7.1z" />
            </svg>
          }
        />
        <MetricRow
          value={comments}
          ariaLabel="Comments"
          label="Comments"
          icon={
            <svg
              aria-hidden
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3V11.5A7.5 7.5 0 0 1 10.5 4H13.5A7.5 7.5 0 0 1 21 11.5z" />
            </svg>
          }
        />
        <MetricRow
          value={bookmarks}
          ariaLabel="Bookmarks"
          label="Bookmarks"
          icon={
            <svg
              aria-hidden
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 4h12a2 2 0 0 1 2 2v16l-8-4-8 4V6a2 2 0 0 1 2-2z" />
            </svg>
          }
        />
      </div>
      <div className="border-t border-[color:var(--color-border)]/70" />
    </div>
  );
}

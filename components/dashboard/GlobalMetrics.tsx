import MetricCard from "@/components/dashboard/MetricCard";

export type GlobalMetricsProps = {
  totalPapers: number;
  totalViews: number;
  totalDownloads: number;
  totalBookmarks: number;
  totalLikes: number;
};

export default function GlobalMetrics({
  totalPapers,
  totalViews,
  totalDownloads,
  totalBookmarks,
  totalLikes,
}: GlobalMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        label="Total Papers"
        value={totalPapers}
        icon={
          <svg
            aria-hidden
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16v16H4z" />
            <path d="M8 8h8" />
            <path d="M8 12h8" />
            <path d="M8 16h5" />
          </svg>
        }
      />
      <MetricCard
        label="Views"
        value={totalViews}
        icon={
          <svg
            aria-hidden
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        }
      />
      <MetricCard
        label="Downloads"
        value={totalDownloads}
        icon={
          <svg
            aria-hidden
            className="h-5 w-5"
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
      <MetricCard
        label="Bookmarks"
        value={totalBookmarks}
        icon={
          <svg
            aria-hidden
            className="h-5 w-5"
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
      <MetricCard
        label="Likes"
        value={totalLikes}
        icon={
          <svg
            aria-hidden
            className="h-5 w-5"
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
    </div>
  );
}

import MetricCard from "@/components/paper-detail/MetricCard";

export type MetricsCardsProps = {
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  bookmarks: number;
};

export default function MetricsCards({
  views,
  downloads,
  likes,
  comments,
  bookmarks,
}: MetricsCardsProps) {
  const iconClass = "h-6 w-6";
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        label="Views"
        value={views}
        icon={
          <svg
            aria-hidden
            className={iconClass}
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
      <MetricCard
        label="Downloads"
        value={downloads}
        icon={
          <svg
            aria-hidden
            className={iconClass}
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
        label="Likes"
        value={likes}
        icon={
          <svg
            aria-hidden
            className={iconClass}
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
      <MetricCard
        label="Comments"
        value={comments}
        icon={
          <svg
            aria-hidden
            className={iconClass}
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
      <MetricCard
        label="Bookmarks"
        value={bookmarks}
        icon={
          <svg
            aria-hidden
            className={iconClass}
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
  );
}

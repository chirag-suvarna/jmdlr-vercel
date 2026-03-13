export type AuthorInfoProps = {
  name: string;
};

export default function AuthorInfo({ name }: AuthorInfoProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--color-text-primary)]">
      <svg
        aria-label="Author"
        className="h-4 w-4 text-[color:var(--pearl-aqua)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span>{name}</span>
    </span>
  );
}

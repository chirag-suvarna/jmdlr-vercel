export type CommentSectionProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  actionMessage?: string;
};

export default function CommentSection({
  value,
  onChange,
  onSubmit,
  disabled,
  actionMessage,
}: CommentSectionProps) {
  return (
    <div className="space-y-3">
      {actionMessage ? (
        <div className="rounded-2xl border border-[color:var(--color-accent)] bg-[color:var(--color-bg-secondary-70)] px-4 py-2 text-xs text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)]">
          {actionMessage}
        </div>
      ) : null}
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-5 shadow-[var(--shadow-card)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
          Add Comment
        </p>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={disabled ? "Log in to add a comment" : "Write your comment"}
          rows={3}
          disabled={disabled}
          className="mt-3 w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)] disabled:cursor-not-allowed"
        />
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-4 py-1.5 text-xs font-semibold text-[color:var(--color-bg-primary)] shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              aria-hidden
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h18" />
              <path d="m12 3 9 9-9 9" />
            </svg>
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
}

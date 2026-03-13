import { useState } from "react";
import type { CommentItem } from "@/components/paper/types";

export type CommentSectionProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  actionMessage?: string;
  comments?: CommentItem[];
  currentUserId?: number | null;
  paperAuthorIds?: number[];
  onDelete?: (commentId: number | string) => void;
  onEdit?: (commentId: number | string, nextText: string) => Promise<void> | void;
};

export default function CommentSection({
  value,
  onChange,
  onSubmit,
  disabled,
  actionMessage,
  comments = [],
  currentUserId,
  paperAuthorIds = [],
  onDelete,
  onEdit,
}: CommentSectionProps) {
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [savingId, setSavingId] = useState<number | string | null>(null);

  const startEdit = (comment: CommentItem) => {
    setEditingId(comment.id);
    setEditingText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
    setSavingId(null);
  };

  const submitEdit = async (commentId: number | string) => {
    if (!onEdit) return;
    const nextText = editingText.trim();
    if (!nextText) return;
    setSavingId(commentId);
    try {
      await Promise.resolve(onEdit(commentId, nextText));
      setEditingId(null);
      setEditingText("");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
          Add Comment
        </h3>
        <span className="h-px flex-1 bg-[color:var(--color-border)]/70 ml-3" aria-hidden />
      </div>
      {actionMessage ? (
        <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
          {actionMessage}
        </p>
      ) : null}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={disabled ? "Log in to add a comment" : "Write your comment"}
        rows={3}
        disabled={disabled}
        className="mt-1 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)] disabled:cursor-not-allowed"
      />
      <div className="mt-3 flex items-center justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-4 py-1.5 text-xs font-semibold text-[color:var(--color-bg-primary)] shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Post Comment
        </button>
      </div>
      <div className="mt-5 space-y-4 border-t border-[color:var(--color-border)]/70 pt-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="h-9 w-9 overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)]">
                {comment.avatarUrl ? (
                  <img
                    src={comment.avatarUrl}
                    alt={comment.author}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 text-xs text-[color:var(--color-text-secondary)]">
                  <span className="font-semibold text-[color:var(--color-text-primary)]">
                    {comment.author}
                  </span>
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt ? (
                    <span className="whitespace-nowrap">Updated {comment.updatedAt}</span>
                  ) : comment.createdAt ? (
                    <span className="whitespace-nowrap">{comment.createdAt}</span>
                  ) : null}
                </div>
                {editingId === comment.id ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => submitEdit(comment.id)}
                        disabled={savingId === comment.id}
                        className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-4 py-1.5 text-xs font-semibold text-[color:var(--color-bg-primary)] shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingId === comment.id ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs font-semibold text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-2">
                      {onEdit &&
                      currentUserId &&
                      comment.authorId === currentUserId ? (
                        <button
                          type="button"
                          onClick={() => startEdit(comment)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
                          aria-label="Edit comment"
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
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                        </button>
                      ) : null}
                      {onDelete &&
                      currentUserId &&
                      (comment.authorId === currentUserId ||
                        paperAuthorIds.includes(currentUserId)) ? (
                        <button
                          type="button"
                          onClick={() => onDelete(comment.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-danger)] hover:text-[color:var(--color-danger)]"
                          aria-label="Delete comment"
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
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M6 6l1 14h10l1-14" />
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            No comments yet.
          </p>
        )}
      </div>
    </div>
  );
}

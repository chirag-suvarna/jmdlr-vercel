import CommentSection from "@/components/paper/CommentSection";
import type { CommentItem } from "@/components/paper/types";

export type CommentsPanelProps = {
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

export default function CommentsPanel({
  value,
  onChange,
  onSubmit,
  disabled,
  actionMessage,
  comments,
  currentUserId,
  paperAuthorIds,
  onDelete,
  onEdit,
}: CommentsPanelProps) {
  return (
    <CommentSection
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      disabled={disabled}
      actionMessage={actionMessage}
      comments={comments}
      currentUserId={currentUserId}
      paperAuthorIds={paperAuthorIds}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
}

import AuthorTile from "@/components/authors/AuthorTile";

type AuthorListItem = {
  id?: number | null;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
};

type AuthorListProps = {
  authors: AuthorListItem[];
  onSelect: (authorId?: number | null) => void;
  emptyMessage?: string;
};

export default function AuthorList({
  authors,
  onSelect,
  emptyMessage = "No authors available.",
}: AuthorListProps) {
  if (authors.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-4 py-6 text-sm text-[color:var(--color-text-secondary)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hidden">
      {authors.map((author) => (
        <AuthorTile
          key={author.id ?? `${author.name}-${author.username ?? ""}`}
          name={author.name}
          username={author.username}
          avatarUrl={author.avatarUrl}
          onSelect={() => onSelect(author.id)}
          className="min-w-[220px]"
        />
      ))}
    </div>
  );
}

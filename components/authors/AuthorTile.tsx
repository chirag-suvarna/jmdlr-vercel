type AuthorTileProps = {
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  onSelect: () => void;
  className?: string;
};

const getInitials = (name: string) => {
  const parts = name
    .replace("@", "")
    .split(" ")
    .filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "U";
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export default function AuthorTile({
  name,
  username,
  avatarUrl,
  onSelect,
  className,
}: AuthorTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-3 py-2 text-left transition duration-200 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-secondary-70)] ${
        className ?? ""
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] text-xs font-semibold text-[color:var(--color-text-secondary)]">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
          {name}
        </p>
        {username ? (
          <p className="text-xs text-[color:var(--color-text-secondary)]">
            @{username}
          </p>
        ) : null}
      </div>
    </button>
  );
}

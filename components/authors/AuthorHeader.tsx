type AuthorHeaderProps = {
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  subtitle?: string | null;
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

export default function AuthorHeader({
  name,
  username,
  avatarUrl,
  subtitle,
}: AuthorHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] text-base font-semibold text-[color:var(--color-text-secondary)]">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xl font-semibold text-[color:var(--color-text-primary)]">
          {name}
        </p>
        {username ? (
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            @{username}
          </p>
        ) : null}
        {subtitle ? (
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

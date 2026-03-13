type AuthorDetailsProps = {
  bio?: string | null;
  affiliation?: string | null;
  researchInterests?: string[] | null;
};

export default function AuthorDetails({
  bio,
  affiliation,
  researchInterests,
}: AuthorDetailsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
          Bio
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-text-primary)]">
          {bio?.trim() ? bio : "No bio provided."}
        </p>
      </div>
      <div className="space-y-4 text-sm text-[color:var(--color-text-secondary)]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
            Affiliation
          </p>
          <p className="mt-1 text-[color:var(--color-text-primary)]">
            {affiliation?.trim() || "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
            Research Interests
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {researchInterests && researchInterests.length > 0 ? (
              researchInterests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-2.5 py-1 text-[11px] text-[color:var(--color-text-primary)]"
                >
                  {interest}
                </span>
              ))
            ) : (
              <span className="text-xs text-[color:var(--color-text-secondary)]">
                —
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

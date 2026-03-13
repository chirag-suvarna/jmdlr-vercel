const showcases = [
  {
    title: "Curated Research Hub",
    description:
      "Surface multidisciplinary legal scholarship with instant filters, rich metadata, and citation-ready previews.",
    label: "Discovery",
  },
  {
    title: "Submission Pipeline",
    description:
      "Track peer review, revisions, and publication status from a single, streamlined dashboard.",
    label: "Workflow",
  },
];

export default function ShowcaseSection() {
  return (
    <section className="px-6 py-14">
      <div className="mx-auto grid max-w-[1150px] gap-10 lg:grid-cols-2">
        {showcases.map((item, index) => (
          <div
            key={item.title}
            className="flex flex-col justify-between gap-6 rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-8 shadow-[var(--shadow-card)]"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-secondary)]">
                {item.label}
              </span>
              <h3 className="mt-3 text-2xl font-semibold text-[color:var(--color-text-primary)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                {item.description}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary-60)] p-6">
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background:
                    "radial-gradient(circle at 20% 20%, var(--glow-aqua), transparent 60%), radial-gradient(circle at 80% 20%, var(--glow-orange), transparent 55%)",
                }}
              />
              <div className="relative space-y-3">
                <div className="h-2 w-2/3 rounded-full bg-[color:var(--color-text-secondary)]/70" />
                <div className="h-2 w-1/2 rounded-full bg-[color:var(--color-text-secondary)]/50" />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, cardIndex) => (
                    <div
                      key={`${item.label}-${cardIndex}`}
                      className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-4"
                    >
                      <div className="h-2 w-3/4 rounded-full bg-[color:var(--color-text-secondary)]/70" />
                      <div className="mt-2 h-2 w-1/2 rounded-full bg-[color:var(--color-text-secondary)]/50" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {index === 0 ? null : (
              <span className="text-xs text-[color:var(--color-text-secondary)]/80">
                Designed for clear review workflows and consistent publication
                timelines.
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

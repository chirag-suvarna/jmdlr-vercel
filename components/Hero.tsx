import Link from "next/link";

export default function Hero() {
  return (
    <section className="px-6 pt-16 pb-10">
      <div className="mx-auto max-w-[1150px]">
        <div className="relative overflow-hidden rounded-[36px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-glass)] p-12 shadow-[var(--shadow-soft)] backdrop-blur">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at top left,var(--glow-aqua),transparent 55%), radial-gradient(circle at bottom right,var(--glow-orange),transparent 55%)",
            }}
          />
          <div className="relative space-y-6">
            <span className="inline-flex items-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-muted)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-text-secondary)]">
              Peer-Reviewed · Open Access · Legal Scholarship
            </span>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[color:var(--color-text-primary)] sm:text-5xl lg:text-6xl">
              Discover papers, publish your work, and track scholarly impact.
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-[color:var(--color-text-secondary)]">
              India's open-access legal journal publishing original scholarship
              across all branches of law — by students, academicians, and
              practitioners.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/papers"
                className="rounded-full bg-[color:var(--color-accent)] px-7 py-3 text-sm font-semibold text-[color:var(--color-bg-primary)] shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-hover)]"
              >
                Explore Papers
              </Link>
              <Link
                href="/papers/submit"
                className="rounded-full border border-[color:var(--color-border)] bg-transparent px-7 py-3 text-sm font-semibold text-[color:var(--color-text-primary)] transition duration-200 hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-secondary)]"
              >
                Submit Paper
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-transparent bg-[color:var(--color-bg-secondary)] px-7 py-3 text-sm font-semibold text-[color:var(--color-text-secondary)] transition duration-200 hover:bg-[color:var(--color-bg-surface)] hover:text-[color:var(--color-text-primary)]"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

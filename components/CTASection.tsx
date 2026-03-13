import Link from "next/link";

export default function CTASection() {
  return (
    <section className="px-6 pb-16 pt-10">
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-[32px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-8 py-10 text-center shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-semibold text-[color:var(--color-text-primary)] sm:text-3xl">
            Publish where legal scholarship meets global impact.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
            Join an open-access community built for rigorous, peer-reviewed
            research across law, policy, and social justice.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/papers/submit"
              className="rounded-full bg-[color:var(--color-accent)] px-7 py-3 text-sm font-semibold text-[color:var(--color-bg-primary)] transition duration-200 hover:bg-[color:var(--color-accent-hover)]"
            >
              Submit Your Paper
            </Link>
            <Link
              href="/papers"
              className="rounded-full border border-[color:var(--color-border)] px-7 py-3 text-sm font-semibold text-[color:var(--color-text-primary)] transition duration-200 hover:border-[color:var(--color-border-strong)]"
            >
              Explore Publications
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

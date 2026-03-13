const features = [
  {
    icon: "🌐",
    title: "Diverse Perspectives",
    description: "Engage with cross-disciplinary legal scholarship.",
  },
  {
    icon: "🔗",
    title: "Multidisciplinary",
    description: "Bridge law with policy, technology, and society.",
  },
  {
    icon: "📖",
    title: "Open Access",
    description: "Publish research with global visibility and reach.",
  },
  {
    icon: "✔",
    title: "Quality Focus",
    description: "Rigorous review standards and ethical publishing.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-[color:var(--color-text-primary)] sm:text-3xl">
          Why Publish With Us
        </h2>
        <p className="mt-3 text-center text-sm text-[color:var(--color-text-secondary)]">
          A multidisciplinary platform for serious scholarship.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-7 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:border-[color:var(--color-border-strong)]"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] text-lg text-[color:var(--color-text-primary)] shadow-sm">
                  <span aria-hidden>{feature.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                  {feature.title}
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[color:var(--color-text-secondary)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

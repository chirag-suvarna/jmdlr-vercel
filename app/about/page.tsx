import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type IndexingPartner = {
  id?: number;
  name?: string;
  description?: string;
  image?: string | null;
  logo?: string | null;
  url?: string | null;
  issn?: string | null;
  indexed_date?: string | null;
};

export const metadata: Metadata = {
  title: "About IJCLSI & JMDLR",
  description:
    "Learn about IJCLSI and JMDLR—our mission, vision, subject scope, editorial board, and indexing & recognition.",
  openGraph: {
    title: "About IJCLSI & JMDLR",
    description:
      "Learn about IJCLSI and JMDLR—our mission, vision, subject scope, editorial board, and indexing & recognition.",
  },
};

const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const scopeClusters = [
  {
    title: "Public & Criminal Law",
    icon: "🏛️",
    items: ["Criminal Law", "Civil Law", "Constitutional Law"],
  },
  {
    title: "Commercial & Trade Law",
    icon: "💼",
    items: ["Trade Law", "Investment Law", "Competition Law & Policy"],
  },
  {
    title: "Emerging Areas",
    icon: "🌱",
    items: ["Environment Law", "Public Health & Law", "Economics & Law"],
  },
  {
    title: "International",
    icon: "🌐",
    items: ["WTO & Trade", "Arbitration", "Intellectual Property"],
  },
];

const boardMembers = [
  {
    name: "Editorial Member 1",
    designation: "Editor-in-Chief",
    institution: "Institution Name",
    expertise: "Constitutional Law",
  },
  {
    name: "Editorial Member 2",
    designation: "Senior Editor",
    institution: "Institution Name",
    expertise: "International Law",
  },
  {
    name: "Editorial Member 3",
    designation: "Associate Editor",
    institution: "Institution Name",
    expertise: "Commercial Law",
  },
  {
    name: "Editorial Member 4",
    designation: "Associate Editor",
    institution: "Institution Name",
    expertise: "Human Rights",
  },
  {
    name: "Editorial Member 5",
    designation: "Editorial Board",
    institution: "Institution Name",
    expertise: "Criminal Law",
  },
  {
    name: "Editorial Member 6",
    designation: "Editorial Board",
    institution: "Institution Name",
    expertise: "Technology & Law",
  },
];

export default async function AboutPage() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    .replace(/\/$/, "");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#publisher`,
        name: "JMDLR (Journal of Multi-Disciplinary Legal Research)",
        url: siteUrl,
      },
      {
        "@type": "Periodical",
        "@id": `${siteUrl}#journal`,
        name: "JMDLR (Journal of Multi-Disciplinary Legal Research)",
        url: siteUrl,
        publisher: { "@id": `${siteUrl}#publisher` },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        name: "JMDLR",
        url: siteUrl,
        publisher: { "@id": `${siteUrl}#publisher` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/papers?query={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/about#webpage`,
        url: `${siteUrl}/about`,
        name: "About IJCLSI & JMDLR",
        description:
          "Learn about IJCLSI and JMDLR—mission, vision, subject scope, editorial board, and indexing & recognition.",
        isPartOf: { "@id": `${siteUrl}#website` },
        about: { "@id": `${siteUrl}#journal` },
      },
    ],
  };

  const apiBase = getApiBase();
  let partners: IndexingPartner[] | null = null;

  try {
    const response = await fetch(`${apiBase}/indexing-partners/`, {
      cache: "no-store",
    });
    if (response.ok) {
      partners = (await response.json()) as IndexingPartner[];
    }
  } catch {
    partners = null;
  }

  return (
    <div className="min-h-screen text-[color:var(--color-text-primary)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <main className="pb-16">
        <section className="px-6 pt-16 pb-12">
          <div className="mx-auto max-w-[1100px] text-center">
            <div className="relative overflow-hidden rounded-[36px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-90)] px-10 py-14 shadow-[var(--shadow-soft)]">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg,var(--color-bg-primary),var(--color-bg-secondary))",
                  opacity: 0.8,
                }}
              />
              <div className="relative space-y-4">
                <span className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-muted)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--color-text-secondary)]">
                  Established [YEAR]
                </span>
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  Indian Journal of Contemporary Legal and Social Issues (IJCLSI)
                </h1>
                <p className="mx-auto max-w-3xl text-sm text-[color:var(--color-text-secondary)] sm:text-base">
                  A peer-reviewed, open-access legal journal committed to
                  advancing contemporary discourse in law, policy, and social
                  justice.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--color-text-secondary)]">
                Company Story
              </span>
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Building a rigorous, inclusive platform for contemporary legal
                scholarship.
              </h2>
              <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                IJCLSI was founded to elevate legal scholarship in India by
                bringing together students, academicians, and practitioners
                across disciplines. We emphasize peer review, ethical research,
                and open access visibility for scholars at every career stage.
              </p>
              <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                Our editorial mission is to foster conversations that connect
                law with policy, economics, technology, and social justice
                challenges shaping the present and future.
              </p>
            </div>
            <div className="rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-6 shadow-[var(--shadow-card)]">
              <div
                className="flex h-64 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary-60)]"
                style={{
                  background:
                    "radial-gradient(circle at 20% 20%, var(--glow-aqua), transparent 55%), radial-gradient(circle at 80% 10%, var(--glow-orange), transparent 50%)",
                }}
              >
                <span className="text-sm text-[color:var(--color-text-secondary)]">
                  Editorial timeline · Research growth · Global reach
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto grid max-w-[1100px] gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-7 shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                Mission
              </p>
              <h2 className="mt-2 text-lg font-semibold">
                Empowering rigorous legal scholarship
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                To provide a rigorous, inclusive platform for law students,
                academicians, researchers, and practitioners to publish
                original, high-quality legal scholarship across all branches of
                law.
              </p>
            </div>
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-7 shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                Vision
              </p>
              <h2 className="mt-2 text-lg font-semibold">
                Advancing India&apos;s global research presence
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                To become one of India&apos;s most cited open-access legal
                journals, fostering interdisciplinary dialogue between law,
                policy, economics, and social science.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-[1100px]">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-8 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-primary)]">
                  ✓
                </span>
                <h2 className="text-lg font-semibold">Focus &amp; Aim</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                IJCLSI welcomes contributions from all legal branches. Our aim
                is to upgrade the level of interaction and discussion about
                contemporary and emerging issues of law. We seek to become a
                highly cited publication through quality contributions —
                provided the work is original, unpublished, and free of
                plagiarism, and conforms to submission guidelines.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Subject Scope</h2>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {scopeClusters.map((cluster) => (
                <div
                  key={cluster.title}
                  className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-6 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:border-[color:var(--color-border-strong)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-bg-muted)] text-lg text-[color:var(--color-text-primary)]">
                      <span aria-hidden>{cluster.icon}</span>
                    </div>
                    <h3 className="text-sm font-semibold">{cluster.title}</h3>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-[color:var(--color-text-secondary)]">
                    {cluster.items.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[color:var(--color-text-secondary)]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-[1100px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Editorial Board</h2>
                <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                  A diverse panel of legal scholars guiding the journal&apos;s
                  academic integrity.
                </p>
              </div>
              <a
                href="mailto:editorinchief.ijclsi@gmail.com"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 py-2 text-sm font-semibold text-[color:var(--color-bg-primary)] transition hover:bg-[color:var(--color-accent-hover)]"
              >
                editorinchief.ijclsi@gmail.com
              </a>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {boardMembers.map((member) => {
                const initials = member.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("");
                return (
                  <div
                    key={member.name}
                    className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-6 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:border-[color:var(--color-border-strong)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-bg-muted)] text-xs font-semibold text-[color:var(--color-text-primary)]">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{member.name}</h3>
                        <p className="mt-1 text-xs font-semibold text-[color:var(--color-text-secondary)]">
                          {member.designation}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-[color:var(--color-text-secondary)]">
                      {member.institution}
                    </p>
                    <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
                      Expertise: {member.expertise}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-xl font-semibold">Values &amp; Principles</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: "⚖️",
                  title: "Integrity",
                  description: "Rigorous peer review and ethical publishing.",
                },
                {
                  icon: "🌍",
                  title: "Accessibility",
                  description: "Open access for global scholarly impact.",
                },
                {
                  icon: "🔍",
                  title: "Rigor",
                  description: "Evidence-led, citation-ready research.",
                },
                {
                  icon: "🤝",
                  title: "Community",
                  description: "Collaborative dialogue across disciplines.",
                },
              ].map((value) => (
                <div
                  key={value.title}
                  className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-6 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-1 hover:border-[color:var(--color-border-strong)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-bg-muted)] text-lg">
                    {value.icon}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{value.title}</h3>
                  <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-xl font-semibold">Indexing &amp; Recognition</h2>
            <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
              Visibility across trusted indexing platforms strengthens citation
              impact and global reach.
            </p>
            {partners && partners.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {partners.map((partner) => {
                  const logo = partner.logo ?? partner.image;
                  return (
                    <a
                      key={partner.id ?? partner.name}
                      href={partner.url || "#"}
                      target={partner.url ? "_blank" : undefined}
                      rel={partner.url ? "noreferrer" : undefined}
                      className="group relative block overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-[color:var(--color-border-strong)]"
                    >
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                        style={{
                          background:
                            "linear-gradient(145deg,var(--color-bg-muted),transparent 55%)",
                        }}
                      />
                      <div className="relative flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary-60)]">
                          {logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={logo}
                              alt={partner.name ?? "Indexing partner"}
                              className="h-10 w-auto object-contain"
                            />
                          ) : (
                            <span className="text-[11px] text-[color:var(--color-text-secondary)]">
                              Logo
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold">
                            {partner.name ?? "Indexing Partner"}
                          </h3>
                          <p className="mt-2 text-xs text-[color:var(--color-text-secondary)] line-clamp-2">
                            {partner.description ||
                              "Recognized platform supporting academic visibility."}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-6 py-8 text-sm text-[color:var(--color-text-secondary)]">
                Indexing partners will appear here once available.
              </div>
            )}
          </div>
        </section>

        <section className="px-6 pt-10">
          <div className="mx-auto max-w-[1100px]">
            <div className="rounded-[32px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-90)] px-8 py-10 text-center shadow-[var(--shadow-soft)]">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Connect with IJCLSI today.
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
                Learn more about submissions, editorial policies, and how we
                support open-access legal research across disciplines.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href="/papers"
                  className="rounded-full border border-[color:var(--color-border)] px-6 py-3 text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-border-strong)]"
                >
                  Explore Papers
                </a>
                <a
                  href="mailto:editorinchief.ijclsi@gmail.com"
                  className="rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-sm font-semibold text-[color:var(--color-bg-primary)] transition hover:bg-[color:var(--color-accent-hover)]"
                >
                  Contact Editorial Team
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AbstractSection from "@/components/paper-detail/AbstractSection";
import PaperBadge from "@/components/paper-detail/PaperBadge";
import PaperMeta from "@/components/paper-detail/PaperMeta";
import PaperTags from "@/components/paper-detail/PaperTags";
import PaperTitle from "@/components/paper-detail/PaperTitle";

type AuthorProfile = {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type PaperDetail = {
  id: number;
  title: string;
  abstract?: string | null;
  keywords?: string[] | null;
  published_date?: string | null;
  doi?: string | null;
  pdf_file?: string | null;
  status?: string | null;
  author_profiles?: AuthorProfile[] | null;
  metrics?: {
    views?: number;
    downloads?: number;
    likes?: number;
    comments?: number;
    bookmarks?: number;
  } | null;
};

const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const getAuthorNames = (profiles?: AuthorProfile[] | null) => {
  if (!profiles || profiles.length === 0) return ["Unknown Author"];
  return profiles.map((author) => {
    const fullName = [author.first_name, author.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return fullName || author.username || "Unknown Author";
  });
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const fetchPaper = async (id: string) => {
  const apiBase = getApiBase();
  const response = await fetch(`${apiBase}/papers/${id}/`, {
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as PaperDetail;
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    .replace(/\/$/, "");
  const paper = await fetchPaper(params.id);
  if (!paper) {
    return {
      title: "Paper Not Found",
      robots: { index: false, follow: false },
    };
  }
  if (paper.status && paper.status !== "published") {
    return {
      title: "Paper Unavailable",
      robots: { index: false, follow: false },
    };
  }
  const description =
    paper.abstract?.slice(0, 200) ||
    "Open access scholarly article published in JMDLR.";
  return {
    title: paper.title,
    description,
    alternates: {
      canonical: `${siteUrl}/papers/${paper.id}`,
    },
    openGraph: {
      title: paper.title,
      description,
      url: `${siteUrl}/papers/${paper.id}`,
      type: "article",
    },
  };
}

export default async function PaperDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const paper = await fetchPaper(params.id);
  if (!paper) {
    notFound();
  }
  if (paper.status && paper.status !== "published") {
    notFound();
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    .replace(/\/$/, "");
  const authorNames = getAuthorNames(paper.author_profiles);

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
        "@type": "WebPage",
        "@id": `${siteUrl}/papers/${paper.id}#webpage`,
        url: `${siteUrl}/papers/${paper.id}`,
        name: paper.title,
        description:
          paper.abstract?.slice(0, 200) ||
          "Open access scholarly article published in JMDLR.",
        isPartOf: { "@id": `${siteUrl}#website` },
        about: { "@id": `${siteUrl}#journal` },
      },
      {
        "@type": "ScholarlyArticle",
        "@id": `${siteUrl}/papers/${paper.id}#article`,
        headline: paper.title,
        description:
          paper.abstract?.slice(0, 200) ||
          "Open access scholarly article published in JMDLR.",
        datePublished: paper.published_date ?? undefined,
        identifier: paper.doi ? `DOI:${paper.doi}` : undefined,
        isPartOf: { "@id": `${siteUrl}#journal` },
        isAccessibleForFree: true,
        url: `${siteUrl}/papers/${paper.id}`,
        author: authorNames.map((name) => ({
          "@type": "Person",
          name,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen text-[color:var(--color-text-primary)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="rounded-[32px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-90)] p-8 shadow-[var(--shadow-soft)]">
          <div className="space-y-6">
            <div className="space-y-3">
              <PaperBadge label="Open Access Article" />
              <PaperTitle title={paper.title} />
              <PaperMeta
                authorLabel={authorNames.join(", ")}
                doi={paper.doi}
                publishedLabel={formatDate(paper.published_date)}
              />
            </div>
            <PaperTags tags={paper.keywords ?? []} />
            <AbstractSection abstract={paper.abstract ?? undefined} />
            {paper.pdf_file ? (
              <div>
                <a
                  href={paper.pdf_file}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-[color:var(--color-bg-primary)] shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-hover)]"
                >
                  View Full PDF
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

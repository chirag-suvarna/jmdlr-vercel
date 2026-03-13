import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PapersClient from "@/components/PapersClient";

type PaperMetrics = {
  views?: number;
  downloads?: number;
  likes?: number;
  bookmarks?: number;
  comments?: number;
};

type AuthorProfile = {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_picture?: string | null;
};

export const metadata: Metadata = {
  title: "Research Papers & Articles",
  description:
    "Browse open-access legal research papers, articles, and multidisciplinary scholarship published by JMDLR.",
  openGraph: {
    title: "Research Papers & Articles | JMDLR",
    description:
      "Browse open-access legal research papers, articles, and multidisciplinary scholarship published by JMDLR.",
  },
};

type PaperApi = {
  id: number;
  title: string;
  abstract?: string | null;
  keywords?: string[] | null;
  published_date?: string | null;
  doi?: string | null;
  pdf_file?: string | null;
  author_profiles?: AuthorProfile[] | null;
  metrics?: PaperMetrics | null;
};

type PaperListItem = {
  id: number;
  title: string;
  abstract: string;
  tags: string[];
  publishedDate: string | null;
  doi: string | null;
  pdfUrl: string | null;
  author: string;
  authorProfiles?: AuthorProfile[] | null;
  primaryAuthorId?: number | null;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  bookmarks: number;
  liked?: boolean;
  bookmarked?: boolean;
};

const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const getAuthorName = (profiles?: AuthorProfile[] | null) => {
  if (!profiles || profiles.length === 0) {
    return "Unknown Author";
  }
  const primary = profiles[0];
  const fullName = [primary.first_name, primary.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const name = fullName || primary.username || "Unknown Author";
  return profiles.length > 1 ? `${name} +${profiles.length - 1}` : name;
};

const unwrapPapers = (payload: PaperApi[] | { results?: PaperApi[] } | null) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.results) ? payload.results : [];
};

const fetchAllPapers = async (apiBase: string) => {
  const collected: PaperApi[] = [];
  let nextUrl: string | null = `${apiBase}/papers/?status=published&ordering=-published_date&page_size=200`;
  let guard = 0;

  while (nextUrl && guard < 50) {
    guard += 1;
    const response = await fetch(nextUrl, { cache: "no-store" });
    if (!response.ok) break;
    const payload = (await response.json()) as
      | PaperApi[]
      | { results?: PaperApi[]; next?: string | null };
    if (Array.isArray(payload)) {
      collected.push(...payload);
      break;
    }
    if (Array.isArray(payload.results)) {
      collected.push(...payload.results);
    }
    nextUrl = payload.next ?? null;
  }

  return collected;
};

export default async function PapersPage() {
  const apiBase = getApiBase();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    .replace(/\/$/, "");
  let papers: PaperListItem[] | null = null;

  try {
    const items = await fetchAllPapers(apiBase);
    papers = unwrapPapers(items).map((paper) => {
      const metrics = paper.metrics ?? {};
      return {
        id: paper.id,
        title: paper.title,
        abstract: paper.abstract ?? "",
        tags: paper.keywords ?? [],
        publishedDate: paper.published_date ?? null,
        doi: paper.doi ?? null,
        pdfUrl: paper.pdf_file ?? null,
        author: getAuthorName(paper.author_profiles),
        authorProfiles: paper.author_profiles ?? [],
        primaryAuthorId: paper.author_profiles?.[0]?.id ?? null,
        views: metrics.views ?? 0,
        downloads: metrics.downloads ?? 0,
        likes: metrics.likes ?? 0,
        comments: metrics.comments ?? 0,
        bookmarks: metrics.bookmarks ?? 0,
        liked: false,
        bookmarked: false,
      };
    });
  } catch {
    papers = null;
  }

  const papersStructuredData = {
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
        "@id": `${siteUrl}/papers#webpage`,
        url: `${siteUrl}/papers`,
        name: "Research Papers & Articles",
        description:
          "Browse open-access legal research papers, articles, and multidisciplinary scholarship published by JMDLR.",
        isPartOf: { "@id": `${siteUrl}#website` },
      },
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/papers#collection`,
        name: "Research Papers & Articles",
        url: `${siteUrl}/papers`,
        isPartOf: { "@id": `${siteUrl}#website` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: (papers ?? []).map((paper, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "ScholarlyArticle",
              headline: paper.title,
              description: paper.abstract?.slice(0, 200),
              datePublished: paper.publishedDate ?? undefined,
              identifier: paper.doi ? `DOI:${paper.doi}` : undefined,
              isPartOf: { "@id": `${siteUrl}#journal` },
              author: (paper.authorProfiles ?? []).map((profile) => ({
                "@type": "Person",
                name:
                  [profile.first_name, profile.last_name]
                    .filter(Boolean)
                    .join(" ")
                    .trim() ||
                  profile.username ||
                  "Author",
              })),
              isAccessibleForFree: true,
              url: paper.pdfUrl || `${siteUrl}/papers`,
            },
          })),
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col text-[color:var(--color-text-primary)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(papersStructuredData),
        }}
      />
      <Navbar />
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto w-full max-w-[1150px]">
          <PapersClient papers={papers} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

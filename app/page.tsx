import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import ShowcaseSection from "@/components/ShowcaseSection";
import IndexedBy from "@/components/IndexedBy";
import LatestPapers from "@/components/LatestPapers";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

type StatsApi = {
  papers?: number;
  authors?: number;
  citations?: number;
  downloads?: number;
  articles_published?: number;
  total_authors?: number;
};

type IndexingPartner = {
  id?: number;
  name?: string;
  description?: string;
  image?: string | null;
  logo?: string | null;
  url?: string | null;
};

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
  title: "Open Access Legal Research Journal",
  description:
    "Discover peer-reviewed legal research, publish original scholarship, and track scholarly impact on JMDLR (Journal of Multi-Disciplinary Legal Research).",
  openGraph: {
    title: "JMDLR — Open Access Legal Research Journal",
    description:
      "Discover peer-reviewed legal research, publish original scholarship, and track scholarly impact.",
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

type PapersResponse = {
  results?: PaperApi[];
} | PaperApi[];

type LatestPaper = {
  id: number;
  title: string;
  abstract: string;
  tags: string[];
  author: string;
  authorProfiles?: AuthorProfile[] | null;
  primaryAuthorId?: number | null;
  publishedDate: string | null;
  doi: string | null;
  pdfUrl: string | null;
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

const normalizePapers = (payload: PapersResponse | null): PaperApi[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

export default async function Home() {
  const apiBase = getApiBase();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    .replace(/\/$/, "");
  let statsData: StatsApi | null = null;
  let partners: IndexingPartner[] | null = null;
  let latestPapers: LatestPaper[] | null = null;

  const [statsResult, partnersResult, papersResult] = await Promise.allSettled([
    fetch(`${apiBase}/journal/stats/live/`, { cache: "no-store" }),
    fetch(`${apiBase}/indexing-partners/`, { cache: "no-store" }),
    fetch(
      `${apiBase}/papers/?status=published&ordering=-published_date&page_size=6`,
      { cache: "no-store" }
    ),
  ]);

  if (statsResult.status === "fulfilled" && statsResult.value.ok) {
    try {
      statsData = (await statsResult.value.json()) as StatsApi;
    } catch {
      statsData = null;
    }
  }

  if (partnersResult.status === "fulfilled" && partnersResult.value.ok) {
    try {
      partners = (await partnersResult.value.json()) as IndexingPartner[];
    } catch {
      partners = null;
    }
  }

  if (papersResult.status === "fulfilled" && papersResult.value.ok) {
    try {
      const payload = (await papersResult.value.json()) as PapersResponse;
      const results = normalizePapers(payload).slice(0, 3);
      latestPapers = results.map((paper) => {
        const metrics = paper.metrics ?? {};
        return {
          id: paper.id,
          title: paper.title,
          abstract: paper.abstract ?? "",
          tags: paper.keywords ?? [],
          author: getAuthorName(paper.author_profiles),
          authorProfiles: paper.author_profiles ?? [],
          primaryAuthorId: paper.author_profiles?.[0]?.id ?? null,
          publishedDate: paper.published_date ?? null,
          doi: paper.doi ?? null,
          pdfUrl: paper.pdf_file ?? null,
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
      latestPapers = null;
    }
  }

  const stats = statsData
    ? {
        papers: statsData.papers ?? statsData.articles_published ?? null,
        authors: statsData.authors ?? statsData.total_authors ?? null,
        citations: statsData.citations ?? null,
        downloads: statsData.downloads ?? null,
      }
    : null;

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
        "@id": `${siteUrl}/#webpage`,
        url: `${siteUrl}/`,
        name: "Open Access Legal Research Journal",
        isPartOf: { "@id": `${siteUrl}#website` },
        about: { "@id": `${siteUrl}#journal` },
        description:
          "Discover peer-reviewed legal research, publish original scholarship, and track scholarly impact on JMDLR.",
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#latest-papers`,
        name: "Latest Papers",
        itemListElement: (latestPapers ?? []).map((paper, index) => ({
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
    ],
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <Hero />
      <StatsSection stats={stats} />
      <FeaturesSection />
      <ShowcaseSection />
      <LatestPapers papers={latestPapers} />
      <IndexedBy partners={partners} />
      <CTASection />
      <Footer />
    </div>
  );
}

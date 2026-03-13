import type { MetadataRoute } from "next";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );

const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

type PaperApi = {
  id: number;
  published_date?: string | null;
};

type PapersResponse = {
  results?: PaperApi[];
} | PaperApi[];

const normalizePapers = (payload: PapersResponse | null): PaperApi[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();
  const items: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/papers`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    const apiBase = getApiBase();
    const response = await fetch(
      `${apiBase}/papers/?status=published&ordering=-published_date&page_size=500`,
      { cache: "no-store" }
    );
    if (response.ok) {
      const payload = (await response.json()) as PapersResponse;
      const papers = normalizePapers(payload);
      papers.forEach((paper) => {
        items.push({
          url: `${baseUrl}/papers/${paper.id}`,
          lastModified: paper.published_date
            ? new Date(paper.published_date)
            : now,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      });
    }
  } catch {
    // keep base routes only
  }

  return items;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PapersClient from "@/components/PapersClient";

type PaperMetrics = {
  views?: number;
  downloads?: number;
  likes?: number;
  comments?: number;
  bookmarks?: number;
};

type AuthorProfile = {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  profile_picture?: string | null;
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

type BookmarkItem = {
  id: number;
  paper: number;
  created_at?: string;
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
  return fullName || primary.username || "Unknown Author";
};

const normalizeResults = <T,>(payload: { results?: T[] } | T[] | null): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

export default function BookmarksPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<PaperListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const apiBase = getApiBase();
        const bookmarkResponse = await fetch(`${apiBase}/bookmarks/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!bookmarkResponse.ok) {
          if (bookmarkResponse.status === 401 || bookmarkResponse.status === 403) {
            localStorage.removeItem("jmdlr_token");
            localStorage.removeItem("jmdlr_refresh");
            localStorage.removeItem("jmdlr_username");
            router.replace("/auth");
            return;
          }
          throw new Error("Unable to load bookmarks.");
        }
        const bookmarkPayload = (await bookmarkResponse.json()) as
          | { results?: BookmarkItem[] }
          | BookmarkItem[];
        const bookmarks = normalizeResults(bookmarkPayload);
        if (bookmarks.length === 0) {
          if (!cancelled) {
            setPapers([]);
          }
          return;
        }

        const paperResponses = await Promise.allSettled(
          bookmarks.map((bookmark) =>
            fetch(`${apiBase}/papers/${bookmark.paper}/`, {
              headers: { Authorization: `Token ${token}` },
            })
          )
        );

        const resolved: PaperListItem[] = [];
        for (const result of paperResponses) {
          if (result.status !== "fulfilled" || !result.value.ok) {
            continue;
          }
          const paper = (await result.value.json()) as PaperApi;
          const metrics = paper.metrics ?? {};
          resolved.push({
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
            bookmarked: true,
          });
        }

        if (!cancelled) {
          setPapers(resolved);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load bookmarks.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-[1100px] space-y-6">
          {loading ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-500 shadow-sm">
              Loading bookmarks...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              {error}
            </div>
          ) : papers && papers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-500 shadow-sm">
              You haven&apos;t bookmarked any papers yet.
            </div>
          ) : (
            <PapersClient
              papers={papers}
              title="Bookmarks"
              subtitle="All papers you saved for later."
              badgeLabel="Saved Library"
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

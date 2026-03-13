"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PaperCard from "@/components/PaperCard";
import PaperDetailModal from "@/components/paper/PaperDetailModal";
import type { CommentItem } from "@/components/paper/types";
import AuthorList from "@/components/authors/AuthorList";
import AuthorHeader from "@/components/authors/AuthorHeader";
import AuthorMetrics from "@/components/authors/AuthorMetrics";
import AuthorDetails from "@/components/authors/AuthorDetails";
import AuthorLinks from "@/components/authors/AuthorLinks";

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

type PapersClientProps = {
  papers?: PaperListItem[] | null;
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  sortBy?: "new-old" | "old-new" | "alpha";
  initialQuery?: string;
  initialAuthorQuery?: string;
  initialTags?: string[];
  initialYears?: string[];
  availableTags?: string[];
  availableYears?: string[];
};

type AuthorProfile = {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_picture?: string | null;
};

type AuthorDetails = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  bio?: string | null;
  affiliation?: string | null;
  research_interests?: string[] | null;
  profile_picture?: string | null;
  linkedin?: string | null;
  orcid?: string | null;
  google_scholar?: string | null;
  authored_papers?: number;
  h_index?: number;
  total_citations?: number;
  total_views?: number;
};

type CommentApiItem = {
  id: number;
  paper?: number;
  author?: number;
  author_name?: string;
  text: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function PapersClient({
  papers,
  title = "Papers",
  subtitle = "Browse and filter published research.",
  badgeLabel = "Open Access Library",
  sortBy,
  initialQuery,
  initialAuthorQuery,
  initialTags,
  initialYears,
  availableTags,
  availableYears,
}: PapersClientProps) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [authorQuery, setAuthorQuery] = useState(initialAuthorQuery ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags ?? []);
  const [selectedYears, setSelectedYears] = useState<string[]>(initialYears ?? []);
  const [sortSelection, setSortSelection] = useState<"new-old" | "old-new" | "alpha">(
    sortBy ?? "new-old"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [activePaper, setActivePaper] = useState<PaperListItem | null>(null);
  const [references, setReferences] = useState<PaperListItem[]>([]);
  const [citedBy, setCitedBy] = useState<PaperListItem[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentList, setCommentList] = useState<CommentItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [paperHistory, setPaperHistory] = useState<PaperListItem[]>([]);
  const [metricsRange, setMetricsRange] = useState<
    "month" | "day" | "hour" | "week"
  >("month");
  const [metricsType, setMetricsType] = useState<
    "all" | "views" | "downloads" | "likes" | "comments" | "bookmarks"
  >("all");
  const [metricsSeries, setMetricsSeries] = useState<number[]>([]);
  const [metricsLabels, setMetricsLabels] = useState<string[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const lastPageRef = useRef(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authorModalOpen, setAuthorModalOpen] = useState(false);
  const [authorOptions, setAuthorOptions] = useState<AuthorProfile[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);
  const [authorDetails, setAuthorDetails] = useState<AuthorDetails | null>(null);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [authorError, setAuthorError] = useState<string | null>(null);
  const [authorView, setAuthorView] = useState<"list" | "details">("list");
  const activePaperId = activePaper?.id ?? null;
  const paperAuthorIds = useMemo(() => {
    if (!activePaper?.authorProfiles) return [];
    return activePaper.authorProfiles
      .map((profile) => profile.id)
      .filter((id): id is number => typeof id === "number");
  }, [activePaper]);
  const items = papers ?? [];
  const hasFilters =
    query || authorQuery || selectedTags.length > 0 || selectedYears.length > 0;
  const activeSort = sortSelection;
  const pageSize = 20;

  useEffect(() => {
    setQuery(initialQuery ?? "");
  }, [initialQuery]);

  useEffect(() => {
    setAuthorQuery(initialAuthorQuery ?? "");
  }, [initialAuthorQuery]);

  useEffect(() => {
    setSelectedTags(initialTags ?? []);
  }, [initialTags]);

  useEffect(() => {
    setSelectedYears(initialYears ?? []);
  }, [initialYears]);

  useEffect(() => {
    setSortSelection(sortBy ?? "new-old");
  }, [sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, authorQuery, selectedTags, selectedYears, activeSort]);

  const apiBase =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(
          /\/$/,
          ""
        )
      : "http://localhost:8000/api";

  const clearAuth = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("jmdlr_token");
    localStorage.removeItem("jmdlr_refresh");
    localStorage.removeItem("jmdlr_username");
    setIsAuthenticated(false);
  }, []);

  const getAuthorLabel = (profile?: AuthorProfile | null) => {
    if (!profile) return "Unknown Author";
    const fullName = [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return fullName || profile.username || "Unknown Author";
  };

  const authorListItems = useMemo(
    () =>
      authorOptions.map((option) => ({
        id: option.id,
        name: getAuthorLabel(option),
        username: option.username ?? null,
        avatarUrl: option.profile_picture ?? null,
      })),
    [authorOptions]
  );

  const authorLinks = useMemo(
    () => ({
      orcid: authorDetails?.orcid ?? null,
      googleScholar: authorDetails?.google_scholar ?? null,
      linkedin: authorDetails?.linkedin ?? null,
    }),
    [authorDetails]
  );

  const getInitials = (label: string) => {
    const parts = label
      .replace("@", "")
      .split(" ")
      .filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  };

  const formatCommentDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    const datePart = parsed.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timePart = parsed.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} • ${timePart}`;
  };

  const hydrateCommentAuthors = async (items: CommentApiItem[]) => {
    const base = items.map((comment) => ({
      id: comment.id,
      authorId: comment.author ?? null,
      author: comment.author_name || "Unknown Author",
      createdAt: formatCommentDate(comment.created_at),
      updatedAt: formatCommentDate(comment.updated_at),
      text: comment.text,
      avatarUrl: null as string | null,
    }));

    const authorIds = Array.from(
      new Set(base.map((comment) => comment.authorId).filter(Boolean))
    ) as number[];

    if (authorIds.length === 0) {
      return base;
    }

    const authorMap = new Map<number, { name: string; avatar?: string | null }>();
    await Promise.all(
      authorIds.map(async (authorId) => {
        try {
          const response = await fetch(`${apiBase}/users/${authorId}/`, {
            cache: "no-store",
          });
          if (!response.ok) return;
          const payload = (await response.json()) as {
            first_name?: string;
            last_name?: string;
            username?: string;
            profile_picture?: string | null;
          };
          const fullName = [payload.first_name, payload.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();
          authorMap.set(authorId, {
            name: fullName || payload.username || "Unknown Author",
            avatar: payload.profile_picture ?? null,
          });
        } catch {
          // ignore per-author failures
        }
      })
    );

    return base.map(({ authorId, ...rest }) => {
      if (authorId && authorMap.has(authorId)) {
        const detail = authorMap.get(authorId);
        return {
          ...rest,
          authorId,
          author: detail?.name || rest.author,
          avatarUrl: detail?.avatar ?? null,
        };
      }
      return { ...rest, authorId };
    });
  };

  const openAuthorModal = (
    profiles?: AuthorProfile[] | null,
    primaryId?: number | null
  ) => {
    const options = (profiles ?? []).filter((profile) => profile.id);
    const initialId =
      primaryId ?? options[0]?.id ?? profiles?.[0]?.id ?? null;
    const showDetails = Boolean(initialId) && options.length <= 1;
    setAuthorOptions(options);
    setSelectedAuthorId(initialId);
    setAuthorDetails(null);
    setAuthorError(null);
    setAuthorView(showDetails ? "details" : "list");
    setAuthorModalOpen(true);
  };

  const tagOptions = useMemo(() => {
    if (availableTags && availableTags.length > 0) {
      return availableTags;
    }
    const set = new Set<string>();
    items.forEach((paper) => {
      paper.tags.forEach((tag) => set.add(tag.toLowerCase()));
    });
    return Array.from(set).sort();
  }, [availableTags, items]);

  const yearOptions = useMemo(() => {
    if (availableYears && availableYears.length > 0) {
      return availableYears;
    }
    const set = new Set<string>();
    items.forEach((paper) => {
      if (paper.publishedDate) {
        const year = new Date(paper.publishedDate).getFullYear();
        if (!Number.isNaN(year)) {
          set.add(String(year));
        }
      }
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [availableYears, items]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const toggleYear = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((item) => item !== year) : [...prev, year]
    );
  };

  const clearFilters = () => {
    setQuery("");
    setAuthorQuery("");
    setSelectedTags([]);
    setSelectedYears([]);
  };

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedAuthor = authorQuery.trim().toLowerCase();
    const selectedTagsLower = selectedTags.map((tag) => tag.toLowerCase());
    const selectedYearSet = new Set(selectedYears);

    const matchesQuery = (paper: PaperListItem) => {
      if (!normalizedQuery) return true;
      const inTitle = paper.title.toLowerCase().includes(normalizedQuery);
      const inAbstract = paper.abstract.toLowerCase().includes(normalizedQuery);
      const inTags = paper.tags.some((tag) =>
        tag.toLowerCase().includes(normalizedQuery)
      );
      const inAuthor = paper.author.toLowerCase().includes(normalizedQuery);
      return inTitle || inAbstract || inTags || inAuthor;
    };

    const matchesAuthor = (paper: PaperListItem) => {
      if (!normalizedAuthor) return true;
      if (paper.author.toLowerCase().includes(normalizedAuthor)) return true;
      return (paper.authorProfiles ?? []).some((profile) => {
        const label = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ")
          .trim()
          .toLowerCase();
        const username = profile.username?.toLowerCase() ?? "";
        return (
          (label && label.includes(normalizedAuthor)) ||
          (username && username.includes(normalizedAuthor))
        );
      });
    };

    const matchesTags = (paper: PaperListItem) => {
      if (selectedTagsLower.length === 0) return true;
      const paperTags = paper.tags.map((tag) => tag.toLowerCase());
      return selectedTagsLower.some((tag) => paperTags.includes(tag));
    };

    const matchesYear = (paper: PaperListItem) => {
      if (selectedYearSet.size === 0) return true;
      if (!paper.publishedDate) return false;
      const year = String(new Date(paper.publishedDate).getFullYear());
      return selectedYearSet.has(year);
    };

    const filteredList = items.filter(
      (paper) =>
        matchesQuery(paper) &&
        matchesAuthor(paper) &&
        matchesTags(paper) &&
        matchesYear(paper)
    );

    const getDateValue = (paper: PaperListItem) => {
      if (!paper.publishedDate) return null;
      const time = new Date(paper.publishedDate).getTime();
      return Number.isNaN(time) ? null : time;
    };

    const sorted = [...filteredList].sort((a, b) => {
      if (activeSort === "alpha") {
        return a.title.localeCompare(b.title);
      }
      const aDate = getDateValue(a);
      const bDate = getDateValue(b);
      if (aDate === null && bDate === null) return 0;
      if (aDate === null) return 1;
      if (bDate === null) return -1;
      return activeSort === "old-new" ? aDate - bDate : bDate - aDate;
    });

    return sorted;
  }, [items, query, authorQuery, selectedTags, selectedYears, activeSort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!resultsRef.current) return;
    const previous = lastPageRef.current;
    if (currentPage > previous) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    lastPageRef.current = currentPage;
  }, [currentPage]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, currentPage, pageSize]);

  useEffect(() => {
    if (!activePaperId) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePaper(null);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [activePaperId]);

  useEffect(() => {
    if (!activePaperId) {
      setReferences([]);
      setCitedBy([]);
      setDetailsLoading(false);
      setActionMessage("");
      setCommentText("");
      setCommentList([]);
      setPaperHistory([]);
      return;
    }

    let cancelled = false;
    const loadDetails = async () => {
      setDetailsLoading(true);
      try {
        const [referencesRes, citedByRes] = await Promise.allSettled([
          fetch(`${apiBase}/papers/${activePaperId}/references/`),
          fetch(`${apiBase}/papers/${activePaperId}/cited_by/`),
        ]);

        if (!cancelled) {
          const extractList = async (
            result: PromiseSettledResult<Response>
          ): Promise<PaperListItem[]> => {
            if (result.status !== "fulfilled" || !result.value.ok) {
              return [];
            }
            const payload = (await result.value.json()) as {
              id: number;
              title: string;
              abstract?: string | null;
              keywords?: string[] | null;
              published_date?: string | null;
              doi?: string | null;
              author_profiles?: AuthorProfile[] | null;
              metrics?: PaperMetrics | null;
            }[];

            return payload.map((paper) => {
              const authorProfile = paper.author_profiles?.[0];
              const authorName =
                [authorProfile?.first_name, authorProfile?.last_name]
                  .filter(Boolean)
                  .join(" ")
                  .trim() ||
                authorProfile?.username ||
                "Unknown Author";

              return {
                id: paper.id,
                title: paper.title,
                abstract: paper.abstract ?? "",
                tags: paper.keywords ?? [],
                publishedDate: paper.published_date ?? null,
                doi: paper.doi ?? null,
                author: authorName,
                authorProfiles: paper.author_profiles ?? [],
                primaryAuthorId: paper.author_profiles?.[0]?.id ?? null,
                views: paper.metrics?.views ?? 0,
                downloads: paper.metrics?.downloads ?? 0,
                likes: paper.metrics?.likes ?? 0,
                comments: paper.metrics?.comments ?? 0,
                bookmarks: paper.metrics?.bookmarks ?? 0,
                liked: false,
                bookmarked: false,
              };
            });
          };

          const [refs, cited] = await Promise.all([
            extractList(referencesRes),
            extractList(citedByRes),
          ]);
          setReferences(refs);
          setCitedBy(cited);
        }
      } catch {
        if (!cancelled) {
          setReferences([]);
          setCitedBy([]);
        }
      } finally {
        if (!cancelled) {
          setDetailsLoading(false);
        }
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [activePaperId, apiBase]);

  useEffect(() => {
    if (!activePaperId) {
      setCommentList([]);
      return;
    }
    let cancelled = false;
    const loadComments = async () => {
      try {
        const response = await fetch(
          `${apiBase}/comments/?paper=${activePaperId}`,
          { cache: "no-store" }
        );
        if (!response.ok) {
          throw new Error("Unable to load comments");
        }
        const payload = (await response.json()) as
          | CommentApiItem[]
          | { results?: CommentApiItem[] };
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.results)
          ? payload.results
          : [];
        const hydrated = await hydrateCommentAuthors(items);
        if (!cancelled) {
          setCommentList(hydrated);
        }
      } catch {
        if (!cancelled) {
          setCommentList([]);
        }
      }
    };
    loadComments();
    return () => {
      cancelled = true;
    };
  }, [activePaperId, apiBase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("jmdlr_token");
    if (token && token.includes(".")) {
      clearAuth();
      return;
    }
    setIsAuthenticated(Boolean(token));
  }, [activePaperId, clearAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentUserId(null);
      return;
    }
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("jmdlr_token");
        if (!token) {
          setCurrentUserId(null);
          return;
        }
        const response = await fetch(`${apiBase}/auth/profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (response.status === 401 || response.status === 403) {
          clearAuth();
          setCurrentUserId(null);
          return;
        }
        if (!response.ok) {
          setCurrentUserId(null);
          return;
        }
        const payload = (await response.json()) as { id?: number };
        if (!cancelled) {
          setCurrentUserId(payload.id ?? null);
        }
      } catch {
        if (!cancelled) {
          setCurrentUserId(null);
        }
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [apiBase, clearAuth, isAuthenticated]);

  useEffect(() => {
    if (!authorModalOpen) {
      setAuthorDetails(null);
      setAuthorError(null);
      setAuthorLoading(false);
      setAuthorView("list");
      return;
    }
    if (!selectedAuthorId) {
      setAuthorDetails(null);
      setAuthorError(
        authorView === "details" ? "Author profile not available." : null
      );
      setAuthorLoading(false);
      return;
    }
    let cancelled = false;
    const loadAuthor = async () => {
      setAuthorLoading(true);
      setAuthorError(null);
      try {
        const token = localStorage.getItem("jmdlr_token");
        const response = await fetch(`${apiBase}/users/${selectedAuthorId}/`, {
          headers: token ? { Authorization: `Token ${token}` } : undefined,
        });
        if (!response.ok) {
          throw new Error("Unable to load author profile.");
        }
        const payload = (await response.json()) as AuthorDetails;
        if (!cancelled) {
          setAuthorDetails(payload);
        }
      } catch (err) {
        if (!cancelled) {
          setAuthorError(
            err instanceof Error ? err.message : "Unable to load author profile."
          );
        }
      } finally {
        if (!cancelled) {
          setAuthorLoading(false);
        }
      }
    };
    loadAuthor();
    return () => {
      cancelled = true;
    };
  }, [authorModalOpen, selectedAuthorId, apiBase, authorView]);


  const formatDate = (value: string | null) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = parsed.toLocaleString("en-US", { month: "short" });
    const year = parsed.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const metricsLabel = {
    month: "Monthly",
    day: "Daily",
    hour: "Hourly",
    week: "Weekly",
  }[metricsRange];

  const relatedPapers = useMemo(() => {
    if (!activePaper) return [];
    const activeTags = new Set(
      activePaper.tags.map((tag) => tag.toLowerCase())
    );
    const scored = items
      .filter((paper) => paper.id !== activePaper.id)
      .map((paper) => {
        const shared = paper.tags.filter((tag) =>
          activeTags.has(tag.toLowerCase())
        ).length;
        return { paper, shared };
      })
      .filter((entry) => entry.shared > 0)
      .sort((a, b) => b.shared - a.shared || b.paper.views - a.paper.views);
    return scored.slice(0, 3).map((entry) => entry.paper);
  }, [activePaper, items]);

  useEffect(() => {
    if (!activePaperId) {
      setMetricsSeries([]);
      setMetricsLabels([]);
      return;
    }
    let cancelled = false;
    const loadMetrics = async () => {
      setMetricsLoading(true);
      try {
        const response = await fetch(
          `${apiBase}/papers/${activePaperId}/activity/?range=${metricsRange}&metric=${metricsType}`,
          { cache: "no-store" }
        );
        if (!response.ok) {
          throw new Error("Unable to load activity data");
        }
        const payload = (await response.json()) as {
          labels?: string[];
          values?: number[];
        };
        if (!cancelled) {
          const values = Array.isArray(payload.values)
            ? payload.values.map((value) => Number(value) || 0)
            : [];
          const labels = Array.isArray(payload.labels)
            ? payload.labels.map((label) => String(label))
            : [];
          const resolvedLabels =
            labels.length === values.length
              ? labels
              : values.map((_, index) => String(index + 1));
          setMetricsSeries(values);
          setMetricsLabels(resolvedLabels);
        }
      } catch {
        if (!cancelled) {
          setMetricsSeries([]);
          setMetricsLabels([]);
        }
      } finally {
        if (!cancelled) {
          setMetricsLoading(false);
        }
      }
    };
    loadMetrics();
    return () => {
      cancelled = true;
    };
  }, [activePaperId, apiBase, metricsRange, metricsType]);


  const postJson = async (url: string, body: Record<string, unknown>) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("jmdlr_token")
        : null;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return response;
  };

  const openPaperInModal = (paper: PaperListItem) => {
    if (!activePaper || paper.id === activePaper.id) return;
    setPaperHistory((prev) => [...prev, activePaper]);
    setActivePaper(paper);
  };

  const goBackToPreviousPaper = () => {
    setPaperHistory((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const previous = next.pop();
      if (previous) {
        setActivePaper(previous);
      }
      return next;
    });
  };

  const handleLike = async () => {
    if (!activePaper) return;
    if (!isAuthenticated) {
      setActionMessage("Please log in to like this paper.");
      return;
    }
    setActionMessage("");
    try {
      const response = await postJson(`${apiBase}/likes/toggle_like/`, {
        paper_id: activePaper.id,
      });
      if (response.status === 401 || response.status === 403) {
        clearAuth();
        setActionMessage("Please log in to like this paper.");
        return;
      }
      const data = (await response.json()) as { liked?: boolean };
      setActivePaper((prev) => {
        if (!prev) return prev;
        const liked = Boolean(data.liked);
        const nextLikes = liked
          ? prev.likes + 1
          : Math.max(0, prev.likes - 1);
        return { ...prev, likes: nextLikes, liked };
      });
    } catch {
      setActionMessage("Unable to update like right now.");
    }
  };

  const handleBookmark = async () => {
    if (!activePaper) return;
    if (!isAuthenticated) {
      setActionMessage("Please log in to bookmark this paper.");
      return;
    }
    setActionMessage("");
    try {
      const response = await postJson(`${apiBase}/bookmarks/toggle_bookmark/`, {
        paper_id: activePaper.id,
      });
      if (response.status === 401 || response.status === 403) {
        clearAuth();
        setActionMessage("Please log in to bookmark this paper.");
        return;
      }
      const data = (await response.json()) as { bookmarked?: boolean };
      setActivePaper((prev) => {
        if (!prev) return prev;
        const bookmarked = Boolean(data.bookmarked);
        const nextBookmarks = bookmarked
          ? prev.bookmarks + 1
          : Math.max(0, prev.bookmarks - 1);
        return { ...prev, bookmarks: nextBookmarks, bookmarked };
      });
    } catch {
      setActionMessage("Unable to update bookmark right now.");
    }
  };

  const handleComment = async () => {
    if (!activePaper) return;
    const text = commentText.trim();
    if (!text) return;
    if (!isAuthenticated) {
      setActionMessage("Please log in to comment.");
      return;
    }
    setActionMessage("");
    try {
      const response = await postJson(`${apiBase}/comments/`, {
        paper: activePaper.id,
        text,
      });
      if (response.status === 401) {
        clearAuth();
        setActionMessage("Please log in to comment.");
        return;
      }
      if (response.status === 403) {
        let detail: string | undefined;
        try {
          const payload = (await response.json()) as { detail?: string } | null;
          detail = payload?.detail;
        } catch {
          detail = undefined;
        }
        setActionMessage(detail || "Verify your email or phone to comment.");
        return;
      }
      if (!response.ok) {
        setActionMessage("Unable to post comment right now.");
        return;
      }
      try {
        const payload = (await response.json()) as CommentApiItem;
        const [hydrated] = await hydrateCommentAuthors([payload]);
        setCommentList((prev) => [hydrated, ...prev]);
      } catch {
        // ignore list hydration errors
      }
      setActivePaper((prev) => {
        if (!prev) return prev;
        return { ...prev, comments: prev.comments + 1 };
      });
      setCommentText("");
    } catch {
      setActionMessage("Unable to post comment right now.");
    }
  };

  const handleDeleteComment = async (commentId: number | string) => {
    if (!activePaper) return;
    if (!isAuthenticated) {
      setActionMessage("Please log in to manage comments.");
      return;
    }
    setActionMessage("");
    try {
      const token = localStorage.getItem("jmdlr_token");
      const response = await fetch(`${apiBase}/comments/${commentId}/`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
      });
      if (response.status === 401 || response.status === 403) {
        setActionMessage("You do not have permission to delete this comment.");
        return;
      }
      if (!response.ok) {
        setActionMessage("Unable to delete comment right now.");
        return;
      }
      setCommentList((prev) => prev.filter((comment) => comment.id !== commentId));
      setActivePaper((prev) => {
        if (!prev) return prev;
        return { ...prev, comments: Math.max(0, prev.comments - 1) };
      });
    } catch {
      setActionMessage("Unable to delete comment right now.");
    }
  };

  const handleEditComment = async (commentId: number | string, nextText: string) => {
    if (!activePaper) return;
    if (!isAuthenticated) {
      setActionMessage("Please log in to edit comments.");
      return;
    }
    setActionMessage("");
    try {
      const token = localStorage.getItem("jmdlr_token");
      const response = await fetch(`${apiBase}/comments/${commentId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
        body: JSON.stringify({ text: nextText }),
      });
      if (response.status === 401 || response.status === 403) {
        setActionMessage("You do not have permission to edit this comment.");
        return;
      }
      if (!response.ok) {
        setActionMessage("Unable to update comment right now.");
        return;
      }
      const payload = (await response.json()) as CommentApiItem;
      const [hydrated] = await hydrateCommentAuthors([payload]);
      setCommentList((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, ...hydrated } : comment
        )
      );
    } catch {
      setActionMessage("Unable to update comment right now.");
    }
  };

  return (
    <div className="mx-auto max-w-[1150px] space-y-8">
      <div className="px-2 sm:px-0">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-muted)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--color-text-secondary)]">
              {badgeLabel}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--color-text-primary)] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
              {subtitle}
            </p>
          </div>
          <div className="w-full lg:max-w-md">
            <label className="sr-only" htmlFor="paper-search">
              Search papers
            </label>
            <div className="relative">
              <svg
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-secondary)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                id="paper-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or tag"
                className="w-full rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] py-3 pl-11 pr-4 text-sm text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)] transition duration-200 placeholder:text-[color:var(--color-text-secondary)] focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit self-start rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-6 shadow-[var(--shadow-card)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                Filters
              </h2>
              <p className="text-xs text-[color:var(--color-text-secondary)]">
                Refine your results
              </p>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-transparent bg-[color:var(--color-accent)] px-3 py-1 text-[11px] font-semibold text-[color:var(--color-bg-primary)] transition duration-200 hover:bg-[color:var(--color-accent-hover)]"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="mt-5 space-y-4 text-sm text-[color:var(--color-text-secondary)]">
            <div>
              <input
                value={authorQuery}
                onChange={(event) => setAuthorQuery(event.target.value)}
                placeholder="Search author"
                className="w-full rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-2 text-sm text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)] transition duration-200 placeholder:text-[color:var(--color-text-secondary)] focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
              />
            </div>

            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-3 shadow-[var(--shadow-card)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                Year
              </div>
              <div
                className="scrollbar-hidden mt-3 flex max-h-32 flex-wrap gap-2 overflow-auto pr-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {yearOptions.length > 0 ? (
                  yearOptions.map((year) => {
                    const active = selectedYears.includes(year);
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => toggleYear(year)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          active
                            ? "border-transparent bg-[color:var(--color-accent)] text-[color:var(--color-bg-primary)]"
                            : "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)]"
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-[color:var(--color-text-secondary)]">
                    No data
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-3 shadow-[var(--shadow-card)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                Tags
              </div>
              <div
                className="scrollbar-hidden mt-3 flex max-h-40 flex-wrap gap-2 overflow-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {tagOptions.length > 0 ? (
                  tagOptions.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition capitalize ${
                          active
                            ? "border-transparent bg-[color:var(--color-accent)] text-[color:var(--color-bg-primary)]"
                            : "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)]"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-[color:var(--color-text-secondary)]">
                    No tags
                  </span>
                )}
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div
            ref={resultsRef}
            className="min-h-[520px] rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-7 shadow-[var(--shadow-card)] backdrop-blur"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                  Results
                </h2>
                <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
                  Showing {paginated.length} of {filtered.length}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="sr-only" htmlFor="paper-sort">
                  Sort papers
                </label>
                <select
                  id="paper-sort"
                  value={activeSort}
                  onChange={(event) => {
                    const nextSort = event.target.value as
                      | "new-old"
                      | "old-new"
                      | "alpha";
                    setSortSelection(nextSort);
                  }}
                  className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-2 text-xs font-semibold text-[color:var(--color-text-secondary)] shadow-[var(--shadow-card)] transition duration-200 focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                >
                  <option value="new-old">Newest → Oldest</option>
                  <option value="old-new">Oldest → Newest</option>
                  <option value="alpha">Alphabetical</option>
                </select>
              </div>
            </div>
            {filtered.length > 0 ? (
              <>
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {paginated.map((paper) => (
                    <div
                      key={paper.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActivePaper(paper)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setActivePaper(paper);
                        }
                      }}
                      className="text-left"
                    >
                      <PaperCard
                        title={paper.title}
                        abstract={paper.abstract}
                        tags={paper.tags}
                        author={paper.author}
                        views={paper.views}
                        downloads={paper.downloads}
                        likes={paper.likes}
                        comments={paper.comments}
                        bookmarks={paper.bookmarks}
                        onAuthorClick={() =>
                          openAuthorModal(
                            paper.authorProfiles,
                            paper.primaryAuthorId
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
                {totalPages > 1 ? (
                  <div className="mt-8 flex items-center justify-center gap-4 text-sm text-[color:var(--color-text-secondary)]">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                        currentPage === 1
                          ? "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-secondary)]"
                          : "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-border-strong)]"
                      }`}
                      aria-label="Previous page"
                    >
                      <svg
                        aria-hidden
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <div className="text-xs font-semibold text-[color:var(--color-text-primary)]">
                      Page {currentPage} of {totalPages}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                        currentPage === totalPages
                          ? "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-secondary)]"
                          : "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-border-strong)]"
                      }`}
                      aria-label="Next page"
                    >
                      <svg
                        aria-hidden
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-6 py-10 text-sm text-[color:var(--color-text-secondary)]">
                No papers match your filters.
              </div>
            )}
          </div>
        </section>
      </div>

      <PaperDetailModal
        open={Boolean(activePaper)}
        paper={activePaper}
        publishedLabel={
          activePaper?.publishedDate ? formatDate(activePaper.publishedDate) : null
        }
        onClose={() => setActivePaper(null)}
        onBack={goBackToPreviousPaper}
        showBack={paperHistory.length > 0}
        onAuthorClick={() =>
          activePaper
            ? openAuthorModal(activePaper.authorProfiles, activePaper.primaryAuthorId)
            : undefined
        }
        onPreview={() => {
          if (!activePaper) return;
          if (activePaper.pdfUrl) {
            window.open(activePaper.pdfUrl, "_blank", "noopener");
          } else {
            setActionMessage("PDF preview not available.");
          }
        }}
        onDownload={() => {
          if (!activePaper) return;
          window.open(
            `${apiBase}/papers/${activePaper.id}/download/`,
            "_blank",
            "noopener"
          );
        }}
        onBookmark={handleBookmark}
        onLike={handleLike}
        references={references}
        citations={citedBy}
        detailsLoading={detailsLoading}
        onPaperSelect={openPaperInModal}
        onAuthorSelect={(paper) =>
          openAuthorModal(paper.authorProfiles, paper.primaryAuthorId)
        }
        relatedPapers={relatedPapers}
        onRelatedSelect={openPaperInModal}
        onRelatedAuthorSelect={(paper) =>
          openAuthorModal(paper.authorProfiles, paper.primaryAuthorId)
        }
        commentText={commentText}
        onCommentChange={setCommentText}
        onCommentSubmit={handleComment}
        isAuthenticated={isAuthenticated}
        actionMessage={actionMessage}
        comments={commentList}
        currentUserId={currentUserId}
        paperAuthorIds={paperAuthorIds}
        onCommentDelete={handleDeleteComment}
        onCommentEdit={handleEditComment}
        metricsLabel={metricsLabel}
        metricsRange={metricsRange}
        metricsType={metricsType}
        metricsSeries={metricsSeries}
        metricsLabels={metricsLabels}
        metricsLoading={metricsLoading}
        onMetricsRangeChange={setMetricsRange}
        onMetricsTypeChange={setMetricsType}
      />
      {authorModalOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-6 py-10 backdrop-blur-lg"
          onClick={() => setAuthorModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-4xl rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] p-6 shadow-[var(--shadow-soft)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              {authorView === "list" ? (
                <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                  Author Profiles
                </h3>
              ) : authorOptions.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setAuthorView("list")}
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
                >
                  <svg
                    aria-hidden
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  Back to authors
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setAuthorModalOpen(false)}
                className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-2 text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
                aria-label="Close"
              >
                <svg
                  aria-hidden
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6l-12 12" />
                </svg>
              </button>
            </div>

            {authorView === "list" ? (
              <div className="mt-4">
                <AuthorList
                  authors={authorListItems}
                  onSelect={(id) => {
                    setSelectedAuthorId(id ?? null);
                    setAuthorDetails(null);
                    setAuthorError(null);
                    setAuthorView("details");
                  }}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {authorError ? (
                  <div className="rounded-2xl border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-4 py-4 text-sm text-[color:var(--color-text-primary)]">
                    {authorError}
                  </div>
                ) : null}
                {authorLoading ? (
                  <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-4 py-6 text-sm text-[color:var(--color-text-secondary)]">
                    Loading author profile...
                  </div>
                ) : authorDetails ? (
                  <>
                    <AuthorHeader
                      name={
                        [authorDetails.first_name, authorDetails.last_name]
                          .filter(Boolean)
                          .join(" ")
                          .trim() || authorDetails.username || "Author"
                      }
                      username={authorDetails.username ?? null}
                      avatarUrl={authorDetails.profile_picture ?? null}
                    />
                    <div className="border-t border-[color:var(--color-border)]/70 pt-5">
                      <AuthorMetrics
                        stats={[
                          {
                            label: "Published Papers",
                            value: authorDetails.authored_papers ?? 0,
                          },
                          {
                            label: "Citations",
                            value: authorDetails.total_citations ?? 0,
                          },
                          { label: "H-index", value: authorDetails.h_index ?? 0 },
                          { label: "Views", value: authorDetails.total_views ?? 0 },
                        ]}
                      />
                    </div>
                    <div className="border-t border-[color:var(--color-border)]/70 pt-5">
                      <AuthorDetails
                        bio={authorDetails.bio ?? null}
                        affiliation={authorDetails.affiliation ?? null}
                        researchInterests={authorDetails.research_interests ?? null}
                      />
                    </div>
                    <div className="border-t border-[color:var(--color-border)]/70 pt-5">
                      <AuthorLinks
                        orcid={authorLinks.orcid}
                        googleScholar={authorLinks.googleScholar}
                        linkedin={authorLinks.linkedin}
                      />
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-4 py-6 text-sm text-[color:var(--color-text-secondary)]">
                    Select an author to view their profile.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}


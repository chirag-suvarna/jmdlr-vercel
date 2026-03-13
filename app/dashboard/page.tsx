"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GlobalMetrics from "@/components/dashboard/GlobalMetrics";
import SearchBar from "@/components/dashboard/SearchBar";
import SortDropdown from "@/components/dashboard/SortDropdown";
import StatusTabs from "@/components/dashboard/StatusTabs";
import PapersTable from "@/components/dashboard/PapersTable";

type PaperItem = {
  id: number;
  title: string;
  abstract?: string | null;
  keywords?: string[] | null;
  status?: string;
  review_status?: string;
  is_paid?: boolean;
  created_date?: string;
  updated_date?: string;
  published_date?: string | null;
  author_profiles?: AuthorProfile[] | null;
  metrics?: {
    views?: number;
    downloads?: number;
    bookmarks?: number;
    likes?: number;
    comments?: number;
  } | null;
};

type AuthorProfile = {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  profile_picture?: string | null;
};

type PapersResponse = {
  results?: PaperItem[];
} | PaperItem[];

type UserApi = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  email?: string | null;
  profile_picture?: string | null;
};

type UserResponse = {
  results?: UserApi[];
} | UserApi[];

type PaperSearchResult = {
  id: number;
  title: string;
  abstract?: string | null;
  keywords?: string[] | null;
  published_date?: string | null;
  author_profiles?: AuthorProfile[] | null;
};

type PaperSearchResponse = {
  results?: PaperSearchResult[];
} | PaperSearchResult[];

type RazorpayInitResponse = {
  gateway: "razorpay";
  order_id: string;
  amount: number;
  currency: string;
  key_id: string | null;
  payment_id: number;
  display_amount: string;
};

type PayPalInitResponse = {
  gateway: "paypal";
  order_id: string;
  amount: string;
  currency: string;
  payment_id: number;
};

type PaymentInitResponse = RazorpayInitResponse | PayPalInitResponse;

const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const normalizePapers = (payload: PapersResponse | null): PaperItem[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

const normalizeResults = <T,>(payload: { results?: T[] } | T[] | null): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

const getUserLabel = (user: UserApi) => {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return fullName || user.username || user.email || "Unknown User";
};

const getInitials = (label: string) => {
  const parts = label
    .replace("@", "")
    .split(" ")
    .filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

const getAuthorNameFromProfiles = (profiles?: AuthorProfile[] | null) => {
  if (!profiles || profiles.length === 0) return "Unknown Author";
  const primary = profiles[0];
  const fullName = [primary.first_name, primary.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || primary.username || "Unknown Author";
};

const getPaperAuthorLabel = (paper: PaperItem) => {
  return getAuthorNameFromProfiles(paper.author_profiles);
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatFileSize = (value?: number | null) => {
  if (value === null || value === undefined) return "";
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const hasBeenEdited = (created?: string, updated?: string) => {
  if (!created || !updated) return false;
  const createdTime = new Date(created).getTime();
  const updatedTime = new Date(updated).getTime();
  if (Number.isNaN(createdTime) || Number.isNaN(updatedTime)) return false;
  return updatedTime - createdTime > 1000;
};

const truncate = (value?: string | null, max = 180) => {
  if (!value) return "No abstract available.";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
};

const statusBadge = (status?: string) => {
  switch (status) {
    case "published":
      return "border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/15 text-[color:var(--color-text-primary)]";
    case "archived":
      return "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] text-[color:var(--color-text-secondary)]";
    default:
      return "border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-secondary)]";
  }
};

const reviewBadge = (status?: string) => {
  switch (status) {
    case "approved":
      return "border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/15 text-[color:var(--color-text-primary)]";
    case "rejected":
      return "border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 text-[color:var(--color-text-primary)]";
    case "pending":
      return "border-[color:var(--color-link)]/30 bg-[color:var(--color-link)]/15 text-[color:var(--color-text-primary)]";
    default:
      return "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] text-[color:var(--color-text-secondary)]";
  }
};

const getUnifiedStatus = (paper: PaperItem) => {
  if (paper.status === "published") return "Published";
  if (paper.review_status === "rejected") return "Rejected";
  if (paper.review_status === "pending") return "Under Review";
  if (paper.review_status === "approved" && !paper.is_paid) return "Payment Due";
  if (paper.status === "draft") return "Draft";
  return paper.status || "In Progress";
};

const statusChipStyle = (status: string) => {
  switch (status) {
    case "Published":
      return "border-[color:var(--color-accent)]/30 bg-[color:var(--color-accent)]/15 text-[color:var(--color-text-primary)]";
    case "Rejected":
      return "border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 text-[color:var(--color-text-primary)]";
    case "Under Review":
      return "border-[color:var(--color-link)]/30 bg-[color:var(--color-link)]/15 text-[color:var(--color-text-primary)]";
    case "Payment Due":
      return "border-[color:var(--color-accent-hover)]/40 bg-[color:var(--color-accent-hover)]/15 text-[color:var(--color-text-primary)]";
    case "Draft":
      return "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] text-[color:var(--color-text-secondary)]";
    default:
      return "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] text-[color:var(--color-text-secondary)]";
  }
};

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Document not available"));
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Script failed to load")), {
          once: true,
        });
      }
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };
    script.onerror = () => reject(new Error("Script failed to load"));
    document.body.appendChild(script);
  });

const waitForPayPalContainer = (
  ref: { current: HTMLDivElement | null },
  attempts = 20,
  delayMs = 50
) =>
  new Promise<HTMLDivElement>((resolve, reject) => {
    let tries = 0;
    const check = () => {
      if (ref.current) {
        resolve(ref.current);
        return;
      }
      tries += 1;
      if (tries >= attempts) {
        reject(new Error("PayPal container not available."));
        return;
      }
      setTimeout(check, delayMs);
    };
    check();
  });

export default function DashboardPage() {
  const router = useRouter();
  const paypalContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activePaper, setActivePaper] = useState<PaperItem | null>(null);
  const [editPaper, setEditPaper] = useState<PaperItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAbstract, setEditAbstract] = useState("");
  const [editTagInput, setEditTagInput] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editHasPdf, setEditHasPdf] = useState(false);
  const [editCoAuthorQuery, setEditCoAuthorQuery] = useState("");
  const [editCoAuthorResults, setEditCoAuthorResults] = useState<UserApi[]>([]);
  const [editCoAuthorLoading, setEditCoAuthorLoading] = useState(false);
  const [editSelectedCoAuthors, setEditSelectedCoAuthors] = useState<UserApi[]>([]);
  const [editReferenceQuery, setEditReferenceQuery] = useState("");
  const [editReferenceResults, setEditReferenceResults] = useState<PaperSearchResult[]>([]);
  const [editReferenceLoading, setEditReferenceLoading] = useState(false);
  const [editSelectedReferences, setEditSelectedReferences] = useState<
    PaperSearchResult[]
  >([]);
  const [editLoading, setEditLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [paymentPaper, setPaymentPaper] = useState<PaperItem | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<"razorpay" | "paypal" | null>(
    null
  );
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paypalCurrency, setPaypalCurrency] = useState<string | null>(null);
  const [paypalAmount, setPaypalAmount] = useState<string | null>(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const paypalInitRef = useRef<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAbstract, setUploadAbstract] = useState("");
  const [uploadTagInput, setUploadTagInput] = useState("");
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [coAuthorQuery, setCoAuthorQuery] = useState("");
  const [coAuthorResults, setCoAuthorResults] = useState<UserApi[]>([]);
  const [coAuthorLoading, setCoAuthorLoading] = useState(false);
  const [selectedCoAuthors, setSelectedCoAuthors] = useState<UserApi[]>([]);
  const [referenceQuery, setReferenceQuery] = useState("");
  const [referenceResults, setReferenceResults] = useState<PaperSearchResult[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState<PaperSearchResult[]>([]);

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
        const response = await fetch(`${apiBase}/papers/my_papers/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("jmdlr_token");
            localStorage.removeItem("jmdlr_refresh");
            localStorage.removeItem("jmdlr_username");
            router.replace("/auth");
            return;
          }
          throw new Error("Unable to load your papers.");
        }
        const payload = (await response.json()) as PapersResponse;
        if (!cancelled) {
          setPapers(normalizePapers(payload));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load papers.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!paymentPaper) {
      setPaymentError(null);
      setPaymentLoading(null);
      setPaypalReady(false);
      setPaypalOrderId(null);
      setPaypalCurrency(null);
      setPaypalAmount(null);
      setShowPayPal(false);
      paypalInitRef.current = null;
      if (paypalContainerRef.current) {
        paypalContainerRef.current.innerHTML = "";
      }
    }
  }, [paymentPaper]);

  useEffect(() => {
    if (!showUpload) {
      setUploadError(null);
      setUploadTitle("");
      setUploadAbstract("");
      setUploadTagInput("");
      setUploadTags([]);
      setUploadFile(null);
      setAvailableTags([]);
      setTagsLoading(false);
      setCoAuthorQuery("");
      setCoAuthorResults([]);
      setCoAuthorLoading(false);
      setSelectedCoAuthors([]);
      setReferenceQuery("");
      setReferenceResults([]);
      setReferenceLoading(false);
      setSelectedReferences([]);
    }
  }, [showUpload]);

  useEffect(() => {
    if (!editPaper) {
      setEditTitle("");
      setEditAbstract("");
      setEditTagInput("");
      setEditTags([]);
      setEditFile(null);
      setEditHasPdf(false);
      setEditCoAuthorQuery("");
      setEditCoAuthorResults([]);
      setEditCoAuthorLoading(false);
      setEditSelectedCoAuthors([]);
      setEditReferenceQuery("");
      setEditReferenceResults([]);
      setEditReferenceLoading(false);
      setEditSelectedReferences([]);
      setEditLoading(false);
      return;
    }

    let cancelled = false;
    const loadEditDetails = async () => {
      setEditLoading(true);
      try {
        const token = localStorage.getItem("jmdlr_token");
        if (!token) {
          router.replace("/auth");
          return;
        }
        const apiBase = getApiBase();
        const response = await fetch(`${apiBase}/papers/${editPaper.id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.ok) {
          throw new Error("Unable to load paper details.");
        }
        const payload = (await response.json()) as {
          title?: string;
          abstract?: string | null;
          keywords?: string[] | null;
          pdf_file?: string | null;
          author_profiles?: AuthorProfile[] | null;
        };
        if (!cancelled) {
          setEditTitle(payload.title ?? "");
          setEditAbstract(payload.abstract ?? "");
          setEditTags(payload.keywords ?? []);
          setEditHasPdf(Boolean(payload.pdf_file));
          setEditFile(null);

          const userId = await ensureUserId();
          const coAuthors =
            payload.author_profiles?.filter(
              (author) => author.id && author.id !== userId
            ) ?? [];
          setEditSelectedCoAuthors(
            coAuthors.map((author) => ({
              id: author.id as number,
              first_name: author.first_name ?? null,
              last_name: author.last_name ?? null,
              username: author.username ?? null,
              email: null,
              profile_picture: author.profile_picture ?? null,
            }))
          );
        }

        const refsResponse = await fetch(
          `${apiBase}/papers/${editPaper.id}/references/`
        );
        if (refsResponse.ok) {
          const refsPayload = (await refsResponse.json()) as PaperSearchResult[];
          if (!cancelled) {
            setEditSelectedReferences(refsPayload);
          }
        }
      } catch {
        if (!cancelled) {
          setActionMessage("Unable to load full paper details.");
        }
      } finally {
        if (!cancelled) {
          setEditLoading(false);
        }
      }
    };

    loadEditDetails();
    return () => {
      cancelled = true;
    };
  }, [editPaper, router]);

  useEffect(() => {
    if (!showUpload && !editPaper) return;
    let cancelled = false;
    const loadTags = async () => {
      setTagsLoading(true);
      try {
        const apiBase = getApiBase();
        const response = await fetch(
          `${apiBase}/papers/?status=published&ordering=-published_date&page_size=200`,
          { cache: "no-store" }
        );
        if (!response.ok) {
          throw new Error("Unable to load tags.");
        }
        const payload = (await response.json()) as PaperSearchResponse;
        const papers = normalizeResults(payload);
        const set = new Set<string>();
        papers.forEach((paper) => {
          (paper.keywords ?? []).forEach((tag) => set.add(tag));
        });
        if (!cancelled) {
          setAvailableTags(Array.from(set).sort());
        }
      } catch {
        if (!cancelled) {
          setAvailableTags([]);
        }
      } finally {
        if (!cancelled) {
          setTagsLoading(false);
        }
      }
    };
    loadTags();
    return () => {
      cancelled = true;
    };
  }, [showUpload, editPaper]);

  useEffect(() => {
    if (!showUpload) return;
    const query = coAuthorQuery.trim();
    if (query.length < 2) {
      setCoAuthorResults([]);
      setCoAuthorLoading(false);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setCoAuthorLoading(true);
      try {
        const token = localStorage.getItem("jmdlr_token");
        const apiBase = getApiBase();
        const response = await fetch(
          `${apiBase}/users/?search=${encodeURIComponent(query)}`,
          {
            headers: token ? { Authorization: `Token ${token}` } : undefined,
            signal: controller.signal,
          }
        );
        if (!response.ok) throw new Error("Unable to search users.");
        const payload = (await response.json()) as UserResponse;
        const users = normalizeResults(payload);
        if (!cancelled) {
          const filtered = users.filter(
            (user) =>
              user.id !== currentUserId &&
              !selectedCoAuthors.some((selected) => selected.id === user.id)
          );
          setCoAuthorResults(filtered);
        }
      } catch {
        if (!cancelled) {
          setCoAuthorResults([]);
        }
      } finally {
        if (!cancelled) {
          setCoAuthorLoading(false);
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [coAuthorQuery, showUpload, currentUserId, selectedCoAuthors]);

  useEffect(() => {
    if (!editPaper) return;
    const query = editCoAuthorQuery.trim();
    if (query.length < 2) {
      setEditCoAuthorResults([]);
      setEditCoAuthorLoading(false);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setEditCoAuthorLoading(true);
      try {
        const token = localStorage.getItem("jmdlr_token");
        const apiBase = getApiBase();
        const response = await fetch(
          `${apiBase}/users/?search=${encodeURIComponent(query)}`,
          {
            headers: token ? { Authorization: `Token ${token}` } : undefined,
            signal: controller.signal,
          }
        );
        if (!response.ok) throw new Error("Unable to search users.");
        const payload = (await response.json()) as UserResponse;
        const users = normalizeResults(payload);
        if (!cancelled) {
          const filtered = users.filter(
            (user) =>
              user.id !== currentUserId &&
              !editSelectedCoAuthors.some((selected) => selected.id === user.id)
          );
          setEditCoAuthorResults(filtered);
        }
      } catch {
        if (!cancelled) {
          setEditCoAuthorResults([]);
        }
      } finally {
        if (!cancelled) {
          setEditCoAuthorLoading(false);
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [editCoAuthorQuery, editPaper, currentUserId, editSelectedCoAuthors]);

  useEffect(() => {
    if (!showUpload) return;
    const query = referenceQuery.trim();
    if (query.length < 2) {
      setReferenceResults([]);
      setReferenceLoading(false);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setReferenceLoading(true);
      try {
        const apiBase = getApiBase();
        const response = await fetch(
          `${apiBase}/papers/?status=published&search=${encodeURIComponent(
            query
          )}&page_size=10`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Unable to search papers.");
        const payload = (await response.json()) as PaperSearchResponse;
        const papers = normalizeResults(payload);
        if (!cancelled) {
          const filtered = papers.filter(
            (paper) =>
              !selectedReferences.some((selected) => selected.id === paper.id)
          );
          setReferenceResults(filtered);
        }
      } catch {
        if (!cancelled) {
          setReferenceResults([]);
        }
      } finally {
        if (!cancelled) {
          setReferenceLoading(false);
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [referenceQuery, showUpload, selectedReferences]);

  useEffect(() => {
    if (!editPaper) return;
    const query = editReferenceQuery.trim();
    if (query.length < 2) {
      setEditReferenceResults([]);
      setEditReferenceLoading(false);
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setEditReferenceLoading(true);
      try {
        const apiBase = getApiBase();
        const response = await fetch(
          `${apiBase}/papers/?status=published&search=${encodeURIComponent(
            query
          )}&page_size=10`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Unable to search papers.");
        const payload = (await response.json()) as PaperSearchResponse;
        const papers = normalizeResults(payload);
        if (!cancelled) {
          const filtered = papers.filter(
            (paper) =>
              !editSelectedReferences.some((selected) => selected.id === paper.id)
          );
          setEditReferenceResults(filtered);
        }
      } catch {
        if (!cancelled) {
          setEditReferenceResults([]);
        }
      } finally {
        if (!cancelled) {
          setEditReferenceLoading(false);
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [editReferenceQuery, editPaper, editSelectedReferences]);

  useEffect(() => {
    if (!paymentPaper) return;
    if (!showPayPal) return;
    if (paypalInitRef.current === paymentPaper.id) return;
    paypalInitRef.current = paymentPaper.id;
    void setupPayPalButtons(paymentPaper);
  }, [paymentPaper, showPayPal]);

  const summary = useMemo(() => {
    const total = papers.length;
    const published = papers.filter((paper) => paper.status === "published").length;
    const drafts = papers.filter((paper) => paper.status === "draft").length;
    const pending = papers.filter((paper) => paper.review_status === "pending").length;
    return { total, published, drafts, pending };
  }, [papers]);

  const metricsSummary = useMemo(() => {
    return papers.reduce(
      (acc, paper) => {
        const metrics = paper.metrics ?? {};
        acc.views += metrics.views ?? 0;
        acc.downloads += metrics.downloads ?? 0;
        acc.bookmarks += metrics.bookmarks ?? 0;
        acc.likes += metrics.likes ?? 0;
        return acc;
      },
      { views: 0, downloads: 0, bookmarks: 0, likes: 0 }
    );
  }, [papers]);

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "az", label: "Alphabetical (A → Z)" },
    { value: "za", label: "Alphabetical (Z → A)" },
  ];

  const statusOptions = [
    { value: "all", label: "All", count: summary.total },
    { value: "published", label: "Published", count: summary.published },
    { value: "draft", label: "Drafts", count: summary.drafts },
    { value: "review", label: "In Review", count: summary.pending },
  ];

  const filteredPapers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesQuery = (paper: PaperItem) => {
      if (!normalizedQuery) return true;
      const inTitle = paper.title.toLowerCase().includes(normalizedQuery);
      const inAuthor = getPaperAuthorLabel(paper).toLowerCase().includes(normalizedQuery);
      const inTags = (paper.keywords ?? []).some((tag) =>
        String(tag).toLowerCase().includes(normalizedQuery)
      );
      return inTitle || inAuthor || inTags;
    };

    const matchesStatus = (paper: PaperItem) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "published") return paper.status === "published";
      if (statusFilter === "draft") return paper.status === "draft";
      if (statusFilter === "review") return paper.review_status === "pending";
      return true;
    };

    const filtered = papers.filter(
      (paper) => matchesQuery(paper) && matchesStatus(paper)
    );

    const getDateValue = (paper: PaperItem) => {
      const dateValue = paper.published_date || paper.created_date || paper.updated_date;
      if (!dateValue) return null;
      const time = new Date(dateValue).getTime();
      return Number.isNaN(time) ? null : time;
    };

    const sorted = [...filtered].sort((a, b) => {
      if (sortOption === "az") return a.title.localeCompare(b.title);
      if (sortOption === "za") return b.title.localeCompare(a.title);
      const aDate = getDateValue(a);
      const bDate = getDateValue(b);
      if (aDate === null && bDate === null) return 0;
      if (aDate === null) return 1;
      if (bDate === null) return -1;
      return sortOption === "oldest" ? aDate - bDate : bDate - aDate;
    });

    return sorted;
  }, [papers, searchQuery, sortOption, statusFilter]);

  const openEdit = (paper: PaperItem) => {
    setEditPaper(paper);
    setActionMessage(null);
  };

  const handleUploadFile = (file: File | null) => {
    if (!file) return;
    if (file.type && file.type !== "application/pdf") {
      setUploadError("Please upload a PDF file.");
      return;
    }
    setUploadError(null);
    setUploadFile(file);
  };

  const handleUpdate = async (submitForReview: boolean) => {
    if (!editPaper) return;
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    if (!editTitle.trim()) {
      setActionMessage("Title is required.");
      return;
    }
    if (!editAbstract.trim()) {
      setActionMessage("Abstract is required.");
      return;
    }
    if (submitForReview && !editHasPdf && !editFile) {
      setActionMessage("Please upload a PDF before submitting for review.");
      return;
    }
    setSaving(true);
    try {
      const apiBase = getApiBase();
      const userId = await ensureUserId();
      const authorIds = Array.from(
        new Set([
          userId,
          ...editSelectedCoAuthors.map((author) => author.id).filter(Boolean),
        ])
      );
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("abstract", editAbstract.trim());
      formData.append("authors", JSON.stringify(authorIds));
      if (editTags.length > 0) {
        formData.append("keywords", JSON.stringify(editTags));
      }
      if (editSelectedReferences.length > 0) {
        formData.append(
          "cited_paper_ids",
          JSON.stringify(editSelectedReferences.map((paper) => paper.id))
        );
      }
      formData.append("submit_for_review", submitForReview ? "true" : "false");
      if (editFile) {
        formData.append("pdf_file", editFile);
      }
      const response = await fetch(`${apiBase}/papers/${editPaper.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });
      const payload = (await response.json()) as PaperItem & {
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(payload) || "Unable to update paper."
        );
      }
      if (response.status === 202) {
        setActionMessage(payload.detail || "Update submitted for review.");
        return;
      }
      applyPaperUpdate(payload);
      setEditPaper(null);
      setActionMessage(null);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (paper: PaperItem) => {
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    const confirmDelete = window.confirm(
      `Delete "${paper.title}"? This cannot be undone.`
    );
    if (!confirmDelete) return;
    setDeletingId(paper.id);
    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/papers/${paper.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) {
        const data = (await response.json()) as { detail?: string; error?: string };
        throw new Error(data.detail || data.error || "Unable to delete paper.");
      }
      setPapers((prev) => prev.filter((item) => item.id !== paper.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const applyPaperUpdate = (updated: PaperItem) => {
    setPapers((prev) =>
      prev.map((paper) => (paper.id === updated.id ? updated : paper))
    );
    setActivePaper((prev) => (prev?.id === updated.id ? updated : prev));
  };

  const toggleUploadTag = (tag: string) => {
    setUploadTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const value = uploadTagInput.trim();
    if (!value) return;
    setUploadTags((prev) => {
      if (prev.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
        return prev;
      }
      return [...prev, value];
    });
    setUploadTagInput("");
  };

  const removeCustomTag = (tag: string) => {
    setUploadTags((prev) => prev.filter((item) => item !== tag));
  };

  const toggleEditTag = (tag: string) => {
    setEditTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const addEditTag = () => {
    const value = editTagInput.trim();
    if (!value) return;
    setEditTags((prev) => {
      if (prev.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
        return prev;
      }
      return [...prev, value];
    });
    setEditTagInput("");
  };

  const removeEditTag = (tag: string) => {
    setEditTags((prev) => prev.filter((item) => item !== tag));
  };

  const addCoAuthor = (author: UserApi) => {
    setSelectedCoAuthors((prev) => [...prev, author]);
    setCoAuthorQuery("");
    setCoAuthorResults([]);
  };

  const removeCoAuthor = (authorId: number) => {
    setSelectedCoAuthors((prev) => prev.filter((author) => author.id !== authorId));
  };

  const addEditCoAuthor = (author: UserApi) => {
    setEditSelectedCoAuthors((prev) => [...prev, author]);
    setEditCoAuthorQuery("");
    setEditCoAuthorResults([]);
  };

  const removeEditCoAuthor = (authorId: number) => {
    setEditSelectedCoAuthors((prev) =>
      prev.filter((author) => author.id !== authorId)
    );
  };

  const addReference = (paper: PaperSearchResult) => {
    setSelectedReferences((prev) => [...prev, paper]);
    setReferenceQuery("");
    setReferenceResults([]);
  };

  const removeReference = (paperId: number) => {
    setSelectedReferences((prev) => prev.filter((paper) => paper.id !== paperId));
  };

  const addEditReference = (paper: PaperSearchResult) => {
    setEditSelectedReferences((prev) => [...prev, paper]);
    setEditReferenceQuery("");
    setEditReferenceResults([]);
  };

  const removeEditReference = (paperId: number) => {
    setEditSelectedReferences((prev) =>
      prev.filter((paper) => paper.id !== paperId)
    );
  };

  const ensureUserId = async () => {
    if (currentUserId) return currentUserId;
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      throw new Error("Authentication required.");
    }
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/users/me/`, {
      headers: { Authorization: `Token ${token}` },
    });
    if (!response.ok) {
      throw new Error("Unable to load profile.");
    }
    const payload = (await response.json()) as { id?: number };
    if (!payload?.id) {
      throw new Error("Unable to determine user.");
    }
    setCurrentUserId(payload.id);
    return payload.id;
  };

  const getApiErrorMessage = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return null;
    const record = payload as Record<string, unknown>;
    const normalizeMessage = (value: string) => {
      const trimmed = value.trim();
      const prefix = "Unable to format PDF:";
      if (trimmed.startsWith(prefix)) {
        return trimmed.slice(prefix.length).trim();
      }
      return trimmed;
    };
    const detail = record.detail;
    if (typeof detail === "string" && detail.trim().length > 0) {
      return normalizeMessage(detail);
    }
    const error = record.error;
    if (typeof error === "string" && error.trim().length > 0) {
      return normalizeMessage(error);
    }
    const pdfFile = record.pdf_file;
    if (typeof pdfFile === "string" && pdfFile.trim().length > 0) {
      return normalizeMessage(pdfFile);
    }
    if (Array.isArray(pdfFile) && pdfFile.length > 0) {
      return normalizeMessage(String(pdfFile[0]));
    }
    const nonField = record.non_field_errors;
    if (typeof nonField === "string" && nonField.trim().length > 0) {
      return normalizeMessage(nonField);
    }
    if (Array.isArray(nonField) && nonField.length > 0) {
      return normalizeMessage(String(nonField[0]));
    }
    for (const value of Object.values(record)) {
      if (typeof value === "string" && value.trim().length > 0) {
        return normalizeMessage(value);
      }
      if (Array.isArray(value) && value.length > 0) {
        return normalizeMessage(String(value[0]));
      }
    }
    return null;
  };

  const handleUploadPaper = async (submitForReview: boolean) => {
    if (!uploadTitle.trim()) {
      setUploadError("Title is required.");
      return;
    }
    if (!uploadAbstract.trim()) {
      setUploadError("Abstract is required.");
      return;
    }
    if (submitForReview && !uploadFile) {
      setUploadError("Please upload a PDF before submitting for review.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const userId = await ensureUserId();
      const authorIds = Array.from(
        new Set([userId, ...selectedCoAuthors.map((author) => author.id)])
      );
      const token = localStorage.getItem("jmdlr_token");
      if (!token) {
        router.replace("/auth");
        return;
      }
      const apiBase = getApiBase();
      const formData = new FormData();
      formData.append("title", uploadTitle.trim());
      formData.append("abstract", uploadAbstract.trim());
      formData.append("authors", JSON.stringify(authorIds));
      if (uploadTags.length > 0) {
        formData.append("keywords", JSON.stringify(uploadTags));
      }
      if (selectedReferences.length > 0) {
        formData.append(
          "cited_paper_ids",
          JSON.stringify(selectedReferences.map((paper) => paper.id))
        );
      }
      formData.append("submit_for_review", submitForReview ? "true" : "false");
      if (uploadFile) {
        formData.append("pdf_file", uploadFile);
      }
      const response = await fetch(`${apiBase}/papers/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });
      const payload = (await response.json()) as PaperItem & {
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(payload) || "Unable to create paper."
        );
      }
      setPapers((prev) => [payload, ...prev]);
      setShowUpload(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Unable to create paper.");
    } finally {
      setUploading(false);
    }
  };

  const initiatePayment = async (
    paper: PaperItem,
    gateway: "razorpay" | "paypal"
  ): Promise<PaymentInitResponse> => {
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      throw new Error("Authentication required.");
    }
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/papers/${paper.id}/payments/initiate/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gateway }),
    });
    const payload = (await response.json()) as PaymentInitResponse & {
      detail?: string;
      error?: string;
    };
    if (!response.ok) {
      throw new Error(payload.detail || payload.error || "Unable to initiate payment.");
    }
    return payload;
  };

  const startRazorpayPayment = async () => {
    if (!paymentPaper || paymentLoading) return;
    const paper = paymentPaper;
    setPaymentError(null);
    setPaymentLoading("razorpay");
    try {
      const data = (await initiatePayment(paper, "razorpay")) as RazorpayInitResponse;
      if (!data.key_id) {
        throw new Error("Razorpay key is not configured.");
      }
      await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      const RazorpayConstructor = (window as unknown as { Razorpay?: any }).Razorpay;
      if (!RazorpayConstructor) {
        throw new Error("Razorpay SDK failed to load.");
      }
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "JMDLR",
        description: "Publication fee",
        order_id: data.order_id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const token = localStorage.getItem("jmdlr_token");
            if (!token) {
              router.replace("/auth");
              return;
            }
            const apiBase = getApiBase();
            const verifyResponse = await fetch(
              `${apiBase}/papers/${paper.id}/payments/razorpay/verify/`,
              {
                method: "POST",
                headers: {
                  Authorization: `Token ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(response),
              }
            );
            const verifyPayload = (await verifyResponse.json()) as PaperItem & {
              detail?: string;
              error?: string;
            };
            if (!verifyResponse.ok) {
              throw new Error(
                verifyPayload.detail || verifyPayload.error || "Razorpay verification failed."
              );
            }
            applyPaperUpdate(verifyPayload);
            setPaymentPaper(null);
          } catch (err) {
            setPaymentError(
              err instanceof Error ? err.message : "Razorpay verification failed."
            );
          }
        },
        theme: { color: "#22c55e" },
      };
      const instance = new RazorpayConstructor(options);
      instance.on("payment.failed", (event: { error?: { description?: string } }) => {
        setPaymentError(event?.error?.description || "Razorpay payment failed.");
      });
      instance.open();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Unable to start Razorpay.");
    } finally {
      setPaymentLoading(null);
    }
  };

  const setupPayPalButtons = async (paper: PaperItem) => {
    const paperId = paper.id;
    if (paymentLoading === "paypal") return;
    setPaymentError(null);
    setPaymentLoading("paypal");
    try {
      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
      if (!clientId) {
        throw new Error("PayPal client ID is not configured.");
      }
      const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        clientId
      )}&intent=capture`;
      await loadScript(sdkUrl);
      const paypalSdk = (window as unknown as { paypal?: any }).paypal;
      if (!paypalSdk) {
        throw new Error("PayPal SDK failed to load.");
      }
      const container = await waitForPayPalContainer(paypalContainerRef);
      if (!paymentPaper || paymentPaper.id !== paperId) {
        return;
      }
      container.innerHTML = "";
      setPaypalReady(true);
      paypalSdk
        .Buttons({
          createOrder: async () => {
            try {
              const data = (await initiatePayment(paper, "paypal")) as PayPalInitResponse;
              const currency = data.currency || "USD";
              setPaypalOrderId(data.order_id);
              setPaypalCurrency(currency);
              setPaypalAmount(data.amount);
              return data.order_id;
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Unable to initiate PayPal payment.";
              setPaymentError(message);
              throw err;
            }
          },
          onApprove: async (details: { orderID: string }) => {
            try {
              const token = localStorage.getItem("jmdlr_token");
              if (!token) {
                router.replace("/auth");
                return;
              }
              const apiBase = getApiBase();
              const captureResponse = await fetch(
                `${apiBase}/papers/${paper.id}/payments/paypal/capture/`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ order_id: details.orderID }),
                }
              );
              const capturePayload = (await captureResponse.json()) as PaperItem & {
                detail?: string;
                error?: string;
              };
              if (!captureResponse.ok) {
                throw new Error(
                  capturePayload.detail || capturePayload.error || "PayPal capture failed."
                );
              }
              applyPaperUpdate(capturePayload);
              setPaymentPaper(null);
            } catch (err) {
              setPaymentError(
                err instanceof Error ? err.message : "PayPal capture failed."
              );
            }
          },
          onCancel: () => {
            setPaymentError("PayPal payment was cancelled.");
          },
          onError: () => {
            setPaymentError("PayPal payment failed.");
          },
        })
        .render(paypalContainerRef.current);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Unable to start PayPal.");
    } finally {
      setPaymentLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-[color:var(--color-text-primary)]">
      <Navbar />
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-[1100px] space-y-8">
          <DashboardHeader
            title="My Papers"
            subtitle="Track submissions, engagement, and payment status across all your papers."
            onUpload={() => setShowUpload(true)}
          />

          <GlobalMetrics
            totalPapers={summary.total}
            totalViews={metricsSummary.views}
            totalDownloads={metricsSummary.downloads}
            totalBookmarks={metricsSummary.bookmarks}
            totalLikes={metricsSummary.likes}
          />

          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-end border-b border-[color:var(--color-border)]/60 px-5 py-4">
              <StatusTabs
                tabs={statusOptions}
                active={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
            <div className="space-y-4 px-5 pb-6 pt-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search papers..."
                />
                <SortDropdown
                  value={sortOption}
                  options={sortOptions}
                  onChange={setSortOption}
                />
              </div>
              <PapersTable
                papers={filteredPapers}
                getStatus={getUnifiedStatus}
                getStatusClass={statusChipStyle}
                canEdit={(paper) =>
                  paper.status === "published" ||
                  (paper.status === "draft" && paper.review_status === "draft")
                }
                deletingId={deletingId}
                onView={(paper) => setActivePaper(paper)}
                onEdit={(paper) => openEdit(paper)}
                onDelete={(paper) => handleDelete(paper)}
                onPayment={(paper) => setPaymentPaper(paper)}
                formatDate={formatDate}
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-6 text-sm text-[color:var(--color-text-secondary)] shadow-[var(--shadow-card)]">
              Loading your papers...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 p-6 text-sm text-[color:var(--color-text-primary)]">
              {error}
            </div>
          ) : papers.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-6 text-sm text-[color:var(--color-text-secondary)] shadow-[var(--shadow-card)]">
              You have no papers yet. Submit your first manuscript to get started.
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-6 text-sm text-[color:var(--color-text-secondary)] shadow-[var(--shadow-card)]">
              No papers match your filters.
            </div>
          ) : null}
        </div>
      </main>
      <Footer />

      {activePaper ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {activePaper.title}
              </h2>
              <button
                type="button"
                onClick={() => setActivePaper(null)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span
                className={`rounded-full border px-2.5 py-1 ${statusChipStyle(
                  getUnifiedStatus(activePaper)
                )}`}
              >
                {getUnifiedStatus(activePaper)}
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 ${reviewBadge(
                  activePaper.review_status
                )}`}
              >
                {activePaper.review_status ?? "draft"}
              </span>
              {getUnifiedStatus(activePaper) === "Payment Due" ? (
                <button
                  type="button"
                  onClick={() => setPaymentPaper(activePaper)}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Make Payment
                </button>
              ) : (
                <span
                  className={`rounded-full border px-2.5 py-1 ${
                    activePaper.is_paid
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {activePaper.is_paid ? "Paid" : "Unpaid"}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {truncate(activePaper.abstract, 600)}
            </p>
            {activePaper.keywords && activePaper.keywords.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {activePaper.keywords.map((tag) => (
                  <span
                    key={`${activePaper.id}-${tag}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Submitted {formatDate(activePaper.created_date)}</span>
              {hasBeenEdited(activePaper.created_date, activePaper.updated_date) ? (
                <span>Updated {formatDate(activePaper.updated_date)}</span>
              ) : null}
              <span>Published {formatDate(activePaper.published_date ?? null)}</span>
            </div>
          </div>
        </div>
      ) : null}

      {editPaper ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Edit Paper</h2>
            </div>
            {editLoading ? (
              <p className="mt-4 text-sm text-slate-500">Loading paper details...</p>
            ) : null}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Title
                </label>
                <input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">
                  Abstract
                </label>
                <textarea
                  value={editAbstract}
                  onChange={(event) => setEditAbstract(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">
                  Hashtags
                </label>
                <div className="mt-2 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tagsLoading ? (
                      <span className="text-xs text-slate-500">
                        Loading hashtags...
                      </span>
                    ) : availableTags.length > 0 ? (
                      availableTags.map((tag) => (
                        <button
                          key={`edit-tag-${tag}`}
                          type="button"
                          onClick={() => toggleEditTag(tag)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            editTags.includes(tag)
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          #{tag}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">
                        No hashtags found.
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editTags.map((tag) => (
                      <span
                        key={`selected-edit-tag-${tag}`}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeEditTag(tag)}
                          className="text-emerald-700/70 hover:text-emerald-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={editTagInput}
                      onChange={(event) => setEditTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addEditTag();
                        }
                      }}
                      placeholder="Add a custom hashtag"
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={addEditTag}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Co-authors
                </label>
                <input
                  value={editCoAuthorQuery}
                  onChange={(event) => setEditCoAuthorQuery(event.target.value)}
                  placeholder="Search users by name, username, or email"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                {editCoAuthorLoading ? (
                  <p className="mt-2 text-xs text-slate-500">Searching users...</p>
                ) : editCoAuthorResults.length > 0 ? (
                  <div className="mt-2 max-h-40 space-y-1 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 text-sm text-slate-700">
                    {editCoAuthorResults.map((user) => {
                      const label = getUserLabel(user);
                      const initials = getInitials(label);
                      return (
                        <button
                          key={`edit-coauthor-${user.id}`}
                          type="button"
                          onClick={() => addEditCoAuthor(user)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                            {user.profile_picture ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.profile_picture}
                                alt={label}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </span>
                          <span className="flex flex-1 flex-col">
                            <span className="font-semibold text-slate-800">{label}</span>
                            {user.username ? (
                              <span className="text-xs text-slate-500">
                                @{user.username}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                {editSelectedCoAuthors.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editSelectedCoAuthors.map((author) => {
                      const label = getUserLabel(author);
                      const initials = getInitials(label);
                      return (
                        <span
                          key={`selected-edit-author-${author.id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                        >
                          <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-600">
                            {author.profile_picture ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={author.profile_picture}
                                alt={label}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </span>
                          {label}
                          <button
                            type="button"
                            onClick={() => removeEditCoAuthor(author.id)}
                            className="text-slate-500 hover:text-slate-700"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  References
                </label>
                <input
                  value={editReferenceQuery}
                  onChange={(event) => setEditReferenceQuery(event.target.value)}
                  placeholder="Search published papers to cite"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                {editReferenceLoading ? (
                  <p className="mt-2 text-xs text-slate-500">Searching papers...</p>
                ) : editReferenceResults.length > 0 ? (
                  <div className="mt-2 max-h-40 space-y-1 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 text-sm text-slate-700">
                    {editReferenceResults.map((paper) => {
                      const authorName = getAuthorNameFromProfiles(
                        paper.author_profiles
                      );
                      return (
                        <button
                          key={`edit-reference-${paper.id}`}
                          type="button"
                          onClick={() => addEditReference(paper)}
                          className="flex w-full items-start justify-between gap-4 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
                        >
                          <span className="flex flex-1 flex-col">
                            <span className="font-semibold text-slate-800">
                              {paper.title}
                            </span>
                            <span className="text-xs text-slate-500">{authorName}</span>
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {formatDate(paper.published_date ?? null)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                {editSelectedReferences.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {editSelectedReferences.map((paper) => (
                      <div
                        key={`selected-edit-reference-${paper.id}`}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-slate-800">
                              {paper.title}
                            </p>
                            <span className="text-[11px] font-semibold text-slate-400">
                              {formatDate(paper.published_date ?? null)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {getAuthorNameFromProfiles(paper.author_profiles)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEditReference(paper.id)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600">
                  Manuscript PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setEditFile(event.target.files?.[0] ?? null)}
                  className="mt-2 w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {editHasPdf ? (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Existing PDF is already attached. Uploading a new file will
                    replace it.
                  </p>
                ) : null}
              </div>
              {actionMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700 md:col-span-2">
                  {actionMessage}
                </div>
              ) : null}
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => handleUpdate(false)}
                disabled={saving}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={() => handleUpdate(true)}
                disabled={saving}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {saving ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {paymentPaper ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Make Payment
              </h2>
              <button
                type="button"
                onClick={() => setPaymentPaper(null)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            {!showPayPal ? (
              <p className="mt-2 text-sm text-slate-600">
                Choose a payment gateway to complete publication for{" "}
                <span className="font-semibold text-slate-900">
                  {paymentPaper.title}
                </span>
                .
              </p>
            ) : null}
            {!showPayPal ? (
              <div className="mt-5 grid gap-3">
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                  onClick={startRazorpayPayment}
                  disabled={paymentLoading !== null}
                >
                  {paymentLoading === "razorpay"
                    ? "Opening Razorpay..."
                    : "Pay with Razorpay"}
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                  onClick={() => setShowPayPal(true)}
                  disabled={paymentLoading !== null}
                >
                  Pay with PayPal
                </button>
              </div>
            ) : (
              <div className="mt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowPayPal(false);
                    setPaypalReady(false);
                    setPaypalOrderId(null);
                    setPaypalAmount(null);
                    setPaypalCurrency(null);
                    paypalInitRef.current = null;
                    if (paypalContainerRef.current) {
                      paypalContainerRef.current.innerHTML = "";
                    }
                  }}
                  className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                >
                  ← Back to payment options
                </button>
                {paymentLoading === "paypal" ? (
                  <span className="text-xs text-slate-500">Loading PayPal...</span>
                ) : null}
              </div>
            )}
            {paymentError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                {paymentError}
              </div>
            ) : null}
            {showPayPal ? (
              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  PayPal Checkout
                </div>
                {paypalAmount && paypalCurrency ? (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                    Amount: {paypalAmount} {paypalCurrency}
                  </div>
                ) : null}
                <div ref={paypalContainerRef} className="min-h-[44px]" />
                <p className="text-[11px] text-slate-400">
                  {paypalReady
                    ? "Complete the PayPal approval to finalize payment."
                    : "Loading PayPal checkout..."}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      {showUpload ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--color-bg-primary-60)] px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-[980px] rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-6 text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--color-border)]/70 pb-4">
              <div>
                <h2 className="text-lg font-semibold">Upload New Paper</h2>
                <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                  Submit a new manuscript to start the review process.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="text-sm text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-7">
              <section className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-secondary)]">
                  <span>Paper Information</span>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                      Title
                    </label>
                    <input
                      value={uploadTitle}
                      onChange={(event) => setUploadTitle(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] shadow-sm transition focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/20"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-[color:var(--color-text-secondary)]">
                      <span>Abstract</span>
                      <span>{uploadAbstract.length} / 2000 characters</span>
                    </div>
                    <textarea
                      value={uploadAbstract}
                      onChange={(event) => setUploadAbstract(event.target.value)}
                      rows={4}
                      maxLength={2000}
                      className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] shadow-sm transition focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/20"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-secondary)]">
                  <span>Topics</span>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tagsLoading ? (
                      <span className="text-xs text-[color:var(--color-text-secondary)]">
                        Loading hashtags...
                      </span>
                    ) : availableTags.length > 0 ? (
                      availableTags.slice(0, 8).map((tag) => (
                        <button
                          key={`tag-${tag}`}
                          type="button"
                          onClick={() => toggleUploadTag(tag)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            uploadTags.includes(tag)
                              ? "border-[color:var(--color-accent)]/60 bg-[color:var(--color-bg-surface)] text-[color:var(--color-text-primary)]"
                              : "border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)]/40"
                          }`}
                        >
                          #{tag}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-[color:var(--color-text-secondary)]">
                        No hashtags found.
                      </span>
                    )}
                  </div>
                  {uploadTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {uploadTags.map((tag) => (
                        <span
                          key={`selected-tag-${tag}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-surface)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-primary)]"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeCustomTag(tag)}
                            className="text-[color:var(--color-text-primary)]/70 hover:text-[color:var(--color-text-primary)]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={uploadTagInput}
                      onChange={(event) => setUploadTagInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addCustomTag();
                        }
                      }}
                      placeholder="Add custom hashtag"
                      className="flex-1 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] shadow-sm transition focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/20"
                    />
                    <button
                      type="button"
                      onClick={addCustomTag}
                      className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-2 text-xs font-semibold text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-accent)]/40 hover:text-[color:var(--color-text-primary)]"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-secondary)]">
                  <span>Authors &amp; References</span>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                      Co-authors
                    </label>
                    <input
                      value={coAuthorQuery}
                      onChange={(event) => setCoAuthorQuery(event.target.value)}
                      placeholder="Search users by name, username, or email"
                      className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] shadow-sm transition focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/20"
                    />
                    {coAuthorLoading ? (
                      <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
                        Searching users...
                      </p>
                    ) : coAuthorResults.length > 0 ? (
                      <div className="mt-2 max-h-40 space-y-1 overflow-auto rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-2 text-sm text-[color:var(--color-text-primary)]">
                        {coAuthorResults.map((user) => {
                          const label = getUserLabel(user);
                          const initials = getInitials(label);
                          return (
                            <button
                              key={`coauthor-${user.id}`}
                              type="button"
                              onClick={() => addCoAuthor(user)}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-[color:var(--color-bg-muted)]"
                            >
                              <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] text-xs font-semibold text-[color:var(--color-text-secondary)]">
                                {user.profile_picture ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={user.profile_picture}
                                    alt={label}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  initials
                                )}
                              </span>
                              <span className="flex flex-1 flex-col">
                                <span className="font-semibold text-[color:var(--color-text-primary)]">
                                  {label}
                                </span>
                                {user.username ? (
                                  <span className="text-xs text-[color:var(--color-text-secondary)]">
                                    @{user.username}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                    {selectedCoAuthors.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedCoAuthors.map((author) => {
                          const label = getUserLabel(author);
                          const initials = getInitials(label);
                          return (
                            <span
                              key={`selected-author-${author.id}`}
                              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-surface)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-primary)]"
                            >
                              <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] text-[10px] font-semibold text-[color:var(--color-text-secondary)]">
                                {author.profile_picture ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={author.profile_picture}
                                    alt={label}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  initials
                                )}
                              </span>
                              {label}
                              <button
                                type="button"
                                onClick={() => removeCoAuthor(author.id)}
                                className="text-[color:var(--color-text-primary)]/70 hover:text-[color:var(--color-text-primary)]"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                      References
                    </label>
                    <input
                      value={referenceQuery}
                      onChange={(event) => setReferenceQuery(event.target.value)}
                      placeholder="Search published papers to cite"
                      className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] shadow-sm transition focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/20"
                    />
                    {referenceLoading ? (
                      <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
                        Searching papers...
                      </p>
                    ) : referenceResults.length > 0 ? (
                      <div className="mt-2 max-h-40 space-y-1 overflow-auto rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-2 text-sm text-[color:var(--color-text-primary)]">
                        {referenceResults.map((paper) => {
                          const authorName = getAuthorNameFromProfiles(paper.author_profiles);
                          return (
                            <button
                              key={`reference-${paper.id}`}
                              type="button"
                              onClick={() => addReference(paper)}
                              className="flex w-full items-start justify-between gap-4 rounded-xl px-3 py-2 text-left transition hover:bg-[color:var(--color-bg-muted)]"
                            >
                              <span className="flex flex-1 flex-col">
                                <span className="font-semibold text-[color:var(--color-text-primary)]">
                                  {paper.title}
                                </span>
                                <span className="text-xs text-[color:var(--color-text-secondary)]">
                                  {authorName}
                                </span>
                              </span>
                              <span className="text-[11px] font-semibold text-[color:var(--color-text-secondary)]">
                                {formatDate(paper.published_date ?? null)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                    {selectedReferences.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {selectedReferences.map((paper) => (
                          <div
                            key={`selected-reference-${paper.id}`}
                            className="flex items-center justify-between rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-2 text-xs text-[color:var(--color-text-secondary)]"
                          >
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="font-semibold text-[color:var(--color-text-primary)]">
                                  {paper.title}
                                </p>
                                <span className="text-[11px] font-semibold text-[color:var(--color-text-secondary)]">
                                  {formatDate(paper.published_date ?? null)}
                                </span>
                              </div>
                              <p className="text-[11px] text-[color:var(--color-text-secondary)]">
                                {getAuthorNameFromProfiles(paper.author_profiles)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeReference(paper.id)}
                              className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-secondary)]">
                  <span>Manuscript Upload</span>
                </div>
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleUploadFile(event.dataTransfer.files?.[0] ?? null);
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-6 py-6 text-center text-sm text-[color:var(--color-text-secondary)]"
                >
                  <input
                    id="upload-pdf-input"
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => handleUploadFile(event.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                  <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                    Drag &amp; Drop PDF here
                  </p>
                  <span className="text-xs">or</span>
                  <label
                    htmlFor="upload-pdf-input"
                    className="cursor-pointer rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-4 py-2 text-xs font-semibold text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-accent)]/40"
                  >
                    Choose File
                  </label>
                </div>
                {uploadFile ? (
                  <div className="flex items-center justify-between rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-3 text-xs">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                        {uploadFile.name}
                      </p>
                      <p className="text-[color:var(--color-text-secondary)]">
                        {formatFileSize(uploadFile.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadFile(null)}
                      className="text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
                {uploadError ? (
                  <div className="rounded-2xl border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-4 py-2 text-xs text-[color:var(--color-text-primary)]">
                    {uploadError}
                  </div>
                ) : null}
              </section>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[color:var(--color-border)]/60 pt-4">
              <button
                type="button"
                onClick={() => handleUploadPaper(false)}
                disabled={uploading}
                className="rounded-full border border-[color:var(--color-border)] bg-transparent px-4 py-2 text-sm font-semibold text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={() => handleUploadPaper(true)}
                disabled={uploading}
                className="rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text-primary)] shadow-sm transition hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


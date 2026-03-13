"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminPdfSettingsPanel from "@/components/admin/AdminPdfSettingsPanel";

type ProfilePayload = {
  username?: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
};

type AuthorProfile = {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
};

type PaperAdmin = {
  id: number;
  title: string;
  abstract?: string | null;
  keywords?: string[] | null;
  doi?: string | null;
  pdf_file?: string | null;
  original_pdf?: string | null;
  formatted_pdf?: string | null;
  review_status?: string;
  status?: string;
  is_paid?: boolean;
  created_date?: string;
  updated_date?: string;
  published_date?: string | null;
  rejection_reason?: string | null;
  author_profiles?: AuthorProfile[] | null;
  citation_count?: number;
  metrics?: {
    views?: number;
    downloads?: number;
    likes?: number;
    comments?: number;
    bookmarks?: number;
  } | null;
};

type PapersResponse = {
  results?: PaperAdmin[];
  next?: string | null;
} | PaperAdmin[];

type ChangeRequest = {
  id: number;
  paper?: number;
  paper_title?: string;
  request_type?: string;
  status?: string;
  proposed_data?: Record<string, unknown>;
  proposed_pdf?: string | null;
  created_at?: string;
};

type AdminUser = {
  id: number;
  username?: string;
  email?: string;
  affiliation?: string;
  date_joined?: string;
  is_staff?: boolean;
  is_active?: boolean;
  papers_submitted?: number;
  total_views?: number;
  total_downloads?: number;
  total_comments?: number;
  total_bookmarks?: number;
};

const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const normalizeResults = <T,>(payload: { results?: T[] } | T[] | null): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
};

const getAuthorNames = (profiles?: AuthorProfile[] | null) => {
  if (!profiles || profiles.length === 0) return "Unknown Author";
  const names = profiles
    .map((author) => {
      const fullName = [author.first_name, author.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
      return fullName || author.username || "Unknown Author";
    })
    .filter(Boolean);
  return names.join(", ");
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

const hasBeenEdited = (created?: string | null, updated?: string | null) => {
  if (!created || !updated) return false;
  const createdTime = new Date(created).getTime();
  const updatedTime = new Date(updated).getTime();
  if (Number.isNaN(createdTime) || Number.isNaN(updatedTime)) return false;
  return updatedTime - createdTime > 1000;
};

const metricValue = (
  paper: PaperAdmin,
  key: "views" | "downloads" | "comments" | "bookmarks" | "likes"
) => {
  return paper.metrics?.[key] ?? 0;
};

const metricIconMap: Record<string, string> = {
  Submitted: "📝",
  "Under Review": "🔎",
  Approved: "✅",
  "Payment Pending": "💳",
  Published: "📣",
  Rejected: "⛔",
};

type IconProps = {
  className?: string;
};

const IconSpinner = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="9" opacity="0.25" />
    <path d="M21 12a9 9 0 0 1-9 9" />
  </svg>
);

const IconEye = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconDownload = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

const IconCheck = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M6 6l12 12M18 6l-12 12" />
  </svg>
);

const IconPencil = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" />
    <path d="M14 6l3 3" />
  </svg>
);

const IconRefresh = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 11a8 8 0 0 1 13-5" />
    <path d="M17 3v4h-4" />
    <path d="M20 13a8 8 0 0 1-13 5" />
    <path d="M7 21v-4h4" />
  </svg>
);

const IconCard = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const IconBell = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 16H6l1.5-2.5V9a4.5 4.5 0 0 1 9 0v4.5L18 16z" />
    <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
  </svg>
);

const IconUpload = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 16V4" />
    <path d="M7 9l5-5 5 5" />
    <path d="M4 20h16" />
  </svg>
);

const IconArchive = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v10h14V8" />
    <path d="M9 12h6" />
  </svg>
);

const IconArrowUp = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

const IconTrash = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M6 6l1 14h10l1-14" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const formatChangeValue = (value: unknown) => {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

const toAdminUser = (payload: Partial<AdminUser> & { id?: number }) => {
  return {
    id: payload.id ?? 0,
    username: payload.username,
    email: payload.email,
    affiliation: payload.affiliation,
    date_joined: payload.date_joined,
    is_staff: payload.is_staff,
    is_active: payload.is_active,
    papers_submitted:
      payload.papers_submitted ?? (payload as { total_papers?: number }).total_papers,
    total_views: payload.total_views,
    total_downloads: payload.total_downloads,
    total_comments: payload.total_comments,
    total_bookmarks: payload.total_bookmarks,
  } as AdminUser;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [papers, setPapers] = useState<PaperAdmin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userError, setUserError] = useState<string | null>(null);
  const [paperDbSearch, setPaperDbSearch] = useState("");
  const [paperDbSort, setPaperDbSort] = useState("date-desc");
  const [paperDbStatus, setPaperDbStatus] = useState("all");
  const [paperDbPage, setPaperDbPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userSort, setUserSort] = useState("date-desc");
  const [userFilter, setUserFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<PaperAdmin | null>(null);
  const [rejectMode, setRejectMode] = useState<"reject" | "revision">("reject");
  const [rejectChangeRequest, setRejectChangeRequest] = useState<ChangeRequest | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [reviewPaper, setReviewPaper] = useState<PaperAdmin | null>(null);
  const [reviewDetails, setReviewDetails] = useState<PaperAdmin | null>(null);
  const [reviewReferences, setReviewReferences] = useState<PaperAdmin[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewChangeRequest, setReviewChangeRequest] = useState<ChangeRequest | null>(
    null
  );
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [reviewDoi, setReviewDoi] = useState("");
  const [userLookup, setUserLookup] = useState<Record<number, string>>({});
  const [editPaper, setEditPaper] = useState<PaperAdmin | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    abstract: "",
    keywords: "",
    doi: "",
    published_date: "",
    authors: [] as number[],
    pdf_file: null as File | null,
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [userEditTarget, setUserEditTarget] = useState<AdminUser | null>(null);
  const [userEditFetching, setUserEditFetching] = useState(false);
  const [userEditSaving, setUserEditSaving] = useState(false);
  const [userEditError, setUserEditError] = useState<string | null>(null);
  const [userEditForm, setUserEditForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    affiliation: "",
    bio: "",
    research_interests: "",
    orcid: "",
    linkedin: "",
    google_scholar: "",
    is_staff: false,
    is_active: true,
    password: "",
    confirm_password: "",
  });
  const [deleteUserTarget, setDeleteUserTarget] = useState<AdminUser | null>(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [userViewTarget, setUserViewTarget] = useState<AdminUser | null>(null);
  const [userViewLoading, setUserViewLoading] = useState(false);
  const [userViewError, setUserViewError] = useState<string | null>(null);
  const [userViewData, setUserViewData] = useState<Record<string, unknown> | null>(
    null
  );
  const [activeSection, setActiveSection] = useState<
    | "overview"
    | "review-queue"
    | "payment-queue"
    | "published-papers"
    | "paper-database"
    | "user-database"
    | "pdf-settings"
    | "activity"
  >("overview");

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
        const response = await fetch(`${apiBase}/auth/profile/`, {
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
          throw new Error("Unable to load profile.");
        }
        const profile = (await response.json()) as ProfilePayload;
        if (!profile.is_staff) {
          router.replace("/dashboard");
          return;
        }
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        if (!cancelled) {
          setAdminName(fullName || profile.username || "Admin");
        }

        const [papersResult, changeResult, usersResult] = await Promise.allSettled([
          fetchAllPapers(apiBase, token),
          fetch(
            `${apiBase}/papers/change-requests/?status=pending&type=edit`,
            { headers: { Authorization: `Token ${token}` } }
          ),
          fetchAllUsers(apiBase, token),
        ]);

        if (!cancelled && papersResult.status === "fulfilled") {
          setPapers(papersResult.value);
        }

        if (!cancelled && changeResult.status === "fulfilled") {
          if (changeResult.value.ok) {
            const payload = (await changeResult.value.json()) as
              | { results?: ChangeRequest[] }
              | ChangeRequest[];
            setChangeRequests(normalizeResults(payload));
          }
        }

        if (!cancelled && usersResult.status === "fulfilled") {
          setUsers(usersResult.value);
        }
        if (!cancelled && usersResult.status === "rejected") {
          setUserError("Unable to load users.");
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load admin dashboard.");
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

  const pendingPapers = useMemo(
    () => papers.filter((paper) => paper.review_status === "pending"),
    [papers]
  );
  const approvedPapers = useMemo(
    () => papers.filter((paper) => paper.review_status === "approved"),
    [papers]
  );
  const rejectedPapers = useMemo(
    () => papers.filter((paper) => paper.review_status === "rejected"),
    [papers]
  );
  const publishedPapers = useMemo(
    () => papers.filter((paper) => paper.status === "published"),
    [papers]
  );
  const paymentDue = useMemo(
    () =>
      papers.filter(
        (paper) => paper.review_status === "approved" && !paper.is_paid
      ),
    [papers]
  );

  const submittedPapers = useMemo(
    () => papers.filter((paper) => paper.review_status === "draft"),
    [papers]
  );

  const workflowMetrics = useMemo(
    () => [
      { label: "Submitted", count: submittedPapers.length, tone: "border-[#94d2bd]/50" },
      { label: "Under Review", count: pendingPapers.length, tone: "border-[#0a9396]" },
      { label: "Approved", count: approvedPapers.length, tone: "border-[#ee9b00]" },
      { label: "Payment Pending", count: paymentDue.length, tone: "border-[#ca6702]" },
      { label: "Published", count: publishedPapers.length, tone: "border-[#94d2bd]" },
      { label: "Rejected", count: rejectedPapers.length, tone: "border-[#bb3e03]" },
    ],
    [
      approvedPapers.length,
      paymentDue.length,
      pendingPapers.length,
      publishedPapers.length,
      rejectedPapers.length,
      submittedPapers.length,
    ]
  );

  const pipelineSteps = workflowMetrics.filter(
    (step) => step.label !== "Rejected"
  );
  const rejectedStep = workflowMetrics.find(
    (step) => step.label === "Rejected"
  );

  const pendingEditRequests = useMemo(
    () => changeRequests.filter((request) => request.status === "pending"),
    [changeRequests]
  );

  const paperDbFiltered = useMemo(() => {
    const query = `${globalSearch} ${paperDbSearch}`.trim().toLowerCase();
    return papers.filter((paper) => {
      if (paperDbStatus !== "all") {
        if (paperDbStatus === "payment" && !(paper.review_status === "approved" && !paper.is_paid)) {
          return false;
        }
        if (paperDbStatus === "published" && paper.status !== "published") {
          return false;
        }
        if (
          paperDbStatus !== "payment" &&
          paperDbStatus !== "published" &&
          paper.review_status !== paperDbStatus
        ) {
          return false;
        }
      }
      if (!query) return true;
      const haystack = [
        paper.title,
        getAuthorNames(paper.author_profiles),
        (paper.keywords || []).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [papers, paperDbSearch, paperDbStatus, globalSearch]);

  const searchQuery = globalSearch.trim().toLowerCase();
  const globalPaperMatches = useMemo(() => {
    if (!searchQuery) return [];
    return papers.filter((paper) => {
      const haystack = [
        paper.title,
        getAuthorNames(paper.author_profiles),
        (paper.keywords || []).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchQuery);
    });
  }, [papers, searchQuery]);

  const globalUserMatches = useMemo(() => {
    if (!searchQuery) return [];
    return users.filter((user) => {
      const haystack = [user.username, user.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(searchQuery);
    });
  }, [users, searchQuery]);

  const paperDbSorted = useMemo(() => {
    const items = [...paperDbFiltered];
    const direction = paperDbSort.endsWith("asc") ? 1 : -1;
    const key = paperDbSort.replace("-asc", "").replace("-desc", "");
    items.sort((a, b) => {
      if (key === "title") {
        return direction * a.title.localeCompare(b.title);
      }
      if (key === "views") {
        return direction * (metricValue(a, "views") - metricValue(b, "views"));
      }
      if (key === "downloads") {
        return direction * (metricValue(a, "downloads") - metricValue(b, "downloads"));
      }
      if (key === "status") {
        return direction * (a.review_status || "").localeCompare(b.review_status || "");
      }
      const aDate = new Date(a.created_date ?? 0).getTime();
      const bDate = new Date(b.created_date ?? 0).getTime();
      return direction * (aDate - bDate);
    });
    return items;
  }, [paperDbFiltered, paperDbSort]);

  const paperPageSize = 10;
  const paperDbTotalPages = Math.max(
    1,
    Math.ceil(paperDbSorted.length / paperPageSize)
  );
  const paperDbPageItems = useMemo(() => {
    const start = (paperDbPage - 1) * paperPageSize;
    return paperDbSorted.slice(start, start + paperPageSize);
  }, [paperDbPage, paperDbSorted]);

  const userDbFiltered = useMemo(() => {
    const query = `${globalSearch} ${userSearch}`.trim().toLowerCase();
    return users.filter((user) => {
      if (userFilter === "editors" && !user.is_staff) return false;
      if (userFilter === "admins" && !user.is_staff) return false;
      if (userFilter === "authors" && user.is_staff) return false;
      if (userFilter === "inactive" && user.is_active !== false) return false;
      if (!query) return true;
      const haystack = [
        user.username,
        user.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [users, userFilter, userSearch, globalSearch]);

  const userDbSorted = useMemo(() => {
    const items = [...userDbFiltered];
    const direction = userSort.endsWith("asc") ? 1 : -1;
    const key = userSort.replace("-asc", "").replace("-desc", "");
    items.sort((a, b) => {
      if (key === "name") {
        return direction * (a.username || "").localeCompare(b.username || "");
      }
      if (key === "papers") {
        return direction * ((a.papers_submitted || 0) - (b.papers_submitted || 0));
      }
      if (key === "role") {
        return direction * String(a.is_staff).localeCompare(String(b.is_staff));
      }
      const aDate = new Date(a.date_joined ?? 0).getTime();
      const bDate = new Date(b.date_joined ?? 0).getTime();
      return direction * (aDate - bDate);
    });
    return items;
  }, [userDbFiltered, userSort]);

  const userPageSize = 8;
  const userTotalPages = Math.max(1, Math.ceil(userDbSorted.length / userPageSize));
  const userPageItems = useMemo(() => {
    const start = (userPage - 1) * userPageSize;
    return userDbSorted.slice(start, start + userPageSize);
  }, [userDbSorted, userPage]);

  useEffect(() => {
    setPaperDbPage(1);
  }, [paperDbSearch, paperDbStatus, paperDbSort, globalSearch]);

  useEffect(() => {
    setUserPage(1);
  }, [userSearch, userFilter, userSort, globalSearch]);

  const paperTitleLookup = useMemo(() => {
    const lookup: Record<number, string> = {};
    papers.forEach((paper) => {
      lookup[paper.id] = paper.title;
    });
    reviewReferences.forEach((paper) => {
      lookup[paper.id] = paper.title;
    });
    return lookup;
  }, [papers, reviewReferences]);

  const normalizeList = (value: unknown) => {
    if (!Array.isArray(value)) return "";
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .join(", ");
  };

  const normalizeString = (value: unknown) => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  const resolveAuthorNames = (value: unknown) => {
    if (!Array.isArray(value)) return formatChangeValue(value);
    const ids = value
      .map((item) => Number(item))
      .filter((id) => Number.isFinite(id));
    if (ids.length === 0) return "—";
    return ids
      .map((id) => userLookup[id] || `User #${id}`)
      .join(", ");
  };

  const resolveReferenceTitles = (value: unknown) => {
    if (!Array.isArray(value)) return formatChangeValue(value);
    const ids = value
      .map((item) => Number(item))
      .filter((id) => Number.isFinite(id));
    if (ids.length === 0) return "—";
    return ids
      .map((id) => paperTitleLookup[id] || `Paper #${id}`)
      .join(", ");
  };

  const activityFeed = useMemo(() => {
    const events = papers.map((paper) => {
      let label = "Paper updated";
      if (paper.review_status === "pending") label = "Paper submitted";
      if (paper.review_status === "approved" && !paper.is_paid) label = "Paper approved";
      if (paper.review_status === "approved" && paper.is_paid) label = "Payment received";
      if (paper.status === "published") label = "Paper published";
      if (paper.review_status === "rejected") label = "Paper rejected";
      return {
        id: paper.id,
        label,
        title: paper.title,
        timestamp: paper.updated_date || paper.created_date || "",
      };
    });
    return events
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 8);
  }, [papers]);

  const updatePaperInState = (updated: PaperAdmin) => {
    setPapers((prev) =>
      prev.map((paper) => (paper.id === updated.id ? updated : paper))
    );
  };

  const openChangeRequest = (request: ChangeRequest) => {
    const paperId = request.paper;
    const matched =
      typeof paperId === "number"
        ? papers.find((paper) => paper.id === paperId)
        : null;
    if (matched) {
      setReviewPaper(matched);
    } else if (paperId) {
      setReviewPaper({
        id: paperId,
        title: request.paper_title || `Paper ${paperId}`,
      } as PaperAdmin);
    } else {
      setReviewPaper(null);
    }
    setReviewChangeRequest(request);
  };

  useEffect(() => {
    if (!reviewPaper) {
      setReviewDetails(null);
      setReviewReferences([]);
      setReviewLoading(false);
      setReviewChangeRequest(null);
      setReviewDoi("");
      return;
    }
    let cancelled = false;
    const loadDetails = async () => {
      setReviewLoading(true);
      try {
        const token = localStorage.getItem("jmdlr_token");
        if (!token) {
          router.replace("/auth");
          return;
        }
        setReviewDetails(reviewPaper);
        const apiBase = getApiBase();
        const refsRes = await fetch(`${apiBase}/papers/${reviewPaper.id}/references/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!cancelled && refsRes.ok) {
          const payload = (await refsRes.json()) as PaperAdmin[];
          setReviewReferences(payload);
        }

        const changeRes = await fetch(
          `${apiBase}/papers/change-requests/?paper=${reviewPaper.id}&status=pending&type=edit`,
          { headers: { Authorization: `Token ${token}` } }
        );
        if (!cancelled && changeRes.ok) {
          const payload = (await changeRes.json()) as
            | { results?: ChangeRequest[] }
            | ChangeRequest[];
          const changes = normalizeResults(payload);
          setReviewChangeRequest(changes[0] ?? null);
        }

        if (!cancelled) {
          const doiValue =
            reviewDetails?.doi ??
            reviewPaper.doi ??
            "";
          setReviewDoi(doiValue || "");
        }
      } catch {
        if (!cancelled) {
          setReviewDetails(null);
          setReviewReferences([]);
          setReviewChangeRequest(null);
          setReviewDoi("");
        }
      } finally {
        if (!cancelled) {
          setReviewLoading(false);
        }
      }
    };

    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [reviewPaper, router]);

  useEffect(() => {
    if (!reviewChangeRequest?.proposed_data?.authors) return;
    const raw = reviewChangeRequest.proposed_data.authors as unknown;
    if (!Array.isArray(raw)) return;
    const ids = raw
      .map((item) => Number(item))
      .filter((id) => Number.isFinite(id))
      .filter((id) => !userLookup[id]);
    if (ids.length === 0) return;

    let cancelled = false;
    const loadUsers = async () => {
      const token = localStorage.getItem("jmdlr_token");
      const apiBase = getApiBase();
      await Promise.all(
        ids.map(async (id) => {
          try {
            const response = await fetch(`${apiBase}/users/${id}/`, {
              headers: token ? { Authorization: `Token ${token}` } : undefined,
            });
            if (!response.ok) return;
            const payload = (await response.json()) as {
              first_name?: string;
              last_name?: string;
              username?: string;
            };
            const fullName = [payload.first_name, payload.last_name]
              .filter(Boolean)
              .join(" ")
              .trim();
            if (cancelled) return;
            setUserLookup((prev) => ({
              ...prev,
              [id]: fullName || payload.username || `User #${id}`,
            }));
          } catch {
            if (cancelled) return;
            setUserLookup((prev) => ({
              ...prev,
              [id]: `User #${id}`,
            }));
          }
        })
      );
    };

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [reviewChangeRequest, userLookup]);

  const handleApprove = async (paper: PaperAdmin) => {
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    setActionLoading(paper.id);
    setActionMessage(null);
    try {
      const apiBase = getApiBase();
      const payloadBody: { doi?: string } = {};
      if (reviewDoi.trim().length > 0) {
        payloadBody.doi = reviewDoi.trim();
      }
      const response = await fetch(`${apiBase}/papers/${paper.id}/review/approve/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: Object.keys(payloadBody).length
          ? JSON.stringify(payloadBody)
          : undefined,
      });
      const payload = (await response.json()) as PaperAdmin & {
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Unable to approve.");
      }
      updatePaperInState(payload);
      setReviewPaper(null);
      setReviewDoi("");
      setActionMessage(`Approved "${paper.title}".`);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Unable to approve paper."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    setActionLoading(rejectTarget.id);
    setActionMessage(null);
    try {
      const apiBase = getApiBase();
      const reason =
        rejectReason.trim() ||
        (rejectMode === "revision" ? "Revision requested" : "Not specified");
      const response = await fetch(`${apiBase}/papers/${rejectTarget.id}/review/reject/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rejection_reason: reason,
        }),
      });
      const payload = (await response.json()) as PaperAdmin & {
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Unable to reject.");
      }
      updatePaperInState(payload);
      setActionMessage(
        rejectMode === "revision"
          ? `Revision requested for "${rejectTarget.title}".`
          : `Rejected "${rejectTarget.title}".`
      );
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Unable to reject paper."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (paper: PaperAdmin) => {
    setEditPaper(paper);
    setEditForm({
      title: paper.title || "",
      abstract: paper.abstract || "",
      keywords: (paper.keywords || []).join(", "),
      doi: paper.doi || "",
      published_date: paper.published_date || "",
      authors: (paper.author_profiles || [])
        .map((author) => author.id)
        .filter((id): id is number => typeof id === "number"),
      pdf_file: null,
    });
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editPaper) return;
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const apiBase = getApiBase();
      const data = new FormData();
      data.append("title", editForm.title.trim());
      data.append("abstract", editForm.abstract.trim());
      if (editForm.keywords.trim()) {
        const tags = editForm.keywords
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        data.append("keywords", JSON.stringify(tags));
      }
      if (editForm.doi.trim()) {
        data.append("doi", editForm.doi.trim());
      }
      if (editForm.published_date) {
        data.append("published_date", editForm.published_date);
      }
      if (editForm.authors.length > 0) {
        data.append("authors", JSON.stringify(editForm.authors));
      }
      if (editForm.pdf_file) {
        data.append("pdf_file", editForm.pdf_file);
      }

      const response = await fetch(`${apiBase}/papers/${editPaper.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}` },
        body: data,
      });
      const payload = (await response.json()) as PaperAdmin & {
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Unable to update paper.");
      }
      updatePaperInState(payload);
      setEditPaper(null);
      setActionMessage(`Updated "${payload.title}".`);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Unable to update paper."
      );
    } finally {
      setEditSaving(false);
    }
  };

  const handleMarkPaid = async (paper: PaperAdmin) => {
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    setActionLoading(paper.id);
    setActionMessage(null);
    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/papers/${paper.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_paid: true }),
      });
      const payload = (await response.json()) as PaperAdmin & {
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Unable to mark payment.");
      }
      updatePaperInState(payload);
      setActionMessage(`Marked payment received for "${paper.title}".`);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Unable to mark payment received."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (paper: PaperAdmin) => {
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    setActionLoading(paper.id);
    setActionMessage(null);
    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/papers/${paper.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "archived" }),
      });
      const payload = (await response.json()) as PaperAdmin & {
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Unable to unpublish.");
      }
      updatePaperInState(payload);
      setActionMessage(`Unpublished "${paper.title}".`);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Unable to unpublish paper."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const updateUserInState = (updated: AdminUser) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updated.id ? updated : user))
    );
  };

  const handleUpdateUser = async (user: AdminUser, payload: Record<string, unknown>) => {
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    setActionLoading(user.id);
    setActionMessage(null);
    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/users/${user.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const updated = (await response.json()) as AdminUser & {
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(updated.detail || updated.error || "Unable to update user.");
      }
      updateUserInState(toAdminUser(updated));
      setActionMessage("User updated.");
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Unable to update user."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const openUserEditor = async (user: AdminUser) => {
    setUserEditTarget(user);
    setUserEditError(null);
    setUserEditFetching(true);
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      setUserEditFetching(false);
      router.replace("/auth");
      return;
    }
    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/users/${user.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) {
        throw new Error("Unable to load user details.");
      }
      const payload = (await response.json()) as Record<string, unknown>;
      setUserEditForm({
        username: String(payload.username ?? user.username ?? ""),
        email: String(payload.email ?? user.email ?? ""),
        first_name: String(payload.first_name ?? ""),
        last_name: String(payload.last_name ?? ""),
        phone_number: String(payload.phone_number ?? ""),
        affiliation: String(payload.affiliation ?? ""),
        bio: String(payload.bio ?? ""),
        research_interests: Array.isArray(payload.research_interests)
          ? payload.research_interests.join(", ")
          : String(payload.research_interests ?? ""),
        orcid: String(payload.orcid ?? ""),
        linkedin: String(payload.linkedin ?? ""),
        google_scholar: String(payload.google_scholar ?? ""),
        is_staff: Boolean(payload.is_staff ?? user.is_staff ?? false),
        is_active: Boolean(payload.is_active ?? user.is_active ?? true),
        password: "",
        confirm_password: "",
      });
    } catch (err) {
      setUserEditError(
        err instanceof Error ? err.message : "Unable to load user details."
      );
    } finally {
      setUserEditFetching(false);
    }
  };

  const handleSaveUser = async () => {
    if (!userEditTarget) return;
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    setUserEditError(null);
    setUserEditSaving(true);
    try {
      const payload: Record<string, unknown> = {
        username: userEditForm.username.trim() || undefined,
        email: userEditForm.email.trim() || undefined,
        first_name: userEditForm.first_name.trim() || undefined,
        last_name: userEditForm.last_name.trim() || undefined,
        phone_number: userEditForm.phone_number.trim() || undefined,
        affiliation: userEditForm.affiliation.trim() || undefined,
        bio: userEditForm.bio.trim() || undefined,
        research_interests: userEditForm.research_interests
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        orcid: userEditForm.orcid.trim() || undefined,
        linkedin: userEditForm.linkedin.trim() || undefined,
        google_scholar: userEditForm.google_scholar.trim() || undefined,
        is_staff: userEditForm.is_staff,
        is_active: userEditForm.is_active,
      };
      if (userEditForm.password.trim()) {
        payload.password = userEditForm.password;
        payload.confirm_password = userEditForm.confirm_password;
      }

      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/users/${userEditTarget.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const updated = (await response.json()) as AdminUser & {
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(updated.detail || updated.error || "Unable to update user.");
      }
      updateUserInState(toAdminUser(updated));
      setActionMessage("User updated.");
      setUserEditTarget(null);
    } catch (err) {
      setUserEditError(
        err instanceof Error ? err.message : "Unable to update user."
      );
    } finally {
      setUserEditSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return;
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    setDeleteUserLoading(true);
    setActionMessage(null);
    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/users/${deleteUserTarget.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) {
        const payload = (await response.json()) as { detail?: string; error?: string };
        throw new Error(payload.detail || payload.error || "Unable to delete user.");
      }
      setUsers((prev) => prev.filter((item) => item.id !== deleteUserTarget.id));
      setActionMessage("User deleted.");
      setDeleteUserTarget(null);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Unable to delete user."
      );
    } finally {
      setDeleteUserLoading(false);
    }
  };

  const openUserViewer = async (user: AdminUser) => {
    setUserViewTarget(user);
    setUserViewError(null);
    setUserViewData(null);
    setUserViewLoading(true);
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      setUserViewLoading(false);
      router.replace("/auth");
      return;
    }
    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/users/${user.id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) {
        throw new Error("Unable to load user details.");
      }
      const payload = (await response.json()) as Record<string, unknown>;
      setUserViewData(payload);
    } catch (err) {
      setUserViewError(
        err instanceof Error ? err.message : "Unable to load user details."
      );
      setUserViewData(null);
    } finally {
      setUserViewLoading(false);
    }
  };

  const handleApproveChange = async (
    paper: PaperAdmin,
    changeRequest: ChangeRequest
  ) => {
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    if (!changeRequest.id) return;
    setActionLoading(paper.id);
    setActionMessage(null);
    try {
      const apiBase = getApiBase();
      const response = await fetch(
        `${apiBase}/papers/${paper.id}/change-requests/${changeRequest.id}/approve/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const payload = (await response.json()) as PaperAdmin & {
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Unable to approve change.");
      }
      updatePaperInState(payload);
      setChangeRequests((prev) =>
        prev.filter((request) => request.id !== changeRequest.id)
      );
      setReviewPaper(null);
      setReviewChangeRequest(null);
      setActionMessage(`Approved changes for "${paper.title}".`);
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Unable to approve change request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectChange = async () => {
    if (!rejectChangeRequest || !reviewPaper) return;
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    setActionLoading(reviewPaper.id);
    setActionMessage(null);
    try {
      const apiBase = getApiBase();
      const response = await fetch(
        `${apiBase}/papers/${reviewPaper.id}/change-requests/${rejectChangeRequest.id}/reject/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejection_reason: rejectReason.trim() || "Not specified",
          }),
        }
      );
      const payload = (await response.json()) as { detail?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Unable to reject change.");
      }
      setChangeRequests((prev) =>
        prev.filter((request) => request.id !== rejectChangeRequest.id)
      );
      setReviewPaper(null);
      setReviewChangeRequest(null);
      setRejectChangeRequest(null);
      setRejectReason("");
      setActionMessage("Change request rejected.");
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Unable to reject change request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  async function fetchAllPapers(apiBase: string, token: string): Promise<PaperAdmin[]> {
    const collected: PaperAdmin[] = [];
    let url: string | null = `${apiBase}/papers/`;
    while (url) {
      const response = await fetch(url, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) {
        throw new Error("Unable to load papers.");
      }
      const payload = (await response.json()) as PapersResponse;
      if (Array.isArray(payload)) {
        return payload;
      }
      collected.push(...normalizeResults(payload));
      url = payload.next ?? null;
    }
    return collected;
  }

  async function fetchAllUsers(apiBase: string, token: string): Promise<AdminUser[]> {
    const collected: AdminUser[] = [];
    let url: string | null = `${apiBase}/admin/users/`;
    while (url) {
      const response = await fetch(url, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) {
        throw new Error("Unable to load users.");
      }
      const payload = (await response.json()) as
        | { results?: AdminUser[]; next?: string | null }
        | AdminUser[];
      if (Array.isArray(payload)) {
        collected.push(...payload);
        break;
      }
      collected.push(...normalizeResults(payload));
      url = payload.next ?? null;
    }
    return collected;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001219] via-[#003b46] to-[#005f73] text-[#e9d8a6]">
      <Navbar />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-6 pb-16 pt-10">
        <aside className="hidden w-64 shrink-0 flex-col gap-4 lg:flex">
          <div className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
              Editorial Console
            </p>
            <p className="mt-3 text-sm text-[#e9d8a6]">
              {adminName ? `Welcome, ${adminName}` : "Welcome, Admin"}
            </p>
            <p className="mt-1 text-xs text-[#94d2bd]/80">
              Manage submissions, users, and payments.
            </p>
          </div>
          <nav className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
              Navigation
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <button
                type="button"
                onClick={() => setActiveSection("overview")}
                className={`rounded-xl px-3 py-2 text-left text-[#e9d8a6] transition ${
                  activeSection === "overview"
                    ? "bg-[#0a9396]/40"
                    : "hover:bg-[#0a9396]/30"
                }`}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("review-queue")}
                className={`rounded-xl px-3 py-2 text-left text-[#e9d8a6] transition ${
                  activeSection === "review-queue"
                    ? "bg-[#0a9396]/40"
                    : "hover:bg-[#0a9396]/30"
                }`}
              >
                Review Queue
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("payment-queue")}
                className={`rounded-xl px-3 py-2 text-left text-[#e9d8a6] transition ${
                  activeSection === "payment-queue"
                    ? "bg-[#0a9396]/40"
                    : "hover:bg-[#0a9396]/30"
                }`}
              >
                Payment Queue
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("published-papers")}
                className={`rounded-xl px-3 py-2 text-left text-[#e9d8a6] transition ${
                  activeSection === "published-papers"
                    ? "bg-[#0a9396]/40"
                    : "hover:bg-[#0a9396]/30"
                }`}
              >
                Published Papers
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("paper-database")}
                className={`rounded-xl px-3 py-2 text-left text-[#e9d8a6] transition ${
                  activeSection === "paper-database"
                    ? "bg-[#0a9396]/40"
                    : "hover:bg-[#0a9396]/30"
                }`}
              >
                Paper Database
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("user-database")}
                className={`rounded-xl px-3 py-2 text-left text-[#e9d8a6] transition ${
                  activeSection === "user-database"
                    ? "bg-[#0a9396]/40"
                    : "hover:bg-[#0a9396]/30"
                }`}
              >
                User Database
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("pdf-settings")}
                className={`rounded-xl px-3 py-2 text-left text-[#e9d8a6] transition ${
                  activeSection === "pdf-settings"
                    ? "bg-[#0a9396]/40"
                    : "hover:bg-[#0a9396]/30"
                }`}
              >
                PDF Formatting Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("payment-queue")}
                className={`rounded-xl px-3 py-2 text-left text-[#e9d8a6] transition ${
                  activeSection === "payment-queue"
                    ? "bg-[#0a9396]/40"
                    : "hover:bg-[#0a9396]/30"
                }`}
              >
                Payments
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("activity")}
                className={`rounded-xl px-3 py-2 text-left text-[#e9d8a6] transition ${
                  activeSection === "activity"
                    ? "bg-[#0a9396]/40"
                    : "hover:bg-[#0a9396]/30"
                }`}
              >
                System Logs
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 space-y-10">
          {loading ? (
            <div className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-6 text-sm text-[#94d2bd]">
              Loading admin dashboard...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-[#bb3e03]/50 bg-[#3b0f0f]/60 p-6 text-sm text-[#f8d7c4]">
              {error}
            </div>
          ) : (
            <>
              {activeSection === "overview" ? (
                <section id="overview" className="space-y-6">
                <div className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                        Admin Dashboard
                      </p>
                      <h1 className="mt-3 text-2xl font-semibold text-[#e9d8a6]">
                        Editorial Management
                      </h1>
                      <p className="mt-2 text-sm text-[#94d2bd]/80">
                        Track submissions, approvals, payments, and publications across the journal.
                      </p>
                    </div>
                    <div className="w-full max-w-sm">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                        Global search
                      </label>
                      <div className="relative mt-2">
                        <div className="flex items-center rounded-2xl border border-[#94d2bd]/40 bg-gradient-to-r from-[#00252e]/80 via-[#00313a]/80 to-[#003b46]/80 px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur">
                          <input
                            value={globalSearch}
                            onChange={(event) => setGlobalSearch(event.target.value)}
                            onFocus={() => setSearchOpen(true)}
                            onBlur={() => {
                              window.setTimeout(() => setSearchOpen(false), 120);
                            }}
                            placeholder="Search papers, authors, users"
                            className="w-full bg-transparent text-sm text-[#e9d8a6] placeholder:text-[#94d2bd]/60 focus:outline-none"
                          />
                        </div>
                        {searchOpen && searchQuery ? (
                          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[#94d2bd]/30 bg-gradient-to-br from-[#001219]/95 via-[#002a33]/95 to-[#003845]/95 shadow-2xl">
                            <div className="max-h-72 overflow-y-auto p-2 text-sm text-[#e9d8a6]">
                              {globalPaperMatches.length === 0 &&
                              globalUserMatches.length === 0 ? (
                                <div className="rounded-xl px-3 py-2 text-xs text-[#94d2bd]/80">
                                  No results found.
                                </div>
                              ) : null}
                              {globalPaperMatches.length > 0 ? (
                                <div className="mb-2">
                                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]/80">
                                    Papers
                                  </p>
                                  {globalPaperMatches.slice(0, 6).map((paper) => (
                                    <button
                                      key={`search-paper-${paper.id}`}
                                      type="button"
                                      onClick={() => {
                                        setReviewPaper(paper);
                                        setSearchOpen(false);
                                      }}
                                      className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-[#0a9396]/20"
                                    >
                                      <p className="text-sm font-semibold text-[#e9d8a6]">
                                        {paper.title}
                                      </p>
                                      <p className="text-[11px] text-[#94d2bd]/70">
                                        {getAuthorNames(paper.author_profiles)}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                              {globalUserMatches.length > 0 ? (
                                <div>
                                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]/80">
                                    Users
                                  </p>
                                  {globalUserMatches.slice(0, 6).map((user) => (
                                    <button
                                      key={`search-user-${user.id}`}
                                      type="button"
                                      onClick={() => {
                                        openUserViewer(user);
                                        setSearchOpen(false);
                                      }}
                                      className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-[#0a9396]/20"
                                    >
                                      <p className="text-sm font-semibold text-[#e9d8a6]">
                                        {user.username || user.email || "User"}
                                      </p>
                                      <p className="text-[11px] text-[#94d2bd]/70">
                                        {user.email || "—"}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-2 text-[11px] text-[#94d2bd]/70">
                        Search paper titles, author names, usernames, and emails.
                      </p>
                    </div>
                  </div>
                  {actionMessage ? (
                    <div className="mt-4 rounded-2xl border border-[#94d2bd]/30 bg-[#0a9396]/20 px-4 py-2 text-sm text-[#e9d8a6]">
                      {actionMessage}
                    </div>
                  ) : null}
                </div>

              <div className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                      Workflow
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#e9d8a6]">
                      Editorial pipeline
                    </h2>
                  </div>
                  <p className="text-xs text-[#94d2bd]/80">
                    Submitted → Under Review → Approved → Payment → Published
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {pipelineSteps.map((step) => (
                    <div
                      key={`pipeline-${step.label}`}
                      className={`flex items-center gap-2 rounded-full border ${step.tone} bg-[#001219]/40 px-4 py-2 text-xs text-[#e9d8a6]`}
                    >
                      <span className="text-sm font-semibold">{step.count}</span>
                      <span className="text-[#94d2bd]">{step.label}</span>
                    </div>
                  ))}
                  {rejectedStep ? (
                    <div
                      className={`flex items-center gap-2 rounded-full border ${rejectedStep.tone} bg-[#3b0f0f]/40 px-4 py-2 text-xs text-[#e9d8a6]`}
                    >
                      <span className="text-sm font-semibold">{rejectedStep.count}</span>
                      <span className="text-[#f4a261]">Rejected</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {workflowMetrics.map((metric) => (
                  <div
                    key={`metric-${metric.label}`}
                    className={`rounded-3xl border ${metric.tone} bg-[#003845]/60 p-5 shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                        {metric.label}
                      </p>
                      <span className={`h-2 w-2 rounded-full border ${metric.tone}`} />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg">{metricIconMap[metric.label] ?? "•"}</span>
                      <p className="text-2xl font-semibold text-[#e9d8a6]">
                        {metric.count}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-[#94d2bd]/70">Active papers</p>
                  </div>
                ))}
              </div>

                </section>
              ) : null}

              {activeSection === "review-queue" ? (
                <section id="review-queue" className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <div className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                        Paper Review Queue
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-[#e9d8a6]">
                        Awaiting editorial decision
                      </h2>
                    </div>
                    <span className="text-xs text-[#94d2bd]/80">
                      {pendingPapers.length} pending
                    </span>
                  </div>
                  {pendingPapers.length === 0 ? (
                    <p className="mt-4 text-sm text-[#94d2bd]/80">
                      No submissions are awaiting review.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {pendingPapers.slice(0, 6).map((paper) => (
                        <div
                          key={`pending-${paper.id}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => setReviewPaper(paper)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setReviewPaper(paper);
                            }
                          }}
                          className="rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 px-4 py-3 text-left transition hover:border-[#94d2bd]/50"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-[#e9d8a6]">
                                {paper.title}
                              </p>
                              <p className="mt-1 text-xs text-[#94d2bd]/70">
                                {getAuthorNames(paper.author_profiles)}
                              </p>
                              <p className="mt-1 text-[11px] text-[#94d2bd]/60">
                                Submitted {formatDate(paper.created_date)}
                              </p>
                            </div>
                            <div className="flex flex-wrap justify-end gap-2 text-xs">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleApprove(paper);
                                }}
                                disabled={actionLoading === paper.id}
                                aria-label="Approve paper"
                                title="Approve"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0a9396] text-[#001219] transition hover:bg-[#94d2bd] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {actionLoading === paper.id ? (
                                  <IconSpinner className="h-4 w-4 animate-spin" />
                                ) : (
                                  <IconCheck className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setRejectMode("revision");
                                  setRejectTarget(paper);
                                }}
                                aria-label="Request revision"
                                title="Request revision"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ee9b00]/60 text-[#ee9b00] transition hover:bg-[#ee9b00]/20"
                              >
                                <IconRefresh className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setRejectMode("reject");
                                  setRejectTarget(paper);
                                }}
                                aria-label="Reject paper"
                                title="Reject"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#bb3e03]/60 text-[#bb3e03] transition hover:bg-[#bb3e03]/20"
                              >
                                <IconX className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                      Edit Requests
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#e9d8a6]">
                      {pendingEditRequests.length} requests awaiting review
                    </h3>
                    <div className="mt-4 space-y-3">
                      {pendingEditRequests.length === 0 ? (
                        <p className="text-sm text-[#94d2bd]/80">No edit requests.</p>
                      ) : (
                        pendingEditRequests.slice(0, 5).map((request) => (
                          <button
                            key={`edit-request-${request.id}`}
                            type="button"
                            onClick={() => openChangeRequest(request)}
                            className="w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/30 px-4 py-3 text-left text-sm text-[#e9d8a6] transition hover:border-[#94d2bd]/60"
                          >
                            <p className="font-semibold">
                              {request.paper_title || "Untitled paper"}
                            </p>
                            <p className="mt-1 text-xs text-[#94d2bd]/70">
                              Submitted {formatDate(request.created_at)}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-[#bb3e03]/30 bg-[#3b0f0f]/50 p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f4a261]">
                      Rejected Papers
                    </p>
                    <p className="mt-2 text-sm text-[#f8d7c4]">
                      {rejectedPapers.length} submissions rejected
                    </p>
                    <div className="mt-4 space-y-2">
                      {rejectedPapers.slice(0, 4).map((paper) => (
                        <div
                          key={`rejected-${paper.id}`}
                          className="rounded-2xl border border-[#bb3e03]/40 bg-[#1d0b0b]/50 px-3 py-2 text-xs text-[#f8d7c4]"
                        >
                          <p className="font-semibold">{paper.title}</p>
                          <p className="mt-1 text-[11px] text-[#f8d7c4]/70">
                            {formatDate(paper.updated_date || paper.created_date)}
                          </p>
                        </div>
                      ))}
                      {rejectedPapers.length === 0 ? (
                        <p className="text-xs text-[#f8d7c4]/70">
                          No rejected papers.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div id="activity" className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                      Recent Activity
                    </p>
                    <div className="mt-4 space-y-3">
                      {activityFeed.length === 0 ? (
                        <p className="text-sm text-[#94d2bd]/80">No activity yet.</p>
                      ) : (
                        activityFeed.map((event) => (
                          <div
                            key={`activity-${event.id}`}
                            className="rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 px-3 py-2 text-xs text-[#e9d8a6]"
                          >
                            <p className="font-semibold">{event.label}</p>
                            <p className="mt-1 text-[11px] text-[#94d2bd]/70">
                              {event.title}
                            </p>
                            <p className="mt-1 text-[11px] text-[#94d2bd]/60">
                              {formatDate(event.timestamp)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                </section>
              ) : null}

              {activeSection === "activity" ? (
                <section id="activity" className="space-y-6">
                  <div className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                      Recent Activity
                    </p>
                    <div className="mt-4 space-y-3">
                      {activityFeed.length === 0 ? (
                        <p className="text-sm text-[#94d2bd]/80">No activity yet.</p>
                      ) : (
                        activityFeed.map((event) => (
                          <div
                            key={`activity-${event.id}`}
                            className="rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 px-3 py-2 text-xs text-[#e9d8a6]"
                          >
                            <p className="font-semibold">{event.label}</p>
                            <p className="mt-1 text-[11px] text-[#94d2bd]/70">
                              {event.title}
                            </p>
                            <p className="mt-1 text-[11px] text-[#94d2bd]/60">
                              {formatDate(event.timestamp)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </section>
              ) : null}

              {activeSection === "payment-queue" ? (
                <section id="payment-queue" className="space-y-6">
                <div className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                        Payment Queue
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-[#e9d8a6]">
                        Approved papers awaiting payment
                      </h2>
                    </div>
                    <span className="text-xs text-[#94d2bd]/80">
                      {paymentDue.length} pending
                    </span>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <div className="min-w-[720px]">
                      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.4fr] gap-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/40 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#94d2bd]">
                        <span>Title</span>
                        <span className="text-center">Authors</span>
                        <span className="text-center">Approved</span>
                        <span className="text-center">Status</span>
                        <span className="text-center">Actions</span>
                      </div>
                      {paymentDue.length === 0 ? (
                        <div className="mt-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 px-4 py-4 text-sm text-[#94d2bd]">
                          No payments pending.
                        </div>
                      ) : (
                        paymentDue.map((paper) => (
                          <div
                            key={`payment-${paper.id}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => setReviewPaper(paper)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setReviewPaper(paper);
                              }
                            }}
                            className="mt-3 grid cursor-pointer grid-cols-[2fr_1fr_1fr_1fr_1.4fr] gap-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 px-4 py-3 text-sm transition hover:border-[#94d2bd]/50"
                          >
                            <div>
                              <p className="font-semibold text-[#e9d8a6]">{paper.title}</p>
                              <p className="mt-1 text-xs text-[#94d2bd]/70">
                                {paper.doi ? `DOI ${paper.doi}` : "No DOI"}
                              </p>
                            </div>
                            <div className="text-center text-xs text-[#94d2bd]/80">
                              {getAuthorNames(paper.author_profiles)}
                            </div>
                            <div className="text-center text-xs text-[#94d2bd]/80">
                              {formatDate(paper.updated_date || paper.created_date)}
                            </div>
                            <div className="flex justify-center">
                              <span className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#ee9b00]/60 bg-[#ee9b00]/10 px-3 py-1 text-[11px] text-[#ee9b00]">
                                Payment Pending
                              </span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleMarkPaid(paper);
                                }}
                                disabled={actionLoading === paper.id}
                                aria-label="Mark payment received"
                                title="Mark paid"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ee9b00] text-[#001219] transition hover:bg-[#ca6702] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {actionLoading === paper.id ? (
                                  <IconSpinner className="h-4 w-4 animate-spin" />
                                ) : (
                                  <IconCard className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setActionMessage(`Payment reminder sent for \"${paper.title}\".`);
                                }}
                                aria-label="Send payment reminder"
                                title="Send reminder"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#94d2bd]/50 text-[#94d2bd] transition hover:bg-[#94d2bd]/20"
                              >
                                <IconBell className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                </section>
              ) : null}

              {activeSection === "published-papers" ? (
                <section id="published-papers" className="space-y-6">
                <div className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                        Published Paper Management
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-[#e9d8a6]">
                        Maintain published catalog
                      </h2>
                    </div>
                    <span className="text-xs text-[#94d2bd]/80">
                      {publishedPapers.length} published
                    </span>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <div className="min-w-[900px]">
                      <div className="grid grid-cols-[2fr_1fr_1fr_0.8fr_0.8fr_0.8fr_1.4fr] gap-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/40 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#94d2bd]">
                        <span>Title</span>
                        <span className="text-center">Authors</span>
                        <span className="text-center">Published</span>
                        <span className="text-center">
                          <span className="inline-flex items-center justify-center">
                            <IconEye className="h-3.5 w-3.5" />
                          </span>
                        </span>
                        <span className="text-center">
                          <span className="inline-flex items-center justify-center">
                            <IconDownload className="h-3.5 w-3.5" />
                          </span>
                        </span>
                        <span className="text-center">Citations</span>
                        <span className="text-center">Actions</span>
                      </div>
                      {publishedPapers.length === 0 ? (
                        <div className="mt-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 px-4 py-4 text-sm text-[#94d2bd]">
                          No published papers yet.
                        </div>
                      ) : (
                        publishedPapers.map((paper) => (
                          <div
                            key={`published-${paper.id}`}
                            className="mt-3 grid grid-cols-[2fr_1fr_1fr_0.8fr_0.8fr_0.8fr_1.4fr] gap-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 px-4 py-3 text-sm"
                          >
                            <div>
                              <p className="font-semibold text-[#e9d8a6]">{paper.title}</p>
                              <p className="mt-1 text-xs text-[#94d2bd]/70">
                                {paper.doi || "No DOI"}
                              </p>
                            </div>
                            <div className="text-center text-xs text-[#94d2bd]/80">
                              {getAuthorNames(paper.author_profiles)}
                            </div>
                            <div className="text-center text-xs text-[#94d2bd]/80">
                              {formatDate(paper.published_date || paper.updated_date)}
                            </div>
                            <div className="text-center text-xs text-[#94d2bd]/80">
                              {metricValue(paper, "views")}
                            </div>
                            <div className="text-center text-xs text-[#94d2bd]/80">
                              {metricValue(paper, "downloads")}
                            </div>
                            <div className="text-center text-xs text-[#94d2bd]/80">
                              {paper.citation_count ?? 0}
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => openEditModal(paper)}
                                aria-label="Edit paper"
                                title="Edit"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#94d2bd]/50 text-[#94d2bd] transition hover:bg-[#94d2bd]/20"
                              >
                                <IconPencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditModal(paper)}
                                aria-label="Replace PDF"
                                title="Replace PDF"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#0a9396]/50 text-[#0a9396] transition hover:bg-[#0a9396]/20"
                              >
                                <IconUpload className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUnpublish(paper)}
                                aria-label="Unpublish"
                                title="Unpublish"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#bb3e03]/60 text-[#bb3e03] transition hover:bg-[#bb3e03]/20"
                              >
                                <IconArchive className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                </section>
              ) : null}

              {activeSection === "paper-database" ? (
                <section id="paper-database" className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                      Paper Database
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#e9d8a6]">
                      Full submission registry
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2">
                      <input
                        value={paperDbSearch}
                        onChange={(event) => setPaperDbSearch(event.target.value)}
                        placeholder="Search papers"
                        className="w-56 bg-transparent text-sm text-[#e9d8a6] placeholder:text-[#94d2bd]/60 focus:outline-none"
                      />
                    </div>
                    <select
                      value={paperDbSort}
                      onChange={(event) => setPaperDbSort(event.target.value)}
                      className="rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6]"
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="title-asc">Title A-Z</option>
                      <option value="title-desc">Title Z-A</option>
                      <option value="views-desc">Most Viewed</option>
                      <option value="downloads-desc">Most Downloaded</option>
                      <option value="status-asc">Status A-Z</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { label: "All", value: "all" },
                    { label: "Submitted", value: "draft" },
                    { label: "Under Review", value: "pending" },
                    { label: "Approved", value: "approved" },
                    { label: "Payment Pending", value: "payment" },
                    { label: "Published", value: "published" },
                    { label: "Rejected", value: "rejected" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setPaperDbStatus(filter.value)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        paperDbStatus === filter.value
                          ? "border-[#ee9b00] bg-[#ee9b00]/20 text-[#ee9b00]"
                          : "border-[#94d2bd]/30 text-[#94d2bd] hover:bg-[#0a9396]/20"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-6">
                  <div className="overflow-x-auto">
                    <div className="min-w-[940px]">
                      <div className="grid grid-cols-[2fr_1.2fr_0.9fr_0.7fr_0.7fr_0.7fr_1fr_1fr] gap-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/40 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#94d2bd]">
                        <span>Title</span>
                        <span className="text-center">Authors</span>
                        <span className="text-center">Status</span>
                        <span className="text-center">
                          <span className="inline-flex items-center justify-center">
                            <IconEye className="h-3.5 w-3.5" />
                          </span>
                        </span>
                        <span className="text-center">
                          <span className="inline-flex items-center justify-center">
                            <IconDownload className="h-3.5 w-3.5" />
                          </span>
                        </span>
                        <span className="text-center">Citations</span>
                        <span className="text-center">Date</span>
                        <span className="text-center">Actions</span>
                      </div>
                      {paperDbPageItems.length === 0 ? (
                        <div className="mt-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 px-4 py-4 text-sm text-[#94d2bd]">
                          No papers match these filters.
                        </div>
                      ) : (
                        paperDbPageItems.map((paper) => (
                          <div
                            key={`paper-db-${paper.id}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => setReviewPaper(paper)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setReviewPaper(paper);
                              }
                            }}
                            className="mt-3 grid cursor-pointer grid-cols-[2fr_1.2fr_0.9fr_0.7fr_0.7fr_0.7fr_1fr_1fr] gap-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 px-4 py-3 text-sm transition hover:border-[#94d2bd]/50"
                          >
                            <p className="font-semibold text-[#e9d8a6]">{paper.title}</p>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {getAuthorNames(paper.author_profiles)}
                            </span>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {paper.review_status || paper.status || "draft"}
                            </span>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {metricValue(paper, "views")}
                            </span>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {metricValue(paper, "downloads")}
                            </span>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {paper.citation_count ?? 0}
                            </span>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {formatDate(paper.created_date)}
                            </span>
                            <div className="flex justify-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openEditModal(paper);
                                }}
                                aria-label="Edit paper"
                                title="Edit"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#0a9396]/50 text-[#0a9396] transition hover:bg-[#0a9396]/20"
                              >
                                <IconPencil className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-[#94d2bd]">
                    <span>
                      Page {paperDbPage} of {paperDbTotalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaperDbPage((prev) => Math.max(1, prev - 1))}
                        disabled={paperDbPage <= 1}
                        className="rounded-full border border-[#94d2bd]/30 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaperDbPage((prev) => Math.min(paperDbTotalPages, prev + 1))}
                        disabled={paperDbPage >= paperDbTotalPages}
                        className="rounded-full border border-[#94d2bd]/30 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
                </section>
              ) : null}

              {activeSection === "user-database" ? (
                <section id="user-database" className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                      User Database
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-[#e9d8a6]">
                      Registered user registry
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2">
                      <input
                        value={userSearch}
                        onChange={(event) => setUserSearch(event.target.value)}
                        placeholder="Search users"
                        className="w-56 bg-transparent text-sm text-[#e9d8a6] placeholder:text-[#94d2bd]/60 focus:outline-none"
                      />
                    </div>
                    <select
                      value={userSort}
                      onChange={(event) => setUserSort(event.target.value)}
                      className="rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6]"
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="name-asc">Name A-Z</option>
                      <option value="name-desc">Name Z-A</option>
                      <option value="papers-desc">Most Papers</option>
                      <option value="papers-asc">Fewest Papers</option>
                      <option value="role-asc">Role A-Z</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { label: "All", value: "all" },
                    { label: "Editors", value: "editors" },
                    { label: "Authors", value: "authors" },
                    { label: "Admins", value: "admins" },
                    { label: "Inactive", value: "inactive" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setUserFilter(filter.value)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        userFilter === filter.value
                          ? "border-[#ee9b00] bg-[#ee9b00]/20 text-[#ee9b00]"
                          : "border-[#94d2bd]/30 text-[#94d2bd] hover:bg-[#0a9396]/20"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="rounded-3xl border border-[#94d2bd]/20 bg-[#003845]/70 p-6">
                  <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                      <div className="grid grid-cols-[1.3fr_1.1fr_1.4fr_1fr_0.7fr_0.7fr_0.9fr_1.2fr] gap-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/40 px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-[#94d2bd]">
                        <span>Name</span>
                        <span className="text-center">Username</span>
                        <span className="text-center">Email</span>
                        <span className="text-center">Affiliation</span>
                        <span className="text-center">Papers</span>
                        <span className="text-center">Role</span>
                        <span className="text-center">Date Joined</span>
                        <span className="text-center">Actions</span>
                      </div>
                      {userPageItems.length === 0 ? (
                        <div className="mt-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 px-4 py-4 text-sm text-[#94d2bd]">
                          No users match these filters.
                        </div>
                      ) : (
                        userPageItems.map((user) => (
                          <div
                            key={`user-${user.id}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => openUserViewer(user)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openUserViewer(user);
                              }
                            }}
                            className="mt-3 grid cursor-pointer grid-cols-[1.3fr_1.1fr_1.4fr_1fr_0.7fr_0.7fr_0.9fr_1.2fr] gap-3 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 px-4 py-3 text-sm transition hover:border-[#94d2bd]/50"
                          >
                            <span className="font-semibold text-[#e9d8a6]">
                              {user.username || "User"}
                            </span>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {user.username}
                            </span>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {user.email}
                            </span>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {user.affiliation || "—"}
                            </span>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {user.papers_submitted ?? 0}
                            </span>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {user.is_staff ? "Editor" : "Author"}
                            </span>
                            <span className="text-center text-xs text-[#94d2bd]/80">
                              {formatDate(user.date_joined)}
                            </span>
                            <div className="flex flex-wrap justify-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openUserEditor(user);
                                }}
                                aria-label="Edit user"
                                title="Edit"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#94d2bd]/50 text-[#94d2bd] transition hover:bg-[#94d2bd]/20"
                              >
                                <IconPencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleUpdateUser(user, { is_staff: true });
                                }}
                                aria-label="Promote user"
                                title="Promote"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#0a9396]/50 text-[#0a9396] transition hover:bg-[#0a9396]/20"
                              >
                                <IconArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setDeleteUserTarget(user);
                                }}
                                aria-label="Delete user"
                                title="Delete"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#bb3e03]/50 text-[#bb3e03] transition hover:bg-[#bb3e03]/20"
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  {userError ? (
                    <p className="mt-3 text-xs text-[#f8d7c4]">{userError}</p>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between text-xs text-[#94d2bd]">
                    <span>
                      Page {userPage} of {userTotalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUserPage((prev) => Math.max(1, prev - 1))}
                        disabled={userPage <= 1}
                        className="rounded-full border border-[#94d2bd]/30 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserPage((prev) => Math.min(userTotalPages, prev + 1))}
                        disabled={userPage >= userTotalPages}
                        className="rounded-full border border-[#94d2bd]/30 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
                </section>
              ) : null}

              {activeSection === "pdf-settings" ? (
                <section id="pdf-settings" className="space-y-6">
                  <AdminPdfSettingsPanel className="max-w-none" />
                </section>
              ) : null}
            </>
          )}
      </main>
      </div>
      <Footer />

      {editPaper ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001219]/70 px-4">
          <div className="w-full max-w-3xl rounded-3xl border border-[#94d2bd]/30 bg-[#003845] p-6 text-[#e9d8a6] shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                  Edit Paper
                </p>
                <h2 className="mt-2 text-lg font-semibold">{editPaper.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditPaper(null)}
                aria-label="Close"
                title="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#94d2bd]/40 text-[#94d2bd] transition hover:bg-[#94d2bd]/10 hover:text-[#e9d8a6]"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                  Title
                </label>
                <input
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                  Abstract
                </label>
                <textarea
                  rows={4}
                  value={editForm.abstract}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, abstract: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                  Keywords
                </label>
                <input
                  value={editForm.keywords}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, keywords: event.target.value }))
                  }
                  placeholder="comma separated"
                  className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                  DOI
                </label>
                <input
                  value={editForm.doi}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, doi: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                  Published Date
                </label>
                <input
                  type="date"
                  value={editForm.published_date}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, published_date: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                  Author IDs
                </label>
                <input
                  value={editForm.authors.join(", ")}
                  onChange={(event) => {
                    const ids = event.target.value
                      .split(",")
                      .map((value) => Number.parseInt(value.trim(), 10))
                      .filter((value) => Number.isFinite(value));
                    setEditForm((prev) => ({ ...prev, authors: ids }));
                  }}
                  placeholder="e.g. 3, 8, 21"
                  className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                  Replace PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      pdf_file: event.target.files?.[0] ?? null,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] file:mr-3 file:rounded-full file:border-0 file:bg-[#0a9396] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#001219]"
                />
                <p className="mt-2 text-[11px] text-[#94d2bd]/70">
                  Uploading a new PDF will replace the existing manuscript.
                </p>
              </div>
            </div>

            {editError ? (
              <p className="mt-4 text-sm text-[#f4a261]">{editError}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditPaper(null)}
                className="rounded-full border border-[#94d2bd]/40 px-4 py-2 text-sm font-semibold text-[#94d2bd] transition hover:bg-[#94d2bd]/20"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="rounded-full bg-[#ee9b00] px-4 py-2 text-sm font-semibold text-[#001219] transition hover:bg-[#ca6702] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {userViewTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001219]/70 px-4">
          <div className="w-full max-w-4xl rounded-3xl border border-[#94d2bd]/30 bg-[#003845] p-6 text-[#e9d8a6] shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                  User Details
                </p>
                <h2 className="mt-2 text-lg font-semibold">
                  {String(
                    userViewData?.username ??
                      userViewTarget.username ??
                      userViewTarget.email ??
                      "User"
                  )}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserViewTarget(null);
                  setUserViewData(null);
                }}
                aria-label="Close"
                title="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#94d2bd]/40 text-[#94d2bd] transition hover:bg-[#94d2bd]/10 hover:text-[#e9d8a6]"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {userViewError ? (
              <div className="mt-4 rounded-2xl border border-[#bb3e03]/40 bg-[#3b0f0f]/50 px-4 py-2 text-sm text-[#f8d7c4]">
                {userViewError}
              </div>
            ) : null}
            {userViewLoading ? (
              <div className="mt-4 rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-4 py-2 text-sm text-[#94d2bd]">
                Loading user details...
              </div>
            ) : null}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                  Profile
                </p>
                <div className="mt-3 space-y-2 text-sm text-[#e9d8a6]">
                  <p>
                    <span className="text-[#94d2bd]/80">Name:</span>{" "}
                    {[userViewData?.first_name, userViewData?.last_name]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </p>
                  <p>
                    <span className="text-[#94d2bd]/80">Username:</span>{" "}
                    {String(userViewData?.username ?? userViewTarget.username ?? "—")}
                  </p>
                  <p>
                    <span className="text-[#94d2bd]/80">Email:</span>{" "}
                    {String(userViewData?.email ?? userViewTarget.email ?? "—")}
                  </p>
                  <p>
                    <span className="text-[#94d2bd]/80">Phone:</span>{" "}
                    {String(userViewData?.phone_number ?? "—")}
                  </p>
                  <p>
                    <span className="text-[#94d2bd]/80">Affiliation:</span>{" "}
                    {String(userViewData?.affiliation ?? userViewTarget.affiliation ?? "—")}
                  </p>
                  <p>
                    <span className="text-[#94d2bd]/80">Joined:</span>{" "}
                    {formatDate(String(userViewTarget.date_joined ?? ""))}
                  </p>
                  <p>
                    <span className="text-[#94d2bd]/80">Role:</span>{" "}
                    {userViewData?.is_staff || userViewTarget.is_staff ? "Admin" : "Author"}
                  </p>
                  <p>
                    <span className="text-[#94d2bd]/80">Status:</span>{" "}
                    {userViewData?.is_active ?? userViewTarget.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                  Metrics
                </p>
                <div className="mt-3 grid gap-2 text-sm text-[#e9d8a6]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94d2bd]/80">Published Papers</span>
                    <span>{String(userViewData?.authored_papers ?? "0")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94d2bd]/80">Total Citations</span>
                    <span>{String(userViewData?.total_citations ?? "0")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94d2bd]/80">Total Views</span>
                    <span>{String(userViewData?.total_views ?? "0")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94d2bd]/80">H-index</span>
                    <span>{String(userViewData?.h_index ?? "0")}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                  Academic
                </p>
                <p className="mt-3 text-sm text-[#e9d8a6]">
                  {String(userViewData?.bio ?? "No bio provided.")}
                </p>
                <div className="mt-3 text-sm text-[#94d2bd]/80">
                  Research Interests:{" "}
                  {Array.isArray(userViewData?.research_interests)
                    ? userViewData?.research_interests.join(", ")
                    : String(userViewData?.research_interests ?? "—")}
                </div>
              </div>

              <div className="md:col-span-2 rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                  Links
                </p>
                <div className="mt-3 grid gap-2 text-sm text-[#e9d8a6] md:grid-cols-2">
                  <p>
                    <span className="text-[#94d2bd]/80">ORCID:</span>{" "}
                    {String(userViewData?.orcid ?? "—")}
                  </p>
                  <p>
                    <span className="text-[#94d2bd]/80">LinkedIn:</span>{" "}
                    {String(userViewData?.linkedin ?? "—")}
                  </p>
                  <p>
                    <span className="text-[#94d2bd]/80">Google Scholar:</span>{" "}
                    {String(userViewData?.google_scholar ?? "—")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {userEditTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001219]/70 px-4">
          <div className="w-full max-w-6xl rounded-3xl border border-[#94d2bd]/30 bg-[#003845] p-5 text-[#e9d8a6] shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                  Edit User
                </p>
                <h2 className="mt-2 text-lg font-semibold">
                  {userEditForm.username || userEditTarget.username || "User"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setUserEditTarget(null)}
                aria-label="Close"
                title="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#94d2bd]/40 text-[#94d2bd] transition hover:bg-[#94d2bd]/10 hover:text-[#e9d8a6]"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {userEditError ? (
              <div className="mt-4 rounded-2xl border border-[#bb3e03]/40 bg-[#3b0f0f]/50 px-4 py-2 text-sm text-[#f8d7c4]">
                {userEditError}
              </div>
            ) : null}
            {userEditFetching ? (
              <div className="mt-4 rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-4 py-2 text-sm text-[#94d2bd]">
                Loading user details...
              </div>
            ) : null}

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                  Profile
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      Username
                    </label>
                    <input
                      value={userEditForm.username}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({ ...prev, username: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      Email
                    </label>
                    <input
                      value={userEditForm.email}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({ ...prev, email: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      First Name
                    </label>
                    <input
                      value={userEditForm.first_name}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({
                          ...prev,
                          first_name: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      Last Name
                    </label>
                    <input
                      value={userEditForm.last_name}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({ ...prev, last_name: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      Phone Number
                    </label>
                    <input
                      value={userEditForm.phone_number}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({
                          ...prev,
                          phone_number: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                  Academic
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      Affiliation
                    </label>
                    <input
                      value={userEditForm.affiliation}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({
                          ...prev,
                          affiliation: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      Bio
                    </label>
                    <textarea
                      rows={2}
                      value={userEditForm.bio}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({ ...prev, bio: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      Research Interests
                    </label>
                    <input
                      value={userEditForm.research_interests}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({
                          ...prev,
                          research_interests: event.target.value,
                        }))
                      }
                      placeholder="comma separated"
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                  Links
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      ORCID
                    </label>
                    <input
                      value={userEditForm.orcid}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({ ...prev, orcid: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      LinkedIn
                    </label>
                    <input
                      value={userEditForm.linkedin}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({ ...prev, linkedin: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      Google Scholar
                    </label>
                    <input
                      value={userEditForm.google_scholar}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({
                          ...prev,
                          google_scholar: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#94d2bd]/20 bg-[#001219]/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#94d2bd]">
                  Access & Password
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <input
                      id="user-edit-staff"
                      type="checkbox"
                      checked={userEditForm.is_staff}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({
                          ...prev,
                          is_staff: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border border-[#94d2bd]/40 bg-[#001219]/40 text-[#0a9396] focus:ring-[#94d2bd]/40"
                    />
                    <label htmlFor="user-edit-staff" className="text-sm text-[#e9d8a6]">
                      Admin / Editor access
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="user-edit-active"
                      type="checkbox"
                      checked={userEditForm.is_active}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({
                          ...prev,
                          is_active: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border border-[#94d2bd]/40 bg-[#001219]/40 text-[#0a9396] focus:ring-[#94d2bd]/40"
                    />
                    <label htmlFor="user-edit-active" className="text-sm text-[#e9d8a6]">
                      Active account
                    </label>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={userEditForm.password}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#94d2bd]">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={userEditForm.confirm_password}
                      onChange={(event) =>
                        setUserEditForm((prev) => ({
                          ...prev,
                          confirm_password: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] focus:outline-none focus:ring-2 focus:ring-[#94d2bd]/40"
                    />
                  </div>
                  <p className="md:col-span-2 text-xs text-[#94d2bd]/70">
                    Leave password fields empty to keep the current password.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserEditTarget(null)}
                className="rounded-full border border-[#94d2bd]/40 px-4 py-2 text-sm font-semibold text-[#94d2bd] transition hover:bg-[#94d2bd]/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                disabled={userEditSaving}
                className="rounded-full bg-[#ee9b00] px-4 py-2 text-sm font-semibold text-[#001219] transition hover:bg-[#ca6702] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {userEditSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteUserTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001219]/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#bb3e03]/40 bg-[#3b0f0f] p-6 text-[#f8d7c4] shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#f8d7c4]">Delete User</h2>
              <button
                type="button"
                onClick={() => setDeleteUserTarget(null)}
                aria-label="Close"
                title="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#f8d7c4]/40 text-[#f8d7c4] transition hover:bg-[#f8d7c4]/10"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm text-[#f8d7c4]/90">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {deleteUserTarget.username || deleteUserTarget.email || "this user"}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteUserTarget(null)}
                className="rounded-full border border-[#f8d7c4]/40 px-4 py-2 text-sm font-semibold text-[#f8d7c4] transition hover:bg-[#f8d7c4]/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteUserLoading}
                className="rounded-full bg-[#bb3e03] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9b2226] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteUserLoading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rejectTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#94d2bd]/30 bg-[#003845] p-6 text-[#e9d8a6] shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {rejectMode === "revision" ? "Request Revision" : "Reject Submission"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason("");
                }}
                aria-label="Close"
                title="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#94d2bd]/40 text-[#94d2bd] transition hover:bg-[#94d2bd]/10 hover:text-[#e9d8a6]"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-[#94d2bd]/80">
              {rejectMode === "revision" ? "Add a note for revisions on " : "Add a reason for rejecting "}
              <span className="font-semibold text-[#e9d8a6]">
                {rejectTarget.title}
              </span>
              .
            </p>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-2xl border border-[#94d2bd]/30 bg-[#001219]/40 px-3 py-2 text-sm text-[#e9d8a6] shadow-sm transition focus:border-[#bb3e03]/60 focus:outline-none focus:ring-2 focus:ring-[#bb3e03]/30"
            />
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason("");
                }}
                className="rounded-full border border-[#94d2bd]/40 bg-transparent px-4 py-2 text-sm font-semibold text-[#94d2bd] shadow-sm transition hover:bg-[#94d2bd]/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading === rejectTarget.id}
                className="rounded-full bg-[#bb3e03] px-4 py-2 text-sm font-semibold text-[#001219] shadow-sm transition hover:bg-[#9b2226] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === rejectTarget.id
                  ? "Saving..."
                  : rejectMode === "revision"
                    ? "Request Revision"
                    : "Reject"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {reviewPaper ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Review Submission
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  {reviewPaper.title}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {getAuthorNames(reviewDetails?.author_profiles ?? reviewPaper.author_profiles)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewPaper(null)}
                aria-label="Close"
                title="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {reviewLoading ? (
              <div className="mt-4 text-sm text-slate-500">Loading paper...</div>
            ) : reviewChangeRequest ? (
              <div className="mt-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Previous Version
                    </p>
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-[11px] uppercase text-slate-400">Title</p>
                        <p className="text-sm text-slate-700">
                          {reviewDetails?.title ?? reviewPaper.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase text-slate-400">Abstract</p>
                        <p className="text-sm text-slate-700">
                          {reviewDetails?.abstract || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase text-slate-400">Hashtags</p>
                        <p className="text-sm text-slate-700">
                          {formatChangeValue(
                            reviewDetails?.keywords ?? reviewPaper.keywords ?? []
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase text-slate-400">Authors</p>
                        <p className="text-sm text-slate-700">
                          {getAuthorNames(
                            reviewDetails?.author_profiles ?? reviewPaper.author_profiles
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase text-slate-400">References</p>
                        <p className="text-sm text-slate-700">
                          {reviewReferences.length > 0
                            ? reviewReferences.map((paper) => paper.title).join(", ")
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 text-sm text-slate-600">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                      Updated Version
                    </p>
                    <div className="mt-3 space-y-2">
                      <div>
                        <p className="text-[11px] uppercase text-emerald-700/70">
                          Title
                        </p>
                        <p
                          className={`text-sm ${
                            reviewChangeRequest.proposed_data?.title !== undefined &&
                            normalizeString(reviewChangeRequest.proposed_data?.title) !==
                              normalizeString(reviewDetails?.title ?? reviewPaper.title)
                              ? "text-red-600"
                              : "text-slate-700"
                          }`}
                        >
                          {formatChangeValue(reviewChangeRequest.proposed_data?.title)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase text-emerald-700/70">
                          Abstract
                        </p>
                        <p
                          className={`text-sm ${
                            reviewChangeRequest.proposed_data?.abstract !== undefined &&
                            normalizeString(reviewChangeRequest.proposed_data?.abstract) !==
                              normalizeString(reviewDetails?.abstract)
                              ? "text-red-600"
                              : "text-slate-700"
                          }`}
                        >
                          {formatChangeValue(
                            reviewChangeRequest.proposed_data?.abstract
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase text-emerald-700/70">
                          Hashtags
                        </p>
                        <p
                          className={`text-sm ${
                            reviewChangeRequest.proposed_data?.keywords !== undefined &&
                            normalizeList(reviewChangeRequest.proposed_data?.keywords) !==
                              normalizeList(
                                reviewDetails?.keywords ?? reviewPaper.keywords ?? []
                              )
                              ? "text-red-600"
                              : "text-slate-700"
                          }`}
                        >
                          {formatChangeValue(
                            reviewChangeRequest.proposed_data?.keywords
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase text-emerald-700/70">
                          Authors
                        </p>
                        <p
                          className={`text-sm ${
                            reviewChangeRequest.proposed_data?.authors !== undefined &&
                            resolveAuthorNames(
                              reviewChangeRequest.proposed_data?.authors
                            ).trim() !==
                              getAuthorNames(
                                reviewDetails?.author_profiles ??
                                  reviewPaper.author_profiles
                              ).trim()
                              ? "text-red-600"
                              : "text-slate-700"
                          }`}
                        >
                          {resolveAuthorNames(reviewChangeRequest.proposed_data?.authors)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase text-emerald-700/70">
                          References
                        </p>
                        <p
                          className={`text-sm ${
                            reviewChangeRequest.proposed_data?.cited_paper_ids !==
                              undefined &&
                            resolveReferenceTitles(
                              reviewChangeRequest.proposed_data?.cited_paper_ids
                            ).trim() !==
                              (reviewReferences.length > 0
                                ? reviewReferences.map((paper) => paper.title).join(", ")
                                : "—")
                              ? "text-red-600"
                              : "text-slate-700"
                          }`}
                        >
                          {resolveReferenceTitles(
                            reviewChangeRequest.proposed_data?.cited_paper_ids
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase text-emerald-700/70">
                          Proposed PDF
                        </p>
                        {reviewChangeRequest.proposed_pdf ? (
                          <a
                            href={reviewChangeRequest.proposed_pdf}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-red-600 hover:underline"
                          >
                            View uploaded PDF
                          </a>
                        ) : (
                          <p className="text-sm text-slate-600">—</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Abstract
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {reviewDetails?.abstract || "No abstract provided."}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Hashtags
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(reviewDetails?.keywords ?? reviewPaper.keywords ?? []).length > 0 ? (
                      (reviewDetails?.keywords ?? reviewPaper.keywords ?? []).map((tag) => (
                        <span
                          key={`review-tag-${tag}`}
                          className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No hashtags.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Dates
                  </p>
                  <div className="mt-2 space-y-2 text-sm text-slate-600">
                    <p>Submitted {formatDate(reviewPaper.created_date)}</p>
                    {hasBeenEdited(reviewPaper.created_date, reviewPaper.updated_date) ? (
                      <p>Updated {formatDate(reviewPaper.updated_date)}</p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Manuscript
                  </p>
                  <div className="mt-2 space-y-2 text-sm text-slate-600">
                    {reviewDetails?.formatted_pdf || reviewDetails?.pdf_file ? (
                      <a
                        href={
                          reviewDetails?.formatted_pdf ??
                          reviewDetails?.pdf_file ??
                          "#"
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                      >
                        View formatted PDF
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No PDF uploaded.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    DOI (Optional)
                  </p>
                  <input
                    value={reviewDoi}
                    onChange={(event) => setReviewDoi(event.target.value)}
                    placeholder="10.xxxx/xxxxx"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Provide a DOI before approving, if available.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    References
                  </p>
                  {reviewReferences.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {reviewReferences.map((paper) => (
                        <div
                          key={`review-ref-${paper.id}`}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">{paper.title}</p>
                            <p className="text-[11px] text-slate-500">
                              {getAuthorNames(paper.author_profiles)}
                            </p>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(paper.published_date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">
                      No references provided.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {reviewChangeRequest ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleApproveChange(reviewPaper, reviewChangeRequest)}
                    disabled={actionLoading === reviewPaper.id}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {actionLoading === reviewPaper.id ? "Saving..." : "Approve Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectChangeRequest(reviewChangeRequest);
                      setRejectReason("");
                    }}
                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    Reject Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleApprove(reviewPaper)}
                    disabled={actionLoading === reviewPaper.id}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {actionLoading === reviewPaper.id ? "Saving..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectMode("reject");
                      setRejectTarget(reviewPaper);
                    }}
                    className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

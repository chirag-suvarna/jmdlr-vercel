"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProfileDropdown from "@/components/ProfileDropdown";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const normalizeProfileUrl = useCallback((value?: string | null) => {
    if (!value) return null;
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(
      /\/$/,
      ""
    );
    const hostBase = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;
    if (value.startsWith("/")) {
      return `${hostBase}${value}`;
    }
    return `${hostBase}/${value}`;
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("jmdlr_token");
    localStorage.removeItem("jmdlr_refresh");
    localStorage.removeItem("jmdlr_username");
    localStorage.removeItem("jmdlr_profile_picture");
    setUserName(null);
    setProfileImage(null);
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      const cachedName = localStorage.getItem("jmdlr_username");
      setUserName(cachedName || null);
      const cachedImage = localStorage.getItem("jmdlr_profile_picture");
      setProfileImage(cachedImage || null);
    };
    window.addEventListener("jmdlr-profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("jmdlr-profile-updated", handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("jmdlr_token");
    if (token && token.includes(".")) {
      clearAuth();
      return;
    }
    const cachedName = localStorage.getItem("jmdlr_username");
    if (cachedName) {
      setUserName(cachedName);
    }
    const cachedImage = normalizeProfileUrl(
      localStorage.getItem("jmdlr_profile_picture")
    );
    if (cachedImage) {
      setProfileImage(cachedImage);
    }
    if (!token) {
      return;
    }
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(
      /\/$/,
      ""
    );
    fetch(`${apiBase}/auth/profile/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          clearAuth();
          return null;
        }
        if (!response.ok) return null;
        return response.json() as Promise<{
          username?: string;
          first_name?: string;
          last_name?: string;
          profile_picture?: string | null;
          is_staff?: boolean;
        }>;
      })
      .then((profile) => {
        if (!profile) return;
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        const name = fullName || profile.username || cachedName;
        if (name) {
          localStorage.setItem("jmdlr_username", name);
          setUserName(name);
        }
        const profilePicture = normalizeProfileUrl(profile.profile_picture || cachedImage);
        if (profilePicture) {
          localStorage.setItem("jmdlr_profile_picture", profilePicture);
          setProfileImage(profilePicture);
        }
        setIsAdmin(Boolean(profile.is_staff));
      })
      .catch(() => null);
  }, [normalizeProfileUrl, clearAuth]);

  const handleLogout = async () => {
    const token = localStorage.getItem("jmdlr_token");
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(
      /\/$/,
      ""
    );
    clearAuth();
    router.push("/auth");
    router.refresh();

    if (!token) {
      return;
    }

    fetch(`${apiBase}/auth/logout/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
    }).catch(() => null);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };
  const hideLoginCta = pathname.startsWith("/auth");

  return (
    <header className="relative z-50 h-[70px] border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-90)] shadow-[var(--shadow-card)] backdrop-blur">
      <nav className="mx-auto flex h-full max-w-[1100px] items-center justify-between px-6">
        <div className="flex items-center gap-6 text-sm font-semibold text-[color:var(--color-text-secondary)]">
          <a
            href="/"
            className={`inline-flex items-center ${
              isActive("/") ? "text-[color:var(--color-accent)]" : ""
            }`}
            aria-label="Home"
          >
            <svg
              aria-hidden
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 11l9-7 9 7" />
              <path d="M5 10v10h14V10" />
            </svg>
          </a>
          <a
            href="/about"
            className={`transition hover:text-[color:var(--color-text-primary)] ${
              isActive("/about") ? "text-[color:var(--color-accent)]" : ""
            }`}
          >
            About Us
          </a>
          <a
            href="/papers"
            className={`transition hover:text-[color:var(--color-text-primary)] ${
              isActive("/papers") ? "text-[color:var(--color-accent)]" : ""
            }`}
          >
            Papers
          </a>
        </div>
        {userName ? (
          <ProfileDropdown
            userName={userName}
            profileImage={profileImage}
            isAdmin={isAdmin}
            onLogout={handleLogout}
          />
        ) : hideLoginCta ? null : (
          <a
            href="/auth"
            className="rounded-full border border-transparent bg-[color:var(--color-accent)] px-4 py-1.5 text-sm font-semibold text-[color:var(--color-bg-primary)] transition hover:bg-[color:var(--color-accent-hover)]"
          >
            Login
          </a>
        )}
      </nav>
    </header>
  );
}

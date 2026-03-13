"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileDropdownProps = {
  userName: string;
  profileImage?: string | null;
  isAdmin?: boolean;
  onLogout: () => void;
};

type MenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
};

const UserIcon = () => (
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
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" />
  </svg>
);

const FileIcon = () => (
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
    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

const BookmarkIcon = () => (
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
    <path d="M6 4h12a2 2 0 0 1 2 2v16l-8-4-8 4V6a2 2 0 0 1 2-2z" />
  </svg>
);

const ShieldIcon = () => (
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
    <path d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" />
  </svg>
);

const LogoutIcon = () => (
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
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export default function ProfileDropdown({
  userName,
  profileImage,
  isAdmin,
  onLogout,
}: ProfileDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const menuItems = useMemo<MenuItem[]>(() => {
    const items: MenuItem[] = [
      {
        key: "profile",
        label: "Profile",
        icon: <UserIcon />,
        onSelect: () => router.push("/settings"),
      },
      {
        key: "papers",
        label: "My Papers",
        icon: <FileIcon />,
        onSelect: () => router.push("/dashboard"),
      },
      {
        key: "bookmarks",
        label: "Bookmarks",
        icon: <BookmarkIcon />,
        onSelect: () => router.push("/bookmarks"),
      },
    ];

    if (isAdmin) {
      items.splice(2, 0, {
        key: "admin",
        label: "Settings",
        icon: <ShieldIcon />,
        onSelect: () => router.push("/admin-dashboard"),
      });
    }

    items.push({
      key: "logout",
      label: "Logout",
      icon: <LogoutIcon />,
      onSelect: onLogout,
    });

    return items;
  }, [isAdmin, onLogout, router]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeMenu]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeMenu]);

  useEffect(() => {
    if (!open) return;
    const first = itemRefs.current[0];
    first?.focus();
  }, [open]);

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current.filter(Boolean);
    if (items.length === 0) return;
    const currentIndex = items.findIndex(
      (item) => item === document.activeElement
    );
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = (currentIndex + 1) % items.length;
      items[next]?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = (currentIndex - 1 + items.length) % items.length;
      items[next]?.focus();
    }
    if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    }
    if (event.key === "End") {
      event.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-90)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-primary)]"
      >
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <UserIcon />
          )}
        </span>
        <span>{userName}</span>
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
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        ref={menuRef}
        role="menu"
        aria-hidden={!open}
        onKeyDown={handleMenuKeyDown}
        className={`absolute right-0 z-50 mt-3 w-64 rounded-[16px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-secondary-90)] p-2 shadow-[var(--shadow-soft)] backdrop-blur transition duration-200 ease-out ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-3">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-primary)]">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <UserIcon />
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
              {userName}
            </p>
            <p className="text-xs text-[color:var(--color-text-secondary)]">
              {isAdmin ? "Administrator" : "Member"}
            </p>
          </div>
        </div>
        <div className="my-3 h-px bg-[color:var(--color-border)]" />
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={item.key}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left text-sm font-medium text-[color:var(--color-text-secondary)] transition duration-200 hover:bg-[color:var(--color-bg-surface)] hover:text-[color:var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
            >
              <span className="text-[color:var(--color-text-secondary)]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

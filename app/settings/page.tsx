"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type ProfileResponse = {
  username?: string;
  email?: string;
  pending_email?: string | null;
  pending_phone_number?: string | null;
  first_name?: string;
  last_name?: string;
  bio?: string;
  affiliation?: string;
  research_interests?: string[] | null;
  orcid?: string | null;
  linkedin?: string | null;
  google_scholar?: string | null;
  profile_picture?: string | null;
  phone_number?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  detail?: string;
  error?: string;
  [key: string]: unknown;
};

const apiBase =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(
        /\/$/,
        ""
      )
    : "http://localhost:8000/api";

const normalizeProfileUrl = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  const hostBase = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;
  if (value.startsWith("/")) {
    return `${hostBase}${value}`;
  }
  return `${hostBase}/${value}`;
};

const createBlankForm = () => ({
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  affiliation: "",
  bio: "",
  research_interests: "",
  orcid: "",
  linkedin: "",
  google_scholar: "",
});

export default function SettingsPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [initialUsername, setInitialUsername] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [currentPhone, setCurrentPhone] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const [phoneStatus, setPhoneStatus] = useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [phoneMessage, setPhoneMessage] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [form, setForm] = useState(createBlankForm());
  const [initialForm, setInitialForm] = useState(createBlankForm());
  const [researchDraft, setResearchDraft] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant?: "success" | "error";
  } | null>(null);

  const researchTags = useMemo(() => {
    return form.research_interests
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  }, [form.research_interests]);

  const addResearchTag = () => {
    const next = researchDraft.trim();
    if (!next) return;
    const tags = new Set([...researchTags, next]);
    setForm((prev) => ({ ...prev, research_interests: Array.from(tags).join(", ") }));
    setResearchDraft("");
  };

  const removeResearchTag = (tag: string) => {
    const next = researchTags.filter((item) => item !== tag);
    setForm((prev) => ({ ...prev, research_interests: next.join(", ") }));
  };

  const resetPasswordForm = () => {
    setOldPassword("");
    setPassword("");
    setConfirmPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordMessage(null);
  };

  const passwordRules = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
    };
  }, [password]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handlePasswordSubmit = async () => {
    if (passwordSaving) return;
    setPasswordMessage(null);
    if (!oldPassword.trim()) {
      setPasswordMessage("Please enter your current password.");
      return;
    }
    if (!password.trim() || !confirmPassword.trim()) {
      setPasswordMessage("Please provide both new password fields.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      setPasswordMessage("Please log in again to update your password.");
      return;
    }
    setPasswordSaving(true);
    try {
      const response = await fetch(`${apiBase}/users/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: password,
          confirm_password: confirmPassword,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        const firstError =
          (Array.isArray(payload?.detail) ? payload.detail[0] : payload?.detail) ||
          (Array.isArray(payload?.old_password)
            ? payload.old_password[0]
            : payload?.old_password) ||
          (Array.isArray(payload?.new_password)
            ? payload.new_password[0]
            : payload?.new_password) ||
          (Array.isArray(payload?.confirm_password)
            ? payload.confirm_password[0]
            : payload?.confirm_password);
        throw new Error(
          typeof firstError === "string"
            ? firstError
            : "Unable to update password."
        );
      }
      setPasswordMessage("Password updated successfully.");
      setToast({ message: "Password updated successfully.", variant: "success" });
      setTimeout(() => {
        setShowPasswordModal(false);
        resetPasswordForm();
      }, 800);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Unable to update password.";
      setPasswordMessage(reason);
    } finally {
      setPasswordSaving(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const response = await fetch(`${apiBase}/users/me/`, {
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
        const payload = (await response.json()) as ProfileResponse;
        if (cancelled) return;
        const loadedUsername = payload.username ?? "";
        const loadedEmail = payload.email ?? "";
        const loadedPending = payload.pending_email ?? "";
        const loadedPhonePending = payload.pending_phone_number ?? "";
        setUsername(loadedUsername);
        setInitialUsername(loadedUsername);
        setCurrentEmail(loadedEmail);
        setPendingEmail(loadedPending);
        setCurrentPhone(payload.phone_number ?? "");
        setPendingPhone(loadedPhonePending);
        const displayEmail = loadedPending || loadedEmail;
        setInitialEmail(displayEmail);
        const displayPhone = loadedPhonePending || payload.phone_number || "";
        setInitialPhone(displayPhone);
        setUsernameStatus("idle");
        setEmailStatus("idle");
        setPhoneStatus("idle");
        setUsernameMessage("");
        setEmailMessage("");
        setPhoneMessage("");
        setVerificationMessage("");
        setForm({
          first_name: payload.first_name ?? "",
          last_name: payload.last_name ?? "",
          email: displayEmail,
          phone_number: displayPhone,
          affiliation: payload.affiliation ?? "",
          bio: payload.bio ?? "",
          research_interests: Array.isArray(payload.research_interests)
            ? payload.research_interests.join(", ")
            : "",
          orcid: payload.orcid ?? "",
          linkedin: payload.linkedin ?? "",
          google_scholar: payload.google_scholar ?? "",
        });
        setInitialForm({
          first_name: payload.first_name ?? "",
          last_name: payload.last_name ?? "",
          email: displayEmail,
          phone_number: displayPhone,
          affiliation: payload.affiliation ?? "",
          bio: payload.bio ?? "",
          research_interests: Array.isArray(payload.research_interests)
            ? payload.research_interests.join(", ")
            : "",
          orcid: payload.orcid ?? "",
          linkedin: payload.linkedin ?? "",
          google_scholar: payload.google_scholar ?? "",
        });
        setResearchDraft("");
        setProfileImageUrl(normalizeProfileUrl(payload.profile_picture));
      } catch (error) {
        if (!cancelled) {
          const reason =
            error instanceof Error ? error.message : "Unable to load profile.";
          setMessage(reason);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!profileImage) {
      setProfilePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(profileImage);
    setProfilePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImage]);

  useEffect(() => {
    if (loading) return;
    const value = username.trim();
    if (!value) {
      setUsernameStatus("unavailable");
      setUsernameMessage("Username is required.");
      return;
    }
    if (value === initialUsername) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }
    setUsernameStatus("checking");
    setUsernameMessage("Checking availability...");
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${apiBase}/users/check-username/?username=${encodeURIComponent(
            value
          )}`,
          { signal: controller.signal }
        );
        const data = (await response.json()) as { available?: boolean; detail?: string };
        if (!response.ok || data.available === false) {
          setUsernameStatus("unavailable");
          setUsernameMessage(data.detail || "Username is not available.");
          return;
        }
        setUsernameStatus("available");
        setUsernameMessage("Username is available.");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setUsernameStatus("unavailable");
        setUsernameMessage("Unable to validate username.");
      }
    }, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [username, initialUsername, loading]);

  useEffect(() => {
    if (loading) return;
    const value = form.email.trim();
    if (!value) {
      setEmailStatus("unavailable");
      setEmailMessage("Email is required.");
      return;
    }
    if (value === initialEmail) {
      setEmailStatus("idle");
      setEmailMessage("");
      return;
    }
    setEmailStatus("checking");
    setEmailMessage("Checking availability...");
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${apiBase}/users/check-email/?email=${encodeURIComponent(value)}`,
          { signal: controller.signal }
        );
        const data = (await response.json()) as { available?: boolean; detail?: string };
        if (!response.ok || data.available === false) {
          setEmailStatus("unavailable");
          setEmailMessage(data.detail || "Email is already registered.");
          return;
        }
        setEmailStatus("available");
        setEmailMessage("Email is available.");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setEmailStatus("unavailable");
        setEmailMessage("Unable to validate email.");
      }
    }, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [form.email, initialEmail, loading]);

  useEffect(() => {
    if (loading) return;
    const value = form.phone_number.trim();
    if (!value) {
      setPhoneStatus("idle");
      setPhoneMessage("");
      return;
    }
    setPhoneStatus("checking");
    setPhoneMessage("Checking availability...");
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${apiBase}/users/check-phone/?phone=${encodeURIComponent(value)}`,
          { signal: controller.signal }
        );
        const data = (await response.json()) as { available?: boolean; detail?: string };
        if (!response.ok || data.available === false) {
          setPhoneStatus("unavailable");
          setPhoneMessage(data.detail || "Phone number is already registered.");
          return;
        }
        setPhoneStatus("available");
        setPhoneMessage("Phone number is available.");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setPhoneStatus("unavailable");
        setPhoneMessage("Unable to validate phone number.");
      }
    }, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [form.phone_number, loading]);

  const emailNeedsVerification =
    Boolean(pendingEmail) && form.email.trim() === pendingEmail;
  const phoneNeedsVerification =
    Boolean(pendingPhone) && form.phone_number.trim() === pendingPhone;
  const showEmailMessage =
    emailStatus !== "idle" &&
    (emailStatus !== "unavailable" || emailTouched);

  const handleVerifyEmail = async () => {
    setVerificationMessage("");
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    setVerifying(true);
    try {
      const response = await fetch(`${apiBase}/auth/verify-email/request/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setVerificationMessage(data.error || "Unable to send verification email.");
      } else {
        setVerificationMessage(data.message || "Verification email sent.");
      }
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Unable to send verification email.";
      setVerificationMessage(reason);
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyPhone = async () => {
    setVerificationMessage("");
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    setVerifyingPhone(true);
    try {
      const response = await fetch(`${apiBase}/auth/verify-phone/request/`, {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        setVerificationMessage(data.error || "Unable to send phone verification.");
      } else {
        setVerificationMessage(data.message || "Phone verification requested.");
      }
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Unable to send phone verification.";
      setVerificationMessage(reason);
    } finally {
      setVerifyingPhone(false);
    }
  };

  const updateField =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const extractError = (payload: ProfileResponse) => {
    if (payload.error || payload.detail) {
      return String(payload.error || payload.detail);
    }
    for (const value of Object.values(payload)) {
      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
    return "Unable to update profile.";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }

    if (!username.trim()) {
      setMessage("Username is required.");
      return;
    }
    if (!form.email.trim()) {
      setMessage("Email is required.");
      return;
    }
    if (
      usernameStatus === "checking" ||
      emailStatus === "checking" ||
      phoneStatus === "checking"
    ) {
      setMessage("Please wait for validation to complete.");
      return;
    }
    if (usernameStatus === "unavailable") {
      setMessage(usernameMessage || "Username is not available.");
      return;
    }
    if (emailStatus === "unavailable") {
      setMessage(emailMessage || "Email is already registered.");
      return;
    }
    if (phoneStatus === "unavailable") {
      setMessage(phoneMessage || "Phone number is already registered.");
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("username", username.trim());
      payload.append("first_name", form.first_name);
      payload.append("last_name", form.last_name);
      payload.append("email", form.email);
      payload.append("phone_number", form.phone_number);
      payload.append("affiliation", form.affiliation);
      payload.append("bio", form.bio);
      const interests = form.research_interests
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      payload.append("research_interests", JSON.stringify(interests));
      payload.append("orcid", form.orcid);
      payload.append("linkedin", form.linkedin);
      payload.append("google_scholar", form.google_scholar);

      if (profileImage) {
        payload.append("profile_picture", profileImage);
      }

      const response = await fetch(`${apiBase}/users/me/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}` },
        body: payload,
      });
      const data = (await response.json()) as ProfileResponse;
      if (!response.ok) {
        setMessage(extractError(data));
        return;
      }

      setForm({
        first_name: data.first_name ?? form.first_name,
        last_name: data.last_name ?? form.last_name,
        email: (data.pending_email ?? "") || (data.email ?? form.email),
        phone_number:
          (data.pending_phone_number ?? "") ||
          (data.phone_number ?? form.phone_number),
        affiliation: data.affiliation ?? form.affiliation,
        bio: data.bio ?? form.bio,
        research_interests: Array.isArray(data.research_interests)
          ? data.research_interests.join(", ")
          : form.research_interests,
        orcid: data.orcid ?? form.orcid,
        linkedin: data.linkedin ?? form.linkedin,
        google_scholar: data.google_scholar ?? form.google_scholar,
      });
      setInitialForm({
        first_name: data.first_name ?? form.first_name,
        last_name: data.last_name ?? form.last_name,
        email: (data.pending_email ?? "") || (data.email ?? form.email),
        phone_number:
          (data.pending_phone_number ?? "") ||
          (data.phone_number ?? form.phone_number),
        affiliation: data.affiliation ?? form.affiliation,
        bio: data.bio ?? form.bio,
        research_interests: Array.isArray(data.research_interests)
          ? data.research_interests.join(", ")
          : form.research_interests,
        orcid: data.orcid ?? form.orcid,
        linkedin: data.linkedin ?? form.linkedin,
        google_scholar: data.google_scholar ?? form.google_scholar,
      });
      setResearchDraft("");

      if (data.profile_picture) {
        const resolved = normalizeProfileUrl(data.profile_picture);
        setProfileImageUrl(resolved);
        setProfileImage(null);
        if (resolved) {
          localStorage.setItem("jmdlr_profile_picture", resolved);
        }
      }

      const name = [data.first_name, data.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
      const resolvedUsername = data.username ?? username;
      setUsername(resolvedUsername);
      setInitialUsername(resolvedUsername);
      const resolvedCurrentEmail = data.email ?? currentEmail;
      const resolvedPendingEmail = data.pending_email ?? "";
      const resolvedCurrentPhone = data.phone_number ?? currentPhone;
      const resolvedPendingPhone = data.pending_phone_number ?? "";
      setCurrentEmail(resolvedCurrentEmail);
      setPendingEmail(resolvedPendingEmail);
      const displayEmail = resolvedPendingEmail || resolvedCurrentEmail || form.email;
      setInitialEmail(displayEmail);
      setCurrentPhone(resolvedCurrentPhone);
      setPendingPhone(resolvedPendingPhone);
      const displayPhone =
        resolvedPendingPhone || resolvedCurrentPhone || form.phone_number;
      setInitialPhone(displayPhone);
      setForm((prev) => ({ ...prev, email: displayEmail }));
      setInitialPhone(data.phone_number ?? form.phone_number);
      if (name || resolvedUsername) {
        localStorage.setItem("jmdlr_username", name || resolvedUsername);
        window.dispatchEvent(new Event("jmdlr-profile-updated"));
      }

      setMessage("Profile updated successfully.");
      setToast({ message: "Profile updated successfully.", variant: "success" });
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Unable to update profile.";
      setMessage(reason);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setUsername(initialUsername);
    setProfileImage(null);
    setProfilePreviewUrl(null);
    setUsernameStatus("idle");
    setEmailStatus("idle");
    setPhoneStatus("idle");
    setUsernameMessage("");
    setEmailMessage("");
    setPhoneMessage("");
    setUsernameTouched(false);
    setEmailTouched(false);
    setPhoneTouched(false);
    setMessage(null);
    setVerificationMessage("");
    setResearchDraft("");
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-[1050px] space-y-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--color-text-secondary)] shadow-sm">
              Account Settings
            </span>
            <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
              Update your profile details, contact information, and security
              preferences.
            </p>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-60)] p-6 shadow-[var(--shadow-card)] sm:p-8"
          >
            {message ? (
              <div className="mb-6 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-2 text-xs text-[color:var(--color-text-primary)]">
                {message}
              </div>
            ) : null}
            {verificationMessage ? (
              <div className="mb-6 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-2 text-xs text-[color:var(--color-text-primary)]">
                {verificationMessage}
              </div>
            ) : null}

            {loading ? (
              <div className="text-sm text-[color:var(--color-text-secondary)]">
                Loading profile...
              </div>
            ) : (
              <div className="space-y-8">
                <section className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                      Profile
                    </h2>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-[120px_1fr]">
                    <div>
                      <div className="mt-3 flex flex-col items-start gap-3">
                        <label className="relative cursor-pointer">
                          <div className="h-22 w-22 h-[88px] w-[88px] overflow-hidden rounded-full border-2 border-[color:var(--pearl-aqua)] bg-[color:var(--color-bg-secondary-70)]">
                            {profilePreviewUrl || profileImageUrl ? (
                              <img
                                src={profilePreviewUrl || profileImageUrl || ""}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-[color:var(--color-text-secondary)]">
                                No photo
                              </div>
                            )}
                          </div>
                          <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--pearl-aqua)] bg-[color:var(--color-bg-secondary-60)] text-xs font-semibold text-[color:var(--color-text-primary)] shadow-sm">
                            +
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) =>
                              setProfileImage(event.target.files?.[0] || null)
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                          First Name
                        </label>
                        <input
                          value={form.first_name}
                          onChange={updateField("first_name")}
                          className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                          Last Name
                        </label>
                        <input
                          value={form.last_name}
                          onChange={updateField("last_name")}
                          className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                          Email
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={updateField("email")}
                          onBlur={() => setEmailTouched(true)}
                          className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                        />
                        {showEmailMessage ? (
                          <p
                            className={`mt-1 text-xs ${
                              emailStatus === "available"
                                ? "text-[color:var(--color-accent)]"
                                : emailStatus === "checking"
                                ? "text-[color:var(--color-text-secondary)]"
                                : "text-[color:var(--rusty-spice)]"
                            }`}
                          >
                            {emailMessage}
                          </p>
                        ) : null}
                        {emailNeedsVerification ? (
                          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[color:var(--rusty-spice)]">
                            <span className="inline-flex items-center gap-2">
                              <span aria-hidden>⚠</span>
                              Email not verified
                            </span>
                            <button
                              type="button"
                              onClick={handleVerifyEmail}
                              disabled={verifying}
                              className="rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-3 py-1 text-[11px] font-semibold text-[color:var(--wheat)] transition hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {verifying ? "Sending..." : "Verify"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                          Phone
                        </label>
                        <input
                          value={form.phone_number}
                          onChange={updateField("phone_number")}
                          onBlur={() => setPhoneTouched(true)}
                          className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                        />
                        {phoneTouched && phoneStatus !== "idle" ? (
                          <p
                            className={`mt-1 text-xs ${
                              phoneStatus === "available"
                                ? "text-[color:var(--color-accent)]"
                                : phoneStatus === "checking"
                                ? "text-[color:var(--color-text-secondary)]"
                                : "text-[color:var(--rusty-spice)]"
                            }`}
                          >
                            {phoneMessage}
                          </p>
                        ) : null}
                        {phoneNeedsVerification ? (
                          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[color:var(--rusty-spice)]">
                            <span className="inline-flex items-center gap-2">
                              <span aria-hidden>⚠</span>
                              Phone not verified
                            </span>
                            <button
                              type="button"
                              onClick={handleVerifyPhone}
                              disabled={verifyingPhone}
                              className="rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-3 py-1 text-[11px] font-semibold text-[color:var(--wheat)] transition hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {verifyingPhone ? "Sending..." : "Verify"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-[color:var(--color-border)]/70" />

                <section className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                      Academic
                    </h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                        Affiliation
                      </label>
                      <input
                        value={form.affiliation}
                        onChange={updateField("affiliation")}
                        className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                        Bio
                      </label>
                      <textarea
                        value={form.bio}
                        onChange={updateField("bio")}
                        rows={4}
                        className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                        Research Interests
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {researchTags.length > 0 ? (
                          researchTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-surface)] px-3 py-1 text-xs text-[color:var(--color-text-primary)]"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeResearchTag(tag)}
                                className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[color:var(--color-text-secondary)]">
                            No interests added yet.
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <input
                          value={researchDraft}
                          onChange={(event) => setResearchDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addResearchTag();
                            }
                          }}
                          placeholder="Add research interest"
                          className="flex-1 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                        />
                        <button
                          type="button"
                          onClick={addResearchTag}
                          className="rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-4 py-2 text-xs font-semibold text-[color:var(--wheat)] shadow-sm transition hover:bg-[color:var(--color-accent-hover)]"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                        ORCID
                      </label>
                      <input
                        value={form.orcid}
                        onChange={updateField("orcid")}
                        className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                        LinkedIn
                      </label>
                      <input
                        value={form.linkedin}
                        onChange={updateField("linkedin")}
                        className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                        Google Scholar
                      </label>
                      <input
                        value={form.google_scholar}
                        onChange={updateField("google_scholar")}
                        className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                      />
                    </div>
                  </div>
                </section>

                <div className="h-px bg-[color:var(--color-border)]/70" />

                <section className="space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                      Security
                    </h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                        Username
                      </label>
                      <input
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        onBlur={() => setUsernameTouched(true)}
                        className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                        readOnly
                      />
                      {usernameTouched && usernameStatus !== "idle" ? (
                        <p
                          className={`mt-1 text-xs ${
                            usernameStatus === "available"
                              ? "text-[color:var(--color-accent)]"
                              : usernameStatus === "checking"
                              ? "text-[color:var(--color-text-secondary)]"
                              : "text-[color:var(--rusty-spice)]"
                          }`}
                        >
                          {usernameMessage}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                        Password
                      </label>
                      <p className="text-xs text-[color:var(--color-text-secondary)]">
                        Update your account password.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordMessage(null);
                          setShowPasswordModal(true);
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-[color:var(--pearl-aqua)] bg-transparent px-4 py-2 text-sm font-semibold text-[color:var(--wheat)] transition hover:bg-[color:var(--color-bg-surface)]"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </section>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[color:var(--color-border)]/70 pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full border border-[color:var(--pearl-aqua)] bg-transparent px-5 py-2 text-sm font-semibold text-[color:var(--wheat)] transition hover:border-[color:var(--color-border-strong)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-5 py-2 text-sm font-semibold text-[color:var(--wheat)] shadow-sm transition hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
      <Footer />

      {showPasswordModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--color-bg-primary-60)] px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-[480px] rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary)] p-6 text-[color:var(--color-text-primary)] shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  resetPasswordForm();
                }}
                className="text-sm text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                  Old Password
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(event) => setOldPassword(event.target.value)}
                    className="w-full bg-transparent text-sm text-[color:var(--color-text-primary)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    className="text-xs font-semibold text-[color:var(--color-text-secondary)]"
                  >
                    {showOldPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                  New Password
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-sm text-[color:var(--color-text-primary)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="text-xs font-semibold text-[color:var(--color-text-secondary)]"
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <p
                    className={
                      passwordRules.length
                        ? "text-[color:var(--color-text-secondary)]"
                        : "text-[color:var(--rusty-spice)]"
                    }
                  >
                    At least 8 characters
                  </p>
                  <p
                    className={
                      passwordRules.uppercase
                        ? "text-[color:var(--color-text-secondary)]"
                        : "text-[color:var(--rusty-spice)]"
                    }
                  >
                    One uppercase letter
                  </p>
                  <p
                    className={
                      passwordRules.number
                        ? "text-[color:var(--color-text-secondary)]"
                        : "text-[color:var(--rusty-spice)]"
                    }
                  >
                    One number
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                  Confirm Password
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full bg-transparent text-sm text-[color:var(--color-text-primary)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="text-xs font-semibold text-[color:var(--color-text-secondary)]"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              {passwordMessage ? (
                <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-3 py-2 text-xs text-[color:var(--color-text-primary)]">
                  {passwordMessage}
                </div>
              ) : null}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  resetPasswordForm();
                }}
                className="rounded-full border border-[color:var(--pearl-aqua)] bg-transparent px-4 py-2 text-sm font-semibold text-[color:var(--wheat)] transition hover:bg-[color:var(--color-bg-surface)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePasswordSubmit}
                disabled={passwordSaving}
                className="rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-[color:var(--wheat)] shadow-sm transition hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordSaving ? "Saving..." : "Save Password"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? (
        <div className="fixed top-4 right-4 z-[60]">
          <div
            role="status"
            aria-live="polite"
            className={`rounded-2xl border px-4 py-3 text-xs shadow-lg backdrop-blur ${
              toast.variant === "error"
                ? "border-[color:var(--color-danger)]/60 bg-[color:var(--color-danger)]/15 text-[color:var(--color-text-primary)]"
                : "border-[color:var(--color-accent)]/50 bg-[color:var(--color-bg-secondary-70)] text-[color:var(--color-text-primary)]"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}

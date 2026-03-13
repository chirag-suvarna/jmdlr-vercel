"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Mode = "login" | "register";

type ApiResponse = {
  token?: string;
  error?: string;
  detail?: string;
  [key: string]: unknown;
};

const apiBase =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(
        /\/$/,
        ""
      )
    : "http://localhost:8000/api";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);
  const router = useRouter();

  const resetMessages = () => setMessage(null);

  useEffect(() => {
    const token = localStorage.getItem("jmdlr_token");
    if (token && token.includes(".")) {
      localStorage.removeItem("jmdlr_token");
      localStorage.removeItem("jmdlr_refresh");
      localStorage.removeItem("jmdlr_username");
      return undefined;
    }
    if (token) {
      const timer = window.setTimeout(() => {
        router.replace("/");
      }, 1000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [router]);

  const parseResponse = async (response: Response): Promise<ApiResponse> => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text) as ApiResponse;
    } catch {
      return { error: text };
    }
  };

  const getFirstError = (payload: ApiResponse) => {
    if (payload.error || payload.detail) {
      return payload.error || payload.detail;
    }
    for (const value of Object.values(payload)) {
      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      if (mode === "login") {
        const response = await fetch(`${apiBase}/auth/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: identifier.trim(),
            password,
          }),
        });

        const payload = await parseResponse(response);
        if (!response.ok) {
          setMessage(getFirstError(payload) || "Unable to log in.");
          return;
        }

        const authToken =
          (payload.token as string | undefined) ||
          (payload.access as string | undefined);
        if (authToken) {
          localStorage.setItem("jmdlr_token", authToken);
        }
        if (payload.refresh) {
          localStorage.setItem("jmdlr_refresh", String(payload.refresh));
        }
        if (payload.username) {
          localStorage.setItem("jmdlr_username", String(payload.username));
        }
        setMessage("Login successful. Redirecting...");
        router.push("/");
        router.refresh();
      } else {
        const response = await fetch(`${apiBase}/auth/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password,
            confirm_password: confirmPassword,
          }),
        });

        const payload = await parseResponse(response);
        if (!response.ok) {
          setMessage(getFirstError(payload) || "Unable to create your account.");
          return;
        }

        setMessage(
          "Registration complete. Check your email to verify your account."
        );
        setMode("login");
      }
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : "Unable to reach the server.";
      setMessage(`Unable to reach the API at ${apiBase}. ${reason}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--color-bg-secondary)] text-[color:var(--color-text-primary)]">
      <Navbar />
      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="relative">
            <div className="auth-glow" />
            <div className="grid gap-10 rounded-[24px] border border-[rgba(148,210,189,0.2)] bg-[rgba(0,95,115,0.35)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-[20px] sm:p-10 lg:grid-cols-[1.1fr_1fr]">
              <div className="flex flex-col justify-between gap-8">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(148,210,189,0.2)] bg-[rgba(148,210,189,0.2)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[color:var(--pearl-aqua)] shadow-sm">
                    JMDLR Access
                  </span>
                  <h1 className="mt-4 text-3xl font-semibold sm:text-[34px]">
                    {mode === "login"
                      ? "Welcome back to JMDLR"
                      : "Create your scholar profile"}
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-text-secondary)]">
                    {mode === "login"
                      ? "Log in to manage submissions, bookmarks, and your scholarly dashboard."
                      : "Join the journal community to submit, review, and track your research impact."}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                    What you can do
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-[color:var(--color-text-secondary)]">
                    {[
                      "Submit research papers",
                      "Track citations and downloads",
                      "Collaborate with co-authors",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[14px] border border-[rgba(148,210,189,0.2)] bg-[rgba(0,18,25,0.4)] p-4 text-xs text-[color:var(--color-text-secondary)]">
                  Access is secured using JMDLR&apos;s verified authentication system.
                  Your data remains private and is never shared without consent.
                </div>
              </div>

              <div className="rounded-[20px] border border-[rgba(148,210,189,0.3)] bg-[rgba(0,95,115,0.6)] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                <div className="flex items-center rounded-full border border-[rgba(148,210,189,0.2)] bg-transparent p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      resetMessages();
                    }}
                    className={`flex-1 rounded-full px-4 py-1.5 transition ${
                      mode === "login"
                        ? "bg-[color:var(--color-bg-surface)] text-[color:var(--color-text-primary)] shadow-[0_0_10px_rgba(10,147,150,0.5)]"
                        : "text-[color:var(--pearl-aqua)] hover:text-[color:var(--color-text-primary)]"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      resetMessages();
                    }}
                    className={`flex-1 rounded-full px-4 py-1.5 transition ${
                      mode === "register"
                        ? "bg-[color:var(--color-bg-surface)] text-[color:var(--color-text-primary)] shadow-[0_0_10px_rgba(10,147,150,0.5)]"
                        : "text-[color:var(--pearl-aqua)] hover:text-[color:var(--color-text-primary)]"
                    }`}
                  >
                    Register
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {mode === "login" ? (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                          Email or Username
                        </label>
                        <input
                          value={identifier}
                          onChange={(event) => setIdentifier(event.target.value)}
                          placeholder="you@example.com"
                          className="mt-2 w-full rounded-[12px] border border-[rgba(148,210,189,0.25)] bg-[rgba(0,95,115,0.4)] px-4 py-3 text-sm text-[color:var(--color-text-primary)] shadow-sm transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--pearl-aqua)]/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                          Password
                        </label>
                        <div className="mt-2 flex items-center gap-2 rounded-[12px] border border-[rgba(148,210,189,0.25)] bg-[rgba(0,95,115,0.4)] px-4 py-3 shadow-sm transition focus-within:border-[color:var(--pearl-aqua)] focus-within:ring-2 focus-within:ring-[color:var(--pearl-aqua)]/30">
                          <input
                            type={showLoginPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-transparent text-sm text-[color:var(--color-text-primary)] focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword((prev) => !prev)}
                            className="text-xs font-semibold text-[color:var(--color-text-secondary)]"
                          >
                            {showLoginPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                        <button
                          type="button"
                          className="mt-2 text-xs font-semibold text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                          Username
                        </label>
                      <input
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="jmdlr_scholar"
                        className="mt-2 w-full rounded-[12px] border border-[rgba(148,210,189,0.25)] bg-[rgba(0,95,115,0.4)] px-4 py-3 text-sm text-[color:var(--color-text-primary)] shadow-sm transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--pearl-aqua)]/30"
                      />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                          Email
                        </label>
                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="mt-2 w-full rounded-[12px] border border-[rgba(148,210,189,0.25)] bg-[rgba(0,95,115,0.4)] px-4 py-3 text-sm text-[color:var(--color-text-primary)] shadow-sm transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--pearl-aqua)]/30"
                      />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                          Password
                        </label>
                      <div className="mt-2 flex items-center gap-2 rounded-[12px] border border-[rgba(148,210,189,0.25)] bg-[rgba(0,95,115,0.4)] px-4 py-3 shadow-sm transition focus-within:border-[color:var(--pearl-aqua)] focus-within:ring-2 focus-within:ring-[color:var(--pearl-aqua)]/30">
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full bg-transparent text-sm text-[color:var(--color-text-primary)] focus:outline-none"
                        />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword((prev) => !prev)}
                            className="text-xs font-semibold text-[color:var(--color-text-secondary)]"
                          >
                            {showRegisterPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                          Confirm Password
                        </label>
                      <div className="mt-2 flex items-center gap-2 rounded-[12px] border border-[rgba(148,210,189,0.25)] bg-[rgba(0,95,115,0.4)] px-4 py-3 shadow-sm transition focus-within:border-[color:var(--pearl-aqua)] focus-within:ring-2 focus-within:ring-[color:var(--pearl-aqua)]/30">
                        <input
                          type={showRegisterConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Re-enter password"
                          className="w-full bg-transparent text-sm text-[color:var(--color-text-primary)] focus:outline-none"
                        />
                          <button
                            type="button"
                            onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                            className="text-xs font-semibold text-[color:var(--color-text-secondary)]"
                          >
                            {showRegisterConfirmPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {message ? (
                    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-2 text-xs text-[color:var(--color-text-primary)]">
                      {message}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-[color:var(--color-bg-primary)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                        Please wait...
                      </>
                    ) : mode === "login" ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </button>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    {mode === "login"
                      ? "Don\u2019t have an account?"
                      : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === "login" ? "register" : "login");
                        resetMessages();
                      }}
                      className="font-semibold text-[color:var(--color-text-primary)] hover:text-[color:var(--color-accent)]"
                    >
                      {mode === "login" ? "Register" : "Login"}
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

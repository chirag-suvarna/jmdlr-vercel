"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AdminPdfSettingsPanelProps = {
  className?: string;
};

type JournalSettings = {
  id: number;
  journal_name: string;
  issn_number: string;
  volume: string;
  issue: string;
  watermark_text: string;
  watermark_image: string | null;
  border_margin: number;
  inner_border_margin: number;
  header_font_size: number;
  header_top_offset: number;
  header_left_offset_x: number;
  header_left_offset_y: number;
  header_center_offset_x: number;
  header_center_offset_y: number;
  header_right_offset_x: number;
  header_right_offset_y: number;
  watermark_opacity: number;
  created_at: string;
  updated_at: string;
};

type ProfilePayload = {
  is_staff?: boolean;
};

const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

export default function AdminPdfSettingsPanel({
  className,
}: AdminPdfSettingsPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<JournalSettings | null>(null);
  const [form, setForm] = useState({
    journal_name: "",
    issn_number: "",
    volume: "",
    issue: "",
    watermark_text: "",
    border_margin: "",
    inner_border_margin: "",
    header_font_size: "",
    header_top_offset: "",
    header_left_offset_x: "",
    header_left_offset_y: "",
    header_center_offset_x: "",
    header_center_offset_y: "",
    header_right_offset_x: "",
    header_right_offset_y: "",
    watermark_opacity: "",
  });
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkPreview, setWatermarkPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

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
        const profileRes = await fetch(`${apiBase}/auth/profile/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!profileRes.ok) {
          router.replace("/auth");
          return;
        }
        const profile = (await profileRes.json()) as ProfilePayload;
        if (!profile.is_staff) {
          router.replace("/dashboard");
          return;
        }

        const response = await fetch(`${apiBase}/journal/settings/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.ok) {
          throw new Error("Unable to load journal settings.");
        }
        const payload = (await response.json()) as JournalSettings;
        if (!cancelled) {
          setSettings(payload);
          setForm({
            journal_name: payload.journal_name || "",
            issn_number: payload.issn_number || "",
            volume: payload.volume || "",
            issue: payload.issue || "",
            watermark_text: payload.watermark_text || "",
            border_margin: String(payload.border_margin ?? ""),
            inner_border_margin: String(payload.inner_border_margin ?? ""),
            header_font_size: String(payload.header_font_size ?? ""),
            header_top_offset: String(payload.header_top_offset ?? ""),
            header_left_offset_x: String(payload.header_left_offset_x ?? ""),
            header_left_offset_y: String(payload.header_left_offset_y ?? ""),
            header_center_offset_x: String(payload.header_center_offset_x ?? ""),
            header_center_offset_y: String(payload.header_center_offset_y ?? ""),
            header_right_offset_x: String(payload.header_right_offset_x ?? ""),
            header_right_offset_y: String(payload.header_right_offset_y ?? ""),
            watermark_opacity: String(payload.watermark_opacity ?? ""),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setMessage(
            err instanceof Error
              ? err.message
              : "Unable to load journal settings."
          );
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

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    if (!watermarkFile) {
      setWatermarkPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(watermarkFile);
    setWatermarkPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [watermarkFile]);

  useEffect(() => {
    if (loading || !settings) return;
    const token = localStorage.getItem("jmdlr_token");
    if (!token) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const apiBase = getApiBase();
        const data = new FormData();
        data.append("journal_name", form.journal_name.trim());
        data.append("issn_number", form.issn_number.trim());
        data.append("volume", form.volume.trim());
        data.append("issue", form.issue.trim());
        data.append("watermark_text", form.watermark_text.trim());
        if (form.border_margin.trim()) {
          data.append("border_margin", form.border_margin.trim());
        }
        if (form.inner_border_margin.trim()) {
          data.append("inner_border_margin", form.inner_border_margin.trim());
        }
        if (form.header_font_size.trim()) {
          data.append("header_font_size", form.header_font_size.trim());
        }
        if (form.header_top_offset.trim()) {
          data.append("header_top_offset", form.header_top_offset.trim());
        }
        if (form.header_left_offset_x.trim()) {
          data.append("header_left_offset_x", form.header_left_offset_x.trim());
        }
        if (form.header_left_offset_y.trim()) {
          data.append("header_left_offset_y", form.header_left_offset_y.trim());
        }
        if (form.header_center_offset_x.trim()) {
          data.append(
            "header_center_offset_x",
            form.header_center_offset_x.trim()
          );
        }
        if (form.header_center_offset_y.trim()) {
          data.append(
            "header_center_offset_y",
            form.header_center_offset_y.trim()
          );
        }
        if (form.header_right_offset_x.trim()) {
          data.append(
            "header_right_offset_x",
            form.header_right_offset_x.trim()
          );
        }
        if (form.header_right_offset_y.trim()) {
          data.append(
            "header_right_offset_y",
            form.header_right_offset_y.trim()
          );
        }
        if (form.watermark_opacity.trim()) {
          data.append("watermark_opacity", form.watermark_opacity.trim());
        }
        if (watermarkFile) {
          data.append("watermark_image", watermarkFile);
        }

        const response = await fetch(
          `${apiBase}/admin/journal-settings/preview/`,
          {
            method: "POST",
            headers: { Authorization: `Token ${token}` },
            body: data,
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(
            payload?.detail || "Unable to generate PDF preview."
          );
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewImage((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setPreviewError(
          err instanceof Error ? err.message : "Unable to load preview."
        );
      } finally {
        setPreviewLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [form, watermarkFile, loading, settings]);
  const previewContent = (
    <div className="rounded-[20px] border border-[rgba(148,210,189,0.2)] bg-[color:var(--color-bg-secondary-70)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
          PDF Preview
        </h2>
        <span className="text-xs text-[color:var(--color-text-secondary)]">
          {previewLoading ? "Updating..." : "Live"}
        </span>
      </div>
      <div className="mt-4 rounded-[12px] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="relative aspect-[210/297] min-h-[520px] w-full overflow-hidden rounded-[10px] border border-slate-200 bg-white lg:min-h-[640px]">
          {previewLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              Generating preview...
            </div>
          ) : previewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImage}
              alt="PDF preview"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              Preview unavailable
            </div>
          )}
        </div>
      </div>
      {previewError ? (
        <p className="mt-3 text-xs text-[color:var(--rusty-spice)]">
          {previewError}
        </p>
      ) : null}
    </div>
  );

  const handleReset = () => {
    if (!settings) return;
    setForm({
      journal_name: settings.journal_name || "",
      issn_number: settings.issn_number || "",
      volume: settings.volume || "",
      issue: settings.issue || "",
      watermark_text: settings.watermark_text || "",
      border_margin: String(settings.border_margin ?? ""),
      inner_border_margin: String(settings.inner_border_margin ?? ""),
      header_font_size: String(settings.header_font_size ?? ""),
      header_top_offset: String(settings.header_top_offset ?? ""),
      header_left_offset_x: String(settings.header_left_offset_x ?? ""),
      header_left_offset_y: String(settings.header_left_offset_y ?? ""),
      header_center_offset_x: String(settings.header_center_offset_x ?? ""),
      header_center_offset_y: String(settings.header_center_offset_y ?? ""),
      header_right_offset_x: String(settings.header_right_offset_x ?? ""),
      header_right_offset_y: String(settings.header_right_offset_y ?? ""),
      watermark_opacity: String(settings.watermark_opacity ?? ""),
    });
    setWatermarkFile(null);
    setMessage(null);
    setErrors({});
  };

  const handleSave = async () => {
    const token = localStorage.getItem("jmdlr_token");
    if (!token) {
      router.replace("/auth");
      return;
    }
    const nextErrors: Record<string, string> = {};
    const issn = form.issn_number.trim();
    if (!issn) {
      nextErrors.issn_number = "ISSN is required.";
    } else if (!/^\d{4}-\d{3}[\dXx]$/.test(issn)) {
      nextErrors.issn_number = "ISSN must be in ####-#### format.";
    }
    const borderMargin = Number(form.border_margin);
    if (form.border_margin.trim() && (Number.isNaN(borderMargin) || borderMargin <= 0)) {
      nextErrors.border_margin = "Border margin must be a positive number.";
    }
    const innerBorderMargin = Number(form.inner_border_margin);
    if (
      form.inner_border_margin.trim() &&
      (Number.isNaN(innerBorderMargin) || innerBorderMargin <= 0)
    ) {
      nextErrors.inner_border_margin =
        "Inner border margin must be a positive number.";
    }
    const headerFont = Number(form.header_font_size);
    if (
      form.header_font_size.trim() &&
      (Number.isNaN(headerFont) || headerFont <= 0)
    ) {
      nextErrors.header_font_size = "Header font size must be positive.";
    }
    const headerOffset = Number(form.header_top_offset);
    if (
      form.header_top_offset.trim() &&
      (Number.isNaN(headerOffset) || headerOffset < 0)
    ) {
      nextErrors.header_top_offset = "Header offset must be 0 or greater.";
    }
    const offsetFields: Array<[keyof typeof form, string]> = [
      ["header_left_offset_x", "Left X offset"],
      ["header_left_offset_y", "Left Y offset"],
      ["header_center_offset_x", "Center X offset"],
      ["header_center_offset_y", "Center Y offset"],
      ["header_right_offset_x", "Right X offset"],
      ["header_right_offset_y", "Right Y offset"],
    ];
    offsetFields.forEach(([field, label]) => {
      if (!form[field].trim()) return;
      const value = Number(form[field]);
      if (Number.isNaN(value)) {
        nextErrors[field] = `${label} must be a number.`;
      }
    });
    const opacity = Number(form.watermark_opacity);
    if (
      form.watermark_opacity.trim() &&
      (Number.isNaN(opacity) || opacity < 0 || opacity > 1)
    ) {
      nextErrors.watermark_opacity = "Opacity must be between 0 and 1.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setMessage("Please correct the highlighted fields.");
      return;
    }
    setErrors({});
    setSaving(true);
    setMessage(null);
    try {
      const apiBase = getApiBase();
      const data = new FormData();
      data.append("journal_name", form.journal_name.trim());
      data.append("issn_number", form.issn_number.trim());
      data.append("volume", form.volume.trim());
      data.append("issue", form.issue.trim());
      data.append("watermark_text", form.watermark_text.trim());
      if (form.border_margin.trim()) {
        data.append("border_margin", form.border_margin.trim());
      }
      if (form.inner_border_margin.trim()) {
        data.append("inner_border_margin", form.inner_border_margin.trim());
      }
      if (form.header_font_size.trim()) {
        data.append("header_font_size", form.header_font_size.trim());
      }
      if (form.header_top_offset.trim()) {
        data.append("header_top_offset", form.header_top_offset.trim());
      }
      if (form.header_left_offset_x.trim()) {
        data.append("header_left_offset_x", form.header_left_offset_x.trim());
      }
      if (form.header_left_offset_y.trim()) {
        data.append("header_left_offset_y", form.header_left_offset_y.trim());
      }
      if (form.header_center_offset_x.trim()) {
        data.append(
          "header_center_offset_x",
          form.header_center_offset_x.trim()
        );
      }
      if (form.header_center_offset_y.trim()) {
        data.append(
          "header_center_offset_y",
          form.header_center_offset_y.trim()
        );
      }
      if (form.header_right_offset_x.trim()) {
        data.append(
          "header_right_offset_x",
          form.header_right_offset_x.trim()
        );
      }
      if (form.header_right_offset_y.trim()) {
        data.append(
          "header_right_offset_y",
          form.header_right_offset_y.trim()
        );
      }
      if (form.watermark_opacity.trim()) {
        data.append("watermark_opacity", form.watermark_opacity.trim());
      }
      if (watermarkFile) {
        data.append("watermark_image", watermarkFile);
      }

      const response = await fetch(`${apiBase}/journal/settings/`, {
        method: "PATCH",
        headers: { Authorization: `Token ${token}` },
        body: data,
      });
      const payload = (await response.json()) as JournalSettings & {
        detail?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Unable to save settings.");
      }
      setSettings(payload);
      setWatermarkFile(null);
      setMessage("PDF settings saved.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const containerClass = ["mx-auto max-w-[1000px] space-y-8", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass}>
      <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
          Admin
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-[color:var(--color-text-primary)]">
          PDF Formatting Settings
        </h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
          Configure borders, watermark, and journal header details for formatted PDFs.
        </p>
      </div>

      {message ? (
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-3 text-sm text-[color:var(--color-text-primary)]">
          {message}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[2.6fr_2.4fr]">
        <div>
          {loading ? (
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-3 text-sm text-[color:var(--color-text-secondary)]">
              Loading settings...
            </div>
          ) : (
            <div className="space-y-8">
              <section className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-7 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] text-[color:var(--color-text-primary)]">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 5h12a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2Z" />
                    <path d="M6 3h12a2 2 0 0 1 2 2v12" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                    Journal Information
                  </h2>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    Define the journal metadata printed in the PDF header.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Journal Name
                  </label>
                  <input
                    value={form.journal_name}
                    onChange={(event) =>
                      updateField("journal_name", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    ISSN Number
                  </label>
                  <input
                    value={form.issn_number}
                    onChange={(event) =>
                      updateField("issn_number", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                  />
                  {errors.issn_number ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.issn_number}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Volume
                  </label>
                  <input
                    value={form.volume}
                    onChange={(event) => updateField("volume", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Issue
                  </label>
                  <input
                    value={form.issue}
                    onChange={(event) => updateField("issue", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                  />
                </div>
              </div>
            </section>

                  <section className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-7 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] text-[color:var(--color-text-primary)]">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <path d="M8 7h8M8 11h8M8 15h5" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                    PDF Layout Settings
                  </h2>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    Control margins and header typography for formatted PDFs.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Border Margin (px)
                  </label>
                  <input
                    value={form.border_margin}
                    onChange={(event) =>
                      updateField("border_margin", event.target.value)
                    }
                    type="number"
                    min="0"
                    className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                  />
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-secondary)]">
                    Outer border distance from the page edge.
                  </p>
                  {errors.border_margin ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.border_margin}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Inner Border Margin (px)
                  </label>
                  <input
                    value={form.inner_border_margin}
                    onChange={(event) =>
                      updateField("inner_border_margin", event.target.value)
                    }
                    type="number"
                    min="0"
                    className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                  />
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-secondary)]">
                    Spacing between border and content.
                  </p>
                  {errors.inner_border_margin ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.inner_border_margin}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Header Font Size (pt)
                  </label>
                  <input
                    value={form.header_font_size}
                    onChange={(event) =>
                      updateField("header_font_size", event.target.value)
                    }
                    type="number"
                    min="0"
                    className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                  />
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-secondary)]">
                    Size of the header title on each page.
                  </p>
                  {errors.header_font_size ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.header_font_size}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Header Block Offset (Top)
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      value={form.header_top_offset}
                      onChange={(event) =>
                        updateField("header_top_offset", event.target.value)
                      }
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--color-bg-secondary-80)]"
                    />
                    <span className="min-w-[40px] rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-2 py-1 text-[11px] text-[color:var(--color-text-primary)]">
                      {form.header_top_offset || "0"}px
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-secondary)]">
                    Moves the entire header block down/up.
                  </p>
                  {errors.header_top_offset ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.header_top_offset}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-2xl border border-[color:var(--color-border)]/40 bg-[color:var(--color-bg-secondary-80)] p-3 text-[11px] text-[color:var(--color-text-secondary)] md:col-span-2">
                  Tip: Use negative values to move text left or up. Positive values move right or down.
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Volume &amp; Issue X Offset
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      value={form.header_left_offset_x}
                      onChange={(event) =>
                        updateField("header_left_offset_x", event.target.value)
                      }
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--color-bg-secondary-80)]"
                    />
                    <span className="min-w-[40px] rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-2 py-1 text-[11px] text-[color:var(--color-text-primary)]">
                      {form.header_left_offset_x || "0"}px
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-secondary)]">
                    Adjust horizontal position.
                  </p>
                  {errors.header_left_offset_x ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.header_left_offset_x}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Volume &amp; Issue Y Offset
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      value={form.header_left_offset_y}
                      onChange={(event) =>
                        updateField("header_left_offset_y", event.target.value)
                      }
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--color-bg-secondary-80)]"
                    />
                    <span className="min-w-[40px] rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-2 py-1 text-[11px] text-[color:var(--color-text-primary)]">
                      {form.header_left_offset_y || "0"}px
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-secondary)]">
                    Adjust vertical position.
                  </p>
                  {errors.header_left_offset_y ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.header_left_offset_y}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Journal Name X Offset
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      value={form.header_center_offset_x}
                      onChange={(event) =>
                        updateField("header_center_offset_x", event.target.value)
                      }
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--color-bg-secondary-80)]"
                    />
                    <span className="min-w-[40px] rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-2 py-1 text-[11px] text-[color:var(--color-text-primary)]">
                      {form.header_center_offset_x || "0"}px
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-secondary)]">
                    Adjust horizontal position.
                  </p>
                  {errors.header_center_offset_x ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.header_center_offset_x}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Journal Name Y Offset
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      value={form.header_center_offset_y}
                      onChange={(event) =>
                        updateField("header_center_offset_y", event.target.value)
                      }
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--color-bg-secondary-80)]"
                    />
                    <span className="min-w-[40px] rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-2 py-1 text-[11px] text-[color:var(--color-text-primary)]">
                      {form.header_center_offset_y || "0"}px
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-secondary)]">
                    Adjust vertical position.
                  </p>
                  {errors.header_center_offset_y ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.header_center_offset_y}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    ISSN X Offset
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      value={form.header_right_offset_x}
                      onChange={(event) =>
                        updateField("header_right_offset_x", event.target.value)
                      }
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--color-bg-secondary-80)]"
                    />
                    <span className="min-w-[40px] rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-2 py-1 text-[11px] text-[color:var(--color-text-primary)]">
                      {form.header_right_offset_x || "0"}px
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-secondary)]">
                    Adjust horizontal position.
                  </p>
                  {errors.header_right_offset_x ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.header_right_offset_x}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    ISSN Y Offset
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      value={form.header_right_offset_y}
                      onChange={(event) =>
                        updateField("header_right_offset_y", event.target.value)
                      }
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--color-bg-secondary-80)]"
                    />
                    <span className="min-w-[40px] rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-2 py-1 text-[11px] text-[color:var(--color-text-primary)]">
                      {form.header_right_offset_y || "0"}px
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[color:var(--color-text-secondary)]">
                    Adjust vertical position.
                  </p>
                  {errors.header_right_offset_y ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.header_right_offset_y}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

                  <section className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] p-7 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] text-[color:var(--color-text-primary)]">
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3c4 5.33 6 8 6 11a6 6 0 1 1-12 0c0-3 2-5.67 6-11Z" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                    Watermark Settings
                  </h2>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    Configure watermark text, opacity, and image uploads.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-5">
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Watermark Text
                  </label>
                  <input
                    value={form.watermark_text}
                    onChange={(event) =>
                      updateField("watermark_text", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] transition focus:border-[color:var(--pearl-aqua)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-bg-muted)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Watermark Opacity
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    <input
                      value={form.watermark_opacity || "0"}
                      onChange={(event) =>
                        updateField("watermark_opacity", event.target.value)
                      }
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--color-bg-secondary-80)]"
                    />
                    <span className="text-xs text-[color:var(--color-text-secondary)]">
                      {form.watermark_opacity || "0.00"}
                    </span>
                  </div>
                  {errors.watermark_opacity ? (
                    <p className="mt-1 text-xs text-[color:var(--rusty-spice)]">
                      {errors.watermark_opacity}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[color:var(--color-text-secondary)]">
                    Watermark Image Upload
                  </label>
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      setWatermarkFile(event.dataTransfer.files?.[0] ?? null);
                    }}
                    className="mt-2 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-80)] px-4 py-6 text-center text-xs text-[color:var(--color-text-secondary)]"
                  >
                    <input
                      id="watermark-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) =>
                        setWatermarkFile(event.target.files?.[0] ?? null)
                      }
                    />
                    <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                      Drag &amp; Drop watermark image here
                    </p>
                    <span>or</span>
                    <label
                      htmlFor="watermark-upload"
                      className="cursor-pointer rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-2 text-xs font-semibold text-[color:var(--color-text-primary)] transition hover:border-[color:var(--pearl-aqua)]"
                    >
                      Choose File
                    </label>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-[color:var(--color-text-secondary)]">
                    {watermarkPreview || settings?.watermark_image ? (
                      <img
                        src={watermarkPreview || settings?.watermark_image || ""}
                        alt="Watermark preview"
                        className="h-16 w-16 rounded-xl border border-[color:var(--color-border)] object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-[color:var(--color-border)] text-[10px] text-[color:var(--color-text-secondary)]">
                        No image
                      </div>
                    )}
                    <span>
                      Upload a new watermark image to replace the current one.
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[color:var(--color-border)]/60 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-[color:var(--pearl-aqua)] bg-transparent px-5 py-2 text-sm font-semibold text-[color:var(--wheat)] transition hover:bg-[color:var(--color-bg-surface)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-[color:var(--color-accent)] px-5 py-2 text-sm font-semibold text-[color:var(--wheat)] shadow-sm transition hover:bg-[color:var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </section>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="hidden sm:block">{previewContent}</div>
          <details className="sm:hidden">
            <summary className="cursor-pointer rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-secondary-70)] px-4 py-3 text-sm font-semibold text-[color:var(--color-text-primary)]">
              PDF Preview
            </summary>
            <div className="mt-4">{previewContent}</div>
          </details>
        </div>
      </div>
    </div>
  );
}

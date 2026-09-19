"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  ShieldAlert,
  Volume2,
  Link2Off,
  Zap,
  Filter,
  Plus,
  X,
  ChevronDown,
  ExternalLink,
  Clock,
  MessageSquare,
  Send,
  Eye,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, parseISO } from "date-fns";

// ── Helpers ─────────────────────────────────────────────────────────────────

function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

// ── Types ────────────────────────────────────────────────────────────────────

type Platform = "WhatsApp" | "X" | "Instagram" | "Other";
type Category = "Politics" | "Health" | "Finance" | "Other";
type ClaimStatus = "Unverified" | "Verified True" | "Verified False" | "Misleading";

interface Claim {
  id: string;
  text: string;
  platform: Platform;
  category: Category;
  sourceUrl?: string;
  flags: string[];
  status: ClaimStatus;
  reviewerNote?: string;
  createdAt: string;
}

// ── Badge Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ClaimStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  Unverified: {
    label: "Unverified",
    className: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    icon: AlertCircle,
  },
  "Verified True": {
    label: "Verified True",
    className: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    icon: CheckCircle,
  },
  "Verified False": {
    label: "Verified False",
    className: "bg-red-500/20 text-red-300 border border-red-500/30",
    icon: XCircle,
  },
  Misleading: {
    label: "Misleading",
    className: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    icon: AlertTriangle,
  },
};

const PLATFORM_CONFIG: Record<Platform, { className: string }> = {
  WhatsApp: { className: "bg-green-500/20 text-green-300 border border-green-500/30" },
  X: { className: "bg-sky-500/20 text-sky-300 border border-sky-500/30" },
  Instagram: { className: "bg-pink-500/20 text-pink-300 border border-pink-500/30" },
  Other: { className: "bg-slate-500/20 text-slate-300 border border-slate-500/30" },
};

const CATEGORY_CONFIG: Record<Category, { className: string }> = {
  Politics: { className: "bg-purple-500/20 text-purple-300 border border-purple-500/30" },
  Health: { className: "bg-teal-500/20 text-teal-300 border border-teal-500/30" },
  Finance: { className: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  Other: { className: "bg-slate-500/20 text-slate-300 border border-slate-500/30" },
};

const FLAG_CONFIG: Record<string, { icon: React.ElementType; className: string }> = {
  Sensational: {
    icon: Zap,
    className: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  },
  Shouting: {
    icon: Volume2,
    className: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  },
  Unsourced: {
    icon: Link2Off,
    className: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  },
  "High Risk": {
    icon: ShieldAlert,
    className: "bg-red-500/20 text-red-300 border border-red-500/30 font-semibold",
  },
};

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ClaimStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        cfg.className
      )}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const cfg = PLATFORM_CONFIG[platform];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        cfg.className
      )}
    >
      {platform}
    </span>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        cfg.className
      )}
    >
      {category}
    </span>
  );
}

function FlagBadge({ flag }: { flag: string }) {
  const cfg = FLAG_CONFIG[flag] || {
    icon: Shield,
    className: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  };
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
        cfg.className
      )}
    >
      <Icon size={11} />
      {flag}
    </span>
  );
}

function RelativeTime({ isoString }: { isoString: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    setLabel(formatDistanceToNow(parseISO(isoString), { addSuffix: true }));
  }, [isoString]);
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
      <Clock size={11} />
      {label || "just now"}
    </span>
  );
}

// ── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
  claim,
  onClose,
  onUpdate,
}: {
  claim: Claim;
  onClose: () => void;
  onUpdate: (updated: Claim) => void;
}) {
  const [reviewStatus, setReviewStatus] = useState<ClaimStatus>(claim.status);
  const [reviewNote, setReviewNote] = useState(claim.reviewerNote || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const reviewStatuses: ClaimStatus[] = [
    "Unverified",
    "Verified True",
    "Verified False",
    "Misleading",
  ];

  async function handleSaveReview() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/claims/${claim.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: reviewStatus, reviewerNote: reviewNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to save review.");
      } else {
        onUpdate(data.claim);
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/70">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-indigo-400" />
            <span className="font-semibold text-slate-100 text-sm">
              Claim Detail
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
            id="close-modal-btn"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={claim.status} />
            <PlatformBadge platform={claim.platform} />
            <CategoryBadge category={claim.category} />
            <RelativeTime isoString={claim.createdAt} />
          </div>

          {/* ISO timestamp */}
          <p className="text-xs text-slate-500 font-mono">{claim.createdAt}</p>

          {/* Claim text */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <p className="text-slate-200 leading-relaxed text-sm">{claim.text}</p>
          </div>

          {/* Source URL */}
          {claim.sourceUrl && (
            <div className="flex items-center gap-2">
              <ExternalLink size={13} className="text-indigo-400 shrink-0" />
              <a
                href={claim.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 text-xs underline underline-offset-2 break-all"
              >
                {claim.sourceUrl}
              </a>
            </div>
          )}

          {/* Risk Flags */}
          {claim.flags.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">
                Risk Flags
              </p>
              <div className="flex flex-wrap gap-2">
                {claim.flags.map((f) => (
                  <FlagBadge key={f} flag={f} />
                ))}
              </div>
            </div>
          )}

          {/* Reviewer Note (existing) */}
          {claim.reviewerNote && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-medium flex items-center gap-1">
                <MessageSquare size={11} />
                Reviewer Note
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {claim.reviewerNote}
              </p>
            </div>
          )}

          {/* ── Admin Review Panel ── */}
          <div className="border-t border-slate-700/70 pt-5">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-3 font-medium flex items-center gap-1">
              <Shield size={11} />
              Review Workflow
            </p>

            <div className="space-y-3">
              {/* Status selector */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  Set Status
                </label>
                <div className="relative">
                  <select
                    id="review-status-select"
                    value={reviewStatus}
                    onChange={(e) =>
                      setReviewStatus(e.target.value as ClaimStatus)
                    }
                    className="w-full appearance-none bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  >
                    {reviewStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Reviewer note */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  Reviewer Note
                </label>
                <textarea
                  id="reviewer-note-textarea"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Add context, evidence sources, or your reasoning..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                />
              </div>

              {saveError && (
                <p className="text-xs text-red-400">{saveError}</p>
              )}

              <button
                id="save-review-btn"
                onClick={handleSaveReview}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? (
                  <>
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Save Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Submit Form ──────────────────────────────────────────────────────────────

function SubmitForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [platform, setPlatform] = useState<Platform>("WhatsApp");
  const [category, setCategory] = useState<Category>("Other");
  const [sourceUrl, setSourceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string[]>([]);

  // Live flag preview
  useEffect(() => {
    async function computePreview() {
      if (!text.trim()) {
        setPreview([]);
        return;
      }
      try {
        const res = await fetch("/api/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.trim(),
            platform,
            category,
            sourceUrl: sourceUrl.trim() || undefined,
          }),
        });
        // Don't actually submit — just use the risk engine client-side approximation
        // We call the server only on real submit. Here we do a lightweight local check.
      } catch {
        // ignore
      }
    }
    // We skip network preview for speed — compute flags locally
    const flags: string[] = [];
    const t = text;
    if (/breaking|shocking|share before deleted/i.test(t)) flags.push("Sensational");
    if (t.length > 10) {
      const alpha = t.replace(/[^a-zA-Z]/g, "");
      if (alpha.length > 0 && t.replace(/[^A-Z]/g, "").length / alpha.length > 0.5)
        flags.push("Shouting");
    }
    const hasUrl = /https?:\/\/[^\s]+/i.test(t) || /https?:\/\/[^\s]+/i.test(sourceUrl);
    if (!hasUrl) flags.push("Unsourced");
    if (flags.length >= 2) flags.push("High Risk");
    setPreview(flags);
    void computePreview;
  }, [text, sourceUrl, platform, category]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          platform,
          category,
          sourceUrl: sourceUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed.");
      } else {
        setText("");
        setSourceUrl("");
        setPlatform("WhatsApp");
        setCategory("Other");
        setOpen(false);
        onSubmitted();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const platforms: Platform[] = ["WhatsApp", "X", "Instagram", "Other"];
  const categories: Category[] = ["Politics", "Health", "Finance", "Other"];

  return (
    <div>
      <button
        id="open-submit-form-btn"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-900/30"
      >
        <Plus size={16} />
        Submit Claim
      </button>

      {open && (
        <div className="mt-4 bg-slate-900/80 border border-slate-700 rounded-2xl p-5 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">
            Submit a Claim for Review
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Claim text */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5" htmlFor="claim-text">
                Claim Text <span className="text-red-400">*</span>
              </label>
              <textarea
                id="claim-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the claim or message here…"
                rows={4}
                maxLength={2000}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              />
              <p className="text-right text-xs text-slate-500 mt-1">
                {text.length}/2000
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Platform */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5" htmlFor="claim-platform">
                  Platform <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    id="claim-platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as Platform)}
                    className="w-full appearance-none bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-200 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5" htmlFor="claim-category">
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    id="claim-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full appearance-none bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-200 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Source URL */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5" htmlFor="claim-source">
                Source URL <span className="text-slate-500">(optional)</span>
              </label>
              <input
                id="claim-source"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Live flag preview */}
            {text.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-2">Predicted flags:</p>
                <div className="flex flex-wrap gap-1.5">
                  {preview.length === 0 ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={11} /> No risk flags detected
                    </span>
                  ) : (
                    preview.map((f) => <FlagBadge key={f} flag={f} />)
                  )}
                </div>
              </div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                id="submit-claim-btn"
                type="submit"
                disabled={submitting || !text.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {submitting ? (
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send size={14} />
                )}
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Claim Card ───────────────────────────────────────────────────────────────

function ClaimCard({
  claim,
  onClick,
}: {
  claim: Claim;
  onClick: () => void;
}) {
  const isHighRisk = claim.flags.includes("High Risk");

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative bg-slate-900/60 border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:bg-slate-900 hover:-translate-y-0.5 hover:shadow-xl",
        isHighRisk
          ? "border-red-500/40 hover:border-red-400/60 shadow-red-950/30"
          : "border-slate-700/60 hover:border-slate-600"
      )}
    >
      {isHighRisk && (
        <div className="absolute top-3 right-3">
          <ShieldAlert size={16} className="text-red-400 animate-pulse" />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <StatusBadge status={claim.status} />
        <PlatformBadge platform={claim.platform} />
        <CategoryBadge category={claim.category} />
      </div>

      <p className="text-slate-200 text-sm leading-relaxed line-clamp-3 mb-3">
        {claim.text}
      </p>

      {claim.flags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {claim.flags.map((f) => (
            <FlagBadge key={f} flag={f} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <RelativeTime isoString={claim.createdAt} />
        <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Eye size={11} /> View details
        </span>
      </div>

      {claim.reviewerNote && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-400 line-clamp-1">
            <MessageSquare size={10} className="inline mr-1" />
            {claim.reviewerNote}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<Category | "">("");
  const [filterStatus, setFilterStatus] = useState<ClaimStatus | "">("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const categories: Category[] = ["Politics", "Health", "Finance", "Other"];
  const statuses: ClaimStatus[] = [
    "Unverified",
    "Verified True",
    "Verified False",
    "Misleading",
  ];

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/claims?${params.toString()}`);
      const data = await res.json();
      setClaims(data.claims || []);
    } catch {
      // silent fail in UI
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  function handleClaimUpdated(updated: Claim) {
    setClaims((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    setSelectedClaim(updated);
  }

  const highRiskCount = claims.filter((c) => c.flags.includes("High Risk")).length;
  const unverifiedCount = claims.filter((c) => c.status === "Unverified").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-purple-900/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-rose-900/10 rounded-full blur-3xl" />
      </div>

      {/* ── Header ── */}
      <header className="relative border-b border-slate-800/60 backdrop-blur-sm bg-slate-950/70 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
              <Shield size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                Truth Lens
              </h1>
              <p className="text-xs text-slate-500">
                Hackathon ID: AZIS-T22ZVX
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-4">
            {highRiskCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
                <ShieldAlert size={13} className="text-red-400 animate-pulse" />
                <span className="text-xs text-red-300 font-medium">
                  {highRiskCount} High Risk
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
              <AlertCircle size={13} className="text-amber-400" />
              <span className="text-xs text-amber-300 font-medium">
                {unverifiedCount} Pending
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {claims.length} total
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Submit + Filters row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <SubmitForm onSubmitted={fetchClaims} />

          <div className="flex items-center gap-2 ml-auto">
            <Filter size={14} className="text-slate-400" />

            {/* Category filter */}
            <div className="relative">
              <select
                id="filter-category"
                value={filterCategory}
                onChange={(e) =>
                  setFilterCategory(e.target.value as Category | "")
                }
                className="appearance-none bg-slate-800/80 border border-slate-700 rounded-xl pl-3 pr-7 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as ClaimStatus | "")
                }
                className="appearance-none bg-slate-800/80 border border-slate-700 rounded-xl pl-3 pr-7 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {(filterCategory || filterStatus) && (
              <button
                id="clear-filters-btn"
                onClick={() => {
                  setFilterCategory("");
                  setFilterStatus("");
                }}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Feed label */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-slate-800" />
          <p className="text-xs text-slate-500 px-2">
            Sorted by High Risk · Newest First
          </p>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Claims Feed */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-20 bg-slate-800 rounded-full" />
                  <div className="h-5 w-16 bg-slate-800 rounded-full" />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-3 bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-800 rounded w-5/6" />
                  <div className="h-3 bg-slate-800 rounded w-4/6" />
                </div>
                <div className="h-3 w-24 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-20">
            <Shield size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No claims match your filters.</p>
            <p className="text-slate-600 text-xs mt-1">
              Try adjusting filters or submit a new claim.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {claims.map((claim) => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                onClick={() => setSelectedClaim(claim)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Detail Modal ── */}
      {selectedClaim && (
        <DetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onUpdate={handleClaimUpdated}
        />
      )}
    </div>
  );
}

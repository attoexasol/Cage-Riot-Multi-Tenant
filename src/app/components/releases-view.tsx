import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Search, Filter, Plus, MoreVertical, Edit, Copy, Trash2, Loader2, FolderOpen } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { toast } from "sonner";
import { ReleaseInspector } from "@/app/components/release-inspector";
import {
  deleteRelease,
  listReleases,
  normalizeReleaseMetadata,
  type ReleaseListItem,
} from "@/services/releaseService";
import {
  artworkEmojiForId,
  earliestPresignedRefreshDelayMs,
  pickEffectiveReleaseDate,
  releaseArtworkUrlFromFilePath,
} from "@/lib/releaseFormat";
import { emitReleaseCatalogChanged } from "@/lib/releaseEvents";
import { getEffectiveStatusOverride, type WorkflowUiStatus } from "@/lib/releaseWorkflowLocal";
import { useAuth } from "@/app/components/auth/auth-context";

interface ReleasesViewProps {
  /** Opens Create Release / new release workspace (upload flow). */
  onNavigateToUpload?: () => void;
  /** Opens Create Release in edit mode for an existing release (PUT). */
  onEditRelease?: (releaseId: string) => void;
  /** When set, release cards open Section 4 (distribution) instead of the inspector. */
  onOpenReleaseWorkspace?: (releaseId: string) => void;
}

/** Unified catalog status for filters, badges, and sorting. */
type CatalogCanonicalStatus =
  | "draft"
  | "ready"
  | "incomplete"
  | "in_review"
  | "approved"
  | "live"
  | "rejected"
  | "takedown";

type BarFilterKey =
  | "all"
  | "drafts"
  | "ready"
  | "incomplete"
  | "in_review"
  | "approved"
  | "live"
  | "rejected"
  | "takedown";

const BAR_ITEMS: { key: BarFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "drafts", label: "Drafts" },
  { key: "ready", label: "Ready" },
  { key: "incomplete", label: "Incomplete" },
  { key: "in_review", label: "In Review" },
  { key: "approved", label: "Approved" },
  { key: "live", label: "Live" },
  { key: "rejected", label: "Rejected" },
  { key: "takedown", label: "Takedown" },
];

const CATALOG_TO_BAR: Record<string, BarFilterKey> = {
  draft: "drafts",
  ready: "ready",
  incomplete: "incomplete",
  in_review: "in_review",
  approved: "approved",
  live: "live",
  rejected: "rejected",
  takedown: "takedown",
};

const BAR_TO_CATALOG: Record<Exclude<BarFilterKey, "all">, string> = {
  drafts: "draft",
  ready: "ready",
  incomplete: "incomplete",
  in_review: "in_review",
  approved: "approved",
  live: "live",
  rejected: "rejected",
  takedown: "takedown",
};

interface Release {
  id: string;
  title: string;
  artist: string;
  type: "Single" | "EP" | "Album";
  artwork: string;
  artworkImageUrl: string | null;
  upc: string;
  platforms: number;
  hasSparseMetadata: boolean;
  missingContributorsSlot: boolean;
  canonicalStatus: CatalogCanonicalStatus;
  sortTimestampMs: number;
}

function formatReleaseType(apiType: string | null | undefined): Release["type"] {
  const t = (apiType || "").toLowerCase();
  if (t === "ep") return "EP";
  if (t === "single") return "Single";
  if (t === "album") return "Album";
  return "Single";
}

function parseDateMs(input: string | null | undefined): number {
  const raw = (input || "").trim();
  if (!raw) return 0;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

function deriveCanonicalStatus(
  apiStatus: string | null | undefined,
  hasSparseMetadata: boolean,
  missingContributorsSlot: boolean
): CatalogCanonicalStatus {
  const s = (apiStatus || "draft").toLowerCase().trim();
  if (/takedown|taken_down|taken down|withdrawn|removed_from_dsp|removed from dsp|dmca/i.test(s)) {
    return "takedown";
  }
  if (s === "rejected") return "rejected";
  if (s === "approved") return "approved";
  if (s === "live" || s === "published" || s === "distributed") return "live";
  if (s === "pending" || s === "submitted" || s === "scheduled" || s === "in_review") return "in_review";
  if (s === "incomplete") return "incomplete";
  if (hasSparseMetadata || missingContributorsSlot) return "incomplete";
  return "draft";
}

function labelForCanonicalStatus(status: CatalogCanonicalStatus): string {
  const labels: Record<CatalogCanonicalStatus, string> = {
    draft: "Draft",
    ready: "Ready",
    incomplete: "Incomplete",
    in_review: "In Review",
    approved: "Approved",
    live: "Live",
    rejected: "Rejected",
    takedown: "Takedown",
  };
  return labels[status];
}

function mergeWorkflowOverrideStatus(
  releaseId: string,
  apiStatus: string | null | undefined,
  hasSparseMetadata: boolean,
  missingContributorsSlot: boolean
): CatalogCanonicalStatus {
  const override = getEffectiveStatusOverride(releaseId) as WorkflowUiStatus | null;
  if (override === "ready") return "ready";
  if (override === "in_review") return "in_review";
  if (override === "approved") return "approved";
  if (override === "live") return "live";
  if (override === "rejected") return "rejected";
  if (override === "draft") return deriveCanonicalStatus(apiStatus, hasSparseMetadata, missingContributorsSlot);
  return deriveCanonicalStatus(apiStatus, hasSparseMetadata, missingContributorsSlot);
}

function mapApiReleaseToRelease(r: ReleaseListItem): Release {
  const id = r.id || "";
  const filePath = r.artwork?.file_path?.trim() || null;
  const meta = normalizeReleaseMetadata(r.metadata);
  const hasSparseMetadata =
    !r.upc?.trim() ||
    !pickEffectiveReleaseDate(r) ||
    !r.label_name?.trim() ||
    !r.primary_artist_name?.trim();
  const missingContributorsSlot =
    Object.keys(meta).length > 0 &&
    Object.entries(meta).some(
      ([key, val]) =>
        /contributor|credit|writer|publisher|producer|composer/i.test(key) && !String(val).trim()
    );
  const updated = parseDateMs(r.updated_at);
  const created = parseDateMs(r.created_at);
  const sortTimestampMs = Math.max(updated, created) || 0;
  return {
    id,
    title: r.title?.trim() || "Untitled",
    artist: r.primary_artist_name?.trim() || "—",
    type: formatReleaseType(r.release_type),
    artwork: artworkEmojiForId(id || "0"),
    artworkImageUrl: releaseArtworkUrlFromFilePath(filePath),
    upc: r.upc?.trim() ?? "",
    platforms: 0,
    hasSparseMetadata,
    missingContributorsSlot,
    canonicalStatus: mergeWorkflowOverrideStatus(id, r.status, hasSparseMetadata, missingContributorsSlot),
    sortTimestampMs,
  };
}

function ReleaseArtworkThumb({
  imageUrl,
  emoji,
  className,
  onImageError,
}: {
  imageUrl: string | null;
  emoji: string;
  className: string;
  onImageError?: () => void;
}) {
  if (imageUrl) {
    return (
      <div
        className={cn(
          "rounded-xl flex-shrink-0 overflow-hidden bg-zinc-800 ring-1 ring-white/10",
          className
        )}
      >
        <img
          key={imageUrl}
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => onImageError?.()}
        />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "rounded-xl bg-gradient-to-br from-[#ff2d6a] via-[#ff0050] to-[#c4003d] flex items-center justify-center flex-shrink-0 shadow-inner ring-1 ring-white/10",
        className
      )}
    >
      <span className="select-none opacity-90 drop-shadow-sm">{emoji}</span>
    </div>
  );
}

function ReleaseStatusBadge({ status }: { status: CatalogCanonicalStatus }) {
  const label = labelForCanonicalStatus(status);
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 shrink-0";
  switch (status) {
    case "live":
      return (
        <span className={cn(base, "bg-emerald-600/90 text-white ring-emerald-500/40")}>{label}</span>
      );
    case "approved":
      return (
        <span className={cn(base, "bg-teal-950/80 text-teal-100 ring-teal-500/30")}>{label}</span>
      );
    case "in_review":
      return (
        <span className={cn(base, "bg-sky-950/60 text-sky-200 ring-sky-500/35")}>{label}</span>
      );
    case "draft":
      return <span className={cn(base, "bg-zinc-700 text-zinc-100 ring-white/10")}>{label}</span>;
    case "ready":
      return (
        <span className={cn(base, "bg-emerald-950/70 text-emerald-100 ring-emerald-500/30")}>{label}</span>
      );
    case "incomplete":
      return (
        <span className={cn(base, "bg-amber-950/70 text-amber-100 ring-amber-500/35")}>{label}</span>
      );
    case "rejected":
      return (
        <span className={cn(base, "bg-red-950/80 text-red-200 ring-red-500/30")}>{label}</span>
      );
    case "takedown":
      return (
        <span className={cn(base, "bg-violet-950/80 text-violet-200 ring-violet-500/35")}>{label}</span>
      );
    default:
      return <span className={cn(base, "bg-zinc-800 text-zinc-200 ring-white/10")}>{label}</span>;
  }
}

function matchesBar(bar: BarFilterKey, c: CatalogCanonicalStatus): boolean {
  if (bar === "all") return true;
  if (bar === "drafts") return c === "draft";
  if (bar === "ready") return c === "ready";
  if (bar === "incomplete") return c === "incomplete";
  if (bar === "in_review") return c === "in_review";
  if (bar === "approved") return c === "approved";
  if (bar === "live") return c === "live";
  if (bar === "rejected") return c === "rejected";
  if (bar === "takedown") return c === "takedown";
  return true;
}

function matchesDropdownStatus(sf: string, c: CatalogCanonicalStatus): boolean {
  if (sf === "all-status") return true;
  return c === (sf as CatalogCanonicalStatus);
}

type ReleaseGridCardProps = {
  release: Release;
  isStandardViewer: boolean;
  deletingReleaseId: string | null;
  onOpenWorkspace: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (r: Release) => void;
  onDeleteRequest: (r: Release) => void;
  onArtworkImageError?: () => void;
};

function ReleaseGridCard({
  release,
  isStandardViewer,
  deletingReleaseId,
  onOpenWorkspace,
  onEdit,
  onDuplicate,
  onDeleteRequest,
  onArtworkImageError,
}: ReleaseGridCardProps) {
  const stopMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenWorkspace(release.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenWorkspace(release.id);
        }
      }}
      className="group rounded-xl border border-white/5 bg-[#1c1c1c] text-[#888888] shadow-sm transition-all hover:border-white/10 hover:shadow-md cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#ff0050]/50"
    >
      <div className="p-4 sm:p-5">
        <div className="flex gap-4">
          <ReleaseArtworkThumb
            imageUrl={release.artworkImageUrl}
            emoji={release.artwork}
            className="h-20 w-20 shrink-0 text-3xl sm:text-[2rem]"
            onImageError={onArtworkImageError}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold leading-tight tracking-tight text-white sm:text-lg">
                  {release.title}
                </h3>
                <p className="mt-1 truncate text-sm text-[#888888]">{release.artist}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 shrink-0 p-0 text-[#888888] hover:bg-white/5 hover:text-white"
                    onClick={stopMenu}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[11rem]" onClick={stopMenu}>
                  <DropdownMenuItem
                    onClick={() => {
                      onOpenWorkspace(release.id);
                    }}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Open Release
                  </DropdownMenuItem>
                  {!isStandardViewer && (
                    <DropdownMenuItem
                      onClick={() => {
                        onEdit(release.id);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      onDuplicate(release);
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled title="Coming soon">
                    Takedown
                  </DropdownMenuItem>
                  {!isStandardViewer && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={deletingReleaseId === release.id}
                        onClick={() => onDeleteRequest(release)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-zinc-300">{release.type}</span>
              <ReleaseStatusBadge status={release.canonicalStatus} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.08] px-4 sm:px-5" aria-hidden />

      <div className="flex flex-col gap-1 px-4 pb-4 pt-3 text-xs text-[#888888] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="truncate">UPC: {release.upc?.trim() ? release.upc : "—"}</span>
        <span className="shrink-0 whitespace-nowrap">
          {release.platforms} {release.platforms === 1 ? "platform" : "platforms"}
        </span>
      </div>
    </div>
  );
}

export function ReleasesView({ onNavigateToUpload, onEditRelease, onOpenReleaseWorkspace }: ReleasesViewProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStandardViewer = user?.role === "viewer";
  const [searchParams, setSearchParams] = useSearchParams();

  const catalogParam = (searchParams.get("catalog") || "").trim();

  const activeBarFilter: BarFilterKey = useMemo(() => {
    if (catalogParam && CATALOG_TO_BAR[catalogParam]) {
      return CATALOG_TO_BAR[catalogParam];
    }
    return "all";
  }, [catalogParam]);

  const [releases, setReleases] = useState<Release[]>([]);
  const [loadingReleases, setLoadingReleases] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusDropdown, setStatusDropdown] = useState("all-status");
  const [issueFilter, setIssueFilter] = useState<string | null>(null);
  const [inspectingRelease, setInspectingRelease] = useState<string | null>(null);
  const [deletingReleaseId, setDeletingReleaseId] = useState<string | null>(null);
  const [releasePendingDelete, setReleasePendingDelete] = useState<Release | null>(null);

  const commitBarFilter = useCallback(
    (key: BarFilterKey) => {
      const next = new URLSearchParams(searchParams);
      if (key === "all") {
        next.delete("catalog");
      } else {
        next.set("catalog", BAR_TO_CATALOG[key]);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const reloadReleasesFromApi = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    if (!silent) setLoadingReleases(true);
    try {
      const list = await listReleases();
      setReleases(list.map(mapApiReleaseToRelease));
    } catch (err) {
      if (!silent) {
        setReleases([]);
        const message = err instanceof Error ? err.message : "Failed to load releases";
        toast.error(message);
      }
    } finally {
      if (!silent) setLoadingReleases(false);
    }
  }, []);

  useEffect(() => {
    void reloadReleasesFromApi();
  }, [reloadReleasesFromApi]);

  useEffect(() => {
    const issue = searchParams.get("issue")?.trim();
    if (issue === "metadata" || issue === "contributors" || issue === "tracks") {
      setIssueFilter(issue);
    } else {
      setIssueFilter(null);
    }
  }, [searchParams]);

  useEffect(() => {
    const oid = searchParams.get("open")?.trim();
    if (!oid) return;
    if (onOpenReleaseWorkspace) {
      onOpenReleaseWorkspace(oid);
    } else {
      setInspectingRelease(oid);
    }
    const next = new URLSearchParams(searchParams);
    next.delete("open");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, onOpenReleaseWorkspace]);

  const listArtworkRefreshCooldownRef = useRef(0);
  const queueSilentListRefetchFromArtworkError = useCallback(() => {
    const now = Date.now();
    if (now - listArtworkRefreshCooldownRef.current < 10_000) return;
    listArtworkRefreshCooldownRef.current = now;
    void reloadReleasesFromApi({ silent: true });
  }, [reloadReleasesFromApi]);

  useEffect(() => {
    if (loadingReleases || releases.length === 0) return;
    const minDelay = earliestPresignedRefreshDelayMs(releases.map((r) => r.artworkImageUrl));
    if (minDelay == null) return;
    const tid = window.setTimeout(() => {
      void reloadReleasesFromApi({ silent: true });
    }, minDelay);
    return () => window.clearTimeout(tid);
  }, [releases, loadingReleases, reloadReleasesFromApi]);

  const openNewReleaseWorkspace = useCallback(() => {
    if (onNavigateToUpload) {
      onNavigateToUpload();
    } else {
      navigate("/upload");
    }
  }, [navigate, onNavigateToUpload]);

  const filteredReleases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = releases.filter((release) => {
      const upc = (release.upc || "").toLowerCase();
      const matchesSearch =
        q === "" ||
        release.title.toLowerCase().includes(q) ||
        release.artist.toLowerCase().includes(q) ||
        upc.includes(q);

      const matchesType =
        typeFilter === "all" || release.type.toLowerCase() === typeFilter.toLowerCase();

      const matchesBarRule = matchesBar(activeBarFilter, release.canonicalStatus);
      const matchesStatusRule = matchesDropdownStatus(statusDropdown, release.canonicalStatus);

      const matchesIssue =
        !issueFilter ||
        (issueFilter === "metadata" && release.hasSparseMetadata) ||
        (issueFilter === "contributors" && release.missingContributorsSlot) ||
        (issueFilter === "tracks" &&
          (release.canonicalStatus === "draft" || release.canonicalStatus === "in_review"));

      return matchesSearch && matchesType && matchesBarRule && matchesStatusRule && matchesIssue;
    });
    list.sort((a, b) => b.sortTimestampMs - a.sortTimestampMs);
    return list;
  }, [releases, searchQuery, typeFilter, statusDropdown, activeBarFilter, issueFilter]);

  const hasNonDefaultFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "all" ||
    statusDropdown !== "all-status" ||
    activeBarFilter !== "all" ||
    issueFilter != null;

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusDropdown("all-status");
    setIssueFilter(null);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const handleEditRelease = (releaseId: string) => {
    if (onEditRelease) {
      onEditRelease(releaseId);
    } else if (onNavigateToUpload) {
      onNavigateToUpload();
    } else {
      toast.info("Open Create Release from the sidebar to edit release details.");
    }
  };

  const handleDuplicate = (_release: Release) => {
    toast.message("Duplicate release", {
      description: "This action will be available in a future update.",
    });
  };

  const confirmDeleteRelease = async () => {
    const release = releasePendingDelete;
    if (!release || deletingReleaseId) return;
    setDeletingReleaseId(release.id);
    try {
      const res = await deleteRelease(release.id);
      toast.success(res.message?.trim() || "Deleted successfully");
      setReleases((prev) => prev.filter((r) => r.id !== release.id));
      emitReleaseCatalogChanged({ releaseId: release.id, reason: "deleted" });
      setReleasePendingDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete release";
      toast.error(message);
    } finally {
      setDeletingReleaseId(null);
    }
  };

  const deleteConfirmOpen = releasePendingDelete !== null;
  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (!open && !deletingReleaseId) {
      setReleasePendingDelete(null);
    }
  };

  const deleteConfirmDialog = (
    <AlertDialog open={deleteConfirmOpen} onOpenChange={handleDeleteDialogOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this release?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <p>
              {releasePendingDelete ? (
                <>
                  This will permanently remove{" "}
                  <span className="font-medium text-foreground">{releasePendingDelete.title}</span>{" "}
                  by {releasePendingDelete.artist}. This cannot be undone.
                </>
              ) : (
                "This action cannot be undone."
              )}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={!!deletingReleaseId}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!!deletingReleaseId}
            onClick={() => void confirmDeleteRelease()}
            className="inline-flex items-center gap-2"
          >
            {deletingReleaseId ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
            ) : null}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (inspectingRelease && !onOpenReleaseWorkspace) {
    return (
      <>
        <ReleaseInspector
          releaseId={inspectingRelease}
          onBack={() => setInspectingRelease(null)}
        />
        {deleteConfirmDialog}
      </>
    );
  }

  return (
    <>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Manage Music</h1>
          </div>
          {!isStandardViewer && (
            <Button
              size="sm"
              className="bg-[#ff0050] hover:bg-[#cc0040]"
              onClick={openNewReleaseWorkspace}
            >
              + New Release
            </Button>
          )}
        </div>

        {hasNonDefaultFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Filters active</span>
            <Button variant="ghost" size="sm" className="h-8 text-[#ff0050]" onClick={clearAllFilters}>
              Clear filters
            </Button>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {BAR_ITEMS.map(({ key, label }) => {
            const isActive = activeBarFilter === key;
            return (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "shrink-0 rounded-full h-9",
                  isActive && "bg-[#ff0050] hover:bg-[#cc0040] text-white border-transparent"
                )}
                onClick={() => commitBarFilter(key)}
              >
                {label}
              </Button>
            );
          })}
        </div>

        <Card>
          <CardContent className="pt-6 px-3.5 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-center">
              <div className="relative flex-1 w-full min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by release title, artist name, or UPC…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px]">
                    <Filter className="h-4 w-4 mr-2 shrink-0" />
                    <SelectValue placeholder="Release type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="ep">EP</SelectItem>
                    <SelectItem value="album">Album</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusDropdown} onValueChange={setStatusDropdown}>
                  <SelectTrigger className="w-full sm:w-[160px] lg:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-status">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="takedown">Takedown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loadingReleases ? (
          <p className="text-center text-muted-foreground py-12 text-sm">Loading releases…</p>
        ) : releases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/10 rounded-xl bg-muted/20">
            <p className="text-lg font-medium text-foreground">No releases yet</p>
            {!isStandardViewer && (
              <Button className="mt-6 bg-[#ff0050] hover:bg-[#cc0040]" onClick={openNewReleaseWorkspace}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Release
              </Button>
            )}
          </div>
        ) : filteredReleases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/10 rounded-xl bg-muted/10">
            <p className="text-muted-foreground text-sm">No releases match your filters.</p>
            {hasNonDefaultFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearAllFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReleases.map((release) => (
              <ReleaseGridCard
                key={release.id}
                release={release}
                isStandardViewer={isStandardViewer}
                deletingReleaseId={deletingReleaseId}
                onOpenWorkspace={(id) =>
                  onOpenReleaseWorkspace ? onOpenReleaseWorkspace(id) : setInspectingRelease(id)
                }
                onEdit={handleEditRelease}
                onDuplicate={handleDuplicate}
                onDeleteRequest={setReleasePendingDelete}
                onArtworkImageError={queueSilentListRefetchFromArtworkError}
              />
            ))}
          </div>
        )}
      </div>
      {deleteConfirmDialog}
    </>
  );
}

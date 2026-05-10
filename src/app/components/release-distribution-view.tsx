/**
 * Section 4 — Release Detail & Distribution
 * Summary + validation + final actions (not heavy metadata editing).
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Globe,
  Loader2,
  Music2,
  Radio,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { cn } from "@/app/components/ui/utils";
import {
  fetchReleaseTrackList,
  getRelease,
  getTrack,
  isLikelyServerTrackId,
  normalizeReleaseMetadata,
  postReleaseWorkflowAction,
  TrackNotFoundError,
  type ReleaseListItem,
  type ReleaseTrackItem,
} from "@/services/releaseService";
import {
  formatEffectiveReleaseDate,
  formatReleaseDisplayDate,
  pickEffectiveReleaseDate,
  releaseArtworkUrlFromFilePath,
} from "@/lib/releaseFormat";
import {
  buildReadinessIssues,
  contributorSummaryForTrack,
  hasBlockingErrors,
  type ReadinessIssue,
  type Section4Focus,
} from "@/lib/section4Validation";
import {
  getDistributionSettings,
  getEffectiveStatusOverride,
  saveDistributionSettings,
  setEffectiveStatusOverride,
  type DistributionSettingsState,
  type WorkflowUiStatus,
} from "@/lib/releaseWorkflowLocal";

export interface ReleaseDistributionViewProps {
  releaseId: string;
  /** Read-only actions (e.g. artist viewer). */
  viewerMode?: boolean;
  onBackToCatalog: () => void;
  /** Opens Section 3 with this release loaded; optional deep-link focus. */
  onEditInWorkspace: (focus?: Section4Focus) => void;
}

function formatReleaseType(api: string | null | undefined): string {
  const t = (api || "").toLowerCase();
  if (t === "ep") return "EP";
  if (t === "single") return "Single";
  if (t === "album") return "Album";
  return api?.trim() || "—";
}

function mapApiStatusToWorkflow(s: string | null | undefined): WorkflowUiStatus {
  const x = (s || "draft").toLowerCase().trim();
  if (x === "rejected") return "rejected";
  if (x === "approved") return "approved";
  if (x === "live" || x === "published" || x === "distributed") return "live";
  if (x === "pending" || x === "submitted" || x === "scheduled" || x === "in_review") return "in_review";
  if (x === "ready") return "ready";
  return "draft";
}

function workflowLabel(s: WorkflowUiStatus): string {
  const m: Record<WorkflowUiStatus, string> = {
    draft: "Draft",
    ready: "Ready",
    in_review: "In Review",
    approved: "Approved",
    live: "Live",
    rejected: "Rejected",
  };
  return m[s];
}

function StatusBadge({ status }: { status: WorkflowUiStatus }) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 shrink-0";
  switch (status) {
    case "live":
      return <span className={cn(base, "bg-emerald-600/90 text-white ring-emerald-500/40")}>{workflowLabel(status)}</span>;
    case "approved":
      return <span className={cn(base, "bg-teal-950/80 text-teal-100 ring-teal-500/30")}>{workflowLabel(status)}</span>;
    case "in_review":
      return <span className={cn(base, "bg-sky-950/60 text-sky-200 ring-sky-500/35")}>{workflowLabel(status)}</span>;
    case "ready":
      return <span className={cn(base, "bg-green-950/70 text-green-100 ring-green-500/30")}>{workflowLabel(status)}</span>;
    case "rejected":
      return <span className={cn(base, "bg-red-950/80 text-red-200 ring-red-500/30")}>{workflowLabel(status)}</span>;
    default:
      return <span className={cn(base, "bg-zinc-700 text-zinc-100 ring-white/10")}>{workflowLabel(status)}</span>;
  }
}

export function ReleaseDistributionView({
  releaseId,
  viewerMode = false,
  onBackToCatalog,
  onEditInWorkspace,
}: ReleaseDistributionViewProps) {
  const [loading, setLoading] = useState(true);
  const [release, setRelease] = useState<ReleaseListItem | null>(null);
  const [tracks, setTracks] = useState<ReleaseTrackItem[]>([]);
  const [distribution, setDistribution] = useState<DistributionSettingsState>(() =>
    getDistributionSettings(releaseId)
  );
  const [workflowBusy, setWorkflowBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getRelease(releaseId);
      setRelease(r);
      const base = await fetchReleaseTrackList(releaseId, r, (message) => toast.error(message));
      const enriched = await Promise.all(
        base.map(async (tr) => {
          const sid = tr.id?.trim();
          if (!sid) return tr;
          /**
           * Skip the standalone `/api/tracks/:id` enrichment when the row already carries the
           * key fields (title + audio). Also skip when the id isn't a UUID (orphaned pivot,
           * placeholder, etc.) so we don't spam the network tab with 404s.
           */
          const hasAudio = Boolean(tr.audio?.file_path?.trim());
          const hasTitle = Boolean(tr.title?.trim());
          if (hasAudio && hasTitle) return tr;
          if (!isLikelyServerTrackId(sid)) return tr;
          try {
            const detail = await getTrack(sid);
            return { ...tr, ...detail, id: sid } as ReleaseTrackItem;
          } catch (err) {
            /** Track row references a tracks.id that no longer exists — keep cached row, no toast. */
            if (err instanceof TrackNotFoundError) return tr;
            return tr;
          }
        })
      );
      setTracks(enriched);
      setDistribution(getDistributionSettings(releaseId));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load release");
      setRelease(null);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [releaseId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const onChanged = (ev: Event) => {
      const d = (ev as CustomEvent<{ releaseId?: string }>).detail;
      if (d?.releaseId === releaseId) void reload();
    };
    window.addEventListener("cage-release-workflow-changed", onChanged as EventListener);
    return () => window.removeEventListener("cage-release-workflow-changed", onChanged as EventListener);
  }, [releaseId, reload]);

  const meta = useMemo(() => (release ? normalizeReleaseMetadata(release.metadata) : {}), [release]);

  /** Workspace track rows the artist saved during creation — used to recover titles when the
   * server-side track row is empty / orphaned (avoids "Untitled track" labels). */
  const workspaceTrackRows = useMemo<Record<string, unknown>[]>(() => {
    const raw = meta.workspace_tracks?.trim();
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw) as unknown;
      if (!Array.isArray(arr)) return [];
      return arr.filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object");
    } catch {
      return [];
    }
  }, [meta]);

  const titleForTrack = useCallback(
    (t: ReleaseTrackItem, index: number): string => {
      const apiTitle = t.title?.trim();
      if (apiTitle) return apiTitle;
      const sid = t.id?.trim() ?? "";
      const byId = workspaceTrackRows.find(
        (row) => String(row.serverTrackId ?? "").trim() === sid
      );
      const wsRow = byId ?? workspaceTrackRows[index];
      const wsTitle = wsRow ? String(wsRow.title ?? "").trim() : "";
      if (wsTitle) return wsTitle;
      const num = t.track_number;
      if (typeof num === "number" && Number.isFinite(num)) return `Track ${num}`;
      return "Untitled track";
    },
    [workspaceTrackRows]
  );

  const issues = useMemo(() => {
    if (!release) return [];
    return buildReadinessIssues(release, tracks);
  }, [release, tracks]);

  const blocking = hasBlockingErrors(issues);
  const releaseErrors = issues.filter((i) => i.scope === "release" && i.severity === "error");
  const releaseWarnings = issues.filter((i) => i.scope === "release" && i.severity === "warning");
  const trackIssues = issues.filter((i) => i.scope === "track");

  const apiWorkflow = useMemo(() => mapApiStatusToWorkflow(release?.status), [release?.status]);
  const override = getEffectiveStatusOverride(releaseId);
  const displayWorkflow: WorkflowUiStatus = override ?? apiWorkflow;

  const previouslyReleased = meta.previously_released === "true";
  const effectiveReleaseDate = pickEffectiveReleaseDate(release);
  const timingSummary = previouslyReleased
    ? "ASAP (previously released — scheduling simplified)"
    : effectiveReleaseDate
      ? `Release date: ${formatReleaseDisplayDate(effectiveReleaseDate)}`
      : "Release date not set";

  const coverUrl = useMemo(() => {
    const fp = release?.artwork?.file_path?.trim();
    return fp ? releaseArtworkUrlFromFilePath(fp) : null;
  }, [release?.artwork?.file_path]);

  const primaryCta = useMemo(() => {
    if (displayWorkflow === "live") {
      return { label: "Live on DSPs", action: null as "submit_review" | "start_distribution" | null, disabled: true };
    }
    if (displayWorkflow === "in_review") {
      return { label: "In review", action: null as "submit_review" | "start_distribution" | null, disabled: true };
    }
    if (displayWorkflow === "approved") {
      return { label: "Distribute Release", action: "start_distribution" as const, disabled: viewerMode || blocking };
    }
    return { label: "Submit for Review", action: "submit_review" as const, disabled: viewerMode || blocking };
  }, [displayWorkflow, viewerMode, blocking]);

  const handleIssueClick = (issue: ReadinessIssue) => {
    onEditInWorkspace(issue.focus);
  };

  const handlePrimary = async () => {
    if (!primaryCta.action || primaryCta.disabled) return;
    setWorkflowBusy(true);
    try {
      const res = await postReleaseWorkflowAction(releaseId, primaryCta.action);
      if (primaryCta.action === "submit_review") {
        setEffectiveStatusOverride(releaseId, "in_review");
        toast.success(res.simulated ? "Release submitted (demo mode)" : "Release submitted", {
          description: res.simulated ? "Backend workflow route not available yet; status updated locally." : undefined,
        });
      } else {
        setEffectiveStatusOverride(releaseId, "live");
        toast.success(res.simulated ? "Distribution started (demo mode)" : "Distribution started", {
          description: res.simulated ? "Backend workflow route not available yet; status updated locally." : undefined,
        });
      }
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setWorkflowBusy(false);
    }
  };

  const handleSaveDistribution = () => {
    saveDistributionSettings(releaseId, distribution);
    if (!blocking && (displayWorkflow === "draft" || displayWorkflow === "rejected")) {
      setEffectiveStatusOverride(releaseId, "ready");
    }
    toast.success("Changes saved", {
      description: "Distribution preferences stored for this release.",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff0050]" />
        <p className="text-sm">Loading release…</p>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="p-6 max-w-[1800px] mx-auto space-y-4">
        <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={onBackToCatalog}>
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </Button>
        <p className="text-muted-foreground text-sm">Release could not be loaded.</p>
      </div>
    );
  }

  const distributionFrozen = displayWorkflow === "live";
  const workflowBanner =
    displayWorkflow === "in_review" || displayWorkflow === "approved" || displayWorkflow === "live";

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1800px] mx-auto w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <Button type="button" variant="ghost" size="sm" className="gap-2 -ml-2 mb-1" onClick={onBackToCatalog}>
            <ArrowLeft className="h-4 w-4" />
            My Catalog
          </Button>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight truncate">Release & distribution</h1>
          <p className="text-sm text-muted-foreground">
            Final summary and readiness edit details in Create Release when needed.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span>
          <StatusBadge status={displayWorkflow} />
        </div>
      </div>

      {workflowBanner && (
        <Card className="border-sky-500/25 bg-sky-950/10">
          <CardContent className="py-3 text-sm text-sky-100/90 flex gap-2 items-start">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              {displayWorkflow === "in_review" &&
                "This release is in review. You can still adjust distribution notes below where allowed."}
              {displayWorkflow === "approved" &&
                "Approved for distribution — confirm settings, then use Distribute Release when you are ready."}
              {displayWorkflow === "live" &&
                "This release is live. Distribution settings are frozen; contact support for takedowns or updates."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 4.3 Overview */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Release overview</CardTitle>
            <CardDescription>Read-only summary</CardDescription>
          </div>
          {!viewerMode && (
            <Button type="button" size="sm" variant="outline" onClick={() => onEditInWorkspace()}>
              Edit release
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-6">
          <div className="shrink-0">
            {coverUrl ? (
              <div className="h-40 w-40 rounded-xl overflow-hidden ring-1 ring-border bg-muted">
                <img src={coverUrl} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-40 w-40 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm ring-1 ring-border">
                No artwork
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 flex-1 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Title</p>
              <p className="font-medium">{release.title?.trim() || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Primary artist</p>
              <p className="font-medium">{release.primary_artist_name?.trim() || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Release type</p>
              <p className="font-medium">{formatReleaseType(release.release_type)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Release date</p>
              <p className="font-medium">
                {effectiveReleaseDate ? formatEffectiveReleaseDate(release) : "—"}
              </p>
            </div>
            {previouslyReleased && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Original release date</p>
                <p className="font-medium">
                  {release.original_release_date?.trim()
                    ? formatReleaseDisplayDate(release.original_release_date)
                    : "—"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4.4 Tracks */}
      <Card>
        <CardHeader>
          <CardTitle>Tracks</CardTitle>
          <CardDescription>Click a row to open track metadata in Create Release</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tracks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tracks on this release yet.</p>
          ) : (
            tracks.map((t, index) => {
              const trackIssueSubset = issues.filter((i) => i.trackServerId === t.id);
              const hasErr = trackIssueSubset.some((i) => i.severity === "error");
              const hasWarn = trackIssueSubset.some((i) => i.severity === "warning");
              const statusLabel = hasErr ? "Missing info" : hasWarn ? "Needs attention" : "Complete";
              const displayTitle = titleForTrack(t, index);
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={viewerMode}
                  onClick={() => onEditInWorkspace({ kind: "track", trackServerId: t.id })}
                  className={cn(
                    "w-full flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                    viewerMode ? "opacity-70 cursor-default" : "hover:bg-muted/40 cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Music2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{displayTitle}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {contributorSummaryForTrack(t, meta)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
                    <Badge variant={hasErr ? "destructive" : hasWarn ? "secondary" : "outline"}>{statusLabel}</Badge>
                    {!viewerMode && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 4.5 Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Validation & issues</CardTitle>
          <CardDescription>Errors block submission; warnings are advisory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              No blocking or advisory issues detected for this checklist.
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  Release-level
                </h3>
                <ul className="space-y-2">
                  {[...releaseErrors, ...releaseWarnings].length === 0 ? (
                    <li className="text-sm text-muted-foreground">None</li>
                  ) : (
                    [...releaseErrors, ...releaseWarnings].map((issue) => (
                      <li key={issue.id}>
                        <button
                          type="button"
                          disabled={viewerMode}
                          onClick={() => handleIssueClick(issue)}
                          className={cn(
                            "w-full text-left rounded-lg border px-3 py-2.5 transition-colors",
                            issue.severity === "error"
                              ? "border-destructive/40 bg-destructive/5 hover:bg-destructive/10"
                              : "border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/30",
                            viewerMode && "opacity-70 pointer-events-none"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {issue.severity === "error" ? (
                              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                            )}
                            <span className="font-medium text-sm">{issue.title}</span>
                            <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
                              {issue.severity === "error" ? "Blocking" : "Warning"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 pl-6">{issue.description}</p>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Music2 className="h-4 w-4" />
                  Track-level
                </h3>
                <ul className="space-y-2">
                  {trackIssues.length === 0 ? (
                    <li className="text-sm text-muted-foreground">None</li>
                  ) : (
                    trackIssues.map((issue) => (
                      <li key={issue.id}>
                        <button
                          type="button"
                          disabled={viewerMode}
                          onClick={() => handleIssueClick(issue)}
                          className={cn(
                            "w-full text-left rounded-lg border px-3 py-2.5 transition-colors",
                            issue.severity === "error"
                              ? "border-destructive/40 bg-destructive/5 hover:bg-destructive/10"
                              : "border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/30",
                            viewerMode && "opacity-70 pointer-events-none"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {issue.severity === "error" ? (
                              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                            )}
                            <span className="font-medium text-sm">{issue.title}</span>
                            <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
                              {issue.severity === "error" ? "Blocking" : "Warning"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 pl-6">{issue.description}</p>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 4.6 Distribution settings */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution settings</CardTitle>
          <CardDescription>Phase 1 defaults with room for territories later</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-xl">
          <div className="space-y-2">
            <Label>Distribution scope</Label>
            <div className="flex items-center gap-2 text-sm rounded-lg border px-3 py-2 bg-muted/30">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>Global</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                Default
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="territories-note">Territories (optional)</Label>
            <Input
              id="territories-note"
              disabled={viewerMode || distributionFrozen}
              placeholder="Worldwide add exclusions when supported"
              value={distribution.territoriesNote}
              onChange={(e) => setDistribution((d) => ({ ...d, territoriesNote: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="flex items-center gap-2 text-sm rounded-lg border px-3 py-2 bg-muted/30">
              <Radio className="h-4 w-4 text-muted-foreground" />
              <span>All DSPs</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                Default
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Release timing</Label>
            <p className="text-sm text-muted-foreground">{timingSummary}</p>
          </div>
        </CardContent>
      </Card>

      {/* 4.7 Final actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to distribute</CardTitle>
          <CardDescription>Primary action respects validation and your current workflow stage</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2">
          {!viewerMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void handleSaveDistribution();
              }}
            >
              Save changes
            </Button>
          )}
          {!viewerMode && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onEditInWorkspace()}>
              Back to edit
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            disabled={primaryCta.disabled || workflowBusy}
            className="bg-[#ff0050] hover:bg-[#cc0040] sm:min-w-[10rem]"
            onClick={() => void handlePrimary()}
          >
            {workflowBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : primaryCta.label}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

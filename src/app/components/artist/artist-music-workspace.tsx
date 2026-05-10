import React, { useEffect, useRef } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Music2,
  Plus,
  Radio,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

export type WorkspaceBucket = "draft" | "in_review" | "approved" | "live" | "rejected";

export interface WorkspaceReleaseCardModel {
  id: string;
  title: string;
  primaryArtistName: string;
  releaseTypeLabel: string;
  artworkUrl: string;
  lastEdited: string;
  workspaceBucket: WorkspaceBucket;
  isIncomplete: boolean;
}

export interface ActionIssueModel {
  id: string;
  title: string;
  description: string;
  count: number;
  severity: "critical" | "warning" | "info";
  ctaLabel: string;
  /** First release to deep-link, if any */
  targetReleaseId: string | null;
}

export interface ActivityTimelineItem {
  id: string;
  title: string;
  time: string;
  tone: "success" | "failure" | "warning" | "info" | "neutral";
}

export interface ArtistMusicWorkspaceProps {
  artistDisplayName: string | null;
  releases: WorkspaceReleaseCardModel[];
  statusCounts: Record<WorkspaceBucket, number>;
  actionIssues: ActionIssueModel[];
  activityItems: ActivityTimelineItem[];
  onNavigateCatalog: (bucket: WorkspaceBucket) => void;
  onOpenRelease: (releaseId: string) => void;
  onActionIssue: (issue: ActionIssueModel) => void;
  /** When set (e.g. artist-owner), show primary create actions in the hero. */
  onCreateNewRelease?: () => void;
  onCreateNewTrack?: () => void;
}

const STATUS_CARD_CONFIG: {
  bucket: WorkspaceBucket;
  label: string;
  icon: React.ElementType;
  accent: string;
}[] = [
  {
    bucket: "draft",
    label: "Drafts",
    icon: FileText,
    accent: "from-slate-500/20 to-slate-600/5 border-slate-500/25",
  },
  {
    bucket: "in_review",
    label: "In Review",
    icon: ClipboardList,
    accent: "from-sky-500/20 to-blue-600/5 border-sky-500/30",
  },
  {
    bucket: "approved",
    label: "Approved",
    icon: CheckCircle2,
    accent: "from-emerald-500/20 to-teal-600/5 border-emerald-500/30",
  },
  {
    bucket: "live",
    label: "Live",
    icon: Radio,
    accent: "from-[#ff0050]/25 to-rose-600/5 border-[#ff0050]/35",
  },
  {
    bucket: "rejected",
    label: "Rejected",
    icon: AlertCircle,
    accent: "from-red-500/20 to-red-900/10 border-red-500/30",
  },
];

function badgeForRelease(r: WorkspaceReleaseCardModel): { label: string; className: string } {
  if (r.isIncomplete) {
    return {
      label: "Incomplete",
      className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    };
  }
  switch (r.workspaceBucket) {
    case "draft":
      return {
        label: "Draft",
        className: "bg-muted text-muted-foreground border-border",
      };
    case "in_review":
      return {
        label: "In Review",
        className: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25",
      };
    case "approved":
      return {
        label: "Approved",
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
      };
    case "live":
      return {
        label: "Live",
        className: "bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/25",
      };
    case "rejected":
      return {
        label: "Rejected",
        className: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/25",
      };
    default:
      return { label: "—", className: "bg-muted text-muted-foreground" };
  }
}

function severityStyles(sev: ActionIssueModel["severity"]): string {
  switch (sev) {
    case "critical":
      return "border-red-500/30 bg-red-500/[0.06] hover:border-red-500/50";
    case "warning":
      return "border-amber-500/30 bg-amber-500/[0.06] hover:border-amber-500/50";
    default:
      return "border-border bg-muted/40 hover:border-[#ff0050]/30";
  }
}

function timelineDot(tone: ActivityTimelineItem["tone"]): string {
  switch (tone) {
    case "success":
      return "bg-emerald-500 shadow-[0_0_0_4px] shadow-emerald-500/20";
    case "failure":
      return "bg-red-500 shadow-[0_0_0_4px] shadow-red-500/15";
    case "warning":
      return "bg-amber-500 shadow-[0_0_0_4px] shadow-amber-500/20";
    case "info":
      return "bg-sky-500 shadow-[0_0_0_4px] shadow-sky-500/15";
    default:
      return "bg-muted-foreground/40";
  }
}

function YourReleasesCarousel({
  releases,
  onOpenRelease,
}: {
  releases: WorkspaceReleaseCardModel[];
  onOpenRelease: (releaseId: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || releases.length === 0) return;
    const EPS = 3;

    const onWheel = (e: WheelEvent) => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= EPS) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX >= absY && absX > 0) return;

      if (absY <= 0) return;

      e.preventDefault();
      const factor = 0.9;
      el.scrollBy({
        left: e.deltaY * factor + (e.deltaZ || 0) * factor,
        behavior: "smooth",
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [releases.length]);

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-label="Your releases"
      className={cn(
        "flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scroll-smooth",
        "scrollbar-hide touch-pan-x overscroll-x-contain"
      )}
      style={{ overscrollBehaviorX: "contain" }}
    >
      {releases.map((r) => {
        const b = badgeForRelease(r);
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onOpenRelease(r.id)}
            className={cn(
              "snap-start shrink-0 w-[220px] sm:w-[248px] text-left rounded-2xl border border-border/80 bg-card overflow-hidden",
              "transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0050] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            <div className="aspect-square w-full bg-muted relative">
              <img src={r.artworkUrl} alt="" className="h-full w-full object-cover" draggable={false} />
              <div className="absolute top-2 right-2">
                <span
                  className={cn(
                    "text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md bg-background/70",
                    b.className
                  )}
                >
                  {b.label}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <p className="font-semibold text-sm leading-snug line-clamp-2">{r.title}</p>
              <p className="text-xs text-muted-foreground truncate">{r.primaryArtistName}</p>
              <p className="text-[11px] text-muted-foreground/90 pt-1">{r.releaseTypeLabel}</p>
              <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/60">
                Edited {r.lastEdited}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function ArtistMusicWorkspace({
  artistDisplayName,
  releases,
  statusCounts,
  actionIssues,
  activityItems,
  onNavigateCatalog,
  onOpenRelease,
  onActionIssue,
  onCreateNewRelease,
  onCreateNewTrack,
}: ArtistMusicWorkspaceProps) {
  const showCreateActions = Boolean(onCreateNewRelease && onCreateNewTrack);

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 max-w-[1800px] mx-auto space-y-8 sm:space-y-10 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/30 px-5 py-8 sm:px-8 sm:py-10 shadow-sm">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#ff0050]/10 blur-3xl"
          aria-hidden
        />
        <div
          className={cn(
            "relative flex flex-col gap-6",
            showCreateActions && "lg:flex-row lg:items-end lg:justify-between"
          )}
        >
          <div className="space-y-3 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#ff0050]" aria-hidden />
              Artist control center
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              {artistDisplayName?.trim()
                ? `Welcome back, ${artistDisplayName.trim()}`
                : "Welcome back"}
            </h2>
            <p className="max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              What do you need to do next? Move releases forward with clear tasks completion, review
              readiness, and catalog management.
            </p>
          </div>
          {showCreateActions ? (
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button
                size="lg"
                className="rounded-xl bg-[#ff0050] hover:bg-[#e6004a] text-white shadow-md shadow-[#ff0050]/20 font-semibold"
                onClick={onCreateNewRelease}
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden />
                Create New Release
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl font-semibold border-border/80"
                onClick={onCreateNewTrack}
              >
                <Music2 className="h-4 w-4 mr-2" aria-hidden />
                Create New Track
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      {/* Release status summary */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Release status summary</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Jump into <span className="font-medium text-foreground">My Catalog</span> with one click filtered
            to the status you care about.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {STATUS_CARD_CONFIG.map(({ bucket, label, icon: Icon, accent }) => {
            const count = statusCounts[bucket] ?? 0;
            return (
              <button
                key={bucket}
                type="button"
                onClick={() => onNavigateCatalog(bucket)}
                className={cn(
                  "group relative text-left rounded-2xl border bg-gradient-to-b p-4 sm:p-5 transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0050] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  accent
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 ring-1 ring-border/60">
                    <Icon className="h-5 w-5 text-foreground/80" aria-hidden />
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-4 text-2xl sm:text-3xl font-semibold tabular-nums">{count}</p>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {label}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Action required */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Action required</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Fix blockers first each card sends you to the exact release that needs attention.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {actionIssues.map((issue) => (
            <Card
              key={issue.id}
              className={cn(
                "overflow-hidden transition-colors cursor-pointer group",
                severityStyles(issue.severity)
              )}
              onClick={() => onActionIssue(issue)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold">{issue.title}</CardTitle>
                    <CardDescription className="mt-1.5 text-sm">{issue.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="shrink-0 tabular-nums text-sm font-semibold px-2.5">
                    {issue.count}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex items-center justify-between">
                <span className="text-sm font-medium text-[#ff0050] flex items-center gap-1 group-hover:gap-2 transition-all">
                  {issue.ctaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Your releases carousel */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Your releases</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Scroll horizontally use your mouse wheel over this row for smooth sideways movement.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-[#ff0050] hover:text-[#ff0050]" onClick={() => onNavigateCatalog("draft")}>
            Open catalog
            <ChevronRight className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
        {releases.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No releases in your catalog yet. When releases are added to your account, they will appear here.
            </CardContent>
          </Card>
        ) : (
          <YourReleasesCarousel releases={releases} onOpenRelease={onOpenRelease} />
        )}
      </section>

      {/* Recent activity timeline */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Recent activity</h3>
          <p className="text-sm text-muted-foreground mt-1">Workflow timeline across submissions, QC, and delivery.</p>
        </div>
        <Card className="border-border/80">
          <CardContent className="pt-6">
            <ul className="space-y-0">
              {activityItems.map((item, i) => (
                <li key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center w-6 shrink-0">
                    <span className={cn("mt-1.5 h-2.5 w-2.5 rounded-full shrink-0", timelineDot(item.tone))} />
                    {i < activityItems.length - 1 ? (
                      <span className="w-px flex-1 min-h-[2rem] bg-border mt-1" aria-hidden />
                    ) : null}
                  </div>
                  <div className={cn("pb-8", i === activityItems.length - 1 && "pb-0")}>
                    <p className="text-sm font-medium leading-snug">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

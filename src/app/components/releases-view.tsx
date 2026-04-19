import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Slider } from "@/app/components/ui/slider";
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
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Radio,
  Clock,
  Edit,
  Eye,
  Copy,
  Trash2,
  Music,
  PlayCircle,
  Calendar,
  Download,
  PauseCircle,
  Volume2,
  VolumeX,
  FileSearch,
  Loader2,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { toast } from "sonner";
import { AudioPlayer } from "@/app/components/audio-player";
import { ReleaseInspector } from "@/app/components/release-inspector";
import {
  deleteRelease,
  listReleaseTracks,
  listReleases,
  type ReleaseListItem,
} from "@/services/releaseService";
import {
  artworkEmojiForId,
  formatReleaseDisplayDate,
  releaseArtworkUrlFromFilePath,
} from "@/lib/releaseFormat";
import { useAuth } from "@/app/components/auth/auth-context";

interface ReleasesViewProps {
  onNavigateToUpload?: () => void;
  /** Opens Upload in edit mode and loads this release (PUT). */
  onEditRelease?: (releaseId: string) => void;
}

interface Release {
  id: string;
  title: string;
  artist: string;
  type: "Single" | "EP" | "Album";
  /** Emoji fallback when `artworkImageUrl` is null. */
  artwork: string;
  artworkImageUrl: string | null;
  upc: string;
  releaseDate: string;
  status: "live" | "scheduled" | "draft" | "rejected" | string;
  platforms: number;
  streams: number;
}

/** Sticky player state — audio URLs come from GET /api/releases/:id/tracks. */
interface NowPlayingPreview {
  releaseId: string;
  title: string;
  artist: string;
  audioUrl: string;
  /** Image URL for player cover (track artwork, else release cover). */
  artworkUrl?: string | null;
}

function formatReleaseType(apiType: string | null | undefined): Release["type"] {
  const t = (apiType || "").toLowerCase();
  if (t === "ep") return "EP";
  if (t === "single") return "Single";
  if (t === "album") return "Album";
  return "Single";
}

function normalizeListStatus(apiStatus: string | null | undefined): string {
  const v = (apiStatus || "draft").toLowerCase();
  if (v === "live" || v === "scheduled" || v === "draft" || v === "rejected") {
    return v;
  }
  if (v === "published") return "live";
  if (v === "pending" || v === "submitted") return "scheduled";
  return v || "draft";
}

function mapApiReleaseToRelease(r: ReleaseListItem): Release {
  const id = r.id || "";
  const filePath = r.artwork?.file_path?.trim() || null;
  return {
    id,
    title: r.title?.trim() || "Untitled",
    artist: r.primary_artist_name?.trim() || "—",
    type: formatReleaseType(r.release_type),
    artwork: artworkEmojiForId(id || "0"),
    artworkImageUrl: releaseArtworkUrlFromFilePath(filePath),
    upc: r.upc?.trim() ?? "",
    releaseDate: formatReleaseDisplayDate(r.release_date),
    status: normalizeListStatus(r.status),
    platforms: 0,
    streams: 0,
  };
}

function ReleaseArtworkThumb({
  imageUrl,
  emoji,
  className,
}: {
  imageUrl: string | null;
  emoji: string;
  className: string;
}) {
  if (imageUrl) {
    return (
      <div
        className={cn(
          "rounded-xl flex-shrink-0 overflow-hidden bg-zinc-800 ring-1 ring-white/10",
          className
        )}
      >
        <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
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

function ReleaseTypePill({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-800/90 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-white/10">
      {type}
    </span>
  );
}

function ReleaseStatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  switch (s) {
    case "live":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
          <Radio className="h-3 w-3 shrink-0" aria-hidden />
          Live
        </span>
      );
    case "scheduled":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-sky-300 ring-1 ring-sky-500/40">
          <Clock className="h-3 w-3 shrink-0" aria-hidden />
          Scheduled
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700 px-2.5 py-0.5 text-xs font-medium text-zinc-100 ring-1 ring-white/10">
          <Edit className="h-3 w-3 shrink-0" aria-hidden />
          Draft
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center rounded-full bg-red-950/80 px-2.5 py-0.5 text-xs font-medium text-red-300 ring-1 ring-red-500/30">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-200">
          {status}
        </span>
      );
  }
}

type ReleaseGridCardProps = {
  release: Release;
  isStandardViewer: boolean;
  deletingReleaseId: string | null;
  onPlayPreview: (r: Release) => void;
  onDownload: (r: Release) => void;
  onInspect: (id: string) => void;
  onEdit: (id: string) => void;
  onDeleteRequest: (r: Release) => void;
};

function ReleaseGridCard({
  release,
  isStandardViewer,
  deletingReleaseId,
  onPlayPreview,
  onDownload,
  onInspect,
  onEdit,
  onDeleteRequest,
}: ReleaseGridCardProps) {
  return (
    <div className="group rounded-xl border border-white/5 bg-[#1c1c1c] text-[#888888] shadow-sm transition-all hover:border-white/10 hover:shadow-md">
      {/* Top: artwork + main info */}
      <div className="p-4 sm:p-5">
        <div className="flex gap-4">
          <ReleaseArtworkThumb
            imageUrl={release.artworkImageUrl}
            emoji={release.artwork}
            className="h-20 w-20 shrink-0 text-3xl sm:text-[2rem]"
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
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 shrink-0 p-0 text-[#888888] hover:bg-white/5 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[11rem]">
                  <DropdownMenuItem onClick={() => onPlayPreview(release)}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Play Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload(release)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onInspect(release.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  {!isStandardViewer && (
                    <DropdownMenuItem onClick={() => onEdit(release.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  {!isStandardViewer && (
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={deletingReleaseId === release.id}
                      onClick={() => onDeleteRequest(release)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <ReleaseTypePill type={release.type} />
              <ReleaseStatusPill status={release.status} />
            </div>

            <div className="mt-3 space-y-1.5">
              {release.releaseDate ? (
                <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                  <Calendar className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                  <span className="truncate">{release.releaseDate}</span>
                </div>
              ) : null}
              {release.status === "live" && (
                <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                  <PlayCircle className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                  <span className="truncate">{(release.streams / 1000).toFixed(0)}k streams</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inset divider */}
      <div className="border-t border-white/[0.08] px-4 sm:px-5" aria-hidden />

      {/* Footer meta */}
      <div className="flex flex-col gap-1 px-4 pb-4 pt-3 text-xs text-[#888888] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="truncate">
          UPC: {release.upc?.trim() ? release.upc : "—"}
        </span>
        <span className="shrink-0 whitespace-nowrap">
          {release.platforms} {release.platforms === 1 ? "platform" : "platforms"}
        </span>
      </div>
    </div>
  );
}

export function ReleasesView({ onNavigateToUpload, onEditRelease }: ReleasesViewProps) {
  const { user } = useAuth();
  /** API `standard_viewer` → app role `viewer`; read-only on Releases. */
  const isStandardViewer = user?.role === "viewer";

  const [releases, setReleases] = useState<Release[]>([]);
  const [loadingReleases, setLoadingReleases] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [nowPlaying, setNowPlaying] = useState<NowPlayingPreview | null>(null);
  const [inspectingRelease, setInspectingRelease] = useState<string | null>(null);
  const [deletingReleaseId, setDeletingReleaseId] = useState<string | null>(null);
  const [releasePendingDelete, setReleasePendingDelete] = useState<Release | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingReleases(true);
      try {
        const list = await listReleases();
        if (!cancelled) {
          setReleases(list.map(mapApiReleaseToRelease));
        }
      } catch (err) {
        if (!cancelled) {
          setReleases([]);
          const message = err instanceof Error ? err.message : "Failed to load releases";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingReleases(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalCount = releases.length;
  const liveCount = releases.filter((r) => r.status === "live").length;
  const scheduledCount = releases.filter((r) => r.status === "scheduled").length;
  const draftCount = releases.filter((r) => r.status === "draft").length;

  // Filter releases based on search and filters
  const filteredReleases = releases.filter((release) => {
    // Search filter
    const upc = release.upc || "";
    const matchesSearch = searchQuery === "" || 
      release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      upc.includes(searchQuery);

    // Type filter
    const matchesType = typeFilter === "all" || 
      release.type.toLowerCase() === typeFilter.toLowerCase();

    // Status filter
    const matchesStatus = statusFilter === "all-status" || 
      release.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handlePlayPreview = (release: Release) => {
    void (async () => {
      const dismiss = toast.loading("Loading preview…");
      try {
        const tracks = await listReleaseTracks(release.id);
        const firstWithAudio = tracks.find((t) => t.audio?.file_path?.trim());
        if (!firstWithAudio) {
          toast.error("No audio in this release yet.", { id: dismiss });
          return;
        }
        const audioUrl = releaseArtworkUrlFromFilePath(firstWithAudio.audio?.file_path);
        if (!audioUrl) {
          toast.error("No audio preview available.", { id: dismiss });
          return;
        }
        const trackArt = releaseArtworkUrlFromFilePath(firstWithAudio.artwork?.file_path);
        setNowPlaying({
          releaseId: release.id,
          title: firstWithAudio.title?.trim() || release.title,
          artist: release.artist,
          audioUrl,
          artworkUrl: trackArt ?? release.artworkImageUrl,
        });
        toast.dismiss(dismiss);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load tracks";
        toast.error(message, { id: dismiss });
      }
    })();
  };

  const handleDownload = (release: Release) => {
    void (async () => {
      try {
        const tracks = await listReleaseTracks(release.id);
        const firstWithAudio = tracks.find((t) => t.audio?.file_path?.trim());
        const url = firstWithAudio
          ? releaseArtworkUrlFromFilePath(firstWithAudio.audio?.file_path)
          : null;
        if (!url) {
          toast.error("No audio file available for this release.");
          return;
        }
        window.open(url, "_blank", "noopener,noreferrer");
        toast.success("Download started");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load tracks";
        toast.error(message);
      }
    })();
  };

  const handleInspect = (releaseId: string) => {
    setInspectingRelease(releaseId);
  };

  const handleEditRelease = (releaseId: string) => {
    if (onEditRelease) {
      onEditRelease(releaseId);
    } else if (onNavigateToUpload) {
      onNavigateToUpload();
    } else {
      toast.info("Open Upload from the sidebar to edit release details.");
    }
  };

  const confirmDeleteRelease = async () => {
    const release = releasePendingDelete;
    if (!release || deletingReleaseId) return;
    setDeletingReleaseId(release.id);
    try {
      const res = await deleteRelease(release.id);
      toast.success(res.message?.trim() || "Deleted successfully");
      setReleases((prev) => prev.filter((r) => r.id !== release.id));
      if (nowPlaying?.releaseId === release.id) {
        setNowPlaying(null);
      }
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
                  <span className="font-medium text-foreground">
                    {releasePendingDelete.title}
                  </span>{" "}
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
            Sure
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // If inspecting a release, show the inspector
  if (inspectingRelease) {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Releases</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your music releases
          </p>
        </div>
        {!isStandardViewer && (
          <Button
            size="sm"
            className="bg-[#ff0050] hover:bg-[#cc0040]"
            onClick={onNavigateToUpload}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Release
          </Button>
        )}
      </div>

      {/* Audio Player - Fixed at top when playing */}
      {nowPlaying && (
        <div className="sticky top-0 z-10">
          <AudioPlayer
            title={nowPlaying.title}
            artist={nowPlaying.artist}
            audioUrl={nowPlaying.audioUrl}
            artwork={nowPlaying.artworkUrl ?? undefined}
            onClose={() => setNowPlaying(null)}
          />
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Releases</p>
                <p className="text-2xl font-semibold mt-1">
                  {loadingReleases ? "—" : totalCount.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Music className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent> 
        </Card>
 
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live</p>
                <p className="text-2xl font-semibold mt-1">
                  {loadingReleases ? "—" : liveCount.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Radio className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-semibold mt-1">
                  {loadingReleases ? "—" : scheduledCount.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-semibold mt-1">
                  {loadingReleases ? "—" : draftCount.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Edit className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <Card>
        <CardContent className="pt-6 px-3.5 sm:px-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, artist, UPC, or ISRC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select defaultValue="all" onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-auto md:w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Singles</SelectItem>
                  <SelectItem value="ep">EPs</SelectItem>
                  <SelectItem value="album">Albums</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-status" onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-auto md:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Releases</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loadingReleases ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Loading releases…</p>
          ) : filteredReleases.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">No releases match your filters.</p>
          ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReleases.map((release) => (
              <ReleaseGridCard
                key={release.id}
                release={release}
                isStandardViewer={isStandardViewer}
                deletingReleaseId={deletingReleaseId}
                onPlayPreview={handlePlayPreview}
                onDownload={handleDownload}
                onInspect={handleInspect}
                onEdit={handleEditRelease}
                onDeleteRequest={setReleasePendingDelete}
              />
            ))}
          </div>
          )}
        </TabsContent>

        <TabsContent value="live" className="mt-6">
          {loadingReleases ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Loading releases…</p>
          ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {releases
              .filter((r) => r.status === "live")
              .map((release) => (
                <ReleaseGridCard
                  key={release.id}
                  release={release}
                  isStandardViewer={isStandardViewer}
                  deletingReleaseId={deletingReleaseId}
                  onPlayPreview={handlePlayPreview}
                  onDownload={handleDownload}
                  onInspect={handleInspect}
                  onEdit={handleEditRelease}
                  onDeleteRequest={setReleasePendingDelete}
                />
              ))}
          </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          {loadingReleases ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Loading releases…</p>
          ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {releases
              .filter((r) => r.status === "scheduled")
              .map((release) => (
                <ReleaseGridCard
                  key={release.id}
                  release={release}
                  isStandardViewer={isStandardViewer}
                  deletingReleaseId={deletingReleaseId}
                  onPlayPreview={handlePlayPreview}
                  onDownload={handleDownload}
                  onInspect={handleInspect}
                  onEdit={handleEditRelease}
                  onDeleteRequest={setReleasePendingDelete}
                />
              ))}
          </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          {loadingReleases ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Loading releases…</p>
          ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {releases
              .filter((r) => r.status === "draft")
              .map((release) => (
                <ReleaseGridCard
                  key={release.id}
                  release={release}
                  isStandardViewer={isStandardViewer}
                  deletingReleaseId={deletingReleaseId}
                  onPlayPreview={handlePlayPreview}
                  onDownload={handleDownload}
                  onInspect={handleInspect}
                  onEdit={handleEditRelease}
                  onDeleteRequest={setReleasePendingDelete}
                />
              ))}
          </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    {deleteConfirmDialog}
    </>
  );
}
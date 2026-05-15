/**
 * Create Release (Audio Workspace) — Section 3
 * Replaces legacy upload marketing panels with a structured release-creation flow.
 */
import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Switch } from "@/app/components/ui/switch";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Popover, PopoverAnchor, PopoverContent } from "@/app/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Music,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
  FileAudio,
  X,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { VideoReleaseWorkspace } from "@/app/components/video-release-workspace";
import { toast } from "sonner";
import {
  createRelease,
  createReleaseJson,
  createReleaseTrackJson,
  attachExistingTrackToRelease,
  fetchReleaseTrackList,
  getRelease,
  getTrack,
  isLikelyServerTrackId,
  listAllTracks,
  listReleases,
  normalizeReleaseMetadata,
  requestAssetSignedUpload,
  TrackNotFoundError,
  updateRelease,
  updateTrack,
  uploadBinaryToSignedUrl,
  uploadReleaseArtwork,
  uploadTrackAsset,
} from "@/services/releaseService";
import type {
  CreateReleaseMultipartPayload,
  CreateReleaseResponse,
  CreateTrackJsonPayload,
  CreateTrackResponse,
  ReleaseContributorApi,
  ReleaseListItem,
  ReleaseTrackItem,
  ReleaseWriterApi,
  TrackAssetInfo,
  UpdateTrackJsonPayload,
} from "@/services/releaseService";
import {
  formatReleaseDisplayDate,
  normalizeOriginalReleaseDateForApi,
  releaseArtworkUrlFromFilePath,
} from "@/lib/releaseFormat";
import { emitReleaseCatalogChanged } from "@/lib/releaseEvents";
import type { Section4Focus } from "@/lib/section4Validation";
import { useAuth, useOrganizationId } from "@/app/components/auth/auth-context";
import { listOrganizationUsers } from "@/services/organizationService";

const DRAFT_STORAGE_KEY = "cage-create-release-workspace-v1";

const MOCK_ARTISTS = [
  { id: "a1", name: "The Waves" },
  { id: "a2", name: "Nova Echo" },
  { id: "a3", name: "Studio Collective" },
];

const GENRES = ["Pop", "Hip-Hop", "R&B", "Rock", "Electronic", "Country", "Jazz", "Classical", "Latin", "Other"];

/** Map API / metadata genre strings to a `Select` value from {@link GENRES} (case, underscores). */
function canonicalReleaseGenreForSelect(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const lower = t.toLowerCase();
  const direct = GENRES.find((g) => g.toLowerCase() === lower);
  if (direct) return direct;
  const unders = lower.replace(/_/g, " ");
  const loose = GENRES.find((g) => g.toLowerCase().replace(/_/g, " ") === unders);
  return loose ?? t;
}

/** Walk nested `metadata` (objects / arrays) for snake or camel genre keys. */
function deepPickGenreFromMetadata(meta: unknown, which: "primary" | "secondary"): string {
  const want =
    which === "primary"
      ? new Set(["primarygenre", "genreprimary", "maingenre"])
      : new Set(["secondarygenre", "genresecondary", "altgenre"]);
  const walk = (node: unknown, depth: number): string => {
    if (depth > 16 || node == null) return "";
    if (Array.isArray(node)) {
      for (const el of node) {
        const hit = walk(el, depth + 1);
        if (hit) return hit;
      }
      return "";
    }
    if (typeof node !== "object") return "";
    const o = node as Record<string, unknown>;
    for (const [k, v] of Object.entries(o)) {
      const nk = k.replace(/_/g, "").toLowerCase();
      if (want.has(nk)) {
        if (typeof v === "string" && v.trim()) return v.trim();
        if (typeof v === "number" && Number.isFinite(v)) return String(v);
      }
    }
    for (const v of Object.values(o)) {
      const hit = walk(v, depth + 1);
      if (hit) return hit;
    }
    return "";
  };
  return walk(meta, 0);
}

function genreFromFlatJsonValues(flat: Record<string, string>, which: "primary" | "secondary"): string {
  for (const val of Object.values(flat)) {
    const s = (val ?? "").trim();
    if (!s || s[0] !== "{") continue;
    try {
      const parsed = JSON.parse(s) as unknown;
      const got = deepPickGenreFromMetadata(parsed, which);
      if (got) return got;
    } catch {
      /* skip */
    }
  }
  return "";
}

/** Static performer role ids (API-style snake_case); shown with humanized labels in the Add performer dialog. */
const PERFORMER_ROLE_GROUPS: { label: string; roles: readonly string[] }[] = [
  {
    label: "Vocals & performance",
    roles: [
      "performer",
      "lead_vocalist",
      "background_vocalist",
      "vocalist",
      "rapper",
      "singer",
      "spoken_word",
    ],
  },
  {
    label: "Instrumental",
    roles: [
      "instrumentalist",
      "guitarist",
      "bassist",
      "drummer",
      "percussionist",
      "keyboardist",
      "pianist",
      "synth_player",
      "violinist",
      "cellist",
      "brass_player",
      "woodwind_player",
    ],
  },
  {
    label: "DJ",
    roles: ["dj", "turntablist"],
  },
  {
    label: "Ensemble",
    roles: ["ensemble", "orchestra", "band_member"],
  },
];

/** Static credit role ids (API-style snake_case); Add credit dialog picker. */
const CREDIT_ROLE_GROUPS: { label: string; roles: readonly string[] }[] = [
  {
    label: "Production",
    roles: ["producer", "co_producer", "executive_producer"],
  },
  {
    label: "Composition & writing",
    roles: ["composer", "songwriter", "lyricist", "arranger"],
  },
  {
    label: "Programming & sound",
    roles: ["programmer", "beat_maker", "sound_designer"],
  },
];

const ALL_PERFORMER_ROLE_IDS = new Set(PERFORMER_ROLE_GROUPS.flatMap((g) => [...g.roles]));
const ALL_CREDIT_ROLE_IDS = new Set(CREDIT_ROLE_GROUPS.flatMap((g) => [...g.roles]));

function humanizeSnakeCaseRoleId(id: string): string {
  return id
    .split("_")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Thin scrollbar with rounded thumb/track (track metadata modal body). */
const TRACK_METADATA_SCROLL_AREA =
  "[scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.4)_hsl(var(--muted)/0.12)] " +
  "[&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar]:h-[4px] " +
  "[&::-webkit-scrollbar-track]:rounded-md [&::-webkit-scrollbar-track]:bg-muted/12 " +
  "[&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:bg-muted-foreground/32 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/48";

const TRACK_PROPERTY_OPTIONS = [
  { id: "remix_derivative", label: "Remix or Derivative" },
  { id: "samples_stock", label: "Samples or Stock" },
  { id: "compilation", label: "Compilation" },
  { id: "alternate_version", label: "Alternate Version" },
  { id: "special_genre", label: "Special Genre" },
  { id: "non_musical", label: "Non-Musical Content" },
  { id: "includes_ai", label: "Includes AI" },
  { id: "none", label: "None of the Above" },
];

export interface UploadContentProps {
  editReleaseId?: string | null;
  onEditConsumed?: () => void;
}

type WorkspaceKind = "audio" | "video";

export interface UploadFile {
  id: string;
  name: string;
  type: "audio" | "video" | "image" | "document";
  size: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  file?: File;
  /** Presigned URL from GET track/release when there is no local `File` yet. */
  remoteUrl?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** In-browser preview for a local audio File; revokes object URL on unmount. */
function TrackLocalAudioPreview({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  if (!url) return null;
  return (
    <audio controls preload="metadata" className="mt-3 h-9 w-full max-w-md rounded-md" src={url}>
      Your browser does not support audio preview.
    </audio>
  );
}

/**
 * Audio preview for a remote (R2 presigned) URL.
 *
 * R2 presigned URLs are short-lived and signed for a specific HTTP method. When the browser's
 * `<audio>` element fetches the URL with GET, the server can return **403 Forbidden** if the
 * signature has expired or wasn't issued for read access. To avoid leaving the user with a
 * broken-looking player, this component:
 *  - Tries once to silently refresh the presigned URL by calling `getTrack(serverTrackId)`
 *    again and swapping in the new `file_path`.
 *  - If a second 403 happens (or no `serverTrackId` is available), it replaces the player with
 *    a small "Preview unavailable" hint instead of showing a broken control.
 */
function TrackRemoteAudioPreview({
  initialUrl,
  serverTrackId,
}: {
  initialUrl: string;
  serverTrackId?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [refreshed, setRefreshed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setUrl(initialUrl);
    setRefreshed(false);
    setFailed(false);
  }, [initialUrl]);

  const handleError = async () => {
    if (refreshed || !serverTrackId || !isLikelyServerTrackId(serverTrackId)) {
      setFailed(true);
      return;
    }
    setRefreshed(true);
    try {
      const detail = await getTrack(serverTrackId);
      const fresh = typeof detail.audio?.file_path === "string" ? detail.audio.file_path.trim() : "";
      const next = fresh ? releaseArtworkUrlFromFilePath(fresh) ?? fresh : "";
      if (next && next !== url) {
        setUrl(next);
        return;
      }
    } catch {
      /* ignore — fall through to failed state below */
    }
    setFailed(true);
  };

  if (failed) {
    return (
      <p className="mt-3 text-xs text-muted-foreground">
        Audio preview is temporarily unavailable. Try reopening this track in a moment.
      </p>
    );
  }

  return (
    <audio
      key={url}
      controls
      preload="metadata"
      className="mt-3 h-9 w-full max-w-md rounded-md"
      src={url}
      onError={() => {
        void handleError();
      }}
    >
      Your browser does not support audio preview.
    </audio>
  );
}

const AUDIO_EXT = new Set(["wav", "mp3", "flac", "m4a", "aac", "ogg", "aiff", "aif", "webm", "ec3"]);

function mimeForSignedUpload(file: File): string {
  const t = file.type?.trim();
  if (t) return t;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  return "image/jpeg";
}

/** Accept JPG/PNG when the browser reports empty or non-standard MIME types (common on Windows). */
function isAllowedCoverImageFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (/\.(jpe?g|png)$/i.test(name)) return true;
  const t = (file.type ?? "").trim().toLowerCase();
  if (!t) return /\.(jpe?g|png)$/i.test(name);
  return /^image\/(jpeg|jpg|pjpeg|png|x-png)$/i.test(t);
}

/** API signed-upload for covers expects `file_type` like `cover/jpg` (see Postman), not raw MIME. */
function signedUploadArtworkFileType(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "png") return "cover/png";
  if (ext === "jpg" || ext === "jpeg") return "cover/jpg";
  const t = file.type?.trim();
  if (t === "image/png") return "cover/png";
  if (t === "image/jpeg" || t === "image/jpg") return "cover/jpg";
  return "cover/jpg";
}

function signedUploadAudioFileType(file: File): string {
  const t = file.type?.trim();
  if (t) return t;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "wav") return "audio/wav";
  if (ext === "mp3") return "audio/mpeg";
  if (ext === "flac") return "audio/flac";
  if (ext === "m4a" || ext === "aac") return "audio/mp4";
  return "application/octet-stream";
}

function fileToUploadType(file: File): UploadFile["type"] {
  const t = file.type;
  if (t.startsWith("audio/")) return "audio";
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && AUDIO_EXT.has(ext)) return "audio";
  if (t.startsWith("video/")) return "video";
  if (t.startsWith("image/")) return "image";
  return "document";
}

function resolveReleaseCoverDisplayUrl(r: ReleaseListItem): string | null {
  const row = r as unknown as Record<string, unknown>;
  const fp =
    r.artwork?.file_path ??
    (typeof row.artwork_file_path === "string" ? row.artwork_file_path : null) ??
    (typeof row.cover_path === "string" ? row.cover_path : null);
  if (fp != null && String(fp).trim()) {
    return releaseArtworkUrlFromFilePath(String(fp).trim());
  }
  for (const key of ["artwork_url", "cover_image_url", "artwork_file_url"] as const) {
    const v = row[key];
    if (typeof v === "string" && v.trim()) {
      return releaseArtworkUrlFromFilePath(v.trim());
    }
  }
  return null;
}

function withImageCacheBust(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}cb=${Date.now()}`;
}

function trackAssetToUploadFile(
  asset: TrackAssetInfo | null | undefined,
  type: UploadFile["type"]
): UploadFile | null {
  if (!asset) return null;
  const fileName = asset.file_name?.trim();
  const id = asset.id?.trim();
  if (!fileName && !id) return null;
  const rawPath = typeof asset.file_path === "string" ? asset.file_path.trim() : "";
  /** Normalize Laravel-style relative paths (`uploads/audio/...`) into a fully-qualified URL. */
  const remoteUrl = rawPath ? releaseArtworkUrlFromFilePath(rawPath) ?? rawPath : "";
  return {
    id: id || `${type}-${fileName || "asset"}`,
    name: fileName || `${type} file`,
    type,
    size: typeof asset.file_size === "number" && asset.file_size >= 0 ? formatBytes(asset.file_size) : "Unknown",
    progress: 100,
    status: "complete",
    remoteUrl: remoteUrl || undefined,
  };
}

type ContributorKind = "featuring" | "with" | "remixer" | "performer" | "credit";

const CONTRIBUTOR_ORG_PICKER_KINDS: readonly ContributorKind[] = ["featuring", "with", "remixer"];

/** Contributor dialogs that show the organization user list when signed in to an org. */
const CONTRIBUTOR_ORG_LIST_KINDS: readonly ContributorKind[] = [
  "featuring",
  "with",
  "remixer",
  "performer",
  "credit",
];

interface ContributorRow {
  id: string;
  kind: ContributorKind;
  name: string;
  roleDetail: string;
  /** Set when the user is chosen from the org users API (same as primary artist). */
  userId?: string | null;
  /**
   * Server-side contributor pivot id (`release_contributors.id`). Present on rows hydrated from
   * an existing release; sent in `deleted_contributor_ids` when this row is removed during edit.
   */
  serverContributorId?: string | null;
}

function mergeJsonApiAttributes(row: Record<string, unknown>): Record<string, unknown> {
  const attrs = row.attributes;
  if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
    return { ...(attrs as Record<string, unknown>), ...row };
  }
  return row;
}

function parseUserIdForApi(id: string | null | undefined): number | undefined {
  if (id == null || !String(id).trim()) return undefined;
  const n = parseInt(String(id).trim(), 10);
  return Number.isFinite(n) ? n : undefined;
}

/** Maps workspace contributor rows to API `contributors[].role` (snake_case). */
function contributorRowToApiRole(c: ContributorRow): string {
  switch (c.kind) {
    case "featuring":
      return "featuring_artist";
    case "with":
      return "with_artist";
    case "remixer":
      return "remixer";
    case "credit": {
      const d = c.roleDetail.trim();
      if (!d) return "credit";
      const first = d
        .split(",")
        .map((s) => s.trim().toLowerCase().replace(/\s+/g, "_"))
        .find(Boolean);
      if (first && ALL_CREDIT_ROLE_IDS.has(first)) return first;
      return "credit";
    }
    case "performer": {
      const d = c.roleDetail.trim();
      if (!d) return "performer";
      const first = d
        .split(",")
        .map((s) => s.trim().toLowerCase().replace(/\s+/g, "_"))
        .find(Boolean);
      if (first && ALL_PERFORMER_ROLE_IDS.has(first)) return first;
      return first || "performer";
    }
    default:
      return "credit";
  }
}

/** Laravel PUT often requires `contributors[0].user_id` for the primary artist row. */
function buildContributorsForReleaseApi(
  mainArtistName: string,
  mainArtistId: string | null,
  rows: ContributorRow[],
  opts?: { fallbackPrimaryArtistUserId?: string | null }
): ReleaseContributorApi[] {
  const out: ReleaseContributorApi[] = [];
  const primaryName = mainArtistName.trim();
  if (primaryName) {
    const uid =
      parseUserIdForApi(mainArtistId) ?? parseUserIdForApi(opts?.fallbackPrimaryArtistUserId ?? null);
    const row: ReleaseContributorApi = { name: primaryName, role: "primary_artist" };
    if (uid !== undefined) row.user_id = uid;
    out.push(row);
  }
  for (const c of rows) {
    const n = c.name.trim();
    if (!n) continue;
    const uid = parseUserIdForApi(c.userId ?? null);
    const row: ReleaseContributorApi = { name: n, role: contributorRowToApiRole(c) };
    if (uid !== undefined) row.user_id = uid;
    out.push(row);
  }
  return out;
}

/**
 * One row of the **effective** Track Contributors list — exactly what is rendered in the
 * track dialog. The API request must be built from this same shape, never from the raw
 * `track.trackContributors` + `release.contributors`, so removing a row in the UI guarantees
 * it disappears from the request too.
 */
interface EffectiveTrackContributorRow {
  row: ContributorRow;
  inherited: boolean;
  /** Original release `ContributorRow.id` when `inherited` — used by × to record a track-only hide. */
  releaseContributorId?: string;
}

/**
 * Single source of truth for "what shows in the Track Contributors UI" — used by both the
 * render layer (`buildTrackContributorView` inside the component) AND the API builder
 * (`buildTrackContributorsForApi`) below. Whatever the UI hides is also hidden from the
 * request.
 */
function getEffectiveTrackContributorRows(
  track: TrackWorkspace,
  releaseContributors: ContributorRow[]
): EffectiveTrackContributorRow[] {
  const hidden = new Set(track.trackHiddenReleaseContributorIds);
  const inherited: EffectiveTrackContributorRow[] = releaseContributors
    .filter((c) => !hidden.has(c.id))
    .map((c) => ({
      row: c,
      inherited: true,
      releaseContributorId: c.id,
    }));
  const own: EffectiveTrackContributorRow[] = track.trackContributors.map((c) => ({
    row: c,
    inherited: false,
  }));
  return [...inherited, ...own];
}

/**
 * Build the `contributors` array for `POST /api/releases/:id/tracks` and `PUT /api/tracks/:id`
 * from the same effective view used to render the Track Contributors section. Any row hidden
 * (or removed) in the UI is automatically excluded from the request.
 *
 *  - Primary artist: track-specific if set; otherwise the release primary, unless the user
 *    hid it via × on this track (`trackHideReleasePrimary`).
 *  - Additional rows: `getEffectiveTrackContributorRows(track, release.contributors)`.
 *
 * Deduplicates on `name|role` (case/whitespace-normalized) so a row appearing in both
 * inherited and track-only sources isn't sent twice.
 */
function buildTrackContributorsForApi(
  track: TrackWorkspace,
  release: {
    mainArtistName: string;
    mainArtistId: string | null;
    contributors: ContributorRow[];
    fallbackPrimaryArtistUserId?: string | null;
    /** Org roster used to resolve `user_id` for manually-typed contributor names. */
    orgRoster?: OrgRosterEntry[];
  }
): ReleaseContributorApi[] {
  const out: ReleaseContributorApi[] = [];
  const seen = new Set<string>();
  const push = (row: ReleaseContributorApi) => {
    const key = `${row.name.trim().toLowerCase()}|${row.role.trim().toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(row);
  };
  const resolveUid = (explicitId: string | null | undefined, name: string): number | undefined => {
    const direct = parseUserIdForApi(explicitId ?? null);
    if (direct !== undefined) return direct;
    if (release.orgRoster && release.orgRoster.length > 0) {
      return parseUserIdForApi(resolveOrgRosterUserIdString(name, release.orgRoster));
    }
    return undefined;
  };

  const trackPrimary = track.trackMainArtistName.trim();
  if (trackPrimary) {
    const uid = resolveUid(track.trackMainArtistId, trackPrimary);
    const row: ReleaseContributorApi = { name: trackPrimary, role: "primary_artist" };
    if (uid !== undefined) row.user_id = uid;
    push(row);
  } else if (!track.trackHideReleasePrimary && release.mainArtistName.trim()) {
    const name = release.mainArtistName.trim();
    const uid =
      parseUserIdForApi(release.mainArtistId) ??
      parseUserIdForApi(release.fallbackPrimaryArtistUserId ?? null) ??
      (release.orgRoster ? parseUserIdForApi(resolveOrgRosterUserIdString(name, release.orgRoster)) : undefined);
    const row: ReleaseContributorApi = { name, role: "primary_artist" };
    if (uid !== undefined) row.user_id = uid;
    push(row);
  }

  /** Build from the rendered view — guarantees parity between what the user sees and what's sent. */
  for (const v of getEffectiveTrackContributorRows(track, release.contributors)) {
    const n = v.row.name.trim();
    if (!n) continue;
    const uid = resolveUid(v.row.userId ?? null, n);
    const row: ReleaseContributorApi = { name: n, role: contributorRowToApiRole(v.row) };
    if (uid !== undefined) row.user_id = uid;
    push(row);
  }

  return out;
}

/**
 * Prefer embedded `contributors[].user_id` from GET release when the roster id was not stored in metadata.
 * Only use an explicit `primary_artist` row — credits-only `contributors[]` must not supply the primary id.
 */
function parsePrimaryArtistUserIdFromReleaseDetail(r: ReleaseListItem): string | null {
  const raw = r as unknown as Record<string, unknown>;
  const contribs = raw.contributors;
  if (!Array.isArray(contribs) || contribs.length === 0) return null;
  const primaryRow = contribs.find((c) => {
    if (!c || typeof c !== "object") return false;
    const o = mergeJsonApiAttributes(c as Record<string, unknown>);
    const role = pickContributorRole(o)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    return role === "primary_artist" || role === "primaryartist";
  });
  if (!primaryRow || typeof primaryRow !== "object") return null;
  const merged = mergeJsonApiAttributes(primaryRow as Record<string, unknown>);
  const uidVal = merged.user_id;
  if (uidVal == null) return null;
  const n = parseInt(String(uidVal).trim(), 10);
  return Number.isFinite(n) ? String(n) : null;
}

/**
 * Returns the `pivot` sub-object from a Laravel `withPivot()` response when present,
 * otherwise an empty record. Used for both pivot id and pivot role lookups.
 */
function pickContributorPivotObject(
  row: Record<string, unknown>
): Record<string, unknown> {
  const pivot = (row as { pivot?: unknown }).pivot;
  if (pivot && typeof pivot === "object" && !Array.isArray(pivot)) {
    return pivot as Record<string, unknown>;
  }
  return {};
}

/**
 * Reads the contributor pivot id (`release_contributors.id`) from a single contributor row.
 *
 * IMPORTANT: When the API returns a Laravel pivot row, the **top-level** `id` is the master
 * contributor entity id (e.g. people / contributors table), while `pivot.id` is the join row id
 * we actually need for `deleted_contributor_ids`. So we must check `pivot.id` first.
 */
function pickContributorPivotId(row: Record<string, unknown>): string | null {
  const pivot = pickContributorPivotObject(row);
  const candidates: unknown[] = [
    pivot.id,
    row.pivot_id,
    /** Fallback for older shapes that flatten the pivot id onto the row itself. */
    Object.keys(pivot).length === 0 ? row.id : null,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
    if (typeof c === "number" && Number.isFinite(c)) return String(c);
  }
  return null;
}

/** Returns the role a contributor row should be mapped to — pivot wins over top-level. */
function pickContributorRole(row: Record<string, unknown>): string {
  const pivot = pickContributorPivotObject(row);
  const pivotRole = typeof pivot.role === "string" ? pivot.role : "";
  if (pivotRole.trim()) return pivotRole;
  return typeof row.role === "string" ? row.role : "";
}

/** Hydrate Section 2 rows from GET release `contributors` when metadata has no `workspace_contributors`. */
function parseAdditionalContributorsFromReleaseDetail(r: ReleaseListItem): ContributorRow[] {
  const raw = r as unknown as Record<string, unknown>;
  const contribs = raw.contributors;
  if (!Array.isArray(contribs) || contribs.length === 0) return [];
  const out: ContributorRow[] = [];
  let i = 0;
  for (const row of contribs) {
    if (!row || typeof row !== "object") continue;
    const o = mergeJsonApiAttributes(row as Record<string, unknown>);
    const roleNorm = pickContributorRole(o)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    if (roleNorm === "primary_artist" || roleNorm === "primaryartist") continue;
    const name = String(o.name ?? "").trim();
    if (!name) continue;
    const uidVal = o.user_id;
    const uidParsed = uidVal != null ? parseInt(String(uidVal).trim(), 10) : NaN;
    const userId = Number.isFinite(uidParsed) ? String(uidParsed) : null;
    const serverContributorId = pickContributorPivotId(o);
    const id = `api-c-${i++}-${Math.random().toString(36).slice(2, 10)}`;
    if (roleNorm === "featuring_artist" || roleNorm === "featuring") {
      out.push({ id, kind: "featuring", name, roleDetail: "", userId, serverContributorId });
      continue;
    }
    if (roleNorm === "with_artist" || roleNorm === "with") {
      out.push({ id, kind: "with", name, roleDetail: "", userId, serverContributorId });
      continue;
    }
    if (roleNorm === "remixer") {
      out.push({ id, kind: "remixer", name, roleDetail: "", userId, serverContributorId });
      continue;
    }
    if (ALL_PERFORMER_ROLE_IDS.has(roleNorm)) {
      out.push({ id, kind: "performer", name, roleDetail: roleNorm, userId, serverContributorId });
      continue;
    }
    if (ALL_CREDIT_ROLE_IDS.has(roleNorm)) {
      out.push({ id, kind: "credit", name, roleDetail: roleNorm, userId, serverContributorId });
      continue;
    }
    out.push({
      id,
      kind: "credit",
      name,
      roleDetail: roleNorm || "credit",
      userId,
      serverContributorId,
    });
  }
  return out;
}

const CONTRIBUTOR_KIND_SET = new Set<ContributorKind>(["featuring", "with", "remixer", "performer", "credit"]);

/** Parse `workspace_contributors` JSON (possibly double-encoded) into validated rows. */
function normalizeWorkspaceContributorsRows(input: unknown): ContributorRow[] {
  if (!Array.isArray(input)) return [];
  const out: ContributorRow[] = [];
  let i = 0;
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const name = String(o.name ?? "").trim();
    if (!name) continue;
    const apiRole = String(o.role ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    const rdRaw = String(o.roleDetail ?? o.role_detail ?? "").trim();
    const rdNorm = rdRaw.toLowerCase().replace(/\s+/g, "_");

    let kind = String(o.kind ?? "").trim() as ContributorKind;
    if (!CONTRIBUTOR_KIND_SET.has(kind)) {
      if (apiRole === "featuring_artist" || apiRole === "featuring") kind = "featuring";
      else if (apiRole === "with_artist" || apiRole === "with") kind = "with";
      else if (apiRole === "remixer") kind = "remixer";
      else if (ALL_PERFORMER_ROLE_IDS.has(apiRole) || ALL_PERFORMER_ROLE_IDS.has(rdNorm)) kind = "performer";
      else if (ALL_CREDIT_ROLE_IDS.has(apiRole) || ALL_CREDIT_ROLE_IDS.has(rdNorm)) kind = "credit";
      else kind = "credit";
    }

    const roleDetail =
      kind === "performer" || kind === "credit"
        ? rdRaw ||
          (ALL_PERFORMER_ROLE_IDS.has(apiRole) ? apiRole.replace(/_/g, " ") : "") ||
          (ALL_CREDIT_ROLE_IDS.has(apiRole) ? apiRole.replace(/_/g, " ") : "")
        : "";

    const idStr = String(o.id ?? "").trim();
    const id = idStr || `ws-c-${i++}-${Math.random().toString(36).slice(2, 10)}`;
    const uidSrc = o.userId ?? o.user_id;
    let userId: string | null = null;
    if (uidSrc != null) {
      const n = parseInt(String(uidSrc).trim(), 10);
      if (Number.isFinite(n)) userId = String(n);
    }
    /**
     * Preserve the pivot id we captured during a previous edit-session hydration. Accepts both
     * camelCase (`serverContributorId`) and snake_case (`server_contributor_id`) so older
     * persisted metadata keeps working.
     */
    const sciSrc = o.serverContributorId ?? o.server_contributor_id ?? o.pivot_id;
    const serverContributorId =
      typeof sciSrc === "string" && sciSrc.trim()
        ? sciSrc.trim()
        : typeof sciSrc === "number" && Number.isFinite(sciSrc)
          ? String(sciSrc)
          : null;
    out.push({ id, kind, name, roleDetail, userId, serverContributorId });
  }
  return out;
}

/** Parse `trackContributors` saved inside `workspace_tracks` metadata. */
function parseTrackContributorsMetadata(raw: unknown): ContributorRow[] {
  if (Array.isArray(raw)) return normalizeWorkspaceContributorsRows(raw);
  if (typeof raw === "string" && raw.trim()) {
    const parsed = tryParseContributorsJsonChain(raw);
    if (Array.isArray(parsed)) return normalizeWorkspaceContributorsRows(parsed);
  }
  return [];
}

function parseTrackWorkspaceContributorFields(ws: Record<string, unknown>): {
  trackMainArtistName: string;
  trackMainArtistId: string | null;
  trackContributors: ContributorRow[];
  trackHiddenReleaseContributorIds: string[];
  trackHideReleasePrimary: boolean;
} {
  const trackMainArtistName = String(ws.trackMainArtistName ?? ws.track_main_artist_name ?? "").trim();
  const idRaw = ws.trackMainArtistId ?? ws.trackMainArtistUserId ?? ws.track_main_artist_user_id;
  let trackMainArtistId: string | null = null;
  if (idRaw != null) {
    const s = String(idRaw).trim();
    if (s) trackMainArtistId = s;
  }
  const trackContributors = parseTrackContributorsMetadata(ws.trackContributors ?? ws.track_contributors);
  const hidRaw = ws.trackHiddenReleaseContributorIds ?? ws.track_hidden_release_contributor_ids;
  const trackHiddenReleaseContributorIds = Array.isArray(hidRaw)
    ? hidRaw.map((x) => String(x ?? "").trim()).filter(Boolean)
    : [];
  const hideRelPrim = ws.trackHideReleasePrimary ?? ws.track_hide_release_primary;
  const trackHideReleasePrimary = hideRelPrim === true || hideRelPrim === "true";
  return {
    trackMainArtistName,
    trackMainArtistId,
    trackContributors,
    trackHiddenReleaseContributorIds,
    trackHideReleasePrimary,
  };
}

function tryParseContributorsJsonChain(s: string): unknown {
  let cur: unknown = s.trim();
  for (let d = 0; d < 4 && typeof cur === "string"; d++) {
    try {
      cur = JSON.parse(cur as string);
    } catch {
      return null;
    }
  }
  return cur;
}

function deepFindWorkspaceContributorsJson(node: unknown, depth = 0): string | null {
  if (depth > 20 || node == null) return null;
  if (typeof node === "string") {
    const t = node.trim();
    if (t.startsWith("[") && (t.includes('"kind"') || t.includes('"name"') || t.includes("'kind'"))) {
      return t;
    }
    return null;
  }
  if (Array.isArray(node)) {
    for (const el of node) {
      const g = deepFindWorkspaceContributorsJson(el, depth + 1);
      if (g) return g;
    }
    return null;
  }
  if (typeof node !== "object") return null;
  const o = node as Record<string, unknown>;
  for (const [k, v] of Object.entries(o)) {
    const nk = k.replace(/_/g, "").toLowerCase();
    if (nk === "workspacecontributors" && typeof v === "string") {
      const t = v.trim();
      if (t.startsWith("[")) return t;
    }
  }
  for (const v of Object.values(o)) {
    const g = deepFindWorkspaceContributorsJson(v, depth + 1);
    if (g) return g;
  }
  return null;
}

function pickWorkspaceContributorsSerialized(
  flat: Record<string, string>,
  metadataRaw: unknown
): string | null {
  const a = (flat.workspace_contributors ?? "").trim();
  if (a.startsWith("[")) return a;
  const b = (flat.workspaceContributors ?? "").trim();
  if (b.startsWith("[")) return b;
  for (const [k, v] of Object.entries(flat)) {
    const nk = k.replace(/_/g, "").toLowerCase();
    if (nk.includes("workspacecontributors") && v.trim().startsWith("[")) return v.trim();
  }
  return deepFindWorkspaceContributorsJson(metadataRaw);
}

interface PublishingRow {
  id: string;
  name: string;
  role: string;
  ownershipPct: number;
  iswc: string;
  publishingType: "copyright_control" | "published";
  /** Org user id string when resolved from roster or set after picking a contributor name. */
  userId?: string | null;
}

interface TrackWorkspace {
  id: string;
  serverTrackId?: string;
  source: "upload" | "catalog";
  catalogRef?: string;
  title: string;
  isrc: string;
  statusLabel: string;
  files: UploadFile[];
  audioFormat: "stereo" | "atmos";
  primaryGenre: string;
  secondaryGenre: string;
  language: string;
  version: string;
  lyrics: string;
  explicit: boolean;
  previewStart: string;
  trackOrigin: "original" | "public_domain" | "cover";
  properties: string[];
  copyrightYear: string;
  copyrightOwner: string;
  sampleLicenseFiles: UploadFile[];
  /** Track-level primary (display / metadata); release-level primary is separate. */
  trackMainArtistName: string;
  trackMainArtistId: string | null;
  /** Featuring / With / Remixer / Performer / Credit — same shape as release `contributors`. */
  trackContributors: ContributorRow[];
  /**
   * Release `ContributorRow.id` values hidden from this track's contributor list only (does not
   * remove them from the release).
   */
  trackHiddenReleaseContributorIds: string[];
  /**
   * When `true`, the release primary artist is hidden from this track's primary line (it's still
   * the release primary). User can either pick a new track primary or clear this flag.
   */
  trackHideReleasePrimary: boolean;
}

function emptyTrack(id: string): TrackWorkspace {
  return {
    id,
    source: "upload",
    title: "",
    isrc: "",
    statusLabel: "Draft",
    files: [],
    audioFormat: "stereo",
    primaryGenre: "",
    secondaryGenre: "",
    language: "",
    version: "",
    lyrics: "",
    explicit: false,
    previewStart: "00:15",
    trackOrigin: "original",
    properties: [],
    copyrightYear: "",
    copyrightOwner: "",
    sampleLicenseFiles: [],
    trackMainArtistName: "",
    trackMainArtistId: null,
    trackContributors: [],
    trackHiddenReleaseContributorIds: [],
    trackHideReleasePrimary: false,
  };
}

/** One row in the org-user primary-artist picker (API + mock fallback). */
type OrgRosterEntry = { id: string; name: string; allNames: string[]; roles: string[] };

/** Map Publishing "Role" display text to API snake_case (`songwriter`, `composer`, …). */
function writerPublishingRoleToApiKey(role: string): string {
  const t = role.trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  return t || "songwriter";
}

function resolveOrgRosterUserIdString(name: string, roster: OrgRosterEntry[]): string | null {
  const n = name.trim().toLowerCase();
  if (!n || roster.length === 0) return null;
  for (const u of roster) {
    if (u.name.trim().toLowerCase() === n) return u.id;
    for (const alias of u.allNames) {
      if (alias.trim().toLowerCase() === n) return u.id;
    }
  }
  return null;
}

/**
 * ISWC (International Standard Musical Work Code) — formal layout is `T-DDDDDDDDD-D`:
 *  - Literal `T`
 *  - 9 digit work id
 *  - 1 check digit
 * Common display variant inserts dots every 3 digits in the work id: `T-DDD.DDD.DDD-D`.
 *
 * We accept any combination of whitespace / dashes / dots between the digits and validate by
 * stripping every non-`T`/non-digit character; the canonical form must then be `T` followed by
 * exactly 10 digits. The check-digit math is intentionally NOT enforced so legitimate codes from
 * publishers (where copy-paste sometimes drops/changes a digit) aren't falsely rejected.
 */
function isValidIswcFormat(raw: string): boolean {
  const compact = raw.trim().toUpperCase().replace(/[^T0-9]/g, "");
  return /^T\d{10}$/.test(compact);
}

/** Returns a friendly inline error for an ISWC value, or `null` when valid / empty. */
function getIswcRowError(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  return isValidIswcFormat(v) ? null : "Invalid ISWC. Expected T-DDD.DDD.DDD-D (T + 10 digits).";
}

function buildWritersForReleaseApi(
  rows: PublishingRow[],
  roster: OrgRosterEntry[]
): ReleaseWriterApi[] | undefined {
  const mapped = rows
    .filter((p) => p.name.trim())
    .map((p) => {
      let uid = parseUserIdForApi(p.userId ?? null);
      if (uid === undefined) {
        uid = parseUserIdForApi(resolveOrgRosterUserIdString(p.name, roster));
      }
      const w: ReleaseWriterApi = {
        name: p.name.trim(),
        role: writerPublishingRoleToApiKey(p.role),
        ownership_percentage: Number.isFinite(p.ownershipPct) ? Math.round(p.ownershipPct) : 0,
        iswc: p.iswc.trim(),
        publishing_type: p.publishingType,
      };
      if (uid !== undefined) w.user_id = uid;
      return w;
    });
  return mapped.length > 0 ? mapped : undefined;
}

function contributorRowCaption(c: ContributorRow): string {
  switch (c.kind) {
    case "featuring":
      return "Featuring";
    case "with":
      return "With";
    case "remixer":
      return "Remixer";
    case "performer":
      return c.roleDetail.trim() || "Performer";
    case "credit":
      return c.roleDetail.trim() || "Credit";
    default:
      return "";
  }
}

function isFeaturingWithRemixerContributor(c: ContributorRow): boolean {
  return c.kind === "featuring" || c.kind === "with" || c.kind === "remixer";
}

/**
 * Each picker option for the Publishing → "Name" combobox.
 * `key` is unique per row (name + role) so multi-role contributors (e.g. Travis Scott as
 * `drummer` + `beat_maker`) appear as separate selectable entries.
 */
interface PublishingContributorOption {
  key: string;
  name: string;
  role: string;
  /** Friendly subtitle shown next to the name (e.g. "Drummer", "Featuring", "Primary Artist"). */
  hint: string;
  /** Org `user_id` carried from `GET /api/releases.contributors[].user_id` (or Section-1/2 picks). */
  userId?: string | null;
}

/**
 * Builds the dropdown options for the Publishing → Name picker.
 *
 * Sources, in priority order:
 *  - The primary artist on Section 1 (`mainArtistName`) — labeled "Primary Artist".
 *  - Every additional contributor on Section 2 (`contributors[]`) — labeled with its
 *    humanized role (uses `contributorRowCaption` for the kind, snake-case detail for the rest).
 *  - Aggregated rows from the org's other releases (`extraContributors`) — so the picker still
 *    has data on a fresh Create Release flow before the user has added anyone in Section 2.
 *
 * Deduplicates exact `name + role` pairs so the same person under the same role doesn't
 * appear twice. Different roles for the same person remain separate options on purpose so the
 * publisher can pick whichever role they're attributing splits to.
 */
function buildPublishingContributorOptions(
  mainArtistName: string,
  mainArtistUserId: string | null,
  contributors: ContributorRow[],
  extraContributors: PublishingContributorOption[] = []
): PublishingContributorOption[] {
  const out: PublishingContributorOption[] = [];
  /** Tracks already-added `name+role` pairs (winners keep the first non-empty `userId` we see). */
  const seen = new Map<string, PublishingContributorOption>();
  const push = (name: string, role: string, hint: string, userId?: string | null) => {
    const cleanName = name.trim();
    const cleanRole = role.trim();
    if (!cleanName) return;
    const key = `${cleanName.toLowerCase()}::${cleanRole.toLowerCase()}`;
    const existing = seen.get(key);
    if (existing) {
      if (!existing.userId && userId) {
        existing.userId = userId;
      }
      return;
    }
    const option: PublishingContributorOption = {
      key,
      name: cleanName,
      role: cleanRole,
      hint: hint.trim() || cleanRole,
      userId: userId ?? null,
    };
    seen.set(key, option);
    out.push(option);
  };
  push(mainArtistName, "Primary Artist", "Primary Artist", mainArtistUserId);
  for (const c of contributors) {
    const caption = contributorRowCaption(c);
    const humanizedRole =
      c.kind === "performer" || c.kind === "credit"
        ? humanizeSnakeCaseRoleId(c.roleDetail.trim() || c.kind)
        : caption;
    push(c.name, humanizedRole, caption || humanizedRole, c.userId);
  }
  for (const e of extraContributors) {
    push(e.name, e.role, e.hint, e.userId ?? null);
  }
  return out;
}

/**
 * Pulls every unique contributor (name + humanized role) the org has used on any past release.
 *
 * Reads `release.contributors[]` from a `GET /api/releases` response. Each row exposes the
 * canonical role inside `pivot.role` (e.g. "drummer", "featuring_artist", "primary_artist"), so we
 * humanize that to "Drummer", "Featuring Artist", etc. for the dropdown subtitle.
 */
function aggregateContributorsFromReleaseList(
  releases: ReleaseListItem[]
): PublishingContributorOption[] {
  const out: PublishingContributorOption[] = [];
  const seen = new Map<string, PublishingContributorOption>();
  for (const r of releases) {
    const rec = r as unknown as Record<string, unknown>;
    const list = rec.contributors;
    if (!Array.isArray(list)) continue;
    for (const row of list) {
      if (!row || typeof row !== "object") continue;
      const o = mergeJsonApiAttributes(row as Record<string, unknown>);
      const name = String(o.name ?? "").trim();
      if (!name) continue;
      const roleRaw = pickContributorRole(o)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
      const role = roleRaw ? humanizeSnakeCaseRoleId(roleRaw) : "";
      const uidVal = (o as { user_id?: unknown }).user_id;
      const uidParsed =
        typeof uidVal === "number" && Number.isFinite(uidVal)
          ? String(uidVal)
          : typeof uidVal === "string" && uidVal.trim()
            ? uidVal.trim()
            : null;
      const key = `${name.toLowerCase()}::${role.toLowerCase()}`;
      const existing = seen.get(key);
      if (existing) {
        if (!existing.userId && uidParsed) {
          existing.userId = uidParsed;
        }
        continue;
      }
      const option: PublishingContributorOption = { key, name, role, hint: role, userId: uidParsed };
      seen.set(key, option);
      out.push(option);
    }
  }
  return out;
}

function pickAudioFile(t: TrackWorkspace): File | null {
  const a = t.files.find((f) => f.type === "audio" && f.file);
  return a?.file ?? null;
}

function pickArtworkFile(t: TrackWorkspace): File | null {
  const img = t.files.find((f) => f.type === "image" && f.file);
  return img?.file ?? null;
}

function displayTrackTitleForApi(t: TrackWorkspace): string {
  const trimmed = t.title.trim();
  if (trimmed) return trimmed;
  const audio = pickAudioFile(t);
  if (audio?.name) {
    const base = audio.name.replace(/\.[^.]+$/, "");
    return base.trim() || "Untitled";
  }
  return "Untitled";
}

/** Maps UI checkbox ids to API `track_properties` enum strings (e.g. Postman `samples_or_stock`). */
const TRACK_PROPERTY_ID_TO_API: Record<string, string> = {
  remix_derivative: "remix_derivative",
  samples_stock: "samples_or_stock",
  compilation: "compilation",
  alternate_version: "alternate_version",
  special_genre: "special_genre",
  non_musical: "non_musical",
  includes_ai: "includes_ai",
};

function trackPropertiesForApi(uiIds: string[]): string[] {
  const out: string[] = [];
  for (const id of uiIds) {
    if (id === "none") continue;
    const api = TRACK_PROPERTY_ID_TO_API[id] ?? id;
    if (!out.includes(api)) out.push(api);
  }
  return out;
}

/** Maps API `track_properties` strings (e.g. `samples_or_stock`) back to UI checkbox ids. */
function apiTrackPropertiesToUiIds(apiProps: string[]): string[] {
  return apiProps
    .filter((p) => typeof p === "string" && p.trim())
    .map((api) => {
      const trimmed = api.trim();
      const entry = Object.entries(TRACK_PROPERTY_ID_TO_API).find(([, v]) => v === trimmed);
      return entry ? entry[0]! : trimmed;
    });
}

/**
 * GET track may return `track_properties` as string[] or as an object of flags
 * (e.g. `{ "samples_or_stock": true, "includes_ai": true }`).
 */
function unknownTrackPropertiesToApiKeys(tp: unknown): string[] {
  if (Array.isArray(tp)) {
    return tp.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => x.trim());
  }
  if (tp != null && typeof tp === "object" && !Array.isArray(tp)) {
    return Object.entries(tp as Record<string, unknown>)
      .filter(([, v]) => v === true || v === 1 || v === "1" || v === "true")
      .map(([k]) => k)
      .filter((k) => k.trim().length > 0);
  }
  return [];
}

/**
 * Build the JSON body for `PUT /api/tracks/:id` from a workspace row.
 *
 * Sends every field that has a usable value. Empty strings are converted to `null` so the
 * server clears optional metadata; unparseable numbers are sent as `null`. Required
 * `title` and `track_number` are always included by `updateTrack` itself.
 *
 * `contributors` (when provided) follows the same shape as release `contributors`: an array
 * of `{ name, role, user_id? }` with the `primary_artist` row first. Pass `undefined` to leave
 * the existing contributor list alone.
 */
function buildTrackUpdatePayloadFromWorkspace(
  t: TrackWorkspace,
  trackNumber: number,
  contributors?: ReleaseContributorApi[]
): UpdateTrackJsonPayload {
  const cyRaw = t.copyrightYear.trim();
  const cyParsed = cyRaw ? parseInt(cyRaw, 10) : NaN;
  const isrcVal = t.isrc?.trim() ?? "";
  return {
    title: displayTrackTitleForApi(t),
    track_number: trackNumber,
    primary_genre: t.primaryGenre.trim() || null,
    secondary_genre: t.secondaryGenre.trim() || null,
    version: t.version.trim() || null,
    language: t.language.trim() || null,
    lyrics: t.lyrics.trim() || null,
    is_explicit: Boolean(t.explicit),
    preview_start: parsePreviewStartToSeconds(t.previewStart),
    track_origin: t.trackOrigin || null,
    track_properties: trackPropertiesForApi(t.properties),
    copyright_year: Number.isFinite(cyParsed) ? cyParsed : null,
    copyright_owner: t.copyrightOwner.trim() || null,
    isrc: isrcVal ? isrcVal : null,
    contributors,
  };
}

/** API expects `preview_start` as integer seconds; UI allows `15` or `MM:SS`. */
function parsePreviewStartToSeconds(raw: string): number {
  const s = raw.trim();
  if (!s) return 15;
  if (/^\d+$/.test(s)) return Math.max(0, parseInt(s, 10));
  const parts = s.split(":").map((p) => parseInt(p.trim(), 10));
  if (parts.some((n) => !Number.isFinite(n))) return 15;
  if (parts.length === 1) return Math.max(0, parts[0]!);
  if (parts.length === 2) return Math.max(0, parts[0]! * 60 + parts[1]!);
  const [h, m, sec] = parts;
  return Math.max(0, (h ?? 0) * 3600 + (m ?? 0) * 60 + (sec ?? 0));
}

/**
 * Creates one track on the API using the same pipeline as Postman:
 * 1. POST `/api/assets/signed-upload` (audio) → `upload_url`, `file_path`
 * 2. PUT `upload_url` with the selected audio file bytes
 * 3. POST `/api/releases/{releaseId}/tracks` with metadata + `audio_file_path` (etc.) from step 1
 *
 * `releaseId` must be the id returned from create-release (`data.id`).
 */
async function createWorkspaceTrackOnServer(
  releaseId: string,
  t: TrackWorkspace,
  trackNumber: number,
  contributors?: ReleaseContributorApi[]
): Promise<CreateTrackResponse> {
  const audioF = pickAudioFile(t);
  if (!audioF) {
    throw new Error("Audio file is required to create a track");
  }
  const audioSigned = await requestAssetSignedUpload({
    file_name: audioF.name,
    file_type: signedUploadAudioFileType(audioF),
    type: "audio",
  });
  await uploadBinaryToSignedUrl(audioSigned.upload_url, audioF);

  const licFile = t.sampleLicenseFiles.find((f) => f.file)?.file;
  let sampleExtra: Partial<CreateTrackJsonPayload> = {};
  if (t.properties.includes("samples_stock") && licFile) {
    const licSigned = await requestAssetSignedUpload({
      file_name: licFile.name,
      file_type: licFile.type?.trim() || "application/pdf",
      type: "license",
    });
    await uploadBinaryToSignedUrl(licSigned.upload_url, licFile);
    sampleExtra = {
      sample_license_file_path: licSigned.file_path,
      sample_license_file_name: licFile.name,
      sample_license_mime_type: licFile.type?.trim() || "application/pdf",
      sample_license_file_size: licFile.size,
    };
  }

  const cy = parseInt(t.copyrightYear.trim(), 10);
  if (!Number.isFinite(cy)) {
    throw new Error("Copyright year is required");
  }

  const isrcTrim = t.isrc?.trim() ?? "";
  const payload: CreateTrackJsonPayload = {
    title: displayTrackTitleForApi(t),
    track_number: trackNumber,
    primary_genre: t.primaryGenre.trim(),
    secondary_genre: t.secondaryGenre.trim() || null,
    version: t.version.trim(),
    language: t.language.trim(),
    lyrics: t.lyrics.trim(),
    is_explicit: t.explicit,
    preview_start: parsePreviewStartToSeconds(t.previewStart),
    track_origin: t.trackOrigin,
    track_properties: trackPropertiesForApi(t.properties),
    audio_file_path: audioSigned.file_path,
    audio_file_name: audioF.name,
    audio_mime_type: audioF.type?.trim() || "application/octet-stream",
    audio_file_size: audioF.size,
    copyright_year: cy,
    copyright_owner: t.copyrightOwner.trim(),
    ...sampleExtra,
    /** Always assign — service-layer omits the key from the HTTP body when the list is empty. */
    contributors: contributors ?? [],
    ...(isrcTrim ? { isrc: isrcTrim } : {}),
  };
  return createReleaseTrackJson(releaseId, payload);
}

function detectAtmos(file: File): boolean {
  const n = file.name.toLowerCase();
  return n.includes("atmos") || n.endsWith(".ec3");
}

function detectAtmosFromAssetName(name: string | null | undefined): boolean {
  const n = (name ?? "").toLowerCase();
  return n.includes("atmos") || n.endsWith(".ec3");
}

function mergeTrackWorkspaceFromApi(local: TrackWorkspace, api: ReleaseTrackItem): TrackWorkspace {
  const audio = trackAssetToUploadFile(api.audio, "audio");
  const image = trackAssetToUploadFile(api.artwork, "image");
  const files: UploadFile[] = [];
  if (audio) files.push(audio);
  if (image) files.push(image);
  const tp = api.track_properties;
  const propsRaw = unknownTrackPropertiesToApiKeys(tp);
  const props = propsRaw.length > 0 ? apiTrackPropertiesToUiIds(propsRaw) : local.properties;
  const audioName = api.audio?.file_name ?? "";
  const isrcFromApi = typeof api.isrc === "string" ? api.isrc.trim() : "";
  return {
    ...local,
    serverTrackId: api.id,
    title: api.title?.trim() || local.title,
    isrc: isrcFromApi || local.isrc,
    primaryGenre: api.primary_genre?.trim() || local.primaryGenre,
    secondaryGenre: api.secondary_genre?.trim() || local.secondaryGenre,
    version: api.version?.trim() || local.version,
    language: api.language?.trim() || local.language,
    lyrics: api.lyrics?.trim() ?? local.lyrics,
    explicit: api.is_explicit ?? local.explicit,
    previewStart:
      typeof api.preview_start === "number" && Number.isFinite(api.preview_start)
        ? String(api.preview_start)
        : local.previewStart,
    trackOrigin: (() => {
      const o = api.track_origin?.trim().toLowerCase();
      if (o === "original" || o === "public_domain" || o === "cover") {
        return o as TrackWorkspace["trackOrigin"];
      }
      return local.trackOrigin;
    })(),
    properties: props.length > 0 ? props : local.properties,
    copyrightYear: api.copyright_year != null ? String(api.copyright_year) : local.copyrightYear,
    copyrightOwner: api.copyright_owner?.trim() || local.copyrightOwner,
    files: files.length > 0 ? files : local.files,
    audioFormat: detectAtmosFromAssetName(audioName) ? "atmos" : "stereo",
  };
}

export function CreateReleaseWorkspace({ editReleaseId = null, onEditConsumed }: UploadContentProps = {}) {
  const organizationId = useOrganizationId();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hydratingEdit, setHydratingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const onEditConsumedRef = useRef(onEditConsumed);
  onEditConsumedRef.current = onEditConsumed;

  const [workspaceKind, setWorkspaceKind] = useState<WorkspaceKind>("audio");
  const [dirty, setDirty] = useState(false);
  const markDirty = useCallback(() => setDirty(true), []);

  const [title, setTitle] = useState("");
  const [versionTitle, setVersionTitle] = useState("");
  const [releaseType, setReleaseType] = useState("single");
  const [labelName, setLabelName] = useState("");
  const [upc, setUpc] = useState("");
  const [autoUpc, setAutoUpc] = useState(false);
  const [previouslyReleased, setPreviouslyReleased] = useState(false);
  const [releaseTiming, setReleaseTiming] = useState<"asap" | "date">("asap");
  const [releaseDate, setReleaseDate] = useState("");
  const [originalReleaseDate, setOriginalReleaseDate] = useState("");
  const [primaryGenre, setPrimaryGenre] = useState("");
  const [secondaryGenre, setSecondaryGenre] = useState("");
  const [mainArtistName, setMainArtistName] = useState("");
  const [mainArtistId, setMainArtistId] = useState<string | null>(null);
  /** `"release"` = Section 1 primary; otherwise `TrackWorkspace.id` for track-level primary in the track dialog. */
  const [primaryArtistPickTarget, setPrimaryArtistPickTarget] = useState<"release" | string>("release");
  const [contributors, setContributors] = useState<ContributorRow[]>([]);
  /**
   * Pivot ids of contributor rows the user removed during this edit session. Sent as
   * `deleted_contributor_ids` on the next PUT so the API detaches them. Reset after a
   * successful save and on a fresh release load.
   */
  const [removedContributorIds, setRemovedContributorIds] = useState<string[]>([]);
  const queueRemovedContributor = useCallback((row: ContributorRow | undefined | null) => {
    const sid = row?.serverContributorId?.trim();
    if (!sid) return;
    setRemovedContributorIds((prev) => (prev.includes(sid) ? prev : [...prev, sid]));
  }, []);
  const [tracks, setTracks] = useState<TrackWorkspace[]>(() => [emptyTrack("1")]);
  const [publishing, setPublishing] = useState<PublishingRow[]>([]);
  /** Id of the publishing row whose Name combobox is currently open (null = all closed). */
  const [publishingPickerOpenId, setPublishingPickerOpenId] = useState<string | null>(null);
  /** Per-row anchor refs so the popover keeps focus when clicking the dropdown chevron. */
  const publishingAnchorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  /**
   * Org-wide contributor history aggregated from `GET /api/releases` — feeds the Publishing
   * combobox on a fresh Create Release flow before any Section-2 contributors are added.
   */
  const [orgContributorOptions, setOrgContributorOptions] = useState<PublishingContributorOption[]>([]);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [coverDimensionError, setCoverDimensionError] = useState<string | null>(null);

  const [artistDialogOpen, setArtistDialogOpen] = useState(false);
  const [artistSearch, setArtistSearch] = useState("");
  const [orgRoster, setOrgRoster] = useState<OrgRosterEntry[]>([]);
  const [orgRosterLoading, setOrgRosterLoading] = useState(false);
  const [orgRosterError, setOrgRosterError] = useState<string | null>(null);
  const [createArtistOpen, setCreateArtistOpen] = useState(false);
  const [newArtistName, setNewArtistName] = useState("");

  const [addContributorKind, setAddContributorKind] = useState<ContributorKind | null>(null);
  /** When set, new contributors go onto this track's `trackContributors` instead of the release list. */
  const [contributorAddForTrackId, setContributorAddForTrackId] = useState<string | null>(null);
  const [contributorNameDraft, setContributorNameDraft] = useState("");
  /** Pending org roster selections in Add contributor (multi-select before Add). */
  const [contributorOrgPicks, setContributorOrgPicks] = useState<{ id: string; name: string }[]>([]);
  const [contributorOrgSearch, setContributorOrgSearch] = useState("");
  const [contributorRoleDraft, setContributorRoleDraft] = useState("");
  const [performerRoleMenuOpen, setPerformerRoleMenuOpen] = useState(false);
  /** Wraps role input + chevron so Radix does not auto-dismiss on that surface before our toggle runs. */
  const performerRoleAnchorRef = useRef<HTMLDivElement>(null);
  const [creditRoleMenuOpen, setCreditRoleMenuOpen] = useState(false);
  const creditRoleAnchorRef = useRef<HTMLDivElement>(null);

  const [catalogDialogOpen, setCatalogDialogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogTracks, setCatalogTracks] = useState<ReleaseTrackItem[]>([]);
  const [catalogTracksLoading, setCatalogTracksLoading] = useState(false);
  const [catalogTracksError, setCatalogTracksError] = useState<string | null>(null);
  const [trackDialogId, setTrackDialogId] = useState<string | null>(null);
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const pendingSection4FocusRef = useRef<Section4Focus | null>(null);
  /** Last `editReleaseId` from props — used to detect leaving edit mode without wiping new-release state on first mount. */
  const prevEditReleaseIdRef = useRef<string | null | undefined>(undefined);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverInputId = useId();

  const [validationAttempt, setValidationAttempt] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(editReleaseId?.trim());
  const coverDisplay = coverPreviewUrl || existingCoverUrl;

  /** Include API-only labels so Radix Select can show hydrated values outside {@link GENRES}. */
  const primaryGenreOptions = useMemo(() => {
    const p = primaryGenre.trim();
    if (p && !GENRES.includes(p)) return [...GENRES, p];
    return GENRES;
  }, [primaryGenre]);

  const secondaryGenreOptions = useMemo(() => {
    const p = secondaryGenre.trim();
    if (p && !GENRES.includes(p)) return [...GENRES, p];
    return GENRES;
  }, [secondaryGenre]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [coverPreviewUrl]);

  useEffect(() => {
    if (addContributorKind !== "performer") setPerformerRoleMenuOpen(false);
    if (addContributorKind !== "credit") setCreditRoleMenuOpen(false);
  }, [addContributorKind]);

  /**
   * Roster powers `user_id` resolution for both the Contributor dialog and the Publishing → Name
   * picker. Trigger the fetch whenever:
   *  - Section 1 artist dialog is open.
   *  - Section 2 contributor picker is open for an org-listed kind.
   *  - The Publishing combobox is open, or any publishing row exists (so manually-typed names
   *    can still resolve to a `user_id` when the writer matches the org roster).
   */
  const needsOrgRosterFetch =
    !!organizationId &&
    (artistDialogOpen ||
      (!!addContributorKind && CONTRIBUTOR_ORG_LIST_KINDS.includes(addContributorKind)) ||
      publishingPickerOpenId !== null ||
      publishing.length > 0);

  useEffect(() => {
    if (!needsOrgRosterFetch) return;
    let cancelled = false;
    setOrgRosterLoading(true);
    setOrgRosterError(null);
    void listOrganizationUsers(organizationId!)
      .then((rows) => {
        if (cancelled) return;
        setOrgRoster(
          rows.map((r) => ({
            id: String(r.id),
            name: r.name,
            allNames: r.allNames.length > 0 ? r.allNames : [r.name],
            roles: r.roles,
          }))
        );
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setOrgRosterError(e?.message ?? "Could not load organization users");
        setOrgRoster([]);
      })
      .finally(() => {
        if (!cancelled) setOrgRosterLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [needsOrgRosterFetch, organizationId]);

  /**
   * Fetch the org's release history once on mount to populate the Publishing → Name combobox.
   * We aggregate every distinct `(name, role)` pair from `release.contributors[]` so the picker
   * has data on a fresh Create Release flow before any Section-2 contributors are added.
   *
   * Failures are silent — the combobox simply falls back to in-form contributors + primary artist.
   */
  useEffect(() => {
    let cancelled = false;
    void listReleases()
      .then((rows) => {
        if (cancelled) return;
        setOrgContributorOptions(aggregateContributorsFromReleaseList(rows));
      })
      .catch(() => {
        if (cancelled) return;
        setOrgContributorOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isEditing) return;
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [isEditing]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    const current = editReleaseId?.trim() || null;
    const prev = prevEditReleaseIdRef.current;
    prevEditReleaseIdRef.current = current;

    if (!current) {
      // Do not reset on initial mount (prev undefined) — that was clearing local draft + user-selected cover.
      // Only reset when switching from editing a release back to "new release".
      if (typeof prev === "string" && prev.trim()) {
        setTitle("");
        setTracks([emptyTrack("1")]);
        setCoverFile(null);
        setExistingCoverUrl(null);
        setCoverPreviewUrl((p) => {
          if (p) URL.revokeObjectURL(p);
          return null;
        });
      }
      return;
    }
    const rid = current;
    let cancelled = false;
    setHydratingEdit(true);
    (async () => {
      try {
        const r = await getRelease(rid);
        if (cancelled) return;
        const flat = normalizeReleaseMetadata(r.metadata);
        const rel = r as unknown as Record<string, unknown>;
        const coerceStr = (v: unknown): string => {
          if (v == null) return "";
          if (typeof v === "string") return v.trim();
          if (typeof v === "number" && Number.isFinite(v)) return String(v);
          return "";
        };
        /** New release loaded — clear any pivot ids queued from an earlier edit. */
        setRemovedContributorIds([]);
        setTitle(r.title?.trim() ?? "");
        setVersionTitle(r.version_title?.trim() ?? "");
        setReleaseType((r.release_type ?? "single").toLowerCase());
        setLabelName(r.label_name?.trim() ?? "");
        setUpc(r.upc?.trim() ?? "");
        const schedOrRel = r.scheduled_release_date?.trim() || r.release_date;
        setReleaseDate(formatReleaseDisplayDate(schedOrRel));
        setOriginalReleaseDate(formatReleaseDisplayDate(r.original_release_date));
        setMainArtistName(r.primary_artist_name?.trim() ?? "");
        setMainArtistId(parsePrimaryArtistUserIdFromReleaseDetail(r));
        if (typeof r.previously_released === "boolean") {
          setPreviouslyReleased(r.previously_released);
        } else if (flat.previously_released === "true") {
          setPreviouslyReleased(true);
        }
        const timing = r.release_timing?.trim().toLowerCase();
        if (timing === "date" || timing === "asap") {
          setReleaseTiming(timing as "asap" | "date");
        } else if (flat.release_timing === "date" || flat.release_timing === "asap") {
          setReleaseTiming(flat.release_timing as "asap" | "date");
        }
        if (typeof r.auto_generate_upc === "boolean") {
          setAutoUpc(r.auto_generate_upc);
        }
        let metaContributors: ContributorRow[] = [];
        try {
          const serialized = pickWorkspaceContributorsSerialized(flat, r.metadata);
          if (serialized) {
            const parsed = tryParseContributorsJsonChain(serialized);
            metaContributors = normalizeWorkspaceContributorsRows(parsed);
          }
        } catch {
          metaContributors = [];
        }
        const fromApiContributors = parseAdditionalContributorsFromReleaseDetail(r);
        setContributors(metaContributors.length > 0 ? metaContributors : fromApiContributors);

        let publishingRows: PublishingRow[] = [];
        try {
          const pubRaw = flat.workspace_publishing?.trim() || flat.workspacePublishing?.trim() || "";
          if (pubRaw) {
            const pubParsed = JSON.parse(pubRaw) as unknown;
            if (Array.isArray(pubParsed)) {
              publishingRows = pubParsed.map((raw, idx): PublishingRow => {
                if (!raw || typeof raw !== "object") {
                  return {
                    id: `p-${idx}`,
                    name: "",
                    role: "",
                    ownershipPct: 0,
                    iswc: "",
                    publishingType: "copyright_control",
                  };
                }
                const o = raw as Record<string, unknown>;
                const ptRaw = o.publishingType ?? o.publishing_type;
                const publishingType: PublishingRow["publishingType"] =
                  ptRaw === "published" ? "published" : "copyright_control";
                const pctRaw = o.ownershipPct ?? o.ownership_pct ?? o.ownership_percentage;
                const pct = typeof pctRaw === "number" ? pctRaw : parseFloat(String(pctRaw ?? "0"));
                const uidSrc = o.userId ?? o.user_id;
                return {
                  id: String(o.id ?? `p-${idx}`),
                  name: String(o.name ?? ""),
                  role: String(o.role ?? ""),
                  ownershipPct: Number.isFinite(pct) ? pct : 0,
                  iswc: String(o.iswc ?? ""),
                  publishingType,
                  userId:
                    uidSrc != null && String(uidSrc).trim() ? String(uidSrc).trim() : null,
                };
              });
            }
          }
        } catch {
          publishingRows = [];
        }
        setPublishing(publishingRows);
        const cover = resolveReleaseCoverDisplayUrl(r);
        setExistingCoverUrl(cover ? withImageCacheBust(cover) : null);
        setCoverFile(null);
        setCoverPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        let tr: TrackWorkspace[] = [];
        let wsRows: Record<string, unknown>[] = [];
        try {
          const rawWs = flat.workspace_tracks;
          if (rawWs) {
            const parsed = JSON.parse(rawWs) as unknown;
            if (Array.isArray(parsed)) wsRows = parsed.filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object");
          }
        } catch {
          wsRows = [];
        }
        try {
          const apiTracks = await fetchReleaseTrackList(rid, r);
          const ordered = [...apiTracks].sort((a, b) => (a.track_number ?? 9999) - (b.track_number ?? 9999));
          tr = ordered.map((t, index) => {
            const files = [
              trackAssetToUploadFile(t.audio, "audio"),
              trackAssetToUploadFile(t.artwork, "image"),
            ].filter((f): f is UploadFile => f != null);
            const ws = wsRows[index] ?? {};
            const src = String(ws.source ?? "upload") === "catalog" ? "catalog" : "upload";
            const tcFields = parseTrackWorkspaceContributorFields(ws as Record<string, unknown>);
            return {
              ...emptyTrack(t.id),
              serverTrackId: t.id,
              source: src,
              catalogRef: typeof ws.catalogRef === "string" ? ws.catalogRef : undefined,
              title: t.title?.trim() || String(ws.title ?? "").trim() || "",
              isrc: String(ws.isrc ?? "").trim(),
              primaryGenre:
                String(ws.primaryGenre ?? "").trim() ||
                (typeof t.primary_genre === "string" ? t.primary_genre.trim() : ""),
              secondaryGenre:
                String(ws.secondaryGenre ?? "").trim() ||
                (typeof t.secondary_genre === "string" ? t.secondary_genre.trim() : ""),
              language:
                String(ws.language ?? "").trim() ||
                (typeof t.language === "string" ? t.language.trim() : ""),
              version:
                String(ws.version ?? "").trim() || (typeof t.version === "string" ? t.version.trim() : ""),
              lyrics:
                String(ws.lyrics ?? "").trim() || (typeof t.lyrics === "string" ? t.lyrics.trim() : ""),
              explicit: ws.explicit !== undefined ? Boolean(ws.explicit) : Boolean(t.is_explicit),
              previewStart: (() => {
                const w = String(ws.previewStart ?? "").trim();
                if (w) return w;
                if (typeof t.preview_start === "number" && Number.isFinite(t.preview_start)) {
                  return String(t.preview_start);
                }
                return "00:15";
              })(),
              trackOrigin: (() => {
                const w = String(ws.trackOrigin ?? "").trim();
                if (w === "original" || w === "public_domain" || w === "cover") {
                  return w as TrackWorkspace["trackOrigin"];
                }
                const o = String(t.track_origin ?? "").trim();
                if (o === "original" || o === "public_domain" || o === "cover") {
                  return o as TrackWorkspace["trackOrigin"];
                }
                return "original";
              })(),
              properties: Array.isArray(ws.properties)
                ? (ws.properties as string[])
                : unknownTrackPropertiesToApiKeys(t.track_properties).length > 0
                  ? apiTrackPropertiesToUiIds(unknownTrackPropertiesToApiKeys(t.track_properties))
                  : [],
              copyrightYear:
                String(ws.copyrightYear ?? "").trim() ||
                (t.copyright_year != null ? String(t.copyright_year) : ""),
              copyrightOwner:
                String(ws.copyrightOwner ?? "").trim() ||
                (typeof t.copyright_owner === "string" ? t.copyright_owner.trim() : ""),
              audioFormat: String(ws.audioFormat ?? "stereo") === "atmos" ? "atmos" : "stereo",
              files,
              statusLabel: "In catalog",
              trackMainArtistName: tcFields.trackMainArtistName,
              trackMainArtistId: tcFields.trackMainArtistId,
              trackContributors: tcFields.trackContributors,
              trackHiddenReleaseContributorIds: tcFields.trackHiddenReleaseContributorIds,
              trackHideReleasePrimary: tcFields.trackHideReleasePrimary,
            };
          });
        } catch {
          tr = [];
        }
        if (tr.length === 0) tr = [emptyTrack("1")];
        const firstTrackGenre = (field: "primary" | "secondary"): string => {
          for (const row of tr) {
            const v = field === "primary" ? row.primaryGenre?.trim() : row.secondaryGenre?.trim();
            if (v) return v;
          }
          return "";
        };
        const rawPrimary =
          coerceStr(r.primary_genre) ||
          coerceStr(rel.primaryGenre) ||
          deepPickGenreFromMetadata(r.metadata, "primary") ||
          coerceStr(flat.primary_genre) ||
          coerceStr(flat.primaryGenre) ||
          genreFromFlatJsonValues(flat, "primary") ||
          firstTrackGenre("primary") ||
          "";
        const rawSecondary =
          coerceStr(r.secondary_genre) ||
          coerceStr(rel.secondaryGenre) ||
          deepPickGenreFromMetadata(r.metadata, "secondary") ||
          coerceStr(flat.secondary_genre) ||
          coerceStr(flat.secondaryGenre) ||
          genreFromFlatJsonValues(flat, "secondary") ||
          firstTrackGenre("secondary") ||
          "";
        setPrimaryGenre(canonicalReleaseGenreForSelect(rawPrimary));
        setSecondaryGenre(canonicalReleaseGenreForSelect(rawSecondary));
        setTracks(tr);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load release");
          onEditConsumedRef.current?.();
        }
      } finally {
        if (!cancelled) setHydratingEdit(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editReleaseId]);

  useLayoutEffect(() => {
    const st = (location.state as { section4Focus?: Section4Focus } | null)?.section4Focus;
    if (st) pendingSection4FocusRef.current = st;
  }, [location.state]);

  const handleCoverFiles = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (!isAllowedCoverImageFile(file)) {
      toast.error("Cover must be JPG or PNG.");
      return;
    }
    setCoverFile(file);
    setCoverDimensionError(null);
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < 3000 || img.naturalHeight < 3000) {
        setCoverDimensionError("Image must be at least 3000 x 3000 pixels");
      }
    };
    img.src = URL.createObjectURL(file);
    markDirty();
  };

  const buildMetadataPayload = (): Record<string, string> => {
    const md: Record<string, string> = {
      primary_genre: primaryGenre.trim(),
      secondary_genre: secondaryGenre.trim(),
      previously_released: previouslyReleased ? "true" : "false",
      release_timing: previouslyReleased ? "asap" : releaseTiming,
      workspace_contributors: JSON.stringify(contributors),
      workspace_publishing: JSON.stringify(publishing),
      workspace_tracks: JSON.stringify(
        tracks.map((t) => ({
          id: t.id,
          serverTrackId: t.serverTrackId ?? null,
          source: t.source,
          catalogRef: t.catalogRef,
          title: t.title,
          isrc: t.isrc,
          primaryGenre: t.primaryGenre,
          secondaryGenre: t.secondaryGenre,
          language: t.language,
          version: t.version,
          lyrics: t.lyrics,
          explicit: t.explicit,
          previewStart: t.previewStart,
          trackOrigin: t.trackOrigin,
          properties: t.properties,
          copyrightYear: t.copyrightYear,
          copyrightOwner: t.copyrightOwner,
          audioFormat: t.audioFormat,
          trackMainArtistName: t.trackMainArtistName,
          trackMainArtistId: t.trackMainArtistId,
          trackContributors: t.trackContributors,
          trackHiddenReleaseContributorIds: t.trackHiddenReleaseContributorIds,
          trackHideReleasePrimary: t.trackHideReleasePrimary,
        }))
      ),
    };
    return md;
  };

  const buildReleaseFields = (): Omit<CreateReleaseMultipartPayload, "artworkFile"> => {
    const rd = previouslyReleased ? "" : releaseTiming === "date" ? releaseDate : "";
    const ord = previouslyReleased ? originalReleaseDate : "";
    const upcVal = autoUpc ? "" : upc.trim();
    const scheduledRaw =
      !previouslyReleased && releaseTiming === "date" ? normalizeOriginalReleaseDateForApi(releaseDate) : "";
    return {
      title: title.trim() || "Untitled draft",
      version_title: versionTitle.trim(),
      primary_artist_name: mainArtistName.trim(),
      release_type: releaseType,
      upc: upcVal,
      label_name: labelName.trim(),
      release_date: rd,
      original_release_date: ord,
      metadata: buildMetadataPayload(),
      contributors: buildContributorsForReleaseApi(mainArtistName, mainArtistId, contributors, {
        fallbackPrimaryArtistUserId: user?.id ?? null,
      }),
      /**
       * Send pivot ids that the user removed during this edit session. The Laravel side detaches
       * those `release_contributors` rows in the same PUT call. Empty on a fresh release.
       */
      deleted_contributor_ids:
        removedContributorIds.length > 0 ? [...removedContributorIds] : undefined,
      auto_generate_upc: autoUpc,
      previously_released: previouslyReleased,
      release_timing: previouslyReleased ? "asap" : releaseTiming,
      scheduled_release_date: scheduledRaw,
      primary_genre: primaryGenre.trim(),
      secondary_genre: secondaryGenre.trim() || null,
      writers: buildWritersForReleaseApi(publishing, orgRoster),
    };
  };

  const persistToServer = async (): Promise<{
    releaseId: string | null;
    attached: number;
    created: number;
    updated: number;
    skippedAudioMissing: number;
  }> => {
    const editingId = editReleaseId?.trim();
    const fields = buildReleaseFields();
    let attached = 0;
    let created = 0;
    let updated = 0;
    let skippedAudioMissing = 0;
    /**
     * Shared helper for both the edit and create branches — builds the API `contributors`
     * array for one track using current Section-1/2 release state as the inherited base.
     * Passes the org roster so manually-typed names still resolve to a `user_id`.
     */
    const trackContribsForApi = (t: TrackWorkspace): ReleaseContributorApi[] =>
      buildTrackContributorsForApi(t, {
        mainArtistName,
        mainArtistId,
        contributors,
        fallbackPrimaryArtistUserId: user?.id ?? null,
        orgRoster,
      });
    if (editingId) {
      await updateRelease(editingId, fields);
      /** PUT succeeded — drop the queued pivot ids so a follow-up save doesn't re-send them. */
      if (removedContributorIds.length > 0) {
        setRemovedContributorIds([]);
      }
      if (coverFile) {
        await uploadReleaseArtwork(editingId, coverFile);
      }
      const idMap = new Map<string, string>();
      const hydratedByLocalId = new Map<string, TrackWorkspace>();
      for (let index = 0; index < tracks.length; index++) {
        const t = tracks[index];
        const audioF = pickAudioFile(t);
        const artF = pickArtworkFile(t);
        const n = index + 1;
        const titleForApi = displayTrackTitleForApi(t);
        const serverId = t.serverTrackId?.trim();
        const isCatalogAttach = t.source === "catalog" && Boolean(serverId) && !audioF;
        const trackContribs = trackContribsForApi(t);
        if (isCatalogAttach && serverId) {
          try {
            await attachExistingTrackToRelease(editingId, serverId);
            attached += 1;
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message.toLowerCase() : "";
            if (!msg.includes("already") && !msg.includes("exists") && !msg.includes("attached")) {
              throw e;
            }
          }
          if (artF) {
            await uploadTrackAsset(serverId, { audioFile: null, artworkFile: artF });
          }
          await updateTrack(serverId, buildTrackUpdatePayloadFromWorkspace(t, n, trackContribs));
          continue;
        }
        if (serverId) {
          await updateTrack(serverId, buildTrackUpdatePayloadFromWorkspace(t, n, trackContribs));
          if (audioF || artF) {
            await uploadTrackAsset(serverId, { audioFile: audioF, artworkFile: artF });
          }
          updated += 1;
        } else if (audioF) {
          const createdRow = await createWorkspaceTrackOnServer(editingId, t, n, trackContribs);
          const cid = createdRow.id?.trim();
          if (cid) {
            created += 1;
            idMap.set(t.id, cid);
            if (artF) {
              await uploadTrackAsset(cid, { audioFile: null, artworkFile: artF });
            }
            try {
              const detail = await getTrack(cid);
              hydratedByLocalId.set(
                t.id,
                mergeTrackWorkspaceFromApi({ ...t, id: cid, serverTrackId: cid }, detail)
              );
            } catch {
              hydratedByLocalId.set(t.id, { ...t, id: cid, serverTrackId: cid });
            }
          }
        } else if (t.title.trim() && t.source !== "catalog") {
          skippedAudioMissing += 1;
        }
      }
      if (idMap.size > 0) {
        setTracks((prev) =>
          prev.map((tr) => {
            const merged = hydratedByLocalId.get(tr.id);
            if (merged) return merged;
            const sid = idMap.get(tr.id);
            return sid ? { ...tr, id: sid, serverTrackId: sid } : tr;
          })
        );
      }
      return { releaseId: editingId, attached, created, updated, skippedAudioMissing };
    }
    let result: CreateReleaseResponse;
    if (coverFile) {
      const signed = await requestAssetSignedUpload({
        file_name: coverFile.name,
        file_type: signedUploadArtworkFileType(coverFile),
        type: "artwork",
      });
      await uploadBinaryToSignedUrl(signed.upload_url, coverFile);
      result = await createReleaseJson({
        ...fields,
        metadata: fields.metadata,
        file_path: signed.file_path,
        file_name: coverFile.name,
        mime_type: coverFile.type?.trim() || mimeForSignedUpload(coverFile),
        file_size: coverFile.size,
      });
    } else {
      const multipart: CreateReleaseMultipartPayload = {
        ...fields,
        metadata: fields.metadata,
      };
      result = await createRelease(multipart);
    }
    const newReleaseId = result.id?.trim();
    const anyTrackNeedsAudio = tracks.some((tr) => Boolean(pickAudioFile(tr)));
    const anyCatalogAttach = tracks.some(
      (tr) => tr.source === "catalog" && Boolean(tr.serverTrackId?.trim()) && !pickAudioFile(tr)
    );
    if ((anyTrackNeedsAudio || anyCatalogAttach) && !newReleaseId) {
      throw new Error(
        "Release was created but the server did not return a release id. Tracks cannot be uploaded without it.",
      );
    }
    const createdHydrated = new Map<string, TrackWorkspace>();
    if (newReleaseId) {
      for (let i = 0; i < tracks.length; i++) {
        const t = tracks[i];
        const audioF = pickAudioFile(t);
        const artF = pickArtworkFile(t);
        const serverId = t.serverTrackId?.trim();
        if (t.source === "catalog" && serverId && !audioF) {
          try {
            await attachExistingTrackToRelease(newReleaseId, serverId);
            attached += 1;
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message.toLowerCase() : "";
            if (!msg.includes("already") && !msg.includes("exists") && !msg.includes("attached")) {
              throw e;
            }
          }
          if (artF) {
            await uploadTrackAsset(serverId, { audioFile: null, artworkFile: artF });
          }
          try {
            await updateTrack(
              serverId,
              buildTrackUpdatePayloadFromWorkspace(t, i + 1, trackContribsForApi(t))
            );
          } catch {
            /* non-fatal: attach already linked the track */
          }
          try {
            const detail = await getTrack(serverId);
            createdHydrated.set(
              t.id,
              mergeTrackWorkspaceFromApi({ ...t, id: serverId, serverTrackId: serverId }, detail)
            );
          } catch {
            createdHydrated.set(t.id, { ...t, id: serverId, serverTrackId: serverId });
          }
          continue;
        }
        if (!audioF) {
          if (t.title.trim() && t.source !== "catalog") {
            skippedAudioMissing += 1;
          }
          continue;
        }
        const createdRow = await createWorkspaceTrackOnServer(
          newReleaseId,
          t,
          i + 1,
          trackContribsForApi(t)
        );
        const tid = createdRow.id?.trim();
        if (artF && tid) {
          await uploadTrackAsset(tid, { audioFile: null, artworkFile: artF });
        }
        if (tid) {
          created += 1;
          try {
            const detail = await getTrack(tid);
            createdHydrated.set(
              t.id,
              mergeTrackWorkspaceFromApi({ ...t, id: tid, serverTrackId: tid }, detail)
            );
          } catch {
            createdHydrated.set(t.id, { ...t, id: tid, serverTrackId: tid });
          }
        }
      }
    }
    if (createdHydrated.size > 0) {
      setTracks((prev) => prev.map((tr) => createdHydrated.get(tr.id) ?? tr));
    }
    return {
      releaseId: newReleaseId || null,
      attached,
      created,
      updated,
      skippedAudioMissing,
    };
  };

  /** Build a "1 attached, 1 created, 1 missing audio" summary string for save toasts. */
  const formatPersistSummary = (s: {
    attached: number;
    created: number;
    updated: number;
    skippedAudioMissing: number;
  }): string => {
    const parts: string[] = [];
    if (s.attached > 0) parts.push(`${s.attached} existing track${s.attached === 1 ? "" : "s"} attached`);
    if (s.created > 0) parts.push(`${s.created} new track${s.created === 1 ? "" : "s"} uploaded`);
    if (s.updated > 0) parts.push(`${s.updated} track${s.updated === 1 ? "" : "s"} updated`);
    return parts.join(", ");
  };

  const handleSaveDraft = async () => {
    if (workspaceKind !== "audio") {
      toast.message("Draft saved", { description: "Video workspace is not yet available." });
      setDirty(false);
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing) {
        const result = await persistToServer();
        if (result.releaseId)
          emitReleaseCatalogChanged({ releaseId: result.releaseId, reason: "updated" });
        const summary = formatPersistSummary(result);
        toast.success("Draft saved.", summary ? { description: summary } : undefined);
        if (result.skippedAudioMissing > 0) {
          toast.warning(
            `${result.skippedAudioMissing} new track${result.skippedAudioMissing === 1 ? "" : "s"} need audio before they can be saved to the release.`
          );
        }
        setDirty(false);
      } else if (title.trim()) {
        const result = await persistToServer();
        if (result.releaseId)
          emitReleaseCatalogChanged({ releaseId: result.releaseId, reason: "created" });
        const summary = formatPersistSummary(result);
        toast.success(
          "Draft saved to server.",
          summary ? { description: summary } : undefined
        );
        if (result.skippedAudioMissing > 0) {
          toast.warning(
            `${result.skippedAudioMissing} new track${result.skippedAudioMissing === 1 ? "" : "s"} need audio before they can be saved to the release.`
          );
        }
        setDirty(false);
      } else {
        toast.message("Add a title to save your draft to the server.", {
          description: "Unsaved changes are lost if you leave or reload this page.",
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const validateContinue = (): boolean => {
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = "Title is required.";
    if (!mainArtistName.trim()) err.mainArtist = "Main primary artist is required.";
    if (!primaryGenre.trim()) err.primaryGenre = "Primary genre is required.";
    if (coverDimensionError) err.cover = coverDimensionError;
    if (!coverFile && !existingCoverUrl) err.cover = "Cover artwork is required.";
    if (previouslyReleased && !originalReleaseDate.trim()) {
      err.originalReleaseDate = "Original release date is required for catalog transfers.";
    }
    if (!previouslyReleased && releaseTiming === "date" && !releaseDate.trim()) {
      err.releaseDate = "Choose a release date.";
    }
    const validTracks = tracks.filter(
      (t) =>
        t.title.trim() ||
        pickAudioFile(t) ||
        t.source === "catalog" ||
        t.files.some((f) => f.type === "audio")
    );
    if (validTracks.length === 0) {
      err.tracks = "Add at least one track.";
    }
    for (const t of validTracks) {
      if (!t.title.trim()) err[`track-${t.id}-title`] = "Track title required.";
      if (!t.primaryGenre.trim()) err[`track-${t.id}-genre`] = "Primary genre required.";
      if (!t.language.trim()) err[`track-${t.id}-lang`] = "Language required.";
      if (!t.copyrightYear.trim()) err[`track-${t.id}-cy`] = "Copyright year required.";
      if (!t.copyrightOwner.trim()) err[`track-${t.id}-co`] = "Copyright owner required.";
      if (t.properties.includes("samples_stock") && t.sampleLicenseFiles.length === 0) {
        err[`track-${t.id}-license`] = "Upload sample license documents.";
      }
      if (
        t.source === "upload" &&
        !pickAudioFile(t) &&
        !(t.serverTrackId?.trim() && t.files.some((f) => f.type === "audio"))
      ) {
        err[`track-${t.id}-audio`] = "Audio file required for uploaded tracks.";
      }
    }
    const pubSum = publishing.reduce(
      (s, p) => s + (Number.isFinite(p.ownershipPct) ? p.ownershipPct : 0),
      0
    );
    if (publishing.length > 0 && Math.round(pubSum) !== 100) {
      const delta = Math.round(pubSum) - 100;
      err.publishing =
        delta > 0
          ? `Writer / publisher ownership exceeds 100% by ${delta}%. Reduce the splits to total exactly 100%.`
          : `Writer / publisher ownership is below 100% by ${Math.abs(delta)}%. Add splits so the total is exactly 100%.`;
    }
    for (const row of publishing) {
      const iswcErr = getIswcRowError(row.iswc);
      if (iswcErr) {
        err[`pub-${row.id}-iswc`] = iswcErr;
      }
    }
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleContinue = async () => {
    setValidationAttempt(true);
    if (workspaceKind !== "audio") {
      toast.info("Video workflow coming soon.");
      return;
    }
    if (!validateContinue()) {
      toast.error("Fix the highlighted fields to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await persistToServer();
      if (result.releaseId) {
        emitReleaseCatalogChanged({
          releaseId: result.releaseId,
          reason: isEditing ? "updated" : "created",
        });
      }
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDirty(false);
      if (!result.releaseId) {
        toast.error("Release saved but no id was returned — open it from your catalog.");
        navigate(location.pathname.startsWith("/artist/") ? "/artist/releases" : "/releases");
        return;
      }
      if (result.skippedAudioMissing > 0) {
        toast.warning(
          `${result.skippedAudioMissing} new track${result.skippedAudioMissing === 1 ? "" : "s"} need audio before they can be saved to the release.`
        );
      }
      const summary = formatPersistSummary(result);
      const ridTrim = result.releaseId;
      if (location.pathname.startsWith("/artist/")) {
        toast.success(
          "Saved. Opening distribution…",
          summary ? { description: summary } : undefined
        );
        navigate(`/artist/releases/${encodeURIComponent(ridTrim)}/distribute`);
      } else {
        toast.success(
          "Saved. Continue from Manage Music when available.",
          summary ? { description: summary } : undefined
        );
        navigate("/releases");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Continue failed");
    } finally {
      setSubmitting(false);
    }
  };

  const addContributor = (kind: ContributorKind, forTrackId?: string | null) => {
    setAddContributorKind(kind);
    setContributorAddForTrackId(forTrackId ?? null);
    setContributorNameDraft("");
    setContributorOrgPicks([]);
    setContributorOrgSearch("");
    setContributorRoleDraft("");
  };

  const confirmContributor = () => {
    if (!addContributorKind) return;
    const tid = contributorAddForTrackId;
    if (organizationId && CONTRIBUTOR_ORG_LIST_KINDS.includes(addContributorKind)) {
      if (contributorOrgPicks.length === 0) return;
      const ts = Date.now();
      const newRows = contributorOrgPicks.map((p, i) => ({
        id: `c-${ts}-${i}-${p.id}`,
        kind: addContributorKind,
        name: p.name,
        roleDetail: contributorRoleDraft.trim(),
        userId: p.id,
      }));
      if (tid) {
        setTracks((trs) =>
          trs.map((t) => (t.id === tid ? { ...t, trackContributors: [...t.trackContributors, ...newRows] } : t))
        );
      } else {
        setContributors((c) => [...c, ...newRows]);
      }
    } else {
      if (!contributorNameDraft.trim()) return;
      const row: ContributorRow = {
        id: `c-${Date.now()}`,
        kind: addContributorKind,
        name: contributorNameDraft.trim(),
        roleDetail: contributorRoleDraft.trim(),
        userId: null,
      };
      if (tid) {
        setTracks((trs) =>
          trs.map((t) => (t.id === tid ? { ...t, trackContributors: [...t.trackContributors, row] } : t))
        );
      } else {
        setContributors((c) => [...c, row]);
      }
    }
    setAddContributorKind(null);
    setContributorAddForTrackId(null);
    setContributorOrgPicks([]);
    setContributorNameDraft("");
    markDirty();
  };

  const addContributorSubmitDisabled =
    !addContributorKind ||
    (organizationId &&
      CONTRIBUTOR_ORG_LIST_KINDS.includes(addContributorKind) &&
      contributorOrgPicks.length === 0) ||
    (!(
      organizationId && CONTRIBUTOR_ORG_LIST_KINDS.includes(addContributorKind)
    ) &&
      !contributorNameDraft.trim());

  const filteredContributorOrgUsers = useMemo(() => {
    if (!organizationId) return [];
    const q = contributorOrgSearch.trim().toLowerCase();
    return orgRoster.filter(
      (a) =>
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.allNames.some((n) => n.toLowerCase().includes(q)) ||
        a.roles.some((r) => r.toLowerCase().includes(q))
    );
  }, [organizationId, orgRoster, contributorOrgSearch]);

  const moveTrack = (id: string, dir: -1 | 1) => {
    setTracks((prev) => {
      const i = prev.findIndex((t) => t.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    markDirty();
  };

  const rosterForPicker = useMemo(() => {
    if (!organizationId)
      return MOCK_ARTISTS.map((a) => ({
        id: a.id,
        name: a.name,
        allNames: [a.name],
        roles: [],
      }));
    return orgRoster;
  }, [organizationId, orgRoster]);

  const filteredArtists = useMemo(() => {
    const q = artistSearch.trim().toLowerCase();
    return rosterForPicker.filter(
      (a) =>
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.allNames.some((n) => n.toLowerCase().includes(q)) ||
        a.roles.some((r) => r.toLowerCase().includes(q))
    );
  }, [artistSearch, rosterForPicker]);

  /** API rows for the "Use existing track" picker (`GET /api/tracks`, organization-scoped). */
  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    const usedTrackIds = new Set(
      tracks.map((t) => t.serverTrackId?.trim() || t.catalogRef?.trim() || "").filter((s) => s)
    );
    return catalogTracks.filter((t) => {
      const id = t.id?.trim();
      if (id && usedTrackIds.has(id)) return false;
      if (!q) return true;
      const title = (t.title ?? "").toLowerCase();
      const isrc = (t.isrc ?? "").toLowerCase();
      const artist = (t.primary_artist_name ?? t.artist_name ?? "").toLowerCase();
      return title.includes(q) || isrc.includes(q) || artist.includes(q);
    });
  }, [catalogSearch, catalogTracks, tracks]);

  useEffect(() => {
    if (!catalogDialogOpen) return;
    let cancelled = false;
    setCatalogTracksLoading(true);
    setCatalogTracksError(null);
    void listAllTracks()
      .then((rows) => {
        if (cancelled) return;
        setCatalogTracks(rows);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setCatalogTracksError(e instanceof Error ? e.message : "Could not load catalog tracks");
        setCatalogTracks([]);
      })
      .finally(() => {
        if (!cancelled) setCatalogTracksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [catalogDialogOpen]);

  const activeTrack = tracks.find((t) => t.id === trackDialogId);
  const activeTrackAudio = activeTrack?.files.find((f) => f.type === "audio");

  /**
   * Track Contributors view = release-level contributors (minus per-track hidden ids) +
   * track-specific additions. Hiding a release row here only appends to
   * `trackHiddenReleaseContributorIds`; it does not change the release Contributors section.
   *
   * Delegates to the top-level `getEffectiveTrackContributorRows` so the request body built
   * by `buildTrackContributorsForApi` is guaranteed to match what is rendered here.
   */
  type TrackContributorView = EffectiveTrackContributorRow;
  const buildTrackContributorView = (track: TrackWorkspace): TrackContributorView[] =>
    getEffectiveTrackContributorRows(track, contributors).map((v) =>
      /** Prefix inherited row ids so React keys can't collide with track-only rows. */
      v.inherited ? { ...v, row: { ...v.row, id: `rel:${v.row.id}` } } : v
    );
  /**
   * Effective track primary artist:
   *  - If the user picked a track-specific primary, use it (`inherited = false`).
   *  - Otherwise fall back to the release primary unless the user hid it via × on this track
   *    (`trackHideReleasePrimary` — does not affect other tracks or the release itself).
   */
  const effectiveTrackPrimary = activeTrack
    ? (() => {
        const trackName = activeTrack.trackMainArtistName.trim();
        if (trackName) return { name: trackName, inherited: false };
        if (activeTrack.trackHideReleasePrimary) return { name: "", inherited: false };
        const relName = mainArtistName.trim();
        return { name: relName, inherited: Boolean(relName) };
      })()
    : { name: "", inherited: false };
  const activeTrackContributorView = activeTrack ? buildTrackContributorView(activeTrack) : [];

  useEffect(() => {
    if (!isEditing || hydratingEdit || !trackDialogId) return;
    const row = tracksRef.current.find((t) => t.id === trackDialogId);
    const sid = row?.serverTrackId?.trim();
    /** Skip when there is no id, or it's a UI-only id like `cat-…` (catalog dialog row not yet attached). */
    if (!sid || !isLikelyServerTrackId(sid)) return;

    let cancelled = false;
    void (async () => {
      try {
        const detail = await getTrack(sid);
        if (cancelled) return;
        const dialogTrackId = trackDialogId;
        setTracks((prev) =>
          prev.map((tr) => (tr.id === dialogTrackId ? mergeTrackWorkspaceFromApi(tr, detail) : tr))
        );
      } catch (e: unknown) {
        if (cancelled) return;
        if (e instanceof TrackNotFoundError) {
          /** Track was removed server-side; keep the row in the UI with whatever metadata we have. */
          return;
        }
        toast.error(e instanceof Error ? e.message : "Could not load track details");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEditing, hydratingEdit, trackDialogId]);

  useEffect(() => {
    if (hydratingEdit || !isEditing) return;
    const f = pendingSection4FocusRef.current;
    if (!f) return;
    pendingSection4FocusRef.current = null;

    if (f.kind === "track") {
      const row = tracks.find((t) => t.serverTrackId === f.trackServerId || t.id === f.trackServerId);
      if (row) {
        setTrackDialogId(row.id);
        navigate(".", { replace: true, state: {} });
        return;
      }
    }
    if (f.kind === "publishing") {
      window.setTimeout(() => {
        document.getElementById("create-release-publishing")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      setValidationAttempt(true);
      navigate(".", { replace: true, state: {} });
      return;
    }
    if (f.kind === "release") {
      window.setTimeout(() => {
        document.getElementById("create-release-setup")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      toast.info("Review this section in Release setup to fix the issue.");
      navigate(".", { replace: true, state: {} });
    }
  }, [hydratingEdit, isEditing, tracks, navigate]);

  const publishingTotal = publishing.reduce((s, p) => s + p.ownershipPct, 0);

  /**
   * Options for the Publishing → Name combobox. Rebuilt whenever the primary artist, any
   * additional contributor, or the org-wide contributor list changes so newly-added rows are
   * immediately pickable.
   */
  const publishingContributorOptions = useMemo(
    () =>
      buildPublishingContributorOptions(
        mainArtistName,
        mainArtistId,
        contributors,
        orgContributorOptions
      ),
    [mainArtistName, mainArtistId, contributors, orgContributorOptions]
  );

  function addAudioToTrack(trackId: string, fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".wav") && !lower.includes("atmos") && !lower.endsWith(".ec3")) {
      toast.warning("Preferred formats: stereo WAV or Dolby Atmos delivery files.");
    }
    const dupName = tracks.some((t) => t.id !== trackId && t.files.some((f) => f.name === file.name));
    if (dupName) toast.warning("A file with this name already exists on another track — verify duplicates.");
    const uf: UploadFile = {
      id: `${Date.now()}`,
      name: file.name,
      type: "audio",
      size: formatBytes(file.size),
      progress: 100,
      status: "complete",
      file,
    };
    setTracks((ts) =>
      ts.map((x) =>
        x.id === trackId
          ? {
              ...x,
              files: [...x.files.filter((f) => f.type !== "audio"), uf],
              audioFormat: detectAtmos(file) ? "atmos" : "stereo",
            }
          : x
      )
    );
    markDirty();
  }

  function removeAudioFromTrack(trackId: string) {
    setTracks((ts) =>
      ts.map((x) =>
        x.id === trackId
          ? { ...x, files: x.files.filter((f) => f.type !== "audio"), audioFormat: "stereo" }
          : x
      )
    );
    markDirty();
  }

  function addSampleLicenses(trackId: string, fileList: FileList | null) {
    if (!fileList?.length) return;
    const add: UploadFile[] = Array.from(fileList).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      type: "document" as const,
      size: formatBytes(file.size),
      progress: 100,
      status: "complete" as const,
      file,
    }));
    setTracks((ts) =>
      ts.map((x) => (x.id === trackId ? { ...x, sampleLicenseFiles: [...x.sampleLicenseFiles, ...add] } : x))
    );
    markDirty();
  }

  return (
    <TooltipProvider>
      <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-x-hidden max-w-[1800px] mx-auto w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {isEditing
              ? "Edit release"
              : workspaceKind === "video"
                ? "Create video release"
                : "Create audio release"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {workspaceKind === "video"
              ? "Professional video delivery for VEVO and YouTube save drafts anytime."
              : "Structured metadata, tracks, and publishing — save drafts anytime."}
          </p>
          {hydratingEdit && (
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              Loading release…
            </p>
          )}
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Release type</CardTitle>
            <CardDescription>Choose audio or video each has a tailored delivery workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              role="tablist"
              aria-label="Release type"
              className="inline-flex w-full sm:w-auto rounded-lg border border-border/80 bg-muted/40 p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={workspaceKind === "audio"}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all",
                  workspaceKind === "audio"
                    ? "bg-[#ff0050] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  setWorkspaceKind("audio");
                  markDirty();
                }}
              >
                <Music className="h-4 w-4 shrink-0" />
                Audio release
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={workspaceKind === "video"}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all",
                  workspaceKind === "video"
                    ? "bg-[#ff0050] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  setWorkspaceKind("video");
                  markDirty();
                }}
              >
                <Video className="h-4 w-4 shrink-0" />
                Video release
              </button>
            </div>
          </CardContent>
        </Card>

        {workspaceKind === "video" && <VideoReleaseWorkspace editReleaseId={editReleaseId} />}

        {workspaceKind === "audio" && (
          <>
            {/* 3.1 Release setup */}
            <Card id="create-release-setup">
              <CardHeader>
                <CardTitle>Release setup</CardTitle>
                <CardDescription>Foundation metadata for DSP delivery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rel-title">Title *</Label>
                    <Input
                      id="rel-title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        markDirty();
                      }}
                      placeholder="Release title"
                      aria-invalid={validationAttempt && !!fieldErrors.title}
                    />
                    {validationAttempt && fieldErrors.title && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors.title}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="rel-ver">Version title</Label>
                    <Input
                      id="rel-ver"
                      value={versionTitle}
                      onChange={(e) => {
                        setVersionTitle(e.target.value);
                        markDirty();
                      }}
                      placeholder="Deluxe, Remix, Extended, Live…"
                    />
                  </div>
                  <div>
                    <Label>Release type</Label>
                    <Select
                      value={releaseType}
                      onValueChange={(v) => {
                        setReleaseType(v);
                        markDirty();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="ep">EP</SelectItem>
                        <SelectItem value="album">Album</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="label">Label name</Label>
                    <Input
                      id="label"
                      value={labelName}
                      onChange={(e) => {
                        setLabelName(e.target.value);
                        markDirty();
                      }}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="upc">UPC</Label>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center mt-1">
                      <Input
                        id="upc"
                        value={upc}
                        onChange={(e) => {
                          setUpc(e.target.value);
                          markDirty();
                        }}
                        placeholder="Manual entry"
                        disabled={autoUpc}
                        className="flex-1"
                      />
                      <label className="flex items-center gap-2 text-sm cursor-pointer shrink-0">
                        <Checkbox
                          checked={autoUpc}
                          onCheckedChange={(c) => {
                            setAutoUpc(c === true);
                            markDirty();
                          }}
                        />
                        Auto-generate placeholder UPC
                      </label>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={previouslyReleased}
                      onCheckedChange={(c) => {
                        const v = c === true;
                        setPreviouslyReleased(v);
                        if (v) setReleaseTiming("asap");
                        markDirty();
                      }}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium">Previously released</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Catalog transfer / re-release preserves DSP matching and catalog history.
                      </p>
                    </div>
                  </label>

                  {!previouslyReleased && (
                    <div className="space-y-3 pl-1">
                      <Label>Release timing</Label>
                      <RadioGroup
                        value={releaseTiming}
                        onValueChange={(v) => {
                          setReleaseTiming(v as "asap" | "date");
                          markDirty();
                        }}
                        className="flex flex-col gap-2"
                      >
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <RadioGroupItem value="asap" id="rt-asap" />
                          <span>As soon as possible</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <RadioGroupItem value="date" id="rt-date" />
                          <span>Select date</span>
                        </label>
                      </RadioGroup>
                      {releaseTiming === "date" && (
                        <div>
                          <Label htmlFor="rel-date">Release date</Label>
                          <Input
                            id="rel-date"
                            type="date"
                            value={releaseDate}
                            onChange={(e) => {
                              setReleaseDate(e.target.value);
                              markDirty();
                            }}
                            className="max-w-xs mt-1"
                          />
                          {validationAttempt && fieldErrors.releaseDate && (
                            <p className="text-xs text-destructive mt-1">{fieldErrors.releaseDate}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {previouslyReleased && (
                    <div>
                      <Label htmlFor="orig-date">Original release date *</Label>
                      <Input
                        id="orig-date"
                        type="date"
                        value={originalReleaseDate}
                        onChange={(e) => {
                          setOriginalReleaseDate(e.target.value);
                          markDirty();
                        }}
                        className="max-w-xs mt-1"
                      />
                      {validationAttempt && fieldErrors.originalReleaseDate && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.originalReleaseDate}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Future scheduling is disabled for catalog transfers.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor={coverInputId} className="text-base cursor-pointer">
                    Cover artwork *
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">JPG or PNG · minimum 3000 × 3000 px</p>
                  <div
                    className={cn(
                      "mt-3 border-2 border-dashed rounded-xl min-h-[200px] flex flex-col items-center justify-center gap-3 p-6 transition-colors cursor-pointer",
                      "hover:border-[#ff0050]/50 hover:bg-muted/40"
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleCoverFiles(e.dataTransfer.files);
                    }}
                    onClick={() => coverInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        coverInputRef.current?.click();
                      }
                    }}
                    role="presentation"
                  >
                    <input
                      ref={coverInputRef}
                      id={coverInputId}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
                      className="sr-only"
                      onChange={(e) => {
                        handleCoverFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    {coverDisplay ? (
                      <img src={coverDisplay} alt="" className="max-h-48 rounded-lg border object-contain" />
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm font-medium">Drag & drop or click to upload</p>
                      </>
                    )}
                    {coverFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoverFile(null);
                          setCoverPreviewUrl((prev) => {
                            if (prev) URL.revokeObjectURL(prev);
                            return null;
                          });
                          setCoverDimensionError(null);
                          markDirty();
                        }}
                      >
                        Remove file
                      </Button>
                    )}
                  </div>
                  {coverDimensionError && <p className="text-sm text-destructive mt-2">{coverDimensionError}</p>}
                  {validationAttempt && fieldErrors.cover && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.cover}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Label className="text-base">Primary artist *</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPrimaryArtistPickTarget("release");
                        setArtistDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add main primary artist
                    </Button>
                  </div>
                  {mainArtistName ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary">{mainArtistName}</Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No artist linked yet.</p>
                  )}
                  {validationAttempt && fieldErrors.mainArtist && (
                    <p className="text-xs text-destructive">{fieldErrors.mainArtist}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Additional artists</Label>

                  <div className="space-y-2 rounded-lg border border-border/50 bg-muted/15 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Featuring, With, Remixer
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => addContributor("featuring")}>
                        + Add artist (Featuring)
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => addContributor("with")}>
                        + Add artist (With)
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => addContributor("remixer")}>
                        + Add artist (Remixer)
                      </Button>
                    </div>
                    {contributors.some(isFeaturingWithRemixerContributor) ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                        {contributors.filter(isFeaturingWithRemixerContributor).map((c) => (
                          <div key={c.id} className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary">{c.name}</Badge>
                            <span className="text-xs text-muted-foreground">{contributorRowCaption(c)}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              aria-label={`Remove ${c.name}`}
                              onClick={() => {
                                queueRemovedContributor(c);
                                setContributors((x) => x.filter((y) => y.id !== c.id));
                                markDirty();
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2 rounded-lg border border-border/50 bg-muted/15 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Performers</p>
                    <Button type="button" size="sm" variant="outline" onClick={() => addContributor("performer")}>
                      + Add performer
                    </Button>
                    {contributors.some((c) => c.kind === "performer") ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                        {contributors
                          .filter((c) => c.kind === "performer")
                          .map((c) => (
                            <div key={c.id} className="flex items-center gap-2 text-sm">
                              <Badge variant="secondary">{c.name}</Badge>
                              <span className="text-xs text-muted-foreground">{contributorRowCaption(c)}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                aria-label={`Remove ${c.name}`}
                                onClick={() => {
                                  queueRemovedContributor(c);
                                  setContributors((x) => x.filter((y) => y.id !== c.id));
                                  markDirty();
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2 rounded-lg border border-border/50 bg-muted/15 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Credits</p>
                    <Button type="button" size="sm" variant="outline" onClick={() => addContributor("credit")}>
                      + Add credit
                    </Button>
                    {contributors.some((c) => c.kind === "credit") ? (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                        {contributors
                          .filter((c) => c.kind === "credit")
                          .map((c) => (
                            <div key={c.id} className="flex items-center gap-2 text-sm">
                              <Badge variant="secondary">{c.name}</Badge>
                              <span className="text-xs text-muted-foreground">{contributorRowCaption(c)}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                aria-label={`Remove ${c.name}`}
                                onClick={() => {
                                  queueRemovedContributor(c);
                                  setContributors((x) => x.filter((y) => y.id !== c.id));
                                  markDirty();
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : null}
                  </div>

                  {contributors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No additional artists yet.</p>
                  ) : null}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Primary genre *</Label>
                    <Select
                      value={primaryGenre || "__none__"}
                      onValueChange={(v) => {
                        setPrimaryGenre(v === "__none__" ? "" : v);
                        markDirty();
                      }}
                    >
                      <SelectTrigger aria-invalid={validationAttempt && !!fieldErrors.primaryGenre}>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Select…</SelectItem>
                        {primaryGenreOptions.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationAttempt && fieldErrors.primaryGenre && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors.primaryGenre}</p>
                    )}
                  </div>
                  <div>
                    <Label>Secondary genre</Label>
                    <Select
                      value={secondaryGenre || "__none__"}
                      onValueChange={(v) => {
                        setSecondaryGenre(v === "__none__" ? "" : v);
                        markDirty();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {secondaryGenreOptions.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3.2 Tracks */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle>Tracks</CardTitle>
                  <CardDescription>Order defines release sequencing</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Help">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-left">
                      If this track is already in your catalog, select it instead of uploading again. This keeps your
                      original ISRC and metadata connected.
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" className="bg-[#ff0050] hover:bg-[#cc0040]">
                        <Plus className="h-4 w-4 mr-2" />
                        Add track
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setCatalogDialogOpen(true);
                          markDirty();
                        }}
                      >
                        Use existing track
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setTracks((t) => [...t, emptyTrack(String(Date.now()))]);
                          markDirty();
                        }}
                      >
                        Upload new track
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {validationAttempt && fieldErrors.tracks && (
                  <p className="text-sm text-destructive">{fieldErrors.tracks}</p>
                )}
                {tracks.map((t, idx) => (
                  <div key={t.id} className="rounded-lg border p-4 flex flex-col sm:flex-row gap-4 sm:items-center">
                    <FileAudio className="h-8 w-8 text-[#ff0050] shrink-0 hidden sm:block" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-medium truncate">{t.title || "Untitled track"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(t.trackMainArtistName || mainArtistName).trim() || "—"}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span>ISRC: {t.isrc || "—"}</span>
                        <Badge variant="outline">{t.statusLabel}</Badge>
                        {t.audioFormat === "atmos" && (
                          <Badge variant="secondary" className="text-[10px]">
                            Dolby Atmos
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 shrink-0">
                      <Button type="button" size="icon" variant="outline" onClick={() => moveTrack(t.id, -1)} disabled={idx === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => moveTrack(t.id, 1)}
                        disabled={idx === tracks.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setTrackDialogId(t.id)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          if (tracks.length <= 1) {
                            toast.error("At least one track row is required.");
                            return;
                          }
                          setTracks((x) => x.filter((y) => y.id !== t.id));
                          markDirty();
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 3.4 Publishing */}
            <Card id="create-release-publishing">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle>Publishing</CardTitle>
                  <CardDescription>Writers and publishers ownership must total 100%</CardDescription>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPublishing((p) => [
                      ...p,
                      {
                        id: `p-${Date.now()}`,
                        name: "",
                        role: "",
                        ownershipPct: 0,
                        iswc: "",
                        publishingType: "copyright_control",
                      },
                    ]);
                    markDirty();
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add writer & publisher
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {/**
                 * Running total — visible at all times.
                 *  - Green when exactly 100%.
                 *  - Red (destructive) when there is at least one writer row and the total drifts.
                 *  - Muted when the section is empty (no warning needed yet).
                 */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Running total</span>
                  <span
                    className={cn(
                      "font-medium",
                      publishing.length === 0
                        ? ""
                        : Math.round(publishingTotal) === 100
                          ? "text-green-600"
                          : "text-destructive"
                    )}
                  >
                    {publishingTotal}%
                  </span>
                </div>
                {publishing.length > 0 && Math.round(publishingTotal) !== 100 && (
                  <p className="text-sm text-destructive">
                    {Math.round(publishingTotal) > 100
                      ? `Total ownership exceeds 100% by ${Math.round(publishingTotal) - 100}%. Adjust the splits so the total equals 100%.`
                      : `Total ownership is below 100% by ${100 - Math.round(publishingTotal)}%. Adjust the splits so the total equals 100%.`}
                  </p>
                )}
                {validationAttempt && fieldErrors.publishing && (
                  <p className="text-sm text-destructive">{fieldErrors.publishing}</p>
                )}
                {publishing.map((row) => {
                  /**
                   * Filter contributor suggestions by the current name input — keeps the dropdown
                   * useful even when the user starts typing a name not in the list (free-typing
                   * stays supported; selecting a suggestion overwrites both Name and Role).
                   */
                  const trimmedName = row.name.trim().toLowerCase();
                  const filteredOptions = trimmedName
                    ? publishingContributorOptions.filter((opt) =>
                        opt.name.toLowerCase().includes(trimmedName)
                      )
                    : publishingContributorOptions;
                  const isOpen = publishingPickerOpenId === row.id;
                  return (
                  <div key={row.id} className="grid sm:grid-cols-2 lg:grid-cols-6 gap-2 items-end border rounded-lg p-3">
                    <div className="lg:col-span-2">
                      <Label className="text-xs">Name</Label>
                      <Popover
                        open={isOpen}
                        onOpenChange={(open) => setPublishingPickerOpenId(open ? row.id : null)}
                      >
                        <PopoverAnchor asChild>
                          <div
                            ref={(el) => {
                              publishingAnchorRefs.current[row.id] = el;
                            }}
                            className="relative w-full"
                          >
                            <Input
                              className="pr-10"
                              autoComplete="off"
                              placeholder={
                                publishingContributorOptions.length > 0
                                  ? "Pick a contributor or type"
                                  : "Writer or publisher name"
                              }
                              value={row.name}
                              onChange={(e) => {
                                const v = e.target.value;
                                setPublishing((p) =>
                                  p.map((x) => (x.id === row.id ? { ...x, name: v } : x))
                                );
                                if (publishingContributorOptions.length > 0) {
                                  setPublishingPickerOpenId(row.id);
                                }
                                markDirty();
                              }}
                              onFocus={() => {
                                if (publishingContributorOptions.length > 0) {
                                  setPublishingPickerOpenId(row.id);
                                }
                              }}
                            />
                            {publishingContributorOptions.length > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                                aria-expanded={isOpen}
                                aria-label="Show contributor list"
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPublishingPickerOpenId((cur) => (cur === row.id ? null : row.id));
                                }}
                              >
                                <ChevronDown className="size-4 opacity-70" />
                              </Button>
                            )}
                          </div>
                        </PopoverAnchor>
                        {filteredOptions.length > 0 && (
                          <PopoverContent
                            align="start"
                            sideOffset={4}
                            className="max-h-72 w-[var(--radix-popover-anchor-width)] min-w-[16rem] overflow-y-auto p-0 shadow-md"
                            onOpenAutoFocus={(e) => e.preventDefault()}
                            onInteractOutside={(e) => {
                              const anchor = publishingAnchorRefs.current[row.id];
                              if (anchor?.contains(e.target as Node)) {
                                e.preventDefault();
                              }
                            }}
                            onFocusOutside={(e) => {
                              const anchor = publishingAnchorRefs.current[row.id];
                              if (anchor?.contains(e.target as Node)) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Pick from contributors
                            </p>
                            <div className="flex flex-col gap-px px-1 pb-1">
                              {filteredOptions.map((opt) => (
                                <button
                                  key={opt.key}
                                  type="button"
                                  className="rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => {
                                    /**
                                     * Priority for `user_id` resolution on pick:
                                     *  1. The option's own `userId` (captured from
                                     *     `GET /api/releases.contributors[].user_id` or set on
                                     *     Section-1/2 picks) — no roster fetch required.
                                     *  2. Roster name match — covers manually-typed names where
                                     *     the org roster is already loaded.
                                     *  3. Existing `userId` on the row (keeps prior pick intact).
                                     */
                                    const rosterId = resolveOrgRosterUserIdString(opt.name, orgRoster);
                                    const resolvedUserId =
                                      opt.userId ?? rosterId ?? row.userId ?? null;
                                    setPublishing((p) =>
                                      p.map((x) =>
                                        x.id === row.id
                                          ? {
                                              ...x,
                                              name: opt.name,
                                              role: opt.role,
                                              userId: resolvedUserId,
                                            }
                                          : x
                                      )
                                    );
                                    setPublishingPickerOpenId(null);
                                    markDirty();
                                  }}
                                >
                                  <span className="font-medium">{opt.name}</span>
                                  {opt.hint && (
                                    <span className="ml-2 text-xs text-muted-foreground">{opt.hint}</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        )}
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-xs">Role</Label>
                      <Input
                        value={row.role}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPublishing((p) => p.map((x) => (x.id === row.id ? { ...x, role: v } : x)));
                          markDirty();
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Ownership %</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={row.ownershipPct || ""}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          setPublishing((p) =>
                            p.map((x) => (x.id === row.id ? { ...x, ownershipPct: Number.isFinite(n) ? n : 0 } : x))
                          );
                          markDirty();
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">ISWC</Label>
                      {/**
                       * Live ISWC validation — error appears as soon as the field is non-empty and
                       * the value doesn't match `T-DDD.DDD.DDD-D` (or any equivalent canonical
                       * `T` + 10 digits form). The submission flow blocks Continue when invalid.
                       */}
                      <Input
                        value={row.iswc}
                        placeholder="T-123.456.789-0"
                        aria-invalid={Boolean(getIswcRowError(row.iswc))}
                        className={cn(
                          getIswcRowError(row.iswc) &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPublishing((p) =>
                            p.map((x) => (x.id === row.id ? { ...x, iswc: v } : x))
                          );
                          markDirty();
                        }}
                      />
                      {getIswcRowError(row.iswc) && (
                        <p className="mt-1 text-xs text-destructive">
                          {getIswcRowError(row.iswc)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={row.publishingType}
                          onValueChange={(v) => {
                            setPublishing((p) =>
                              p.map((x) =>
                                x.id === row.id ? { ...x, publishingType: v as PublishingRow["publishingType"] } : x
                              )
                            );
                            markDirty();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="copyright_control">Copyright control</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-0.5"
                        onClick={() => {
                          setPublishing((p) => p.filter((x) => x.id !== row.id));
                          /** Close any open dropdown anchored to the row being removed. */
                          setPublishingPickerOpenId((cur) => (cur === row.id ? null : cur));
                          delete publishingAnchorRefs.current[row.id];
                          markDirty();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 3.5 Save */}
            <Card>
              <CardHeader>
                <CardTitle>Save & continue</CardTitle>
                <CardDescription>Save draft anytime; continue validates required delivery data.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={submitting || hydratingEdit}
                  onClick={() => void handleSaveDraft()}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save draft
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#ff0050] hover:bg-[#cc0040]"
                  disabled={submitting || hydratingEdit}
                  onClick={() => void handleContinue()}
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Artist picker — scrollable list so all org users (e.g. 40+) are reachable */}
        <Dialog
          open={artistDialogOpen}
          onOpenChange={(o) => {
            setArtistDialogOpen(o);
            if (!o) setPrimaryArtistPickTarget("release");
          }}
        >
          <DialogContent
            className={cn(
              "!flex !max-h-[min(90dvh,720px)] !flex-col !gap-3 !overflow-hidden p-6 sm:max-w-lg"
            )}
          >
            <DialogHeader className="shrink-0">
              <DialogTitle>
                {primaryArtistPickTarget === "release"
                  ? "Select main primary artist"
                  : "Select track primary artist"}
              </DialogTitle>
              <DialogDescription>
                {organizationId
                  ? "Choose from users in your organization, or create a new artist name."
                  : "Search your roster or create a new artist."}
              </DialogDescription>
            </DialogHeader>
            <Input
              className="shrink-0"
              placeholder="Search…"
              value={artistSearch}
              onChange={(e) => setArtistSearch(e.target.value)}
            />
            {organizationId && rosterForPicker.length > 0 && !orgRosterLoading && (
              <p className="shrink-0 text-xs text-muted-foreground" aria-live="polite">
                {filteredArtists.length === rosterForPicker.length
                  ? `Showing all ${rosterForPicker.length} people — scroll to see more.`
                  : `${filteredArtists.length} of ${rosterForPicker.length} matching search.`}
              </p>
            )}
            <div
              className="min-h-[min(52vh,480px)] flex-1 overflow-y-auto overscroll-y-contain rounded-md border border-border/60 bg-muted/20 py-1.5 pl-1.5 pr-2 [scrollbar-gutter:stable] touch-pan-y"
              role="listbox"
              aria-label="Organization users"
            >
              {organizationId && orgRosterLoading && orgRoster.length === 0 ? (
                <div className="flex items-center gap-2 py-6 px-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  Loading users…
                </div>
              ) : organizationId && orgRosterError && orgRoster.length === 0 ? (
                <p className="px-2 py-3 text-sm text-destructive">{orgRosterError}</p>
              ) : (
                <div className="space-y-1 pr-0.5">
                  {filteredArtists.map((a) => (
                    <Button
                      key={a.id}
                      type="button"
                      variant="ghost"
                      className="w-full h-auto min-h-9 justify-start gap-0 px-3 py-2 whitespace-normal"
                      onClick={() => {
                        if (primaryArtistPickTarget === "release") {
                          setMainArtistId(a.id);
                          setMainArtistName(a.name);
                        } else {
                          const pickTid = primaryArtistPickTarget;
                          setTracks((ts) =>
                            ts.map((x) =>
                              x.id === pickTid
                                ? {
                                    ...x,
                                    trackMainArtistId: a.id,
                                    trackMainArtistName: a.name,
                                    /** Picking a new primary clears any prior "hide release primary" intent. */
                                    trackHideReleasePrimary: false,
                                  }
                                : x
                            )
                          );
                        }
                        setArtistDialogOpen(false);
                        markDirty();
                      }}
                    >
                      <span className="flex w-full min-w-0 items-center justify-between gap-3 text-left">
                        <span className="min-w-0 shrink font-medium leading-snug text-foreground">
                          {a.name}
                        </span>
                        {a.roles.length > 0 ? (
                          <span className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                            {a.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="secondary"
                                className="max-w-[11rem] truncate border-border/60 px-2 py-0 text-[11px] font-normal text-muted-foreground"
                              >
                                {role
                                  .split("_")
                                  .map((w) =>
                                    w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""
                                  )
                                  .join(" ")}
                              </Badge>
                            ))}
                          </span>
                        ) : null}
                      </span>
                    </Button>
                  ))}
                  {filteredArtists.length === 0 && !orgRosterLoading && (
                    <p className="px-2 py-3 text-sm text-muted-foreground">
                      {organizationId && rosterForPicker.length === 0
                        ? "No users returned for this organization."
                        : "No matches — create a new artist."}
                    </p>
                  )}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => setCreateArtistOpen(true)}
            >
              Create new artist
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={createArtistOpen} onOpenChange={setCreateArtistOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New artist</DialogTitle>
            </DialogHeader>
            <Input value={newArtistName} onChange={(e) => setNewArtistName(e.target.value)} placeholder="Artist name" />
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  const n = newArtistName.trim();
                  if (!n) return;
                  const newId = `new-${Date.now()}`;
                  if (primaryArtistPickTarget === "release") {
                    setMainArtistId(newId);
                    setMainArtistName(n);
                  } else {
                    const pickTid = primaryArtistPickTarget;
                    setTracks((ts) =>
                      ts.map((x) =>
                        x.id === pickTid
                          ? {
                              ...x,
                              trackMainArtistId: newId,
                              trackMainArtistName: n,
                              trackHideReleasePrimary: false,
                            }
                          : x
                      )
                    );
                  }
                  setCreateArtistOpen(false);
                  setArtistDialogOpen(false);
                  setNewArtistName("");
                  markDirty();
                }}
              >
                Save artist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!addContributorKind}
          onOpenChange={(o) => {
            if (!o) {
              setAddContributorKind(null);
              setContributorOrgPicks([]);
              setContributorNameDraft("");
              setContributorAddForTrackId(null);
            }
          }}
        >
          <DialogContent
            className={cn(
              addContributorKind &&
                CONTRIBUTOR_ORG_LIST_KINDS.includes(addContributorKind) &&
                organizationId &&
                "!flex !max-h-[min(90dvh,640px)] !flex-col !gap-3 !overflow-hidden p-6 sm:max-w-lg",
            )}
          >
            <DialogHeader className="shrink-0">
              <DialogTitle>
                {contributorAddForTrackId ? "Add contributor to this track" : "Add contributor"}
              </DialogTitle>
              <DialogDescription>
                {addContributorKind === "performer" &&
                  (organizationId
                    ? "Instrument or vocal role. Select one or more people, then set role details below."
                    : "Instrument or vocal role")}
                {addContributorKind === "credit" &&
                  (organizationId
                    ? "Producer, engineer, mixer, etc. Select one or more people, then set role details below."
                    : "Producer, engineer, mixer, etc.")}
                {addContributorKind &&
                  CONTRIBUTOR_ORG_PICKER_KINDS.includes(addContributorKind) &&
                  organizationId &&
                  "Pick one or more people from your organization."}
              </DialogDescription>
            </DialogHeader>

            {addContributorKind &&
              CONTRIBUTOR_ORG_LIST_KINDS.includes(addContributorKind) &&
              organizationId && (
                <>
                  <Input
                    className="shrink-0"
                    placeholder="Search…"
                    value={contributorOrgSearch}
                    onChange={(e) => setContributorOrgSearch(e.target.value)}
                  />
                  {orgRoster.length > 0 && !orgRosterLoading && (
                    <p className="shrink-0 text-xs text-muted-foreground" aria-live="polite">
                      {filteredContributorOrgUsers.length === orgRoster.length
                        ? `Showing all ${orgRoster.length} people — scroll to select.`
                        : `${filteredContributorOrgUsers.length} of ${orgRoster.length} matching search.`}
                    </p>
                  )}
                  <div
                    className="min-h-[min(36vh,280px)] flex-1 overflow-y-auto overscroll-y-contain rounded-md border border-border/60 bg-muted/20 py-1.5 pl-1.5 pr-2 [scrollbar-gutter:stable] touch-pan-y"
                    role="listbox"
                    aria-label="Organization users for contributor"
                  >
                    {orgRosterLoading && orgRoster.length === 0 ? (
                      <div className="flex items-center gap-2 px-2 py-6 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        Loading users…
                      </div>
                    ) : orgRosterError && orgRoster.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-destructive">{orgRosterError}</p>
                    ) : (
                      <div className="space-y-1 pr-0.5">
                        {filteredContributorOrgUsers.map((a) => {
                          const picked = contributorOrgPicks.some((p) => p.id === a.id);
                          return (
                          <Button
                            key={a.id}
                            type="button"
                            variant={picked ? "secondary" : "ghost"}
                            className="w-full h-auto min-h-9 justify-start gap-0 px-3 py-2 whitespace-normal"
                            onClick={() => {
                              setContributorOrgPicks((prev) =>
                                prev.some((p) => p.id === a.id)
                                  ? prev.filter((p) => p.id !== a.id)
                                  : [...prev, { id: a.id, name: a.name }],
                              );
                            }}
                          >
                            <span className="flex w-full min-w-0 items-center justify-between gap-3 text-left">
                              <span className="min-w-0 shrink font-medium leading-snug text-foreground">
                                {a.name}
                              </span>
                              {a.roles.length > 0 ? (
                                <span className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                                  {a.roles.map((role) => (
                                    <Badge
                                      key={role}
                                      variant="secondary"
                                      className="max-w-[11rem] truncate border-border/60 px-2 py-0 text-[11px] font-normal text-muted-foreground"
                                    >
                                      {role
                                        .split("_")
                                        .map((w) =>
                                          w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""
                                        )
                                        .join(" ")}
                                    </Badge>
                                  ))}
                                </span>
                              ) : null}
                            </span>
                          </Button>
                          );
                        })}
                        {filteredContributorOrgUsers.length === 0 && !orgRosterLoading && (
                          <p className="px-2 py-3 text-sm text-muted-foreground">
                            {orgRoster.length === 0
                              ? "No users returned for this organization."
                              : "No matches — try another search."}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 space-y-2">
                    <Label className="text-xs text-muted-foreground">Selected</Label>
                    <div
                      className="flex min-h-[2.25rem] flex-wrap gap-2 rounded-md border border-border/60 bg-muted/20 px-2 py-2"
                      role="group"
                      aria-label="Selected contributors"
                    >
                      {contributorOrgPicks.length === 0 ? (
                        <span className="px-0.5 py-1 text-xs text-muted-foreground">
                          Select people from the list above.
                        </span>
                      ) : (
                        contributorOrgPicks.map((p) => (
                          <Badge
                            key={p.id}
                            variant="secondary"
                            className="max-w-full gap-0.5 border-border/60 py-0.5 pl-2 pr-0.5 text-xs font-normal"
                          >
                            <span className="max-w-[14rem] truncate">{p.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 shrink-0 rounded-sm text-muted-foreground hover:text-foreground"
                              aria-label={`Remove ${p.name}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setContributorOrgPicks((prev) => prev.filter((x) => x.id !== p.id));
                              }}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

            {addContributorKind &&
              CONTRIBUTOR_ORG_PICKER_KINDS.includes(addContributorKind) &&
              !organizationId && (
                <Input
                  placeholder="Name"
                  value={contributorNameDraft}
                  onChange={(e) => setContributorNameDraft(e.target.value)}
                />
              )}

            {(addContributorKind === "performer" || addContributorKind === "credit") &&
              !organizationId && (
                <Input
                  placeholder="Name"
                  value={contributorNameDraft}
                  onChange={(e) => setContributorNameDraft(e.target.value)}
                />
              )}
            {addContributorKind === "performer" && (
              <Popover open={performerRoleMenuOpen} onOpenChange={setPerformerRoleMenuOpen}>
                <PopoverAnchor asChild>
                  <div ref={performerRoleAnchorRef} className="relative w-full">
                    <Input
                      placeholder="Role detail"
                      className="pr-10"
                      value={contributorRoleDraft}
                      onChange={(e) => setContributorRoleDraft(e.target.value)}
                      onClick={() => setPerformerRoleMenuOpen(true)}
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                      aria-expanded={performerRoleMenuOpen}
                      aria-label="Show or hide performer role list"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPerformerRoleMenuOpen((v) => !v);
                      }}
                    >
                      <ChevronDown className="size-4 opacity-70" />
                    </Button>
                  </div>
                </PopoverAnchor>
                <PopoverContent
                  align="start"
                  sideOffset={4}
                  className="max-h-72 w-[var(--radix-popover-anchor-width)] min-w-[12rem] overflow-y-auto p-0 shadow-md"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onInteractOutside={(e) => {
                    if (performerRoleAnchorRef.current?.contains(e.target as Node)) {
                      e.preventDefault();
                    }
                  }}
                  onFocusOutside={(e) => {
                    if (performerRoleAnchorRef.current?.contains(e.target as Node)) {
                      e.preventDefault();
                    }
                  }}
                >
                  {PERFORMER_ROLE_GROUPS.map((g) => (
                    <div key={g.label} className="border-b border-border/60 py-1 last:border-b-0">
                      <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {g.label}
                      </p>
                      <div className="flex flex-col gap-px px-1 pb-1">
                        {g.roles.map((roleId) => (
                          <button
                            key={roleId}
                            type="button"
                            className="rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                              setContributorRoleDraft((prev) => {
                                const t = prev.trim();
                                return t ? `${t}, ${roleId}` : roleId;
                              });
                              setPerformerRoleMenuOpen(false);
                            }}
                          >
                            {humanizeSnakeCaseRoleId(roleId)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            )}
            {addContributorKind === "credit" && (
              <Popover open={creditRoleMenuOpen} onOpenChange={setCreditRoleMenuOpen}>
                <PopoverAnchor asChild>
                  <div ref={creditRoleAnchorRef} className="relative w-full">
                    <Input
                      placeholder="Role detail"
                      className="pr-10"
                      value={contributorRoleDraft}
                      onChange={(e) => setContributorRoleDraft(e.target.value)}
                      onClick={() => setCreditRoleMenuOpen(true)}
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                      aria-expanded={creditRoleMenuOpen}
                      aria-label="Show or hide credit role list"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCreditRoleMenuOpen((v) => !v);
                      }}
                    >
                      <ChevronDown className="size-4 opacity-70" />
                    </Button>
                  </div>
                </PopoverAnchor>
                <PopoverContent
                  align="start"
                  sideOffset={4}
                  className="max-h-72 w-[var(--radix-popover-anchor-width)] min-w-[12rem] overflow-y-auto p-0 shadow-md"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onInteractOutside={(e) => {
                    if (creditRoleAnchorRef.current?.contains(e.target as Node)) {
                      e.preventDefault();
                    }
                  }}
                  onFocusOutside={(e) => {
                    if (creditRoleAnchorRef.current?.contains(e.target as Node)) {
                      e.preventDefault();
                    }
                  }}
                >
                  {CREDIT_ROLE_GROUPS.map((g) => (
                    <div key={g.label} className="border-b border-border/60 py-1 last:border-b-0">
                      <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {g.label}
                      </p>
                      <div className="flex flex-col gap-px px-1 pb-1">
                        {g.roles.map((roleId) => (
                          <button
                            key={roleId}
                            type="button"
                            className="rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                              setContributorRoleDraft((prev) => {
                                const t = prev.trim();
                                return t ? `${t}, ${roleId}` : roleId;
                              });
                              setCreditRoleMenuOpen(false);
                            }}
                          >
                            {humanizeSnakeCaseRoleId(roleId)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setAddContributorKind(null);
                setContributorAddForTrackId(null);
              }}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmContributor}
                disabled={addContributorSubmitDisabled}
              >
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={catalogDialogOpen} onOpenChange={setCatalogDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Use existing track</DialogTitle>
              <DialogDescription>Search catalog (demo data).</DialogDescription>
            </DialogHeader>
            <Input placeholder="Search title, artist, ISRC…" value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {catalogTracksLoading ? (
                <div className="flex items-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading catalog tracks…
                </div>
              ) : catalogTracksError ? (
                <p className="px-2 py-3 text-sm text-destructive">{catalogTracksError}</p>
              ) : filteredCatalog.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  {catalogTracks.length === 0
                    ? "No catalog tracks yet."
                    : "No tracks match your search."}
                </p>
              ) : (
                filteredCatalog.map((ct) => {
                  const titleText = ct.title?.trim() || "Untitled track";
                  const isrcText = ct.isrc?.trim();
                  const artistText = (ct.primary_artist_name ?? ct.artist_name ?? "").trim();
                  return (
                    <Button
                      key={ct.id}
                      type="button"
                      variant="ghost"
                      className="w-full justify-start h-auto py-2 flex-col items-start"
                      onClick={() => {
                        const tid = ct.id.trim();
                        if (tracks.some((x) => x.serverTrackId === tid || x.catalogRef === tid)) {
                          toast.warning("Track already on this release.");
                          return;
                        }
                        const files = [
                          trackAssetToUploadFile(ct.audio, "audio"),
                          trackAssetToUploadFile(ct.artwork, "image"),
                        ].filter((f): f is UploadFile => f != null);
                        const propsFromApi = unknownTrackPropertiesToApiKeys(ct.track_properties);
                        const previewSeconds =
                          typeof ct.preview_start === "number" && Number.isFinite(ct.preview_start)
                            ? String(ct.preview_start)
                            : "00:15";
                        const trackOriginRaw = String(ct.track_origin ?? "").trim();
                        const trackOrigin: TrackWorkspace["trackOrigin"] =
                          trackOriginRaw === "public_domain" || trackOriginRaw === "cover"
                            ? (trackOriginRaw as TrackWorkspace["trackOrigin"])
                            : "original";
                        setTracks((prev) => [
                          ...prev,
                          {
                            ...emptyTrack(`cat-${tid}`),
                            serverTrackId: tid,
                            source: "catalog",
                            catalogRef: tid,
                            title: titleText,
                            isrc: isrcText ?? "",
                            statusLabel: "Catalog",
                            primaryGenre:
                              (typeof ct.primary_genre === "string" ? ct.primary_genre.trim() : "") ||
                              primaryGenre,
                            secondaryGenre:
                              typeof ct.secondary_genre === "string" ? ct.secondary_genre.trim() : "",
                            version: typeof ct.version === "string" ? ct.version.trim() : "",
                            language: typeof ct.language === "string" ? ct.language.trim() : "",
                            lyrics: typeof ct.lyrics === "string" ? ct.lyrics.trim() : "",
                            explicit: Boolean(ct.is_explicit),
                            previewStart: previewSeconds,
                            trackOrigin,
                            properties:
                              propsFromApi.length > 0 ? apiTrackPropertiesToUiIds(propsFromApi) : [],
                            copyrightYear:
                              ct.copyright_year != null
                                ? String(ct.copyright_year)
                                : String(new Date().getFullYear()),
                            copyrightOwner:
                              (typeof ct.copyright_owner === "string" ? ct.copyright_owner.trim() : "") ||
                              mainArtistName ||
                              artistText,
                            files,
                          },
                        ]);
                        setCatalogDialogOpen(false);
                        markDirty();
                      }}
                    >
                      <span className="font-medium">{titleText}</span>
                      <span className="text-xs text-muted-foreground">
                        {artistText ? `${artistText} · ` : ""}ISRC: {isrcText || "—"}
                      </span>
                    </Button>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Track metadata dialog */}
        <Dialog open={!!activeTrack} onOpenChange={(o) => !o && setTrackDialogId(null)}>
          {activeTrack && (
            <DialogContent
              className={cn(
                "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0",
                // Viewport-centered dialog: cap width on lg+ so half-width does not enter the w-64 sidebar (16rem) + gutters.
                "w-[min(1120px,calc(100vw-3rem))] max-w-[min(1120px,calc(100vw-3rem))] sm:max-w-[min(1120px,calc(100vw-3rem))]",
                "lg:w-[min(1120px,calc(100vw-34rem))] lg:max-w-[min(1120px,calc(100vw-34rem))]"
              )}
            >
              <DialogHeader className="shrink-0 space-y-1 border-b border-border/60 px-6 pb-4 pt-6 pr-14">
                <DialogTitle>Track metadata</DialogTitle>
                <DialogDescription>{activeTrack.title || "Untitled"}</DialogDescription>
              </DialogHeader>
              <div
                className={cn(
                  "min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4",
                  TRACK_METADATA_SCROLL_AREA
                )}
              >
                {activeTrack.source === "upload" && (
                  <div>
                    <Label>Audio (stereo WAV / Atmos)</Label>
                    <input
                      id={`audio-${activeTrack.id}`}
                      type="file"
                      accept=".wav,.flac,.ec3,audio/*"
                      className="hidden"
                      onChange={(e) => {
                        addAudioToTrack(activeTrack.id, e.target.files);
                        e.target.value = "";
                      }}
                    />
                    {activeTrackAudio ? (
                      <div className="mt-2 space-y-2">
                        <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                          <div className="flex gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                              <FileAudio className="h-6 w-6 text-[#ff0050]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-snug text-foreground truncate">
                                {activeTrackAudio.name}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-muted-foreground">{activeTrackAudio.size}</span>
                                <Badge variant="secondary" className="text-[10px] font-normal">
                                  {activeTrack.audioFormat === "atmos" ? "Dolby Atmos" : "Stereo"}
                                </Badge>
                              </div>
                              {activeTrackAudio.file ? (
                                <TrackLocalAudioPreview file={activeTrackAudio.file} />
                              ) : activeTrackAudio.remoteUrl ? (
                                <TrackRemoteAudioPreview
                                  initialUrl={activeTrackAudio.remoteUrl}
                                  serverTrackId={activeTrack.serverTrackId}
                                />
                              ) : null}
                            </div>
                            <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-start">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="whitespace-nowrap"
                                onClick={() => document.getElementById(`audio-${activeTrack.id}`)?.click()}
                              >
                                Replace
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                aria-label={`Remove ${activeTrackAudio.name}`}
                                onClick={() => removeAudioFromTrack(activeTrack.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="w-full rounded-lg border border-dashed border-border/80 py-3 text-center text-xs text-muted-foreground transition-colors hover:bg-muted/40"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            addAudioToTrack(activeTrack.id, e.dataTransfer.files);
                          }}
                          onClick={() => document.getElementById(`audio-${activeTrack.id}`)?.click()}
                        >
                          Drop a file here or click to replace
                        </button>
                      </div>
                    ) : (
                      <div
                        className="mt-1 border border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          addAudioToTrack(activeTrack.id, e.dataTransfer.files);
                        }}
                        onClick={() => document.getElementById(`audio-${activeTrack.id}`)?.click()}
                      >
                        <Upload className="h-6 w-6 mx-auto text-[#ff0050]" />
                        <p className="text-xs text-muted-foreground mt-2">Drag & drop or browse</p>
                      </div>
                    )}
                    {validationAttempt && fieldErrors[`track-${activeTrack.id}-audio`] && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors[`track-${activeTrack.id}-audio`]}</p>
                    )}
                  </div>
                )}
                <div>
                  <Label>Track title *</Label>
                  <Input
                    value={activeTrack.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTracks((ts) => ts.map((x) => (x.id === activeTrack.id ? { ...x, title: v } : x)));
                      markDirty();
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor={`track-isrc-${activeTrack.id}`}>
                    ISRC{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id={`track-isrc-${activeTrack.id}`}
                    placeholder="e.g. USRC17607839"
                    autoComplete="off"
                    spellCheck={false}
                    value={activeTrack.isrc ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTracks((ts) =>
                        ts.map((x) => (x.id === activeTrack.id ? { ...x, isrc: v } : x))
                      );
                      markDirty();
                    }}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Optional. Empty means no ISRC on create; when saving an existing track, empty
                    clears ISRC.
                  </p>
                </div>

                <div className="space-y-3 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">Contributors</p>
                    {contributors.length > 0 || mainArtistName.trim() ? (
                      <span className="text-[11px] text-muted-foreground">
                        Release contributors sync here. Use × on a row to hide it on this track only.
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Label className="text-base">Primary artist *</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPrimaryArtistPickTarget(activeTrack.id);
                          setArtistDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {activeTrack.trackMainArtistName.trim()
                          ? "Change primary artist"
                          : effectiveTrackPrimary.name
                            ? "Replace primary artist"
                            : "Add primary artist"}
                      </Button>
                      {/**
                       * "Show release primary" — reappears only when the user × the inherited
                       * release primary AND has not picked a track-specific override. Clicking it
                       * clears the hide flag so the release primary flows back in.
                       */}
                      {activeTrack.trackHideReleasePrimary && !activeTrack.trackMainArtistName.trim() && mainArtistName.trim() && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setTracks((ts) =>
                              ts.map((x) =>
                                x.id === activeTrack.id
                                  ? { ...x, trackHideReleasePrimary: false }
                                  : x
                              )
                            );
                            markDirty();
                          }}
                        >
                          Show release primary
                        </Button>
                      )}
                    </div>
                    {effectiveTrackPrimary.name ? (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge variant="secondary">{effectiveTrackPrimary.name}</Badge>
                        {effectiveTrackPrimary.inherited && (
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            From release
                          </span>
                        )}
                        {/**
                         * Close (×) on the Primary artist row:
                         *  - Inherited → set `trackHideReleasePrimary` so this track no longer
                         *    inherits the release primary (release itself is untouched).
                         *  - Track-specific → clear the track override so the release primary
                         *    flows back in.
                         */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          aria-label={
                            effectiveTrackPrimary.inherited
                              ? `Hide ${effectiveTrackPrimary.name} on this track`
                              : `Remove ${effectiveTrackPrimary.name}`
                          }
                          onClick={() => {
                            setTracks((ts) =>
                              ts.map((x) => {
                                if (x.id !== activeTrack.id) return x;
                                if (effectiveTrackPrimary.inherited) {
                                  return { ...x, trackHideReleasePrimary: true };
                                }
                                return {
                                  ...x,
                                  trackMainArtistName: "",
                                  trackMainArtistId: null,
                                };
                              })
                            );
                            markDirty();
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No artist linked yet.</p>
                    )}
                  </div>

                  {(() => {
                    /**
                     * Group the inherited + own contributor list by kind. Inherited rows carry
                     * `releaseContributorId` so × adds that id to `trackHiddenReleaseContributorIds`.
                     */
                    const featuringRows = activeTrackContributorView.filter((v) =>
                      isFeaturingWithRemixerContributor(v.row)
                    );
                    const performerRows = activeTrackContributorView.filter((v) => v.row.kind === "performer");
                    const creditRows = activeTrackContributorView.filter((v) => v.row.kind === "credit");
                    const renderRow = (v: TrackContributorView) => (
                      <div key={v.row.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">{v.row.name}</Badge>
                        <span className="text-xs text-muted-foreground">{contributorRowCaption(v.row)}</span>
                        {v.inherited ? (
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            From release
                          </span>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          aria-label={
                            v.inherited
                              ? `Hide ${v.row.name} on this track`
                              : `Remove ${v.row.name}`
                          }
                          onClick={() => {
                            /**
                             * Single × should remove the row from **both** possible sources so it
                             * truly disappears from the track UI (and therefore from the API
                             * payload):
                             *   1. If inherited, mark its release id as hidden for this track AND
                             *      drop any track-only row matching this name+API role.
                             *   2. If track-only, drop it from `trackContributors` AND hide any
                             *      release row matching this name+API role for this track.
                             */
                            const targetName = v.row.name.trim().toLowerCase();
                            const targetRole = contributorRowToApiRole(v.row).toLowerCase();
                            const matches = (c: ContributorRow): boolean =>
                              c.name.trim().toLowerCase() === targetName &&
                              contributorRowToApiRole(c).toLowerCase() === targetRole;

                            setTracks((ts) =>
                              ts.map((x) => {
                                if (x.id !== activeTrack.id) return x;
                                let nextHidden = x.trackHiddenReleaseContributorIds;
                                let nextOwn = x.trackContributors;

                                if (v.inherited && v.releaseContributorId) {
                                  const rid = v.releaseContributorId;
                                  if (!nextHidden.includes(rid)) {
                                    nextHidden = [...nextHidden, rid];
                                  }
                                } else {
                                  nextOwn = nextOwn.filter((y) => y.id !== v.row.id);
                                }

                                /** Drop matching track-only duplicates regardless of which path ran. */
                                nextOwn = nextOwn.filter((y) => !matches(y));

                                /** Hide any matching release contributor that isn't already hidden. */
                                const extraHides = contributors
                                  .filter((c) => matches(c) && !nextHidden.includes(c.id))
                                  .map((c) => c.id);
                                if (extraHides.length > 0) {
                                  nextHidden = [...nextHidden, ...extraHides];
                                }

                                if (
                                  nextHidden === x.trackHiddenReleaseContributorIds &&
                                  nextOwn === x.trackContributors
                                ) {
                                  return x;
                                }
                                return {
                                  ...x,
                                  trackHiddenReleaseContributorIds: nextHidden,
                                  trackContributors: nextOwn,
                                };
                              })
                            );
                            markDirty();
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );

                    return (
                      <div className="space-y-4">
                        <Label>Additional artists</Label>

                        <div className="space-y-2 rounded-lg border border-border/50 bg-muted/15 p-3">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Featuring, With, Remixer
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addContributor("featuring", activeTrack.id)}
                            >
                              + Add artist (Featuring)
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addContributor("with", activeTrack.id)}
                            >
                              + Add artist (With)
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addContributor("remixer", activeTrack.id)}
                            >
                              + Add artist (Remixer)
                            </Button>
                          </div>
                          {featuringRows.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                              {featuringRows.map(renderRow)}
                            </div>
                          ) : null}
                        </div>

                        <div className="space-y-2 rounded-lg border border-border/50 bg-muted/15 p-3">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Performers
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addContributor("performer", activeTrack.id)}
                          >
                            + Add performer
                          </Button>
                          {performerRows.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                              {performerRows.map(renderRow)}
                            </div>
                          ) : null}
                        </div>

                        <div className="space-y-2 rounded-lg border border-border/50 bg-muted/15 p-3">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            Credits
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addContributor("credit", activeTrack.id)}
                          >
                            + Add credit
                          </Button>
                          {creditRows.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
                              {creditRows.map(renderRow)}
                            </div>
                          ) : null}
                        </div>

                        {activeTrackContributorView.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No additional artists yet.</p>
                        ) : null}
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Primary genre *</Label>
                    <Select
                      value={activeTrack.primaryGenre || "__none__"}
                      onValueChange={(v) => {
                        const g = v === "__none__" ? "" : v;
                        setTracks((ts) => ts.map((x) => (x.id === activeTrack.id ? { ...x, primaryGenre: g } : x)));
                        markDirty();
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">—</SelectItem>
                        {GENRES.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Language *</Label>
                    <Input
                      value={activeTrack.language}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTracks((ts) => ts.map((x) => (x.id === activeTrack.id ? { ...x, language: v } : x)));
                        markDirty();
                      }}
                      placeholder="e.g. en"
                    />
                  </div>
                </div>
                <div>
                  <Label>Version</Label>
                  <Input
                    value={activeTrack.version}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTracks((ts) => ts.map((x) => (x.id === activeTrack.id ? { ...x, version: v } : x)));
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <Label>Secondary genre</Label>
                  <Select
                    value={activeTrack.secondaryGenre || "__none__"}
                    onValueChange={(v) => {
                      const g = v === "__none__" ? "" : v;
                      setTracks((ts) => ts.map((x) => (x.id === activeTrack.id ? { ...x, secondaryGenre: g } : x)));
                      markDirty();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {GENRES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lyrics</Label>
                  <Textarea
                    value={activeTrack.lyrics}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTracks((ts) => ts.map((x) => (x.id === activeTrack.id ? { ...x, lyrics: v } : x)));
                      markDirty();
                    }}
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Explicit</Label>
                  <Switch
                    checked={activeTrack.explicit}
                    onCheckedChange={(c) => {
                      setTracks((ts) =>
                        ts.map((x) => (x.id === activeTrack.id ? { ...x, explicit: Boolean(c) } : x))
                      );
                      markDirty();
                    }}
                  />
                </div>
                <div>
                  <Label>Preview start</Label>
                  <Input
                    value={activeTrack.previewStart}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTracks((ts) => ts.map((x) => (x.id === activeTrack.id ? { ...x, previewStart: v } : x)));
                      markDirty();
                    }}
                    placeholder="00:15"
                  />
                </div>
                <div>
                  <Label>Track origin</Label>
                  <Select
                    value={activeTrack.trackOrigin}
                    onValueChange={(v) => {
                      setTracks((ts) =>
                        ts.map((x) => (x.id === activeTrack.id ? { ...x, trackOrigin: v as TrackWorkspace["trackOrigin"] } : x))
                      );
                      markDirty();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original</SelectItem>
                      <SelectItem value="public_domain">Public domain</SelectItem>
                      <SelectItem value="cover">Cover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Track properties</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {TRACK_PROPERTY_OPTIONS.map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={activeTrack.properties.includes(opt.id)}
                          onCheckedChange={(c) => {
                            const on = c === true;
                            setTracks((ts) =>
                              ts.map((x) => {
                                if (x.id !== activeTrack.id) return x;
                                let props = [...x.properties];
                                if (opt.id === "none") {
                                  props = on ? ["none"] : [];
                                } else {
                                  props = props.filter((p) => p !== "none");
                                  if (on) props.push(opt.id);
                                  else props = props.filter((p) => p !== opt.id);
                                }
                                return { ...x, properties: props };
                              })
                            );
                            markDirty();
                          }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
                {activeTrack.properties.includes("samples_stock") && (
                  <div className="rounded-md border p-3 space-y-2 bg-muted/30">
                    <Label>Sample license upload *</Label>
                    <Input
                      type="file"
                      accept="application/pdf,.pdf"
                      multiple
                      onChange={(e) => addSampleLicenses(activeTrack.id, e.target.files)}
                    />
                    {activeTrack.sampleLicenseFiles.map((f) => (
                      <div key={f.id} className="flex justify-between text-xs">
                        <span className="truncate">{f.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1"
                          onClick={() =>
                            setTracks((ts) =>
                              ts.map((x) =>
                                x.id === activeTrack.id
                                  ? { ...x, sampleLicenseFiles: x.sampleLicenseFiles.filter((y) => y.id !== f.id) }
                                  : x
                              )
                            )
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {validationAttempt && fieldErrors[`track-${activeTrack.id}-license`] && (
                      <p className="text-xs text-destructive">{fieldErrors[`track-${activeTrack.id}-license`]}</p>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Copyright year *</Label>
                    <Input
                      value={activeTrack.copyrightYear}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTracks((ts) => ts.map((x) => (x.id === activeTrack.id ? { ...x, copyrightYear: v } : x)));
                        markDirty();
                      }}
                    />
                  </div>
                  <div>
                    <Label>Copyright owner *</Label>
                    <Input
                      value={activeTrack.copyrightOwner}
                      onChange={(e) => {
                        const v = e.target.value;
                        setTracks((ts) => ts.map((x) => (x.id === activeTrack.id ? { ...x, copyrightOwner: v } : x)));
                        markDirty();
                      }}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="shrink-0 border-t border-border/60 bg-card/50 px-6 py-4">
                <Button type="button" onClick={() => setTrackDialogId(null)}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

import type { ReleaseListItem, ReleaseTrackItem } from "@/services/releaseService";
import { normalizeReleaseMetadata } from "@/services/releaseService";

export type IssueSeverity = "error" | "warning";

/** Deep-link target consumed by Create Release (Section 3). */
export type Section4Focus =
  | { kind: "release"; field: "primaryArtist" | "artwork" | "releaseDate" | "genre" | "title" }
  | { kind: "publishing" }
  | { kind: "track"; trackServerId: string; field?: string };

export interface ReadinessIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  scope: "release" | "track";
  trackServerId?: string;
  focus: Section4Focus;
}

export interface ParsedPublishingRow {
  name: string;
  ownershipPct: number;
}

export function parsePublishingFromMetadata(meta: Record<string, string>): ParsedPublishingRow[] {
  const raw = meta.workspace_publishing?.trim();
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const o = row as Record<string, unknown>;
        const name = String(o.name ?? "").trim();
        const pct = Number(o.ownershipPct ?? o.ownership_pct ?? 0);
        return { name, ownershipPct: Number.isFinite(pct) ? pct : 0 };
      })
      .filter((r): r is ParsedPublishingRow => r != null && r.name.length > 0);
  } catch {
    return [];
  }
}

function parseWorkspaceTrackRows(meta: Record<string, string>): Record<string, unknown>[] {
  const raw = meta.workspace_tracks?.trim();
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is Record<string, unknown> => Boolean(x) && typeof x === "object");
  } catch {
    return [];
  }
}

/** Prefer a row matched by `serverTrackId` (saved from Create Release) over index order. */
function workspaceRowForTrack(
  workspaceRows: Record<string, unknown>[],
  serverId: string,
  index: number
): Record<string, unknown> {
  const sid = serverId.trim();
  const byServer = workspaceRows.find((row) => String(row.serverTrackId ?? "").trim() === sid);
  if (byServer) return byServer;
  return workspaceRows[index] ?? {};
}

function sortedTracks(tracks: ReleaseTrackItem[]): ReleaseTrackItem[] {
  return [...tracks].sort((a, b) => (a.track_number ?? 9999) - (b.track_number ?? 9999));
}

function trackTitle(t: ReleaseTrackItem): string {
  return (t.title || "").trim() || "Untitled track";
}

/**
 * Readiness checks for Section 4 — mirrors Section 3 priorities where API + workspace metadata allow.
 */
export function buildReadinessIssues(
  release: ReleaseListItem,
  tracks: ReleaseTrackItem[]
): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];
  const meta = normalizeReleaseMetadata(release.metadata);
  const workspaceRows = parseWorkspaceTrackRows(meta);

  if (!(release.primary_artist_name || "").trim()) {
    issues.push({
      id: "rel-primary-artist",
      severity: "error",
      title: "Missing primary artist",
      description: "Add the main credited artist on the release.",
      scope: "release",
      focus: { kind: "release", field: "primaryArtist" },
    });
  }

  if (!release.artwork?.file_path?.trim()) {
    issues.push({
      id: "rel-artwork",
      severity: "error",
      title: "Missing artwork",
      description: "Upload 3000×3000 cover art in Create Release.",
      scope: "release",
      focus: { kind: "release", field: "artwork" },
    });
  }

  const prev = meta.previously_released === "true";
  const effectiveDate =
    (release.scheduled_release_date || "").trim() || (release.release_date || "").trim();
  if (!prev && !effectiveDate) {
    issues.push({
      id: "rel-release-date",
      severity: "error",
      title: "Missing release date",
      description: "Choose a release date or ASAP timing in Create Release.",
      scope: "release",
      focus: { kind: "release", field: "releaseDate" },
    });
  }

  if (!(meta.primary_genre || "").trim()) {
    issues.push({
      id: "rel-genre",
      severity: "error",
      title: "Missing primary genre",
      description: "Set the primary genre for the release.",
      scope: "release",
      focus: { kind: "release", field: "genre" },
    });
  }

  if (!(release.title || "").trim()) {
    issues.push({
      id: "rel-title",
      severity: "error",
      title: "Missing release title",
      description: "Enter a release title.",
      scope: "release",
      focus: { kind: "release", field: "title" },
    });
  }

  const publishing = parsePublishingFromMetadata(meta);
  if (publishing.length > 0) {
    const sum = publishing.reduce((s, p) => s + p.ownershipPct, 0);
    if (Math.round(sum) !== 100) {
      issues.push({
        id: "rel-publishing-total",
        severity: "error",
        title: "Publishing shares must total 100%",
        description: `Current writer/publisher total is ${Math.round(sum)}%.`,
        scope: "release",
        focus: { kind: "publishing" },
      });
    }
  }

  if (!(meta.secondary_genre || "").trim()) {
    issues.push({
      id: "rel-secondary-genre",
      severity: "warning",
      title: "No secondary genre",
      description: "Optional but recommended for discovery.",
      scope: "release",
      focus: { kind: "release", field: "genre" },
    });
  }

  const ordered = sortedTracks(tracks);
  for (let i = 0; i < ordered.length; i++) {
    const t = ordered[i];
    const sid = t.id?.trim();
    if (!sid) continue;
    const ws = workspaceRowForTrack(workspaceRows, sid, i);
    const title = trackTitle(t);

    if (!(t.title || "").trim()) {
      issues.push({
        id: `tr-${sid}-title`,
        severity: "error",
        title: `Track "${title}" — missing title`,
        description: "Open track metadata and set the title.",
        scope: "track",
        trackServerId: sid,
        focus: { kind: "track", trackServerId: sid, field: "title" },
      });
    }
    const audioPath =
      (t.audio?.file_path ?? "").trim() ||
      (() => {
        const row = t as unknown as Record<string, unknown>;
        const flat = row.audio_file_path ?? row.audio_path;
        return typeof flat === "string" ? flat.trim() : "";
      })();
    if (!audioPath) {
      issues.push({
        id: `tr-${sid}-audio`,
        severity: "error",
        title: `Track "${title}" — missing audio`,
        description: "Upload stereo WAV or Atmos for this track.",
        scope: "track",
        trackServerId: sid,
        focus: { kind: "track", trackServerId: sid, field: "audio" },
      });
    }

    const language =
      String(ws.language ?? "").trim() ||
      (typeof t.language === "string" ? t.language.trim() : "");
    if (!language) {
      issues.push({
        id: `tr-${sid}-lang`,
        severity: "error",
        title: `Track "${title}" — missing language`,
        description: "Set the vocal/language metadata.",
        scope: "track",
        trackServerId: sid,
        focus: { kind: "track", trackServerId: sid, field: "language" },
      });
    }

    const cy =
      String(ws.copyrightYear ?? ws.copyright_year ?? "").trim() ||
      (t.copyright_year != null && Number.isFinite(Number(t.copyright_year)) ? String(t.copyright_year) : "");
    if (!cy) {
      issues.push({
        id: `tr-${sid}-cy`,
        severity: "error",
        title: `Track "${title}" — missing copyright year`,
        description: "Add copyright year in track metadata.",
        scope: "track",
        trackServerId: sid,
        focus: { kind: "track", trackServerId: sid, field: "copyright" },
      });
    }

    const co =
      String(ws.copyrightOwner ?? ws.copyright_owner ?? "").trim() ||
      (typeof t.copyright_owner === "string" ? t.copyright_owner.trim() : "");
    if (!co) {
      issues.push({
        id: `tr-${sid}-co`,
        severity: "error",
        title: `Track "${title}" — missing copyright owner`,
        description: "Add the copyright owner line.",
        scope: "track",
        trackServerId: sid,
        focus: { kind: "track", trackServerId: sid, field: "copyright" },
      });
    }

    const lyrics =
      String(ws.lyrics ?? "").trim() || (typeof t.lyrics === "string" ? t.lyrics.trim() : "");
    const props = Array.isArray(ws.properties) ? (ws.properties as string[]) : [];
    const needsLyrics = !props.includes("non_musical");
    if (needsLyrics && !lyrics) {
      issues.push({
        id: `tr-${sid}-lyrics`,
        severity: "warning",
        title: `Track "${title}" — lyrics missing`,
        description: "Optional for instrumental; add lyrics if applicable.",
        scope: "track",
        trackServerId: sid,
        focus: { kind: "track", trackServerId: sid, field: "lyrics" },
      });
    }
  }

  return issues;
}

export function hasBlockingErrors(issues: ReadinessIssue[]): boolean {
  return issues.some((i) => i.severity === "error");
}

export function contributorSummaryForTrack(
  track: ReleaseTrackItem,
  releaseMeta: Record<string, string>
): string {
  const rows = parseWorkspaceTrackRows(releaseMeta);
  const idx = Math.max(0, (track.track_number ?? 1) - 1);
  const ws = rows[idx];
  const row = track as unknown as Record<string, unknown>;
  const apiIsrc = typeof row.isrc === "string" ? row.isrc.trim() : "";
  if (!ws) return apiIsrc || "—";
  const parts: string[] = [];
  const isrc = String(ws.isrc ?? "").trim() || apiIsrc;
  if (isrc) parts.push(isrc);
  const ver = String(ws.version ?? "").trim();
  if (ver) parts.push(ver);
  const feat = String(ws.featuring ?? "").trim();
  if (feat) parts.push(`Feat. ${feat}`);
  return parts.length ? parts.join(" · ") : "—";
}

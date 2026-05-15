import { API_BASE_URL } from "@/config/env";
import {
  multipartReleaseDateToApiFormat,
  normalizeOriginalReleaseDateForApi,
} from "@/lib/releaseFormat";
import { getValidAccessToken, recoverAccessTokenAfterUnauthorized } from "@/services/apiAuth";

/** One contributor row for POST/PUT `/api/releases` (matches API `contributors` array). */
export interface ReleaseContributorApi {
  name: string;
  role: string;
  user_id?: number;
}

/**
 * One writer/publisher row for POST/PUT `/api/releases` `writers` array (matches Postman JSON create).
 */
export interface ReleaseWriterApi {
  name: string;
  role: string;
  ownership_percentage: number;
  iswc: string;
  publishing_type: "copyright_control" | "published";
  user_id?: number;
}

/** Server identifier for a contributor pivot row (`release_contributors.id`). */
export type ContributorPivotId = string;

/** Fields for POST/PUT /api/releases as multipart/form-data (matches API). */
export interface CreateReleaseMultipartPayload {
  title: string;
  version_title: string;
  primary_artist_name: string;
  release_type: string;
  upc: string;
  label_name: string;
  release_date: string;
  original_release_date: string;
  metadata: Record<string, string>;
  /** Sent as form field `artwork` when present. */
  artworkFile?: File | null;
  /** Top-level JSON array on create (user_id optional when not from org roster). */
  contributors?: ReleaseContributorApi[];
  /** Writer / publisher splits (Publishing section). Sent as JSON array on create/update. */
  writers?: ReleaseWriterApi[];
  /**
   * Pivot ids (`release_contributors.id`) the user removed during this edit session — sent so the
   * Laravel side can detach those rows in the same PUT call that adds/updates `contributors`.
   */
  deleted_contributor_ids?: ContributorPivotId[];
  auto_generate_upc?: boolean;
  previously_released?: boolean;
  release_timing?: "asap" | "date";
  /** YYYY-MM-DD when `release_timing` is `date` (maps to API `scheduled_release_date`). */
  scheduled_release_date?: string;
  /** Release-level genres (also mirrored in `metadata` for workspace); lowercased when sent to API. */
  primary_genre?: string;
  secondary_genre?: string | null;
}

/** JSON body for PUT /api/releases/:id (metadata only; artwork uses POST …/artwork). */
export type UpdateReleaseJsonPayload = Omit<CreateReleaseMultipartPayload, "artworkFile">;

export function buildUpdateReleaseJsonBody(payload: UpdateReleaseJsonPayload): Record<string, unknown> {
  const releaseDate = normalizeOriginalReleaseDateForApi(payload.release_date);
  const originalReleaseDate = normalizeOriginalReleaseDateForApi(payload.original_release_date);
  const sched = (payload.scheduled_release_date ?? "").trim();
  const body: Record<string, unknown> = {
    title: payload.title,
    version_title: payload.version_title,
    primary_artist_name: payload.primary_artist_name,
    release_type: payload.release_type,
    label_name: payload.label_name,
    metadata: payload.metadata,
  };
  /** Omit empty date strings on PUT so Laravel keeps existing values (matches minimal Postman updates). */
  if (releaseDate) {
    body.release_date = releaseDate;
  }
  if (originalReleaseDate) {
    body.original_release_date = originalReleaseDate;
  }
  /** Match Postman: explicit boolean + manual `upc` when not auto-generating. */
  if (payload.auto_generate_upc === true) {
    body.auto_generate_upc = true;
  } else {
    body.auto_generate_upc = false;
    body.upc = payload.upc ?? "";
  }
  body.previously_released = payload.previously_released === true;
  if (payload.release_timing) {
    body.release_timing = payload.release_timing;
  }
  if (sched) {
    body.scheduled_release_date = normalizeOriginalReleaseDateForApi(sched) || sched;
  }
  if (payload.contributors && payload.contributors.length > 0) {
    body.contributors = payload.contributors.map((c) => {
      const row: Record<string, unknown> = { name: c.name, role: c.role };
      if (c.user_id != null && Number.isFinite(c.user_id)) {
        row.user_id = c.user_id;
      }
      return row;
    });
  }
  /**
   * Match Postman: include only when the user actually removed previously-saved contributors.
   * Filters to non-empty strings so an accidental empty entry doesn't trigger a 422.
   */
  if (payload.deleted_contributor_ids && payload.deleted_contributor_ids.length > 0) {
    const cleaned = payload.deleted_contributor_ids
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter((s) => s.length > 0);
    if (cleaned.length > 0) {
      body.deleted_contributor_ids = cleaned;
    }
  }
  if (payload.writers && payload.writers.length > 0) {
    body.writers = payload.writers.map((w) => {
      const row: Record<string, unknown> = {
        name: w.name,
        role: w.role,
        ownership_percentage: w.ownership_percentage,
        iswc: w.iswc ?? "",
        publishing_type: w.publishing_type,
      };
      if (w.user_id != null && Number.isFinite(w.user_id)) {
        row.user_id = w.user_id;
      }
      return row;
    });
  }
  const putPg = normalizeGenreFieldForApi(payload.primary_genre);
  if (putPg) {
    body.primary_genre = putPg;
  }
  const putSg = normalizeGenreFieldForApi(payload.secondary_genre ?? undefined);
  if (putSg) {
    body.secondary_genre = putSg;
  }
  return body;
}

function normalizeGenreFieldForApi(raw: string | null | undefined): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  return s.toLowerCase();
}

export function buildReleaseFormData(payload: CreateReleaseMultipartPayload): FormData {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("version_title", payload.version_title);
  fd.append("primary_artist_name", payload.primary_artist_name);
  fd.append("release_type", payload.release_type);
  if (payload.auto_generate_upc === true) {
    fd.append("auto_generate_upc", "true");
  } else {
    fd.append("upc", payload.upc ?? "");
    if (payload.auto_generate_upc === false) {
      fd.append("auto_generate_upc", "false");
    }
  }
  fd.append("label_name", payload.label_name);
  fd.append("release_date", multipartReleaseDateToApiFormat(payload.release_date));
  fd.append("original_release_date", multipartReleaseDateToApiFormat(payload.original_release_date));
  fd.append("metadata", JSON.stringify(payload.metadata));
  if (payload.previously_released != null) {
    fd.append("previously_released", payload.previously_released ? "true" : "false");
  }
  if (payload.release_timing) {
    fd.append("release_timing", payload.release_timing);
  }
  const sched = (payload.scheduled_release_date ?? "").trim();
  if (sched) {
    fd.append(
      "scheduled_release_date",
      normalizeOriginalReleaseDateForApi(sched) || sched
    );
  }
  if (payload.contributors && payload.contributors.length > 0) {
    fd.append(
      "contributors",
      JSON.stringify(
        payload.contributors.map((c) => {
          const row: Record<string, unknown> = { name: c.name, role: c.role };
          if (c.user_id != null && Number.isFinite(c.user_id)) {
            row.user_id = c.user_id;
          }
          return row;
        })
      )
    );
  }
  if (payload.deleted_contributor_ids && payload.deleted_contributor_ids.length > 0) {
    const cleaned = payload.deleted_contributor_ids
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter((s) => s.length > 0);
    if (cleaned.length > 0) {
      fd.append("deleted_contributor_ids", JSON.stringify(cleaned));
    }
  }
  if (payload.writers && payload.writers.length > 0) {
    fd.append(
      "writers",
      JSON.stringify(
        payload.writers.map((w) => {
          const row: Record<string, unknown> = {
            name: w.name,
            role: w.role,
            ownership_percentage: w.ownership_percentage,
            iswc: w.iswc ?? "",
            publishing_type: w.publishing_type,
          };
          if (w.user_id != null && Number.isFinite(w.user_id)) {
            row.user_id = w.user_id;
          }
          return row;
        })
      )
    );
  }
  const fdPg = normalizeGenreFieldForApi(payload.primary_genre);
  if (fdPg) {
    fd.append("primary_genre", fdPg);
  }
  const fdSg = normalizeGenreFieldForApi(payload.secondary_genre ?? undefined);
  if (fdSg) {
    fd.append("secondary_genre", fdSg);
  }
  if (payload.artworkFile) {
    fd.append("artwork", payload.artworkFile);
  }
  return fd;
}

export interface CreateReleaseResponse {
  id?: string;
  title?: string;
  version_title?: string;
  primary_artist_name?: string;
  release_type?: string;
  upc?: string;
  label_name?: string;
  release_date?: string;
  original_release_date?: string;
  metadata?: Record<string, string>;
  organization_id?: string;
  created_by?: number;
  status?: string;
  message?: string;
}

/** Nested artwork from GET /api/releases when expanded. */
export interface ReleaseArtworkAsset {
  id?: string;
  file_path?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number;
  asset_type?: string | null;
  release_id?: string | null;
  track_id?: string | null;
  organization_id?: string | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Nested creator object from releases API payloads. */
export interface ReleaseCreatorInfo {
  id?: number | string | null;
  name?: string | null;
}

/** Shape returned by GET /api/releases (array items). */
export interface ReleaseListItem {
  id: string;
  title?: string | null;
  version_title?: string | null;
  primary_artist_name?: string | null;
  release_type?: string | null;
  upc?: string | null;
  label_name?: string | null;
  artwork_asset_id?: string | null;
  /** When present, use `file_path` with API base URL for cover image. */
  artwork?: ReleaseArtworkAsset | null;
  status?: string | null;
  organization_id?: string | null;
  created_by?: number | null;
  creator?: ReleaseCreatorInfo | null;
  release_date?: string | null;
  original_release_date?: string | null;
  /** Top-level fields on GET /api/releases/:id (may be absent on list rows). */
  primary_genre?: string | null;
  secondary_genre?: string | null;
  scheduled_release_date?: string | null;
  release_timing?: string | null;
  auto_generate_upc?: boolean | null;
  previously_released?: boolean | null;
  /** Nested tracks on single-release GET (same payload as separate tracks list when expanded). */
  tracks?: unknown;
  metadata?: unknown;
  /** Present on GET /api/releases/:id — primary + additional credits. */
  contributors?: unknown;
  created_at?: string | null;
  updated_at?: string | null;
}

async function doListReleases(accessToken: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/api/releases`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/** Laravel: `{ data: [...] }`, paginator `{ data: { data: [...] } }`, or raw array. */
function extractReleaseListRows(json: unknown): unknown[] {
  if (Array.isArray(json)) {
    return json;
  }
  if (!json || typeof json !== "object") {
    return [];
  }
  const o = json as Record<string, unknown>;
  const top = o.data ?? o.releases ?? o.items;
  if (Array.isArray(top)) {
    return top;
  }
  if (top && typeof top === "object" && !Array.isArray(top)) {
    const nested = (top as Record<string, unknown>).data;
    if (Array.isArray(nested)) {
      return nested;
    }
  }
  return [];
}

function normalizeReleaseListRow(raw: unknown): ReleaseListItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const idVal = row.id ?? row.uuid ?? row.release_id;
  if (idVal == null) {
    return null;
  }
  const id = String(idVal).trim();
  if (!id) {
    return null;
  }
  return { ...row, id } as ReleaseListItem;
}

function parseReleaseList(json: unknown): ReleaseListItem[] {
  return extractReleaseListRows(json)
    .map(normalizeReleaseListRow)
    .filter((r): r is ReleaseListItem => r != null);
}

function mergeAttributesIfJsonApi(row: Record<string, unknown>): Record<string, unknown> {
  const attrs = row.attributes;
  if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
    const a = attrs as Record<string, unknown>;
    return { ...a, ...row, id: row.id ?? a.id };
  }
  return row;
}

function coerceReleaseDetailPayload(payload: unknown): ReleaseListItem {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid release response");
  }
  let row = mergeAttributesIfJsonApi(payload as Record<string, unknown>);
  const idVal = row.id ?? row.uuid ?? row.release_id;
  const id = idVal != null ? String(idVal).trim() : "";
  if (!id) {
    throw new Error("Release response missing id");
  }
  return { ...row, id } as ReleaseListItem;
}

/** Unwrap `{ data: {...} }`, `{ data: { data: {...} } }`, `{ data: { release: {...} } }`. */
function unwrapReleaseDetailJson(json: unknown): unknown {
  if (json == null || typeof json !== "object") {
    return json;
  }
  const root = json as Record<string, unknown>;
  let node: unknown = Object.prototype.hasOwnProperty.call(root, "data") ? root.data : json;

  if (node && typeof node === "object" && !Array.isArray(node)) {
    const n = node as Record<string, unknown>;
    if (n.release && typeof n.release === "object" && !Array.isArray(n.release)) {
      return n.release;
    }
    if (n.data && typeof n.data === "object" && !Array.isArray(n.data)) {
      const inner = n.data as Record<string, unknown>;
      if (inner.id != null || inner.uuid != null || inner.release_id != null) {
        return n.data;
      }
    }
  }
  return node;
}

/**
 * GET /api/releases with Bearer token; refreshes on 401 once like createRelease.
 */
export async function listReleases(): Promise<ReleaseListItem[]> {
  let token = await getValidAccessToken();
  let response = await doListReleases(token);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doListReleases(token);
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const body = (json || {}) as { message?: string; error?: string };
    const message =
      body.message || body.error || `Failed to load releases (${response.status})`;
    throw new Error(message);
  }

  return parseReleaseList(json);
}

async function doGetRelease(accessToken: string, id: string): Promise<Response> {
  const rid = id.trim();
  return fetch(`${API_BASE_URL}/api/releases/${encodeURIComponent(rid)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Normalize API `metadata` for UI: object map, JSON string, or Laravel-style
 * `[{ key, value }]` array (same shape as create payload).
 */
export function normalizeReleaseMetadata(raw: unknown): Record<string, string> {
  if (raw == null) return {};

  let node: unknown = raw;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return {};
    try {
      node = JSON.parse(s) as unknown;
    } catch {
      return {};
    }
  }

  if (Array.isArray(node)) {
    const out: Record<string, string> = {};
    for (const item of node) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const key = String(o.key ?? o.Key ?? o.name ?? "").trim();
      if (!key) continue;
      const val = o.value ?? o.Value ?? o.val ?? o.content;
      if (val == null) continue;
      out[key] = typeof val === "object" ? JSON.stringify(val) : String(val);
    }
    return out;
  }

  if (typeof node !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
    if (val == null) continue;
    out[key] = typeof val === "object" ? JSON.stringify(val) : String(val);
  }
  return out;
}

/**
 * GET /api/releases/:id with Bearer token; refreshes on 401 once.
 */
export async function getRelease(id: string): Promise<ReleaseListItem> {
  let token = await getValidAccessToken();
  let response = await doGetRelease(token, id);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doGetRelease(token, id);
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const body = (json || {}) as { message?: string; error?: string };
    const message =
      body.message || body.error || `Failed to load release (${response.status})`;
    throw new Error(message);
  }

  const payload = unwrapReleaseDetailJson(json);
  return coerceReleaseDetailPayload(payload);
}

/** Nested asset on GET /api/releases/:id/tracks items. */
export interface TrackAssetInfo {
  id?: string;
  asset_type?: string | null;
  file_name?: string | null;
  file_path?: string | null;
  mime_type?: string | null;
  file_size?: number;
  track_id?: string | null;
  release_id?: string | null;
  organization_id?: string | null;
  created_by?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ReleaseTrackItem {
  id: string;
  title?: string | null;
  release_id?: string | null;
  organization_id?: string | null;
  track_number?: number | null;
  created_by?: number | null;
  creator?: ReleaseCreatorInfo | null;
  created_at?: string | null;
  updated_at?: string | null;
  audio?: TrackAssetInfo | null;
  artwork?: TrackAssetInfo | null;
  /** Flat fields from GET /api/releases/:id `tracks[]` when audio asset is not nested. */
  primary_genre?: string | null;
  secondary_genre?: string | null;
  version?: string | null;
  language?: string | null;
  lyrics?: string | null;
  is_explicit?: boolean | null;
  preview_start?: number | null;
  track_origin?: string | null;
  track_properties?: unknown;
  copyright_year?: number | null;
  copyright_owner?: string | null;
  /** ISRC string (e.g. "USRC17607839"); present on `GET /api/tracks` rows. */
  isrc?: string | null;
  /** Optional artist label on tracks list (some endpoints expose it). */
  primary_artist_name?: string | null;
  artist_name?: string | null;
  sample_license_file?: unknown;
  /** Original join/pivot row id (when the API returns `release_tracks` rows whose top-level `id` is the pivot id). */
  pivot_id?: string | null;
}

/** Laravel: raw array, `{ data: [...] }`, or paginator `{ data: { data: [...] } }`. */
function extractReleaseTracksRows(json: unknown): unknown[] {
  if (Array.isArray(json)) {
    return json;
  }
  if (!json || typeof json !== "object") {
    return [];
  }
  const o = json as Record<string, unknown>;
  const top = o.data ?? o.tracks;
  if (Array.isArray(top)) {
    return top;
  }
  if (top && typeof top === "object" && !Array.isArray(top)) {
    const nested = (top as Record<string, unknown>).data;
    if (Array.isArray(nested)) {
      return nested;
    }
  }
  return [];
}

function normalizeReleaseTrackRow(raw: unknown): ReleaseTrackItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  let row = mergeAttributesIfJsonApi(raw as Record<string, unknown>);

  /**
   * Some endpoints return pivot rows: `{ id: "<pivot>", track_id: "<real>", track: {...} }`.
   * Merge the nested `track` object up so titles/audio come from the real track, then prefer the
   * actual `tracks.id` (from `track.id` or `track_id`) over the pivot id so `/api/tracks/:id` hits.
   */
  const nestedTrack = row.track;
  let pivotId: string | null = null;
  if (nestedTrack && typeof nestedTrack === "object" && !Array.isArray(nestedTrack)) {
    const inner = mergeAttributesIfJsonApi(nestedTrack as Record<string, unknown>);
    pivotId = typeof row.id === "string" || typeof row.id === "number" ? String(row.id) : null;
    row = { ...row, ...inner };
  } else {
    const tid = row.track_id;
    const own = row.id;
    if (
      typeof tid === "string" &&
      tid.trim() &&
      typeof own === "string" &&
      own.trim() &&
      tid.trim() !== own.trim()
    ) {
      pivotId = own.trim();
      row = { ...row, id: tid.trim() };
    }
  }

  const idVal = row.id ?? row.uuid ?? row.track_id;
  if (idVal == null) {
    return null;
  }
  const id = String(idVal).trim();
  if (!id) {
    return null;
  }
  const out = { ...row, id } as ReleaseTrackItem;
  if (pivotId) {
    out.pivot_id = pivotId;
  }
  return out;
}

function parseReleaseTracksList(json: unknown): ReleaseTrackItem[] {
  return extractReleaseTracksRows(json)
    .map(normalizeReleaseTrackRow)
    .filter((r): r is ReleaseTrackItem => r != null)
    .sort((a, b) => (a.track_number ?? 9999) - (b.track_number ?? 9999));
}

/**
 * Reads `tracks` from a single-release GET payload (`GET /api/releases/:id`) when the API nests them.
 */
export function parseEmbeddedReleaseTracks(detail: ReleaseListItem | Record<string, unknown>): ReleaseTrackItem[] {
  const raw = (detail as Record<string, unknown>).tracks;
  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }
  return raw
    .map(normalizeReleaseTrackRow)
    .filter((r): r is ReleaseTrackItem => r != null)
    .sort((a, b) => (a.track_number ?? 9999) - (b.track_number ?? 9999));
}

async function doListReleaseTracks(accessToken: string, releaseId: string): Promise<Response> {
  const rid = releaseId.trim();
  return fetch(`${API_BASE_URL}/api/releases/${encodeURIComponent(rid)}/tracks`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/** Unwraps `{...}`, `{ data: {...} }`, `{ data: { track: {...} } }`, `{ track: {...} }`. */
function unwrapTrackDetailJson(json: unknown): unknown {
  if (json == null || typeof json !== "object") {
    return json;
  }
  const root = json as Record<string, unknown>;
  let node: unknown = root;
  if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
    node = root.data;
  } else if (root.track && typeof root.track === "object" && !Array.isArray(root.track)) {
    node = root.track;
  }
  if (node && typeof node === "object" && !Array.isArray(node)) {
    const inner = node as Record<string, unknown>;
    if (inner.track && typeof inner.track === "object" && !Array.isArray(inner.track)) {
      return inner.track;
    }
  }
  return node;
}

async function doGetTrack(accessToken: string, trackId: string): Promise<Response> {
  const tid = trackId.trim();
  return fetch(`${API_BASE_URL}/api/tracks/${encodeURIComponent(tid)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/** Thrown by {@link getTrack} when the API returns 404 — lets callers decide if they want to silence it. */
export class TrackNotFoundError extends Error {
  readonly trackId: string;
  constructor(trackId: string, message?: string) {
    super(message ?? `Track ${trackId} not found`);
    this.name = "TrackNotFoundError";
    this.trackId = trackId;
  }
}

/** RFC4122 / UUID v7 shape: 8-4-4-4-12 hex digits, case-insensitive. Guards against UI ids like `cat-…`. */
const TRACK_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isLikelyServerTrackId(id: string | null | undefined): boolean {
  return typeof id === "string" && TRACK_ID_RE.test(id.trim());
}

/**
 * GET /api/tracks/:id — single track (metadata + nested `audio` / `artwork` assets).
 *
 * Throws {@link TrackNotFoundError} on HTTP 404 so the dialog/edit flows can keep the row in
 * the UI (using whatever data is already cached from the release tracks list) without
 * surfacing a noisy error.
 */
export async function getTrack(id: string): Promise<ReleaseTrackItem> {
  const tid = id.trim();
  if (!tid) {
    throw new Error("Track id is required");
  }
  if (!isLikelyServerTrackId(tid)) {
    throw new TrackNotFoundError(tid, `Invalid track id: ${tid}`);
  }
  let token = await getValidAccessToken();
  let response = await doGetTrack(token, tid);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doGetTrack(token, tid);
  }

  const json = await response.json().catch(() => null);

  if (response.status === 404) {
    const err = (json || {}) as { message?: string; error?: string };
    throw new TrackNotFoundError(tid, err.message || err.error);
  }
  if (!response.ok) {
    const err = (json || {}) as { message?: string; error?: string };
    const message = err.message || err.error || `Failed to load track (${response.status})`;
    throw new Error(message);
  }

  const payload = unwrapTrackDetailJson(json);
  const row = normalizeReleaseTrackRow(payload);
  if (!row) {
    throw new Error("Invalid track response");
  }
  return row;
}

async function doListAllTracks(accessToken: string): Promise<Response> {
  return fetch(`${API_BASE_URL}/api/tracks`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * GET /api/tracks — every track scoped to the caller's organization (Bearer token; refreshes on 401 once).
 * Use for the "Use existing track" catalog picker on the create-release flow.
 */
export async function listAllTracks(): Promise<ReleaseTrackItem[]> {
  let token = await getValidAccessToken();
  let response = await doListAllTracks(token);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doListAllTracks(token);
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const body = (json || {}) as { message?: string; error?: string };
    const message =
      body.message || body.error || `Failed to load tracks (${response.status})`;
    throw new Error(message);
  }

  return parseReleaseTracksList(json);
}

/**
 * GET /api/releases/:releaseId/tracks — Bearer token; refreshes on 401 once.
 */
export async function listReleaseTracks(releaseId: string): Promise<ReleaseTrackItem[]> {
  const rid = releaseId.trim();
  if (!rid) {
    throw new Error("Release id is required to load tracks");
  }
  let token = await getValidAccessToken();
  let response = await doListReleaseTracks(token, rid);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doListReleaseTracks(token, rid);
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const body = (json || {}) as { message?: string; error?: string };
    const message =
      body.message || body.error || `Failed to load tracks (${response.status})`;
    throw new Error(message);
  }

  return parseReleaseTracksList(json);
}

/**
 * All tracks for a release: prefers `GET /api/releases/:releaseId/tracks` (full rows with nested
 * `audio` / `artwork`, same shape as Postman). Falls back to tracks embedded on the release payload
 * only when the list request fails (`onListError` optional for a toast in the UI).
 */
export async function fetchReleaseTrackList(
  releaseId: string,
  releaseDetail: ReleaseListItem | null,
  onListError?: (message: string) => void
): Promise<ReleaseTrackItem[]> {
  const rid = releaseId.trim();
  if (!rid) return [];
  try {
    return await listReleaseTracks(rid);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load tracks";
    onListError?.(msg);
    return releaseDetail ? parseEmbeddedReleaseTracks(releaseDetail) : [];
  }
}

async function doCreateRelease(accessToken: string, formData: FormData): Promise<Response> {
  return fetch(`${API_BASE_URL}/api/releases`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
}

async function doCreateReleaseJson(
  accessToken: string,
  body: Record<string, unknown>
): Promise<Response> {
  return fetch(`${API_BASE_URL}/api/releases`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
}

/** POST /api/releases with JSON body (cover already uploaded via signed URL). */
export interface CreateReleaseJsonPayload {
  title: string;
  version_title: string;
  primary_artist_name: string;
  release_type: string;
  upc: string;
  label_name: string;
  release_date: string;
  original_release_date: string;
  metadata: Record<string, string>;
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  contributors?: ReleaseContributorApi[];
  auto_generate_upc?: boolean;
  previously_released?: boolean;
  release_timing?: "asap" | "date";
  scheduled_release_date?: string;
  primary_genre?: string;
  secondary_genre?: string | null;
  writers?: ReleaseWriterApi[];
}

/**
 * JSON create-release expects `metadata` as an array (Laravel validation), not a keyed object.
 * We map each non-empty key from the form into `{ key, value }` entries.
 */
export function metadataMapToCreateReleaseArray(meta: Record<string, string>): unknown[] {
  const out: unknown[] = [];
  for (const [rawKey, rawVal] of Object.entries(meta)) {
    const key = rawKey.trim();
    if (!key) continue;
    out.push({ key, value: rawVal });
  }
  return out;
}

export function buildCreateReleaseJsonBody(payload: CreateReleaseJsonPayload): Record<string, unknown> {
  const releaseDate = normalizeOriginalReleaseDateForApi(payload.release_date);
  const originalReleaseDate = normalizeOriginalReleaseDateForApi(payload.original_release_date);
  const schedRaw = (payload.scheduled_release_date ?? "").trim();
  const scheduledReleaseDate =
    schedRaw || (releaseDate && !payload.previously_released ? releaseDate : "");
  const body: Record<string, unknown> = {
    title: payload.title,
    version_title: payload.version_title,
    primary_artist_name: payload.primary_artist_name,
    release_type: payload.release_type,
    label_name: payload.label_name,
    metadata: metadataMapToCreateReleaseArray(payload.metadata),
    file_path: payload.file_path,
    file_name: payload.file_name,
    mime_type: payload.mime_type,
    file_size: payload.file_size,
  };
  if (payload.auto_generate_upc === true) {
    body.auto_generate_upc = true;
  } else {
    const u = payload.upc?.trim();
    if (u) body.upc = u;
    if (payload.auto_generate_upc === false) {
      body.auto_generate_upc = false;
    }
  }
  if (payload.previously_released != null) {
    body.previously_released = payload.previously_released;
  }
  if (payload.release_timing) {
    body.release_timing = payload.release_timing;
  }
  const schedNorm = scheduledReleaseDate
    ? normalizeOriginalReleaseDateForApi(scheduledReleaseDate) || scheduledReleaseDate
    : "";
  if (schedNorm) {
    body.scheduled_release_date = schedNorm;
  }
  if (releaseDate) {
    body.release_date = releaseDate;
  }
  if (originalReleaseDate) {
    body.original_release_date = originalReleaseDate;
  }
  if (payload.contributors && payload.contributors.length > 0) {
    body.contributors = payload.contributors.map((c) => {
      const row: Record<string, unknown> = { name: c.name, role: c.role };
      if (c.user_id != null && Number.isFinite(c.user_id)) {
        row.user_id = c.user_id;
      }
      return row;
    });
  }
  const jsonPg = normalizeGenreFieldForApi(payload.primary_genre);
  if (jsonPg) {
    body.primary_genre = jsonPg;
  }
  const jsonSg = normalizeGenreFieldForApi(payload.secondary_genre ?? undefined);
  if (jsonSg) {
    body.secondary_genre = jsonSg;
  }
  if (payload.writers && payload.writers.length > 0) {
    body.writers = payload.writers.map((w) => {
      const row: Record<string, unknown> = {
        name: w.name,
        role: w.role,
        ownership_percentage: w.ownership_percentage,
        iswc: w.iswc ?? "",
        publishing_type: w.publishing_type,
      };
      if (w.user_id != null && Number.isFinite(w.user_id)) {
        row.user_id = w.user_id;
      }
      return row;
    });
  }
  return body;
}

/**
 * POST /api/releases as JSON (after cover upload to signed URL). Accepts 200 or 201.
 */
export async function createReleaseJson(
  payload: CreateReleaseJsonPayload
): Promise<CreateReleaseResponse> {
  const jsonBody = buildCreateReleaseJsonBody(payload);
  let token = await getValidAccessToken();
  let response = await doCreateReleaseJson(token, jsonBody);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doCreateReleaseJson(token, jsonBody);
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const body = (json || {}) as {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
    let message =
      body.message || body.error || `Create release failed (${response.status})`;
    if (body.errors && typeof body.errors === "object") {
      const first = Object.values(body.errors).flat()[0];
      if (first) message = first;
    }
    throw new Error(message);
  }

  return parseCreateReleaseResponse(json);
}

/** Asset class for POST /api/assets/signed-upload (`type` is required by the API). */
export type SignedUploadAssetType = "artwork" | "audio" | "license";

/** Request body for POST /api/assets/signed-upload. */
export interface SignedUploadRequest {
  file_name: string;
  file_type: string;
  type: SignedUploadAssetType;
}

export interface SignedUploadResponse {
  upload_url: string;
  file_path: string;
}

function parseSignedUploadResponse(json: unknown): SignedUploadResponse {
  if (!json || typeof json !== "object") {
    throw new Error("Invalid signed-upload response");
  }
  const root = json as Record<string, unknown>;
  const node =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  const upload_url = String(node.upload_url ?? "").trim();
  const file_path = String(node.file_path ?? "").trim();
  if (!upload_url) {
    throw new Error("Signed upload response missing upload_url");
  }
  if (!file_path) {
    throw new Error("Signed upload response missing file_path");
  }
  return { upload_url, file_path };
}

async function doSignedUploadRequest(accessToken: string, body: SignedUploadRequest): Promise<Response> {
  return fetch(`${API_BASE_URL}/api/assets/signed-upload`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      file_name: body.file_name,
      file_type: body.file_type,
      type: body.type,
    }),
  });
}

/**
 * POST /api/assets/signed-upload — `file_name`, `file_type`, and `type` (e.g. `artwork`, `audio`, `license`).
 */
export async function requestAssetSignedUpload(body: SignedUploadRequest): Promise<SignedUploadResponse> {
  const fileName = body.file_name.trim();
  const fileType = body.file_type.trim();
  const uploadType = body.type;
  if (!fileName) {
    throw new Error("file_name is required for signed upload");
  }
  if (!fileType) {
    throw new Error("file_type is required for signed upload");
  }
  if (!uploadType) {
    throw new Error("type is required for signed upload");
  }
  let token = await getValidAccessToken();
  let response = await doSignedUploadRequest(token, {
    file_name: fileName,
    file_type: fileType,
    type: uploadType,
  });

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doSignedUploadRequest(token, {
      file_name: fileName,
      file_type: fileType,
      type: uploadType,
    });
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const err = (json || {}) as { message?: string; error?: string };
    const message =
      err.message || err.error || `Signed upload failed (${response.status})`;
    throw new Error(message);
  }

  return parseSignedUploadResponse(json);
}

/**
 * PUT binary file bytes to the presigned `upload_url` (e.g. Cloudflare R2). No Bearer token.
 * After success, use {@link requestAssetSignedUpload}'s `file_path` in the next API call (release artwork or track JSON).
 */
export async function uploadBinaryToSignedUrl(uploadUrl: string, file: File): Promise<void> {
  const url = uploadUrl.trim();
  if (!url) {
    throw new Error("upload_url is required");
  }
  const contentType = file.type?.trim() || "application/octet-stream";
  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const snippet = text ? text.slice(0, 200) : "";
    throw new Error(
      `File upload to storage failed (${response.status})${snippet ? `: ${snippet}` : ""}`
    );
  }
}

function parseCreateReleaseResponse(json: unknown): CreateReleaseResponse {
  const root = (json || {}) as {
    message?: string;
    error?: string;
    data?: CreateReleaseResponse & { release?: Partial<CreateReleaseResponse> };
  };
  const data =
    root.data && typeof root.data === "object"
      ? (() => {
          const d = root.data as CreateReleaseResponse & {
            release?: Partial<CreateReleaseResponse>;
          };
          if (d.release && typeof d.release === "object") {
            return {
              ...d,
              ...d.release,
              id: d.id ?? d.release.id,
            } as CreateReleaseResponse;
          }
          return d;
        })()
      : (json as CreateReleaseResponse);
  const idVal =
    data.id ?? (data as { release_id?: string }).release_id ?? (data as { uuid?: string }).uuid;
  return {
    ...data,
    id: idVal != null ? String(idVal).trim() : undefined,
    message: root.message ?? data.message,
  };
}

/**
 * POST /api/releases as multipart/form-data (fields + JSON metadata string + optional artwork file).
 * Refreshes on 401 once. Accepts 200 or 201.
 */
export async function createRelease(
  payload: CreateReleaseMultipartPayload
): Promise<CreateReleaseResponse> {
  let token = await getValidAccessToken();
  let response = await doCreateRelease(token, buildReleaseFormData(payload));

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doCreateRelease(token, buildReleaseFormData(payload));
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const body = (json || {}) as { message?: string; error?: string };
    const message =
      body.message || body.error || `Create release failed (${response.status})`;
    throw new Error(message);
  }

  return parseCreateReleaseResponse(json);
}

async function doUpdateReleaseJson(
  accessToken: string,
  id: string,
  body: Record<string, unknown>
): Promise<Response> {
  const rid = id.trim();
  return fetch(`${API_BASE_URL}/api/releases/${encodeURIComponent(rid)}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
}

/**
 * PUT /api/releases/:id with JSON body (metadata fields + metadata object).
 * Dates are YYYY-MM-DD. Use {@link uploadReleaseArtwork} for cover images.
 */
export async function updateRelease(
  id: string,
  payload: UpdateReleaseJsonPayload
): Promise<CreateReleaseResponse> {
  const rid = id.trim();
  if (!rid) {
    throw new Error("Release id is required to update");
  }
  const jsonBody = buildUpdateReleaseJsonBody(payload);
  let token = await getValidAccessToken();
  let response = await doUpdateReleaseJson(token, rid, jsonBody);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doUpdateReleaseJson(token, rid, jsonBody);
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const body = (json || {}) as { message?: string; error?: string };
    const message =
      body.message || body.error || `Update release failed (${response.status})`;
    throw new Error(message);
  }

  return parseCreateReleaseResponse(json);
}

async function doUploadReleaseArtwork(
  accessToken: string,
  id: string,
  formData: FormData
): Promise<Response> {
  const rid = id.trim();
  return fetch(`${API_BASE_URL}/api/releases/${encodeURIComponent(rid)}/artwork`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
}

/**
 * POST /api/releases/:id/artwork — multipart form field `file` (image).
 */
export async function uploadReleaseArtwork(
  releaseId: string,
  file: File
): Promise<CreateReleaseResponse> {
  const rid = releaseId.trim();
  if (!rid) {
    throw new Error("Release id is required to upload artwork");
  }
  const run = () => {
    const fd = new FormData();
    fd.append("file", file);
    return fd;
  };

  let token = await getValidAccessToken();
  let response = await doUploadReleaseArtwork(token, rid, run());

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doUploadReleaseArtwork(token, rid, run());
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const body = (json || {}) as { message?: string; error?: string };
    const message =
      body.message || body.error || `Artwork upload failed (${response.status})`;
    throw new Error(message);
  }

  return parseCreateReleaseResponse(json);
}

/**
 * POST /api/releases/:releaseId/tracks — JSON body after signed uploads (Postman contract).
 * `preview_start` is seconds (integer). `track_origin` lowercase e.g. `original`.
 */
export type CreateTrackJsonPayload = {
  title: string;
  track_number: number;
  primary_genre: string;
  secondary_genre: string | null;
  version: string;
  language: string;
  lyrics: string;
  is_explicit: boolean;
  preview_start: number;
  track_origin: string;
  track_properties: string[];
  audio_file_path: string;
  audio_file_name: string;
  audio_mime_type: string;
  audio_file_size: number;
  copyright_year: number;
  copyright_owner: string;
  /** When set, included in the JSON create body (matches Postman). */
  isrc?: string | null;
  /**
   * Track contributors — same shape as release `contributors`. Primary row should be first.
   * Send a non-empty array from the UI; an empty array is omitted from the HTTP body.
   */
  contributors?: ReleaseContributorApi[];
} & Partial<{
  sample_license_file_path: string;
  sample_license_file_name: string;
  sample_license_mime_type: string;
  sample_license_file_size: number;
}>;

/**
 * POST /api/releases/:releaseId/tracks — multipart: `title`, `track_number`, `audio`, optional `artwork`.
 * Prefer {@link createReleaseTrackJson} when using signed-upload + JSON metadata.
 */
export interface CreateTrackMultipartPayload {
  title: string;
  track_number: number;
  audioFile?: File | null;
  artworkFile?: File | null;
}

export interface CreateTrackResponse {
  id?: string;
  title?: string;
  track_number?: number;
  release_id?: string;
  organization_id?: string;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export function buildTrackFormData(payload: CreateTrackMultipartPayload): FormData {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("track_number", String(payload.track_number));
  if (payload.audioFile) {
    fd.append("audio", payload.audioFile);
  }
  if (payload.artworkFile) {
    fd.append("artwork", payload.artworkFile);
  }
  return fd;
}

/** POST /api/tracks/:trackId/asset — multipart `audio` and/or `artwork`. */
export interface UploadTrackAssetPayload {
  audioFile?: File | null;
  artworkFile?: File | null;
}

export function buildTrackAssetFormData(payload: UploadTrackAssetPayload): FormData {
  const fd = new FormData();
  if (payload.audioFile) {
    fd.append("audio", payload.audioFile);
  }
  if (payload.artworkFile) {
    fd.append("artwork", payload.artworkFile);
  }
  return fd;
}

export interface UploadTrackAssetResponse {
  message?: string;
  audio?: unknown;
  artwork?: unknown;
}

function parseUploadTrackAssetResponse(json: unknown): UploadTrackAssetResponse {
  const root = (json || {}) as Record<string, unknown>;
  const msg = root.message as string | undefined;
  const data = root.data;
  if (data && typeof data === "object") {
    return { ...(data as UploadTrackAssetResponse), message: msg };
  }
  return { ...(json as UploadTrackAssetResponse), message: msg };
}

async function doUploadTrackAsset(
  accessToken: string,
  trackId: string,
  formData: FormData
): Promise<Response> {
  const tid = trackId.trim();
  return fetch(`${API_BASE_URL}/api/tracks/${encodeURIComponent(tid)}/asset`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
}

async function doAttachExistingTrack(
  accessToken: string,
  releaseId: string,
  trackId: string
): Promise<Response> {
  const rid = releaseId.trim();
  return fetch(
    `${API_BASE_URL}/api/releases/${encodeURIComponent(rid)}/tracks/existing`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ track_id: trackId.trim() }),
    }
  );
}

/**
 * POST /api/releases/:releaseId/tracks/existing — attach an existing organization track to a release.
 * Body: `{ "track_id": "<uuid>" }`. Refreshes once on 401. Treats 200 / 201 / 204 as success.
 */
export async function attachExistingTrackToRelease(
  releaseId: string,
  trackId: string
): Promise<{ message?: string }> {
  const rid = releaseId.trim();
  const tid = trackId.trim();
  if (!rid) {
    throw new Error("Release id is required to attach a track");
  }
  if (!tid) {
    throw new Error("Track id is required to attach a track");
  }
  let token = await getValidAccessToken();
  let response = await doAttachExistingTrack(token, rid, tid);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doAttachExistingTrack(token, rid, tid);
  }

  const json = response.status === 204 ? {} : await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = (json || {}) as {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
    let msg = err.message || err.error || `Attach existing track failed (${response.status})`;
    if (err.errors && typeof err.errors === "object") {
      const first = Object.values(err.errors).flat()[0];
      if (first) msg = first;
    }
    throw new Error(msg);
  }

  return (json as { message?: string }) ?? {};
}

/**
 * POST /api/tracks/:trackId/asset — form fields `audio`, `artwork` (multipart). At least one file required by caller.
 */
export async function uploadTrackAsset(
  trackId: string,
  payload: UploadTrackAssetPayload
): Promise<UploadTrackAssetResponse> {
  const tid = trackId.trim();
  if (!tid) {
    throw new Error("Track id is required to upload track assets");
  }
  if (!payload.audioFile && !payload.artworkFile) {
    return {};
  }
  const run = () => buildTrackAssetFormData(payload);
  let token = await getValidAccessToken();
  let response = await doUploadTrackAsset(token, tid, run());

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doUploadTrackAsset(token, tid, run());
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = (json || {}) as {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
    let msg = err.message || err.error || `Track asset upload failed (${response.status})`;
    if (err.errors && typeof err.errors === "object") {
      const first = Object.values(err.errors).flat()[0];
      if (first) msg = first;
    }
    throw new Error(msg);
  }

  return parseUploadTrackAssetResponse(json);
}

function parseCreateTrackResponse(json: unknown): CreateTrackResponse {
  const root = (json || {}) as Record<string, unknown>;
  const msg = root.message as string | undefined;
  let body: Record<string, unknown> = root;
  const data = root.data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (d.track && typeof d.track === "object") {
      body = d.track as Record<string, unknown>;
    } else {
      body = d;
    }
  } else if (root.track && typeof root.track === "object") {
    body = root.track as Record<string, unknown>;
  }
  const idVal = body.id ?? body.uuid;
  return {
    ...(body as unknown as CreateTrackResponse),
    id: idVal != null ? String(idVal).trim() : undefined,
    message: msg,
  };
}

async function doCreateReleaseTrack(
  accessToken: string,
  releaseId: string,
  formData: FormData
): Promise<Response> {
  const rid = releaseId.trim();
  return fetch(`${API_BASE_URL}/api/releases/${encodeURIComponent(rid)}/tracks`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
}

async function doCreateReleaseTrackJson(
  accessToken: string,
  releaseId: string,
  jsonBody: Record<string, unknown>
): Promise<Response> {
  const rid = releaseId.trim();
  return fetch(`${API_BASE_URL}/api/releases/${encodeURIComponent(rid)}/tracks`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(jsonBody),
  });
}

/**
 * POST `/api/releases/:releaseId/tracks` with JSON after audio (and optional license) have been uploaded via signed URLs.
 *
 * Expected caller sequence:
 * 1. `POST /api/assets/signed-upload` with `{ type: "audio", file_name, file_type }` → `upload_url`, `file_path`.
 * 2. `PUT upload_url` with the audio `File` body (same workflow as cover artwork).
 * 3. This function with `audio_file_path` / `audio_file_name` / `audio_mime_type` / `audio_file_size` from step 1 + file metadata.
 *
 * Optional: repeat signed-upload with `type: "license"` before calling when sample licenses are required.
 *
 * Accepts 200 or 201.
 */
export async function createReleaseTrackJson(
  releaseId: string,
  payload: CreateTrackJsonPayload
): Promise<CreateTrackResponse> {
  const rid = releaseId.trim();
  if (!rid) {
    throw new Error("Release id is required to create a track");
  }
  const body: Record<string, unknown> = {
    title: payload.title,
    track_number: payload.track_number,
    primary_genre: payload.primary_genre,
    secondary_genre: payload.secondary_genre,
    version: payload.version,
    language: payload.language,
    lyrics: payload.lyrics,
    is_explicit: payload.is_explicit,
    preview_start: payload.preview_start,
    track_origin: payload.track_origin,
    track_properties: payload.track_properties,
    audio_file_path: payload.audio_file_path,
    audio_file_name: payload.audio_file_name,
    audio_mime_type: payload.audio_mime_type,
    audio_file_size: payload.audio_file_size,
    copyright_year: payload.copyright_year,
    copyright_owner: payload.copyright_owner,
  };
  const isrcTrim = typeof payload.isrc === "string" ? payload.isrc.trim() : "";
  if (isrcTrim) {
    body.isrc = isrcTrim;
  }
  if (payload.sample_license_file_path != null && payload.sample_license_file_path !== "") {
    body.sample_license_file_path = payload.sample_license_file_path;
    body.sample_license_file_name = payload.sample_license_file_name;
    body.sample_license_mime_type = payload.sample_license_mime_type;
    body.sample_license_file_size = payload.sample_license_file_size;
  }
  /**
   * Always serialize when the payload carries a non-empty list (UI assigns
   * `payload.contributors` on every create so this is reliable).
   */
  const contributorList = Array.isArray(payload.contributors) ? payload.contributors : [];
  if (contributorList.length > 0) {
    body.contributors = contributorList.map((c) => {
      const row: Record<string, unknown> = { name: c.name, role: c.role };
      if (c.user_id != null && Number.isFinite(c.user_id)) row.user_id = c.user_id;
      return row;
    });
  }
  let token = await getValidAccessToken();
  let response = await doCreateReleaseTrackJson(token, rid, body);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doCreateReleaseTrackJson(token, rid, body);
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = (json || {}) as {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
    let msg = err.message || err.error || `Create track failed (${response.status})`;
    if (err.errors && typeof err.errors === "object") {
      const first = Object.values(err.errors).flat()[0];
      if (first) msg = first;
    }
    throw new Error(msg);
  }

  return parseCreateTrackResponse(json);
}

/**
 * POST /api/releases/:releaseId/tracks (multipart). Accepts 200 or 201.
 */
export async function createReleaseTrack(
  releaseId: string,
  payload: CreateTrackMultipartPayload
): Promise<CreateTrackResponse> {
  const rid = releaseId.trim();
  if (!rid) {
    throw new Error("Release id is required to create a track");
  }
  let token = await getValidAccessToken();
  let response = await doCreateReleaseTrack(token, rid, buildTrackFormData(payload));

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doCreateReleaseTrack(token, rid, buildTrackFormData(payload));
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = (json || {}) as {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
    let msg = err.message || err.error || `Create track failed (${response.status})`;
    if (err.errors && typeof err.errors === "object") {
      const first = Object.values(err.errors).flat()[0];
      if (first) msg = first;
    }
    throw new Error(msg);
  }

  return parseCreateTrackResponse(json);
}

/**
 * JSON body for PUT /api/tracks/:id (Postman).
 *
 * `title` and `track_number` are always sent so existing callers stay compatible. Every
 * other field is optional and omitted from the request body when `undefined`, so callers
 * may send a partial update (e.g. just `title` + `track_number`, or the full metadata edit).
 */
export interface UpdateTrackJsonPayload {
  title: string;
  track_number: number;
  primary_genre?: string | null;
  secondary_genre?: string | null;
  version?: string | null;
  language?: string | null;
  lyrics?: string | null;
  is_explicit?: boolean | null;
  /** Seconds from start (integer); see `preview_start` in {@link CreateTrackJsonPayload}. */
  preview_start?: number | null;
  track_origin?: string | null;
  track_properties?: string[] | null;
  copyright_year?: number | null;
  copyright_owner?: string | null;
  isrc?: string | null;
  /**
   * Track contributors — same shape as release `contributors`. When provided (even an empty
   * array), the API replaces the track's contributor list. Omit (`undefined`) to leave it
   * untouched on a partial update.
   */
  contributors?: ReleaseContributorApi[];
}

function buildUpdateTrackJsonBody(payload: UpdateTrackJsonPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: payload.title,
    track_number: payload.track_number,
  };
  const stringFields: Array<keyof UpdateTrackJsonPayload> = [
    "primary_genre",
    "secondary_genre",
    "version",
    "language",
    "lyrics",
    "track_origin",
    "copyright_owner",
    "isrc",
  ];
  for (const key of stringFields) {
    const v = payload[key];
    if (v === undefined) continue;
    body[key as string] = v == null ? null : String(v);
  }
  if (payload.is_explicit !== undefined) {
    body.is_explicit = payload.is_explicit === null ? null : Boolean(payload.is_explicit);
  }
  if (payload.preview_start !== undefined) {
    if (payload.preview_start === null) {
      body.preview_start = null;
    } else if (Number.isFinite(payload.preview_start)) {
      body.preview_start = Math.max(0, Math.floor(payload.preview_start as number));
    }
  }
  if (payload.copyright_year !== undefined) {
    if (payload.copyright_year === null) {
      body.copyright_year = null;
    } else if (Number.isFinite(payload.copyright_year)) {
      body.copyright_year = Math.floor(payload.copyright_year as number);
    }
  }
  if (payload.track_properties !== undefined) {
    body.track_properties = Array.isArray(payload.track_properties)
      ? payload.track_properties.map((s) => String(s).trim()).filter((s) => s.length > 0)
      : [];
  }
  if (payload.contributors !== undefined) {
    body.contributors = Array.isArray(payload.contributors)
      ? payload.contributors.map((c) => {
          const row: Record<string, unknown> = { name: c.name, role: c.role };
          if (c.user_id != null && Number.isFinite(c.user_id)) row.user_id = c.user_id;
          return row;
        })
      : [];
  }
  return body;
}

async function doUpdateTrack(
  accessToken: string,
  trackId: string,
  body: Record<string, unknown>
): Promise<Response> {
  const tid = trackId.trim();
  return fetch(`${API_BASE_URL}/api/tracks/${encodeURIComponent(tid)}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
}

/**
 * PUT /api/tracks/:trackId — JSON metadata update.
 *
 * Always sends `title` + `track_number`. All other fields ({@link UpdateTrackJsonPayload})
 * are optional and only included when defined, matching the Postman contract:
 * `primary_genre`, `secondary_genre`, `version`, `language`, `lyrics`, `is_explicit`,
 * `preview_start`, `track_origin`, `track_properties`, `copyright_year`, `copyright_owner`,
 * `isrc`. Refreshes once on 401, accepts 200.
 */
export async function updateTrack(
  trackId: string,
  payload: UpdateTrackJsonPayload
): Promise<CreateTrackResponse> {
  const tid = trackId.trim();
  if (!tid) {
    throw new Error("Track id is required to update a track");
  }
  const body = buildUpdateTrackJsonBody(payload);
  let token = await getValidAccessToken();
  let response = await doUpdateTrack(token, tid, body);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doUpdateTrack(token, tid, body);
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = (json || {}) as {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
    let msg = err.message || err.error || `Update track failed (${response.status})`;
    if (err.errors && typeof err.errors === "object") {
      const first = Object.values(err.errors).flat()[0];
      if (first) msg = first;
    }
    throw new Error(msg);
  }

  return parseCreateTrackResponse(json);
}

async function doDeleteTrack(accessToken: string, trackId: string): Promise<Response> {
  const tid = trackId.trim();
  return fetch(`${API_BASE_URL}/api/tracks/${encodeURIComponent(tid)}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export interface DeleteTrackResponse {
  message?: string;
}

/**
 * DELETE /api/tracks/:id with Bearer token; refreshes on 401 once.
 */
export async function deleteTrack(trackId: string): Promise<DeleteTrackResponse> {
  const tid = trackId.trim();
  if (!tid) {
    throw new Error("Track id is required to delete a track");
  }
  let token = await getValidAccessToken();
  let response = await doDeleteTrack(token, tid);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doDeleteTrack(token, tid);
  }

  const json = (await response.json().catch(() => ({}))) as DeleteTrackResponse & {
    error?: string;
  };

  if (!response.ok) {
    const message = json.message || json.error || `Delete track failed (${response.status})`;
    throw new Error(message);
  }

  return json;
}

async function doDeleteRelease(accessToken: string, id: string): Promise<Response> {
  const rid = id.trim();
  return fetch(`${API_BASE_URL}/api/releases/${encodeURIComponent(rid)}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export interface DeleteReleaseResponse {
  message?: string;
}

/**
 * DELETE /api/releases/:id with Bearer token; refreshes on 401 once.
 */
export async function deleteRelease(id: string): Promise<DeleteReleaseResponse> {
  let token = await getValidAccessToken();
  let response = await doDeleteRelease(token, id);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doDeleteRelease(token, id);
  }

  const json = (await response.json().catch(() => ({}))) as DeleteReleaseResponse & {
    error?: string;
  };

  if (!response.ok) {
    const message =
      json.message || json.error || `Delete release failed (${response.status})`;
    throw new Error(message);
  }

  return json;
}

export type ReleaseWorkflowAction = "submit_review" | "start_distribution";

/**
 * POST /api/releases/:id/workflow — when missing (404/405/501), returns `{ ok: true, simulated: true }`
 * so the UI can still advance local workflow state until the backend ships this route.
 */
export async function postReleaseWorkflowAction(
  releaseId: string,
  action: ReleaseWorkflowAction
): Promise<{ ok: boolean; simulated?: boolean }> {
  const rid = releaseId.trim();
  if (!rid) {
    throw new Error("Release id is required");
  }
  const url = `${API_BASE_URL}/api/releases/${encodeURIComponent(rid)}/workflow`;
  const body = JSON.stringify({ action });
  let token = await getValidAccessToken();
  let response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });
  }

  if (response.ok) {
    return { ok: true };
  }
  if (response.status === 404 || response.status === 405 || response.status === 501) {
    return { ok: true, simulated: true };
  }
  const json = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
  const message =
    json.message || json.error || `Workflow request failed (${response.status})`;
  throw new Error(message);
}

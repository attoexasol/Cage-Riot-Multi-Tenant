import { API_BASE_URL } from "@/config/env";
import {
  multipartReleaseDateToApiFormat,
  normalizeOriginalReleaseDateForApi,
} from "@/lib/releaseFormat";
import { getValidAccessToken, recoverAccessTokenAfterUnauthorized } from "@/services/apiAuth";

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
}

/** JSON body for PUT /api/releases/:id (metadata only; artwork uses POST …/artwork). */
export type UpdateReleaseJsonPayload = Omit<CreateReleaseMultipartPayload, "artworkFile">;

export function buildUpdateReleaseJsonBody(payload: UpdateReleaseJsonPayload): Record<string, unknown> {
  const releaseDate = normalizeOriginalReleaseDateForApi(payload.release_date);
  const originalReleaseDate = normalizeOriginalReleaseDateForApi(payload.original_release_date);
  return {
    title: payload.title,
    version_title: payload.version_title,
    primary_artist_name: payload.primary_artist_name,
    release_type: payload.release_type,
    upc: payload.upc,
    label_name: payload.label_name,
    release_date: releaseDate,
    original_release_date: originalReleaseDate,
    metadata: payload.metadata,
  };
}

export function buildReleaseFormData(payload: CreateReleaseMultipartPayload): FormData {
  const fd = new FormData();
  fd.append("title", payload.title);
  fd.append("version_title", payload.version_title);
  fd.append("primary_artist_name", payload.primary_artist_name);
  fd.append("release_type", payload.release_type);
  fd.append("upc", payload.upc);
  fd.append("label_name", payload.label_name);
  fd.append("release_date", multipartReleaseDateToApiFormat(payload.release_date));
  fd.append("original_release_date", multipartReleaseDateToApiFormat(payload.original_release_date));
  fd.append("metadata", JSON.stringify(payload.metadata));
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
  release_date?: string | null;
  original_release_date?: string | null;
  metadata?: unknown;
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

/** Normalize API `metadata` (object, array, or missing) to string key–values for UI. */
export function normalizeReleaseMetadata(raw: unknown): Record<string, string> {
  if (raw == null) return {};
  if (Array.isArray(raw)) return {};
  if (typeof raw !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (val == null) continue;
    out[key] =
      typeof val === "object" ? JSON.stringify(val) : String(val);
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
  created_at?: string | null;
  updated_at?: string | null;
  audio?: TrackAssetInfo | null;
  artwork?: TrackAssetInfo | null;
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
  const row = raw as Record<string, unknown>;
  const idVal = row.id ?? row.uuid;
  if (idVal == null) {
    return null;
  }
  const id = String(idVal).trim();
  if (!id) {
    return null;
  }
  return { ...row, id } as ReleaseTrackItem;
}

function parseReleaseTracksList(json: unknown): ReleaseTrackItem[] {
  return extractReleaseTracksRows(json)
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
 * POST /api/releases/:releaseId/tracks — multipart: `title`, `track_number`, `audio`, optional `artwork`.
 * Matches API validation (audio required on create).
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

/** JSON body for PUT /api/tracks/:id (Postman). */
export interface UpdateTrackJsonPayload {
  title: string;
  track_number: number;
}

async function doUpdateTrack(
  accessToken: string,
  trackId: string,
  body: UpdateTrackJsonPayload
): Promise<Response> {
  const tid = trackId.trim();
  return fetch(`${API_BASE_URL}/api/tracks/${encodeURIComponent(tid)}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      title: body.title,
      track_number: body.track_number,
    }),
  });
}

/**
 * PUT /api/tracks/:trackId — JSON `title`, `track_number`. Accepts 200.
 */
export async function updateTrack(
  trackId: string,
  payload: UpdateTrackJsonPayload
): Promise<CreateTrackResponse> {
  const tid = trackId.trim();
  if (!tid) {
    throw new Error("Track id is required to update a track");
  }
  let token = await getValidAccessToken();
  let response = await doUpdateTrack(token, tid, payload);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doUpdateTrack(token, tid, payload);
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

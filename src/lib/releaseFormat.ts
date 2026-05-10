import { API_BASE_URL } from "@/config/env";

/** How long before SigV4 expiry we proactively refetch (ms). */
const PRESIGNED_REFRESH_BUFFER_MS = 45_000;

/**
 * Resolves `file_path` from the API for display (`<img src>`, audio URL, etc.):
 * - `https://…` / `http://…` (e.g. R2 presigned) → used as-is
 * - Relative keys (e.g. `releases/artwork/…`) → `{API_BASE_URL}/storage/{path}`
 */
export function releaseArtworkUrlFromFilePath(filePath: string | null | undefined): string | null {
  if (filePath == null) return null;
  const raw = String(filePath).trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  let path = raw.replace(/^\/+/, "");
  if (path.toLowerCase().startsWith("storage/")) {
    path = path.slice("storage/".length);
  }
  return `${API_BASE_URL}/storage/${path}`;
}

/**
 * Milliseconds until we should refetch release/track payloads to renew presigned URLs.
 * Parses AWS query params `X-Amz-Date` + `X-Amz-Expires` when present; otherwise returns `null`
 * (caller can still use `img` `onError` to refetch).
 */
export function getMsUntilPresignedUrlRefresh(urlString: string): number | null {
  const s = urlString.trim();
  if (!/^https?:\/\//i.test(s)) return null;
  try {
    const u = new URL(s);
    const dateStr = u.searchParams.get("X-Amz-Date") ?? u.searchParams.get("x-amz-date");
    const expiresStr = u.searchParams.get("X-Amz-Expires") ?? u.searchParams.get("x-amz-expires");
    if (!dateStr || expiresStr == null) return null;
    const expiresSec = parseInt(expiresStr, 10);
    if (!Number.isFinite(expiresSec) || expiresSec <= 0) return null;
    const m = dateStr.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
    if (!m) return null;
    const issueMs = Date.UTC(
      parseInt(m[1]!, 10),
      parseInt(m[2]!, 10) - 1,
      parseInt(m[3]!, 10),
      parseInt(m[4]!, 10),
      parseInt(m[5]!, 10),
      parseInt(m[6]!, 10)
    );
    const expiryMs = issueMs + expiresSec * 1000;
    const refreshAt = expiryMs - PRESIGNED_REFRESH_BUFFER_MS;
    return Math.max(0, refreshAt - Date.now());
  } catch {
    return null;
  }
}

/** Minimum delay among presigned HTTPS URLs in the list (or `null` if none need a timer). */
export function earliestPresignedRefreshDelayMs(urls: Array<string | null | undefined>): number | null {
  let min: number | null = null;
  for (const u of urls) {
    const s = u?.trim();
    if (!s || !/^https?:\/\//i.test(s)) continue;
    const d = getMsUntilPresignedUrlRefresh(s);
    if (d == null) continue;
    if (min == null || d < min) min = d;
  }
  return min;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
/** MM-DD-YY (dashes), e.g. 12-05-26 */
const MDY_SHORT = /^(\d{1,2})-(\d{1,2})-(\d{2})$/;
/** MM/DD/YY (slashes) — multipart POST /api/releases (Postman). */
const SLASH_MDY_SHORT = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/;

function yy2ToFullYear(yy2: number): number {
  return yy2 >= 70 ? 1900 + yy2 : 2000 + yy2;
}

function parseMdyShortToYyyyMmDd(raw: string): string | null {
  const m = raw.trim().match(MDY_SHORT);
  if (!m) return null;
  const mm = m[1].padStart(2, "0");
  const dd = m[2].padStart(2, "0");
  const yy2 = parseInt(m[3], 10);
  return `${yy2ToFullYear(yy2)}-${mm}-${dd}`;
}

function parseSlashMdyToYyyyMmDd(raw: string): string | null {
  const m = raw.trim().match(SLASH_MDY_SHORT);
  if (!m) return null;
  const mm = m[1].padStart(2, "0");
  const dd = m[2].padStart(2, "0");
  const yy2 = parseInt(m[3], 10);
  return `${yy2ToFullYear(yy2)}-${mm}-${dd}`;
}

/** Display as YYYY-MM-DD from API date, MM-DD-YY, or ISO datetime. */
export function formatReleaseDisplayDate(input: string | null | undefined): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  const head = raw.slice(0, 10);
  if (ISO_DATE.test(head)) {
    return head;
  }
  const fromSlash = parseSlashMdyToYyyyMmDd(raw);
  if (fromSlash) return fromSlash;
  const fromShort = parseMdyShortToYyyyMmDd(raw);
  if (fromShort) return fromShort;
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return "";
  const d = new Date(t);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Multipart POST /api/releases — `release_date` / `original_release_date` as MM/DD/YY (slashes).
 * Input is usually from `<input type="date">` (YYYY-MM-DD).
 */
export function multipartReleaseDateToApiFormat(yyyyMmDdOrEmpty: string): string {
  const raw = (yyyyMmDdOrEmpty ?? "").trim();
  if (!raw) return "";
  const iso = raw.slice(0, 10);
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const yy = m[1].slice(-2);
    return `${m[2]}/${m[3]}/${yy}`;
  }
  const slash = raw.match(SLASH_MDY_SHORT);
  if (slash) {
    return `${slash[1].padStart(2, "0")}/${slash[2].padStart(2, "0")}/${slash[3]}`;
  }
  const dashed = raw.match(MDY_SHORT);
  if (dashed) {
    return `${dashed[1].padStart(2, "0")}/${dashed[2].padStart(2, "0")}/${dashed[3]}`;
  }
  return raw;
}

/** Multipart `original_release_date`: YYYY-MM-DD. */
export function normalizeOriginalReleaseDateForApi(input: string | null | undefined): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  const head = raw.slice(0, 10);
  if (ISO_DATE.test(head)) return head;
  return formatReleaseDisplayDate(raw);
}

/**
 * Returns the date string the UI should treat as the "Release Date" for a release row.
 *
 * The API exposes two fields:
 *  - `release_date` — populated when the release is already out / ASAP-published.
 *  - `scheduled_release_date` — populated when the artist chose a future drop date
 *    (release_timing = "date"). Until the release goes live, only this one is set.
 *
 * Prefers a non-empty `scheduled_release_date` over a non-empty `release_date` so that
 * draft / scheduled releases render their drop date instead of "—".
 */
export function pickEffectiveReleaseDate(
  source: { release_date?: string | null; scheduled_release_date?: string | null } | null | undefined
): string {
  if (!source) return "";
  const sched = source.scheduled_release_date?.trim() ?? "";
  if (sched) return sched;
  return source.release_date?.trim() ?? "";
}

/** Convenience wrapper: `pickEffectiveReleaseDate` + `formatReleaseDisplayDate`. */
export function formatEffectiveReleaseDate(
  source: { release_date?: string | null; scheduled_release_date?: string | null } | null | undefined
): string {
  return formatReleaseDisplayDate(pickEffectiveReleaseDate(source));
}

const ARTWORK_EMOJIS = ["🎵", "💿", "🎧", "🌊", "✨", "🎹", "🎸", "🎤"];

export function artworkEmojiForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return ARTWORK_EMOJIS[Math.abs(h) % ARTWORK_EMOJIS.length];
}

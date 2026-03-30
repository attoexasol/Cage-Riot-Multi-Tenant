import { API_BASE_URL } from "@/config/env";

/** Full URL for release artwork from GET `artwork.file_path` (e.g. `artworks/xxx.png`). Served under `/storage`. */
export function releaseArtworkUrlFromFilePath(filePath: string | null | undefined): string | null {
  if (filePath == null) return null;
  let path = String(filePath).trim().replace(/^\/+/, "");
  if (!path) return null;
  if (path.toLowerCase().startsWith("storage/")) {
    path = path.slice("storage/".length);
  }
  return `${API_BASE_URL}/storage/${path}`;
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

const ARTWORK_EMOJIS = ["🎵", "💿", "🎧", "🌊", "✨", "🎹", "🎸", "🎤"];

export function artworkEmojiForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return ARTWORK_EMOJIS[Math.abs(h) % ARTWORK_EMOJIS.length];
}

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const ACCESS_EXPIRES_AT_KEY = "access_token_expires_at";

/** Seconds before expiry to treat token as expired (refresh early) */
const EXPIRY_BUFFER_SEC = 60;

export function persistAuthTokens(params: {
  access_token: string;
  refresh_token?: string | null;
  expires_in?: number | null;
}): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, params.access_token);
  if (params.refresh_token != null && params.refresh_token !== "") {
    localStorage.setItem(REFRESH_TOKEN_KEY, params.refresh_token);
  }
  const expiresIn = params.expires_in ?? 3600;
  const expiresAt = Date.now() + Math.max(0, expiresIn - EXPIRY_BUFFER_SEC) * 1000;
  localStorage.setItem(ACCESS_EXPIRES_AT_KEY, String(expiresAt));
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAccessTokenExpiresAtMs(): number | null {
  const raw = localStorage.getItem(ACCESS_EXPIRES_AT_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** True if we should refresh before the next API call */
export function shouldRefreshAccessToken(): boolean {
  const exp = getAccessTokenExpiresAtMs();
  if (exp == null) return false;
  return Date.now() >= exp;
}

export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_EXPIRES_AT_KEY);
}

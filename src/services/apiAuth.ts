import { refreshTokens } from "@/services/authService";
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  persistAuthTokens,
  shouldRefreshAccessToken,
  clearAuthTokens,
} from "@/services/tokenStorage";
import { emitSessionExpired } from "@/services/sessionEvents";

let refreshInFlight: Promise<string> | null = null;

/**
 * Returns a usable access token, refreshing via /api/refresh when the stored token is expired or near expiry.
 * Concurrent callers share a single refresh. On failure, clears tokens and emits session-expired.
 */
export async function getValidAccessToken(): Promise<string> {
  let token = getStoredAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  if (!shouldRefreshAccessToken()) {
    return token;
  }

  const refreshTok = getStoredRefreshToken();
  if (!refreshTok) {
    clearAuthTokens();
    emitSessionExpired();
    throw new Error("Session expired. Please sign in again.");
  }

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const data = await refreshTokens(refreshTok);
        persistAuthTokens({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
        });
        const next = getStoredAccessToken();
        if (!next) throw new Error("No access token after refresh");
        return next;
      } catch {
        clearAuthTokens();
        emitSessionExpired();
        throw new Error("Session expired. Please sign in again.");
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

/**
 * After a 401, force one refresh with the latest refresh_token and return the new access token, or throw.
 */
export async function recoverAccessTokenAfterUnauthorized(): Promise<string> {
  const refreshTok = getStoredRefreshToken();
  if (!refreshTok) {
    clearAuthTokens();
    emitSessionExpired();
    throw new Error("Session expired. Please sign in again.");
  }

  try {
    const data = await refreshTokens(refreshTok);
    persistAuthTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
    const next = getStoredAccessToken();
    if (!next) throw new Error("No access token after refresh");
    return next;
  } catch {
    clearAuthTokens();
    emitSessionExpired();
    throw new Error("Session expired. Please sign in again.");
  }
}

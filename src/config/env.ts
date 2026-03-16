/**
 * API base URL loaded from .env (VITE_API_BASE_URL).
 * Use this import anywhere you need the API base URL.
 * No trailing slash.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://cageriot.attoexasolutions.com";

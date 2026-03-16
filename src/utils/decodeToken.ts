import { jwtDecode } from "jwt-decode";

export interface TokenPayload {
  sub: string;
  role?: string;
  user_role?: string;
  organization_id: number;
  org_type: string;
}

/**
 * Decode JWT and return payload. Use getRoleFromToken to get role for navigation.
 */
export function decodeToken(token: string): TokenPayload {
  return jwtDecode<TokenPayload>(token);
}

/**
 * Get role from decoded token (role or user_role). Used for role-based navigation after signup.
 */
export function getRoleFromToken(token: string): string {
  const payload = decodeToken(token);
  return payload.user_role ?? payload.role ?? "";
}

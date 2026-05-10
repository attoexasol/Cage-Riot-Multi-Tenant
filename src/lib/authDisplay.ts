import type { User } from "@/app/components/auth/auth-context";

/**
 * Name suitable for "Welcome back, …" — excludes empty and legacy cases where `name` was set to the email.
 */
export function displayNameForWelcome(user: User | null | undefined): string | null {
  if (!user) return null;
  const n = user.name?.trim();
  if (!n) return null;
  const email = user.email?.trim().toLowerCase();
  if (email && n.toLowerCase() === email) return null;
  return n;
}

export function welcomeBackLine(user: User | null | undefined): string {
  const d = displayNameForWelcome(user);
  return d ? `Welcome back, ${d}` : "Welcome back";
}

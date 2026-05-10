import { API_BASE_URL } from "@/config/env";
import { getValidAccessToken, recoverAccessTokenAfterUnauthorized } from "@/services/apiAuth";

export interface OrganizationUser {
  id: number;
  /** Top-level user `name` for `primary_artist_name` when selected. */
  name: string;
  /** Distinct `name` values (excludes `organization.name` under `user_roles`). */
  allNames: string[];
  /** `role.name` from each `user_roles[]` entry (e.g. standard_owner). */
  roles: string[];
}

/** Distinct `role.name` values from `user_roles`, in array order. */
function collectRoleNames(row: unknown): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  if (row == null || typeof row !== "object") return ordered;
  const userRoles = (row as { user_roles?: unknown }).user_roles;
  if (!Array.isArray(userRoles)) return ordered;
  for (const ur of userRoles) {
    if (ur == null || typeof ur !== "object") continue;
    const role = (ur as { role?: { name?: unknown } }).role;
    if (!role || typeof role !== "object") continue;
    const n = (role as { name?: unknown }).name;
    if (typeof n !== "string") continue;
    const t = n.trim();
    if (t === "" || seen.has(t)) continue;
    seen.add(t);
    ordered.push(t);
  }
  return ordered;
}

/**
 * Collect string values for properties named `name`, but skip any branch under an
 * `organization` key so list UI does not show org labels like "Independent Artist".
 */
function collectAllNameFields(node: unknown): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  function walk(v: unknown): void {
    if (v == null) return;
    if (Array.isArray(v)) {
      for (const item of v) walk(item);
      return;
    }
    if (typeof v !== "object") return;
    for (const [key, val] of Object.entries(v as Record<string, unknown>)) {
      if (key === "organization") {
        continue;
      }
      if (key === "name" && typeof val === "string") {
        const t = val.trim();
        if (t !== "" && !seen.has(t)) {
          seen.add(t);
          ordered.push(t);
        }
      } else {
        walk(val);
      }
    }
  }

  walk(node);
  return ordered;
}

/**
 * GET /api/organizations/:organizationId/users — org members (contributors) for pickers;
 * refreshes on 401 once.
 */
export async function listOrganizationUsers(organizationId: string): Promise<OrganizationUser[]> {
  const id = organizationId.trim();
  if (!id) throw new Error("Missing organization id");

  async function doFetch(token: string): Promise<Response> {
    return fetch(`${API_BASE_URL}/api/organizations/${encodeURIComponent(id)}/users`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }

  let token = await getValidAccessToken();
  let response = await doFetch(token);

  if (response.status === 401) {
    token = await recoverAccessTokenAfterUnauthorized();
    response = await doFetch(token);
  }

  const json = (await response.json().catch(() => null)) as
    | { success?: boolean; data?: unknown; message?: string; error?: string }
    | null;

  if (!response.ok) {
    const message =
      json?.message || json?.error || `Failed to load organization users (${response.status})`;
    throw new Error(message);
  }

  if (!json || json.success !== true || !Array.isArray(json.data)) {
    throw new Error("Invalid organization users response");
  }

  const out: OrganizationUser[] = [];
  for (const row of json.data) {
    if (row == null || typeof row !== "object") continue;
    const r = row as { id?: unknown; name?: unknown };
    const uid = r.id;
    const allNames = collectAllNameFields(row);
    const top = typeof r.name === "string" ? r.name.trim() : "";
    const primary = top || allNames[0] || "";
    if (primary === "") continue;
    const nid = typeof uid === "number" ? uid : Number(uid);
    if (!Number.isFinite(nid)) continue;
    const namesForRow = allNames.length > 0 ? allNames : [primary];
    const roles = collectRoleNames(row);
    out.push({ id: nid, name: primary, allNames: namesForRow, roles });
  }
  out.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  return out;
}

const WORKFLOW_KEY = "cage-release-workflow-v1";
const DIST_SETTINGS_KEY = "cage-release-distribution-settings-v1";

export type WorkflowUiStatus =
  | "draft"
  | "ready"
  | "in_review"
  | "approved"
  | "live"
  | "rejected";

export interface ReleaseWorkflowEntry {
  /** Overrides API `status` for catalog badges until backend supports workflow. */
  effectiveStatus?: WorkflowUiStatus;
  updatedAt: string;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function getWorkflowMap(): Record<string, ReleaseWorkflowEntry> {
  return readJson<Record<string, ReleaseWorkflowEntry>>(WORKFLOW_KEY) ?? {};
}

export function getEffectiveStatusOverride(releaseId: string): WorkflowUiStatus | null {
  const id = releaseId.trim();
  if (!id) return null;
  const m = getWorkflowMap();
  return m[id]?.effectiveStatus ?? null;
}

export function setEffectiveStatusOverride(releaseId: string, status: WorkflowUiStatus) {
  const id = releaseId.trim();
  if (!id) return;
  const m = { ...getWorkflowMap() };
  m[id] = { effectiveStatus: status, updatedAt: new Date().toISOString() };
  writeJson(WORKFLOW_KEY, m);
  window.dispatchEvent(new CustomEvent("cage-release-workflow-changed", { detail: { releaseId: id } }));
}

export interface DistributionSettingsState {
  scope: "global";
  territoriesNote: string;
  platforms: "all_dsps";
  timingNote: string;
}

const defaultDistribution = (): DistributionSettingsState => ({
  scope: "global",
  territoriesNote: "",
  platforms: "all_dsps",
  timingNote: "",
});

export function getDistributionSettings(releaseId: string): DistributionSettingsState {
  const id = releaseId.trim();
  if (!id) return defaultDistribution();
  const all = readJson<Record<string, DistributionSettingsState>>(DIST_SETTINGS_KEY) ?? {};
  return all[id] ?? defaultDistribution();
}

export function saveDistributionSettings(releaseId: string, next: DistributionSettingsState) {
  const id = releaseId.trim();
  if (!id) return;
  const all = { ...(readJson<Record<string, DistributionSettingsState>>(DIST_SETTINGS_KEY) ?? {}) };
  all[id] = next;
  writeJson(DIST_SETTINGS_KEY, all);
}

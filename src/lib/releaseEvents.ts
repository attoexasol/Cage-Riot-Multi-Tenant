const RELEASE_CATALOG_CHANGED_EVENT = "cage-release-catalog-changed";

export type ReleaseCatalogChangedDetail = {
  releaseId?: string;
  reason?: "created" | "updated" | "deleted";
};

export function emitReleaseCatalogChanged(detail: ReleaseCatalogChangedDetail = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(RELEASE_CATALOG_CHANGED_EVENT, { detail }));
}

export function onReleaseCatalogChanged(
  listener: (detail: ReleaseCatalogChangedDetail) => void
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  const wrapped = (ev: Event) => {
    const detail = (ev as CustomEvent<ReleaseCatalogChangedDetail>).detail ?? {};
    listener(detail);
  };
  window.addEventListener(RELEASE_CATALOG_CHANGED_EVENT, wrapped as EventListener);
  return () => {
    window.removeEventListener(RELEASE_CATALOG_CHANGED_EVENT, wrapped as EventListener);
  };
}

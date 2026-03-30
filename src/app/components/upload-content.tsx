import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Upload,
  Music,
  Image as ImageIcon,
  FileText,
  Video,
  CheckCircle2,
  X,
  FileAudio,
  AlertCircle,
  Cloud,
  Shield,
  Plus,
  Minus,
  Trash2,
  Check,
  Zap,
  Crown,
  Loader2,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { toast } from "sonner";
import {
  createRelease,
  createReleaseTrack,
  getRelease,
  listReleaseTracks,
  normalizeReleaseMetadata,
  updateRelease,
  updateTrack,
  uploadReleaseArtwork,
  uploadTrackAsset,
} from "@/services/releaseService";
import type { CreateReleaseMultipartPayload, ReleaseListItem } from "@/services/releaseService";
import { formatReleaseDisplayDate, releaseArtworkUrlFromFilePath } from "@/lib/releaseFormat";

function resolveReleaseCoverDisplayUrl(r: ReleaseListItem): string | null {
  const row = r as Record<string, unknown>;
  const fp =
    r.artwork?.file_path ??
    (typeof row.artwork_file_path === "string" ? row.artwork_file_path : null) ??
    (typeof row.cover_path === "string" ? row.cover_path : null);
  if (fp != null && String(fp).trim()) {
    return releaseArtworkUrlFromFilePath(String(fp).trim());
  }
  for (const key of ["artwork_url", "cover_image_url", "artwork_file_url"] as const) {
    const v = row[key];
    if (typeof v === "string" && v.trim()) {
      return releaseArtworkUrlFromFilePath(v.trim());
    }
  }
  return null;
}

function withImageCacheBust(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}cb=${Date.now()}`;
}

interface UploadFile {
  id: string;
  name: string;
  type: "audio" | "video" | "image" | "document";
  size: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  /** Set when user adds a real file (sent as multipart `audio` / `artwork`). */
  file?: File;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const AUDIO_EXT = new Set([
  "wav",
  "mp3",
  "flac",
  "m4a",
  "aac",
  "ogg",
  "aiff",
  "aif",
  "webm",
]);

function fileToUploadType(file: File): UploadFile["type"] {
  const t = file.type;
  if (t.startsWith("audio/")) return "audio";
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && AUDIO_EXT.has(ext)) return "audio";
  if (t.startsWith("video/")) return "video";
  if (t.startsWith("image/")) return "image";
  return "document";
}

function pickAudioFileForTrack(track: Track): File | null {
  const a = track.files.find((f) => f.type === "audio" && f.file);
  if (a?.file) return a.file;
  const v = track.files.find((f) => f.type === "video" && f.file);
  if (v?.file) return v.file;
  const byExt = track.files.find((f) => {
    if (!f.file) return false;
    const ext = f.file.name.split(".").pop()?.toLowerCase();
    return ext != null && AUDIO_EXT.has(ext);
  });
  return byExt?.file ?? null;
}

function pickArtworkFileForTrack(track: Track): File | null {
  const img = track.files.find((f) => f.type === "image" && f.file);
  return img?.file ?? null;
}

interface Track {
  id: string;
  /** Set when this row maps to an existing API track (PUT /api/tracks/:id). */
  serverTrackId?: string;
  title: string;
  isrc: string;
  duration: string;
  explicit: boolean;
  genre: string;
  files: UploadFile[];
}

/** Keys available in the Additional info dropdown; sent as `metadata[key] = value`. */
const RELEASE_METADATA_KEY_OPTIONS: { value: string; label: string }[] = [
  { value: "genre", label: "Genre" },
  { value: "subgenre", label: "Subgenre" },
  { value: "language", label: "Language" },
  { value: "explicit", label: "Explicit" },
  { value: "artist_role", label: "Artist role" },
  { value: "territories", label: "Territories" },
  { value: "mood", label: "Mood" },
  { value: "energy_level", label: "Energy level" },
  { value: "bpm_range", label: "BPM range" },
  { value: "musical_key", label: "Musical key" },
  { value: "copyright_type", label: "Copyright type" },
  { value: "release_timing", label: "Release timing" },
  { value: "monetization", label: "Monetization" },
];

const METADATA_KEY_NONE = "__none__";

interface AdditionalMetadataRow {
  key: string;
  value: string;
}

interface ReleaseMetadata {
  title: string;
  version_title: string;
  primary_artist_name: string;
  release_type: string;
  upc: string;
  label_name: string;
  release_date: string;
  original_release_date: string;
  /** Dropdown key + free-text value → `metadata[key] = value` */
  additional_metadata: AdditionalMetadataRow[];
  /** Set when user selects a cover file (display name only until upload API exists) */
  cover_image_file_name: string;
  tracks: Track[];
}

export interface UploadContentProps {
  /** When set, form loads this release and submit sends PUT /api/releases/:id */
  editReleaseId?: string | null;
  /** Called if loading a release for edit fails (e.g. invalid id). */
  onEditConsumed?: () => void;
}

type ReleaseFormFields = Omit<CreateReleaseMultipartPayload, "artworkFile">;

function createDefaultReleaseMetadata(): ReleaseMetadata {
  return {
    title: "",
    version_title: "",
    primary_artist_name: "",
    release_type: "single",
    upc: "",
    label_name: "",
    release_date: "",
    original_release_date: "",
    additional_metadata: [{ key: "", value: "" }],
    cover_image_file_name: "",
    tracks: [emptyTrackRow("1")],
  };
}

function emptyTrackRow(id: string): Track {
  return {
    id,
    title: "",
    isrc: "",
    duration: "",
    explicit: false,
    genre: "",
    files: [],
  };
}

export function UploadContent({ editReleaseId = null, onEditConsumed }: UploadContentProps = {}) {
  const [submittingRelease, setSubmittingRelease] = useState(false);
  const [hydratingEdit, setHydratingEdit] = useState(false);
  const onEditConsumedRef = useRef(onEditConsumed);
  onEditConsumedRef.current = onEditConsumed;
  const [dragTrackId, setDragTrackId] = useState<string | null>(null);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "premium" | "enterprise" | null>(null);
  const [currentStorage, setCurrentStorage] = useState(500); // GB
  const [usedStorage] = useState(234); // GB

  /** Blob URL for a newly chosen file (revoked on cleanup). */
  const [coverImagePreviewUrl, setCoverImagePreviewUrl] = useState<string | null>(null);
  /** Actual file for multipart POST `artwork` field. */
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  /** Cover image from API (`artwork.file_path` / storage); includes cache-bust query when set. */
  const [existingCoverImageUrl, setExistingCoverImageUrl] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<ReleaseMetadata>(() => createDefaultReleaseMetadata());

  useEffect(() => {
    return () => {
      if (coverImagePreviewUrl) URL.revokeObjectURL(coverImagePreviewUrl);
    };
  }, [coverImagePreviewUrl]);

  useEffect(() => {
    if (!editReleaseId?.trim()) {
      setMetadata(createDefaultReleaseMetadata());
      setCoverImageFile(null);
      setExistingCoverImageUrl(null);
      setCoverImagePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    let cancelled = false;
    setHydratingEdit(true);
    (async () => {
      try {
        const r = await getRelease(editReleaseId.trim());
        if (cancelled) return;
        const flat = normalizeReleaseMetadata(r.metadata);
        const rows =
          Object.keys(flat).length > 0
            ? Object.entries(flat).map(([key, value]) => ({ key, value }))
            : [{ key: "", value: "" }];
        setCoverImageFile(null);
        setCoverImagePreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        const coverFromApi = resolveReleaseCoverDisplayUrl(r);
        setExistingCoverImageUrl(coverFromApi ? withImageCacheBust(coverFromApi) : null);
        let tracksForForm: Track[] = [];
        try {
          const apiTracks = await listReleaseTracks(editReleaseId.trim());
          tracksForForm = apiTracks.map((t) => ({
            id: t.id,
            serverTrackId: t.id,
            title: t.title?.trim() ?? "",
            isrc: "",
            duration: "",
            explicit: false,
            genre: "",
            files: [],
          }));
        } catch {
          tracksForForm = [];
        }
        if (tracksForForm.length === 0) {
          tracksForForm = [emptyTrackRow("1")];
        }
        setMetadata({
          title: r.title?.trim() ?? "",
          version_title: r.version_title?.trim() ?? "",
          primary_artist_name: r.primary_artist_name?.trim() ?? "",
          release_type: (r.release_type ?? "single").toLowerCase(),
          upc: r.upc?.trim() ?? "",
          label_name: r.label_name?.trim() ?? "",
          release_date: formatReleaseDisplayDate(r.release_date),
          original_release_date: formatReleaseDisplayDate(r.original_release_date),
          additional_metadata: rows,
          cover_image_file_name: "",
          tracks: tracksForForm,
        });
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load release";
          toast.error(message);
          onEditConsumedRef.current?.();
        }
      } finally {
        if (!cancelled) {
          setHydratingEdit(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editReleaseId]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    setCoverImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setMetadata((m) => ({ ...m, cover_image_file_name: file.name }));
  };

  const clearCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setMetadata((m) => ({ ...m, cover_image_file_name: "" }));
  };

  const addAdditionalMetadataRow = () => {
    setMetadata((m) => ({
      ...m,
      additional_metadata: [...m.additional_metadata, { key: "", value: "" }],
    }));
  };

  const removeLastAdditionalMetadataRow = () => {
    setMetadata((m) => {
      if (m.additional_metadata.length > 1) {
        return { ...m, additional_metadata: m.additional_metadata.slice(0, -1) };
      }
      return { ...m, additional_metadata: [{ key: "", value: "" }] };
    });
  };

  const updateAdditionalMetadataRow = (
    index: number,
    patch: Partial<Pick<AdditionalMetadataRow, "key" | "value">>
  ) => {
    setMetadata((m) => ({
      ...m,
      additional_metadata: m.additional_metadata.map((row, i) =>
        i === index ? { ...row, ...patch } : row
      ),
    }));
  };

  const addTrack = () => {
    const newTrack: Track = {
      id: Date.now().toString(),
      title: "",
      isrc: "",
      duration: "",
      explicit: false,
      genre: "",
      files: [],
    };
    setMetadata({
      ...metadata,
      tracks: [...metadata.tracks, newTrack],
    });
  };

  const removeTrack = (trackId: string) => {
    if (metadata.tracks.length > 1) {
      setMetadata({
        ...metadata,
        tracks: metadata.tracks.filter((t) => t.id !== trackId),
      });
      toast.success("Track removed");
    }
  };

  const updateTrack = (trackId: string, field: keyof Track, value: any) => {
    setMetadata({
      ...metadata,
      tracks: metadata.tracks.map((t) =>
        t.id === trackId ? { ...t, [field]: value } : t
      ),
    });
  };

  const setTrackFiles = (trackId: string, nextFiles: UploadFile[]) => {
    setMetadata((m) => ({
      ...m,
      tracks: m.tracks.map((t) => (t.id === trackId ? { ...t, files: nextFiles } : t)),
    }));
  };

  const addFilesToTrack = (trackId: string, fileList: FileList | null) => {
    if (!fileList?.length) return;
    const newFiles: UploadFile[] = Array.from(fileList).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      type: fileToUploadType(file),
      size: formatBytes(file.size),
      progress: 100,
      status: "complete",
      file,
    }));
    setMetadata((m) => ({
      ...m,
      tracks: m.tracks.map((t) =>
        t.id === trackId ? { ...t, files: [...t.files, ...newFiles] } : t
      ),
    }));
  };

  const buildCreateReleasePayload = (): ReleaseFormFields => {
    const metadataPayload: Record<string, string> = {};
    for (const row of metadata.additional_metadata) {
      const k = row.key.trim();
      if (k) {
        metadataPayload[k] = row.value.trim();
      }
    }
    return {
      title: metadata.title.trim(),
      version_title: metadata.version_title.trim(),
      primary_artist_name: metadata.primary_artist_name.trim(),
      release_type: metadata.release_type,
      upc: metadata.upc.trim(),
      label_name: metadata.label_name.trim(),
      release_date: metadata.release_date,
      original_release_date: metadata.original_release_date,
      metadata: metadataPayload,
    };
  };

  const buildMultipartPayload = (): CreateReleaseMultipartPayload => {
    const p = buildCreateReleasePayload();
    return {
      title: p.title,
      version_title: p.version_title,
      primary_artist_name: p.primary_artist_name,
      release_type: p.release_type,
      upc: p.upc,
      label_name: p.label_name,
      release_date: p.release_date,
      original_release_date: p.original_release_date,
      metadata: p.metadata as Record<string, string>,
      artworkFile: coverImageFile,
    };
  };

  const submitForReview = async () => {
    setSubmittingRelease(true);
    try {
      const editingId = editReleaseId?.trim();
      if (editingId) {
        const fields = buildCreateReleasePayload();
        const metaResult = await updateRelease(editingId, fields);
        let artworkResult: Awaited<ReturnType<typeof uploadReleaseArtwork>> | null = null;
        if (coverImageFile) {
          artworkResult = await uploadReleaseArtwork(editingId, coverImageFile);
        }

        const idMap = new Map<string, string>();
        const titledTracks = metadata.tracks
          .map((t, index) => ({ t, index }))
          .filter(({ t }) => t.title.trim().length > 0);

        for (const { t, index } of titledTracks) {
          const audioF = pickAudioFileForTrack(t);
          const artF = pickArtworkFileForTrack(t);
          const n = index + 1;

          if (t.serverTrackId?.trim()) {
            await updateTrack(t.serverTrackId.trim(), {
              title: t.title.trim(),
              track_number: n,
            });
            if (audioF || artF) {
              await uploadTrackAsset(t.serverTrackId.trim(), {
                audioFile: audioF,
                artworkFile: artF,
              });
            }
          } else {
            if (!audioF) {
              throw new Error(
                `New track "${t.title.trim()}" needs an audio file to create on the server.`
              );
            }
            const created = await createReleaseTrack(editingId, {
              title: t.title.trim(),
              track_number: n,
              audioFile: audioF,
              artworkFile: artF,
            });
            const cid = created.id?.trim();
            if (cid) {
              idMap.set(t.id, cid);
            }
          }
        }

        const msg =
          metaResult.message?.trim() ||
          artworkResult?.message?.trim() ||
          "Release updated successfully.";
        toast.success(msg);
        setCoverImageFile(null);
        setCoverImagePreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        setMetadata((m) => {
          let tracks = m.tracks;
          if (idMap.size > 0) {
            tracks = m.tracks.map((tr) => {
              const sid = idMap.get(tr.id);
              return sid ? { ...tr, id: sid, serverTrackId: sid } : tr;
            });
          }
          return { ...m, tracks, cover_image_file_name: "" };
        });
        try {
          const refreshed = await getRelease(editingId);
          const cover = resolveReleaseCoverDisplayUrl(refreshed);
          setExistingCoverImageUrl(cover ? withImageCacheBust(cover) : null);
        } catch {
          /* keep previous existingCoverImageUrl if refetch fails */
        }
      } else {
        const multipart = buildMultipartPayload();
        // 1) Create release — response must include `id` for the next step.
        const result = await createRelease(multipart);
        const newReleaseId = result.id?.trim();
        const hasTracksToSave = metadata.tracks.some((t) => t.title.trim().length > 0);
        // 2) POST /api/releases/:releaseId/tracks for each row (same order as UI).
        if (newReleaseId && hasTracksToSave) {
          for (let i = 0; i < metadata.tracks.length; i++) {
            const t = metadata.tracks[i];
            if (!t.title.trim()) continue;
            const audioF = pickAudioFileForTrack(t);
            const artF = pickArtworkFileForTrack(t);
            if (!audioF) {
              throw new Error(
                `Track "${t.title.trim()}" needs an audio file (same as Postman: multipart field "audio").`
              );
            }
            await createReleaseTrack(newReleaseId, {
              title: t.title,
              track_number: i + 1,
              audioFile: audioF,
              artworkFile: artF,
            });
          }
        } else if (hasTracksToSave && !newReleaseId) {
          toast.error(
            "Release was created but no release id was returned, so tracks were not saved."
          );
        } else {
          toast.success(
            result.message?.trim() ||
              (result.status === "draft"
                ? "Release created as draft."
                : "Release submitted successfully.")
          );
        }
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : editReleaseId?.trim()
            ? "Failed to update release"
            : "Failed to create release";
      toast.error(message);
    } finally {
      setSubmittingRelease(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "audio":
        return FileAudio;
      case "video":
        return Video;
      case "image":
        return ImageIcon;
      case "document":
        return FileText;
      default:
        return FileText;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case "audio":
        return "text-[#ff0050]";
      case "video":
        return "text-purple-500";
      case "image":
        return "text-blue-500";
      case "document":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  const isEditingRelease = Boolean(editReleaseId?.trim());
  const coverDisplaySrc = coverImagePreviewUrl || existingCoverImageUrl;

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {isEditingRelease ? "Edit release" : "Upload Content"}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {isEditingRelease
            ? "Update release details and save changes to the server."
            : "Upload audio, video, artwork, and supporting documents"}
        </p>
        {hydratingEdit && (
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            Loading release…
          </p>
        )}
      </div>

      {/* Upload Guidelines */}
      <Card className="border-[#ff0050]/20 bg-[#ff0050]/5">
        <CardContent className="pt-4 sm:pt-6 px-3.5 sm:px-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff0050] flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium text-sm sm:text-base">Upload Guidelines</h3>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li>• Audio: WAV or FLAC, 16-bit/44.1kHz minimum, 24-bit/96kHz recommended</li>
                <li>• Artwork: JPG or PNG, minimum 3000x3000px, RGB color space</li>
                <li>• Video: MP4 or MOV, H.264 codec, 1080p minimum</li>
                <li>• Documents: PDF format for licenses and contracts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Storage Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">234 GB / 500 GB</span>
                </div>
                <Progress value={46.8} className="h-2" />
              </div>
              <Button variant="outline" className="w-full" size="sm" onClick={() => setShowStorageModal(true)}>
                Upgrade Storage
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                Secure Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">End-to-end encryption</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Files encrypted during transfer
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Secure cloud storage</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Protected in enterprise-grade servers
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Automated backups</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Daily backups for data protection
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supported Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileAudio className="h-4 w-4 text-[#ff0050]" />
                    <span>Audio</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">WAV, FLAC</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-500" />
                    <span>Video</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">MP4, MOV</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                    <span>Images</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">JPG, PNG</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span>Documents</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">PDF</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Metadata Form */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Release Metadata</CardTitle>
            <CardDescription>Enter details about your release</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={metadata.title}
                  onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                  placeholder="Release title"
                />
              </div>
              <div>
                <Label htmlFor="version_title">Version title</Label>
                <Input
                  id="version_title"
                  value={metadata.version_title}
                  onChange={(e) => setMetadata({ ...metadata, version_title: e.target.value })}
                  placeholder="e.g. Deluxe Edition"
                />
              </div>
              <div>
                <Label htmlFor="primary_artist_name">Primary artist name</Label>
                <Input
                  id="primary_artist_name"
                  value={metadata.primary_artist_name}
                  onChange={(e) => setMetadata({ ...metadata, primary_artist_name: e.target.value })}
                  placeholder="Artist name"
                />
              </div>
              <div>
                <Label htmlFor="release_type">Release type</Label>
                <Select
                  value={metadata.release_type}
                  onValueChange={(value) => setMetadata({ ...metadata, release_type: value })}
                >
                  <SelectTrigger id="release_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="album">Album</SelectItem>
                    <SelectItem value="ep">EP</SelectItem>
                    <SelectItem value="compilation">Compilation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="upc">UPC</Label>
                <Input
                  id="upc"
                  value={metadata.upc}
                  onChange={(e) => setMetadata({ ...metadata, upc: e.target.value })}
                  placeholder="Universal Product Code"
                />
              </div>
              <div>
                <Label htmlFor="label_name">Label name</Label>
                <Input
                  id="label_name"
                  value={metadata.label_name}
                  onChange={(e) => setMetadata({ ...metadata, label_name: e.target.value })}
                  placeholder="Label"
                />
              </div>
              <div>
                <Label htmlFor="release_date">Release date</Label>
                <Input
                  id="release_date"
                  type="date"
                  value={metadata.release_date}
                  onChange={(e) => setMetadata({ ...metadata, release_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="original_release_date">Original release date</Label>
                <Input
                  id="original_release_date"
                  type="date"
                  value={metadata.original_release_date}
                  onChange={(e) => setMetadata({ ...metadata, original_release_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:items-stretch">
              <div className="flex flex-1 min-w-0 flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Label className="mb-0 shrink-0">Additional info</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={addAdditionalMetadataRow}
                      aria-label="Add metadata row"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={removeLastAdditionalMetadataRow}
                      aria-label="Remove last metadata row"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {metadata.additional_metadata.map((row, index) => (
                    <div
                      key={`additional-metadata-${index}`}
                      className="flex flex-col sm:flex-row gap-2 w-full min-w-0 items-stretch sm:items-center"
                    >
                      <Select
                        value={row.key ? row.key : METADATA_KEY_NONE}
                        onValueChange={(v) =>
                          updateAdditionalMetadataRow(index, {
                            key: v === METADATA_KEY_NONE ? "" : v,
                          })
                        }
                      >
                        <SelectTrigger
                          className="w-full sm:w-[160px] shrink-0"
                          aria-label={`Additional info key ${index + 1}`}
                        >
                          <SelectValue placeholder="Key" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={METADATA_KEY_NONE}>Select key</SelectItem>
                          {RELEASE_METADATA_KEY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={row.value}
                        onChange={(e) => updateAdditionalMetadataRow(index, { value: e.target.value })}
                        placeholder="Value"
                        className="flex-1 min-w-0"
                        aria-label={`Additional info value ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-1 min-w-0 flex-col gap-2">
                <Label>Cover image</Label>
                <p className="text-xs text-muted-foreground">JPG or PNG, minimum 3000×3000 px recommended</p>
                <div className="flex flex-col sm:flex-row gap-4 items-start flex-1">
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="cursor-pointer text-sm"
                      onChange={handleCoverImageChange}
                    />
                    {(metadata.cover_image_file_name || (existingCoverImageUrl && !coverImageFile)) && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate max-w-[240px]">
                          {metadata.cover_image_file_name || "Current artwork (from catalog)"}
                        </span>
                        {metadata.cover_image_file_name ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 shrink-0"
                            onClick={clearCoverImage}
                          >
                            Remove
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>
                  {coverDisplaySrc && (
                    <div className="relative h-32 w-32 rounded-lg border overflow-hidden bg-muted shrink-0 mx-auto sm:mx-0">
                      <img src={coverDisplaySrc} alt="Cover preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tracks */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tracks</h3>

              <div className="space-y-4">
                {metadata.tracks.map((track, index) => (
                  <div key={track.id} className="rounded-lg border bg-card p-4 space-y-3">
                    {/* Track Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Track {index + 1}
                      </span>
                      {metadata.tracks.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeTrack(track.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Track Title - Full Width */}
                    <div className="w-full">
                      <Label htmlFor={`track-title-${track.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                        Title
                      </Label>
                      <Input
                        id={`track-title-${track.id}`}
                        value={track.title}
                        onChange={(e) => updateTrack(track.id, "title", e.target.value)}
                        placeholder="Enter track title"
                        className="w-full"
                      />
                    </div>

                    {/* ISRC & Duration - 2 Column on Mobile */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`track-isrc-${track.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                          ISRC
                        </Label>
                        <Input
                          id={`track-isrc-${track.id}`}
                          value={track.isrc}
                          onChange={(e) => updateTrack(track.id, "isrc", e.target.value)}
                          placeholder="ISRC code"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`track-duration-${track.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                          Duration
                        </Label>
                        <Input
                          id={`track-duration-${track.id}`}
                          value={track.duration}
                          onChange={(e) => updateTrack(track.id, "duration", e.target.value)}
                          placeholder="3:45"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Explicit & Genre - 2 Column on Mobile, Better on Desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`track-explicit-${track.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                          Content Rating
                        </Label>
                        <Select
                          value={track.explicit ? "true" : "false"}
                          onValueChange={(value) => updateTrack(track.id, "explicit", value === "true")}
                        >
                          <SelectTrigger id={`track-explicit-${track.id}`} className="w-full">
                            <SelectValue>{track.explicit ? "Explicit" : "Clean"}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Explicit</SelectItem>
                            <SelectItem value="false">Clean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`track-genre-${track.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                          Genre
                        </Label>
                        <Select
                          value={track.genre}
                          onValueChange={(value) => updateTrack(track.id, "genre", value)}
                        >
                          <SelectTrigger id={`track-genre-${track.id}`} className="w-full">
                            <SelectValue>{track.genre}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pop">Pop</SelectItem>
                            <SelectItem value="rock">Rock</SelectItem>
                            <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                            <SelectItem value="indie">Indie</SelectItem>
                            <SelectItem value="electronic">Electronic</SelectItem>
                            <SelectItem value="country">Country</SelectItem>
                            <SelectItem value="jazz">Jazz</SelectItem>
                            <SelectItem value="classical">Classical</SelectItem>
                            <SelectItem value="r&b">R&B</SelectItem>
                            <SelectItem value="latin">Latin</SelectItem>
                            <SelectItem value="folk">Folk</SelectItem>
                            <SelectItem value="metal">Metal</SelectItem>
                            <SelectItem value="punk">Punk</SelectItem>
                            <SelectItem value="reggae">Reggae</SelectItem>
                            <SelectItem value="soul">Soul</SelectItem>
                            <SelectItem value="blues">Blues</SelectItem>
                            <SelectItem value="world">World</SelectItem>
                            <SelectItem value="alternative">Alternative</SelectItem>
                            <SelectItem value="funk">Funk</SelectItem>
                            <SelectItem value="disco">Disco</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="techno">Techno</SelectItem>
                            <SelectItem value="trap">Trap</SelectItem>
                            <SelectItem value="drum-and-bass">Drum and Bass</SelectItem>
                            <SelectItem value="ambient">Ambient</SelectItem>
                            <SelectItem value="experimental">Experimental</SelectItem>
                            <SelectItem value="soundtrack">Soundtrack</SelectItem>
                            <SelectItem value="spoken-word">Spoken Word</SelectItem>
                            <SelectItem value="children">Children</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                            <SelectItem value="new-age">New Age</SelectItem>
                            <SelectItem value="religious">Religious</SelectItem>
                            <SelectItem value="comedy">Comedy</SelectItem>
                            <SelectItem value="drama">Drama</SelectItem>
                            <SelectItem value="documentary">Documentary</SelectItem>
                            <SelectItem value="sound-effects">Sound Effects</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Upload Files — scoped to this track */}
                    <div className="pt-4 mt-1 border-t border-border space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Upload Files</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Drag and drop or browse — attach files to this track
                        </p>
                      </div>
                      <Tabs defaultValue="all" className="w-full">
                        <TabsList className="flex w-full overflow-x-auto sm:grid sm:grid-cols-5 gap-2 scrollbar-hide h-auto">
                          <TabsTrigger value="all" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm">
                            All
                          </TabsTrigger>
                          <TabsTrigger value="audio" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm">
                            Audio
                          </TabsTrigger>
                          <TabsTrigger value="video" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm">
                            Video
                          </TabsTrigger>
                          <TabsTrigger value="artwork" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm">
                            Artwork
                          </TabsTrigger>
                          <TabsTrigger value="docs" className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm">
                            Docs
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-3 space-y-3">
                          <input
                            type="file"
                            multiple
                            hidden
                            tabIndex={-1}
                            id={`track-files-${track.id}`}
                            accept="audio/*,video/*,image/*,.pdf,.doc,.docx,application/pdf"
                            onChange={(e) => {
                              addFilesToTrack(track.id, e.target.files);
                              e.target.value = "";
                            }}
                          />
                          <div
                            className={cn(
                              "border-2 border-dashed rounded-lg p-6 sm:p-8 transition-colors",
                              dragTrackId === track.id
                                ? "border-[#ff0050] bg-[#ff0050]/5"
                                : "border-border hover:border-[#ff0050]/50 hover:bg-muted/50"
                            )}
                            onDragEnter={() => setDragTrackId(track.id)}
                            onDragLeave={() => setDragTrackId((id) => (id === track.id ? null : id))}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragTrackId(null);
                              addFilesToTrack(track.id, e.dataTransfer.files);
                            }}
                          >
                            <div
                              role="presentation"
                              className="flex flex-col items-center justify-center text-center"
                              onClick={() =>
                                document.getElementById(`track-files-${track.id}`)?.click()
                              }
                            >
                              <div className="h-12 w-12 rounded-full bg-[#ff0050]/10 flex items-center justify-center mb-3">
                                <Upload className="h-6 w-6 text-[#ff0050]" />
                              </div>
                              <p className="text-sm font-medium mb-1">Drop files here</p>
                              <p className="text-xs text-muted-foreground mb-3">
                                or click to browse from your computer
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                className="bg-[#ff0050] hover:bg-[#cc0040] text-white pointer-events-none"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Browse Files
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {track.files.map((file) => {
                              const Icon = getFileIcon(file.type);
                              const colorClass = getFileColor(file.type);
                              return (
                                <div
                                  key={file.id}
                                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border bg-background/80 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                    <Icon className={cn("h-4 w-4", colorClass)} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                      <p className="text-xs font-medium truncate">{file.name}</p>
                                      <span className="text-xs text-muted-foreground flex-shrink-0">{file.size}</span>
                                    </div>
                                    {file.status === "uploading" && (
                                      <div className="space-y-1">
                                        <Progress value={file.progress} className="h-1" />
                                        <p className="text-[10px] text-muted-foreground">Uploading... {file.progress}%</p>
                                      </div>
                                    )}
                                    {file.status === "complete" && (
                                      <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        <span className="text-[10px] text-green-500">Complete</span>
                                      </div>
                                    )}
                                    {file.status === "error" && (
                                      <div className="flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 text-[#ff0050]" />
                                        <span className="text-[10px] text-[#ff0050]">Failed</span>
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 flex-shrink-0"
                                    onClick={() =>
                                      setTrackFiles(
                                        track.id,
                                        track.files.filter((f) => f.id !== file.id)
                                      )
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>

                        <TabsContent value="audio" className="mt-3">
                          {track.files.filter((f) => f.type === "audio").length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              <FileAudio className="h-10 w-10 mx-auto mb-2 opacity-50" />
                              <p>No audio files for this track</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {track.files
                                .filter((f) => f.type === "audio")
                                .map((file) => {
                                  const Icon = getFileIcon(file.type);
                                  const colorClass = getFileColor(file.type);
                                  return (
                                    <div
                                      key={file.id}
                                      className="flex items-center gap-2 p-2.5 rounded-lg border bg-background/80"
                                    >
                                      <Icon className={cn("h-4 w-4 flex-shrink-0", colorClass)} />
                                      <span className="text-xs font-medium truncate flex-1">{file.name}</span>
                                      <span className="text-xs text-muted-foreground">{file.size}</span>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="video" className="mt-3">
                          {track.files.filter((f) => f.type === "video").length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              <Video className="h-10 w-10 mx-auto mb-2 opacity-50" />
                              <p>No video files for this track</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {track.files
                                .filter((f) => f.type === "video")
                                .map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center gap-2 p-2.5 rounded-lg border bg-background/80 text-xs"
                                  >
                                    <Video className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                    <span className="font-medium truncate flex-1">{file.name}</span>
                                    <span className="text-muted-foreground">{file.size}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="artwork" className="mt-3">
                          {track.files.filter((f) => f.type === "image").length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                              <p>No artwork for this track</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {track.files
                                .filter((f) => f.type === "image")
                                .map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center gap-2 p-2.5 rounded-lg border bg-background/80 text-xs"
                                  >
                                    <ImageIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                    <span className="font-medium truncate flex-1">{file.name}</span>
                                    <span className="text-muted-foreground">{file.size}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="docs" className="mt-3">
                          {track.files.filter((f) => f.type === "document").length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                              <p>No documents for this track</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {track.files
                                .filter((f) => f.type === "document")
                                .map((file) => (
                                  <div
                                    key={file.id}
                                    className="flex items-center gap-2 p-2.5 rounded-lg border bg-background/80 text-xs"
                                  >
                                    <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    <span className="font-medium truncate flex-1">{file.name}</span>
                                    <span className="text-muted-foreground">{file.size}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={addTrack}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Track
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit for Review / Save */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{isEditingRelease ? "Save changes" : "Submit for Review"}</CardTitle>
              <CardDescription>
                {isEditingRelease
                  ? "Send your updates to the server."
                  : "Finalize and submit your release"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={submitForReview}
              disabled={submittingRelease || hydratingEdit}
              className="w-full sm:w-auto sm:flex-shrink-0"
            >
              {submittingRelease ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Cloud className="h-4 w-4 mr-2" />
              )}
              {isEditingRelease ? "Save changes" : "Submit for Review"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isEditingRelease
                ? "Your changes are saved to this release when you click Save changes."
                : "Once you submit your release, it will be reviewed by our team. You will receive an email notification once your release is approved."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Storage Upgrade Modal */}
      <Dialog open={showStorageModal} onOpenChange={setShowStorageModal}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Upgrade Your Storage</DialogTitle>
            <DialogDescription>
              Choose the perfect plan for your content library
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {/* Pro Plan */}
            <div
              className={cn(
                "relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg",
                selectedPlan === "pro"
                  ? "border-[#ff0050] bg-[#ff0050]/5"
                  : "border-border hover:border-[#ff0050]/50"
              )}
              onClick={() => setSelectedPlan("pro")}
            >
              <div className="absolute top-4 right-4">
                {selectedPlan === "pro" && (
                  <div className="h-6 w-6 rounded-full bg-[#ff0050] flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Pro</h3>
                  <p className="text-sm text-muted-foreground">For growing artists</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold">1 TB</p>
                <p className="text-sm text-muted-foreground mt-1">Storage capacity</p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Up to 500 releases</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Hi-res audio support</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Priority upload speed</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>90-day version history</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-2xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </div>
            </div>

            {/* Premium Plan - Popular */}
            <div
              className={cn(
                "relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg",
                selectedPlan === "premium"
                  ? "border-[#ff0050] bg-[#ff0050]/5"
                  : "border-[#ff0050] bg-[#ff0050]/5"
              )}
              onClick={() => setSelectedPlan("premium")}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#ff0050] text-white">Most Popular</Badge>
              </div>

              <div className="absolute top-4 right-4">
                {selectedPlan === "premium" && (
                  <div className="h-6 w-6 rounded-full bg-[#ff0050] flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="h-10 w-10 rounded-lg bg-[#ff0050]/20 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-[#ff0050]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Premium</h3>
                  <p className="text-sm text-muted-foreground">For professionals</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold">3 TB</p>
                <p className="text-sm text-muted-foreground mt-1">Storage capacity</p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited releases</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Hi-res & immersive audio</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Ultra-fast upload (5x)</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>1-year version history</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-2xl font-bold">$79<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div
              className={cn(
                "relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg",
                selectedPlan === "enterprise"
                  ? "border-[#ff0050] bg-[#ff0050]/5"
                  : "border-border hover:border-[#ff0050]/50"
              )}
              onClick={() => setSelectedPlan("enterprise")}
            >
              <div className="absolute top-4 right-4">
                {selectedPlan === "enterprise" && (
                  <div className="h-6 w-6 rounded-full bg-[#ff0050] flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Enterprise</h3>
                  <p className="text-sm text-muted-foreground">For labels & teams</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold">10 TB</p>
                <p className="text-sm text-muted-foreground mt-1">Storage capacity</p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited everything</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>All audio formats</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Maximum upload speed</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited version history</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Dedicated support</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Custom integrations</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-2xl font-bold">$199<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowStorageModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto bg-[#ff0050] hover:bg-[#cc0040]"
              disabled={!selectedPlan}
              onClick={() => {
                if (selectedPlan) {
                  const planDetails = {
                    pro: { storage: 1000, name: "Pro" },
                    premium: { storage: 3000, name: "Premium" },
                    enterprise: { storage: 10000, name: "Enterprise" },
                  };
                  const plan = planDetails[selectedPlan];
                  setCurrentStorage(plan.storage);
                  setShowStorageModal(false);
                  toast.success(`Successfully upgraded to ${plan.name} plan! You now have ${plan.storage / 1000} TB of storage.`);
                  setSelectedPlan(null);
                }
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Upgrade to {selectedPlan ? selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) : "Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
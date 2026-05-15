export type VideoReleaseType =
  | "music_video"
  | "lyric_video"
  | "visualizer"
  | "live_session";

export type VideoVisibility =
  | "public"
  | "unlisted_youtube"
  | "unlisted_vevo"
  | "unlisted_both";

export type VideoContributorGroup = "artists" | "production" | "technical";

export type ProxyPipelineStep =
  | "upload_original"
  | "store_r2"
  | "generate_thumbnail"
  | "generate_720p"
  | "generate_preview"
  | "stream_proxy";

export type ProxyStepStatus = "pending" | "active" | "complete" | "error";

export interface VideoContributor {
  id: string;
  name: string;
  roles: string[];
  group: VideoContributorGroup;
}

export interface VideoUploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: "queued" | "uploading" | "complete" | "error";
  resolution?: string;
  durationSec?: number;
  error?: string;
}

export interface VideoReleaseFormState {
  releaseTitle: string;
  versionTitle: string;
  mainPrimaryArtist: string;
  releaseType: VideoReleaseType | "";
  labelName: string;
  upc: string;
  upcAutoGenerate: boolean;

  vevoChannel: string;
  vevoChannelSaved: boolean;

  madeForKids: boolean | null;
  explicit: boolean | null;
  repertoireOwner: string;
  labelRepCountry: string;

  previouslyReleased: boolean;
  releaseTiming: "asap" | "date";
  releaseDate: string;
  originalReleaseDate: string;

  videoTitle: string;
  primaryArtists: string[];
  featuredArtists: string[];
  genres: string[];
  description: string;
  keywords: string[];

  videoAssetId: string;
  existingYoutubeUrl: string;
  existingYoutubeVideoId: string;
  existingYoutubeAssetId: string;

  visibility: VideoVisibility;
  wantsPremiere: boolean;
  premiereDate: string;
  premiereTime: string;
  premiereTimezone: string;

  officialChannelUrl: string;
}

export const VIDEO_RELEASE_TYPE_LABELS: Record<VideoReleaseType, string> = {
  music_video: "Music Video",
  lyric_video: "Lyric Video",
  visualizer: "Visualizer",
  live_session: "Live Session",
};

export const PROXY_PIPELINE: { id: ProxyPipelineStep; label: string }[] = [
  { id: "upload_original", label: "Upload original video" },
  { id: "store_r2", label: "Store in Cloudflare R2" },
  { id: "generate_thumbnail", label: "Generate thumbnail" },
  { id: "generate_720p", label: "Generate 720p proxy" },
  { id: "generate_preview", label: "Generate preview clip" },
  { id: "stream_proxy", label: "Stream proxy only" },
];

export const VIDEO_DRAFT_STORAGE_KEY = "cageriot:video-release-draft-v1";

export const DEFAULT_VIDEO_FORM: VideoReleaseFormState = {
  releaseTitle: "",
  versionTitle: "",
  mainPrimaryArtist: "",
  releaseType: "",
  labelName: "",
  upc: "",
  upcAutoGenerate: true,

  vevoChannel: "",
  vevoChannelSaved: false,

  madeForKids: null,
  explicit: null,
  repertoireOwner: "",
  labelRepCountry: "",

  previouslyReleased: false,
  releaseTiming: "asap",
  releaseDate: "",
  originalReleaseDate: "",

  videoTitle: "",
  primaryArtists: [],
  featuredArtists: [],
  genres: [],
  description: "",
  keywords: [],

  videoAssetId: "",
  existingYoutubeUrl: "",
  existingYoutubeVideoId: "",
  existingYoutubeAssetId: "",

  visibility: "public",
  wantsPremiere: false,
  premiereDate: "",
  premiereTime: "",
  premiereTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",

  officialChannelUrl: "",
};

export type VideoStepId =
  | "setup"
  | "vevo"
  | "compliance"
  | "timing"
  | "metadata"
  | "assets"
  | "thumbnail"
  | "video-upload"
  | "proxy"
  | "contributors"
  | "visibility"
  | "channel"
  | "review";

export interface VideoStepConfig {
  id: VideoStepId;
  label: string;
  shortLabel: string;
}

export const VIDEO_WORKFLOW_STEPS: VideoStepConfig[] = [
  { id: "setup", label: "Video release setup", shortLabel: "Setup" },
  { id: "vevo", label: "VEVO channel", shortLabel: "VEVO" },
  { id: "compliance", label: "Compliance", shortLabel: "Compliance" },
  { id: "timing", label: "Release timing", shortLabel: "Timing" },
  { id: "metadata", label: "Video metadata", shortLabel: "Metadata" },
  { id: "assets", label: "Asset linking", shortLabel: "Assets" },
  { id: "thumbnail", label: "Thumbnail", shortLabel: "Thumbnail" },
  { id: "video-upload", label: "Video file", shortLabel: "Video" },
  { id: "proxy", label: "Proxy processing", shortLabel: "Processing" },
  { id: "contributors", label: "Contributors", shortLabel: "Contributors" },
  { id: "visibility", label: "Visibility & premiere", shortLabel: "Visibility" },
  { id: "channel", label: "Official channel", shortLabel: "Channel" },
  { id: "review", label: "Review & submit", shortLabel: "Review" },
];

export const MOCK_SAVED_VEVO_CHANNEL = "ArtistNameVEVO";

export const CONTRIBUTOR_ROLE_SUGGESTIONS: Record<VideoContributorGroup, string[]> = {
  artists: ["Primary Artist", "Featured Artist", "Director", "Choreographer"],
  production: ["Producer", "Director", "Editor", "Colorist"],
  technical: ["Camera Operator", "Sound Engineer", "VFX Artist", "Mastering"],
};

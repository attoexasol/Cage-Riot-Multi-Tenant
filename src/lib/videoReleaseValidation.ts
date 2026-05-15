import type { VideoReleaseFormState, VideoStepId } from "@/lib/videoReleaseTypes";

export interface VideoMediaState {
  thumbnailFile: File | null;
  thumbnailPreviewUrl: string | null;
  thumbnailWidth: number | null;
  thumbnailHeight: number | null;
  thumbnailError: string | null;
  videoFile: File | null;
  videoError: string | null;
  videoResolution: string | null;
  videoDurationSec: number | null;
  proxyReady: boolean;
}

const VEVO_SUFFIX = "VEVO";
const VEVO_MAX_LEN = 20;
const THUMB_MIN_W = 1280;
const THUMB_MIN_H = 720;
const DESC_MAX = 5000;
const KEYWORD_MAX = 500;

export function validateVevoChannel(value: string): string | null {
  const v = value.trim();
  if (!v) return "VEVO channel name is required.";
  if (v.length > VEVO_MAX_LEN) return `Must be ${VEVO_MAX_LEN} characters or fewer.`;
  if (/\s/.test(v)) return "No spaces allowed.";
  if (!/^[a-zA-Z0-9]+$/.test(v)) return "Letters and numbers only — no special characters.";
  if (!v.toUpperCase().endsWith(VEVO_SUFFIX)) return `Channel name must end with "${VEVO_SUFFIX}".`;
  return null;
}

export function validateYoutubeUrl(url: string): string | null {
  if (!url.trim()) return null;
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes("youtube.com") && !u.hostname.includes("youtu.be")) {
      return "Enter a valid YouTube link.";
    }
  } catch {
    return "Enter a valid YouTube link.";
  }
  return null;
}

export type VideoFieldErrors = Record<string, string>;
export type VideoStepErrors = Partial<Record<VideoStepId, number>>;

export function buildVideoValidation(
  form: VideoReleaseFormState,
  media: VideoMediaState
): { errors: VideoFieldErrors; stepErrors: VideoStepErrors; blocking: string[] } {
  const errors: VideoFieldErrors = {};
  const stepErrors: VideoStepErrors = {};
  const blocking: string[] = [];

  const bump = (step: VideoStepId) => {
    stepErrors[step] = (stepErrors[step] ?? 0) + 1;
  };

  if (!form.releaseTitle.trim()) {
    errors.releaseTitle = "Video release title is required.";
    bump("setup");
  }
  if (!form.mainPrimaryArtist.trim()) {
    errors.mainPrimaryArtist = "Main primary artist is required.";
    bump("setup");
  }
  if (!form.releaseType) {
    errors.releaseType = "Choose a release type.";
    bump("setup");
  }
  if (!form.upcAutoGenerate && !form.upc.trim()) {
    errors.upc = "Enter a UPC or enable auto-generate.";
    bump("setup");
  }

  const vevoErr = validateVevoChannel(form.vevoChannel);
  if (vevoErr) {
    errors.vevoChannel = vevoErr;
    bump("vevo");
  }

  if (form.madeForKids === null) {
    errors.madeForKids = "Select whether this video is made for kids.";
    bump("compliance");
  }
  if (form.explicit === null) {
    errors.explicit = "Select explicit content status.";
    bump("compliance");
  }

  if (!form.previouslyReleased) {
    if (form.releaseTiming === "date" && !form.releaseDate.trim()) {
      errors.releaseDate = "Choose a release date.";
      bump("timing");
      blocking.push("Missing release date");
    }
  } else if (!form.originalReleaseDate.trim()) {
    errors.originalReleaseDate = "Original release date is required.";
    bump("timing");
  }

  if (!form.videoTitle.trim()) {
    errors.videoTitle = "Video title is required.";
    bump("metadata");
  }
  if (form.primaryArtists.length === 0) {
    errors.primaryArtists = "Add at least one primary artist.";
    bump("metadata");
  }
  if (form.genres.length === 0) {
    errors.genres = "Select at least one genre.";
    bump("metadata");
  }
  if (form.description.length > DESC_MAX) {
    errors.description = `Description must be ${DESC_MAX} characters or fewer.`;
    bump("metadata");
  }
  const kwLen = form.keywords.join(", ").length;
  if (kwLen > KEYWORD_MAX) {
    errors.keywords = `Keywords must be ${KEYWORD_MAX} characters total.`;
    bump("metadata");
  }

  if (!form.videoAssetId.trim()) {
    errors.videoAssetId = "Video asset ID is required.";
    bump("assets");
  }
  const ytUrlErr = validateYoutubeUrl(form.existingYoutubeUrl);
  if (ytUrlErr) {
    errors.existingYoutubeUrl = ytUrlErr;
    bump("assets");
  }

  if (!media.thumbnailFile && !media.thumbnailPreviewUrl) {
    errors.thumbnail = "Thumbnail artwork is required.";
    bump("thumbnail");
    blocking.push("Missing thumbnail");
  } else if (media.thumbnailError) {
    errors.thumbnail = media.thumbnailError;
    bump("thumbnail");
    blocking.push("Invalid thumbnail size");
  } else if (
    media.thumbnailWidth != null &&
    media.thumbnailHeight != null &&
    (media.thumbnailWidth < THUMB_MIN_W || media.thumbnailHeight < THUMB_MIN_H)
  ) {
    errors.thumbnail = `Minimum size ${THUMB_MIN_W}×${THUMB_MIN_H}px.`;
    bump("thumbnail");
    blocking.push("Invalid thumbnail size");
  }

  if (!media.videoFile) {
    errors.videoFile = "Upload your master video file.";
    bump("video-upload");
    blocking.push("Missing video");
  } else if (media.videoError) {
    errors.videoFile = media.videoError;
    bump("video-upload");
    blocking.push("Invalid video format");
  }

  if (form.wantsPremiere) {
    if (!form.premiereDate.trim()) {
      errors.premiereDate = "Premiere date is required.";
      bump("visibility");
      blocking.push("Invalid premiere setup");
    }
    if (!form.premiereTime.trim()) {
      errors.premiereTime = "Premiere time is required.";
      bump("visibility");
      blocking.push("Invalid premiere setup");
    }
  }

  return { errors, stepErrors, blocking: [...new Set(blocking)] };
}

export function isVideoFormValid(
  form: VideoReleaseFormState,
  media: VideoMediaState
): boolean {
  const { errors } = buildVideoValidation(form, media);
  return Object.keys(errors).length === 0;
}

export function generateUpc(): string {
  const base = String(Math.floor(100000000000 + Math.random() * 900000000000));
  return base.slice(0, 12);
}

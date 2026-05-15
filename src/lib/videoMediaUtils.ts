const THUMB_MIN_W = 1280;
const THUMB_MIN_H = 720;

export async function readImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };
    img.src = url;
  });
}

export function validateThumbnailDimensions(width: number, height: number): string | null {
  if (width < THUMB_MIN_W || height < THUMB_MIN_H) {
    return `Thumbnail must be at least ${THUMB_MIN_W}×${THUMB_MIN_H}px (yours: ${width}×${height}).`;
  }
  return null;
}

export function isAcceptedThumbnail(file: File): boolean {
  return file.type === "image/jpeg" || file.type === "image/png";
}

export function validateVideoFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".mp4") && file.type !== "video/mp4") {
    return "Upload an MP4 file (H.264 video with AAC audio).";
  }
  if (file.size > 8 * 1024 * 1024 * 1024) {
    return "File exceeds 8 GB limit.";
  }
  return null;
}

export async function readVideoMetadata(
  file: File
): Promise<{ durationSec: number; resolution: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      URL.revokeObjectURL(url);
      resolve({
        durationSec: Math.round(video.duration),
        resolution: w && h ? `${w}×${h}` : "—",
      });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video metadata."));
    };
    video.src = url;
  });
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

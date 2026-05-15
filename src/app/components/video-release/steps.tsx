import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Textarea } from "@/app/components/ui/textarea";
import { Progress } from "@/app/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  Film,
  ImageIcon,
  Loader2,
  Pencil,
  Play,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { FieldError, TagInput, DropSurface, SectionLabel } from "@/app/components/video-release/shared";
import {
  CONTRIBUTOR_ROLE_SUGGESTIONS,
  MOCK_SAVED_VEVO_CHANNEL,
  PROXY_PIPELINE,
  VIDEO_RELEASE_TYPE_LABELS,
  type ProxyPipelineStep,
  type ProxyStepStatus,
  type VideoContributor,
  type VideoContributorGroup,
  type VideoReleaseFormState,
  type VideoReleaseType,
  type VideoStepId,
} from "@/lib/videoReleaseTypes";
import type { VideoFieldErrors } from "@/lib/videoReleaseValidation";
import { formatDuration } from "@/lib/videoMediaUtils";

const GENRE_OPTIONS = ["Pop", "Hip-Hop", "R&B", "Rock", "Electronic", "Latin", "Country", "Alternative"];
const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "UTC",
];
const MOCK_CONTRIBUTORS = ["Alex Rivera", "Jordan Blake", "Maya Chen", "Studio North", "Visual Labs"];

function ArtistMultiField({
  label,
  value,
  onChange,
  placeholder,
  error,
  invalid,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  error?: string;
  invalid?: boolean;
}) {
  const [draft, setDraft] = React.useState("");
  const add = () => {
    const t = draft.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  };
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
        {value.map((a) => (
          <Badge key={a} variant="outline" className="gap-1 pr-1">
            {a}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== a))}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          aria-invalid={invalid}
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          Add
        </Button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

export interface VideoStepContext {
  form: VideoReleaseFormState;
  patch: (p: Partial<VideoReleaseFormState>) => void;
  showErr: (key: string) => string | false | undefined;
  vevoEditing: boolean;
  setVevoEditing: (v: boolean) => void;
  thumbnailPreview: string | null;
  thumbW: number | null;
  thumbH: number | null;
  thumbInlineError: string | null;
  thumbDrag: boolean;
  setThumbDrag: (v: boolean) => void;
  thumbInputRef: React.RefObject<HTMLInputElement | null>;
  onThumbnail: (f: File) => void;
  clearThumbnail: () => void;
  videoFile: File | null;
  videoError: string | null;
  videoResolution: string | null;
  videoDurationSec: number | null;
  uploadProgress: number;
  uploadComplete: boolean;
  videoDrag: boolean;
  setVideoDrag: (v: boolean) => void;
  videoInputRef: React.RefObject<HTMLInputElement | null>;
  onVideo: (f: File) => void;
  clearVideo: () => void;
  proxyStatuses: Record<ProxyPipelineStep, ProxyStepStatus>;
  proxyReady: boolean;
  proxyPreviewUrl: string | null;
  contributors: VideoContributor[];
  setContributors: React.Dispatch<React.SetStateAction<VideoContributor[]>>;
  contributorSearch: string;
  setContributorSearch: (v: string) => void;
  newContributorName: string;
  setNewContributorName: (v: string) => void;
  newContributorGroup: VideoContributorGroup;
  setNewContributorGroup: (v: VideoContributorGroup) => void;
  newContributorRoles: string[];
  setNewContributorRoles: (v: string[]) => void;
  validationAttempt: boolean;
  fieldErrors: VideoFieldErrors;
  blockingIssues: string[];
  generateUpc: () => string;
}

export function VideoReleaseStepPanel({ step, ctx }: { step: VideoStepId; ctx: VideoStepContext }) {
  const { form, patch, showErr } = ctx;

  switch (step) {
    case "setup":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-[#ff0050]" />
              Video release setup
            </CardTitle>
            <CardDescription>Foundation details for your video release across VEVO and YouTube.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vr-title">Video release title *</Label>
                <Input
                  id="vr-title"
                  value={form.releaseTitle}
                  onChange={(e) => patch({ releaseTitle: e.target.value })}
                  placeholder="e.g. Midnight Drive (Official Video)"
                  aria-invalid={!!showErr("releaseTitle")}
                />
                <FieldError message={showErr("releaseTitle")} />
              </div>
              <div>
                <Label htmlFor="vr-version">Version title</Label>
                <Input
                  id="vr-version"
                  value={form.versionTitle}
                  onChange={(e) => patch({ versionTitle: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="vr-artist">Main primary artist *</Label>
                <Input
                  id="vr-artist"
                  value={form.mainPrimaryArtist}
                  onChange={(e) => patch({ mainPrimaryArtist: e.target.value })}
                  aria-invalid={!!showErr("mainPrimaryArtist")}
                />
                <FieldError message={showErr("mainPrimaryArtist")} />
              </div>
              <div>
                <Label>Release type *</Label>
                <Select
                  value={form.releaseType || undefined}
                  onValueChange={(v) => patch({ releaseType: v as VideoReleaseType })}
                >
                  <SelectTrigger aria-invalid={!!showErr("releaseType")}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(VIDEO_RELEASE_TYPE_LABELS) as VideoReleaseType[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {VIDEO_RELEASE_TYPE_LABELS[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={showErr("releaseType")} />
              </div>
              <div>
                <Label htmlFor="vr-label">Label name</Label>
                <Input id="vr-label" value={form.labelName} onChange={(e) => patch({ labelName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="vr-upc">UPC</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="vr-upc"
                    value={form.upc}
                    disabled={form.upcAutoGenerate}
                    onChange={(e) => patch({ upc: e.target.value })}
                    aria-invalid={!!showErr("upc")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!form.upcAutoGenerate}
                    onClick={() => patch({ upc: ctx.generateUpc() })}
                  >
                    Generate
                  </Button>
                </div>
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <Checkbox
                    checked={form.upcAutoGenerate}
                    onCheckedChange={(c) => {
                      const on = c === true;
                      patch({ upcAutoGenerate: on, upc: on ? ctx.generateUpc() : form.upc });
                    }}
                  />
                  Auto-generate UPC
                </label>
                <FieldError message={showErr("upc")} />
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case "vevo":
      return (
        <Card>
          <CardHeader>
            <CardTitle>VEVO channel settings</CardTitle>
            <CardDescription>Your official VEVO channel name shown to fans on VEVO.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.vevoChannelSaved && !ctx.vevoEditing ? (
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{form.vevoChannel || MOCK_SAVED_VEVO_CHANNEL}</p>
                  <p className="text-xs text-muted-foreground mt-1">Saved on your artist profile</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => ctx.setVevoEditing(true)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="vevo-ch">VEVO channel name *</Label>
                  <Input
                    id="vevo-ch"
                    value={form.vevoChannel}
                    onChange={(e) => patch({ vevoChannel: e.target.value.replace(/\s/g, "") })}
                    placeholder="ArtistNameVEVO"
                    maxLength={20}
                    aria-invalid={!!showErr("vevoChannel")}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Must end with <strong>VEVO</strong>, max 20 characters, letters and numbers only.
                  </p>
                  <FieldError message={showErr("vevoChannel")} />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    patch({ vevoChannelSaved: true });
                    ctx.setVevoEditing(false);
                  }}
                >
                  Save as my VEVO channel
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      );

    case "compliance":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#ff0050]" />
              Video compliance
            </CardTitle>
            <CardDescription>Required for YouTube and VEVO delivery.</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Made for kids? *</Label>
              <RadioGroup
                value={form.madeForKids === null ? "" : form.madeForKids ? "yes" : "no"}
                onValueChange={(v) => patch({ madeForKids: v === "yes" })}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="yes" />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="no" />
                  No
                </label>
              </RadioGroup>
              <FieldError message={showErr("madeForKids")} />
            </div>
            <div className="space-y-3">
              <Label>Explicit content? *</Label>
              <RadioGroup
                value={form.explicit === null ? "" : form.explicit ? "yes" : "no"}
                onValueChange={(v) => patch({ explicit: v === "yes" })}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="yes" />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="no" />
                  No
                </label>
              </RadioGroup>
              <FieldError message={showErr("explicit")} />
            </div>
            <div>
              <Label htmlFor="rep-owner">Repertoire owner / label</Label>
              <Input
                id="rep-owner"
                value={form.repertoireOwner}
                onChange={(e) => patch({ repertoireOwner: e.target.value })}
              />
            </div>
            <div>
              <Label>Label representative country</Label>
              <Select value={form.labelRepCountry || undefined} onValueChange={(v) => patch({ labelRepCountry: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {["US", "GB", "CA", "AU", "DE", "FR", "JP", "BR"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      );

    case "timing":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Release timing</CardTitle>
            <CardDescription>When should this video go live?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.previouslyReleased}
                onCheckedChange={(c) => patch({ previouslyReleased: c === true })}
              />
              Previously released (catalog transfer)
            </label>
            {!form.previouslyReleased ? (
              <RadioGroup
                value={form.releaseTiming}
                onValueChange={(v) => patch({ releaseTiming: v as "asap" | "date" })}
                className="space-y-3"
              >
                <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/30">
                  <RadioGroupItem value="asap" />
                  <span className="text-sm font-medium">As soon as possible</span>
                </label>
                <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/30">
                  <RadioGroupItem value="date" />
                  <span className="text-sm font-medium">Select date</span>
                </label>
              </RadioGroup>
            ) : null}
            {!form.previouslyReleased && form.releaseTiming === "date" && (
              <div>
                <Label htmlFor="rel-date">Release date *</Label>
                <Input
                  id="rel-date"
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => patch({ releaseDate: e.target.value })}
                  aria-invalid={!!showErr("releaseDate")}
                />
                <FieldError message={showErr("releaseDate")} />
              </div>
            )}
            {form.previouslyReleased && (
              <div>
                <Label htmlFor="orig-date">Original release date *</Label>
                <Input
                  id="orig-date"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={form.originalReleaseDate}
                  onChange={(e) => patch({ originalReleaseDate: e.target.value })}
                  aria-invalid={!!showErr("originalReleaseDate")}
                />
                <p className="text-xs text-muted-foreground mt-1">Future scheduling is disabled for catalog transfers.</p>
                <FieldError message={showErr("originalReleaseDate")} />
              </div>
            )}
          </CardContent>
        </Card>
      );

    case "metadata":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Video metadata</CardTitle>
            <CardDescription>How your video appears on YouTube and partner platforms.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vid-title">Video title *</Label>
              <Input
                id="vid-title"
                value={form.videoTitle}
                onChange={(e) => patch({ videoTitle: e.target.value })}
                aria-invalid={!!showErr("videoTitle")}
              />
              <FieldError message={showErr("videoTitle")} />
            </div>
            <ArtistMultiField
              label="Primary artist(s) *"
              value={form.primaryArtists}
              onChange={(v) => patch({ primaryArtists: v })}
              placeholder="Add artist"
              error={showErr("primaryArtists") || undefined}
              invalid={!!showErr("primaryArtists")}
            />
            <ArtistMultiField
              label="Featured artist(s)"
              value={form.featuredArtists}
              onChange={(v) => patch({ featuredArtists: v })}
              placeholder="Optional"
            />
            <div>
              <Label>Genres *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {GENRE_OPTIONS.map((g) => {
                  const on = form.genres.includes(g);
                  return (
                    <Button
                      key={g}
                      type="button"
                      size="sm"
                      variant={on ? "default" : "outline"}
                      className={on ? "bg-[#ff0050] hover:bg-[#cc0040]" : ""}
                      onClick={() =>
                        patch({
                          genres: on ? form.genres.filter((x) => x !== g) : [...form.genres, g],
                        })
                      }
                    >
                      {g}
                    </Button>
                  );
                })}
              </div>
              <FieldError message={showErr("genres")} />
            </div>
            <div>
              <Label htmlFor="vid-desc">Description</Label>
              <Textarea
                id="vid-desc"
                rows={4}
                value={form.description}
                onChange={(e) => patch({ description: e.target.value })}
                aria-invalid={!!showErr("description")}
              />
              <p className="text-[11px] text-muted-foreground text-right mt-1">{form.description.length}/5000</p>
              <FieldError message={showErr("description")} />
            </div>
            <div>
              <Label>Video keywords</Label>
              <TagInput
                value={form.keywords}
                onChange={(v) => patch({ keywords: v })}
                placeholder="Press Enter to add"
                invalid={!!showErr("keywords")}
              />
              <FieldError message={showErr("keywords")} />
            </div>
          </CardContent>
        </Card>
      );

    case "assets":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Video asset linking</CardTitle>
            <CardDescription>Connect to existing YouTube assets if you already have a video live.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="asset-id">Video asset ID *</Label>
              <Input
                id="asset-id"
                value={form.videoAssetId}
                onChange={(e) => patch({ videoAssetId: e.target.value })}
                placeholder="From your content manager"
                aria-invalid={!!showErr("videoAssetId")}
              />
              <FieldError message={showErr("videoAssetId")} />
            </div>
            <div>
              <Label htmlFor="yt-url">Existing YouTube URL</Label>
              <Input
                id="yt-url"
                value={form.existingYoutubeUrl}
                onChange={(e) => patch({ existingYoutubeUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=…"
                aria-invalid={!!showErr("existingYoutubeUrl")}
              />
              <FieldError message={showErr("existingYoutubeUrl")} />
            </div>
            {(form.existingYoutubeUrl || form.existingYoutubeVideoId) && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 flex gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Linking an existing video may limit metadata changes. Confirm IDs match your YouTube Studio asset.
                </p>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yt-vid">YouTube video ID</Label>
                <Input
                  id="yt-vid"
                  value={form.existingYoutubeVideoId}
                  onChange={(e) => patch({ existingYoutubeVideoId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="yt-asset">YouTube asset ID</Label>
                <Input
                  id="yt-asset"
                  value={form.existingYoutubeAssetId}
                  onChange={(e) => patch({ existingYoutubeAssetId: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case "thumbnail": {
      const prevent = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#ff0050]" />
              Thumbnail / artwork
            </CardTitle>
            <CardDescription>Custom thumbnail for YouTube minimum 1280×720, JPG or PNG.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={ctx.thumbInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) ctx.onThumbnail(f);
              }}
            />
            {ctx.thumbnailPreview ? (
              <div className="relative rounded-xl overflow-hidden border max-w-md">
                <img src={ctx.thumbnailPreview} alt="Thumbnail preview" className="w-full aspect-video object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => ctx.thumbInputRef.current?.click()}>
                    Replace
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={ctx.clearThumbnail}>
                    Remove
                  </Button>
                </div>
                {ctx.thumbW && ctx.thumbH && (
                  <p className="text-xs text-muted-foreground px-3 py-2 border-t">
                    {ctx.thumbW}×{ctx.thumbH}px
                    {ctx.thumbInlineError && <span className="text-destructive ml-2">{ctx.thumbInlineError}</span>}
                  </p>
                )}
              </div>
            ) : (
              <DropSurface
                active={ctx.thumbDrag}
                className="p-10 text-center"
                onDragOver={(e) => {
                  prevent(e);
                  ctx.setThumbDrag(true);
                }}
                onDragLeave={() => ctx.setThumbDrag(false)}
                onDrop={(e) => {
                  prevent(e);
                  ctx.setThumbDrag(false);
                  const f = e.dataTransfer.files[0];
                  if (f) ctx.onThumbnail(f);
                }}
                onClick={() => ctx.thumbInputRef.current?.click()}
              >
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Drop thumbnail here</p>
                <p className="text-sm text-muted-foreground mt-1">JPG or PNG · min 1280×720</p>
              </DropSurface>
            )}
            {(ctx.thumbInlineError || showErr("thumbnail")) && (
              <p className="text-xs text-destructive">{ctx.thumbInlineError || showErr("thumbnail")}</p>
            )}
          </CardContent>
        </Card>
      );
    }

    case "video-upload": {
      const prevent = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };
      return (
        <Card>
          <CardHeader>
            <CardTitle>Video file</CardTitle>
            <CardDescription>Upload your master file MP4 with H.264 video and AAC audio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={ctx.videoInputRef}
              type="file"
              accept="video/mp4,.mp4"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) ctx.onVideo(f);
              }}
            />
            {!ctx.videoFile ? (
              <DropSurface
                active={ctx.videoDrag}
                className="p-14 text-center"
                onDragOver={(e) => {
                  prevent(e);
                  ctx.setVideoDrag(true);
                }}
                onDragLeave={() => ctx.setVideoDrag(false)}
                onDrop={(e) => {
                  prevent(e);
                  ctx.setVideoDrag(false);
                  const f = e.dataTransfer.files[0];
                  if (f) ctx.onVideo(f);
                }}
                onClick={() => ctx.videoInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-[#ff0050]/70 mb-4" />
                <p className="text-lg font-medium">Drop your video master</p>
                <p className="text-sm text-muted-foreground mt-2">MP4 · H.264 · AAC · up to 8 GB</p>
              </DropSurface>
            ) : (
              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-medium text-sm truncate">{ctx.videoFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(ctx.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                      {ctx.videoResolution && ` · ${ctx.videoResolution}`}
                      {ctx.videoDurationSec != null && ` · ${formatDuration(ctx.videoDurationSec)}`}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={ctx.clearVideo}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Progress value={ctx.uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-right tabular-nums">{ctx.uploadProgress}%</p>
                {ctx.videoError && <p className="text-xs text-destructive">{ctx.videoError}</p>}
              </div>
            )}
            <FieldError message={showErr("videoFile")} />
          </CardContent>
        </Card>
      );
    }

    case "proxy":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#ff0050]" />
              Processing & preview
            </CardTitle>
            <CardDescription>
              We create a lightweight preview for review your original master is stored securely and never streamed in
              the browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ol className="space-y-2">
              {PROXY_PIPELINE.map((step) => {
                const st = ctx.proxyStatuses[step.id];
                return (
                  <li key={step.id} className="flex items-center gap-3 text-sm">
                    {st === "complete" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                    {st === "active" && <Loader2 className="h-4 w-4 text-[#ff0050] animate-spin shrink-0" />}
                    {st === "pending" && <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                    {st === "error" && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
                    <span className={cn(st === "active" && "font-medium")}>{step.label}</span>
                  </li>
                );
              })}
            </ol>
            {ctx.proxyReady && ctx.proxyPreviewUrl && (
              <div className="rounded-xl border overflow-hidden max-w-lg">
                <div className="relative aspect-video bg-black">
                  <img src={ctx.proxyPreviewUrl} alt="Preview frame" className="w-full h-full object-cover opacity-90" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-white/20 backdrop-blur p-4">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground p-3 flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  Secure 720p proxy preview — original master is not played here
                </p>
              </div>
            )}
            {!ctx.uploadComplete && (
              <p className="text-sm text-muted-foreground">Upload your video file to start processing.</p>
            )}
          </CardContent>
        </Card>
      );

    case "contributors": {
      const filtered = MOCK_CONTRIBUTORS.filter((n) =>
        n.toLowerCase().includes(ctx.contributorSearch.toLowerCase())
      );
      const addContributor = () => {
        const name = ctx.newContributorName.trim();
        if (!name) return;
        ctx.setContributors((list) => [
          ...list,
          {
            id: `c-${Date.now()}`,
            name,
            group: ctx.newContributorGroup,
            roles: ctx.newContributorRoles.length ? ctx.newContributorRoles : ["Contributor"],
          },
        ]);
        ctx.setNewContributorName("");
        ctx.setNewContributorRoles([]);
      };
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#ff0050]" />
              Video contributors
            </CardTitle>
            <CardDescription>Credit everyone who worked on this video.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {(["artists", "production", "technical"] as VideoContributorGroup[]).map((group) => (
              <div key={group}>
                <SectionLabel>{group}</SectionLabel>
                <div className="space-y-2">
                  {ctx.contributors
                    .filter((c) => c.group === group)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-border/50 bg-muted/15 p-3"
                      >
                        <span className="font-medium text-sm">{c.name}</span>
                        {c.roles.map((r) => (
                          <Badge key={r} variant="secondary" className="text-xs font-normal">
                            {r}
                          </Badge>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-8 w-8"
                          onClick={() => ctx.setContributors((list) => list.filter((x) => x.id !== c.id))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  {ctx.contributors.filter((c) => c.group === group).length === 0 && (
                    <p className="text-xs text-muted-foreground">No contributors in this group yet.</p>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-lg border p-4 space-y-3 bg-muted/10">
              <Label>Add contributor</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search existing…"
                  value={ctx.contributorSearch}
                  onChange={(e) => ctx.setContributorSearch(e.target.value)}
                />
              </div>
              {ctx.contributorSearch && (
                <div className="flex flex-wrap gap-1">
                  {filtered.map((n) => (
                    <Button
                      key={n}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        ctx.setNewContributorName(n);
                        ctx.setContributorSearch("");
                      }}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              )}
              <Input
                placeholder="Name"
                value={ctx.newContributorName}
                onChange={(e) => ctx.setNewContributorName(e.target.value)}
              />
              <Select
                value={ctx.newContributorGroup}
                onValueChange={(v) => ctx.setNewContributorGroup(v as VideoContributorGroup)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artists">Artists</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {CONTRIBUTOR_ROLE_SUGGESTIONS[ctx.newContributorGroup].map((r) => (
                  <Button
                    key={r}
                    type="button"
                    size="sm"
                    variant={ctx.newContributorRoles.includes(r) ? "default" : "outline"}
                    className={ctx.newContributorRoles.includes(r) ? "bg-[#ff0050] hover:bg-[#cc0040] h-7 text-xs" : "h-7 text-xs"}
                    onClick={() =>
                      ctx.setNewContributorRoles(
                        ctx.newContributorRoles.includes(r)
                          ? ctx.newContributorRoles.filter((x) => x !== r)
                          : [...ctx.newContributorRoles, r]
                      )
                    }
                  >
                    {r}
                  </Button>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addContributor}>
                <Plus className="h-4 w-4 mr-1" />
                Add to release
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    case "visibility":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Visibility & premiere</CardTitle>
            <CardDescription>Control where fans can discover your video.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={form.visibility}
              onValueChange={(v) => patch({ visibility: v as typeof form.visibility })}
              className="space-y-2"
            >
              {[
                { v: "public", l: "Public" },
                { v: "unlisted_youtube", l: "Unlisted on YouTube" },
                { v: "unlisted_vevo", l: "Unlisted on VEVO" },
                { v: "unlisted_both", l: "Unlisted on both" },
              ].map(({ v, l }) => (
                <label key={v} className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/30">
                  <RadioGroupItem value={v} />
                  <span className="text-sm">{l}</span>
                </label>
              ))}
            </RadioGroup>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.wantsPremiere}
                onCheckedChange={(c) => patch({ wantsPremiere: c === true })}
              />
              Schedule a premiere
            </label>
            {form.wantsPremiere && (
              <div className="grid sm:grid-cols-3 gap-4 rounded-lg border border-border/50 bg-muted/15 p-4">
                <div>
                  <Label>Premiere date *</Label>
                  <Input
                    type="date"
                    value={form.premiereDate}
                    onChange={(e) => patch({ premiereDate: e.target.value })}
                    aria-invalid={!!showErr("premiereDate")}
                  />
                  <FieldError message={showErr("premiereDate")} />
                </div>
                <div>
                  <Label>Premiere time *</Label>
                  <Input
                    type="time"
                    value={form.premiereTime}
                    onChange={(e) => patch({ premiereTime: e.target.value })}
                    aria-invalid={!!showErr("premiereTime")}
                  />
                  <FieldError message={showErr("premiereTime")} />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select value={form.premiereTimezone} onValueChange={(v) => patch({ premiereTimezone: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );

    case "channel":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Official channel linking</CardTitle>
            <CardDescription>Maps your video to the correct artist channel on YouTube and VEVO.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="ch-url">Official artist channel URL</Label>
            <Input
              id="ch-url"
              value={form.officialChannelUrl}
              onChange={(e) => patch({ officialChannelUrl: e.target.value })}
              placeholder="https://youtube.com/@YourArtist"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use the same channel linked to your VEVO profile ({form.vevoChannel || "ArtistNameVEVO"}) for consistent
              artist mapping.
            </p>
          </CardContent>
        </Card>
      );

    case "review":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Review & submit</CardTitle>
            <CardDescription>Confirm everything looks right before distribution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Release</p>
                <p className="font-medium">{form.releaseTitle || "—"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Artist</p>
                <p className="font-medium">{form.mainPrimaryArtist || "—"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">Type</p>
                <p className="font-medium">
                  {form.releaseType ? VIDEO_RELEASE_TYPE_LABELS[form.releaseType] : "—"}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground text-xs">VEVO</p>
                <p className="font-medium">{form.vevoChannel || "—"}</p>
              </div>
            </div>
            {ctx.blockingIssues.length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                <p className="font-medium text-destructive text-sm mb-1">Items to fix</p>
                <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-0.5">
                  {ctx.blockingIssues.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}

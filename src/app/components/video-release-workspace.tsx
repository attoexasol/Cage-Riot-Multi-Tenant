/**
 * Video Release Workflow — Artist OS (premium distribution UX)
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Menu,
  Save,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { toast } from "sonner";
import { StepBadge } from "@/app/components/video-release/shared";
import { VideoReleaseStepPanel, type VideoStepContext } from "@/app/components/video-release/steps";
import {
  DEFAULT_VIDEO_FORM,
  MOCK_SAVED_VEVO_CHANNEL,
  PROXY_PIPELINE,
  VIDEO_DRAFT_STORAGE_KEY,
  VIDEO_WORKFLOW_STEPS,
  type ProxyPipelineStep,
  type ProxyStepStatus,
  type VideoContributor,
  type VideoContributorGroup,
  type VideoReleaseFormState,
  type VideoStepId,
} from "@/lib/videoReleaseTypes";
import { buildVideoValidation, generateUpc, type VideoFieldErrors } from "@/lib/videoReleaseValidation";
import { isAcceptedThumbnail, readImageDimensions, readVideoMetadata, validateVideoFile } from "@/lib/videoMediaUtils";

export interface VideoReleaseWorkspaceProps {
  editReleaseId?: string | null;
}

export function VideoReleaseWorkspace({ editReleaseId }: VideoReleaseWorkspaceProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<VideoReleaseFormState>(DEFAULT_VIDEO_FORM);
  const [activeStep, setActiveStep] = useState<VideoStepId>("setup");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [validationAttempt, setValidationAttempt] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<VideoFieldErrors>({});
  const [stepErrors, setStepErrors] = useState<Partial<Record<VideoStepId, number>>>({});
  const [blockingIssues, setBlockingIssues] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [vevoEditing, setVevoEditing] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbW, setThumbW] = useState<number | null>(null);
  const [thumbH, setThumbH] = useState<number | null>(null);
  const [thumbInlineError, setThumbInlineError] = useState<string | null>(null);
  const [thumbDrag, setThumbDrag] = useState(false);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoResolution, setVideoResolution] = useState<string | null>(null);
  const [videoDurationSec, setVideoDurationSec] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [videoDrag, setVideoDrag] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [proxyStatuses, setProxyStatuses] = useState<Record<ProxyPipelineStep, ProxyStepStatus>>(() =>
    Object.fromEntries(PROXY_PIPELINE.map((p) => [p.id, "pending"])) as Record<ProxyPipelineStep, ProxyStepStatus>
  );
  const [proxyReady, setProxyReady] = useState(false);
  const [proxyPreviewUrl, setProxyPreviewUrl] = useState<string | null>(null);

  const [contributors, setContributors] = useState<VideoContributor[]>([]);
  const [contributorSearch, setContributorSearch] = useState("");
  const [newContributorName, setNewContributorName] = useState("");
  const [newContributorGroup, setNewContributorGroup] = useState<VideoContributorGroup>("artists");
  const [newContributorRoles, setNewContributorRoles] = useState<string[]>([]);

  const patch = useCallback((partial: Partial<VideoReleaseFormState>) => {
    setForm((f) => ({ ...f, ...partial }));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VIDEO_DRAFT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { form?: VideoReleaseFormState; contributors?: VideoContributor[] };
      if (parsed.form) setForm({ ...DEFAULT_VIDEO_FORM, ...parsed.form });
      if (parsed.contributors) setContributors(parsed.contributors);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (form.vevoChannelSaved && !form.vevoChannel) {
      patch({ vevoChannel: MOCK_SAVED_VEVO_CHANNEL });
    }
  }, [form.vevoChannel, form.vevoChannelSaved, patch]);

  const mediaState = useMemo(
    () => ({
      thumbnailFile,
      thumbnailPreviewUrl: thumbnailPreview,
      thumbnailWidth: thumbW,
      thumbnailHeight: thumbH,
      thumbnailError: thumbInlineError,
      videoFile,
      videoError,
      videoResolution,
      videoDurationSec,
      proxyReady,
    }),
    [
      thumbnailFile,
      thumbnailPreview,
      thumbW,
      thumbH,
      thumbInlineError,
      videoFile,
      videoError,
      videoResolution,
      videoDurationSec,
      proxyReady,
    ]
  );

  const runValidation = useCallback(() => {
    const { errors, stepErrors: se, blocking } = buildVideoValidation(form, mediaState);
    setFieldErrors(errors);
    setStepErrors(se);
    setBlockingIssues(blocking);
    return Object.keys(errors).length === 0;
  }, [form, mediaState]);

  useEffect(() => {
    if (validationAttempt) runValidation();
  }, [validationAttempt, runValidation]);

  const progressPct = useMemo(() => {
    const idx = VIDEO_WORKFLOW_STEPS.findIndex((s) => s.id === activeStep);
    return Math.round(((idx + 1) / VIDEO_WORKFLOW_STEPS.length) * 100);
  }, [activeStep]);

  const showErr = (key: string) => validationAttempt && fieldErrors[key];

  const clearThumbnail = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setThumbW(null);
    setThumbH(null);
    setThumbInlineError(null);
  };

  const handleThumbnail = async (file: File) => {
    if (!isAcceptedThumbnail(file)) {
      setThumbInlineError("Use JPG or PNG.");
      return;
    }
    try {
      const { width, height } = await readImageDimensions(file);
      const dimErr =
        width < 1280 || height < 720 ? `Minimum 1280×720px (yours: ${width}×${height}).` : null;
      setThumbW(width);
      setThumbH(height);
      setThumbInlineError(dimErr);
      setThumbnailFile(file);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(URL.createObjectURL(file));
    } catch {
      setThumbInlineError("Could not read image.");
    }
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoError(null);
    setVideoResolution(null);
    setVideoDurationSec(null);
    setUploadProgress(0);
    setUploadComplete(false);
    setProxyReady(false);
    setProxyPreviewUrl(null);
    setProxyStatuses(
      Object.fromEntries(PROXY_PIPELINE.map((p) => [p.id, "pending"])) as Record<
        ProxyPipelineStep,
        ProxyStepStatus
      >
    );
  };

  const handleVideo = async (file: File) => {
    const err = validateVideoFile(file);
    setVideoError(err);
    if (err) return;
    setVideoFile(file);
    setUploadProgress(0);
    setUploadComplete(false);
    try {
      const meta = await readVideoMetadata(file);
      setVideoResolution(meta.resolution);
      setVideoDurationSec(meta.durationSec);
    } catch {
      setVideoResolution(null);
      setVideoDurationSec(null);
    }
  };

  useEffect(() => {
    if (!videoFile || uploadComplete) return;
    setUploadProgress(0);
    const t = window.setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 100) {
          window.clearInterval(t);
          setUploadComplete(true);
          return 100;
        }
        return p + 8;
      });
    }, 200);
    return () => window.clearInterval(t);
  }, [videoFile, uploadComplete]);

  useEffect(() => {
    if (!uploadComplete) return;
    let i = 0;
    const steps = PROXY_PIPELINE.map((p) => p.id);
    setProxyStatuses(Object.fromEntries(steps.map((s) => [s, "pending"])) as Record<ProxyPipelineStep, ProxyStepStatus>);
    setProxyReady(false);
    const tick = () => {
      if (i > 0) {
        setProxyStatuses((prev) => ({ ...prev, [steps[i - 1]]: "complete" }));
      }
      if (i >= steps.length) {
        setProxyReady(true);
        if (thumbnailPreview) setProxyPreviewUrl(thumbnailPreview);
        return;
      }
      setProxyStatuses((prev) => ({ ...prev, [steps[i]]: "active" }));
      i += 1;
      window.setTimeout(tick, 900);
    };
    tick();
  }, [uploadComplete, thumbnailPreview]);

  const scrollToFirstError = () => {
    const first = VIDEO_WORKFLOW_STEPS.find((s) => (stepErrors[s.id] ?? 0) > 0);
    if (first) {
      setActiveStep(first.id);
      toast.error("Fix the highlighted fields to continue.");
    }
  };

  const saveDraft = () => {
    localStorage.setItem(
      VIDEO_DRAFT_STORAGE_KEY,
      JSON.stringify({ form, contributors, savedAt: new Date().toISOString() })
    );
    toast.success("Video release draft saved.");
  };

  const handleContinue = async () => {
    setValidationAttempt(true);
    if (!runValidation()) {
      scrollToFirstError();
      return;
    }
    setSubmitting(true);
    try {
      localStorage.setItem(
        VIDEO_DRAFT_STORAGE_KEY,
        JSON.stringify({ form, contributors, savedAt: new Date().toISOString() })
      );
      toast.success("Video release saved. Opening distribution…");
      const mockId = editReleaseId ?? `video-${Date.now()}`;
      navigate(`/artist/releases/${encodeURIComponent(mockId)}/distribute`);
    } finally {
      setSubmitting(false);
    }
  };

  const stepCtx: VideoStepContext = {
    form,
    patch,
    showErr,
    vevoEditing,
    setVevoEditing,
    thumbnailPreview,
    thumbW,
    thumbH,
    thumbInlineError,
    thumbDrag,
    setThumbDrag,
    thumbInputRef,
    onThumbnail: handleThumbnail,
    clearThumbnail,
    videoFile,
    videoError,
    videoResolution,
    videoDurationSec,
    uploadProgress,
    uploadComplete,
    videoDrag,
    setVideoDrag,
    videoInputRef,
    onVideo: handleVideo,
    clearVideo,
    proxyStatuses,
    proxyReady,
    proxyPreviewUrl,
    contributors,
    setContributors,
    contributorSearch,
    setContributorSearch,
    newContributorName,
    setNewContributorName,
    newContributorGroup,
    setNewContributorGroup,
    newContributorRoles,
    setNewContributorRoles,
    validationAttempt,
    fieldErrors,
    blockingIssues,
    generateUpc,
  };

  const stepNav = (
    <nav className="space-y-0.5">
      {VIDEO_WORKFLOW_STEPS.map((step, i) => {
        const active = activeStep === step.id;
        const done = i < VIDEO_WORKFLOW_STEPS.findIndex((s) => s.id === activeStep);
        const errs = stepErrors[step.id];
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => {
              setActiveStep(step.id);
              setMobileNavOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
              active
                ? "bg-[#ff0050]/10 text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                active && "bg-[#ff0050] text-white",
                done && !active && "bg-emerald-500/15 text-emerald-600",
                !active && !done && "bg-muted text-muted-foreground"
              )}
            >
              {done && !active ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className="truncate flex-1">{step.shortLabel}</span>
            <StepBadge count={errs} />
          </button>
        );
      })}
    </nav>
  );

  const continueBlocked = validationAttempt && blockingIssues.length > 0;

  return (
    <div className="flex flex-col w-full min-h-[min(720px,calc(100dvh-14rem))] rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm">
      <div className="shrink-0 border-b border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Video release</p>
            <p className="text-sm font-semibold">
              Step {VIDEO_WORKFLOW_STEPS.findIndex((s) => s.id === activeStep) + 1} of{" "}
              {VIDEO_WORKFLOW_STEPS.length}
              <span className="text-muted-foreground font-normal">
                {" "}
                 {VIDEO_WORKFLOW_STEPS.find((s) => s.id === activeStep)?.label}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 min-w-[140px] flex-1 max-w-xs sm:max-w-sm">
            <Progress value={progressPct} className="h-1.5 flex-1 [&_[data-slot=progress-indicator]]:bg-[#ff0050]" />
            <span className="text-xs text-muted-foreground tabular-nums shrink-0">{progressPct}%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="hidden lg:flex w-56 xl:w-64 shrink-0 flex-col border-r border-border/60 bg-card/30 p-4 overflow-y-auto">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-3 px-1">
            Workflow
          </p>
          {stepNav}
        </aside>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="lg:hidden shrink-0 border-b border-border/60 px-4 py-2 bg-card/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-between"
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              <span className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                {VIDEO_WORKFLOW_STEPS.find((s) => s.id === activeStep)?.shortLabel}
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", mobileNavOpen && "rotate-180")} />
            </Button>
            {mobileNavOpen && <div className="mt-2 pb-2 max-h-52 overflow-y-auto">{stepNav}</div>}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl lg:max-w-none">
            {validationAttempt && blockingIssues.length > 0 && (
              <Card className="mb-4 border-destructive/40 bg-destructive/5">
                <CardContent className="pt-4 pb-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive">Complete these items to continue</p>
                      <ul className="mt-1 text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                        {blockingIssues.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <VideoReleaseStepPanel step={activeStep} ctx={stepCtx} />
          </div>

          <div className="shrink-0 border-t border-border/60 bg-card/95 backdrop-blur px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-2 sticky bottom-0 z-10">
            <p className="text-xs text-muted-foreground hidden sm:block">
              Drafts save locally until your video API is connected.
            </p>
            <div className="flex gap-2 ml-auto w-full sm:w-auto justify-end">
              <Button type="button" variant="outline" onClick={saveDraft} disabled={submitting}>
                <Save className="h-4 w-4 mr-2" />
                Save draft
              </Button>
              <Button
                type="button"
                className="bg-[#ff0050] hover:bg-[#cc0040]"
                disabled={submitting || continueBlocked}
                onClick={handleContinue}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

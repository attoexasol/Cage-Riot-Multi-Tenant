import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Music,
  Image as ImageIcon,
  FileText,
  Volume2,
  Ruler,
  Clock,
  Hash,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface QCCheck {
  id: string;
  category: "audio" | "artwork" | "metadata";
  name: string;
  status: "passed" | "warning" | "failed" | "checking";
  message: string;
  details?: string;
  value?: string;
  expected?: string;
}

interface QCValidationProps {
  releaseId?: string;
  trackId?: string;
  onRevalidate?: () => void;
}

export function QCValidation({ releaseId, trackId, onRevalidate }: QCValidationProps) {
  const qcChecks: QCCheck[] = [
    // Audio Checks
    {
      id: "audio_format",
      category: "audio",
      name: "Audio Format",
      status: "passed",
      message: "WAV 24-bit 48kHz detected",
      value: "WAV 24-bit 48kHz",
      expected: "WAV/FLAC 16/24-bit, 44.1/48kHz",
    },
    {
      id: "audio_bitrate",
      category: "audio",
      name: "Bitrate Quality",
      status: "passed",
      message: "High quality bitrate detected",
      value: "1411 kbps",
      expected: "≥ 320 kbps",
    },
    {
      id: "audio_duration",
      category: "audio",
      name: "Track Duration",
      status: "passed",
      message: "Duration within acceptable range",
      value: "3:24",
      expected: "0:30 - 10:00",
    },
    {
      id: "audio_loudness",
      category: "audio",
      name: "Loudness (LUFS)",
      status: "warning",
      message: "Track is slightly loud, consider reducing",
      details: "Target is -14 LUFS for streaming platforms",
      value: "-11.2 LUFS",
      expected: "-14 LUFS ± 2",
    },
    {
      id: "audio_clipping",
      category: "audio",
      name: "Clipping Detection",
      status: "passed",
      message: "No clipping detected",
      value: "0 samples",
      expected: "0 samples",
    },
    {
      id: "audio_silence",
      category: "audio",
      name: "Silence Check",
      status: "passed",
      message: "No excessive silence at start/end",
      value: "< 0.5s",
      expected: "< 2s",
    },
    {
      id: "audio_checksum",
      category: "audio",
      name: "File Integrity",
      status: "passed",
      message: "SHA-256 checksum verified",
      value: "a3f8b2c1...",
      expected: "Valid checksum",
    },

    // Artwork Checks
    {
      id: "artwork_size",
      category: "artwork",
      name: "Artwork Dimensions",
      status: "passed",
      message: "3000×3000px - Perfect quality",
      value: "3000×3000px",
      expected: "≥ 3000×3000px",
    },
    {
      id: "artwork_aspect",
      category: "artwork",
      name: "Aspect Ratio",
      status: "passed",
      message: "Perfect square (1:1)",
      value: "1:1",
      expected: "1:1 (square)",
    },
    {
      id: "artwork_format",
      category: "artwork",
      name: "Image Format",
      status: "passed",
      message: "PNG format detected",
      value: "PNG",
      expected: "PNG or JPEG",
    },
    {
      id: "artwork_dpi",
      category: "artwork",
      name: "Resolution (DPI)",
      status: "passed",
      message: "300 DPI - Print quality",
      value: "300 DPI",
      expected: "≥ 72 DPI",
    },
    {
      id: "artwork_text",
      category: "artwork",
      name: "Text Legibility",
      status: "warning",
      message: "Small text may not be readable on mobile",
      details: "Consider increasing font size for better visibility",
    },

    // Metadata Checks
    {
      id: "metadata_title",
      category: "metadata",
      name: "Track Title",
      status: "passed",
      message: "Title is valid and clean",
      value: "Summer Nights",
      expected: "Non-empty, < 200 chars",
    },
    {
      id: "metadata_artist",
      category: "metadata",
      name: "Artist Name",
      status: "passed",
      message: "Artist name is valid",
      value: "The Waves",
      expected: "Non-empty, < 200 chars",
    },
    {
      id: "metadata_isrc",
      category: "metadata",
      name: "ISRC Code",
      status: "passed",
      message: "Valid ISRC format",
      value: "USUM72345678",
      expected: "12 characters (CC-XXX-YY-NNNNN)",
    },
    {
      id: "metadata_upc",
      category: "metadata",
      name: "UPC/EAN",
      status: "passed",
      message: "Valid UPC code",
      value: "123456789012",
      expected: "12 or 13 digits",
    },
    {
      id: "metadata_genre",
      category: "metadata",
      name: "Genre",
      status: "passed",
      message: "Valid genre selected",
      value: "Electronic",
      expected: "Standard genre",
    },
    {
      id: "metadata_explicit",
      category: "metadata",
      name: "Explicit Content Flag",
      status: "passed",
      message: "Explicit flag properly set",
      value: "Clean",
      expected: "Explicit or Clean",
    },
    {
      id: "metadata_copyright",
      category: "metadata",
      name: "Copyright Info",
      status: "passed",
      message: "Copyright information complete",
      value: "℗ 2026 Ocean Records",
      expected: "Required format",
    },
  ];

  const categoryIcons = {
    audio: Music,
    artwork: ImageIcon,
    metadata: FileText,
  };

  const statusIcons = {
    passed: CheckCircle2,
    warning: AlertTriangle,
    failed: XCircle,
    checking: RefreshCw,
  };

  const statusColors = {
    passed: "text-green-500",
    warning: "text-yellow-500",
    failed: "text-red-500",
    checking: "text-blue-500",
  };

  const statusBadges = {
    passed: "bg-green-500/10 text-green-600 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    failed: "bg-red-500/10 text-red-600 border-red-500/20",
    checking: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  const categories = ["audio", "artwork", "metadata"] as const;

  const getChecksByCategory = (category: QCCheck["category"]) => {
    return qcChecks.filter((check) => check.category === category);
  };

  const getCategoryStats = (category: QCCheck["category"]) => {
    const checks = getChecksByCategory(category);
    const passed = checks.filter((c) => c.status === "passed").length;
    const warnings = checks.filter((c) => c.status === "warning").length;
    const failed = checks.filter((c) => c.status === "failed").length;
    return { passed, warnings, failed, total: checks.length };
  };

  const overallStats = {
    passed: qcChecks.filter((c) => c.status === "passed").length,
    warnings: qcChecks.filter((c) => c.status === "warning").length,
    failed: qcChecks.filter((c) => c.status === "failed").length,
    total: qcChecks.length,
  };

  const overallScore =
    ((overallStats.passed + overallStats.warnings * 0.5) / overallStats.total) * 100;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 95) return "Excellent";
    if (score >= 85) return "Good";
    if (score >= 70) return "Fair";
    return "Needs Improvement";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#ff0050]" />
              Quality Control Validation
            </CardTitle>
            <CardDescription>
              Automated checks for audio, artwork, and metadata standards
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRevalidate} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-validate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-3.5 sm:px-6">
        {/* Overall Score */}
        <div className="p-4 sm:p-6 rounded-lg border bg-gradient-to-br from-card to-muted">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Overall QC Score</p>
              <p className={cn("text-3xl sm:text-4xl font-bold", getScoreColor(overallScore))}>
                {Math.round(overallScore)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {getScoreLabel(overallScore)}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:text-right">
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">{overallStats.passed} Passed</span>
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">{overallStats.warnings} Warnings</span>
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">{overallStats.failed} Failed</span>
              </div>
            </div>
          </div>
          <Progress value={overallScore} className="h-3" />
        </div>

        {/* Category Breakdown */}
        {categories.map((category) => {
          const checks = getChecksByCategory(category);
          const stats = getCategoryStats(category);
          const Icon = categoryIcons[category];
          const categoryScore = ((stats.passed + stats.warnings * 0.5) / stats.total) * 100;

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-[#ff0050]" />
                  <h4 className="font-semibold capitalize">{category} Checks</h4>
                </div>
                <Badge variant="secondary" className={statusBadges[stats.failed > 0 ? "failed" : stats.warnings > 0 ? "warning" : "passed"]}>
                  {stats.passed}/{stats.total} Passed
                </Badge>
              </div>

              <div className="space-y-2">
                {checks.map((check) => {
                  const StatusIcon = statusIcons[check.status];
                  return (
                    <div
                      key={check.id}
                      className={cn(
                        "p-3 sm:p-4 rounded-lg border",
                        check.status === "failed" && "bg-red-500/5 border-red-500/20",
                        check.status === "warning" && "bg-yellow-500/5 border-yellow-500/20",
                        check.status === "passed" && "bg-green-500/5 border-green-500/20"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <StatusIcon
                          className={cn(
                            "h-5 w-5 flex-shrink-0 mt-0.5",
                            statusColors[check.status]
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-1">
                            <p className="font-medium text-sm">{check.name}</p>
                            <Badge variant="secondary" className={cn(statusBadges[check.status], "w-fit")}>
                              {check.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{check.message}</p>
                          {check.details && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {check.details}
                            </p>
                          )}
                          {(check.value || check.expected) && (
                            <div className="mt-2 flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-4 text-xs">
                              {check.value && (
                                <div>
                                  <span className="text-muted-foreground">Detected: </span>
                                  <span className="font-medium">{check.value}</span>
                                </div>
                              )}
                              {check.expected && (
                                <div>
                                  <span className="text-muted-foreground">Expected: </span>
                                  <span className="font-medium">{check.expected}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Summary */}
        {overallStats.failed > 0 && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {overallStats.failed} Critical Issue{overallStats.failed > 1 ? "s" : ""} Found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please resolve all failed checks before submitting for distribution.
                </p>
              </div>
            </div>
          </div>
        )}

        {overallStats.warnings > 0 && overallStats.failed === 0 && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  {overallStats.warnings} Warning{overallStats.warnings > 1 ? "s" : ""} Detected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your release can be submitted, but consider addressing these warnings for optimal quality.
                </p>
              </div>
            </div>
          </div>
        )}

        {overallStats.failed === 0 && overallStats.warnings === 0 && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  All Quality Checks Passed!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your release meets all quality standards and is ready for distribution.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
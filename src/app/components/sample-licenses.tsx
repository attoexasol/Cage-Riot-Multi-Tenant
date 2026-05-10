import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface License {
  id: string;
  filename: string;
  type: "sample_clearance" | "sync_license" | "mechanical_license" | "master_use" | "other";
  status: "pending" | "approved" | "rejected" | "expired";
  uploadedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  expiresAt?: Date;
  fileSize: number;
  notes?: string;
}

interface SampleLicensesProps {
  releaseId?: string;
  trackId?: string;
  onSave?: (licenses: License[]) => void;
}

const LICENSE_TYPES = [
  { value: "sample_clearance", label: "Sample Clearance" },
  { value: "sync_license", label: "Sync License" },
  { value: "mechanical_license", label: "Mechanical License" },
  { value: "master_use", label: "Master Use License" },
  { value: "other", label: "Other" },
];

export function SampleLicenses({ releaseId, trackId, onSave }: SampleLicensesProps) {
  const [licenses, setLicenses] = useState<License[]>([
    {
      id: "1",
      filename: "sample-clearance-vintage-drum-break.pdf",
      type: "sample_clearance",
      status: "approved",
      uploadedAt: new Date("2026-01-15"),
      approvedBy: "Legal Team",
      approvedAt: new Date("2026-01-16"),
      fileSize: 245000,
      notes: "Cleared for worldwide distribution",
    },
    {
      id: "2",
      filename: "mechanical-license-publishing.pdf",
      type: "mechanical_license",
      status: "pending",
      uploadedAt: new Date("2026-01-28"),
      fileSize: 189000,
      notes: "Awaiting publisher approval",
    },
  ]);

  const [uploadType, setUploadType] = useState("sample_clearance");
  const [uploadNotes, setUploadNotes] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = [".pdf", ".doc", ".docx", ".txt"];
    const fileExt = file.name.substring(file.name.lastIndexOf("."));
    if (!allowedTypes.includes(fileExt.toLowerCase())) {
      toast.error("Only PDF, DOC, DOCX, and TXT files are allowed");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const newLicense: License = {
      id: Date.now().toString(),
      filename: file.name,
      type: uploadType as License["type"],
      status: "pending",
      uploadedAt: new Date(),
      fileSize: file.size,
      notes: uploadNotes,
    };

    setLicenses([...licenses, newLicense]);
    setUploadNotes("");
    toast.success("License document uploaded successfully");
  };

  const removeLicense = (id: string) => {
    setLicenses(licenses.filter((l) => l.id !== id));
    toast.success("License removed");
  };

  const downloadLicense = (license: License) => {
    toast.success(`Downloading ${license.filename}...`);
    // In real implementation, this would trigger actual download
  };

  const getStatusIcon = (status: License["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: License["status"]) => {
    const variants = {
      approved: "bg-green-500/10 text-green-600 border-green-500/20",
      rejected: "bg-red-500/10 text-red-600 border-red-500/20",
      expired: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const approvedCount = licenses.filter((l) => l.status === "approved").length;
  const pendingCount = licenses.filter((l) => l.status === "pending").length;
  const hasBlockingIssues = licenses.some((l) => l.status === "rejected" || l.status === "expired");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#ff0050]" />
                Sample Licenses & Clearances
              </CardTitle>
              <CardDescription>
                Upload legal documentation for samples, covers, or licensed content
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                {approvedCount} Approved
              </Badge>
              {pendingCount > 0 && (
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  {pendingCount} Pending
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-3.5 sm:px-6">
          {/* Status Alert */}
          {hasBlockingIssues && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Legal Clearance Required
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Some licenses are rejected or expired. Please upload new documentation or contact legal.
                </p>
              </div>
            </div>
          )}

          {/* Upload Form */}
          <div className="space-y-4 p-4 rounded-lg border-2 border-dashed">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New License
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">License Type *</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border bg-background"
                >
                  {LICENSE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Document *</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 rounded-lg border bg-background cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#ff0050] file:text-white hover:file:bg-[#cc0040] focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, or TXT (max 10MB)
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <textarea
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Add any relevant notes about this license..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border bg-background resize-none"
                />
              </div>
            </div>
          </div>

          {/* License List */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Uploaded Licenses ({licenses.length})</h4>
            {licenses.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No licenses uploaded yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload sample clearances or other legal documentation above
                </p>
              </div>
            ) : (
              licenses.map((license) => (
                <div
                  key={license.id}
                  className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-[#ff0050]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium break-words">{license.filename}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {LICENSE_TYPES.find((t) => t.value === license.type)?.label} •{" "}
                            {formatFileSize(license.fileSize)}
                          </p>
                        </div>
                        <div className="sm:hidden">
                          {getStatusBadge(license.status)}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        <p>
                          Uploaded {license.uploadedAt.toLocaleDateString()} at{" "}
                          {license.uploadedAt.toLocaleTimeString()}
                        </p>
                        {license.approvedBy && license.approvedAt && (
                          <p className="text-green-600 dark:text-green-400">
                            Approved by {license.approvedBy} on{" "}
                            {license.approvedAt.toLocaleDateString()}
                          </p>
                        )}
                        {license.expiresAt && (
                          <p className="text-orange-600 dark:text-orange-400">
                            Expires on {license.expiresAt.toLocaleDateString()}
                          </p>
                        )}
                        {license.notes && (
                          <p className="italic mt-1 break-words">{license.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-3">
                    <div className="hidden sm:block">
                      {getStatusBadge(license.status)}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadLicense(license)}
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLicense(license.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Help Section */}
          <div className="p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-2 sm:gap-3">
              <FileText className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  When do I need licenses?
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1.5 list-disc list-inside">
                  <li className="break-words">Sample Clearance: When using audio samples from other recordings</li>
                  <li className="break-words">Mechanical License: When covering someone else's composition</li>
                  <li className="break-words">Master Use: When using original master recordings</li>
                  <li className="break-words">Sync License: When music is synchronized with video content</li>
                </ul>
                <Button
                  variant="link"
                  size="sm"
                  className="text-blue-500 hover:text-blue-600 p-0 h-auto mt-2 text-xs sm:text-sm max-w-full text-left inline-flex items-center flex-wrap"
                >
                  <span className="break-words">Learn more about licensing</span>
                  <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={() => onSave?.(licenses)}
            className="w-full"
            size="lg"
            disabled={pendingCount > 0 || hasBlockingIssues}
          >
            {pendingCount > 0
              ? `Waiting for ${pendingCount} approval${pendingCount > 1 ? "s" : ""}`
              : hasBlockingIssues
              ? "Resolve licensing issues to continue"
              : "Confirm License Documentation"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
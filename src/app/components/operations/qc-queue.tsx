import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Progress } from "@/app/components/ui/progress";
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
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  PlayCircle,
  Eye,
  CheckSquare,
  Square,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";

interface QCCheck {
  id: string;
  category: "metadata" | "audio" | "artwork" | "rights" | "delivery";
  name: string;
  status: "passed" | "failed" | "warning" | "pending";
  message?: string;
}

interface QCRelease {
  id: string;
  releaseTitle: string;
  artistName: string;
  upc: string;
  qcStatus: "passed" | "failed" | "warning" | "pending" | "not_checked";
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  daysWaiting: number;
  uploadedDate: string;
  priority: "urgent" | "high" | "normal" | "low";
  checks: QCCheck[];
}

const mockReleases: QCRelease[] = [
  {
    id: "1",
    releaseTitle: "Summer Nights EP",
    artistName: "The Waves",
    upc: "196589654321",
    qcStatus: "failed",
    totalChecks: 20,
    passedChecks: 18,
    failedChecks: 2,
    warningChecks: 0,
    daysWaiting: 3,
    uploadedDate: "2026-01-27",
    priority: "high",
    checks: [
      { id: "1", category: "metadata", name: "UPC Valid", status: "passed" },
      { id: "2", category: "metadata", name: "ISRC Valid", status: "failed", message: "Track 3 missing ISRC" },
      { id: "3", category: "audio", name: "Audio Duration", status: "passed" },
      { id: "4", category: "audio", name: "Bitrate Check", status: "failed", message: "Track 2 below 320kbps" },
      { id: "5", category: "artwork", name: "Cover Art Dimensions", status: "passed" },
    ],
  },
  {
    id: "2",
    releaseTitle: "Electric Dreams",
    artistName: "Neon City",
    upc: "196589654322",
    qcStatus: "passed",
    totalChecks: 20,
    passedChecks: 20,
    failedChecks: 0,
    warningChecks: 0,
    daysWaiting: 1,
    uploadedDate: "2026-01-29",
    priority: "normal",
    checks: [],
  },
  {
    id: "3",
    releaseTitle: "Ocean Vibes Vol. 3",
    artistName: "Coast Collective",
    upc: "196589654323",
    qcStatus: "warning",
    totalChecks: 20,
    passedChecks: 18,
    failedChecks: 0,
    warningChecks: 2,
    daysWaiting: 5,
    uploadedDate: "2026-01-25",
    priority: "normal",
    checks: [],
  },
  {
    id: "4",
    releaseTitle: "Midnight Sessions",
    artistName: "Urban Sound",
    upc: "196589654324",
    qcStatus: "not_checked",
    totalChecks: 20,
    passedChecks: 0,
    failedChecks: 0,
    warningChecks: 0,
    daysWaiting: 0,
    uploadedDate: "2026-01-30",
    priority: "urgent",
    checks: [],
  },
  {
    id: "5",
    releaseTitle: "Synth Wave Anthology",
    artistName: "Retro Future",
    upc: "196589654325",
    qcStatus: "failed",
    totalChecks: 20,
    passedChecks: 16,
    failedChecks: 4,
    warningChecks: 0,
    daysWaiting: 2,
    uploadedDate: "2026-01-28",
    priority: "high",
    checks: [],
  },
  {
    id: "6",
    releaseTitle: "Bass Drops",
    artistName: "Deep Sound Records",
    upc: "196589654326",
    qcStatus: "passed",
    totalChecks: 20,
    passedChecks: 20,
    failedChecks: 0,
    warningChecks: 0,
    daysWaiting: 2,
    uploadedDate: "2026-01-28",
    priority: "normal",
    checks: [],
  },
];

export function QCQueue() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"waiting" | "priority" | "status">("waiting");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [currentRelease, setCurrentRelease] = useState<QCRelease | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  
  // New state for QC functionality
  const [releases, setReleases] = useState<QCRelease[]>(mockReleases);
  const [isQCRunning, setIsQCRunning] = useState(false);
  const [showQCProgressDialog, setShowQCProgressDialog] = useState(false);
  const [qcProgress, setQCProgress] = useState(0);
  const [currentQCCheck, setCurrentQCCheck] = useState("");
  const [qcResults, setQCResults] = useState<{ passed: number; failed: number; warnings: number } | null>(null);

  const filteredReleases = releases
    .filter((release) => {
      const matchesSearch =
        release.releaseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        release.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        release.upc.includes(searchQuery);
      const matchesFilter =
        filterStatus === "all" || release.qcStatus === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "waiting") return b.daysWaiting - a.daysWaiting;
      if (sortBy === "priority") {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === "status") {
        const statusOrder = { failed: 0, warning: 1, not_checked: 2, passed: 3 };
        return statusOrder[a.qcStatus] - statusOrder[b.qcStatus];
      }
      return 0;
    });

  const failedCount = releases.filter((r) => r.qcStatus === "failed").length;
  const passedCount = releases.filter((r) => r.qcStatus === "passed").length;
  const notCheckedCount = releases.filter((r) => r.qcStatus === "not_checked").length;
  const warningCount = releases.filter((r) => r.qcStatus === "warning").length;

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredReleases.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredReleases.map((r) => r.id));
    }
  };

  const handleRunQC = async (release?: QCRelease) => {
    if (!release && selectedItems.length === 0) return;

    // Determine which releases to check
    const releasesToCheck = release 
      ? [release] 
      : releases.filter(r => selectedItems.includes(r.id));

    if (releasesToCheck.length === 0) return;

    // Show progress dialog
    setShowQCProgressDialog(true);
    setIsQCRunning(true);
    setQCProgress(0);
    setCurrentQCCheck("Initializing QC checks...");

    // QC check names
    const qcChecks = [
      "Validating UPC format",
      "Checking ISRC codes",
      "Validating metadata completeness",
      "Checking track titles",
      "Validating artist names",
      "Checking audio file format",
      "Analyzing bitrate quality",
      "Validating audio duration",
      "Checking sample rate",
      "Analyzing loudness levels",
      "Validating cover art dimensions",
      "Checking cover art file size",
      "Validating artwork format",
      "Checking rights ownership",
      "Validating split agreements",
      "Checking territory restrictions",
      "Validating delivery format",
      "Checking file integrity",
      "Validating DSP requirements",
      "Final validation",
    ];

    // Simulate QC process
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;

    for (let i = 0; i < qcChecks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setCurrentQCCheck(qcChecks[i]);
      setQCProgress(((i + 1) / qcChecks.length) * 100);
    }

    // Generate results for each release
    for (const rel of releasesToCheck) {
      // Random result generation (weighted towards passing)
      const passRate = 0.75; // 75% pass rate
      const warnRate = 0.15; // 15% warning rate
      
      const passed = Math.floor(Math.random() * 100) < (passRate * 100) ? 20 : Math.floor(Math.random() * 17) + 16;
      const warnings = passed === 20 ? 0 : Math.floor(Math.random() * 3);
      const failed = 20 - passed - warnings;

      totalPassed += passed;
      totalFailed += failed;
      totalWarnings += warnings;

      // Determine status
      let status: QCRelease["qcStatus"] = "passed";
      if (failed > 0) status = "failed";
      else if (warnings > 0) status = "warning";

      // Generate failure details if needed
      const checks: QCCheck[] = [];
      if (failed > 0) {
        const failureReasons = [
          { name: "ISRC Valid", message: "Track 2 missing ISRC code" },
          { name: "Bitrate Check", message: "Track 3 below 320kbps minimum" },
          { name: "Metadata Complete", message: "Missing composer credits" },
          { name: "Cover Art Dimensions", message: "Artwork is 2000x2000, minimum is 3000x3000" },
        ];
        for (let i = 0; i < Math.min(failed, failureReasons.length); i++) {
          checks.push({
            id: `${i + 1}`,
            category: i % 2 === 0 ? "metadata" : "audio",
            ...failureReasons[i],
            status: "failed",
          });
        }
      }

      // Update release
      setReleases(prev => prev.map(r => 
        r.id === rel.id 
          ? {
              ...r,
              qcStatus: status,
              passedChecks: passed,
              failedChecks: failed,
              warningChecks: warnings,
              checks,
            }
          : r
      ));
    }

    setQCResults({ passed: totalPassed, failed: totalFailed, warnings: totalWarnings });
    setIsQCRunning(false);
    
    // Clear selection
    if (selectedItems.length > 0) {
      setSelectedItems([]);
    }

    // Show completion toast
    setTimeout(() => {
      const allPassed = totalFailed === 0 && totalWarnings === 0;
      if (allPassed) {
        toast.success(`QC Complete! All ${releasesToCheck.length} release${releasesToCheck.length > 1 ? "s" : ""} passed.`);
      } else if (totalFailed > 0) {
        toast.error(`QC Complete: ${totalFailed} check${totalFailed > 1 ? "s" : ""} failed, ${totalWarnings} warning${totalWarnings > 1 ? "s" : ""}.`);
      } else {
        toast.warning(`QC Complete: ${totalWarnings} warning${totalWarnings > 1 ? "s" : ""} detected.`);
      }
    }, 500);
  };

  const handleViewDetails = (release: QCRelease) => {
    setCurrentRelease(release);
    setShowDetailsDialog(true);
  };

  const handleOverride = (release: QCRelease) => {
    setCurrentRelease(release);
    setShowOverrideDialog(true);
  };

  const confirmOverride = () => {
    if (currentRelease && overrideReason.trim()) {
      toast.success(`Override approved for "${currentRelease.releaseTitle}"`);
      setShowOverrideDialog(false);
      setCurrentRelease(null);
      setOverrideReason("");
    } else {
      toast.error("Please provide an override reason");
    }
  };

  const getStatusBadge = (status: QCRelease["qcStatus"]) => {
    const variants = {
      passed: "bg-green-500/10 text-green-600 border-green-500/20",
      failed: "bg-red-500/10 text-red-600 border-red-500/20",
      warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      pending: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      not_checked: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };

    const labels = {
      passed: "QC Passed",
      failed: "QC Failed",
      warning: "QC Warning",
      pending: "QC Pending",
      not_checked: "Not Checked",
    };

    const icons = {
      passed: <CheckCircle2 className="h-3 w-3 mr-1" />,
      failed: <XCircle className="h-3 w-3 mr-1" />,
      warning: <AlertTriangle className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      not_checked: <ShieldAlert className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: QCRelease["priority"]) => {
    const variants = {
      urgent: "bg-red-500/10 text-red-600 border-red-500/20",
      high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      normal: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      low: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };

    return (
      <Badge variant="secondary" className={variants[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">QC Failed</p>
                <p className="text-2xl font-semibold mt-1">{failedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">QC Passed</p>
                <p className="text-2xl font-semibold mt-1">{passedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Not Checked</p>
                <p className="text-2xl font-semibold mt-1">{notCheckedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-semibold mt-1">{warningCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, artist, or UPC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 sm:pl-9 text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px] text-xs sm:text-sm h-9 sm:h-10">
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs sm:text-sm">All Status</SelectItem>
                <SelectItem value="failed" className="text-xs sm:text-sm">Failed QC</SelectItem>
                <SelectItem value="passed" className="text-xs sm:text-sm">Passed QC</SelectItem>
                <SelectItem value="warning" className="text-xs sm:text-sm">Warnings</SelectItem>
                <SelectItem value="not_checked" className="text-xs sm:text-sm">Not Checked</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-[180px] text-xs sm:text-sm h-9 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting" className="text-xs sm:text-sm">Sort by Days Waiting</SelectItem>
                <SelectItem value="priority" className="text-xs sm:text-sm">Sort by Priority</SelectItem>
                <SelectItem value="status" className="text-xs sm:text-sm">Sort by Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Selection Bar */}
      {selectedItems.length > 0 && (
        <Card className="border-[#ff0050]/20 bg-[#ff0050]/5">
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff0050] flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {selectedItems.length} release{selectedItems.length > 1 ? "s" : ""} selected
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => setSelectedItems([])} className="w-full sm:w-auto text-sm">
                  Clear Selection
                </Button>
                <Button onClick={() => handleRunQC()} className="bg-[#ff0050] hover:bg-[#cc0040] w-full sm:w-auto text-sm">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Run QC on Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QC Queue List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <CardTitle className="text-base sm:text-lg">QC Queue</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {filteredReleases.length} release{filteredReleases.length !== 1 ? "s" : ""} in queue
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={selectAll} className="w-full sm:w-auto text-xs sm:text-sm">
              {selectedItems.length === filteredReleases.length ? (
                <>
                  <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                  Select All
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {filteredReleases.length === 0 ? (
            <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg mx-4 sm:mx-0">
              <ShieldAlert className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm sm:text-base text-muted-foreground">No releases found</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-muted-foreground">
                      <Checkbox
                        checked={selectedItems.length === filteredReleases.length}
                        onCheckedChange={selectAll}
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-muted-foreground">Release</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-muted-foreground">UPC</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-muted-foreground">QC Results</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-muted-foreground">Waiting</th>
                    <th className="text-right py-3 px-4 text-xs sm:text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReleases.map((release) => (
                    <tr
                      key={release.id}
                      className={cn(
                        "border-b transition-colors hover:bg-muted/50",
                        selectedItems.includes(release.id) && "bg-[#ff0050]/5"
                      )}
                    >
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedItems.includes(release.id)}
                          onCheckedChange={() => toggleSelection(release.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-sm sm:text-base">{release.releaseTitle}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{release.artistName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-xs sm:text-sm font-mono">{release.upc}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1.5">
                          {getStatusBadge(release.qcStatus)}
                          {getPriorityBadge(release.priority)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {release.qcStatus === "not_checked" ? (
                          <p className="text-xs sm:text-sm font-medium">Not checked yet</p>
                        ) : (
                          <div className="space-y-1 min-w-[150px]">
                            <p className="text-xs sm:text-sm font-medium">
                              {release.passedChecks} of {release.totalChecks} passed
                            </p>
                            <Progress value={(release.passedChecks / release.totalChecks) * 100} className="h-2" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-base sm:text-lg font-semibold text-[#ff0050]">
                            {release.daysWaiting} day{release.daysWaiting !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            Since {new Date(release.uploadedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(release)}
                            className="text-xs sm:text-sm whitespace-nowrap"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Details
                          </Button>
                          {release.qcStatus === "not_checked" ? (
                            <Button
                              size="sm"
                              onClick={() => handleRunQC(release)}
                              className="bg-[#ff0050] hover:bg-[#cc0040] text-xs sm:text-sm whitespace-nowrap"
                            >
                              <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Run QC
                            </Button>
                          ) : release.qcStatus === "failed" ? (
                            <Button
                              size="sm"
                              onClick={() => handleOverride(release)}
                              className="bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm whitespace-nowrap"
                            >
                              Override
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>QC Details: {currentRelease?.releaseTitle}</DialogTitle>
            <DialogDescription>
              By {currentRelease?.artistName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Overall Status</p>
                {currentRelease && getStatusBadge(currentRelease.qcStatus)}
              </div>
              {currentRelease && currentRelease.qcStatus !== "not_checked" && (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    {currentRelease.passedChecks} of {currentRelease.totalChecks} checks passed
                  </p>
                  <Progress value={(currentRelease.passedChecks / currentRelease.totalChecks) * 100} className="h-3" />
                </>
              )}
            </div>

            {currentRelease && currentRelease.checks.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Failed Checks:</p>
                {currentRelease.checks.map((check) => (
                  <div key={check.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{check.name}</p>
                      <Badge variant="secondary" className="bg-red-500/10 text-red-600">
                        {check.status}
                      </Badge>
                    </div>
                    {check.message && (
                      <p className="text-sm text-muted-foreground mt-1">{check.message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            {currentRelease?.qcStatus === "failed" && (
              <Button onClick={() => {
                setShowDetailsDialog(false);
                handleOverride(currentRelease);
              }}>
                Override QC
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override QC Checks</DialogTitle>
            <DialogDescription>
              Override failed checks for "{currentRelease?.releaseTitle}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-600">
                {currentRelease?.failedChecks} check{currentRelease?.failedChecks !== 1 ? "s" : ""} failed
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Override Reason *</label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g., Artist confirmed audio quality is intentional..."
                className="w-full min-h-[100px] px-3 py-2 rounded-lg border bg-background resize-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This will approve the release despite QC failures
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmOverride}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={!overrideReason.trim()}
            >
              Confirm Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QC Progress Dialog */}
      <Dialog open={showQCProgressDialog} onOpenChange={setShowQCProgressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Running QC Checks</DialogTitle>
            <DialogDescription>
              {isQCRunning ? "QC checks are in progress..." : "QC checks completed."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-2">
                {currentQCCheck}
              </p>
              <Progress value={qcProgress} className="h-3" />
            </div>
            {qcResults && (
              <div className="space-y-2">
                <p className="font-medium">QC Results:</p>
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Passed Checks</p>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                      {qcResults.passed}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Failed Checks</p>
                    <Badge variant="secondary" className="bg-red-500/10 text-red-600">
                      {qcResults.failed}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Warnings</p>
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                      {qcResults.warnings}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQCProgressDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
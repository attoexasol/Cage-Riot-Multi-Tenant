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
import { XCircle, RefreshCw, Search, Filter, AlertTriangle, Eye, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";
import { DSPLogo } from "@/app/components/dsp-logos";

interface FailedDelivery {
  id: string;
  releaseTitle: string;
  artistName: string;
  upc: string;
  dsp: string;
  errorCode: string;
  errorMessage: string;
  failedAt: string;
  retryCount: number;
  lastRetryAt?: string;
  priority: "urgent" | "high" | "normal";
  escalated?: boolean;
  escalatedAt?: string;
  escalationReason?: string;
}

const mockFailedDeliveries: FailedDelivery[] = [
  {
    id: "1",
    releaseTitle: "Summer Nights EP",
    artistName: "The Waves",
    upc: "196589654321",
    dsp: "Spotify",
    errorCode: "METADATA_INVALID",
    errorMessage: "UPC format validation failed. Expected 13 digits.",
    failedAt: "2026-01-30T12:30:00",
    retryCount: 2,
    lastRetryAt: "2026-01-30T13:00:00",
    priority: "urgent",
  },
  {
    id: "2",
    releaseTitle: "Ocean Vibes Vol. 3",
    artistName: "Coast Collective",
    upc: "196589654323",
    dsp: "Apple Music",
    errorCode: "AUDIO_QUALITY",
    errorMessage: "Track 2: Audio bitrate below minimum requirement (128kbps detected, 256kbps required)",
    failedAt: "2026-01-30T11:15:00",
    retryCount: 1,
    lastRetryAt: "2026-01-30T12:00:00",
    priority: "high",
  },
  {
    id: "3",
    releaseTitle: "Synth Wave Anthology",
    artistName: "Retro Future",
    upc: "196589654325",
    dsp: "YouTube Music",
    errorCode: "ARTWORK_INVALID",
    errorMessage: "Cover art dimensions incorrect. Expected 3000x3000px, got 2000x2000px",
    failedAt: "2026-01-30T10:00:00",
    retryCount: 3,
    lastRetryAt: "2026-01-30T13:30:00",
    priority: "high",
  },
  {
    id: "4",
    releaseTitle: "Midnight Sessions",
    artistName: "Urban Sound",
    upc: "196589654324",
    dsp: "Amazon Music",
    errorCode: "RIGHTS_CONFLICT",
    errorMessage: "Potential rights conflict detected. Track 1 ISRC already claimed by another distributor",
    failedAt: "2026-01-30T09:30:00",
    retryCount: 0,
    priority: "urgent",
  },
  {
    id: "5",
    releaseTitle: "Acoustic Sessions",
    artistName: "Indie Folk Collective",
    upc: "196589654329",
    dsp: "Deezer",
    errorCode: "TIMEOUT",
    errorMessage: "Request timeout after 30 seconds. DSP API unresponsive",
    failedAt: "2026-01-30T14:00:00",
    retryCount: 1,
    lastRetryAt: "2026-01-30T14:15:00",
    priority: "normal",
  },
];

export function FailedDeliveries() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDSP, setFilterDSP] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [currentFailure, setCurrentFailure] = useState<FailedDelivery | null>(null);

  // New state for retry functionality
  const [deliveries, setDeliveries] = useState<FailedDelivery[]>(mockFailedDeliveries);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showRetryProgressDialog, setShowRetryProgressDialog] = useState(false);
  const [retryProgress, setRetryProgress] = useState(0);
  const [currentRetryStep, setCurrentRetryStep] = useState("");
  const [retryResults, setRetryResults] = useState<{ successful: number; failed: number; removed: string[] } | null>(null);

  // New state for escalation functionality
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [escalationNotes, setEscalationNotes] = useState("");
  const [assignTo, setAssignTo] = useState("senior-ops");

  const filteredFailures = deliveries.filter((failure) => {
    const matchesSearch =
      failure.releaseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      failure.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      failure.upc.includes(searchQuery) ||
      failure.errorCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDSP = filterDSP === "all" || failure.dsp === filterDSP;
    const matchesPriority = filterPriority === "all" || failure.priority === filterPriority;
    return matchesSearch && matchesDSP && matchesPriority;
  });

  const urgentCount = deliveries.filter((f) => f.priority === "urgent").length;
  const highRetryCount = deliveries.filter((f) => f.retryCount >= 2).length;

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredFailures.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredFailures.map((f) => f.id));
    }
  };

  const handleRetry = async (failure?: FailedDelivery) => {
    if (!failure && selectedItems.length === 0) return;

    // Determine which deliveries to retry
    const deliveriesToRetry = failure 
      ? [failure] 
      : deliveries.filter(d => selectedItems.includes(d.id));

    if (deliveriesToRetry.length === 0) return;

    // Show progress dialog
    setShowRetryProgressDialog(true);
    setIsRetrying(true);
    setRetryProgress(0);
    setCurrentRetryStep("Initializing retry process...");
    setRetryResults(null);

    // Retry process steps
    const retrySteps = [
      "Connecting to DSP API...",
      "Validating metadata...",
      "Checking file integrity...",
      "Uploading release data...",
      "Verifying upload...",
      "Finalizing delivery...",
    ];

    // Simulate retry process
    let successful = 0;
    let failed = 0;
    const removedIds: string[] = [];

    for (let i = 0; i < retrySteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setCurrentRetryStep(retrySteps[i]);
      setRetryProgress(((i + 1) / retrySteps.length) * 100);
    }

    // Process each delivery
    for (const delivery of deliveriesToRetry) {
      // Random success rate (70% success rate for retries)
      const willSucceed = Math.random() < 0.7;

      if (willSucceed) {
        successful++;
        // Remove from failed deliveries list
        removedIds.push(delivery.id);
      } else {
        failed++;
        // Update retry count
        setDeliveries(prev => prev.map(d => 
          d.id === delivery.id 
            ? { 
                ...d, 
                retryCount: d.retryCount + 1,
                lastRetryAt: new Date().toISOString(),
              } 
            : d
        ));
      }
    }

    // Remove successful deliveries from the list
    if (removedIds.length > 0) {
      setDeliveries(prev => prev.filter(d => !removedIds.includes(d.id)));
    }

    setRetryResults({ successful, failed, removed: removedIds });
    setIsRetrying(false);
    
    // Clear selection
    if (selectedItems.length > 0) {
      setSelectedItems([]);
    }

    // Show completion toast
    setTimeout(() => {
      if (successful > 0 && failed === 0) {
        toast.success(`Successfully retried ${successful} delivery${successful > 1 ? "s" : ""}! All deliveries succeeded.`);
      } else if (successful > 0 && failed > 0) {
        toast.warning(`Retry complete: ${successful} succeeded, ${failed} failed again.`);
      } else {
        toast.error(`All ${failed} retry attempt${failed > 1 ? "s" : ""} failed. Consider escalating.`);
      }
    }, 500);
  };

  const handleViewError = (failure: FailedDelivery) => {
    setCurrentFailure(failure);
    setShowErrorDialog(true);
  };

  const handleEscalate = (failure: FailedDelivery) => {
    setCurrentFailure(failure);
    setShowEscalateDialog(true);
  };

  const confirmEscalation = () => {
    if (!currentFailure || !escalationReason.trim()) {
      toast.error("Please provide an escalation reason");
      return;
    }

    // Update delivery with escalation info
    setDeliveries(prev => prev.map(d => 
      d.id === currentFailure.id 
        ? {
            ...d,
            escalated: true,
            escalatedAt: new Date().toISOString(),
            escalationReason: escalationReason,
          }
        : d
    ));

    // Show success message
    const teamMap: Record<string, string> = {
      "senior-ops": "Senior Operations Team",
      "dsp-support": "DSP Support Team",
      "tech-support": "Technical Support Team",
      "management": "Management Team",
    };

    toast.success(`Successfully escalated "${currentFailure.releaseTitle}" to ${teamMap[assignTo]}`);

    // Reset and close
    setShowEscalateDialog(false);
    setEscalationReason("");
    setEscalationNotes("");
    setAssignTo("senior-ops");
    setCurrentFailure(null);
  };

  const getPriorityBadge = (priority: FailedDelivery["priority"]) => {
    const variants = {
      urgent: "bg-red-500/10 text-red-600 border-red-500/20",
      high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      normal: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    };

    return (
      <Badge variant="secondary" className={variants[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getErrorTypeBadge = (errorCode: string) => {
    const typeColors: Record<string, string> = {
      METADATA_INVALID: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      AUDIO_QUALITY: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      ARTWORK_INVALID: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      RIGHTS_CONFLICT: "bg-red-500/10 text-red-600 border-red-500/20",
      TIMEOUT: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    };

    return (
      <Badge variant="secondary" className={typeColors[errorCode] || "bg-gray-500/10"}>
        {errorCode}
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
                <p className="text-sm text-muted-foreground">Total Failed</p>
                <p className="text-2xl font-semibold mt-1">{deliveries.length}</p>
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
                <p className="text-sm text-muted-foreground">Urgent Priority</p>
                <p className="text-2xl font-semibold mt-1">{urgentCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Retry Count</p>
                <p className="text-2xl font-semibold mt-1">{highRetryCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Retry Count</p>
                <p className="text-2xl font-semibold mt-1">
                  {(deliveries.reduce((sum, f) => sum + f.retryCount, 0) / deliveries.length).toFixed(1)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, artist, UPC, or error..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>

            <Select value={filterDSP} onValueChange={setFilterDSP}>
              <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm h-9 sm:h-10">
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All DSPs</SelectItem>
                <SelectItem value="Spotify">Spotify</SelectItem>
                <SelectItem value="Apple Music">Apple Music</SelectItem>
                <SelectItem value="YouTube Music">YouTube Music</SelectItem>
                <SelectItem value="Amazon Music">Amazon Music</SelectItem>
                <SelectItem value="Deezer">Deezer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm h-9 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Selection Bar */}
      {selectedItems.length > 0 && (
        <Card className="border-[#ff0050]/20 bg-[#ff0050]/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckSquare className="h-5 w-5 text-[#ff0050]" />
                <div>
                  <p className="font-medium">
                    {selectedItems.length} failure{selectedItems.length > 1 ? "s" : ""} selected
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedItems([])}>
                  Clear Selection
                </Button>
                <Button onClick={() => handleRetry()} className="bg-[#ff0050] hover:bg-[#cc0040]">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed Deliveries List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <CardTitle className="text-base sm:text-lg">Failed Deliveries</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {filteredFailures.length} failed delivery{filteredFailures.length !== 1 ? "s" : ""} requiring attention
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={selectAll} className="w-full sm:w-auto text-xs sm:text-sm">
              {selectedItems.length === filteredFailures.length ? (
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
        <CardContent>
          <div className="space-y-3">
            {filteredFailures.map((failure) => (
              <div
                key={failure.id}
                className={cn(
                  "flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-all",
                  selectedItems.includes(failure.id) && "border-[#ff0050] bg-[#ff0050]/5",
                  failure.retryCount >= 3 && "border-red-500/30"
                )}
              >
                <Checkbox
                  checked={selectedItems.includes(failure.id)}
                  onCheckedChange={() => toggleSelection(failure.id)}
                  className="self-start sm:self-center mt-1 sm:mt-0"
                />

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4">
                  {/* Release Info */}
                  <div className="sm:col-span-2 md:col-span-2">
                    <p className="font-medium text-sm sm:text-base">{failure.releaseTitle}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{failure.artistName}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <DSPLogo name={failure.dsp} className="h-4 w-4 sm:h-5 sm:w-5" />
                      <p className="text-xs sm:text-sm font-medium">{failure.dsp}</p>
                      {failure.escalated && (
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Escalated
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Error Info */}
                  <div className="sm:col-span-2 md:col-span-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">Error</p>
                    {getErrorTypeBadge(failure.errorCode)}
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                      {failure.errorMessage}
                    </p>
                  </div>

                  {/* Retry Info */}
                  <div className="sm:col-span-1 md:col-span-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Retry Count</p>
                    <p className="text-base sm:text-lg font-semibold text-[#ff0050]">
                      {failure.retryCount}
                    </p>
                    {failure.lastRetryAt && (
                      <p className="text-xs text-muted-foreground">
                        Last: {new Date(failure.lastRetryAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:col-span-1 md:col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewError(failure)}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                      Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRetry(failure)}
                      className="bg-[#ff0050] hover:bg-[#cc0040] w-full sm:w-auto text-xs sm:text-sm"
                    >
                      <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredFailures.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No failed deliveries</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Details Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
            <DialogDescription>
              {currentFailure?.dsp} delivery failure for "{currentFailure?.releaseTitle}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-600 mb-1">{currentFailure?.errorCode}</p>
                  <p className="text-sm text-red-600">{currentFailure?.errorMessage}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground">Failed At</p>
                <p className="text-sm font-medium mt-1">
                  {currentFailure && new Date(currentFailure.failedAt).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground">Retry Count</p>
                <p className="text-sm font-medium mt-1">{currentFailure?.retryCount}</p>
              </div>
            </div>

            {currentFailure && currentFailure.retryCount >= 3 && (
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-600">High Retry Count</p>
                    <p className="text-sm text-orange-600 mt-1">
                      This delivery has failed {currentFailure.retryCount} times. Consider escalating to senior operations or contacting the DSP support team.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowErrorDialog(false)}>
              Close
            </Button>
            {currentFailure && currentFailure.retryCount >= 2 && (
              <Button
                onClick={() => {
                  setShowErrorDialog(false);
                  currentFailure && handleEscalate(currentFailure);
                }}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Escalate
              </Button>
            )}
            <Button
              onClick={() => {
                setShowErrorDialog(false);
                currentFailure && handleRetry(currentFailure);
              }}
              className="bg-[#ff0050] hover:bg-[#cc0040]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retry Progress Dialog */}
      <Dialog open={showRetryProgressDialog} onOpenChange={setShowRetryProgressDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Retry Progress</DialogTitle>
            <DialogDescription>
              {isRetrying ? "Retrying deliveries..." : "Retry process complete."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-2">
                {currentRetryStep}
              </p>
              <Progress value={retryProgress} className="h-3" />
            </div>
            {retryResults && (
              <div className="space-y-2">
                <p className="font-medium">Retry Results:</p>
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Successful Retries</p>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                      {retryResults.successful}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Failed Again</p>
                    <Badge variant="secondary" className="bg-red-500/10 text-red-600">
                      {retryResults.failed}
                    </Badge>
                  </div>
                </div>
                {retryResults.successful > 0 && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-600">
                      {retryResults.successful} delivery{retryResults.successful > 1 ? "s" : ""} successfully delivered and removed from the failed list.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRetryProgressDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalation Dialog */}
      <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Escalate Delivery</DialogTitle>
            <DialogDescription>
              Escalate "{currentFailure?.releaseTitle}" to a support team
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-600 mb-1">{currentFailure?.errorCode}</p>
                  <p className="text-sm text-red-600">{currentFailure?.errorMessage}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground">Failed At</p>
                <p className="text-sm font-medium mt-1">
                  {currentFailure && new Date(currentFailure.failedAt).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground">Retry Count</p>
                <p className="text-sm font-medium mt-1">{currentFailure?.retryCount}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg border">
              <p className="text-sm text-muted-foreground">Escalation Reason</p>
              <Input
                placeholder="Enter reason for escalation..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="p-3 rounded-lg border">
              <p className="text-sm text-muted-foreground">Escalation Notes</p>
              <Input
                placeholder="Enter any additional notes..."
                value={escalationNotes}
                onChange={(e) => setEscalationNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="p-3 rounded-lg border">
              <p className="text-sm text-muted-foreground">Assign To</p>
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="senior-ops">Senior Operations Team</SelectItem>
                  <SelectItem value="dsp-support">DSP Support Team</SelectItem>
                  <SelectItem value="tech-support">Technical Support Team</SelectItem>
                  <SelectItem value="management">Management Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmEscalation}
              className="bg-[#ff0050] hover:bg-[#cc0040]"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Escalate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
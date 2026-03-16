import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
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
  Send,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  CheckSquare,
  Square,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";
import { DSPLogo } from "@/app/components/dsp-logos";

interface DeliveryRelease {
  id: string;
  releaseTitle: string;
  artistName: string;
  upc: string;
  status: "ready" | "scheduled" | "on_hold";
  qcStatus: "passed";
  legalStatus: "approved";
  priority: "vip" | "high" | "normal" | "low";
  daysReady: number;
  readyDate: string;
  scheduledDate?: string;
  holdReason?: string;
  selectedDSPs: string[];
}

const mockDeliveryQueue: DeliveryRelease[] = [
  {
    id: "1",
    releaseTitle: "Electric Dreams",
    artistName: "Neon City",
    upc: "196589654322",
    status: "ready",
    qcStatus: "passed",
    legalStatus: "approved",
    priority: "vip",
    daysReady: 1,
    readyDate: "2026-01-29",
    selectedDSPs: [],
  },
  {
    id: "2",
    releaseTitle: "Bass Drops",
    artistName: "Deep Sound Records",
    upc: "196589654326",
    status: "ready",
    qcStatus: "passed",
    legalStatus: "approved",
    priority: "high",
    daysReady: 2,
    readyDate: "2026-01-28",
    selectedDSPs: [],
  },
  {
    id: "3",
    releaseTitle: "Chill Beats Vol. 1",
    artistName: "Lo-Fi Dreams",
    upc: "196589654327",
    status: "scheduled",
    qcStatus: "passed",
    legalStatus: "approved",
    priority: "normal",
    daysReady: 2,
    readyDate: "2026-01-28",
    scheduledDate: "2026-02-07",
    selectedDSPs: ["spotify", "apple", "youtube"],
  },
  {
    id: "4",
    releaseTitle: "Rock Revolution",
    artistName: "Thunder Strike",
    upc: "196589654328",
    status: "ready",
    qcStatus: "passed",
    legalStatus: "approved",
    priority: "normal",
    daysReady: 3,
    readyDate: "2026-01-27",
    selectedDSPs: [],
  },
  {
    id: "5",
    releaseTitle: "Acoustic Sessions",
    artistName: "Indie Folk Collective",
    upc: "196589654329",
    status: "on_hold",
    qcStatus: "passed",
    legalStatus: "approved",
    priority: "normal",
    daysReady: 5,
    readyDate: "2026-01-25",
    holdReason: "Artist requested delivery delay",
    selectedDSPs: [],
  },
];

const DSP_OPTIONS = [
  { id: "spotify", name: "Spotify" },
  { id: "apple", name: "Apple Music" },
  { id: "youtube", name: "YouTube Music" },
  { id: "amazon", name: "Amazon Music" },
  { id: "deezer", name: "Deezer" },
  { id: "tidal", name: "TIDAL" },
  { id: "soundcloud", name: "SoundCloud" },
  { id: "tiktok", name: "TikTok Music" },
];

export function DeliveryQueue() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"priority" | "ready" | "date">("priority");
  const [showDeliverDialog, setShowDeliverDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [currentRelease, setCurrentRelease] = useState<DeliveryRelease | null>(null);
  const [selectedDSPs, setSelectedDSPs] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");

  const filteredReleases = mockDeliveryQueue
    .filter((release) => {
      const matchesSearch =
        release.releaseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        release.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        release.upc.includes(searchQuery);
      const matchesFilter =
        filterStatus === "all" || release.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { vip: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === "ready") return b.daysReady - a.daysReady;
      if (sortBy === "date") return new Date(b.readyDate).getTime() - new Date(a.readyDate).getTime();
      return 0;
    });

  const readyCount = mockDeliveryQueue.filter((r) => r.status === "ready").length;
  const scheduledCount = mockDeliveryQueue.filter((r) => r.status === "scheduled").length;
  const onHoldCount = mockDeliveryQueue.filter((r) => r.status === "on_hold").length;

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

  const toggleDSP = (dspId: string) => {
    setSelectedDSPs((prev) =>
      prev.includes(dspId) ? prev.filter((id) => id !== dspId) : [...prev, dspId]
    );
  };

  const handleDeliver = (release?: DeliveryRelease) => {
    setCurrentRelease(release || null);
    setSelectedDSPs([]);
    setShowDeliverDialog(true);
  };

  const confirmDeliver = () => {
    if (selectedDSPs.length === 0) {
      toast.error("Please select at least one DSP");
      return;
    }

    if (currentRelease) {
      toast.success(`Delivering "${currentRelease.releaseTitle}" to ${selectedDSPs.length} DSP${selectedDSPs.length > 1 ? "s" : ""}...`);
    } else {
      toast.success(`Delivering ${selectedItems.length} release${selectedItems.length > 1 ? "s" : ""} to ${selectedDSPs.length} DSP${selectedDSPs.length > 1 ? "s" : ""}...`);
      setSelectedItems([]);
    }
    setShowDeliverDialog(false);
    setCurrentRelease(null);
    setSelectedDSPs([]);
  };

  const handleSchedule = (release: DeliveryRelease) => {
    setCurrentRelease(release);
    setScheduledDate("");
    setSelectedDSPs([]);
    setShowScheduleDialog(true);
  };

  const confirmSchedule = () => {
    if (!scheduledDate) {
      toast.error("Please select a scheduled date");
      return;
    }
    if (selectedDSPs.length === 0) {
      toast.error("Please select at least one DSP");
      return;
    }

    toast.success(`Scheduled "${currentRelease?.releaseTitle}" for ${new Date(scheduledDate).toLocaleDateString()}`);
    setShowScheduleDialog(false);
    setCurrentRelease(null);
    setScheduledDate("");
    setSelectedDSPs([]);
  };

  const handleHold = (release: DeliveryRelease) => {
    toast.warning(`Placed "${release.releaseTitle}" on hold`);
  };

  const getStatusBadge = (status: DeliveryRelease["status"]) => {
    const variants = {
      ready: "bg-green-500/10 text-green-600 border-green-500/20",
      scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      on_hold: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    };

    const labels = {
      ready: "Ready to Deliver",
      scheduled: "Scheduled",
      on_hold: "On Hold",
    };

    const icons = {
      ready: <CheckCircle2 className="h-3 w-3 mr-1" />,
      scheduled: <Calendar className="h-3 w-3 mr-1" />,
      on_hold: <Pause className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: DeliveryRelease["priority"]) => {
    const variants = {
      vip: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      high: "bg-red-500/10 text-red-600 border-red-500/20",
      normal: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      low: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };

    return (
      <Badge variant="secondary" className={variants[priority]}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready to Deliver</p>
                <p className="text-2xl font-semibold mt-1">{readyCount}</p>
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
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-semibold mt-1">{scheduledCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Hold</p>
                <p className="text-2xl font-semibold mt-1">{onHoldCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Pause className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, artist, or UPC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="ready">Sort by Days Ready</SelectItem>
                <SelectItem value="date">Sort by Date</SelectItem>
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
              <div className="flex items-center gap-3 sm:gap-4">
                <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff0050] flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm sm:text-base">
                    {selectedItems.length} release{selectedItems.length > 1 ? "s" : ""} selected
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedItems([])}
                  className="w-full sm:w-auto text-sm"
                  size="sm"
                >
                  Clear Selection
                </Button>
                <Button 
                  onClick={() => handleDeliver()} 
                  className="bg-[#ff0050] hover:bg-[#cc0040] w-full sm:w-auto text-sm"
                  size="sm"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Deliver Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Queue List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Delivery Queue</CardTitle>
              <CardDescription>
                {filteredReleases.length} release{filteredReleases.length !== 1 ? "s" : ""} ready for delivery
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedItems.length === filteredReleases.length ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Select All
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          {filteredReleases.length === 0 ? (
            <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg mx-4 sm:mx-0">
              <Send className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm sm:text-base text-muted-foreground">No releases in delivery queue</p>
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
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-muted-foreground">Clearances</th>
                    <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-muted-foreground">Ready/Scheduled</th>
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
                          disabled={release.status === "on_hold"}
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
                          {getStatusBadge(release.status)}
                          {getPriorityBadge(release.priority)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            QC
                          </Badge>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Legal
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {release.status === "scheduled" && release.scheduledDate ? (
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Scheduled For</p>
                            <p className="text-xs sm:text-sm font-semibold text-blue-600">
                              {new Date(release.scheduledDate).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">Ready For</p>
                            <p className="text-base sm:text-lg font-semibold text-[#ff0050]">
                              {release.daysReady} day{release.daysReady !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {release.status === "ready" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSchedule(release)}
                                className="text-xs sm:text-sm whitespace-nowrap"
                              >
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                Schedule
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDeliver(release)}
                                className="bg-[#ff0050] hover:bg-[#cc0040] text-xs sm:text-sm whitespace-nowrap"
                              >
                                <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                Deliver Now
                              </Button>
                            </>
                          )}
                          {release.status === "scheduled" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.info(`Cancel scheduled delivery for ${release.releaseTitle}`)}
                              className="text-xs sm:text-sm whitespace-nowrap"
                            >
                              Cancel Schedule
                            </Button>
                          )}
                          {release.status === "on_hold" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.success(`Released hold on ${release.releaseTitle}`)}
                              className="text-xs sm:text-sm whitespace-nowrap"
                            >
                              Release Hold
                            </Button>
                          )}
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

      {/* Deliver Dialog */}
      <Dialog open={showDeliverDialog} onOpenChange={setShowDeliverDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deliver to DSPs</DialogTitle>
            <DialogDescription>
              {currentRelease
                ? `Deliver "${currentRelease.releaseTitle}" to streaming platforms`
                : `Deliver ${selectedItems.length} release${selectedItems.length > 1 ? "s" : ""} to streaming platforms`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">Select DSPs *</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DSP_OPTIONS.map((dsp) => (
                  <button
                    key={dsp.id}
                    onClick={() => toggleDSP(dsp.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-center",
                      selectedDSPs.includes(dsp.id)
                        ? "border-[#ff0050] bg-[#ff0050]/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <DSPLogo name={dsp.name} className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-medium">{dsp.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm">
                <strong>Selected DSPs:</strong>{" "}
                {selectedDSPs.length > 0 ? selectedDSPs.length : "None"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliverDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDeliver}
              className="bg-[#ff0050] hover:bg-[#cc0040]"
              disabled={selectedDSPs.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Deliver Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Delivery</DialogTitle>
            <DialogDescription>
              Schedule "{currentRelease?.releaseTitle}" for future delivery
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Date *</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 rounded-lg border bg-background"
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Select DSPs *</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DSP_OPTIONS.map((dsp) => (
                  <button
                    key={dsp.id}
                    onClick={() => toggleDSP(dsp.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-center",
                      selectedDSPs.includes(dsp.id)
                        ? "border-[#ff0050] bg-[#ff0050]/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <DSPLogo name={dsp.name} className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-medium">{dsp.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmSchedule}
              className="bg-blue-500 hover:bg-blue-600"
              disabled={!scheduledDate || selectedDSPs.length === 0}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
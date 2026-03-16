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
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Eye,
  CheckSquare,
  Square,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { ClearanceQueueTable } from "./clearance-queue-table";

interface ClearanceItem {
  id: string;
  releaseTitle: string;
  artistName: string;
  upc: string;
  status: "pending" | "missing_docs" | "ready" | "approved" | "rejected";
  sampleLicensesCount: number;
  rightsDocsCount: number;
  daysWaiting: number;
  submittedDate: string;
  submittedBy: string;
  priority: "urgent" | "high" | "normal" | "low";
  notes?: string;
}

const mockClearances: ClearanceItem[] = [
  {
    id: "1",
    releaseTitle: "Summer Nights EP",
    artistName: "The Waves",
    upc: "196589654321",
    status: "ready",
    sampleLicensesCount: 2,
    rightsDocsCount: 3,
    daysWaiting: 2,
    submittedDate: "2026-01-28",
    submittedBy: "artist@thewaves.com",
    priority: "high",
  },
  {
    id: "2",
    releaseTitle: "Electric Dreams",
    artistName: "Neon City",
    upc: "196589654322",
    status: "ready",
    sampleLicensesCount: 1,
    rightsDocsCount: 2,
    daysWaiting: 1,
    submittedDate: "2026-01-29",
    submittedBy: "neon@example.com",
    priority: "normal",
  },
  {
    id: "3",
    releaseTitle: "Ocean Vibes Vol. 3",
    artistName: "Coast Collective",
    upc: "196589654323",
    status: "missing_docs",
    sampleLicensesCount: 0,
    rightsDocsCount: 1,
    daysWaiting: 5,
    submittedDate: "2026-01-25",
    submittedBy: "coast@example.com",
    priority: "normal",
    notes: "Missing sample clearance for Track 3",
  },
  {
    id: "4",
    releaseTitle: "Midnight Sessions",
    artistName: "Urban Sound",
    upc: "196589654324",
    status: "ready",
    sampleLicensesCount: 3,
    rightsDocsCount: 4,
    daysWaiting: 3,
    submittedDate: "2026-01-27",
    submittedBy: "urban@example.com",
    priority: "urgent",
  },
  {
    id: "5",
    releaseTitle: "Synth Wave Anthology",
    artistName: "Retro Future",
    upc: "196589654325",
    status: "pending",
    sampleLicensesCount: 1,
    rightsDocsCount: 1,
    daysWaiting: 1,
    submittedDate: "2026-01-29",
    submittedBy: "retro@example.com",
    priority: "low",
  },
  {
    id: "6",
    releaseTitle: "Bass Drops",
    artistName: "Deep Sound Records",
    upc: "196589654326",
    status: "missing_docs",
    sampleLicensesCount: 0,
    rightsDocsCount: 0,
    daysWaiting: 7,
    submittedDate: "2026-01-23",
    submittedBy: "deep@example.com",
    priority: "high",
    notes: "No documentation uploaded yet",
  },
  {
    id: "7",
    releaseTitle: "Chill Beats Vol. 1",
    artistName: "Lo-Fi Dreams",
    upc: "196589654327",
    status: "ready",
    sampleLicensesCount: 4,
    rightsDocsCount: 5,
    daysWaiting: 2,
    submittedDate: "2026-01-28",
    submittedBy: "lofi@example.com",
    priority: "normal",
  },
  {
    id: "8",
    releaseTitle: "Rock Revolution",
    artistName: "Thunder Strike",
    upc: "196589654328",
    status: "approved",
    sampleLicensesCount: 0,
    rightsDocsCount: 2,
    daysWaiting: 10,
    submittedDate: "2026-01-20",
    submittedBy: "thunder@example.com",
    priority: "normal",
  },
];

export function ClearanceQueue() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "waiting">("waiting");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showRequestInfoDialog, setShowRequestInfoDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<ClearanceItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [requestInfoMessage, setRequestInfoMessage] = useState("");

  const filteredItems = mockClearances
    .filter((item) => {
      const matchesSearch =
        item.releaseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.upc.includes(searchQuery);
      const matchesFilter =
        filterStatus === "all" || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "waiting") return b.daysWaiting - a.daysWaiting;
      if (sortBy === "priority") {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === "date") return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
      return 0;
    });

  const pendingCount = mockClearances.filter((i) => i.status === "pending").length;
  const readyCount = mockClearances.filter((i) => i.status === "ready").length;
  const missingDocsCount = mockClearances.filter((i) => i.status === "missing_docs").length;
  const approvedCount = mockClearances.filter((i) => i.status === "approved").length;

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((i) => i.id));
    }
  };

  const handleApprove = (item?: ClearanceItem) => {
    if (item) {
      setCurrentItem(item);
      setShowApproveDialog(true);
    } else if (selectedItems.length > 0) {
      setShowApproveDialog(true);
    }
  };

  const confirmApprove = () => {
    if (currentItem) {
      toast.success(`Approved: ${currentItem.releaseTitle}`);
    } else {
      toast.success(`Approved ${selectedItems.length} release${selectedItems.length > 1 ? "s" : ""}`);
      setSelectedItems([]);
    }
    setShowApproveDialog(false);
    setCurrentItem(null);
  };

  const handleReject = (item: ClearanceItem) => {
    setCurrentItem(item);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (currentItem && rejectionReason.trim()) {
      toast.error(`Rejected: ${currentItem.releaseTitle}`);
      setShowRejectDialog(false);
      setCurrentItem(null);
      setRejectionReason("");
    } else {
      toast.error("Please provide a rejection reason");
    }
  };

  const handleRequestInfo = (item: ClearanceItem) => {
    setCurrentItem(item);
    setRequestInfoMessage("");
    setShowRequestInfoDialog(true);
  };

  const confirmRequestInfo = () => {
    if (currentItem && requestInfoMessage.trim()) {
      toast.info(`Information requested from ${currentItem.artistName}`);
      setShowRequestInfoDialog(false);
      setCurrentItem(null);
      setRequestInfoMessage("");
    } else {
      toast.error("Please provide a message");
    }
  };

  const getStatusBadge = (status: ClearanceItem["status"]) => {
    const variants = {
      pending: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      missing_docs: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      ready: "bg-green-500/10 text-green-600 border-green-500/20",
      approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      rejected: "bg-red-500/10 text-red-600 border-red-500/20",
    };

    const labels = {
      pending: "Pending Review",
      missing_docs: "Missing Docs",
      ready: "Ready to Approve",
      approved: "Approved",
      rejected: "Rejected",
    };

    const icons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      missing_docs: <AlertCircle className="h-3 w-3 mr-1" />,
      ready: <CheckCircle2 className="h-3 w-3 mr-1" />,
      approved: <CheckCircle2 className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: ClearanceItem["priority"]) => {
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
                <p className="text-sm text-muted-foreground">Ready to Approve</p>
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
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-semibold mt-1">{pendingCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Missing Docs</p>
                <p className="text-2xl font-semibold mt-1">{missingDocsCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-semibold mt-1">{approvedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="px-3.5 sm:px-6 pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, artist, or UPC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready to Approve</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="missing_docs">Missing Docs</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="waiting">Sort by Days Waiting</SelectItem>
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="date">Sort by Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Selection Bar */}
      {selectedItems.length > 0 && (
        <Card className="border-[#ff0050]/20 bg-[#ff0050]/5">
          <CardContent className="pt-4 px-3 md:pt-6 md:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-4">
                <CheckSquare className="h-4 w-4 md:h-5 md:w-5 text-[#ff0050]" />
                <div>
                  <p className="text-sm md:text-base font-medium">
                    {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedItems([])}
                  className="flex-1 sm:flex-none text-xs md:text-sm h-8 md:h-9 px-2 md:px-4 whitespace-nowrap"
                >
                  <span className="hidden xs:inline">Clear </span>Selection
                </Button>
                <Button 
                  onClick={() => handleApprove()} 
                  className="bg-green-500 hover:bg-green-600 flex-1 sm:flex-none text-xs md:text-sm h-8 md:h-9 px-2 md:px-4 whitespace-nowrap"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
                  <span className="hidden xs:inline">Approve </span>Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clearance List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl">Clearance Queue</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                {filteredItems.length} release{filteredItems.length !== 1 ? "s" : ""} awaiting legal review
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={selectAll} className="w-full sm:w-auto flex-shrink-0">
              {selectedItems.length === filteredItems.length ? (
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
        <CardContent className="px-3.5 sm:px-6 pt-6">
          <ClearanceQueueTable
            items={filteredItems}
            selectedItems={selectedItems}
            onToggleSelection={toggleSelection}
            onView={(item) => {
              setCurrentItem(item);
              setShowViewDialog(true);
            }}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestInfo={handleRequestInfo}
          />
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
            <DialogDescription>
              {currentItem
                ? `Approve "${currentItem.releaseTitle}" for distribution?`
                : `Approve ${selectedItems.length} release${selectedItems.length > 1 ? "s" : ""} for distribution?`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will mark the release{selectedItems.length > 1 || !currentItem ? "s" : ""} as legally cleared and ready for distribution to DSPs.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove} className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Release</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting "{currentItem?.releaseTitle}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Missing sample clearance for Track 3..."
                className="w-full min-h-[100px] px-3 py-2 rounded-lg border bg-background resize-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The artist will be notified via email with this reason
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmReject}
              className="bg-red-500 hover:bg-red-600"
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Details</DialogTitle>
            <DialogDescription>
              {currentItem ? `Details for "${currentItem.releaseTitle}"` : "Release Details"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {currentItem && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <p className="font-medium">Release Title:</p>
                  <p className="text-sm text-muted-foreground">{currentItem.releaseTitle}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">Artist Name:</p>
                  <p className="text-sm text-muted-foreground">{currentItem.artistName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">UPC:</p>
                  <p className="text-sm font-mono">{currentItem.upc}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">Status:</p>
                  {getStatusBadge(currentItem.status)}
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">Priority:</p>
                  {getPriorityBadge(currentItem.priority)}
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">Days Waiting:</p>
                  <p className="text-lg font-semibold text-[#ff0050]">
                    {currentItem.daysWaiting} day{currentItem.daysWaiting !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Since {new Date(currentItem.submittedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">Sample Licenses:</p>
                  <Badge variant="outline" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {currentItem.sampleLicensesCount} samples
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">Rights Documents:</p>
                  <Badge variant="outline" className="text-xs">
                    {currentItem.rightsDocsCount} docs
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">Submitted By:</p>
                  <p className="text-sm text-muted-foreground">{currentItem.submittedBy}</p>
                </div>
                {currentItem.notes && (
                  <div className="flex items-center gap-4">
                    <p className="font-medium">Notes:</p>
                    <p className="text-sm text-muted-foreground">{currentItem.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog open={showRequestInfoDialog} onOpenChange={setShowRequestInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Information</DialogTitle>
            <DialogDescription>
              Request additional information from {currentItem?.artistName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Message to Artist *</label>
              <textarea
                value={requestInfoMessage}
                onChange={(e) => setRequestInfoMessage(e.target.value)}
                placeholder="e.g., Please provide sample clearance documentation for Track 3..."
                className="w-full min-h-[100px] px-3 py-2 rounded-lg border bg-background resize-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {currentItem?.artistName} will be notified via email at {currentItem?.submittedBy}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestInfoDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmRequestInfo}
              className="bg-[#ff0050] hover:bg-[#ff0050]/90"
              disabled={!requestInfoMessage.trim()}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
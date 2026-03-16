import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
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
  Gavel,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Send,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";

interface Dispute {
  id: string;
  caseId: string;
  releaseTitle: string;
  artistName: string;
  disputeType: "dmca_counter" | "royalty" | "contract" | "ownership" | "other";
  claimantName: string;
  filedDate: string;
  status: "open" | "under_review" | "mediation" | "resolved" | "escalated";
  priority: "urgent" | "high" | "normal" | "low";
  daysOpen: number;
  assignedTo?: string;
  description: string;
}

const mockDisputes: Dispute[] = [
  {
    id: "1",
    caseId: "DIS-2026-001",
    releaseTitle: "Summer Nights EP",
    artistName: "The Waves",
    disputeType: "dmca_counter",
    claimantName: "Major Record Label Inc.",
    filedDate: "2026-01-25",
    status: "under_review",
    priority: "urgent",
    daysOpen: 6,
    assignedTo: "Legal Team A",
    description: "Artist filing counter-notice to DMCA claim, asserting fair use of sample",
  },
  {
    id: "2",
    caseId: "DIS-2026-002",
    releaseTitle: "Electric Dreams",
    artistName: "Neon City",
    disputeType: "royalty",
    claimantName: "Independent Producer",
    filedDate: "2026-01-28",
    status: "open",
    priority: "high",
    daysOpen: 3,
    description: "Dispute over producer royalty split percentage",
  },
  {
    id: "3",
    caseId: "DIS-2026-003",
    releaseTitle: "Ocean Vibes Vol. 3",
    artistName: "Coast Collective",
    disputeType: "ownership",
    claimantName: "Former Member",
    filedDate: "2026-01-20",
    status: "mediation",
    priority: "high",
    daysOpen: 11,
    assignedTo: "Legal Team B",
    description: "Former band member claiming co-ownership of masters",
  },
  {
    id: "4",
    caseId: "DIS-2026-004",
    releaseTitle: "Bass Drops",
    artistName: "Deep Sound Records",
    disputeType: "contract",
    claimantName: "Previous Label",
    filedDate: "2026-01-15",
    status: "resolved",
    priority: "normal",
    daysOpen: 16,
    assignedTo: "Legal Team A",
    description: "Dispute over contract termination clause - resolved in artist's favor",
  },
  {
    id: "5",
    caseId: "DIS-2026-005",
    releaseTitle: "Midnight Sessions",
    artistName: "Urban Sound",
    disputeType: "royalty",
    claimantName: "Songwriter",
    filedDate: "2026-01-27",
    status: "escalated",
    priority: "urgent",
    daysOpen: 4,
    assignedTo: "Legal Team B",
    description: "Escalated dispute regarding mechanical royalty payments",
  },
];

export function DisputesView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "daysOpen">("daysOpen");
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [currentDispute, setCurrentDispute] = useState<Dispute | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseAction, setResponseAction] = useState("");

  const filteredDisputes = mockDisputes
    .filter((dispute) => {
      const matchesSearch =
        dispute.releaseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dispute.claimantName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || dispute.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "daysOpen") return b.daysOpen - a.daysOpen;
      if (sortBy === "priority") {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === "date") return new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime();
      return 0;
    });

  const openCount = mockDisputes.filter((d) => d.status === "open").length;
  const underReviewCount = mockDisputes.filter((d) => d.status === "under_review").length;
  const escalatedCount = mockDisputes.filter((d) => d.status === "escalated").length;
  const resolvedCount = mockDisputes.filter((d) => d.status === "resolved").length;

  const handleView = (dispute: Dispute) => {
    setCurrentDispute(dispute);
    setShowViewDialog(true);
  };

  const handleRespond = (dispute: Dispute) => {
    setCurrentDispute(dispute);
    setShowResponseDialog(true);
  };

  const confirmResponse = () => {
    if (currentDispute && responseAction && responseMessage.trim()) {
      toast.success(`Response sent for case ${currentDispute.caseId}`);
      setShowResponseDialog(false);
      setCurrentDispute(null);
      setResponseAction("");
      setResponseMessage("");
    } else {
      toast.error("Please select an action and provide a message");
    }
  };

  const getStatusBadge = (status: Dispute["status"]) => {
    const variants = {
      open: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      under_review: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      mediation: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      resolved: "bg-green-500/10 text-green-600 border-green-500/20",
      escalated: "bg-red-500/10 text-red-600 border-red-500/20",
    };

    const labels = {
      open: "Open",
      under_review: "Under Review",
      mediation: "In Mediation",
      resolved: "Resolved",
      escalated: "Escalated",
    };

    const icons = {
      open: <Clock className="h-3 w-3 mr-1" />,
      under_review: <Eye className="h-3 w-3 mr-1" />,
      mediation: <Gavel className="h-3 w-3 mr-1" />,
      resolved: <CheckCircle2 className="h-3 w-3 mr-1" />,
      escalated: <AlertCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Dispute["priority"]) => {
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

  const getDisputeTypeBadge = (type: Dispute["disputeType"]) => {
    const labels = {
      dmca_counter: "DMCA Counter",
      royalty: "Royalty",
      contract: "Contract",
      ownership: "Ownership",
      other: "Other",
    };

    return (
      <Badge variant="outline" className="text-xs">
        {labels[type]}
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
                <p className="text-sm text-muted-foreground">Open Cases</p>
                <p className="text-2xl font-semibold mt-1">{openCount}</p>
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
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-semibold mt-1">{underReviewCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Escalated</p>
                <p className="text-2xl font-semibold mt-1">{escalatedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-semibold mt-1">{resolvedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="px-3.5 sm:px-6 pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by case ID, release, artist, or claimant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="mediation">In Mediation</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daysOpen">Sort by Days Open</SelectItem>
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="date">Sort by Filed Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Disputes List */}
      <Card>
        <CardHeader>
          <CardTitle>Disputes</CardTitle>
          <CardDescription>
            {filteredDisputes.length} dispute case{filteredDisputes.length !== 1 ? "s" : ""} requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="space-y-3">
            {filteredDisputes.map((dispute) => (
              <div
                key={dispute.id}
                className={cn(
                  "p-3 md:p-4 rounded-lg border",
                  dispute.status === "escalated" && "border-red-500/30 bg-red-500/5"
                )}
              >
                <div className="flex flex-col items-center md:flex-row md:items-start gap-3 md:gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                    <Gavel className="h-5 w-5 text-[#ff0050]" />
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                        <h3 className="text-sm md:text-base font-semibold text-center md:text-left">{dispute.releaseTitle}</h3>
                        <Badge variant="outline" className="text-xs">{dispute.caseId}</Badge>
                        {getDisputeTypeBadge(dispute.disputeType)}
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(dispute)}
                          className="h-8 px-2 md:h-9 md:px-3"
                        >
                          <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                          <span className="hidden md:inline">View</span>
                        </Button>
                        {(dispute.status === "open" || dispute.status === "under_review") && (
                          <Button
                            size="sm"
                            onClick={() => handleRespond(dispute)}
                            className="bg-[#ff0050] hover:bg-[#cc0040] h-8 px-2 md:h-9 md:px-3"
                          >
                            <Send className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                            <span className="hidden md:inline">Respond</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-2 md:mt-3">
                      <div className="text-center md:text-left">
                        <p className="text-xs md:text-sm text-muted-foreground">Artist</p>
                        <p className="font-medium text-xs md:text-sm">{dispute.artistName}</p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-xs md:text-sm text-muted-foreground">Claimant</p>
                        <p className="font-medium text-xs md:text-sm">{dispute.claimantName}</p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-xs md:text-sm text-muted-foreground">Days Open</p>
                        <p className="font-semibold text-xs md:text-sm text-[#ff0050]">{dispute.daysOpen} days</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap mt-2 md:mt-3">
                      {getStatusBadge(dispute.status)}
                      {getPriorityBadge(dispute.priority)}
                      {dispute.assignedTo && (
                        <Badge variant="outline" className="text-xs">
                          Assigned: {dispute.assignedTo}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-2 md:mt-3 p-2 md:p-3 rounded-lg bg-muted">
                      <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">{dispute.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredDisputes.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No disputes found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>
              Full details for case {currentDispute?.caseId}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {currentDispute && (
              <>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Case Information</h3>
                  <div className="p-3 rounded-lg bg-muted space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Case ID:</p>
                      <p className="text-sm text-muted-foreground">{currentDispute.caseId}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Filed Date:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentDispute.filedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Days Open:</p>
                      <p className="text-sm text-muted-foreground">{currentDispute.daysOpen} days</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Status:</p>
                      {getStatusBadge(currentDispute.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Priority:</p>
                      {getPriorityBadge(currentDispute.priority)}
                    </div>
                    {currentDispute.assignedTo && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Assigned To:</p>
                        <p className="text-sm text-muted-foreground">{currentDispute.assignedTo}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Release & Parties</h3>
                  <div className="p-3 rounded-lg bg-muted space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Release:</p>
                      <p className="text-sm text-muted-foreground">{currentDispute.releaseTitle}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Artist:</p>
                      <p className="text-sm text-muted-foreground">{currentDispute.artistName}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Claimant:</p>
                      <p className="text-sm text-muted-foreground">{currentDispute.claimantName}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Dispute Type:</p>
                      {getDisputeTypeBadge(currentDispute.disputeType)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Description</h3>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">{currentDispute.description}</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {currentDispute && (currentDispute.status === "open" || currentDispute.status === "under_review") && (
              <Button
                onClick={() => {
                  setShowViewDialog(false);
                  handleRespond(currentDispute);
                }}
                className="bg-[#ff0050] hover:bg-[#cc0040]"
              >
                <Send className="h-4 w-4 mr-2" />
                Respond to Case
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Dispute</DialogTitle>
            <DialogDescription>
              Send a response for case {currentDispute?.caseId}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action *</label>
              <Select value={responseAction} onValueChange={setResponseAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="review">Mark Under Review</SelectItem>
                  <SelectItem value="mediation">Send to Mediation</SelectItem>
                  <SelectItem value="request_info">Request More Information</SelectItem>
                  <SelectItem value="resolve">Resolve Case</SelectItem>
                  <SelectItem value="escalate">Escalate Case</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Response Message *</label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Enter your response message..."
                className="min-h-[150px]"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              All parties will be notified of this response
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmResponse}
              className="bg-[#ff0050] hover:bg-[#cc0040]"
              disabled={!responseAction || !responseMessage.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
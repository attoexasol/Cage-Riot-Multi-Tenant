import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
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
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Shield,
  Eye,
  Send,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";

interface DMCANotice {
  id: string;
  claimantName: string;
  claimantEmail: string;
  releaseTitle: string;
  artistName: string;
  claimDescription: string;
  receivedDate: string;
  responseDeadline: string;
  status: "pending" | "investigating" | "accepted" | "rejected" | "counter_notice" | "escalated";
  priority: "urgent" | "high" | "normal";
  assignedTo?: string;
  daysUntilDeadline: number;
}

const mockNotices: DMCANotice[] = [
  {
    id: "1",
    claimantName: "Major Record Label Inc.",
    claimantEmail: "legal@majorlabel.com",
    releaseTitle: "Summer Nights EP",
    artistName: "The Waves",
    claimDescription: "Unauthorized use of copyrighted sample from 'Sunset Dreams' (2020)",
    receivedDate: "2026-01-25",
    responseDeadline: "2026-02-08",
    status: "pending",
    priority: "urgent",
    daysUntilDeadline: 9,
  },
  {
    id: "2",
    claimantName: "Independent Artist",
    claimantEmail: "artist@example.com",
    releaseTitle: "Electric Dreams",
    artistName: "Neon City",
    claimDescription: "Track 'Midnight City' contains unlicensed vocal sample",
    receivedDate: "2026-01-27",
    responseDeadline: "2026-02-10",
    status: "investigating",
    priority: "high",
    assignedTo: "Legal Team",
    daysUntilDeadline: 11,
  },
  {
    id: "3",
    claimantName: "Music Publishing Corp",
    claimantEmail: "dmca@musicpub.com",
    releaseTitle: "Ocean Vibes Vol. 3",
    artistName: "Coast Collective",
    claimDescription: "Alleged copyright infringement on melody composition",
    receivedDate: "2026-01-20",
    responseDeadline: "2026-02-03",
    status: "pending",
    priority: "urgent",
    daysUntilDeadline: 4,
  },
  {
    id: "4",
    claimantName: "Beat Producer",
    claimantEmail: "producer@beats.com",
    releaseTitle: "Bass Drops",
    artistName: "Deep Sound Records",
    claimDescription: "Unauthorized use of instrumental beat 'Deep Space'",
    receivedDate: "2026-01-15",
    responseDeadline: "2026-01-29",
    status: "rejected",
    priority: "normal",
    assignedTo: "Legal Team",
    daysUntilDeadline: -1,
  },
  {
    id: "5",
    claimantName: "Songwriter Alliance",
    claimantEmail: "legal@songwriters.org",
    releaseTitle: "Chill Beats Vol. 1",
    artistName: "Lo-Fi Dreams",
    claimDescription: "Uncleared mechanical rights for composition 'Rainy Day'",
    receivedDate: "2026-01-28",
    responseDeadline: "2026-02-11",
    status: "pending",
    priority: "high",
    daysUntilDeadline: 12,
  },
];

export function DMCAInbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"deadline" | "received" | "priority">("deadline");
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [currentNotice, setCurrentNotice] = useState<DMCANotice | null>(null);
  const [responseType, setResponseType] = useState<string>("");
  const [responseMessage, setResponseMessage] = useState("");

  const filteredNotices = mockNotices
    .filter((notice) => {
      const matchesSearch =
        notice.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.releaseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.artistName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || notice.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "deadline") return a.daysUntilDeadline - b.daysUntilDeadline;
      if (sortBy === "priority") {
        const priorityOrder = { urgent: 0, high: 1, normal: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === "received") return new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime();
      return 0;
    });

  const pendingCount = mockNotices.filter((n) => n.status === "pending").length;
  const investigatingCount = mockNotices.filter((n) => n.status === "investigating").length;
  const urgentCount = mockNotices.filter((n) => n.priority === "urgent" && n.daysUntilDeadline >= 0).length;

  const handleRespond = (notice: DMCANotice) => {
    setCurrentNotice(notice);
    setShowResponseDialog(true);
  };

  const handleView = (notice: DMCANotice) => {
    setCurrentNotice(notice);
    setShowViewDialog(true);
  };

  const confirmResponse = () => {
    if (currentNotice && responseType && responseMessage.trim()) {
      const responseLabels: Record<string, string> = {
        accept: "Accepted claim",
        reject: "Rejected claim",
        counter: "Filed counter-notice",
        request_info: "Requested more information",
      };
      toast.success(`${responseLabels[responseType]} for "${currentNotice.releaseTitle}"`);
      setShowResponseDialog(false);
      setCurrentNotice(null);
      setResponseType("");
      setResponseMessage("");
    } else {
      toast.error("Please select response type and provide a message");
    }
  };

  const getStatusBadge = (status: DMCANotice["status"]) => {
    const variants = {
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      investigating: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      accepted: "bg-green-500/10 text-green-600 border-green-500/20",
      rejected: "bg-red-500/10 text-red-600 border-red-500/20",
      counter_notice: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      escalated: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    };

    const labels = {
      pending: "Pending",
      investigating: "Investigating",
      accepted: "Accepted",
      rejected: "Rejected",
      counter_notice: "Counter Notice",
      escalated: "Escalated",
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: DMCANotice["priority"]) => {
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

  const getDeadlineBadge = (days: number) => {
    if (days < 0) {
      return (
        <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    } else if (days <= 3) {
      return (
        <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
          <Clock className="h-3 w-3 mr-1" />
          {days} day{days !== 1 ? "s" : ""}
        </Badge>
      );
    } else if (days <= 7) {
      return (
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          <Clock className="h-3 w-3 mr-1" />
          {days} days
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
          <Clock className="h-3 w-3 mr-1" />
          {days} days
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Response</p>
                <p className="text-2xl font-semibold mt-1">{pendingCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investigating</p>
                <p className="text-2xl font-semibold mt-1">{investigatingCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent Deadlines</p>
                <p className="text-2xl font-semibold mt-1">{urgentCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Notices</p>
                <p className="text-2xl font-semibold mt-1">{mockNotices.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="px-3.5 sm:px-6 pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by claimant, release, or artist..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">Sort by Deadline</SelectItem>
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="received">Sort by Received</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* DMCA Notices List */}
      <Card>
        <CardHeader>
          <CardTitle>DMCA Notices</CardTitle>
          <CardDescription>
            {filteredNotices.length} notice{filteredNotices.length !== 1 ? "s" : ""} requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[200px]">Claimant</th>
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">Affected Release</th>
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[250px]">Claim Description</th>
                    <th className="text-left p-2 md:p-3 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[150px]">Deadline</th>
                    <th className="text-right p-2 md:p-3 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[200px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotices.map((notice) => (
                    <tr
                      key={notice.id}
                      className={cn(
                        "border-b transition-all hover:bg-muted/50",
                        notice.daysUntilDeadline <= 3 && notice.daysUntilDeadline >= 0 && "bg-red-500/5 border-red-500/20"
                      )}
                    >
                      {/* Claimant Info */}
                      <td className="p-2 md:p-3 align-top">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                            <Shield className="h-4 w-4 md:h-5 md:w-5 text-[#ff0050]" />
                          </div>
                          <div>
                            <p className="font-medium text-xs md:text-sm whitespace-nowrap">{notice.claimantName}</p>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">{notice.claimantEmail}</p>
                            <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1 md:mt-2">
                              {getStatusBadge(notice.status)}
                              {getPriorityBadge(notice.priority)}
                            </div>
                            {notice.assignedTo && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Assigned to: {notice.assignedTo}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Affected Release */}
                      <td className="p-2 md:p-3 align-top">
                        <p className="font-medium text-xs md:text-sm whitespace-nowrap">{notice.releaseTitle}</p>
                        <p className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">{notice.artistName}</p>
                      </td>

                      {/* Claim Description */}
                      <td className="p-2 md:p-3 align-top">
                        <div className="max-w-[250px]">
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                            {notice.claimDescription}
                          </p>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td className="p-2 md:p-3 align-top">
                        <p className="font-medium text-xs md:text-sm whitespace-nowrap">
                          {new Date(notice.responseDeadline).toLocaleDateString()}
                        </p>
                        <div className="mt-1">
                          {getDeadlineBadge(notice.daysUntilDeadline)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-2 md:p-3 align-top">
                        <div className="flex items-center justify-end gap-1 md:gap-2 whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(notice)}
                            className="text-xs md:text-sm"
                          >
                            <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            View
                          </Button>
                          {(notice.status === "pending" || notice.status === "investigating") && (
                            <Button
                              size="sm"
                              onClick={() => handleRespond(notice)}
                              className="bg-[#ff0050] hover:bg-[#cc0040] text-xs md:text-sm"
                            >
                              <Send className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              Respond
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredNotices.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg mt-4 mx-4 sm:mx-0">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No DMCA notices found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to DMCA Notice</DialogTitle>
            <DialogDescription>
              From: {currentNotice?.claimantName} regarding "{currentNotice?.releaseTitle}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Notice Summary */}
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium mb-2">Claim:</p>
              <p className="text-sm text-muted-foreground">{currentNotice?.claimDescription}</p>
            </div>

            {/* Response Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Response Type *</label>
              <Select value={responseType} onValueChange={setResponseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select response type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accept">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Accept Claim - Remove Content</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="reject">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Reject Claim - Counter Notice</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="request_info">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span>Request More Information</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="counter">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      <span>File Counter-Notice</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Response Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Response Message *</label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Enter your response message to the claimant..."
                className="w-full min-h-[150px] px-3 py-2 rounded-lg border bg-background resize-none"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              This response will be sent to {currentNotice?.claimantEmail}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmResponse}
              className="bg-[#ff0050] hover:bg-[#cc0040]"
              disabled={!responseType || !responseMessage.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>DMCA Notice Details</DialogTitle>
            <DialogDescription>
              Full details for this DMCA notice
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {currentNotice && (
              <>
                {/* Claimant Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Claimant Information</h3>
                  <div className="p-3 rounded-lg bg-muted space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Name:</p>
                      <p className="text-sm text-muted-foreground">{currentNotice.claimantName}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Email:</p>
                      <p className="text-sm text-muted-foreground">{currentNotice.claimantEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Affected Release */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Affected Release</h3>
                  <div className="p-3 rounded-lg bg-muted space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Release Title:</p>
                      <p className="text-sm text-muted-foreground">{currentNotice.releaseTitle}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Artist Name:</p>
                      <p className="text-sm text-muted-foreground">{currentNotice.artistName}</p>
                    </div>
                  </div>
                </div>

                {/* Claim Details */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Claim Description</h3>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">{currentNotice.claimDescription}</p>
                  </div>
                </div>

                {/* Timeline & Status */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Timeline & Status</h3>
                  <div className="p-3 rounded-lg bg-muted space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Received Date:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentNotice.receivedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Response Deadline:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(currentNotice.responseDeadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Days Until Deadline:</p>
                      {getDeadlineBadge(currentNotice.daysUntilDeadline)}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Status:</p>
                      {getStatusBadge(currentNotice.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Priority:</p>
                      {getPriorityBadge(currentNotice.priority)}
                    </div>
                    {currentNotice.assignedTo && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Assigned To:</p>
                        <p className="text-sm text-muted-foreground">{currentNotice.assignedTo}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {currentNotice && (currentNotice.status === "pending" || currentNotice.status === "investigating") && (
              <Button
                onClick={() => {
                  setShowViewDialog(false);
                  handleRespond(currentNotice);
                }}
                className="bg-[#ff0050] hover:bg-[#cc0040]"
              >
                <Send className="h-4 w-4 mr-2" />
                Respond to Notice
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
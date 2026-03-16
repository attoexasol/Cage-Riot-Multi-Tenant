import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Eye,
  Download,
  RefreshCw,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";

interface Takedown {
  id: string;
  requestId: string;
  trackTitle: string;
  artist: string;
  reason: string;
  platforms: string[];
  requestDate: string;
  status: "pending" | "in-progress" | "completed" | "rejected";
  completedPlatforms?: string[];
  notes?: string;
  evidence?: string;
  additionalNotes?: string;
}

const takedowns: Takedown[] = [
  {
    id: "1",
    requestId: "TKD-2026-001",
    trackTitle: "Unauthorized Upload",
    artist: "The Waves",
    reason: "Copyright infringement",
    platforms: ["YouTube", "SoundCloud"],
    requestDate: "2026-01-20",
    status: "completed",
    completedPlatforms: ["YouTube", "SoundCloud"],
  },
  {
    id: "2",
    requestId: "TKD-2026-002",
    trackTitle: "Electric Dreams",
    artist: "Neon City",
    reason: "Contract termination",
    platforms: ["Spotify", "Apple Music", "YouTube"],
    requestDate: "2026-01-23",
    status: "in-progress",
    completedPlatforms: ["Spotify"],
  },
  {
    id: "3",
    requestId: "TKD-2026-003",
    trackTitle: "Midnight City Remix",
    artist: "Urban Sound",
    reason: "Unauthorized derivative work",
    platforms: ["TikTok", "Instagram"],
    requestDate: "2026-01-24",
    status: "pending",
  },
  {
    id: "4",
    requestId: "TKD-2026-004",
    trackTitle: "Ocean Drive Cover",
    artist: "Various Artists",
    reason: "License dispute",
    platforms: ["Spotify"],
    requestDate: "2026-01-22",
    status: "rejected",
    notes: "Insufficient evidence provided",
  },
];

const platformsList = [
  "Spotify",
  "Apple Music",
  "YouTube Music",
  "Amazon Music",
  "TikTok",
  "Instagram",
  "SoundCloud",
  "Deezer",
  "TIDAL",
];

export function TakedownsView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [currentTakedown, setCurrentTakedown] = useState<Takedown | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter takedowns based on search query and status
  const filteredTakedowns = takedowns.filter((takedown) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      takedown.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      takedown.trackTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      takedown.artist.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      filterStatus === "all" || takedown.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (takedown: Takedown) => {
    setCurrentTakedown(takedown);
    setShowViewDialog(true);
  };

  const handleDownloadReport = (takedown: Takedown) => {
    toast.success(`Downloading report for ${takedown.requestId}`);
    // Simulate download
    setTimeout(() => {
      toast.success(`Report downloaded: ${takedown.requestId}.pdf`);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20">
            <RefreshCw className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 px-[0px] py-[24px]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight">Takedowns</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage takedown requests and track removal status across platforms
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="text-xs md:text-sm">
            <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#ff0050] hover:bg-[#cc0040] text-xs md:text-sm">
                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                New Takedown
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Takedown Request</DialogTitle>
                <DialogDescription>
                  Request removal of content from streaming platforms
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="trackTitle">Track Title</Label>
                    <Input id="trackTitle" placeholder="Enter track title" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist Name</Label>
                    <Input id="artist" placeholder="Enter artist name" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Takedown</Label>
                    <Select>
                      <SelectTrigger id="reason">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="copyright">Copyright Infringement</SelectItem>
                        <SelectItem value="contract">Contract Termination</SelectItem>
                        <SelectItem value="unauthorized">Unauthorized Upload</SelectItem>
                        <SelectItem value="derivative">Unauthorized Derivative Work</SelectItem>
                        <SelectItem value="license">License Dispute</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Target Platforms</Label>
                    <div className="grid grid-cols-2 gap-3 border rounded-lg p-4">
                      {platformsList.map((platform) => (
                        <div key={platform} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform}
                            checked={selectedPlatforms.includes(platform)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPlatforms([...selectedPlatforms, platform]);
                              } else {
                                setSelectedPlatforms(
                                  selectedPlatforms.filter((p) => p !== platform)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={platform}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {platform}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="evidence">Evidence / Links</Label>
                    <Textarea
                      id="evidence"
                      placeholder="Provide URLs or evidence supporting this takedown request..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any additional information..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-[#ff0050] hover:bg-[#cc0040]">
                    Submit Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-semibold mt-1">127</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold mt-1">98</p>
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
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-semibold mt-1">23</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold mt-1">6</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="px-3.5 sm:px-6 pt-6">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-3">
            <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 sm:mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Takedown Process</h3>
              <p className="text-sm text-muted-foreground">
                Takedown requests are typically processed within 3-5 business days per platform. You'll receive email notifications as each platform confirms removal. For urgent matters, contact our support team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="px-3.5 sm:px-6 pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by request ID, track title, or artist..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all" value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Takedown Requests */}
      <div className="space-y-4">
        {filteredTakedowns.map((takedown) => (
          <Card key={takedown.id}>
            <CardContent className="px-3.5 sm:px-6 pt-6 relative">
              {/* 3-Dot Menu - Positioned at Top Right */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="absolute top-6 right-4 md:right-6 h-8 w-8 p-0 z-10">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewDetails(takedown)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadReport(takedown)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </DropdownMenuItem>
                  {takedown.status === "in-progress" && (
                    <DropdownMenuItem>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check Status
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Header Section */}
              <div className="pr-10 mb-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base md:text-lg font-semibold">{takedown.trackTitle}</h3>
                    {getStatusBadge(takedown.status)}
                    <Badge variant="outline" className="text-xs">
                      {takedown.requestId}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                    <span>{takedown.artist}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="whitespace-nowrap">Submitted: {takedown.requestDate}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-[#ff0050]">{takedown.reason}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                {/* Platform Status */}
                <div>
                  <p className="text-xs md:text-sm font-medium mb-2 md:mb-3">Target Platforms</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                    {takedown.platforms.map((platform) => {
                      const isCompleted = takedown.completedPlatforms?.includes(platform);
                      const isInProgress =
                        takedown.status === "in-progress" && !isCompleted;

                      return (
                        <div
                          key={platform}
                          className={cn(
                            "flex items-center justify-between p-2 md:p-3 rounded-lg border",
                            isCompleted && "bg-green-500/10 border-green-500/20",
                            isInProgress && "bg-blue-500/10 border-blue-500/20",
                            !isCompleted &&
                              !isInProgress &&
                              "bg-muted/50 border-border"
                          )}
                        >
                          <span className="text-xs md:text-sm font-medium">{platform}</span>
                          {isCompleted && (
                            <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                          )}
                          {isInProgress && (
                            <Clock className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress */}
                {takedown.status === "in-progress" && takedown.completedPlatforms && (
                  <div className="p-3 md:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                      <p className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-500">
                        Processing {takedown.completedPlatforms.length} of{" "}
                        {takedown.platforms.length} platforms completed
                      </p>
                      <span className="text-sm md:text-base font-semibold text-blue-600 dark:text-blue-500">
                        {Math.round(
                          (takedown.completedPlatforms.length /
                            takedown.platforms.length) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {takedown.notes && (
                  <div className="p-3 md:p-4 rounded-lg bg-[#ff0050]/10 border border-[#ff0050]/20">
                    <p className="text-xs md:text-sm font-medium text-[#ff0050] mb-1">Note:</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{takedown.notes}</p>
                  </div>
                )}

                {/* Completed Message */}
                {takedown.status === "completed" && (
                  <div className="p-3 md:p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 md:gap-3">
                      <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs md:text-sm font-medium text-green-600 dark:text-green-500">
                          Takedown completed
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Content has been successfully removed from all requested platforms
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Takedown Details</DialogTitle>
            <DialogDescription>
              View detailed information about the takedown request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {currentTakedown && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Track Title</Label>
                  <Input
                    value={currentTakedown.trackTitle}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Artist Name</Label>
                  <Input
                    value={currentTakedown.artist}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reason for Takedown</Label>
                  <Input
                    value={currentTakedown.reason}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Target Platforms</Label>
                  <div className="grid grid-cols-2 gap-3 border rounded-lg p-4">
                    {platformsList.map((platform) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform}
                          checked={currentTakedown.platforms.includes(platform)}
                          disabled
                        />
                        <label
                          htmlFor={platform}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {platform}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Evidence / Links</Label>
                  <Textarea
                    value={currentTakedown.evidence || ""}
                    readOnly
                    className="bg-gray-100"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={currentTakedown.additionalNotes || ""}
                    readOnly
                    className="bg-gray-100"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
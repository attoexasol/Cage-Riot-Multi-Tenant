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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Radio,
  RefreshCw,
  Download,
  Eye,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { Progress } from "@/app/components/ui/progress";
import { DSPLogo } from "@/app/components/dsp-logos";

interface DSP {
  name: string;
  logo: string;
  status: "queued" | "sent" | "ingested" | "live" | "rejected";
  deliveryDate?: string;
  liveDate?: string;
  error?: string;
}

interface Release {
  id: string;
  title: string;
  artist: string;
  upc: string;
  releaseDate: string;
  dsps: DSP[];
}

const dspList = [
  { id: "spotify", name: "Spotify", color: "#1DB954" },
  { id: "apple", name: "Apple Music", color: "#FA243C" },
  { id: "youtube", name: "YouTube Music", color: "#FF0000" },
  { id: "tiktok", name: "TikTok", color: "#000000" },
  { id: "instagram", name: "Instagram", color: "#E4405F" },
  { id: "amazon", name: "Amazon Music", color: "#FF9900" },
  { id: "deezer", name: "Deezer", color: "#00C7F2" },
  { id: "tidal", name: "TIDAL", color: "#000000" },
];

const releases: Release[] = [
  {
    id: "1",
    title: "Summer Nights",
    artist: "The Waves",
    upc: "123456789012",
    releaseDate: "2026-02-15",
    dsps: [
      { name: "Spotify", logo: "🎵", status: "live", liveDate: "2026-02-15" },
      { name: "Apple Music", logo: "🍎", status: "live", liveDate: "2026-02-15" },
      { name: "YouTube Music", logo: "▶️", status: "ingested", deliveryDate: "2026-02-14" },
      { name: "TikTok", logo: "🎬", status: "sent", deliveryDate: "2026-02-14" },
      { name: "Instagram", logo: "📷", status: "live", liveDate: "2026-02-15" },
      { name: "Amazon Music", logo: "📦", status: "queued" },
      { name: "Deezer", logo: "💿", status: "live", liveDate: "2026-02-15" },
      { name: "TIDAL", logo: "🌊", status: "live", liveDate: "2026-02-15" },
    ],
  },
  {
    id: "2",
    title: "Electric Dreams",
    artist: "Neon City",
    upc: "123456789013",
    releaseDate: "2026-02-20",
    dsps: [
      { name: "Spotify", logo: "🎵", status: "rejected", error: "Invalid ISRC format", deliveryDate: "2026-02-13" },
      { name: "Apple Music", logo: "🍎", status: "ingested", deliveryDate: "2026-02-14" },
      { name: "YouTube Music", logo: "▶️", status: "sent", deliveryDate: "2026-02-14" },
      { name: "TikTok", logo: "🎬", status: "queued" },
      { name: "Instagram", logo: "📷", status: "sent", deliveryDate: "2026-02-14" },
      { name: "Amazon Music", logo: "📦", status: "sent", deliveryDate: "2026-02-14" },
      { name: "Deezer", logo: "💿", status: "ingested", deliveryDate: "2026-02-14" },
      { name: "TIDAL", logo: "🌊", status: "sent", deliveryDate: "2026-02-14" },
    ],
  },
  {
    id: "3",
    title: "Midnight City",
    artist: "Urban Sound",
    upc: "123456789014",
    releaseDate: "2026-03-01",
    dsps: [
      { name: "Spotify", logo: "🎵", status: "sent", deliveryDate: "2026-02-20" },
      { name: "Apple Music", logo: "🍎", status: "sent", deliveryDate: "2026-02-20" },
      { name: "YouTube Music", logo: "▶️", status: "queued" },
      { name: "TikTok", logo: "🎬", status: "queued" },
      { name: "Instagram", logo: "📷", status: "queued" },
      { name: "Amazon Music", logo: "📦", status: "queued" },
      { name: "Deezer", logo: "💿", status: "sent", deliveryDate: "2026-02-20" },
      { name: "TIDAL", logo: "🌊", status: "queued" },
    ],
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "live":
      return (
        <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
          <Radio className="h-3 w-3 mr-1" />
          Live
        </Badge>
      );
    case "ingested":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Ingested
        </Badge>
      );
    case "sent":
      return (
        <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20">
          <Send className="h-3 w-3 mr-1" />
          Sent
        </Badge>
      );
    case "queued":
      return (
        <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20">
          <Clock className="h-3 w-3 mr-1" />
          Queued
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

export function DistributionStatus() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter and search logic
  const filteredReleases = releases.filter((release) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.upc.includes(searchQuery);

    // Status filter
    const matchesStatus =
      filterStatus === "all" ||
      release.dsps.some((dsp) => dsp.status === filterStatus);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden px-3.5 px-[24px] pt-[24px] pb-[0px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Distribution Status</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track delivery status across all DSPs and platforms
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button size="sm" className="bg-[#ff0050] hover:bg-[#cc0040] flex-1 sm:flex-none">
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh All</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live</p>
                <p className="text-2xl font-semibold mt-1">12</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Radio className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingested</p>
                <p className="text-2xl font-semibold mt-1">8</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-semibold mt-1">15</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Send className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Queued</p>
                <p className="text-2xl font-semibold mt-1">23</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-semibold mt-1">3</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 px-3.5 sm:px-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, artist, UPC, or ISRC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="ingested">Ingested</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Releases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Releases</CardTitle>
          <CardDescription>Detailed delivery status for each release</CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReleases.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No releases found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery
                    ? `No results match "${searchQuery}"`
                    : `No releases with status "${filterStatus}"`}
                </p>
                {(searchQuery || filterStatus !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              filteredReleases.map((release) => {
                const totalDsps = release.dsps.length;
                const liveDsps = release.dsps.filter((d) => d.status === "live").length;
                const rejectedDsps = release.dsps.filter((d) => d.status === "rejected").length;
                const completionPercentage = (liveDsps / totalDsps) * 100;

                return (
                  <div key={release.id} className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {/* Release Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{release.title}</h3>
                          <Badge variant="outline" className="text-xs w-fit">
                            UPC: {release.upc}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-1">
                          {release.artist} • Release Date: {release.releaseDate}
                        </p>
                        
                        {/* Progress */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-muted-foreground">
                              {liveDsps} of {totalDsps} DSPs live
                            </span>
                            <span className="font-medium">{completionPercentage.toFixed(0)}%</span>
                          </div>
                          <Progress value={completionPercentage} className="h-2" />
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry Failed
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* DSP Status Grid */}
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      {release.dsps.map((dsp, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-center justify-between p-2.5 sm:p-3 rounded-lg border transition-colors",
                            dsp.status === "rejected" && "border-[#ff0050]/20 bg-[#ff0050]/5",
                            dsp.status === "live" && "border-green-500/20 bg-green-500/5"
                          )}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <DSPLogo name={dsp.name} className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-medium truncate">{dsp.name}</p>
                              {dsp.status === "live" && dsp.liveDate && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Live: {dsp.liveDate}</p>
                              )}
                              {dsp.status === "rejected" && dsp.error && (
                                <p className="text-[10px] sm:text-xs text-[#ff0050] truncate">{dsp.error}</p>
                              )}
                              {(dsp.status === "sent" || dsp.status === "ingested") && dsp.deliveryDate && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Sent: {dsp.deliveryDate}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(dsp.status)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Error Messages */}
                    {rejectedDsps > 0 && (
                      <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-[#ff0050]/10 border border-[#ff0050]/20">
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff0050] flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-[#ff0050]">
                            {rejectedDsps} {rejectedDsps === 1 ? "delivery" : "deliveries"} rejected
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                            Click "Retry Failed" to attempt redelivery after fixing issues
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#ff0050] text-[#ff0050] hover:bg-[#ff0050] hover:text-white flex-shrink-0 h-8 px-2 sm:px-3"
                        >
                          <RefreshCw className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Retry</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* DSP Health Monitor */}
      <Card>
        <CardHeader>
          <CardTitle>DSP Health Monitor</CardTitle>
          <CardDescription>Current status of all distribution partners</CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dspList.map((dsp) => (
              <div
                key={dsp.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <DSPLogo name={dsp.name} className="h-6 w-6" />
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{dsp.name}</span>
                    <div
                      className="h-2 w-2 rounded-full bg-green-500"
                      title="Operational"
                    />
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                  Healthy
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
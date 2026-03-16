import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Slider } from "@/app/components/ui/slider";
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
  Search,
  Filter,
  Plus,
  MoreVertical,
  Radio,
  Clock,
  Edit,
  Eye,
  Copy,
  Trash2,
  Music,
  PlayCircle,
  Calendar,
  Download,
  PauseCircle,
  Volume2,
  VolumeX,
  FileSearch,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { toast } from "sonner";
import { AudioPlayer } from "@/app/components/audio-player";
import { ReleaseInspector } from "@/app/components/release-inspector";

interface ReleasesViewProps {
  onNavigateToUpload?: () => void;
}

interface Release {
  id: string;
  title: string;
  artist: string;
  type: "Single" | "EP" | "Album";
  artwork: string;
  upc: string;
  releaseDate: string;
  status: "live" | "scheduled" | "draft" | "rejected";
  platforms: number;
  streams: number;
  audioUrl?: string;
}

const releases: Release[] = [
  {
    id: "1",
    title: "Summer Nights",
    artist: "The Waves",
    type: "Single",
    artwork: "🎵",
    upc: "123456789012",
    releaseDate: "2026-02-15",
    status: "live",
    platforms: 8,
    streams: 1234567,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "2",
    title: "Electric Dreams",
    artist: "Neon City",
    type: "Album",
    artwork: "💿",
    upc: "123456789013",
    releaseDate: "2026-02-20",
    status: "scheduled",
    platforms: 8,
    streams: 0,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "3",
    title: "Midnight City",
    artist: "Urban Sound",
    type: "EP",
    artwork: "🎧",
    upc: "123456789014",
    releaseDate: "2026-03-01",
    status: "scheduled",
    platforms: 8,
    streams: 0,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "4",
    title: "Ocean Drive",
    artist: "Coast Collective",
    type: "Single",
    artwork: "🌊",
    upc: "123456789015",
    releaseDate: "2026-01-10",
    status: "live",
    platforms: 8,
    streams: 876543,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "5",
    title: "Neon Lights",
    artist: "Synth Wave",
    type: "Single",
    artwork: "✨",
    upc: "123456789016",
    releaseDate: "",
    status: "draft",
    platforms: 0,
    streams: 0,
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
    case "scheduled":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20">
          <Clock className="h-3 w-3 mr-1" />
          Scheduled
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="secondary">
          <Edit className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20">
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export function ReleasesView({ onNavigateToUpload }: ReleasesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [nowPlaying, setNowPlaying] = useState<Release | null>(null);
  const [inspectingRelease, setInspectingRelease] = useState<string | null>(null);

  // Filter releases based on search and filters
  const filteredReleases = releases.filter((release) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.upc.includes(searchQuery);

    // Type filter
    const matchesType = typeFilter === "all" || 
      release.type.toLowerCase() === typeFilter.toLowerCase();

    // Status filter
    const matchesStatus = statusFilter === "all-status" || 
      release.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handlePlayPreview = (release: Release) => {
    if (release.audioUrl) {
      setNowPlaying(release);
    } else {
      toast.error("No audio preview available");
    }
  };

  const handleDownload = (release: Release) => {
    if (release.audioUrl) {
      toast.success("Download started!");
      // In production, this would trigger an actual download
    } else {
      toast.error("No audio file available");
    }
  };

  const handleInspect = (releaseId: string) => {
    setInspectingRelease(releaseId);
  };

  // If inspecting a release, show the inspector
  if (inspectingRelease) {
    return (
      <ReleaseInspector
        releaseId={inspectingRelease}
        onBack={() => setInspectingRelease(null)}
      />
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Releases</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your music releases
          </p>
        </div>
        <Button 
          size="sm" 
          className="bg-[#ff0050] hover:bg-[#cc0040]"
          onClick={onNavigateToUpload}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Release
        </Button>
      </div>

      {/* Audio Player - Fixed at top when playing */}
      {nowPlaying && (
        <div className="sticky top-0 z-10">
          <AudioPlayer
            title={nowPlaying.title}
            artist={nowPlaying.artist}
            audioUrl={nowPlaying.audioUrl!}
            artwork={nowPlaying.artwork}
            onClose={() => setNowPlaying(null)}
          />
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Releases</p>
                <p className="text-2xl font-semibold mt-1">1,234</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Music className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live</p>
                <p className="text-2xl font-semibold mt-1">1,187</p>
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
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-semibold mt-1">32</p>
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
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-semibold mt-1">15</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Edit className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <Card>
        <CardContent className="pt-6 px-3.5 sm:px-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, artist, UPC, or ISRC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Select defaultValue="all" onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-auto md:w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Singles</SelectItem>
                  <SelectItem value="ep">EPs</SelectItem>
                  <SelectItem value="album">Albums</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-status" onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-auto md:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Releases</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReleases.map((release) => (
              <Card key={release.id} className="group hover:shadow-md transition-all overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex gap-3 sm:gap-4">
                    {/* Artwork */}
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-gradient-to-br from-[#ff0050] to-[#cc0040] flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                      {release.artwork}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <h3 className="font-semibold truncate text-sm sm:text-base">{release.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {release.artist}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {release.audioUrl && (
                              <>
                                <DropdownMenuItem onClick={() => handlePlayPreview(release)}>
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Play Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownload(release)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleInspect(release.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {release.type}
                          </Badge>
                          {getStatusBadge(release.status)}
                        </div>

                        {release.releaseDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{release.releaseDate}</span>
                          </div>
                        )}

                        {release.status === "live" && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <PlayCircle className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{(release.streams / 1000).toFixed(0)}k streams</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs text-muted-foreground overflow-hidden">
                    <span className="truncate">UPC: {release.upc}</span>
                    {release.platforms > 0 && (
                      <span className="whitespace-nowrap flex-shrink-0">{release.platforms} platforms</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {releases
              .filter((r) => r.status === "live")
              .map((release) => (
                <Card key={release.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-[#ff0050] to-[#cc0040] flex items-center justify-center text-3xl flex-shrink-0">
                        {release.artwork}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{release.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {release.artist}
                        </p>
                        <div className="mt-2">
                          {getStatusBadge(release.status)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {releases
              .filter((r) => r.status === "scheduled")
              .map((release) => (
                <Card key={release.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-[#ff0050] to-[#cc0040] flex items-center justify-center text-3xl flex-shrink-0">
                        {release.artwork}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{release.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {release.artist}
                        </p>
                        <div className="mt-2 space-y-1">
                          {getStatusBadge(release.status)}
                          <p className="text-xs text-muted-foreground">
                            {release.releaseDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {releases
              .filter((r) => r.status === "draft")
              .map((release) => (
                <Card key={release.id} className="group hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-[#ff0050] to-[#cc0040] flex items-center justify-center text-3xl flex-shrink-0">
                        {release.artwork}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{release.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {release.artist}
                        </p>
                        <div className="mt-2">
                          {getStatusBadge(release.status)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
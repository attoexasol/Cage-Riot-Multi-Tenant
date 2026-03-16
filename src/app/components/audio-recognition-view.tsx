import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Progress } from "@/app/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
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
  Fingerprint,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  MoreVertical,
  AlertCircle,
  Music,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface ScanResult {
  id: string;
  trackTitle: string;
  artist: string;
  isrc: string;
  scanDate: string;
  status: "clean" | "duplicate" | "conflict" | "scanning";
  confidence: number;
  matches?: Match[];
}

interface Match {
  platform: string;
  matchTitle: string;
  matchArtist: string;
  confidence: number;
  type: "exact" | "similar";
}

const scanResults: ScanResult[] = [
  {
    id: "1",
    trackTitle: "Summer Nights",
    artist: "The Waves",
    isrc: "USRC12345678",
    scanDate: "2026-01-25 14:32",
    status: "clean",
    confidence: 100,
  },
  {
    id: "2",
    trackTitle: "Electric Dreams",
    artist: "Neon City",
    isrc: "USRC12345679",
    scanDate: "2026-01-25 14:15",
    status: "duplicate",
    confidence: 98.5,
    matches: [
      {
        platform: "YouTube",
        matchTitle: "Electric Dreams (Unofficial)",
        matchArtist: "Various Artists",
        confidence: 98.5,
        type: "exact",
      },
    ],
  },
  {
    id: "3",
    trackTitle: "Midnight City",
    artist: "Urban Sound",
    isrc: "USRC12345680",
    scanDate: "2026-01-25 13:45",
    status: "conflict",
    confidence: 87.3,
    matches: [
      {
        platform: "Spotify",
        matchTitle: "Midnight in the City",
        matchArtist: "City Sounds",
        confidence: 87.3,
        type: "similar",
      },
      {
        platform: "Apple Music",
        matchTitle: "Midnight City Remix",
        matchArtist: "Unknown",
        confidence: 82.1,
        type: "similar",
      },
    ],
  },
  {
    id: "4",
    trackTitle: "Ocean Drive",
    artist: "Coast Collective",
    isrc: "USRC12345681",
    scanDate: "2026-01-25 13:20",
    status: "scanning",
    confidence: 0,
  },
];

export function AudioRecognitionView() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "clean":
        return (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Clean
          </Badge>
        );
      case "duplicate":
        return (
          <Badge className="bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Duplicate
          </Badge>
        );
      case "conflict":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Conflict
          </Badge>
        );
      case "scanning":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Scanning...
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Audio Recognition</h1>
          <p className="text-muted-foreground mt-1">
            Fingerprint scanning, duplicate detection, and copyright conflict monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm" className="bg-[#ff0050] hover:bg-[#cc0040]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Scan All Tracks
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-semibold mt-1">1,234</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Fingerprint className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clean</p>
                <p className="text-2xl font-semibold mt-1">1,156</p>
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
                <p className="text-sm text-muted-foreground">Duplicates</p>
                <p className="text-2xl font-semibold mt-1">42</p>
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
                <p className="text-sm text-muted-foreground">Conflicts</p>
                <p className="text-2xl font-semibold mt-1">28</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scanning</p>
                <p className="text-2xl font-semibold mt-1">8</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Automated Protection</h3>
                <p className="text-sm text-muted-foreground">
                  All new uploads are automatically scanned for copyright conflicts and duplicate content across major platforms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Advanced Fingerprinting</h3>
                <p className="text-sm text-muted-foreground">
                  Using cutting-edge audio fingerprinting technology to detect matches with 95%+ accuracy across billions of tracks.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by track title, artist, or ISRC..."
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="duplicate">Duplicates</SelectItem>
                <SelectItem value="conflict">Conflicts</SelectItem>
                <SelectItem value="scanning">Scanning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Scans</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="clean">Clean</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {scanResults.map((result) => (
            <Card key={result.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Music className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{result.trackTitle}</h3>
                        <p className="text-sm text-muted-foreground">{result.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline" className="text-xs">
                        ISRC: {result.isrc}
                      </Badge>
                      {getStatusBadge(result.status)}
                      <span className="text-muted-foreground">
                        Scanned: {result.scanDate}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                        Re-scan
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {result.status === "scanning" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Scanning in progress...</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                )}

                {result.status === "clean" && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-600 dark:text-green-500">
                        No conflicts detected
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        This track is clear for distribution across all platforms
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-500">
                        {result.confidence}%
                      </p>
                      <p className="text-xs text-muted-foreground">confidence</p>
                    </div>
                  </div>
                )}

                {result.matches && result.matches.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="h-4 w-4 text-[#ff0050]" />
                      {result.matches.length} Potential {result.matches.length === 1 ? 'Match' : 'Matches'} Found
                    </div>
                    <div className="space-y-2">
                      {result.matches.map((match, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border",
                            match.type === "exact"
                              ? "bg-[#ff0050]/10 border-[#ff0050]/20"
                              : "bg-orange-500/10 border-orange-500/20"
                          )}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {match.platform}
                              </Badge>
                              <Badge
                                variant={match.type === "exact" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {match.type === "exact" ? "Exact Match" : "Similar"}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm">{match.matchTitle}</p>
                            <p className="text-xs text-muted-foreground">{match.matchArtist}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-semibold">{match.confidence}%</p>
                            <p className="text-xs text-muted-foreground">confidence</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Mark as False Positive
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-[#ff0050] hover:bg-[#cc0040]"
                      >
                        Take Action
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {scanResults.filter(r => r.status === "duplicate" || r.status === "conflict").length} track(s) with issues
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clean">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
                <p className="text-muted-foreground">
                  {scanResults.filter(r => r.status === "clean").length} clean track(s)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

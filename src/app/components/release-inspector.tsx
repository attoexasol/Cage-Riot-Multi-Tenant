import React, { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  ArrowLeft,
  Music,
  Image as ImageIcon,
  FileText,
  DollarSign,
  Radio,
  Sparkles,
  Scale,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Globe,
} from "lucide-react";
import { WorkflowStatus } from "@/app/components/workflow-status";
import { QCValidation } from "@/app/components/qc-validation";
import { RoyaltySplits } from "@/app/components/royalty-splits";
import { SampleLicenses } from "@/app/components/sample-licenses";
import { MarketingFields } from "@/app/components/marketing-fields";
import { DistributionStatus } from "@/app/components/distribution-status";

interface ReleaseInspectorProps {
  releaseId: string;
  onBack?: () => void;
}

export function ReleaseInspector({ releaseId, onBack }: ReleaseInspectorProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock release data
  const release = {
    id: releaseId,
    title: "Summer Nights",
    artist: "The Waves",
    artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop",
    upc: "123456789012",
    releaseDate: "2026-02-15",
    releaseType: "Single",
    label: "Ocean Records",
    genre: "Electronic",
    language: "English",
    status: "approved" as const,
    copyrightYear: 2026,
    copyrightHolder: "Ocean Records",
    description: "A dreamy electronic single perfect for summer vibes",
    tracks: [
      {
        id: "1",
        title: "Summer Nights",
        duration: "3:24",
        isrc: "USUM72345678",
        explicit: false,
      },
      {
        id: "2",
        title: "Summer Nights (Extended Mix)",
        duration: "5:47",
        isrc: "USUM72345679",
        explicit: false,
      },
    ],
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-28"),
    createdBy: "The Waves",
    approvedBy: "Admin",
    approvedAt: new Date("2026-01-20"),
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
      draft: {
        className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        label: "Draft",
        icon: <FileText className="h-3 w-3 mr-1" />,
      },
      qc: {
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        label: "In QC",
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      },
      legal: {
        className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        label: "Legal Review",
        icon: <Scale className="h-3 w-3 mr-1" />,
      },
      approved: {
        className: "bg-green-500/10 text-green-600 border-green-500/20",
        label: "Approved",
        icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      },
      live: {
        className: "bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20",
        label: "Live",
        icon: <Radio className="h-3 w-3 mr-1" />,
      },
      rejected: {
        className: "bg-red-500/10 text-red-600 border-red-500/20",
        label: "Rejected",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
      },
    };

    const variant = variants[status] || variants.draft;

    return (
      <Badge variant="secondary" className={variant.className}>
        {variant.icon}
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pt-4 sm:pt-[30px] px-3.5 sm:px-[15px] pb-3 sm:pb-[15px]">
        {onBack && (
          <Button 
            variant="outline" 
            size="icon" 
            className="hover:bg-[#ff0050]/10 hover:border-[#ff0050]/50 hover:text-[#ff0050] transition-all flex-shrink-0"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {/* Artwork */}
            <div className="relative group flex-shrink-0 mx-auto sm:mx-0">
              <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl overflow-hidden border-2 border-border shadow-lg hover:shadow-xl transition-all">
                <img
                  src={release.artwork}
                  alt={release.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3 sm:space-y-5 w-full">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">{release.title}</h1>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-base sm:text-lg text-muted-foreground">
                    <User className="h-4 w-4" />
                    <p>{release.artist}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 flex justify-center sm:block">
                  {getStatusBadge(release.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-[#ff0050]/30 transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">Release Type</p>
                  <p className="text-xs sm:text-sm font-semibold">{release.releaseType}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-[#ff0050]/30 transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">UPC</p>
                  <p className="text-xs sm:text-sm font-semibold font-mono truncate">{release.upc}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-[#ff0050]/30 transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">Release Date</p>
                  <p className="text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2">
                    <Calendar className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-[#ff0050] flex-shrink-0" />
                    <span className="truncate">{new Date(release.releaseDate).toLocaleDateString()}</span>
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl border bg-card/50 backdrop-blur-sm hover:border-[#ff0050]/30 transition-all">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">Label</p>
                  <p className="text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2">
                    <Globe className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-[#ff0050] flex-shrink-0" />
                    <span className="truncate">{release.label}</span>
                  </p>
                </div>
              </div>

              {release.approvedBy && release.approvedAt && (
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                        Approved by {release.approvedBy}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        {release.approvedAt.toLocaleDateString()} at {release.approvedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-3.5 sm:px-[20px] py-0 pb-4 sm:pb-[20px]">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-2.5">
            <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs lg:text-sm">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-2.5">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs lg:text-sm">Workflow</span>
          </TabsTrigger>
          <TabsTrigger value="qc" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-2.5">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs lg:text-sm">QC</span>
          </TabsTrigger>
          <TabsTrigger value="splits" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-2.5">
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs lg:text-sm">Splits</span>
          </TabsTrigger>
          <TabsTrigger value="licenses" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-2.5">
            <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs lg:text-sm">Licenses</span>
          </TabsTrigger>
          <TabsTrigger value="marketing" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-2.5">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs lg:text-sm">Marketing</span>
          </TabsTrigger>
          <TabsTrigger value="distribution" className="text-xs sm:text-sm flex-col sm:flex-row gap-1 sm:gap-2 py-2 sm:py-2.5">
            <Radio className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs lg:text-sm">Distribution</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Release Details */}
          <Card>
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Release Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Genre</p>
                      <p className="font-medium text-sm sm:text-base">{release.genre}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Language</p>
                      <p className="font-medium text-sm sm:text-base">{release.language}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Copyright Year</p>
                      <p className="font-medium text-sm sm:text-base">℗ {release.copyrightYear}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Copyright Holder</p>
                      <p className="font-medium text-sm sm:text-base">{release.copyrightHolder}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs sm:text-sm text-muted-foreground">Description</p>
                      <p className="font-medium text-sm sm:text-base">{release.description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Tracks ({release.tracks.length})</h3>
                  <div className="space-y-2">
                    {release.tracks.map((track, index) => (
                      <div
                        key={track.id}
                        className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-3 rounded-lg border"
                      >
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-[#ff0050]/10 flex items-center justify-center font-semibold text-[#ff0050] text-xs sm:text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">{track.title}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            ISRC: {track.isrc} • {track.duration}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
                          {track.explicit ? "Explicit" : "Clean"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Metadata</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Created by:</span>
                      <span className="font-medium truncate">{release.createdBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium truncate">
                        {release.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Last updated:</span>
                      <span className="font-medium truncate">
                        {release.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Release ID:</span>
                      <span className="font-medium font-mono text-[10px] sm:text-xs truncate">{release.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="mt-6">
          <WorkflowStatus currentStage={release.status} releaseId={release.id} />
        </TabsContent>

        <TabsContent value="qc" className="mt-6">
          <QCValidation releaseId={release.id} />
        </TabsContent>

        <TabsContent value="splits" className="mt-6">
          <RoyaltySplits releaseId={release.id} level="release" />
        </TabsContent>

        <TabsContent value="licenses" className="mt-6">
          <SampleLicenses releaseId={release.id} />
        </TabsContent>

        <TabsContent value="marketing" className="mt-6">
          <MarketingFields releaseId={release.id} />
        </TabsContent>

        <TabsContent value="distribution" className="mt-6">
          <DistributionStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}
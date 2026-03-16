import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { RefreshCw, Loader2, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DSPLogo } from "@/app/components/dsp-logos";

interface DSPStatus {
  dsp: string;
  status: "pending" | "processing" | "delivered" | "failed";
  progress: number;
  estimatedTime?: string;
  errorMessage?: string;
}

interface ActiveDelivery {
  id: string;
  releaseTitle: string;
  artistName: string;
  upc: string;
  startedAt: string;
  totalDSPs: number;
  completedDSPs: number;
  dspStatuses: DSPStatus[];
  overallProgress: number;
}

const mockActiveDeliveries: ActiveDelivery[] = [
  {
    id: "1",
    releaseTitle: "Electric Dreams",
    artistName: "Neon City",
    upc: "196589654322",
    startedAt: "2026-01-30T14:00:00",
    totalDSPs: 8,
    completedDSPs: 5,
    overallProgress: 62,
    dspStatuses: [
      { dsp: "Spotify", status: "delivered", progress: 100 },
      { dsp: "Apple Music", status: "delivered", progress: 100 },
      { dsp: "YouTube Music", status: "processing", progress: 75, estimatedTime: "5 min" },
      { dsp: "Amazon Music", status: "delivered", progress: 100 },
      { dsp: "Deezer", status: "processing", progress: 60, estimatedTime: "8 min" },
      { dsp: "TIDAL", status: "delivered", progress: 100 },
      { dsp: "SoundCloud", status: "pending", progress: 0 },
      { dsp: "TikTok Music", status: "delivered", progress: 100 },
    ],
  },
  {
    id: "2",
    releaseTitle: "Bass Drops",
    artistName: "Deep Sound Records",
    upc: "196589654326",
    startedAt: "2026-01-30T14:15:00",
    totalDSPs: 6,
    completedDSPs: 2,
    overallProgress: 33,
    dspStatuses: [
      { dsp: "Spotify", status: "delivered", progress: 100 },
      { dsp: "Apple Music", status: "processing", progress: 45, estimatedTime: "12 min" },
      { dsp: "YouTube Music", status: "processing", progress: 30, estimatedTime: "15 min" },
      { dsp: "Amazon Music", status: "pending", progress: 0 },
      { dsp: "Deezer", status: "delivered", progress: 100 },
      { dsp: "TIDAL", status: "pending", progress: 0 },
    ],
  },
  {
    id: "3",
    releaseTitle: "Rock Revolution",
    artistName: "Thunder Strike",
    upc: "196589654328",
    startedAt: "2026-01-30T14:30:00",
    totalDSPs: 5,
    completedDSPs: 1,
    overallProgress: 20,
    dspStatuses: [
      { dsp: "Spotify", status: "processing", progress: 85, estimatedTime: "3 min" },
      { dsp: "Apple Music", status: "processing", progress: 20, estimatedTime: "20 min" },
      { dsp: "YouTube Music", status: "pending", progress: 0 },
      { dsp: "Amazon Music", status: "delivered", progress: 100 },
      { dsp: "Deezer", status: "pending", progress: 0 },
    ],
  },
];

export function ActiveDeliveries() {
  const [deliveries, setDeliveries] = useState(mockActiveDeliveries);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    toast.info("Refreshing delivery status...");
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Status updated");
    }, 1500);
  };

  const handleCancel = (delivery: ActiveDelivery) => {
    toast.warning(`Cancelled delivery for "${delivery.releaseTitle}"`);
  };

  const getStatusBadge = (status: DSPStatus["status"]) => {
    const variants = {
      pending: { bg: "bg-gray-500/10 text-gray-600 border-gray-500/20", icon: <Clock className="h-3 w-3 mr-1" /> },
      processing: { bg: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" /> },
      delivered: { bg: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
      failed: { bg: "bg-red-500/10 text-red-600 border-red-500/20", icon: <XCircle className="h-3 w-3 mr-1" /> },
    };

    const labels = {
      pending: "Pending",
      processing: "Processing",
      delivered: "Delivered",
      failed: "Failed",
    };

    const variant = variants[status];

    return (
      <Badge variant="secondary" className={variant.bg}>
        {variant.icon}
        {labels[status]}
      </Badge>
    );
  };

  const totalActive = deliveries.length;
  const totalCompleted = deliveries.filter((d) => d.completedDSPs === d.totalDSPs).length;
  const totalProcessing = deliveries.filter((d) => d.completedDSPs > 0 && d.completedDSPs < d.totalDSPs).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Deliveries</p>
                <p className="text-2xl font-semibold mt-1">{totalActive}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-[#ff0050] animate-spin" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-semibold mt-1">{totalProcessing}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold mt-1">{totalCompleted}</p>
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
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-semibold mt-1">
                  {Math.round(
                    deliveries.reduce((sum, d) => sum + d.overallProgress, 0) / deliveries.length
                  )}%
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Deliveries List */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <CardTitle className="text-base sm:text-lg">Active Deliveries</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {deliveries.length} delivery{deliveries.length !== 1 ? "s" : ""} in progress
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="p-3 sm:p-4 rounded-lg border">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">{delivery.releaseTitle}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{delivery.artistName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Started: {new Date(delivery.startedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(delivery)}
                    className="w-full sm:w-auto text-xs sm:text-sm flex-shrink-0"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Overall Progress */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 mb-2">
                    <p className="text-xs sm:text-sm font-medium">
                      Overall Progress: {delivery.completedDSPs} of {delivery.totalDSPs} DSPs
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-[#ff0050]">
                      {delivery.overallProgress}%
                    </p>
                  </div>
                  <Progress value={delivery.overallProgress} className="h-2 sm:h-3" />
                </div>

                {/* DSP Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {delivery.dspStatuses.map((dspStatus, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 sm:p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <DSPLogo name={dspStatus.dsp} className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                          <p className="text-xs sm:text-sm font-medium">{dspStatus.dsp}</p>
                        </div>
                        {getStatusBadge(dspStatus.status)}
                      </div>

                      {dspStatus.status !== "pending" && (
                        <div className="space-y-1">
                          <Progress value={dspStatus.progress} className="h-1.5 sm:h-2" />
                          {dspStatus.estimatedTime && (
                            <p className="text-xs text-muted-foreground">
                              ETA: {dspStatus.estimatedTime}
                            </p>
                          )}
                          {dspStatus.errorMessage && (
                            <p className="text-xs text-red-600">
                              {dspStatus.errorMessage}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {deliveries.length === 0 && (
              <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-lg">
                <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm sm:text-base text-muted-foreground">No active deliveries</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Deliveries in progress will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
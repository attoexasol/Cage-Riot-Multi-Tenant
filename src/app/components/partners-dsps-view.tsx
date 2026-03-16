import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Network,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  MoreVertical,
  Settings,
  Eye,
  Zap,
  Activity,
  Webhook,
  Key,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface DSP {
  id: string;
  name: string;
  status: "operational" | "degraded" | "down";
  apiStatus: "connected" | "error" | "pending";
  lastSync: string;
  deliveryRate: number;
  activeReleases: number;
  webhookStatus: "enabled" | "disabled" | "error";
  uptime: number;
}

const dsps: DSP[] = [
  {
    id: "1",
    name: "Spotify",
    status: "operational",
    apiStatus: "connected",
    lastSync: "2 min ago",
    deliveryRate: 99.2,
    activeReleases: 1187,
    webhookStatus: "enabled",
    uptime: 99.9,
  },
  {
    id: "2",
    name: "Apple Music",
    status: "operational",
    apiStatus: "connected",
    lastSync: "5 min ago",
    deliveryRate: 98.7,
    activeReleases: 1165,
    webhookStatus: "enabled",
    uptime: 99.8,
  },
  {
    id: "3",
    name: "YouTube Music",
    status: "degraded",
    apiStatus: "connected",
    lastSync: "15 min ago",
    deliveryRate: 94.3,
    activeReleases: 1098,
    webhookStatus: "error",
    uptime: 97.2,
  },
  {
    id: "4",
    name: "Amazon Music",
    status: "operational",
    apiStatus: "connected",
    lastSync: "3 min ago",
    deliveryRate: 97.8,
    activeReleases: 1045,
    webhookStatus: "enabled",
    uptime: 99.5,
  },
  {
    id: "5",
    name: "TikTok",
    status: "operational",
    apiStatus: "connected",
    lastSync: "1 min ago",
    deliveryRate: 96.5,
    activeReleases: 987,
    webhookStatus: "enabled",
    uptime: 98.7,
  },
  {
    id: "6",
    name: "Instagram",
    status: "operational",
    apiStatus: "connected",
    lastSync: "4 min ago",
    deliveryRate: 95.2,
    activeReleases: 932,
    webhookStatus: "enabled",
    uptime: 98.3,
  },
  {
    id: "7",
    name: "Deezer",
    status: "down",
    apiStatus: "error",
    lastSync: "2 hours ago",
    deliveryRate: 0,
    activeReleases: 856,
    webhookStatus: "disabled",
    uptime: 85.4,
  },
  {
    id: "8",
    name: "TIDAL",
    status: "operational",
    apiStatus: "connected",
    lastSync: "7 min ago",
    deliveryRate: 98.1,
    activeReleases: 789,
    webhookStatus: "enabled",
    uptime: 99.1,
  },
];

export function PartnersDSPsView() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Operational
          </Badge>
        );
      case "degraded":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Degraded
          </Badge>
        );
      case "down":
        return (
          <Badge className="bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Down
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAPIStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
            Connected
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20">
            Error
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const operationalCount = dsps.filter(d => d.status === "operational").length;
  const degradedCount = dsps.filter(d => d.status === "degraded").length;
  const downCount = dsps.filter(d => d.status === "down").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Partners / DSPs</h1>
          <p className="text-muted-foreground mt-1">
            Monitor DSP connections, API health, and webhook activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button size="sm" className="bg-[#ff0050] hover:bg-[#cc0040]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total DSPs</p>
                <p className="text-2xl font-semibold mt-1">{dsps.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Network className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operational</p>
                <p className="text-2xl font-semibold mt-1">{operationalCount}</p>
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
                <p className="text-sm text-muted-foreground">Degraded</p>
                <p className="text-2xl font-semibold mt-1">{degradedCount}</p>
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
                <p className="text-sm text-muted-foreground">Issues</p>
                <p className="text-2xl font-semibold mt-1">{downCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Overview */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-1">All Systems Operational</h3>
              <p className="text-sm text-muted-foreground">
                {operationalCount} out of {dsps.length} DSPs are operating normally. Average uptime: 98.2%
              </p>
            </div>
            <Button variant="ghost" size="sm">View Status Page</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API Connections</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dsps.map((dsp) => (
              <Card key={dsp.id} className={cn(
                dsp.status === "down" && "border-[#ff0050]/20 bg-[#ff0050]/5",
                dsp.status === "degraded" && "border-orange-500/20 bg-orange-500/5"
              )}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{dsp.name}</h3>
                        {getStatusBadge(dsp.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last sync: {dsp.lastSync}
                      </p>
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
                          Force Sync
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-4">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Active Releases</p>
                        <p className="text-xl font-semibold">{dsp.activeReleases.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Uptime</p>
                        <p className="text-xl font-semibold">{dsp.uptime}%</p>
                      </div>
                    </div>

                    {/* Delivery Rate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Success Rate</span>
                        <span className="font-medium">{dsp.deliveryRate}%</span>
                      </div>
                      <Progress 
                        value={dsp.deliveryRate} 
                        className={cn(
                          "h-2",
                          dsp.deliveryRate < 90 && "[&>div]:bg-[#ff0050]",
                          dsp.deliveryRate >= 90 && dsp.deliveryRate < 95 && "[&>div]:bg-orange-500",
                          dsp.deliveryRate >= 95 && "[&>div]:bg-green-500"
                        )} 
                      />
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">API:</span>
                        {getAPIStatusBadge(dsp.apiStatus)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Webhook className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Webhook:</span>
                        <Badge 
                          variant={dsp.webhookStatus === "enabled" ? "default" : "secondary"}
                          className={cn(
                            "text-xs",
                            dsp.webhookStatus === "enabled" && "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
                            dsp.webhookStatus === "error" && "bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20"
                          )}
                        >
                          {dsp.webhookStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Connections</CardTitle>
              <CardDescription>Monitor API health and connection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dsps.map((dsp) => (
                  <div
                    key={dsp.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "h-3 w-3 rounded-full",
                        dsp.apiStatus === "connected" && "bg-green-500",
                        dsp.apiStatus === "error" && "bg-[#ff0050]",
                        dsp.apiStatus === "pending" && "bg-blue-500"
                      )} />
                      <div className="flex-1">
                        <h4 className="font-medium">{dsp.name}</h4>
                        <p className="text-sm text-muted-foreground">Last sync: {dsp.lastSync}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getAPIStatusBadge(dsp.apiStatus)}
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Monitoring</CardTitle>
              <CardDescription>Track webhook delivery and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dsps.map((dsp) => (
                  <div
                    key={dsp.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Webhook className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{dsp.name}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Last event: {dsp.lastSync}</span>
                        <span>•</span>
                        <span>Success rate: {Math.floor(Math.random() * 10) + 90}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={dsp.webhookStatus === "enabled" ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          dsp.webhookStatus === "enabled" && "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
                          dsp.webhookStatus === "error" && "bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20"
                        )}
                      >
                        {dsp.webhookStatus}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

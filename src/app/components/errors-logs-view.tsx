import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  AlertCircle,
  Search,
  Download,
  RefreshCw,
  Filter,
  XCircle,
  AlertTriangle,
  Info,
  Terminal,
  Radio,
  Webhook,
  Eye,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface ErrorLog {
  id: string;
  timestamp: string;
  type: "delivery" | "api" | "system" | "webhook";
  severity: "critical" | "error" | "warning" | "info";
  platform?: string;
  message: string;
  trackTitle?: string;
  errorCode?: string;
  retryCount?: number;
}

const errorLogs: ErrorLog[] = [
  {
    id: "1",
    timestamp: "2026-01-25 14:32:15",
    type: "delivery",
    severity: "error",
    platform: "Spotify",
    message: "Invalid ISRC format",
    trackTitle: "Summer Nights",
    errorCode: "ISRC_FORMAT_ERROR",
    retryCount: 2,
  },
  {
    id: "2",
    timestamp: "2026-01-25 14:15:42",
    type: "api",
    severity: "critical",
    platform: "Apple Music",
    message: "API authentication failed - token expired",
    errorCode: "AUTH_TOKEN_EXPIRED",
    retryCount: 0,
  },
  {
    id: "3",
    timestamp: "2026-01-25 13:45:33",
    type: "webhook",
    severity: "warning",
    platform: "YouTube",
    message: "Webhook delivery timeout after 30s",
    errorCode: "WEBHOOK_TIMEOUT",
    retryCount: 3,
  },
  {
    id: "4",
    timestamp: "2026-01-25 12:20:18",
    type: "delivery",
    severity: "error",
    platform: "TikTok",
    message: "Artwork dimensions below minimum requirement",
    trackTitle: "Electric Dreams",
    errorCode: "ARTWORK_SIZE_ERROR",
    retryCount: 1,
  },
  {
    id: "5",
    timestamp: "2026-01-25 11:10:05",
    type: "system",
    severity: "info",
    message: "Scheduled maintenance completed successfully",
    errorCode: "MAINT_COMPLETE",
  },
];

export function ErrorsLogsView() {
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <Badge className="bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20">
            <XCircle className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case "warning":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        );
      case "info":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20">
            <Info className="h-3 w-3 mr-1" />
            Info
          </Badge>
        );
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "delivery":
        return Radio;
      case "api":
        return Terminal;
      case "webhook":
        return Webhook;
      case "system":
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Errors & Logs</h1>
          <p className="text-muted-foreground mt-1">
            Monitor delivery errors, system logs, webhook activity, and retry history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button size="sm" className="bg-[#ff0050] hover:bg-[#cc0040]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Errors</p>
                <p className="text-2xl font-semibold mt-1">342</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-semibold mt-1">12</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-semibold mt-1">87</p>
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
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-semibold mt-1">234</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Retries</p>
                <p className="text-2xl font-semibold mt-1">156</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by message, error code, or track title..."
                className="pl-9"
              />
            </div>
            <Select defaultValue="all-types">
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-severity">
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-severity">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="24h">
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Errors</TabsTrigger>
          <TabsTrigger value="webhook">Webhooks</TabsTrigger>
          <TabsTrigger value="retry">Retry History</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>Real-time system and application logs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorLogs.map((log) => {
                    const Icon = getTypeIcon(log.type);
                    return (
                      <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.timestamp}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm capitalize">{log.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                        <TableCell>
                          {log.platform ? (
                            <Badge variant="outline" className="text-xs">
                              {log.platform}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="text-sm truncate">{log.message}</p>
                            {log.trackTitle && (
                              <p className="text-xs text-muted-foreground truncate">
                                Track: {log.trackTitle}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.retryCount !== undefined ? (
                            <Badge variant="secondary" className="text-xs">
                              {log.retryCount}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedError(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Radio className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {errorLogs.filter(l => l.type === "delivery").length} delivery error(s) found
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Webhook className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {errorLogs.filter(l => l.type === "webhook").length} webhook log(s) found
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retry">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {errorLogs.filter(l => (l.retryCount || 0) > 0).length} item(s) with retry history
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Detail Dialog */}
      <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
            <DialogDescription>Complete information about this error</DialogDescription>
          </DialogHeader>
          {selectedError && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Timestamp</Label>
                  <p className="font-mono text-sm mt-1">{selectedError.timestamp}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Error Code</Label>
                  <p className="font-mono text-sm mt-1">{selectedError.errorCode || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <p className="text-sm mt-1 capitalize">{selectedError.type}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Severity</Label>
                  <div className="mt-1">{getSeverityBadge(selectedError.severity)}</div>
                </div>
                {selectedError.platform && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Platform</Label>
                    <p className="text-sm mt-1">{selectedError.platform}</p>
                  </div>
                )}
                {selectedError.trackTitle && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Track</Label>
                    <p className="text-sm mt-1">{selectedError.trackTitle}</p>
                  </div>
                )}
                {selectedError.retryCount !== undefined && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Retry Count</Label>
                    <p className="text-sm mt-1">{selectedError.retryCount}</p>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Error Message</Label>
                <div className="mt-2 p-4 rounded-lg bg-muted font-mono text-sm">
                  {selectedError.message}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-[#ff0050] hover:bg-[#cc0040]">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Now
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Log
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
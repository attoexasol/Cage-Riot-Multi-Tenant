import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Button } from "@/app/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Database,
  HardDrive,
  Zap,
  Clock,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export function SystemHealth() {
  const handleRefresh = () => {
    toast.info("Refreshing system health metrics...");
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>System Status</CardTitle>
              <CardDescription>All systems operational</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-base px-4 py-2 w-fit">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Healthy
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-lg border bg-green-500/5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                <p className="font-medium text-sm sm:text-base">Uptime</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold">99.97%</p>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </div>

            <div className="p-3 sm:p-4 rounded-lg border bg-blue-500/5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                <p className="font-medium text-sm sm:text-base">Response Time</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold">247ms</p>
              <p className="text-xs text-muted-foreground mt-1">Average</p>
            </div>

            <div className="p-3 sm:p-4 rounded-lg border bg-purple-500/5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
                <p className="font-medium text-sm sm:text-base">Requests</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold">2.4M</p>
              <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
            </div>

            <div className="p-3 sm:p-4 rounded-lg border bg-green-500/5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                <p className="font-medium text-sm sm:text-base">Success Rate</p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold">99.8%</p>
              <p className="text-xs text-muted-foreground mt-1">API calls</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Core Services</CardTitle>
            <CardDescription>Application service health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "API Server", status: "operational", latency: "45ms" },
              { name: "Authentication", status: "operational", latency: "12ms" },
              { name: "File Upload", status: "operational", latency: "230ms" },
              { name: "Email Service", status: "operational", latency: "150ms" },
              { name: "Payment Processing", status: "operational", latency: "380ms" },
            ].map((service, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 p-2 sm:p-3 rounded-lg border flex-wrap">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.latency}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 flex-shrink-0 text-xs sm:text-sm">
                  Operational
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>External Integrations</CardTitle>
            <CardDescription>Third-party service status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Spotify API", status: "operational", latency: "120ms" },
              { name: "Apple Music API", status: "operational", latency: "95ms" },
              { name: "YouTube API", status: "operational", latency: "180ms" },
              { name: "AWS S3", status: "operational", latency: "67ms" },
              { name: "Stripe", status: "operational", latency: "145ms" },
            ].map((service, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.latency}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Connected
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Database Health */}
      <Card>
        <CardHeader>
          <CardTitle>Database Health</CardTitle>
          <CardDescription>PostgreSQL performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Database className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                  <p className="font-medium text-sm sm:text-base">Query Performance</p>
                </div>
                <p className="text-xl sm:text-2xl font-semibold">12.5ms</p>
                <p className="text-xs text-muted-foreground mt-1">Avg query time</p>
              </div>

              <div className="p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
                  <p className="font-medium text-sm sm:text-base">Active Connections</p>
                </div>
                <p className="text-xl sm:text-2xl font-semibold">42 / 100</p>
                <Progress value={42} className="mt-2" />
              </div>

              <div className="p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  <p className="font-medium text-sm sm:text-base">Replication Lag</p>
                </div>
                <p className="text-xl sm:text-2xl font-semibold">0.3s</p>
                <p className="text-xs text-muted-foreground mt-1">Primary to replica</p>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-lg border bg-yellow-500/5">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />
                <p className="font-medium text-sm sm:text-base">Slow Queries (last hour)</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs truncate">SELECT * FROM releases WHERE...</code>
                  <span className="text-yellow-600 font-medium flex-shrink-0 text-xs sm:text-sm">2.4s</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs truncate">UPDATE users SET last_login...</code>
                  <span className="text-yellow-600 font-medium flex-shrink-0 text-xs sm:text-sm">1.8s</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>AWS S3 & Cloudflare R2</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 sm:p-4 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <p className="font-medium text-sm sm:text-base">Total Storage</p>
                </div>
                <p className="text-xl sm:text-2xl font-semibold">2.4 TB / 5 TB</p>
              </div>
              <Progress value={48} className="mb-2" />
              <p className="text-xs text-muted-foreground">48% used</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Audio Files</p>
                <p className="text-xl font-semibold">1.8 TB</p>
                <p className="text-xs text-muted-foreground mt-1">75% of total</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Artwork</p>
                <p className="text-xl font-semibold">420 GB</p>
                <p className="text-xs text-muted-foreground mt-1">17.5% of total</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Other</p>
                <p className="text-xl font-semibold">180 GB</p>
                <p className="text-xs text-muted-foreground mt-1">7.5% of total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-yellow-500/5">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Elevated API Response Times</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Brief spike in response times due to database load. Resolved in 15 minutes.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Jan 25, 2026 • 14:30 - 14:45 UTC • Duration: 15 min
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border bg-red-500/5">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Email Service Outage</p>
                <p className="text-sm text-muted-foreground mt-1">
                  SMTP provider experienced downtime. Email queue processed after service restoration.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Jan 18, 2026 • 09:00 - 10:30 UTC • Duration: 1h 30min
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">All Systems Operational</p>
                <p className="text-sm text-muted-foreground mt-1">
                  No incidents reported in the last 12 days.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
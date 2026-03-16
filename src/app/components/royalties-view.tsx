import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
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
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Download,
  TrendingUp,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Globe,
} from "lucide-react";

const revenueData = [
  { month: "Aug", revenue: 4200 },
  { month: "Sep", revenue: 5100 },
  { month: "Oct", revenue: 6300 },
  { month: "Nov", revenue: 7800 },
  { month: "Dec", revenue: 9200 },
  { month: "Jan", revenue: 12800 },
];

const platformEarnings = [
  { platform: "Spotify", revenue: 5240, percentage: 45, streams: 1245000 },
  { platform: "Apple Music", revenue: 3456, percentage: 28, streams: 876000 },
  { platform: "YouTube Music", revenue: 1872, percentage: 15, streams: 654000 },
  { platform: "Amazon Music", revenue: 980, percentage: 8, streams: 423000 },
  { platform: "Others", revenue: 452, percentage: 4, streams: 343000 },
];

const statements = [
  { id: "ST-2026-01", period: "January 2026", amount: 12800, status: "available", released: "2026-02-01" },
  { id: "ST-2025-12", period: "December 2025", amount: 9200, status: "paid", released: "2026-01-01" },
  { id: "ST-2025-11", period: "November 2025", amount: 7800, status: "paid", released: "2025-12-01" },
  { id: "ST-2025-10", period: "October 2025", amount: 6300, status: "paid", released: "2025-11-01" },
];

const territoryBreakdown = [
  { territory: "United States", revenue: 4250, percentage: 35 },
  { territory: "United Kingdom", revenue: 2890, percentage: 24 },
  { territory: "Germany", revenue: 1820, percentage: 15 },
  { territory: "Brazil", revenue: 1210, percentage: 10 },
  { territory: "Canada", revenue: 970, percentage: 8 },
  { territory: "Others", revenue: 960, percentage: 8 },
];

export function RoyaltiesView() {
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">Royalties</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track earnings and download detailed statements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button size="sm" className="bg-[#ff0050] hover:bg-[#cc0040]">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#ff0050]" />
              </div>
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                +39.1%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Total Earnings</p>
            <p className="text-3xl font-semibold mt-1">$48,362</p>
            <p className="text-xs text-muted-foreground mt-2">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-3xl font-semibold mt-1">$12,800</p>
            <p className="text-xs text-muted-foreground mt-2">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-3xl font-semibold mt-1">$8,420</p>
            <p className="text-xs text-muted-foreground mt-2">Processing next month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Statements</p>
            <p className="text-3xl font-semibold mt-1">24</p>
            <p className="text-xs text-muted-foreground mt-2">Total statements issued</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly earnings trend</CardDescription>
            </div>
            <Tabs defaultValue="6m" className="w-auto">
              <TabsList className="h-9">
                <TabsTrigger value="3m" className="text-xs">3M</TabsTrigger>
                <TabsTrigger value="6m" className="text-xs">6M</TabsTrigger>
                <TabsTrigger value="1y" className="text-xs">1Y</TabsTrigger>
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff0050" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff0050" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis
                dataKey="month"
                stroke="currentColor"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                stroke="currentColor"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#ff0050"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Earnings */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings by Platform</CardTitle>
            <CardDescription>Revenue breakdown per DSP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformEarnings.map((platform) => (
                <div key={platform.platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{platform.platform}</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${platform.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {(platform.streams / 1000).toFixed(0)}k streams
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ff0050] rounded-full transition-all"
                        style={{ width: `${platform.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {platform.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Territory Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings by Territory</CardTitle>
            <CardDescription>Revenue by geographic region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {territoryBreakdown.map((territory) => (
                <div key={territory.territory} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{territory.territory}</span>
                    </div>
                    <p className="text-sm font-semibold">${territory.revenue.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${territory.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      {territory.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Royalty Statements</CardTitle>
              <CardDescription>Download detailed monthly statements</CardDescription>
            </div>
            <Button variant="outline" size="sm">View Archive</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statement ID</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Released Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statements.map((statement) => (
                <TableRow key={statement.id}>
                  <TableCell className="font-mono text-sm">{statement.id}</TableCell>
                  <TableCell className="font-medium">{statement.period}</TableCell>
                  <TableCell className="text-muted-foreground">{statement.released}</TableCell>
                  <TableCell className="font-semibold">${statement.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {statement.status === "available" ? (
                      <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
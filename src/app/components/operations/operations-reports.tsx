import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

// Mock data for charts
const deliveryTrendData = [
  { date: "Jan 24", successful: 245, failed: 12, pending: 34 },
  { date: "Jan 25", successful: 289, failed: 8, pending: 28 },
  { date: "Jan 26", successful: 312, failed: 15, pending: 42 },
  { date: "Jan 27", successful: 276, failed: 19, pending: 38 },
  { date: "Jan 28", successful: 328, failed: 11, pending: 31 },
  { date: "Jan 29", successful: 295, failed: 14, pending: 36 },
  { date: "Jan 30", successful: 341, failed: 9, pending: 29 },
];

const qcPerformanceData = [
  { date: "Jan 24", approved: 156, rejected: 23, avgTime: 12.5 },
  { date: "Jan 25", approved: 178, rejected: 19, avgTime: 11.8 },
  { date: "Jan 26", approved: 192, rejected: 28, avgTime: 13.2 },
  { date: "Jan 27", approved: 165, rejected: 21, avgTime: 12.1 },
  { date: "Jan 28", approved: 201, rejected: 17, avgTime: 10.9 },
  { date: "Jan 29", approved: 187, rejected: 25, avgTime: 12.7 },
  { date: "Jan 30", approved: 215, rejected: 20, avgTime: 11.4 },
];

const dspDistributionData = [
  { name: "Spotify", value: 1247, color: "#1DB954" },
  { name: "Apple Music", value: 1089, color: "#FA243C" },
  { name: "YouTube Music", value: 892, color: "#FF0000" },
  { name: "Amazon Music", value: 756, color: "#FF9900" },
  { name: "Deezer", value: 543, color: "#FF6C00" },
  { name: "Tidal", value: 421, color: "#00FFFF" },
  { name: "Others", value: 312, color: "#6B7280" },
];

const errorTypeData = [
  { type: "Metadata Invalid", count: 45, percentage: 32 },
  { type: "Audio Quality", count: 38, percentage: 27 },
  { type: "Artwork Invalid", count: 29, percentage: 21 },
  { type: "Rights Conflict", count: 18, percentage: 13 },
  { type: "Timeout", count: 10, percentage: 7 },
];

const processingTimeData = [
  { stage: "Upload", avgTime: 2.3, maxTime: 5.8 },
  { stage: "QC Review", avgTime: 11.7, maxTime: 28.4 },
  { stage: "Metadata Prep", avgTime: 3.9, maxTime: 9.2 },
  { stage: "DSP Delivery", avgTime: 15.2, maxTime: 42.6 },
  { stage: "Confirmation", avgTime: 8.4, maxTime: 19.3 },
];

const peakHoursData = [
  { hour: "00:00", releases: 12 },
  { hour: "03:00", releases: 8 },
  { hour: "06:00", releases: 15 },
  { hour: "09:00", releases: 42 },
  { hour: "12:00", releases: 67 },
  { hour: "15:00", releases: 89 },
  { hour: "18:00", releases: 54 },
  { hour: "21:00", releases: 31 },
];

const COLORS = ["#ff0050", "#ff4d8a", "#ff99c1", "#ffc6db", "#ffe3ee"];

export function OperationsReports() {
  const [dateRange, setDateRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");

  const handleExport = (reportType: string) => {
    toast.success(`Exporting ${reportType} report...`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Operations Reports</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive analytics and performance metrics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport("All Reports")} className="w-full sm:w-auto">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">2,386</p>
                <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <span className="text-xs sm:text-sm text-green-500 font-medium">+12.3%</span>
                </div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">96.2%</p>
                <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <span className="text-xs sm:text-sm text-green-500 font-medium">+2.1%</span>
                </div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Avg Processing Time</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">11.7h</p>
                <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <span className="text-xs sm:text-sm text-green-500 font-medium">-8.4%</span>
                </div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Issues</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">23</p>
                <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <span className="text-xs sm:text-sm text-green-500 font-medium">-15.2%</span>
                </div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Report Types */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full inline-flex h-auto p-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
          <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4 flex-shrink-0">Overview</TabsTrigger>
          <TabsTrigger value="qc" className="text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4 flex-shrink-0">QC Analytics</TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4 flex-shrink-0">Delivery</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4 flex-shrink-0">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Delivery Trend Chart */}
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-base sm:text-lg">Delivery Trends</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Daily delivery statistics over time</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <AreaChart data={deliveryTrendData}>
                    <defs>
                      <linearGradient id="colorSuccessful" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      className="text-[10px] sm:text-xs"
                      tick={{ fill: 'var(--foreground)' }}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      className="text-[10px] sm:text-xs"
                      tick={{ fill: 'var(--foreground)' }}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ color: 'var(--foreground)', fontSize: '11px' }} />
                    <Area
                      type="monotone"
                      dataKey="successful"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorSuccessful)"
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#colorFailed)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* DSP Distribution */}
            <Card>
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-base sm:text-lg">DSP Distribution</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Total deliveries by platform</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <PieChart>
                    <Pie
                      data={dspDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      style={{ fontSize: '11px' }}
                    >
                      {dspDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Error Types */}
          <Card>
            <CardHeader>
              <CardTitle>Top Error Types</CardTitle>
              <CardDescription>Most common delivery failures</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={errorTypeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="type"
                    className="text-xs"
                    tick={{ fill: 'var(--foreground)' }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'var(--foreground)' }}
                    stroke="var(--muted-foreground)"
                  />
                  <Bar dataKey="count" fill="#ff0050" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QC Analytics Tab */}
        <TabsContent value="qc" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* QC Performance */}
            <Card>
              <CardHeader>
                <CardTitle>QC Approval Rate</CardTitle>
                <CardDescription>Approved vs Rejected submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={qcPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: 'var(--foreground)' }}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'var(--foreground)' }}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                    />
                    <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                    <Line
                      type="monotone"
                      dataKey="approved"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rejected"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: "#ef4444" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* QC Review Time */}
            <Card>
              <CardHeader>
                <CardTitle>Average Review Time</CardTitle>
                <CardDescription>Hours spent in QC review</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={qcPerformanceData}>
                    <defs>
                      <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff0050" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ff0050" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: 'var(--foreground)' }}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'var(--foreground)' }}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgTime"
                      stroke="#ff0050"
                      fillOpacity={1}
                      fill="url(#colorTime)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* QC Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle>QC Statistics Summary</CardTitle>
              <CardDescription>Key quality control metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                    <CheckCircle2 className="h-5 w-5 text-[#ff0050]" />
                  </div>
                  <p className="text-2xl font-semibold">1,294</p>
                  <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Approval Rate</p>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-semibold">89.7%</p>
                  <p className="text-xs text-green-500 mt-1">+3.2% from last week</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Avg Review Time</p>
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-semibold">11.7h</p>
                  <p className="text-xs text-green-500 mt-1">-8.4% faster</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Processing Time by Stage */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Time by Stage</CardTitle>
                <CardDescription>Average and maximum time per stage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processingTimeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="stage"
                      className="text-xs"
                      tick={{ fill: 'var(--foreground)' }}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'var(--foreground)' }}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                    />
                    <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                    <Bar dataKey="avgTime" fill="#ff0050" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="maxTime" fill="#ff99c1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Activity Hours</CardTitle>
                <CardDescription>Release submissions by time of day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={peakHoursData}>
                    <defs>
                      <linearGradient id="colorReleases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="hour"
                      className="text-xs"
                      tick={{ fill: 'var(--foreground)' }}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'var(--foreground)' }}
                      stroke="var(--muted-foreground)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="releases"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorReleases)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* DSP Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>DSP Performance Breakdown</CardTitle>
              <CardDescription>Success rates and average delivery time by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dspDistributionData.map((dsp) => (
                  <div key={dsp.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: dsp.color }}
                      />
                      <div>
                        <p className="font-medium">{dsp.name}</p>
                        <p className="text-sm text-muted-foreground">{dsp.value} deliveries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-sm font-semibold text-green-500">
                          {(95 + Math.random() * 4).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Avg Time</p>
                        <p className="text-sm font-semibold">
                          {(10 + Math.random() * 10).toFixed(1)}h
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4 mt-4">
          {/* Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Efficiency</CardTitle>
                <CardDescription>Overall operations efficiency score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="hsl(var(--border))"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#ff0050"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.94)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-[#ff0050]">94%</span>
                      <span className="text-xs text-muted-foreground">Efficiency</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Throughput</CardTitle>
                <CardDescription>Releases processed per hour</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-[#ff0050]">14.2</span>
                      <span className="text-lg text-muted-foreground">/ hr</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">+18.7%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
                <CardDescription>Failed deliveries percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-green-500">3.8%</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <TrendingDown className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">-2.1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed operational performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "First-Pass Success Rate", value: 87, target: 90 },
                  { label: "Retry Success Rate", value: 92, target: 85 },
                  { label: "QC Efficiency", value: 94, target: 90 },
                  { label: "Delivery Speed", value: 89, target: 85 },
                  { label: "Customer Satisfaction", value: 96, target: 95 },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Target: {metric.target}%
                        </span>
                        <Badge
                          variant="secondary"
                          className={
                            metric.value >= metric.target
                              ? "bg-green-500/10 text-green-600"
                              : "bg-orange-500/10 text-orange-600"
                          }
                        >
                          {metric.value}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          metric.value >= metric.target ? "bg-green-500" : "bg-orange-500"
                        }`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Generate and export detailed reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleExport("Delivery Performance")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Delivery Report
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleExport("QC Analytics")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export QC Report
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleExport("Error Analysis")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Error Report
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleExport("Performance Metrics")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Performance Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
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
  Users,
  Music,
  DollarSign,
  Activity,
  Database,
  Zap,
  Globe,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ff0050", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

// Mock data for charts
const userGrowthData = [
  { month: "Sep", users: 1200, accounts: 180 },
  { month: "Oct", users: 1450, accounts: 210 },
  { month: "Nov", users: 1780, accounts: 245 },
  { month: "Dec", users: 2100, accounts: 298 },
  { month: "Jan", users: 2420, accounts: 356 },
  { month: "Feb", users: 2680, accounts: 412 },
  { month: "Mar", users: 2847, accounts: 487 },
];

const releaseVolumeData = [
  { month: "Sep", releases: 8500 },
  { month: "Oct", releases: 9800 },
  { month: "Nov", releases: 11200 },
  { month: "Dec", releases: 10900 },
  { month: "Jan", releases: 13100 },
  { month: "Feb", releases: 14400 },
  { month: "Mar", releases: 15234 },
];

const deliveryMetricsData = [
  { time: "00:00", delivered: 120, failed: 2, pending: 15 },
  { time: "04:00", delivered: 95, failed: 1, pending: 8 },
  { time: "08:00", delivered: 250, failed: 5, pending: 32 },
  { time: "12:00", delivered: 340, failed: 3, pending: 28 },
  { time: "16:00", delivered: 420, failed: 8, pending: 45 },
  { time: "20:00", delivered: 310, failed: 4, pending: 22 },
  { time: "23:59", delivered: 180, failed: 2, pending: 12 },
];

const accountTypeDistribution = [
  { name: "Enterprise", value: 128, percentage: 26.3 },
  { name: "Standard", value: 359, percentage: 73.7 },
];

const topDSPsData = [
  { name: "Spotify", connections: 3847, deliveries: 12450 },
  { name: "Apple Music", connections: 2934, deliveries: 9823 },
  { name: "YouTube Music", connections: 2456, deliveries: 8234 },
  { name: "Amazon Music", connections: 1823, deliveries: 6012 },
  { name: "Tidal", connections: 892, deliveries: 2945 },
];

const analyticsIngestionData = [
  { hour: "00", events: 145000 },
  { hour: "04", events: 98000 },
  { hour: "08", events: 234000 },
  { hour: "12", events: 312000 },
  { hour: "16", events: 389000 },
  { hour: "20", events: 267000 },
  { hour: "23", events: 178000 },
];

export function PlatformAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[#ff0050]" />
            Platform Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive platform metrics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-semibold mt-1">2,847</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.4% vs last period
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Releases</p>
                <p className="text-2xl font-semibold mt-1">15,234</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +23.1% vs last period
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Music className="h-6 w-6 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Analytics Events</p>
                <p className="text-2xl font-semibold mt-1">2.4M</p>
                <p className="text-xs text-muted-foreground mt-1">per hour average</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Database className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Response Time</p>
                <p className="text-2xl font-semibold mt-1">180ms</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  -15ms vs last period
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        {/* Growth Tab */}
        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>User & Account Growth</CardTitle>
                <CardDescription>Platform user and account growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff0050" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ff0050" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#ff0050"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      name="Users"
                    />
                    <Area
                      type="monotone"
                      dataKey="accounts"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorAccounts)"
                      name="Accounts"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Release Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Release Volume</CardTitle>
                <CardDescription>Total releases processed per month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={releaseVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="releases" fill="#ff0050" name="Releases" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Account Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Type Distribution</CardTitle>
                <CardDescription>Breakdown by account type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={accountTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {accountTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Detailed account type breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accountTypeDistribution.map((type, index) => (
                    <div key={type.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index] }}
                          />
                          <span className="font-medium">{type.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {type.value} accounts ({type.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${type.percentage}%`,
                            backgroundColor: COLORS[index],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Metrics (24h)</CardTitle>
              <CardDescription>Real-time delivery status and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={deliveryMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="delivered"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Delivered"
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Pending"
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Failed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top DSPs */}
          <Card>
            <CardHeader>
              <CardTitle>Top DSP Connections</CardTitle>
              <CardDescription>Most popular distribution platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topDSPsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="connections" fill="#ff0050" name="Connections" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="deliveries" fill="#8b5cf6" name="Deliveries" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Ingestion Rate</CardTitle>
              <CardDescription>Events processed per hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsIngestionData}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="hour" label={{ value: "Hour", position: "insideBottom", offset: -5 }} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="events"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorEvents)"
                    name="Events"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Analytics Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Events Today</p>
                    <p className="text-2xl font-semibold mt-1">58.2M</p>
                    <p className="text-xs text-green-500 mt-1">+8.4% vs yesterday</p>
                  </div>
                  <Database className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Processing Speed</p>
                    <p className="text-2xl font-semibold mt-1">2.4M/hr</p>
                    <p className="text-xs text-green-500 mt-1">Optimal performance</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Error Rate</p>
                    <p className="text-2xl font-semibold mt-1">0.02%</p>
                    <p className="text-xs text-green-500 mt-1">Within SLA</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Users by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { region: "North America", users: 1245, percentage: 43.7 },
                  { region: "Europe", users: 856, percentage: 30.1 },
                  { region: "Asia Pacific", users: 489, percentage: 17.2 },
                  { region: "Latin America", users: 178, percentage: 6.2 },
                  { region: "Others", users: 79, percentage: 2.8 },
                ].map((region, index) => (
                  <div key={region.region}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {region.users.toLocaleString()} users ({region.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ff0050] transition-all"
                        style={{ width: `${region.percentage}%` }}
                      />
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
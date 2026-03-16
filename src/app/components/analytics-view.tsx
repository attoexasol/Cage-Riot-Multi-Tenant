import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Globe,
  Music,
  Users,
  ListMusic,
  MapPin,
  Activity,
  Clock,
  Play,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

// Custom hook to get theme-aware colors for charts
function useChartColors() {
  const [axisColor, setAxisColor] = useState('#f5f5f7'); // Default to white for dark theme
  
  useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setAxisColor(isDark ? '#ffffff' : '#1a1a1a');
    };
    
    // Update initially
    updateColors();
    
    // Watch for theme changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);
  
  return { axisColor };
}

const streamTrendData = [
  { date: "Jan 1", streams: 145000, listeners: 28000, saves: 3200, shares: 1200 },
  { date: "Jan 8", streams: 182000, listeners: 34000, saves: 4100, shares: 1450 },
  { date: "Jan 15", streams: 198000, listeners: 38000, saves: 4800, shares: 1680 },
  { date: "Jan 22", streams: 224000, listeners: 42000, saves: 5500, shares: 1920 },
  { date: "Jan 29", streams: 267000, listeners: 48000, saves: 6200, shares: 2180 },
  { date: "Feb 5", streams: 289000, listeners: 52000, saves: 6900, shares: 2420 },
];

const dailyActivityData = [
  { hour: "12AM", streams: 12000 },
  { hour: "3AM", streams: 8500 },
  { hour: "6AM", streams: 15000 },
  { hour: "9AM", streams: 28000 },
  { hour: "12PM", streams: 42000 },
  { hour: "3PM", streams: 38000 },
  { hour: "6PM", streams: 52000 },
  { hour: "9PM", streams: 48000 },
];

const audienceData = [
  { age: "13-17", male: 18, female: 22 },
  { age: "18-24", male: 35, female: 38 },
  { age: "25-34", male: 28, female: 32 },
  { age: "35-44", male: 15, female: 18 },
  { age: "45-54", male: 8, female: 10 },
  { age: "55+", male: 5, female: 7 },
];

const topTracksData = [
  { name: "Summer Nights", streams: 1245000, growth: 24.3, plays: 987654, saves: 45230 },
  { name: "Electric Dreams", streams: 876543, growth: 18.7, plays: 654321, saves: 32140 },
  { name: "Midnight City", streams: 654321, growth: 32.1, plays: 543210, saves: 28760 },
  { name: "Neon Lights", streams: 543210, growth: 15.2, plays: 432109, saves: 23450 },
  { name: "Ocean Waves", streams: 432109, growth: -5.4, plays: 321098, saves: 18920 },
];

const performanceMetrics = [
  { metric: "Completion Rate", value: 78, fullMark: 100 },
  { metric: "Skip Rate", value: 22, fullMark: 100 },
  { metric: "Repeat Listens", value: 65, fullMark: 100 },
  { metric: "Playlist Adds", value: 82, fullMark: 100 },
  { metric: "Shares", value: 54, fullMark: 100 },
  { metric: "Saves", value: 71, fullMark: 100 },
];

const platformBreakdown = [
  { name: "Spotify", streams: 1500000, value: 30, color: "#1DB954" },
  { name: "Apple Music", streams: 1000000, value: 20, color: "#FF1D57" },
  { name: "YouTube Music", streams: 800000, value: 16, color: "#FF0000" },
  { name: "Amazon Music", streams: 500000, value: 10, color: "#FF9900" },
  { name: "Tidal", streams: 300000, value: 6, color: "#333333" },
];

const geoData = [
  { country: "United States", flag: "🇺🇸", streams: 500000, listeners: 250000 },
  { country: "Canada", flag: "🇨🇦", streams: 300000, listeners: 150000 },
  { country: "United Kingdom", flag: "🇬🇧", streams: 200000, listeners: 100000 },
  { country: "Australia", flag: "🇦🇺", streams: 150000, listeners: 75000 },
  { country: "India", flag: "🇮🇳", streams: 100000, listeners: 50000 },
  { country: "Brazil", flag: "🇧🇷", streams: 80000, listeners: 40000 },
];

const playlistData = [
  { name: "Top Hits 2023", platform: "Spotify", streams: 500000, followers: 1000000 },
  { name: "Vibes", platform: "Apple Music", streams: 400000, followers: 800000 },
  { name: "New Music Friday", platform: "YouTube Music", streams: 300000, followers: 600000 },
  { name: "Discover Weekly", platform: "Spotify", streams: 200000, followers: 400000 },
  { name: "Hot Hits", platform: "Apple Music", streams: 150000, followers: 300000 },
  { name: "Fresh Finds", platform: "YouTube Music", streams: 100000, followers: 200000 },
];

export function AnalyticsView() {
  const chartColors = useChartColors();

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Analytics</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Detailed insights into your performance
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select defaultValue="30d">
            <SelectTrigger className="w-full sm:w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="flex-shrink-0">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Music className="h-5 w-5 text-[#ff0050]" />
              </div>
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                +24.3%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Total Streams</p>
            <p className="text-2xl sm:text-3xl font-semibold mt-1">3.2M</p>
            <p className="text-xs text-muted-foreground mt-2">vs last period: 2.6M</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                +18.7%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Unique Listeners</p>
            <p className="text-2xl sm:text-3xl font-semibold mt-1">487K</p>
            <p className="text-xs text-muted-foreground mt-2">vs last period: 410K</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ListMusic className="h-5 w-5 text-purple-500" />
              </div>
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                +32.1%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Playlist Adds</p>
            <p className="text-2xl sm:text-3xl font-semibold mt-1">12.4K</p>
            <p className="text-xs text-muted-foreground mt-2">vs last period: 9.4K</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-orange-500" />
              </div>
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15.2%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Markets</p>
            <p className="text-2xl sm:text-3xl font-semibold mt-1">142</p>
            <p className="text-xs text-muted-foreground mt-2">countries reached</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Streams & Engagement */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Streams & Engagement</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Performance trends over time</CardDescription>
                </div>
                <Tabs defaultValue="streams" className="w-full sm:w-auto">
                  <TabsList className="h-9 w-full sm:w-auto grid grid-cols-3 sm:flex">
                    <TabsTrigger value="streams" className="text-xs">Streams</TabsTrigger>
                    <TabsTrigger value="listeners" className="text-xs">Listeners</TabsTrigger>
                    <TabsTrigger value="saves" className="text-xs">Saves</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={streamTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff0050" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff0050" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorListeners" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis
                    dataKey="date"
                    stroke={chartColors.axisColor}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: chartColors.axisColor }}
                  />
                  <YAxis
                    stroke={chartColors.axisColor}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: chartColors.axisColor }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [(value / 1000).toFixed(1) + 'k', '']}
                    cursor={{ stroke: '#ff0050', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Legend 
                    wrapperStyle={{ color: "hsl(var(--foreground))" }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="streams"
                    stroke="#ff0050"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorStreams)"
                  />
                  <Area
                    type="monotone"
                    dataKey="listeners"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorListeners)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>Streams by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={false}
                    >
                      {platformBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        padding: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value}% (${(props.payload.streams / 1000).toFixed(0)}k streams)`,
                        props.payload.name
                      ]}
                    />
                    <Legend 
                      wrapperStyle={{ color: "hsl(var(--foreground))", fontSize: '14px' }}
                      iconType="circle"
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Details</CardTitle>
                <CardDescription>Detailed breakdown by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformBreakdown.map((platform) => (
                    <div key={platform.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: platform.color }}
                          />
                          <span className="font-medium text-sm">{platform.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {(platform.streams / 1000).toFixed(0)}k
                          </p>
                          <p className="text-xs text-muted-foreground">{platform.value}%</p>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            backgroundColor: platform.color,
                            width: `${platform.value}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hourly Activity & Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#ff0050]" />
                  Hourly Activity
                </CardTitle>
                <CardDescription>When your listeners are most active</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis
                      dataKey="hour"
                      stroke={chartColors.axisColor}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: chartColors.axisColor }}
                    />
                    <YAxis
                      stroke={chartColors.axisColor}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: chartColors.axisColor }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        padding: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [(value / 1000).toFixed(1) + 'k streams', '']}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                    />
                    <Bar dataKey="streams" fill="#ff0050" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Key engagement indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceMetrics}>
                    <PolarGrid stroke="currentColor" opacity={0.2} />
                    <PolarAngleAxis
                      dataKey="metric"
                      stroke="currentColor"
                      fontSize={11}
                      className="text-muted-foreground"
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      stroke="currentColor"
                      fontSize={10}
                      className="text-muted-foreground"
                    />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#ff0050"
                      fill="#ff0050"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Audience Demographics & Top Tracks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Audience Demographics
                </CardTitle>
                <CardDescription>Age & gender distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={audienceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis
                      type="number"
                      stroke={chartColors.axisColor}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: chartColors.axisColor }}
                    />
                    <YAxis
                      type="category"
                      dataKey="age"
                      stroke={chartColors.axisColor}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: chartColors.axisColor }}
                    />
                    <Legend 
                      wrapperStyle={{ color: "hsl(var(--foreground))" }}
                      iconType="circle"
                    />
                    <Bar dataKey="male" fill="#0ea5e9" radius={[0, 4, 4, 0]} name="Male" />
                    <Bar dataKey="female" fill="#ff0050" radius={[0, 4, 4, 0]} name="Female" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-500" />
                  Top Tracks Performance
                </CardTitle>
                <CardDescription>Your best performing releases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTracksData.map((track, index) => (
                    <div key={track.name} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#ff0050] to-[#cc0040] flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-white">#{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{track.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(track.streams / 1000).toFixed(0)}k streams
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            "ml-2",
                            track.growth > 0
                              ? "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20"
                          )}
                        >
                          {track.growth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {track.growth > 0 ? "+" : ""}{track.growth}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          {/* Platform Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Comparison</CardTitle>
              <CardDescription>Detailed metrics across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={platformBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis
                    dataKey="name"
                    stroke={chartColors.axisColor}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: chartColors.axisColor }}
                  />
                  <YAxis
                    stroke={chartColors.axisColor}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: chartColors.axisColor }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      padding: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'Streams') {
                        return [(value / 1000).toFixed(0) + 'k streams', name];
                      }
                      return [value + '%', name];
                    }}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  />
                  <Legend 
                    wrapperStyle={{ color: "hsl(var(--foreground))" }}
                    iconType="circle"
                  />
                  <Bar dataKey="streams" fill="#ff0050" radius={[8, 8, 0, 0]} name="Streams" />
                  <Line type="monotone" dataKey="value" stroke="#00d4ff" strokeWidth={2} name="Market Share %" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformBreakdown.map((platform) => (
              <Card key={platform.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    <Badge variant="secondary">{platform.value}%</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{platform.name}</h3>
                  <p className="text-2xl font-bold text-[#ff0050] mb-3">
                    {(platform.streams / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-muted-foreground">Total streams</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
              <CardDescription>Top countries by streams and listeners</CardDescription>
            </CardHeader>
            <CardContent className="!px-3.5 sm:!px-6">
              <div className="space-y-3">
                {geoData.map((country, index) => (
                  <div
                    key={country.country}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                          <p className="font-medium text-sm sm:text-base truncate">{country.country}</p>
                          <Badge variant="secondary" className="flex-shrink-0 text-xs">#{index + 1}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Streams</p>
                            <p className="font-medium text-sm sm:text-base">
                              {(country.streams / 1000).toFixed(0)}k
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Listeners</p>
                            <p className="font-medium text-sm sm:text-base">
                              {(country.listeners / 1000).toFixed(0)}k
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playlists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Playlist Placements</CardTitle>
              <CardDescription>Your tracks featured in popular playlists</CardDescription>
            </CardHeader>
            <CardContent className="!px-3.5 sm:!px-6">
              <div className="space-y-3">
                {playlistData.map((playlist) => (
                  <div
                    key={`${playlist.name}-${playlist.platform}`}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-[#ff0050] to-[#cc0040] flex items-center justify-center flex-shrink-0">
                      <ListMusic className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{playlist.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{playlist.platform}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-medium whitespace-nowrap">
                        {(playlist.streams / 1000).toFixed(0)}k streams
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {playlist.followers} followers
                      </p>
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
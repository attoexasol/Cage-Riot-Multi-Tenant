import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Disc3,
  Radio,
  Clock,
  AlertCircle,
  PlayCircle,
  ArrowUpRight,
  Music,
  Globe,
  DollarSign,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { toast } from "sonner";
import React, { useState } from "react";

// Data for different time periods
const streamData7d = [
  { date: "Jan 19", streams: 145000, revenue: 580 },
  { date: "Jan 20", streams: 152000, revenue: 608 },
  { date: "Jan 21", streams: 168000, revenue: 672 },
  { date: "Jan 22", streams: 178000, revenue: 712 },
  { date: "Jan 23", streams: 195000, revenue: 780 },
  { date: "Jan 24", streams: 210000, revenue: 840 },
  { date: "Jan 25", streams: 234000, revenue: 936 },
];

const streamData30d = [
  { date: "Dec 27", streams: 98000, revenue: 392 },
  { date: "Jan 1", streams: 145000, revenue: 580 },
  { date: "Jan 5", streams: 182000, revenue: 728 },
  { date: "Jan 10", streams: 198000, revenue: 792 },
  { date: "Jan 15", streams: 224000, revenue: 896 },
  { date: "Jan 20", streams: 267000, revenue: 1068 },
  { date: "Jan 25", streams: 312000, revenue: 1248 },
];

const streamData90d = [
  { date: "Oct 27", streams: 65000, revenue: 260 },
  { date: "Nov 10", streams: 78000, revenue: 312 },
  { date: "Nov 24", streams: 92000, revenue: 368 },
  { date: "Dec 8", streams: 110000, revenue: 440 },
  { date: "Dec 22", streams: 128000, revenue: 512 },
  { date: "Jan 5", streams: 182000, revenue: 728 },
  { date: "Jan 19", streams: 234000, revenue: 936 },
  { date: "Jan 25", streams: 312000, revenue: 1248 },
];

const streamData1y = [
  { date: "Feb '25", streams: 45000, revenue: 180 },
  { date: "Mar '25", streams: 58000, revenue: 232 },
  { date: "Apr '25", streams: 72000, revenue: 288 },
  { date: "May '25", streams: 89000, revenue: 356 },
  { date: "Jun '25", streams: 105000, revenue: 420 },
  { date: "Jul '25", streams: 128000, revenue: 512 },
  { date: "Aug '25", streams: 156000, revenue: 624 },
  { date: "Sep '25", streams: 178000, revenue: 712 },
  { date: "Oct '25", streams: 198000, revenue: 792 },
  { date: "Nov '25", streams: 225000, revenue: 900 },
  { date: "Dec '25", streams: 267000, revenue: 1068 },
  { date: "Jan '26", streams: 312000, revenue: 1248 },
];

// Summary metrics for each period
const periodMetrics = {
  "7d": {
    totalStreams: "1.28M",
    totalRevenue: "$5,128",
    streamsChange: 18.5,
    revenueChange: 16.2,
  },
  "30d": {
    totalStreams: "3.2M",
    totalRevenue: "$12,848",
    streamsChange: 24.3,
    revenueChange: 21.8,
  },
  "90d": {
    totalStreams: "8.9M",
    totalRevenue: "$35,600",
    streamsChange: 42.8,
    revenueChange: 38.5,
  },
  "1y": {
    totalStreams: "87.4M",
    totalRevenue: "$349,600",
    streamsChange: 156.3,
    revenueChange: 142.7,
  },
};

const platformData = [
  { platform: "Spotify", streams: 1245000, color: "#1DB954" },
  { platform: "Apple Music", streams: 876000, color: "#FA243C" },
  { platform: "YouTube", streams: 654000, color: "#FF0000" },
  { platform: "Amazon", streams: 423000, color: "#FF9900" },
  { platform: "Deezer", streams: 198000, color: "#00C7F2" },
  { platform: "TIDAL", streams: 145000, color: "#000000" },
];

const activityData = [
  {
    id: 1,
    type: "release",
    title: "Summer Nights - Single",
    status: "Live on Spotify",
    time: "2 hours ago",
    icon: Radio,
    color: "text-green-500",
  },
  {
    id: 2,
    type: "error",
    title: "Electric Dreams - Album",
    status: "Delivery failed to Apple Music",
    time: "3 hours ago",
    icon: AlertCircle,
    color: "text-[#ff0050]",
  },
  {
    id: 3,
    type: "upload",
    title: "Midnight City - EP",
    status: "Upload completed",
    time: "5 hours ago",
    icon: Music,
    color: "text-blue-500",
  },
  {
    id: 4,
    type: "royalty",
    title: "December 2025 Statement",
    status: "Royalty statement ready",
    time: "1 day ago",
    icon: DollarSign,
    color: "text-green-500",
  },
];

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: any;
  trend?: "up" | "down";
}

function KPICard({ title, value, change, changeLabel, icon: Icon, trend = "up" }: KPICardProps) {
  const isPositive = trend === "up";
  
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <div className="flex items-center gap-1 mt-2">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-[#ff0050]" />
          )}
          <span className={cn("text-xs font-medium", isPositive ? "text-green-500" : "text-[#ff0050]")}>
            {change}%
          </span>
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardHomeProps {
  onNavigate?: (page: string, params?: any) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const handleExportReport = () => {
    // Prepare CSV data
    const csvData = [];
    
    // Add header
    csvData.push(['Cage Riot Distribution & Publishing Dashboard - Report']);
    csvData.push(['Generated:', new Date().toLocaleString()]);
    csvData.push(['']); // Empty row
    
    // KPIs Section
    csvData.push(['Key Performance Indicators']);
    csvData.push(['Metric', 'Value', 'Change', 'Period']);
    csvData.push(['Total Releases', '1,234', '+12.5%', 'from last month']);
    csvData.push(['Live Releases', '1,187', '+8.3%', 'from last month']);
    csvData.push(['Pending Deliveries', '23', '-15.2%', 'from last week']);
    csvData.push(['Errors / Rejections', '5', '-40.0%', 'from last week']);
    csvData.push(['']); // Empty row
    
    // Revenue & Streams Section
    csvData.push(['Revenue & Streams Summary']);
    csvData.push(['Total Streams', '3.2M', '+24.3%']);
    csvData.push(['Total Revenue', '$12,848', '+21.8%']);
    csvData.push(['']); // Empty row
    
    // Platform Breakdown
    csvData.push(['Platform Breakdown']);
    csvData.push(['Platform', 'Streams']);
    platformData.forEach(platform => {
      csvData.push([platform.platform, platform.streams.toLocaleString()]);
    });
    csvData.push(['']); // Empty row
    
    // Top Releases
    csvData.push(['Top Performing Releases']);
    csvData.push(['Title', 'Artist', 'Streams', 'Revenue', 'Trend']);
    csvData.push(['Summer Nights', 'The Waves', '1.2M', '$4,800', '+32%']);
    csvData.push(['Electric Dreams', 'Neon City', '987K', '$3,948', '+28%']);
    csvData.push(['Midnight City', 'Urban Sound', '845K', '$3,380', '+24%']);
    csvData.push(['Ocean Drive', 'Coast Collective', '723K', '$2,892', '+18%']);
    
    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cage-riot-dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report exported successfully!');
  };

  const handleNewRelease = () => {
    if (onNavigate) {
      onNavigate('upload');
      toast.success('Opening upload page...');
    }
  };

  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm" className="bg-[#ff0050] hover:bg-[#cc0040]" onClick={handleNewRelease}>
            <Music className="h-4 w-4 mr-2" />
            New Release
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Releases"
          value="1,234"
          change={12.5}
          changeLabel="from last month"
          icon={Disc3}
          trend="up"
        />
        <KPICard
          title="Live Releases"
          value="1,187"
          change={8.3}
          changeLabel="from last month"
          icon={Radio}
          trend="up"
        />
        <KPICard
          title="Pending Deliveries"
          value="23"
          change={-15.2}
          changeLabel="from last week"
          icon={Clock}
          trend="down"
        />
        <KPICard
          title="Errors / Rejections"
          value="5"
          change={-40.0}
          changeLabel="from last week"
          icon={AlertCircle}
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streams Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Streams & Revenue</CardTitle>
                <CardDescription>Total streams and revenue over time</CardDescription>
              </div>
              <Tabs defaultValue="30d" className="w-auto" onValueChange={setSelectedPeriod}>
                <TabsList className="h-8">
                  <TabsTrigger value="7d" className="text-xs px-3">7D</TabsTrigger>
                  <TabsTrigger value="30d" className="text-xs px-3">30D</TabsTrigger>
                  <TabsTrigger value="90d" className="text-xs px-3">90D</TabsTrigger>
                  <TabsTrigger value="1y" className="text-xs px-3">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Streams</p>
                <p className="text-2xl font-semibold">{periodMetrics[selectedPeriod].totalStreams}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">{periodMetrics[selectedPeriod].streamsChange}%</span>
                  <span className="text-xs text-muted-foreground">vs last period</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-semibold">{periodMetrics[selectedPeriod].totalRevenue}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">{periodMetrics[selectedPeriod].revenueChange}%</span>
                  <span className="text-xs text-muted-foreground">vs last period</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={selectedPeriod === "7d" ? streamData7d : selectedPeriod === "30d" ? streamData30d : selectedPeriod === "90d" ? streamData90d : streamData1y}>
                <defs>
                  <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff0050" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff0050" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis
                  dataKey="date"
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
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="streams"
                  stroke="#ff0050"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorStreams)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
            <CardDescription>Streams by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformData.map((platform, index) => (
                <div key={platform.platform} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="font-medium">{platform.platform}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {(platform.streams / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: platform.color,
                        width: `${(platform.streams / platformData[0].streams) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alerts</CardTitle>
              <Badge variant="destructive" className="bg-[#ff0050]">8 Active</Badge>
            </div>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#ff0050]/10 border border-[#ff0050]/20">
                <AlertCircle className="h-5 w-5 text-[#ff0050] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Delivery Failed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 releases failed delivery to Spotify
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-[#ff0050] mt-2"
                    onClick={() => onNavigate?.('alert-details', { alertType: 'delivery-failed' })}
                  >
                    View Details →
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#ff0050]/10 border border-[#ff0050]/20">
                <AlertCircle className="h-5 w-5 text-[#ff0050] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Metadata Rejected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Apple Music rejected 2 releases for invalid ISRC codes
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-[#ff0050] mt-2"
                    onClick={() => onNavigate?.('alert-details', { alertType: 'metadata-rejected' })}
                  >
                    View Details →
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Copyright Conflict</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 tracks flagged in audio recognition
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-orange-500 mt-2"
                    onClick={() => onNavigate?.('alert-details', { alertType: 'copyright-conflict' })}
                  >
                    View Details →
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Quality Check Warning</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    4 audio files below recommended quality standards
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-orange-500 mt-2"
                    onClick={() => onNavigate?.('alert-details', { alertType: 'quality-warning' })}
                  >
                    View Details →
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Pending Approval</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    12 releases awaiting legal approval
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-yellow-600 dark:text-yellow-500 mt-2"
                    onClick={() => onNavigate?.('alert-details', { alertType: 'pending-approval' })}
                  >
                    View Details →
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Contract Expiring Soon</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    5 artist contracts expire within 30 days
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-yellow-600 dark:text-yellow-500 mt-2"
                    onClick={() => onNavigate?.('alert-details', { alertType: 'contract-expiring' })}
                  >
                    View Details →
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Missing Artwork</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    6 releases missing required cover artwork
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-blue-500 mt-2"
                    onClick={() => onNavigate?.('alert-details', { alertType: 'missing-artwork' })}
                  >
                    View Details →
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <DollarSign className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Payment Issues</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    3 artists have unresolved payment disputes
                  </p>
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-xs text-purple-500 mt-2"
                    onClick={() => onNavigate?.('alert-details', { alertType: 'payment-issues' })}
                  >
                    View Details →
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityData.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={cn("h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0")}>
                      <Icon className={cn("h-5 w-5", activity.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.status}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Releases */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Performing Releases</CardTitle>
              <CardDescription>Your best releases this month</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: "Summer Nights", artist: "The Waves", streams: "1.2M", revenue: "$4,800", trend: "+32%" },
              { title: "Electric Dreams", artist: "Neon City", streams: "987K", revenue: "$3,948", trend: "+28%" },
              { title: "Midnight City", artist: "Urban Sound", streams: "845K", revenue: "$3,380", trend: "+24%" },
              { title: "Ocean Drive", artist: "Coast Collective", streams: "723K", revenue: "$2,892", trend: "+18%" },
            ].map((release, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#ff0050] to-[#cc0040] flex items-center justify-center flex-shrink-0">
                  <PlayCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{release.title}</p>
                  <p className="text-xs text-muted-foreground">{release.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{release.streams}</p>
                  <p className="text-xs text-muted-foreground">streams</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{release.revenue}</p>
                  <p className="text-xs text-green-500">{release.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Music,
  BarChart3,
  DollarSign,
  Bell,
  PlayCircle,
  TrendingUp,
  Globe,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Radio,
  Settings,
  User,
  Monitor,
  Palette,
  Mail,
  Briefcase,
  MapPin,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/components/auth/auth-context";
import { useTheme } from "next-themes";
import { RoleBadge, humanizeRoleName } from "@/app/components/ui/role-badge";
import logo from "@/assets/1ba82f3a20d2d9c2e55dc299a173428eb2127875.png";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Progress } from "@/app/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/app/components/ui/sheet";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ArtistStats {
  totalStreams: number;
  monthlyListeners: number;
  totalRevenue: number;
  activeReleases: number;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "success" | "info" | "warning" | "error";
}

interface Release {
  id: string;
  title: string;
  artwork: string;
  releaseDate: string;
  status: "Draft" | "Submitted" | "Approved" | "Distributed";
  trackCount: number;
  lastUpdated: string;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Music },
  { id: "releases", label: "Releases", icon: Music },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

const VALID_TABS = new Set(menuItems.map((m) => m.id));

export function ArtistViewerPortal() {
  const { tab: tabParam } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tabParam && VALID_TABS.has(tabParam) ? tabParam : "dashboard";
  const setActiveTab = (id: string) => navigate(`/artist/${id}`);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Release Live on Spotify",
      description: "Summer Nights is now available on Spotify",
      time: "2 hours ago",
      read: false,
      type: "success",
    },
    {
      id: "2",
      title: "Milestone Reached",
      description: "Electric Dreams reached 100K streams",
      time: "5 hours ago",
      read: false,
      type: "info",
    },
    {
      id: "3",
      title: "Distribution Update",
      description: "Midnight City has been sent to all 8 platforms",
      time: "2 days ago",
      read: true,
      type: "info",
    },
  ]);

  const stats: ArtistStats = {
    totalStreams: 2847561,
    monthlyListeners: 124832,
    totalRevenue: 8234.56,
    activeReleases: 8,
  };

  const releases: Release[] = [
    {
      id: "1",
      title: "Summer Nights",
      artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      releaseDate: "2024-03-15",
      status: "Distributed",
      trackCount: 12,
      lastUpdated: "2 hours ago",
    },
    {
      id: "2",
      title: "Electric Dreams",
      artwork: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
      releaseDate: "2024-02-20",
      status: "Distributed",
      trackCount: 10,
      lastUpdated: "1 day ago",
    },
    {
      id: "3",
      title: "Ocean Drive",
      artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      releaseDate: "2024-04-01",
      status: "Approved",
      trackCount: 8,
      lastUpdated: "3 days ago",
    },
    {
      id: "4",
      title: "Midnight City",
      artwork: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
      releaseDate: "2024-04-15",
      status: "Submitted",
      trackCount: 14,
      lastUpdated: "5 days ago",
    },
    {
      id: "5",
      title: "Neon Lights",
      artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
      releaseDate: "2024-05-01",
      status: "Draft",
      trackCount: 9,
      lastUpdated: "1 week ago",
    },
  ];

  const recentActivity = [
    {
      id: "1",
      type: "release",
      title: "Summer Nights went live on Spotify",
      date: "2 hours ago",
      icon: Radio,
      color: "text-green-500",
    },
    {
      id: "2",
      type: "milestone",
      title: "Reached 100K streams on Electric Dreams",
      date: "5 hours ago",
      icon: TrendingUp,
      color: "text-[#ff0050]",
    },
    {
      id: "3",
      type: "distribution",
      title: "Midnight City sent to 8 platforms",
      date: "2 days ago",
      icon: Globe,
      color: "text-purple-500",
    },
  ];

  const topTracks = [
    {
      id: "1",
      title: "Summer Nights",
      streams: 1234567,
      change: "+12.5%",
      trend: "up",
    },
    {
      id: "2",
      title: "Electric Dreams",
      streams: 876543,
      change: "+8.3%",
      trend: "up",
    },
    {
      id: "3",
      title: "Ocean Drive",
      streams: 654321,
      change: "+5.7%",
      trend: "up",
    },
    {
      id: "4",
      title: "Neon Lights",
      streams: 432109,
      change: "-2.1%",
      trend: "down",
    },
  ];

  // Analytics data (simplified - no demographics, no city-level data)
  const streamTrendData = [
    { id: "jan", date: "Jan", streams: 145000 },
    { id: "feb", date: "Feb", streams: 178000 },
    { id: "mar", date: "Mar", streams: 234000 },
    { id: "apr", date: "Apr", streams: 289000 },
    { id: "may", date: "May", streams: 356000 },
    { id: "jun", date: "Jun", streams: 423000 },
  ];

  const platformData = [
    { id: "spotify", name: "Spotify", streams: 1234567, percentage: 45 },
    { id: "apple", name: "Apple Music", streams: 876543, percentage: 32 },
    { id: "youtube", name: "YouTube Music", streams: 456789, percentage: 16 },
    { id: "amazon", name: "Amazon Music", streams: 189456, percentage: 7 },
  ];

  // Revenue data (simplified summary only)
  const revenueData = [
    { id: "jan", month: "Jan", revenue: 1200 },
    { id: "feb", month: "Feb", revenue: 1450 },
    { id: "mar", month: "Mar", revenue: 1680 },
    { id: "apr", month: "Apr", revenue: 1890 },
    { id: "may", month: "May", revenue: 2100 },
    { id: "jun", month: "Jun", revenue: 2340 },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Chart colors that work in both themes
  const chartAxisColor = "#9ca3af"; // neutral gray that works in both modes
  const chartGridColor = "#e5e7eb"; // light gray for grid
  
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getStatusBadge = (status: Release["status"]) => {
    const variants = {
      Draft: "bg-slate-500/10 text-slate-500 border-slate-500/20",
      Submitted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Approved: "bg-green-500/10 text-green-500 border-green-500/20",
      Distributed: "bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20",
    };

    return (
      <Badge
        className={cn(
          "border font-medium text-xs",
          variants[status]
        )}
      >
        {status}
      </Badge>
    );
  };

  const renderDashboard = () => (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8 max-w-[1800px] mx-auto">
      {/* Stats Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Total Streams
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mt-1 truncate">
                  {formatNumber(stats.totalStreams)}
                </p>
                <p className="text-[10px] sm:text-xs text-green-500 mt-1">
                  +12.3% this month
                </p>
              </div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                <PlayCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Monthly Listeners
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mt-1 truncate">
                  {formatNumber(stats.monthlyListeners)}
                </p>
                <p className="text-[10px] sm:text-xs text-green-500 mt-1">
                  +8.7% this month
                </p>
              </div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Total Revenue
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mt-1 truncate">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-xs text-green-500 mt-1">
                  +15.2% this month
                </p>
              </div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 sm:pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Active Releases
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mt-1 truncate">
                  {stats.activeReleases}
                </p>
                <p className="text-[10px] sm:text-xs text-blue-500 mt-1">
                  2 pending
                </p>
              </div>
              <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Music className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Tracks - Responsive: 1 col mobile/tablet, 2 col laptop+ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 xl:gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest updates on your releases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0"
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0",
                        activity.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Top Tracks</CardTitle>
            <CardDescription>Your most streamed tracks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 pb-4 last:pb-0 border-b last:border-0"
                >
                  <div className="text-sm font-semibold text-muted-foreground w-4">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(track.streams)} streams
                    </p>
                  </div>
                  <div
                    className={cn(
                      "text-xs font-medium",
                      track.trend === "up" ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {track.change}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReleases = () => (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8 max-w-[1800px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Releases</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            View release status and details
          </p>
        </div>
      </div>

      {/* Release Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Release Status</CardTitle>
          <CardDescription>
            Track the status of all releases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {releases.map((release) => (
              <div
                key={release.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <img
                  src={release.artwork}
                  alt={release.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-semibold text-sm sm:text-base truncate">
                    {release.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {release.releaseDate}
                    </span>
                    <span>•</span>
                    <span>{release.trackCount} tracks</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    {getStatusBadge(release.status)}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {release.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Release Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#ff0050]">
                {releases.filter((r) => r.status === "Distributed").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Distributed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-500">
                {releases.filter((r) => r.status === "Approved").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-blue-500">
                {releases.filter((r) => r.status === "Submitted").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-semibold text-slate-500">
                {releases.filter((r) => r.status === "Draft").length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Draft</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8 max-w-[1800px] mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Analytics</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          View streaming performance and trends
        </p>
      </div>

      {/* Stream Trend Chart - Responsive heights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg lg:text-xl">Streaming Trends</CardTitle>
          <CardDescription>Total streams over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={streamTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: chartAxisColor }}
                  tickLine={{ stroke: chartAxisColor }}
                  axisLine={{ stroke: chartAxisColor }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: chartAxisColor }}
                  tickLine={{ stroke: chartAxisColor }}
                  axisLine={{ stroke: chartAxisColor }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="streams"
                  stroke="#ff0050"
                  strokeWidth={2}
                  dot={{ fill: "#ff0050", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
          <CardDescription>Streams by platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platformData.map((platform) => (
              <div key={platform.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{platform.name}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(platform.streams)} streams
                  </span>
                </div>
                <Progress value={platform.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Tracks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Tracks</CardTitle>
          <CardDescription>Most streamed tracks this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 pb-4 last:pb-0 border-b last:border-0"
              >
                <div className="text-lg font-semibold text-muted-foreground w-6">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(track.streams)} streams
                  </p>
                </div>
                <div
                  className={cn(
                    "text-sm font-medium",
                    track.trend === "up" ? "text-green-500" : "text-red-500"
                  )}
                >
                  {track.change}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Playlist Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Playlist Activity</CardTitle>
          <CardDescription>Recent playlist additions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Today's Top Hits</p>
                <p className="text-sm text-muted-foreground">Spotify • 28M followers</p>
              </div>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                Added
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">New Music Friday</p>
                <p className="text-sm text-muted-foreground">Apple Music • 15M followers</p>
              </div>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                Added
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Electronic Hits</p>
                <p className="text-sm text-muted-foreground">YouTube Music • 8M followers</p>
              </div>
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                Featured
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRevenue = () => (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8 max-w-[1800px] mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Revenue Summary</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          View earnings overview and trends
        </p>
      </div>

      {/* Revenue Overview - Responsive: 1 col mobile, 3 col tablet+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-green-500 mt-1">+15.2% this month</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">
                  $2,341
                </p>
                <p className="text-xs text-green-500 mt-1">+8.7%</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Month</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">
                  $2,155
                </p>
                <p className="text-xs text-muted-foreground mt-1">Previous period</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart - Responsive heights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg lg:text-xl">Revenue Trend</CardTitle>
          <CardDescription>Monthly earnings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} opacity={0.3} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: chartAxisColor }}
                  tickLine={{ stroke: chartAxisColor }}
                  axisLine={{ stroke: chartAxisColor }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: chartAxisColor }}
                  tickLine={{ stroke: chartAxisColor }}
                  axisLine={{ stroke: chartAxisColor }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [`$${value}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#ff0050" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Release */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Release</CardTitle>
          <CardDescription>Top earning releases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: "summer", title: "Summer Nights", revenue: 3245.67 },
              { id: "electric", title: "Electric Dreams", revenue: 2156.89 },
              { id: "ocean", title: "Ocean Drive", revenue: 1834.12 },
              { id: "neon", title: "Neon Lights", revenue: 997.88 },
            ].map((release) => (
              <div
                key={release.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <p className="font-medium">{release.title}</p>
                <p className="text-lg font-semibold text-green-500">
                  ${release.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simple Platform Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Revenue</CardTitle>
          <CardDescription>Earnings by streaming platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: "spotify", platform: "Spotify", revenue: 3678.45, percentage: 45 },
              { id: "apple", platform: "Apple Music", revenue: 2634.67, percentage: 32 },
              { id: "youtube", platform: "YouTube Music", revenue: 1317.33, percentage: 16 },
              { id: "amazon", platform: "Amazon Music", revenue: 604.11, percentage: 7 },
            ].map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.platform}</span>
                  <span className="text-muted-foreground">
                    ${item.revenue.toLocaleString()}
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Artist Profile</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          View artist information and details (Read-only)
        </p>
      </div>

      {/* Profile Header - Responsive avatar sizes */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-full bg-gradient-to-br from-[#ff0050] to-[#cc0040] flex items-center justify-center text-white text-2xl sm:text-3xl lg:text-4xl font-bold flex-shrink-0">
              TW
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold">The Waves</h3>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  Electronic / Synthwave
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Los Angeles, CA
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <RoleBadge role="artist-viewer" />
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artist Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Basic Information</CardTitle>
            <CardDescription>Artist profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Artist Name
              </label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">The Waves</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Email
              </label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">contact@thewaves.com</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Genre
              </label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">Electronic / Synthwave</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">Los Angeles, CA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Account Details</CardTitle>
            <CardDescription>Your access information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Account Type
              </label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">Enterprise Account</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Your Role
              </label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">Artist Viewer / Collaborator</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Access Level
              </label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">View Only Access</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Member Since
              </label>
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-sm">January 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Artist Bio */}
      <Card>
        <CardHeader>
          <CardTitle>Artist Bio</CardTitle>
          <CardDescription>About the artist</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm leading-relaxed">
              The Waves is an electronic music duo from Los Angeles, known for their unique blend of synthwave and modern electronic production. With multiple chart-topping releases and millions of streams across platforms, they continue to push the boundaries of electronic music.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats - Responsive grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg lg:text-xl">Performance Overview</CardTitle>
          <CardDescription>Artist statistics summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 lg:p-5 border rounded-lg">
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#ff0050]">{formatNumber(stats.totalStreams)}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Total Streams</p>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-5 border rounded-lg">
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-blue-500">{formatNumber(stats.monthlyListeners)}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Monthly Listeners</p>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-5 border rounded-lg">
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-green-500">{stats.activeReleases}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Releases</p>
            </div>
            <div className="text-center p-3 sm:p-4 lg:p-5 border rounded-lg">
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-purple-500">8</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Platforms</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">Settings</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Manage your preferences and account settings
        </p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the dashboard looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm sm:text-base font-medium">Theme Preference</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 lg:p-5 border-2 rounded-lg transition-all hover:bg-muted/50 min-h-[80px] sm:min-h-[100px]",
                  theme === "light"
                    ? "border-[#ff0050] bg-[#ff0050]/5"
                    : "border-border"
                )}
              >
                <Sun className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                <span className="text-xs sm:text-sm font-medium">Light</span>
                {theme === "light" && (
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#ff0050]" />
                )}
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 lg:p-5 border-2 rounded-lg transition-all hover:bg-muted/50 min-h-[80px] sm:min-h-[100px]",
                  theme === "dark"
                    ? "border-[#ff0050] bg-[#ff0050]/5"
                    : "border-border"
                )}
              >
                <Moon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                <span className="text-xs sm:text-sm font-medium">Dark</span>
                {theme === "dark" && (
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#ff0050]" />
                )}
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 lg:p-5 border-2 rounded-lg transition-all hover:bg-muted/50 min-h-[80px] sm:min-h-[100px]",
                  theme === "system"
                    ? "border-[#ff0050] bg-[#ff0050]/5"
                    : "border-border"
                )}
              >
                <Monitor className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                <span className="text-xs sm:text-sm font-medium">System</span>
                {theme === "system" && (
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#ff0050]" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {theme === "system"
                ? "Theme will match your system preference"
                : `Currently using ${theme} mode`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure notification preferences (View only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">Release Updates</p>
              <p className="text-xs text-muted-foreground">
                Get notified when releases go live
              </p>
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              Enabled
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">Milestone Alerts</p>
              <p className="text-xs text-muted-foreground">
                Notifications for streaming milestones
              </p>
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              Enabled
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">Platform Updates</p>
              <p className="text-xs text-muted-foreground">
                Updates about distribution status
              </p>
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              Enabled
            </Badge>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Notification settings are managed by the account owner. Contact them to make changes.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Name
            </label>
            <div className="p-3 border rounded-lg bg-muted/50">
              <p className="text-sm">{user?.name}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Email Address
            </label>
            <div className="p-3 border rounded-lg bg-muted/50">
              <p className="text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Role
            </label>
            <div className="p-3 border rounded-lg bg-muted/50 flex items-center gap-2">
              <RoleBadge role={user?.role || "artist-viewer"} displayLabel={user?.roleName} />
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                You have view-only access. Account details can only be modified by the account owner.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                if (theme === "dark") {
                  setTheme("light");
                  toast.success("Switched to light mode");
                } else {
                  setTheme("dark");
                  toast.success("Switched to dark mode");
                }
              }}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Switch to Dark Mode
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "releases":
        return renderReleases();
      case "analytics":
        return renderAnalytics();
      case "revenue":
        return renderRevenue();
      case "profile":
        return renderProfile();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar - Fixed (same design as artist-portal) */}
      <aside
        className={cn(
          "hidden lg:flex flex-shrink-0 flex-col border-r bg-card transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo + collapse toggle */}
        <div className="p-4 border-b flex items-center justify-between gap-2">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <img src={logo} alt="Cage Riot" className="h-10 w-10 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold truncate">Cage Riot</p>
                <p className="text-xs text-muted-foreground truncate">{user?.organizationName ?? "Artist Portal"}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 flex-shrink-0"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-[#ff0050] text-white"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Section - Theme + Logout (same as artist-portal) */}
        <div className="p-4 border-t space-y-2">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <Sun className="h-5 w-5 flex-shrink-0" />
                )}
                {!sidebarCollapsed && <span className="text-sm font-medium">Theme</span>}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Settings className="h-4 w-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <SheetHeader className="p-6 border-b flex-shrink-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation menu for the Artist Viewer Portal
            </SheetDescription>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Cage Riot" className="h-10 w-10 flex-shrink-0" />
              <div>
                <p className="font-semibold">Cage Riot</p>
                <p className="text-xs text-muted-foreground">{user?.organizationName ?? "Artist Portal"}</p>
              </div>
            </div>
          </SheetHeader>

          <nav className="flex-1 p-4 space-y-1 overflow-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#ff0050] text-white"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t space-y-2 mt-auto flex-shrink-0">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content - Scrollable (sidebar stays fixed) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Top Bar - Responsive */}
        <header className="h-14 sm:h-16 lg:h-18 flex-shrink-0 border-b bg-card/50 backdrop-blur-sm">
          <div className="h-full flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-xl font-semibold truncate">
                  {menuItems.find((item) => item.id === activeTab)?.label ||
                    "Dashboard"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden md:block truncate">
                  View-only access • {user?.roleName ? humanizeRoleName(user.roleName) : user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Notifications - Responsive */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 bg-[#ff0050] rounded-full" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 max-w-[360px]">
                  <div className="flex items-center justify-between p-3 border-b">
                    <DropdownMenuLabel className="p-0">
                      Notifications
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-[#ff0050] hover:bg-transparent"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="max-h-[400px]">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="p-3 cursor-pointer"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3 w-full">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full flex-shrink-0 mt-1.5",
                              !notification.read ? "bg-[#ff0050]" : "bg-muted"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Badge - same design as other dashboards (notification + role badge only) */}
              <RoleBadge
                role={user?.role || "artist-viewer"}
                accountType={user?.accountType}
                displayLabel={user?.roleName}
                size="sm"
                className="hidden sm:flex"
              />
              <RoleBadge
                role={user?.role || "artist-viewer"}
                accountType={user?.accountType}
                displayLabel={user?.roleName}
                showIcon={true}
                size="sm"
                className="flex sm:hidden"
              />
            </div>
          </div>
        </header>

        {/* Content Area - Scrollable, scrollbar hidden */}
        <main className="flex-1 min-h-0 overflow-auto scrollbar-hide">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
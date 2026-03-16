import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Music,
  Upload,
  Radio,
  BarChart3,
  Wallet,
  Settings,
  Bell,
  Users,
  PlayCircle,
  DollarSign,
  TrendingUp,
  Globe,
  Calendar,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  LogOut,
  Shield,
  Check,
  Menu,
  X,
  UserPlus,
  Mail,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/components/auth/auth-context";
import { useTheme } from "next-themes";
import { RoleBadge } from "@/app/components/ui/role-badge";
import logo from "@/assets/1ba82f3a20d2d9c2e55dc299a173428eb2127875.png";
import { AnalyticsView } from "@/app/components/analytics-view";
import { ReleasesView } from "@/app/components/releases-view";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Progress } from "@/app/components/ui/progress";
import { Separator } from "@/app/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  
} from "@/app/components/ui/sheet";

interface ArtistStats {
  totalStreams: number;
  monthlyListeners: number;
  totalRevenue: number;
  activeReleases: number;
  liveOnPlatforms: number;
  pendingReleases: number;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "success" | "info" | "warning" | "error";
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Music, roles: ["artist-owner", "artist-viewer", "account-owner", "viewer"] },
  { id: "releases", label: "Releases", icon: Music, roles: ["artist-owner", "artist-viewer", "account-owner", "viewer"] },
  { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["artist-owner", "artist-viewer", "account-owner", "viewer"] },
  { id: "royalties", label: "Royalties", icon: Wallet, roles: ["artist-owner", "account-owner"] },
  { id: "team", label: "Team", icon: Users, roles: ["artist-owner", "account-owner"] },
  { id: "settings", label: "Settings", icon: Settings, roles: ["artist-owner", "account-owner"] },
];

const VALID_TABS = new Set(menuItems.map((m) => m.id));

export function ArtistPortal() {
  const { tab: tabParam } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tabParam && VALID_TABS.has(tabParam) ? tabParam : "dashboard";
  const setActiveTab = (id: string) => navigate(`/artist/${id}`);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [is2FAEnabled, set2FAEnabled] = useState(true);
  const [is2FAModalOpen, set2FAModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isInviteUserModalOpen, setInviteUserModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "artist-viewer",
  });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [qrCode] = useState("https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/CageRiot:artist@cageriot.com?secret=JBSWY3DPEHPK3PXP&issuer=CageRiot");
  const [backupCodes] = useState([
    "1A2B-3C4D-5E6F",
    "7G8H-9I0J-1K2L",
    "3M4N-5O6P-7Q8R",
    "9S0T-1U2V-3W4X",
  ]);
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
      title: "Payment Processed",
      description: "Your monthly royalty payment of $2,341.89 has been processed",
      time: "1 day ago",
      read: true,
      type: "success",
    },
    {
      id: "4",
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
    liveOnPlatforms: 8,
    pendingReleases: 2,
  };

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
      type: "revenue",
      title: "Monthly royalty payment processed",
      date: "1 day ago",
      icon: DollarSign,
      color: "text-blue-500",
    },
    {
      id: "4",
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

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handlePasswordChange = () => {
    // Mock validation
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error("Please fill in all fields");
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordForm.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Mock success
    toast.success("Password updated successfully!");
    setPasswordModalOpen(false);
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  const handle2FAToggle = () => {
    if (is2FAEnabled) {
      // Disable 2FA
      set2FAEnabled(false);
      set2FAModalOpen(false);
      toast.success("Two-factor authentication disabled");
    } else {
      // Enable 2FA
      set2FAEnabled(true);
      set2FAModalOpen(false);
      toast.success("Two-factor authentication enabled successfully!");
    }
  };

  const handleInviteUser = () => {
    // Mock validation
    if (!inviteForm.email) {
      toast.error("Please enter an email address");
      return;
    }

    if (!inviteForm.role) {
      toast.error("Please select a role");
      return;
    }

    // Mock success
    toast.success("User invited successfully!");
    setInviteUserModalOpen(false);
    setInviteForm({ email: "", role: "artist-viewer" });
  };

  // Check if user has access to a menu item
  const hasAccess = (itemRoles: string[]) => {
    return itemRoles.includes(user?.role || "viewer");
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => hasAccess(item.roles));

  // Check if user is viewer (limited access)
  const isViewer = user?.role === "artist-viewer" || user?.role === "viewer";

  const renderDashboard = () => (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Streams</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">
                  {formatNumber(stats.totalStreams)}
                </p>
                <p className="text-[10px] sm:text-xs text-green-500 mt-1">+12.3% this month</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Monthly Listeners</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">
                  {formatNumber(stats.monthlyListeners)}
                </p>
                <p className="text-[10px] sm:text-xs text-green-500 mt-1">+8.7% this month</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-xs text-green-500 mt-1">+15.2% this month</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Releases</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">{stats.activeReleases}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  {stats.liveOnPlatforms} platforms
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Music className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Live on DSPs</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">{stats.liveOnPlatforms}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  All platforms active
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Radio className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Pending Releases</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">{stats.pendingReleases}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Awaiting distribution
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tracks */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Tracks</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topTracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-[#ff0050] to-[#cc0040] text-white font-semibold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(track.streams)} streams
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    track.trend === "up"
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : "bg-red-500/10 text-red-600 border-red-500/20"
                  )}
                >
                  {track.change}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates on your releases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                      activity.color === "text-green-500" && "bg-green-500/10",
                      activity.color === "text-[#ff0050]" && "bg-[#ff0050]/10",
                      activity.color === "text-blue-500" && "bg-blue-500/10",
                      activity.color === "text-purple-500" && "bg-purple-500/10"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", activity.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {!isViewer && (
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setActiveTab("releases")}
              >
                <Upload className="h-5 w-5 text-[#ff0050]" />
                <span className="text-sm font-medium">Upload New Release</span>
              </Button>
            )}
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={() => setActiveTab("releases")}
            >
              <Music className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">View Releases</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart3 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">View Analytics</span>
            </Button>
            {!isViewer && (
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setActiveTab("royalties")}
              >
                <Wallet className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">View Royalties</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalytics = () => <AnalyticsView />;

  const renderRoyalties = () => (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">My Royalties</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your earnings and payment history
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Download Statement</span>
          <span className="sm:hidden">Download</span>
        </Button>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">$8,234.56</p>
                <p className="text-[10px] sm:text-xs text-green-500 mt-1">+15.2% this month</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Pending Payment</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">$1,456.78</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Due in 14 days</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Last Payment</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">$2,341.89</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Jan 1, 2026</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your recent royalty payments</CardDescription>
        </CardHeader>
        <CardContent className="!px-3.5 sm:!px-6">
          <div className="space-y-4">
            {[
              { date: "Jan 1, 2026", amount: 2341.89, period: "Dec 2025", status: "Paid" },
              { date: "Dec 1, 2025", amount: 1987.45, period: "Nov 2025", status: "Paid" },
              { date: "Nov 1, 2025", amount: 2145.67, period: "Oct 2025", status: "Paid" },
              { date: "Oct 1, 2025", amount: 1876.23, period: "Sep 2025", status: "Paid" },
              { date: "Sep 1, 2025", amount: 2234.56, period: "Aug 2025", status: "Paid" },
            ].map((payment, index) => (
              <div key={index} className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{payment.period} Royalties</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Paid on {payment.date}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-sm sm:text-base whitespace-nowrap">${payment.amount.toLocaleString()}</p>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs mt-1">
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Earnings by Source */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Source</CardTitle>
          <CardDescription>This month's breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { source: "Streaming", amount: 854.32, percentage: 58 },
              { source: "Downloads", amount: 234.56, percentage: 16 },
              { source: "Sync Licensing", amount: 189.45, percentage: 13 },
              { source: "YouTube Content ID", amount: 178.45, percentage: 13 },
            ].map((item) => (
              <div key={item.source}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.source}</span>
                  <span className="text-sm text-muted-foreground">
                    ${item.amount.toLocaleString()} ({item.percentage}%)
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

  const renderSettings = () => (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your artist profile</CardDescription>
        </CardHeader>
        <CardContent className="!px-3.5 sm:!px-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Artist Name</label>
              <input
                type="text"
                defaultValue="The Waves"
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <select className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors">
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Australia</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
              />
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>Manage your payment preferences</CardDescription>
        </CardHeader>
        <CardContent className="!px-3.5 sm:!px-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <select className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors">
              <option>Bank Transfer (ACH)</option>
              <option>PayPal</option>
              <option>Wire Transfer</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Holder Name</label>
              <input
                type="text"
                defaultValue="The Waves"
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Number</label>
              <input
                type="text"
                defaultValue="••••••1234"
                className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
              />
            </div>
          </div>
          <Button>Update Payment Info</Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose what updates you receive</CardDescription>
        </CardHeader>
        <CardContent className="!px-3.5 sm:!px-6 space-y-4">
          {[
            { label: "Release Status Updates", description: "Get notified when your releases go live" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
          ))}
          <Button>Save Preferences</Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="!px-3.5 sm:!px-6 space-y-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base truncate">Two-Factor Authentication</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Add an extra layer of security</p>
            </div>
            <Button
              variant="outline"
              onClick={() => set2FAModalOpen(true)}
              className="flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4"
            >
              {is2FAEnabled ? "Manage" : "Enable"}
            </Button>
          </div>
          <div className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base truncate">Change Password</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Update your password regularly</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setPasswordModalOpen(true)}
              className="flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4"
            >
              Change
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeam = () => (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Team Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your artist team members
          </p>
        </div>
        <Button
          className="w-full sm:w-auto bg-[#ff0050] hover:bg-[#cc0040]"
          onClick={() => setInviteUserModalOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Invite User</span>
          <span className="sm:hidden">Invite</span>
        </Button>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>People who have access to this artist account</CardDescription>
        </CardHeader>
        <CardContent className="!px-3.5 sm:!px-6">
          <div className="space-y-4">
            {[
              { id: "1", name: "The Waves", email: "artist@cageriot.com", role: "Artist Owner", status: "Active" },
              { id: "2", name: "Artist Collaborator", email: "artistviewer@cageriot.com", role: "Artist Viewer", status: "Active" },
              { id: "3", name: "Sarah Mitchell", email: "sarah@example.com", role: "Artist Viewer", status: "Pending" },
            ].map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff0050] to-[#cc0040] flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{member.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant="secondary"
                    className={cn(
                      member.status === "Active"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                    )}
                  >
                    {member.status}
                  </Badge>
                  <Badge variant="outline" className="hidden sm:flex">
                    {member.role}
                  </Badge>
                  {member.email !== user?.email && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => toast.success(`Removed ${member.name} from team`)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invites</CardTitle>
          <CardDescription>Invitations waiting for response</CardDescription>
        </CardHeader>
        <CardContent className="!px-3.5 sm:!px-6">
          <div className="space-y-4">
            {[
              { id: "1", email: "john@example.com", role: "Artist Viewer", sentDate: "2 days ago" },
            ].map((invite) => (
              <div key={invite.id} className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{invite.email}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Sent {invite.sentDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="hidden sm:flex">
                    {invite.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => toast.success(`Cancelled invite to ${invite.email}`)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
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
        return <ReleasesView onNavigateToUpload={() => { }} />;
      case "analytics":
        return renderAnalytics();
      case "royalties":
        return renderRoyalties();
      case "team":
        return renderTeam();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar - Hidden on mobile, shown on desktop */}
      <div className={cn(
        "border-r bg-card flex-col transition-all duration-300 hidden lg:flex",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
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

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {filteredMenuItems.map((item) => {
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

        {/* User Section */}
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
      </div>
 
      {/* Main Content with Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="px-3 sm:px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2">
            {/* Mobile Menu + Title */}
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden flex-shrink-0"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-semibold truncate">
                  {menuItems.find(item => item.id === activeTab)?.label || "Dashboard"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate hidden sm:block">
                  Welcome back, {user?.name || "The Waves"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative flex-shrink-0">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#ff0050] text-white text-xs flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 max-w-80">
                  <div className="flex items-center justify-between p-3 border-b">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-[#ff0050] hover:text-[#ff0050]"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[300px] sm:h-[400px]">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          "p-4 cursor-pointer",
                          !notification.read && "bg-muted/50"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3 w-full">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                            notification.type === "success" && "bg-green-500/10",
                            notification.type === "info" && "bg-blue-500/10",
                            notification.type === "warning" && "bg-orange-500/10",
                            notification.type === "error" && "bg-red-500/10"
                          )}>
                            {notification.type === "success" && (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            )}
                            {notification.type === "info" && (
                              <Bell className="h-5 w-5 text-blue-500" />
                            )} 
                            {notification.type === "warning" && (
                              <AlertCircle className="h-5 w-5 text-orange-500" />
                            )}
                            {notification.type === "error" && (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notification.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-[#ff0050] flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Badge - Hidden on small mobile */}
              <RoleBadge
                role={user?.role || "account-owner"}
                accountType={user?.accountType}
                displayLabel={user?.roleName}
                size="sm"
                className="hidden sm:flex"
              />
              <RoleBadge
                role={user?.role || "account-owner"}
                accountType={user?.accountType}
                displayLabel={user?.roleName}
                showIcon={true}
                size="sm"
                className="flex sm:hidden"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area - scrollbar hidden, scroll still works */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          {renderContent()}
        </div>

        {/* Password Change Modal */}
        <Dialog open={isPasswordModalOpen} onOpenChange={setPasswordModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and a new password to update your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPasswordArtist">Current Password</Label>
                <Input
                  id="currentPasswordArtist"
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPasswordArtist">New Password</Label>
                <Input
                  id="newPasswordArtist"
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPasswordArtist">Confirm New Password</Label>
                <Input
                  id="confirmPasswordArtist"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#ff0050] hover:bg-[#cc0040]"
                onClick={handlePasswordChange}
              >
                <Check className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 2FA Modal */}
        <Dialog open={is2FAModalOpen} onOpenChange={set2FAModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                {is2FAEnabled
                  ? "Manage your two-factor authentication settings"
                  : "Scan the QR code with your authenticator app and save these backup codes."}
              </DialogDescription>
            </DialogHeader>
            {is2FAEnabled ? (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-center p-8 border rounded-lg">
                  <Shield className="h-16 w-16 text-green-500" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium text-green-600">2FA is currently enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-center block">Step 1: Scan QR Code</Label>
                  <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Scan with Google Authenticator, Authy, or any TOTP app
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Step 2: Save Backup Codes</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Store these codes securely. Each can be used once if you lose access to your authenticator.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="bg-muted p-2 rounded text-center font-mono text-sm"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => set2FAModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#ff0050] hover:bg-[#cc0040]"
                onClick={handle2FAToggle}
              >
                <Check className="h-4 w-4 mr-2" />
                {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invite User Modal */}
        <Dialog open={isInviteUserModalOpen} onOpenChange={setInviteUserModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>
                Enter the email address and role of the user you want to invite.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
                >
                  <option value="artist-viewer">Artist Viewer</option>
                  <option value="artist-owner">Artist Owner</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteUserModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#ff0050] hover:bg-[#cc0040]"
                onClick={handleInviteUser}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation menu for the Artist Portal
            </SheetDescription>
            <div className="flex items-center gap-3">
              <img src={logo} alt="Cage Riot" className="h-10 w-10 flex-shrink-0" />
              <div>
                <p className="font-semibold">Cage Riot</p>
                <p className="text-xs text-muted-foreground">{user?.organizationName ?? "Artist Portal"}</p>
              </div>
            </div>
          </SheetHeader>

          <nav className="flex-1 p-4 space-y-1">
            {filteredMenuItems.map((item) => {
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

          <div className="p-4 border-t space-y-2 mt-auto">
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
    </div>
  );
}




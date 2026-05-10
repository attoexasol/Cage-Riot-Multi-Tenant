import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { RoleBadge } from "@/app/components/ui/role-badge";
import {
  LayoutDashboard,
  ShieldAlert,
  Send,
  Loader2,
  XCircle,
  Settings,
  LogOut,
  CheckCircle2,
  Clock,
  TrendingUp,
  Moon,
  Sun,
  BarChart3,
  PlayCircle,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { QCQueue } from "@/app/components/operations/qc-queue";
import { DeliveryQueue } from "@/app/components/operations/delivery-queue";
import { ActiveDeliveries } from "@/app/components/operations/active-deliveries";
import { FailedDeliveries } from "@/app/components/operations/failed-deliveries";
import { OperationsReports } from "@/app/components/operations/operations-reports";
import { useAuth } from "@/app/components/auth/auth-context";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import logo from "@/assets/1ba82f3a20d2d9c2e55dc299a173428eb2127875.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "qc-queue", label: "QC Queue", icon: ShieldAlert },
  { id: "delivery-queue", label: "Delivery Queue", icon: Send },
  { id: "active-deliveries", label: "Active Deliveries", icon: Loader2 },
  { id: "failed-deliveries", label: "Failed Deliveries", icon: XCircle },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const VALID_TABS = new Set(menuItems.map((m) => m.id));

interface RecentActivity {
  id: string;
  type: "qc" | "delivery" | "retry" | "failure";
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

const mockActivity: RecentActivity[] = [
  {
    id: "1",
    type: "delivery",
    description: "Delivered 'Electric Dreams' to 8 DSPs",
    timestamp: "2026-01-30T14:30:00",
    status: "completed",
  },
  {
    id: "2",
    type: "qc",
    description: "QC passed for 'Bass Drops'",
    timestamp: "2026-01-30T14:00:00",
    status: "completed",
  },
  {
    id: "3",
    type: "failure",
    description: "Delivery failed: 'Summer Nights EP' to Spotify",
    timestamp: "2026-01-30T13:30:00",
    status: "failed",
  },
  {
    id: "4",
    type: "retry",
    description: "Retried delivery for 'Ocean Vibes Vol. 3'",
    timestamp: "2026-01-30T13:00:00",
    status: "pending",
  },
  {
    id: "5",
    type: "qc",
    description: "QC override approved for 'Synth Wave Anthology'",
    timestamp: "2026-01-30T12:30:00",
    status: "completed",
  },
];

export function OperationsPortal() {
  const { tab: tabParam } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tabParam && VALID_TABS.has(tabParam) ? tabParam : "dashboard";
  const setActiveTab = (id: string) => navigate(`/operations/${id}`);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  const renderDashboard = () => (
    <div className="px-[14px] py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">QC Failed</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">2</p>
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Requires attention
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Ready to Deliver</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">4</p>
                <p className="text-xs text-muted-foreground mt-1">
                  QC + Legal approved
                </p>
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
                <p className="text-xs sm:text-sm text-muted-foreground">Active Deliveries</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">3</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  62% avg progress
                </p>
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
                <p className="text-xs sm:text-sm text-muted-foreground">Failed Deliveries</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">5</p>
                <p className="text-xs text-muted-foreground mt-1">
                  2 urgent priority
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">QC Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Pass Rate</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">90%</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Avg Check Time</span>
                <Badge variant="outline" className="text-xs">45 sec</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Overrides This Week</span>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 text-xs">3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">Delivery Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Success Rate</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">87%</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Avg Time to Live</span>
                <Badge variant="outline" className="text-xs">4.2 hours</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Delivered Today</span>
                <Badge variant="outline" className="text-xs">12</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">DSP Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">All DSPs Online</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">8/8</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">API Response Time</span>
                <Badge variant="outline" className="text-xs">~250ms</Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Failed APIs</span>
                <Badge variant="outline" className="bg-red-500/10 text-red-600 text-xs">0</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Common operations tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 sm:gap-2 p-3 sm:p-4"
                onClick={() => {
                  setActiveTab("qc-queue");
                  setSidebarOpen(false);
                }}
              >
                <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                <span className="text-xs sm:text-sm font-medium">Review QC</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 sm:gap-2 p-3 sm:p-4"
                onClick={() => {
                  setActiveTab("delivery-queue");
                  setSidebarOpen(false);
                }}
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                <span className="text-xs sm:text-sm font-medium">Deliver Releases</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 sm:gap-2 p-3 sm:p-4"
                onClick={() => {
                  setActiveTab("active-deliveries");
                  setSidebarOpen(false);
                }}
              >
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium">Monitor Active</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 sm:gap-2 p-3 sm:p-4"
                onClick={() => {
                  setActiveTab("failed-deliveries");
                  setSidebarOpen(false);
                }}
              >
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff0050]" />
                <span className="text-xs sm:text-sm font-medium">Retry Failed</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Latest operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {mockActivity.map((activity) => {
              const icons = {
                qc: <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
                delivery: <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
                retry: <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
                failure: <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />,
              };

              const colors = {
                qc: "text-blue-500 bg-blue-500/10",
                delivery: "text-green-500 bg-green-500/10",
                retry: "text-orange-500 bg-orange-500/10",
                failure: "text-red-500 bg-red-500/10",
              };

              return (
                <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                  <div
                    className={cn(
                      "h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                      colors[activity.type]
                    )}
                  >
                    {icons[activity.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Workflow Bottlenecks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Workflow Bottlenecks</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Releases stuck in workflow stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {[
              { stage: "QC Validation", count: 2, avgDays: 3, status: "warning" },
              { stage: "Legal Clearance", count: 1, avgDays: 5, status: "alert" },
              { stage: "Delivery Queue", count: 4, avgDays: 2, status: "normal" },
              { stage: "DSP Processing", count: 3, avgDays: 1, status: "normal" },
            ].map((bottleneck, idx) => (
              <div key={idx} className="flex items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{bottleneck.stage}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {bottleneck.count} release{bottleneck.count !== 1 ? "s" : ""} • Avg {bottleneck.avgDays} day{bottleneck.avgDays !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {bottleneck.status === "alert" && (
                      <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20 flex-shrink-0 text-xs self-start sm:self-auto">
                        <Clock className="h-3 w-3 mr-1" />
                        Delayed
                      </Badge>
                    )}
                    {bottleneck.status === "warning" && (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 flex-shrink-0 text-xs self-start sm:self-auto">
                        <Clock className="h-3 w-3 mr-1" />
                        Slow
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="px-[14px] py-6 sm:px-6">
      <OperationsReports />
    </div>
  );

  const renderSettings = () => (
    <div className="px-[14px] py-6 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Operations Settings</CardTitle>
          <CardDescription>Configure QC and delivery preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* QC Settings */}
            <div>
              <h3 className="font-semibold mb-3">QC Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Auto-Run QC on Upload</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically run QC checks when releases are uploaded
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Require Manager Approval for Overrides</p>
                    <p className="text-sm text-muted-foreground">
                      QC overrides need manager approval
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Delivery Settings */}
            <div>
              <h3 className="font-semibold mb-3">Delivery Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Auto-Retry Failed Deliveries</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically retry failed deliveries (max 3 attempts)
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Business Hours Only</p>
                    <p className="text-sm text-muted-foreground">
                      Only deliver during business hours (9 AM - 6 PM)
                    </p>
                  </div>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
              </div>
            </div>

            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "qc-queue":
        return (
          <div className="px-[14px] py-6 sm:px-6">
            <QCQueue />
          </div>
        );
      case "delivery-queue":
        return (
          <div className="px-[14px] py-6 sm:px-6">
            <DeliveryQueue />
          </div>
        );
      case "active-deliveries":
        return (
          <div className="px-[14px] py-[24px] sm:p-[24px]">
            <ActiveDeliveries />
          </div>
        );
      case "failed-deliveries":
        return (
          <div className="px-[14px] py-6 sm:px-6">
            <FailedDeliveries />
          </div>
        );
      case "reports":
        return renderReports();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex min-h-0 w-full flex-1 overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 border-r bg-card flex flex-col transform transition-all duration-300 ease-in-out lg:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "w-64",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* Logo + collapse toggle */}
        <div className="p-4 border-b flex items-center justify-between gap-2">
          <div className={cn("flex items-center gap-3 min-w-0", sidebarCollapsed && "lg:hidden")}>
            <img src={logo} alt="Cage Riot" className="h-10 w-10 flex-shrink-0 object-contain" />
            <div className="min-w-0">
              <p className="font-semibold truncate">Cage Riot</p>
              <p className="text-xs text-muted-foreground truncate">{user?.organizationName ?? "Operations Portal"}</p>
            </div>
          </div>
          <div
            className={cn(
              "hidden flex-1 justify-center py-0.5",
              sidebarCollapsed && "lg:flex"
            )}
          >
            <img src={logo} alt="Cage Riot" className="h-9 w-9 flex-shrink-0 object-contain" />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex h-8 w-8"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
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
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <Sun className="h-5 w-5 flex-shrink-0" />
                )}
                {!sidebarCollapsed && <span className="text-sm font-medium">Theme</span>}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                <Sun className="h-4 w-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold truncate">
                  {menuItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                  Welcome back, {user?.name || "Operations Team"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <RoleBadge 
                role={user?.role || "operations"} 
                accountType={user?.accountType}
                displayLabel={user?.roleName}
                size="sm"
                className="hidden sm:flex"
              />
              <RoleBadge 
                role={user?.role || "operations"}
                accountType={user?.accountType}
                displayLabel={user?.roleName}
                showIcon={true}
                size="sm"
                className="flex sm:hidden"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">{renderContent()}</div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { RoleBadge } from "@/app/components/ui/role-badge";
import {
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Gavel,
  FileText,
  BarChart3,
  Settings,
  Clock,
  TrendingUp,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { ClearanceQueue } from "@/app/components/legal/clearance-queue";
import { DMCAInbox } from "@/app/components/legal/dmca-inbox";
import { DisputesView } from "@/app/components/legal/disputes";
import { DocumentsView } from "@/app/components/legal/documents";
import { ReportsView } from "@/app/components/legal/reports";
import { TakedownsView } from "@/app/components/takedowns-view";
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
  { id: "clearance", label: "Clearance Queue", icon: CheckCircle2 },
  { id: "dmca", label: "DMCA Notices", icon: AlertTriangle },
  { id: "takedowns", label: "Takedowns", icon: Shield },
  { id: "disputes", label: "Disputes", icon: Gavel },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const VALID_TABS = new Set(menuItems.map((m) => m.id));

interface RecentActivity {
  id: string;
  type: "clearance" | "dmca" | "takedown" | "dispute";
  description: string;
  timestamp: string;
  status: "completed" | "pending" | "urgent";
}

const mockActivity: RecentActivity[] = [
  {
    id: "1",
    type: "clearance",
    description: "Approved clearance for 'Summer Nights EP'",
    timestamp: "2026-01-30T14:30:00",
    status: "completed",
  },
  {
    id: "2",
    type: "dmca",
    description: "Received DMCA notice for 'Electric Dreams'",
    timestamp: "2026-01-30T13:15:00",
    status: "urgent",
  },
  {
    id: "3",
    type: "takedown",
    description: "Submitted takedown to Spotify for unauthorized upload",
    timestamp: "2026-01-30T11:00:00",
    status: "pending",
  },
  {
    id: "4",
    type: "clearance",
    description: "Requested more info for 'Ocean Vibes Vol. 3'",
    timestamp: "2026-01-30T10:45:00",
    status: "pending",
  },
  {
    id: "5",
    type: "dispute",
    description: "Resolved copyright dispute for 'Bass Drops'",
    timestamp: "2026-01-29T16:20:00",
    status: "completed",
  },
];

export function LegalPortal() {
  const { tab: tabParam } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tabParam && VALID_TABS.has(tabParam) ? tabParam : "dashboard";
  const setActiveTab = (id: string) => navigate(`/legal/${id}`);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  const handleMenuItemClick = (itemId: string) => {
    setActiveTab(itemId);
    setIsMobileMenuOpen(false);
  };

  const renderDashboard = () => (
    <div className="px-3.5 sm:px-6 py-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Clearances</p>
                <p className="text-3xl font-semibold mt-1">7</p>
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  3 urgent
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">DMCA Notices</p>
                <p className="text-3xl font-semibold mt-1">5</p>
                <p className="text-xs text-muted-foreground mt-1">
                  3 pending response
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Takedowns</p>
                <p className="text-3xl font-semibold mt-1">12</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +3 this week
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Disputes</p>
                <p className="text-3xl font-semibold mt-1">3</p>
                <p className="text-xs text-muted-foreground mt-1">
                  1 escalated
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Gavel className="h-6 w-6 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clearance Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Approved This Week</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rejected This Week</span>
                <Badge variant="outline" className="bg-red-500/10 text-red-600">2</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Review Time</span>
                <Badge variant="outline">2.3 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">DMCA Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Within Deadline</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600">95%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Accepted Claims</span>
                <Badge variant="outline">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rejected Claims</span>
                <Badge variant="outline">4</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Takedown Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600">87%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Time to Complete</span>
                <Badge variant="outline">5.2 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common legal tasks</CardDescription>
          </CardHeader>
          <CardContent className="px-3.5 px-[14px] pt-[0px] pb-[24px]">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-3 sm:p-4"
                onClick={() => handleMenuItemClick("clearance")}
              >
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-xs sm:text-sm font-medium">Review Clearances</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-3 sm:p-4"
                onClick={() => handleMenuItemClick("dmca")}
              >
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-xs sm:text-sm font-medium">DMCA Inbox</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-3 sm:p-4"
                onClick={() => handleMenuItemClick("takedowns")}
              >
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium">Submit Takedown</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-3 sm:p-4"
                onClick={() => handleMenuItemClick("reports")}
              >
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <span className="text-xs sm:text-sm font-medium">Legal Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest legal operations</CardDescription>
          </CardHeader>
          <CardContent className="px-3.5 sm:px-6 space-y-3">
            {mockActivity.map((activity) => {
              const icons = {
                clearance: <CheckCircle2 className="h-4 w-4" />,
                dmca: <AlertTriangle className="h-4 w-4" />,
                takedown: <Shield className="h-4 w-4" />,
                dispute: <Gavel className="h-4 w-4" />,
              };

              const colors = {
                clearance: "text-green-500 bg-green-500/10",
                dmca: "text-red-500 bg-red-500/10",
                takedown: "text-blue-500 bg-blue-500/10",
                dispute: "text-purple-500 bg-purple-500/10",
              };

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                      colors[activity.type]
                    )}
                  >
                    {icons[activity.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
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

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming DMCA Deadlines</CardTitle>
          <CardDescription>Response deadlines approaching</CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="space-y-3">
            {[
              {
                release: "Ocean Vibes Vol. 3",
                claimant: "Music Publishing Corp",
                deadline: "2026-02-03",
                daysLeft: 4,
                priority: "urgent",
              },
              {
                release: "Summer Nights EP",
                claimant: "Major Record Label Inc.",
                deadline: "2026-02-08",
                daysLeft: 9,
                priority: "high",
              },
              {
                release: "Electric Dreams",
                claimant: "Independent Artist",
                deadline: "2026-02-10",
                daysLeft: 11,
                priority: "normal",
              },
            ].map((deadline, idx) => (
              <div key={idx} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium truncate">{deadline.release}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Claimant: {deadline.claimant}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm sm:text-base font-semibold text-[#ff0050]">
                    {deadline.daysLeft} day{deadline.daysLeft !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(deadline.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDisputes = () => (
    <div className="px-3.5 sm:px-6 py-6">
      <DisputesView />
    </div>
  );

  const renderDocuments = () => (
    <div className="px-3.5 sm:px-6 py-6">
      <DocumentsView />
    </div>
  );

  const renderReports = () => (
    <div className="py-6 px-3.5 md:px-6">
      <ReportsView />
    </div>
  );

  const renderSettings = () => (
    <div className="px-3.5 md:px-6 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Settings</CardTitle>
          <CardDescription>Configure legal team preferences and notifications</CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 md:px-6 py-6">
          <div className="space-y-6">
            {/* Notification Settings */}
            <div>
              <h3 className="font-semibold mb-3">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">DMCA Notice Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Email when new DMCA notices are received
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Deadline Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Alert 3 days before response deadlines
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Clearance Requests</p>
                    <p className="text-sm text-muted-foreground">
                      Notify when new releases need clearance
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Workflow Settings */}
            <div>
              <h3 className="font-semibold mb-3">Workflow</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Auto-Assign Clearances</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically assign new clearances to team members
                    </p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">DMCA Response Template</p>
                    <p className="text-sm text-muted-foreground">
                      Default template for DMCA responses
                    </p>
                  </div>
                  <Badge variant="outline">Standard</Badge>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => toast.success("Settings saved successfully!")}
              className="cursor-pointer"
            >
              Save Settings
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
      case "clearance":
        return (
          <div className="px-3.5 sm:px-6 py-6">
            <ClearanceQueue />
          </div>
        );
      case "dmca":
        return (
          <div className="px-3.5 sm:px-6 py-6">
            <DMCAInbox />
          </div>
        );
      case "takedowns":
        return (
          <div className="px-3.5 sm:px-6 py-6">
            <TakedownsView />
          </div>
        );
      case "disputes":
        return (
          <div className="px-3.5 sm:px-6 py-6">
            <DisputesView />
          </div>
        );
      case "documents":
        return (
          <div className="px-3.5 sm:px-6 py-6">
            <DocumentsView />
          </div>
        );
      case "reports":
        return (
          <div className="py-6 px-3.5 md:px-6">
            <ReportsView />
          </div>
        );
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 border-r bg-card flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "w-64",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* Logo + collapse toggle */}
        <div className="p-4 border-b flex items-center justify-between gap-2">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <img src={logo} alt="Cage Riot" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">Cage Riot</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{user?.organizationName ?? "Legal Portal"}</p>
              </div>
            </div>
          )}
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
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                  isActive
                    ? "bg-[#ff0050] text-white"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-xs sm:text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 sm:p-4 border-t space-y-2">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-left">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                ) : (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                )}
                {!sidebarCollapsed && <span className="text-xs sm:text-sm font-medium">Theme</span>}
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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-left"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-xs sm:text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold truncate">
                {menuItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
                Welcome back, {user?.name || "Legal Team"}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <RoleBadge 
                role={user?.role || "legal"} 
                accountType={user?.accountType}
                displayLabel={user?.roleName}
                size="sm"
                className="hidden sm:flex"
              />
              <RoleBadge 
                role={user?.role || "legal"}
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
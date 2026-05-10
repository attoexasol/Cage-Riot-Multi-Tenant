import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { RoleBadge, AccountTypeBadge } from "@/app/components/ui/role-badge";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Activity,
  Settings,
  LogOut,
  Shield,
  Moon,
  Sun,
  TrendingUp,
  Music,
  DollarSign,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { UserManagement } from "@/app/components/admin/user-management";
import { TenantManagement } from "@/app/components/admin/tenant-management";
import { AuditLogs } from "@/app/components/admin/audit-logs";
import { SystemHealth } from "@/app/components/admin/system-health";
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
  { id: "users", label: "User Management", icon: Users },
  { id: "tenants", label: "Tenant Management", icon: Building2 },
  { id: "audit", label: "Audit Logs", icon: FileText },
  { id: "health", label: "System Health", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
];

const VALID_TABS = new Set(menuItems.map((m) => m.id));

export function AdminPortal() {
  const { tab: tabParam } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tabParam && VALID_TABS.has(tabParam) ? tabParam : "dashboard";
  const setActiveTab = (id: string) => navigate(`/admin/${id}`);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  const renderDashboard = () => (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">8</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2 this month
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Tenants</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">4</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +1 this month
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Releases</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">324</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +45 this month
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                <Music className="h-5 w-5 sm:h-6 sm:w-6 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Platform Revenue</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">$20.5K</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Monthly recurring
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Real-time platform health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "API Server", status: "operational", uptime: "99.98%" },
                { name: "Database", status: "operational", uptime: "99.97%" },
                { name: "File Storage", status: "operational", uptime: "99.95%" },
                { name: "Email Service", status: "operational", uptime: "99.89%" },
              ].map((service, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 sm:p-3 rounded-lg border flex-wrap">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">{service.name}</p>
                      <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 flex-shrink-0 text-xs sm:text-sm">
                    Operational
                  </Badge>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setActiveTab("health")}
            >
              View Full System Health
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 sm:gap-2 p-3 sm:p-4"
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium">Manage Users</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 sm:gap-2 p-3 sm:p-4"
                onClick={() => setActiveTab("tenants")}
              >
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                <span className="text-xs sm:text-sm font-medium">Manage Tenants</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 sm:gap-2 p-3 sm:p-4"
                onClick={() => setActiveTab("audit")}
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                <span className="text-xs sm:text-sm font-medium">View Logs</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-1.5 sm:gap-2 p-3 sm:p-4"
                onClick={() => setActiveTab("health")}
              >
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                <span className="text-xs sm:text-sm font-medium">System Health</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Platform-wide activity log</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  user: "John Anderson",
                  action: "Created tenant 'Electronic Records'",
                  time: "5 minutes ago",
                },
                {
                  user: "Sarah Chen",
                  action: "Delivered release 'Electric Dreams' to 8 DSPs",
                  time: "30 minutes ago",
                },
                {
                  user: "Michael Torres",
                  action: "Approved legal clearance for 'Summer Nights EP'",
                  time: "1 hour ago",
                },
                {
                  user: "Emma Williams",
                  action: "Processed payment for 'The Waves'",
                  time: "2 hours ago",
                },
                {
                  user: "John Anderson",
                  action: "Invited new user 'Alex Johnson'",
                  time: "3 hours ago",
                },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ff0050] to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setActiveTab("audit")}
            >
              View All Activity
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Metrics</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">API Requests</p>
                <p className="text-2xl font-semibold">2.4M</p>
                <p className="text-xs text-green-500 mt-1">+12% vs last month</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Storage Used</p>
                <p className="text-2xl font-semibold">2.4 TB</p>
                <p className="text-xs text-muted-foreground mt-1">48% of capacity</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Active Users</p>
                <p className="text-2xl font-semibold">6</p>
                <p className="text-xs text-muted-foreground mt-1">75% of total</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Error Rate</p>
                <p className="text-2xl font-semibold">0.2%</p>
                <p className="text-xs text-green-500 mt-1">-0.3% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Overview</CardTitle>
          <CardDescription>Organization subscription status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Cage Riot", plan: "Enterprise", users: 12, status: "active" },
              { name: "Indie Label Co", plan: "Pro", users: 8, status: "active" },
              { name: "Urban Sounds", plan: "Pro", users: 5, status: "active" },
              { name: "Electronic Records", plan: "Starter", users: 3, status: "trial" },
            ].map((tenant, idx) => (
              <div key={idx} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{
                      background:
                        idx === 0
                          ? "#ff0050"
                          : idx === 1
                          ? "#3b82f6"
                          : idx === 2
                          ? "#8b5cf6"
                          : "#10b981",
                    }}
                  >
                    {tenant.name.charAt(0)}
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      tenant.status === "active"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    }
                  >
                    {tenant.status}
                  </Badge>
                </div>
                <p className="font-medium">{tenant.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{tenant.plan}</p>
                <p className="text-xs text-muted-foreground mt-2">{tenant.users} users</p>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setActiveTab("tenants")}
          >
            Manage All Tenants
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Configure system-wide settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Platform Settings */}
            <div>
              <h3 className="font-semibold mb-3">Platform Configuration</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Enable to restrict access during updates
                    </p>
                  </div>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">User Registration</p>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to sign up
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Email Verification Required</p>
                    <p className="text-sm text-muted-foreground">
                      Users must verify email before accessing platform
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Feature Flags */}
            <div>
              <h3 className="font-semibold mb-3">Feature Flags</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Audio Recognition</p>
                    <p className="text-sm text-muted-foreground">
                      Enable audio fingerprinting feature
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Publishing Tools</p>
                    <p className="text-sm text-muted-foreground">
                      Enable publishing and copyright management
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Bulk Operations</p>
                    <p className="text-sm text-muted-foreground">
                      Allow bulk release and metadata updates
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
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
      case "users":
        return (
          <div className="p-4 sm:p-6">
            <UserManagement />
          </div>
        );
      case "tenants":
        return (
          <div className="p-4 sm:p-6">
            <TenantManagement />
          </div>
        );
      case "audit":
        return (
          <div className="p-4 sm:p-6">
            <AuditLogs />
          </div>
        );
      case "health":
        return (
          <div className="p-4 sm:p-6">
            <SystemHealth />
          </div>
        );
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
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <img src={logo} alt="Cage Riot" className="h-10 w-10 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold truncate">Cage Riot</p>
                <p className="text-xs text-muted-foreground truncate">{user?.organizationName ?? "Admin Portal"}</p>
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
                  Welcome back, {user?.name || "Administrator"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <RoleBadge 
                role={user?.role || "admin"} 
                accountType={user?.accountType}
                displayLabel={user?.roleName}
                size="sm"
                className="hidden sm:flex"
              />
              <RoleBadge 
                role={user?.role || "admin"}
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
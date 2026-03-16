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
  Database,
  Plug,
  Flag,
  UserPlus,
  AlertTriangle,
  Server,
  BarChart3,
  Clock,
  Zap,
  Eye,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { UserManagement } from "@/app/components/admin/user-management";
import { TenantManagement } from "@/app/components/admin/tenant-management";
import { AuditLogs } from "@/app/components/admin/audit-logs";
import { SystemHealth } from "@/app/components/admin/system-health";
import { CreateUserForm } from "@/app/components/super-admin/create-user-form";
import { FeatureFlagsManagement } from "@/app/components/super-admin/feature-flags-management";
import { ConnectorTypesManagement } from "@/app/components/super-admin/connector-types-management";
import { PlatformAnalytics } from "@/app/components/super-admin/platform-analytics";
import { SupportImpersonation } from "@/app/components/super-admin/support-impersonation";
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
  { id: "dashboard", label: "Platform Overview", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "tenants", label: "Account Management", icon: Building2 },
  { id: "analytics", label: "Platform Analytics", icon: BarChart3 },
  { id: "health", label: "System Health", icon: Activity },
  { id: "connectors", label: "Connector Types", icon: Plug },
  { id: "features", label: "Feature Flags", icon: Flag },
  { id: "audit", label: "Audit Logs", icon: FileText },
  { id: "impersonate", label: "Support Impersonation", icon: Eye },
  { id: "settings", label: "Platform Settings", icon: Settings },
];

const VALID_TABS = new Set(menuItems.map((m) => m.id));

export function SuperAdminPortal() {
  const { tab: tabParam } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tabParam && VALID_TABS.has(tabParam) ? tabParam : "dashboard";
  const setActiveTab = (id: string) => navigate(`/super-admin/${id}`);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    // Log audit event for logout
    console.log("AUDIT LOG:", {
      action: "SUPER_ADMIN_LOGOUT",
      userId: user?.id,
      email: user?.email,
      timestamp: new Date().toISOString(),
    });
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
                <p className="text-2xl sm:text-3xl font-semibold mt-1">2,847</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% this month
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
                <p className="text-xs sm:text-sm text-muted-foreground">Total Accounts</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">487</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8% this month
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
                <p className="text-xs sm:text-sm text-muted-foreground">Active Releases</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1">15,234</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +23% this month
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
                <p className="text-xs sm:text-sm text-muted-foreground">System Health</p>
                <p className="text-2xl sm:text-3xl font-semibold mt-1 text-green-500">99.9%</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  All systems operational
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common platform administration tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex flex-col items-start p-4 gap-2"
              onClick={() => setShowCreateUserForm(true)}
            >
              <UserPlus className="h-5 w-5 text-[#ff0050]" />
              <div className="text-left">
                <div className="font-semibold">Create User</div>
                <div className="text-xs text-muted-foreground">Add new platform user</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-start p-4 gap-2"
              onClick={() => setActiveTab("tenants")}
            >
              <Building2 className="h-5 w-5 text-purple-500" />
              <div className="text-left">
                <div className="font-semibold">Provision Account</div>
                <div className="text-xs text-muted-foreground">Create enterprise account</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-start p-4 gap-2"
              onClick={() => setActiveTab("features")}
            >
              <Flag className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <div className="font-semibold">Feature Flags</div>
                <div className="text-xs text-muted-foreground">Manage platform features</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex flex-col items-start p-4 gap-2"
              onClick={() => setActiveTab("audit")}
            >
              <FileText className="h-5 w-5 text-orange-500" />
              <div className="text-left">
                <div className="font-semibold">View Audit Logs</div>
                <div className="text-xs text-muted-foreground">Monitor activity</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  action: "New Enterprise Account Created",
                  account: "Sunset Records",
                  time: "2 minutes ago",
                  type: "success",
                },
                {
                  action: "Feature Flag Updated",
                  account: "Enhanced Analytics",
                  time: "15 minutes ago",
                  type: "info",
                },
                {
                  action: "User Provisioned",
                  account: "operations@sunsetrecords.com",
                  time: "1 hour ago",
                  type: "success",
                },
                {
                  action: "System Health Check",
                  account: "All services passing",
                  time: "2 hours ago",
                  type: "success",
                },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full mt-2",
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.account}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">All Systems Operational</p>
                  <p className="text-xs text-muted-foreground">
                    Platform running smoothly with 99.9% uptime
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">High Performance</p>
                  <p className="text-xs text-muted-foreground">
                    API response times averaging 180ms
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Server className="h-5 w-5 text-purple-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Database Health</p>
                  <p className="text-xs text-muted-foreground">
                    All databases healthy, 85% capacity
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#ff0050]/10 border border-[#ff0050]/20">
                <Database className="h-5 w-5 text-[#ff0050] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Data Ingestion</p>
                  <p className="text-xs text-muted-foreground">
                    Processing 2.4M analytics events/hour
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return <UserManagement />;
      case "tenants":
        return <TenantManagement />;
      case "analytics":
        return <PlatformAnalytics />;
      case "health":
        return <SystemHealth />;
      case "connectors":
        return <ConnectorTypesManagement />;
      case "features":
        return <FeatureFlagsManagement />;
      case "audit":
        return <AuditLogs />;
      case "impersonate":
        return <SupportImpersonation />;
      case "settings":
        return (
          <div className="p-4 sm:p-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure global platform settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Platform settings coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Cage Riot" className="h-8 w-8 object-contain" />
            <div>
              <div className="font-semibold text-sm">Cage Riot</div>
              <div className="text-xs text-muted-foreground">Platform Admin</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff0050] to-purple-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Super Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <RoleBadge role={user?.role || "platform-super-admin"} />
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              Platform
            </Badge>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  activeTab === item.id && "bg-[#ff0050]/10 text-[#ff0050] hover:bg-[#ff0050]/20"
                )}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="text-sm">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-card sticky top-0 z-30">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Cage Riot" className="h-6 w-6" />
            <span className="font-semibold text-sm">Platform Admin</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        {renderContent()}
      </main>

      {/* Create User Dialog */}
      <CreateUserForm
        open={showCreateUserForm}
        onOpenChange={setShowCreateUserForm}
        onUserCreated={() => {
          toast.success("User created successfully!");
          // Refresh user list if on users tab
          if (activeTab === "users") {
            // Trigger refresh
          }
        }}
      />
    </div>
  );
}

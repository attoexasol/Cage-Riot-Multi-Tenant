import React, { useState, ReactNode } from "react";
import { cn } from "@/app/components/ui/utils";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Separator } from "@/app/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Disc3,
  Upload,
  Radio,
  FileMusic,
  DollarSign,
  BarChart3,
  Fingerprint,
  AlertTriangle,
  PackagePlus,
  AlertCircle,
  Network,
  Users,
  FileText,
  Settings,
  UserCog,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  Moon,
  Sun,
  Building2,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/components/auth/auth-context";
import logo from "@/assets/1ba82f3a20d2d9c2e55dc299a173428eb2127875.png";

interface NavItem {
  title: string;
  icon: any;
  href: string;
  badge?: string | number;
  adminOnly?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: string;
  userRole?: "admin" | "operations" | "legal" | "finance" | "artist";
  onNavigate?: (page: string) => void;
}

const navigationItems: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "dashboard" },
  { title: "Releases", icon: Disc3, href: "releases" },
  { title: "Upload Content", icon: Upload, href: "upload" },
  { title: "Distribution Status", icon: Radio, href: "distribution", badge: 3 },
  { title: "Publishing", icon: FileMusic, href: "publishing" },
  { title: "Royalties", icon: DollarSign, href: "royalties" },
  { title: "Analytics", icon: BarChart3, href: "analytics" },
  { title: "Audio Recognition", icon: Fingerprint, href: "audio-recognition" },
  { title: "Takedowns", icon: AlertTriangle, href: "takedowns" },
  { title: "Bulk Tools", icon: PackagePlus, href: "bulk-tools", adminOnly: true },
  { title: "Errors & Logs", icon: AlertCircle, href: "errors" },
  { title: "Partners / DSPs", icon: Network, href: "partners" },
  { title: "Artists", icon: Users, href: "artists", adminOnly: true },
  { title: "Reports", icon: FileText, href: "reports" },
  { title: "Settings", icon: Settings, href: "settings" },
  { title: "User Management", icon: UserCog, href: "users", adminOnly: true },
];

const artistNavigationItems: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "dashboard" },
  { title: "My Releases", icon: Disc3, href: "releases" },
  { title: "Upload Content", icon: Upload, href: "upload" },
  { title: "Release Status", icon: Radio, href: "distribution" },
  { title: "Analytics", icon: BarChart3, href: "analytics" },
  { title: "Royalties", icon: DollarSign, href: "royalties" },
  { title: "Settings", icon: Settings, href: "settings" },
];

export function DashboardLayout({ children, currentPage: currentPageProp, userRole: userRoleProp, onNavigate: onNavigateProp }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const pathSegment = location.pathname.replace(/^\//, "").split("/")[0];
  const currentPage = currentPageProp ?? (pathSegment || "dashboard");
  const userRole = userRoleProp ?? (user?.role as "admin" | "operations" | "legal" | "finance" | "artist") ?? "account-owner";
  const onNavigate = onNavigateProp ?? ((page: string) => navigate(`/${page}`));

  const navItems = userRole === "artist" ? artistNavigationItems : navigationItems;
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && userRole !== "admin") return false;
    return true;
  });

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case "admin": return "bg-[#ff0050] text-white";
      case "operations": return "bg-blue-500 text-white";
      case "legal": return "bg-purple-500 text-white";
      case "finance": return "bg-green-500 text-white";
      case "artist": return "bg-orange-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="Cage Riot" 
                className="w-8 h-8 object-contain" 
              />
              <div>
                <h1 className="text-sm font-semibold text-sidebar-foreground">Cage Riot</h1>
                <p className="text-[10px] text-muted-foreground">{user?.organizationName ?? "Distribution"}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 p-0"
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => onNavigate(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative",
                    isActive
                      ? "bg-[#ff0050] text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-sm flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "h-5 min-w-5 px-1.5 text-xs",
                            isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Section */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" />
                <AvatarFallback className="bg-[#ff0050] text-white text-xs">
                  {userRole === "artist" ? "AP" : "JD"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {userRole === "artist" ? "Artist Partner" : "John Doe"}
                </p>
                <Badge className={cn("h-5 text-[10px] mt-0.5", getRoleBadgeColor())}>
                  {userRole.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 w-64 h-9"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#ff0050]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                  <DropdownMenuItem className="flex-col items-start py-3">
                    <div className="flex items-center gap-2 w-full">
                      <AlertCircle className="h-4 w-4 text-[#ff0050]" />
                      <span className="text-sm font-medium">Delivery Failed</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      "Summer Nights" failed delivery to Spotify
                    </p>
                    <span className="text-xs text-muted-foreground mt-1">2 hours ago</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex-col items-start py-3">
                    <div className="flex items-center gap-2 w-full">
                      <Radio className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Release Live</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      "Electric Dreams" is now live on Apple Music
                    </p>
                    <span className="text-xs text-muted-foreground mt-1">5 hours ago</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-9">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-[#ff0050] text-white text-xs">
                      {userRole === "artist" ? "AP" : "JD"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden md:block">
                    {userRole === "artist" ? "Artist Partner" : "John Doe"}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span>{userRole === "artist" ? "Artist Partner" : "John Doe"}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {userRole}@cageriot.com
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate("settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                {userRole === "admin" && (
                  <DropdownMenuItem>
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <img 
                  src={logo} 
                  alt="Cage Riot" 
                  className="w-8 h-8 object-contain" 
                />
                <div>
                  <h1 className="text-sm font-semibold text-sidebar-foreground">Cage Riot</h1>
                  <p className="text-[10px] text-muted-foreground">{user?.organizationName ?? "Distribution"}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Navigation */}
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <nav className="space-y-1 px-2 py-4">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        onNavigate(item.href);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                        isActive
                          ? "bg-[#ff0050] text-white"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "h-5 min-w-5 px-1.5 text-xs",
                            isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </ScrollArea>
          </aside>
        </div>
      )}
    </div>
  );
}
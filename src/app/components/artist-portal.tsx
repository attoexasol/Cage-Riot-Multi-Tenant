import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useMatch } from "react-router-dom";
import {
  Music,
  Library,
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
import { displayNameForWelcome, welcomeBackLine } from "@/lib/authDisplay";
import { useAuth } from "@/app/components/auth/auth-context";
import { useTheme } from "next-themes";
import { RoleBadge, humanizeRoleName } from "@/app/components/ui/role-badge";
import logo from "@/assets/1ba82f3a20d2d9c2e55dc299a173428eb2127875.png";
import { AnalyticsView } from "@/app/components/analytics-view";
import { ReleasesView } from "@/app/components/releases-view";
import { UploadContent } from "@/app/components/upload-content";
import { ReleaseDistributionView } from "@/app/components/release-distribution-view";
import type { Section4Focus } from "@/lib/section4Validation";
import {
  ArtistMusicWorkspace,
  type ActionIssueModel,
  type ActivityTimelineItem,
  type WorkspaceBucket,
  type WorkspaceReleaseCardModel,
} from "@/app/components/artist/artist-music-workspace";
import {
  earliestPresignedRefreshDelayMs,
  formatEffectiveReleaseDate,
  formatReleaseDisplayDate,
  pickEffectiveReleaseDate,
  releaseArtworkUrlFromFilePath,
} from "@/lib/releaseFormat";
import { onReleaseCatalogChanged } from "@/lib/releaseEvents";
import {
  listReleaseTracks,
  listReleases,
  normalizeReleaseMetadata,
  type ReleaseListItem,
} from "@/services/releaseService";
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

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "success" | "info" | "warning" | "error";
}

const menuItems = [
  { id: "dashboard", label: "My Music Workspace", icon: Music, roles: ["artist-owner", "artist-viewer", "account-owner", "viewer"] },
  { id: "releases", label: "My Catalog", icon: Library, roles: ["artist-owner", "artist-viewer", "account-owner", "viewer"] },
  { id: "upload", label: "Create Release", icon: Upload, roles: ["artist-owner", "account-owner"] },
  { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["artist-owner", "artist-viewer", "account-owner", "viewer"] },
  { id: "royalties", label: "Royalties", icon: Wallet, roles: ["artist-owner", "account-owner"] },
  { id: "team", label: "Team", icon: Users, roles: ["artist-owner", "account-owner"] },
  { id: "settings", label: "Settings", icon: Settings, roles: ["artist-owner", "account-owner"] },
];

const VALID_TABS = new Set(menuItems.map((m) => m.id));

interface PortalWorkspaceRelease {
  id: string;
  title: string;
  artwork: string;
  releaseDate: string;
  status: "Draft" | "Submitted" | "Approved" | "Live" | "Rejected";
  lastUpdated: string;
  workspaceBucket: WorkspaceBucket;
  primaryArtistName: string;
  releaseTypeLabel: string;
  hasSparseMetadata: boolean;
  missingContributorsSlot: boolean;
}

function formatReleaseTypeShort(apiType: string | null | undefined): string {
  const t = (apiType || "").toLowerCase();
  if (t === "ep") return "EP";
  if (t === "single") return "Single";
  if (t === "album") return "Album";
  const raw = apiType?.trim();
  if (!raw) return "Release";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function mapWorkspaceBucket(apiStatus: string | null | undefined): WorkspaceBucket {
  const s = (apiStatus || "draft").toLowerCase().trim();
  if (s === "rejected") return "rejected";
  if (s === "approved") return "approved";
  if (s === "distributed" || s === "live" || s === "published") return "live";
  if (s === "submitted" || s === "pending" || s === "scheduled") return "in_review";
  return "draft";
}

function normalizePortalReleaseStatus(
  apiStatus: string | null | undefined
): PortalWorkspaceRelease["status"] {
  const s = (apiStatus || "draft").toLowerCase().trim();
  if (s === "rejected") return "Rejected";
  if (s === "approved") return "Approved";
  if (s === "distributed" || s === "live" || s === "published") return "Live";
  if (s === "submitted" || s === "pending" || s === "scheduled") return "Submitted";
  return "Draft";
}

function relativeOrDatePortal(input: string | null | undefined): string {
  const raw = (input || "").trim();
  if (!raw) return "—";
  const t = Date.parse(raw);
  if (Number.isNaN(t)) {
    const asDate = formatReleaseDisplayDate(raw);
    return asDate || "—";
  }
  const diffMs = Date.now() - t;
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatReleaseDisplayDate(raw) || "—";
}

function mapApiReleaseToPortalWorkspace(r: ReleaseListItem): PortalWorkspaceRelease {
  const fp = r.artwork?.file_path?.trim() || "";
  const meta = normalizeReleaseMetadata(r.metadata);
  const hasSparseMetadata =
    !r.upc?.trim() ||
    !pickEffectiveReleaseDate(r) ||
    !r.label_name?.trim() ||
    !r.primary_artist_name?.trim();
  const missingContributorsSlot =
    Object.keys(meta).length > 0 &&
    Object.entries(meta).some(
      ([key, val]) =>
        /contributor|credit|writer|publisher|producer|composer/i.test(key) && !String(val).trim()
    );
  return {
    id: r.id,
    title: r.title?.trim() || "Untitled",
    artwork:
      releaseArtworkUrlFromFilePath(fp) ||
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    releaseDate: formatEffectiveReleaseDate(r),
    status: normalizePortalReleaseStatus(r.status),
    lastUpdated: relativeOrDatePortal(r.updated_at || r.created_at),
    workspaceBucket: mapWorkspaceBucket(r.status),
    primaryArtistName: r.primary_artist_name?.trim() || "—",
    releaseTypeLabel: formatReleaseTypeShort(r.release_type),
    hasSparseMetadata,
    missingContributorsSlot,
  };
}

export function ArtistPortal() {
  const { tab: tabParam } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const distributeMatch = useMatch({ path: "/artist/releases/:releaseId/distribute", end: true });
  const distributionReleaseId = distributeMatch?.params?.releaseId?.trim() ?? null;
  const activeTab = tabParam && VALID_TABS.has(tabParam) ? tabParam : "dashboard";
  const setActiveTab = (id: string) => navigate(`/artist/${id}`);
  /** When set, Create Release tab loads this release for editing (PUT). Cleared for a new upload. */
  const [editReleaseId, setEditReleaseId] = useState<string | null>(null);
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
  const canCreateMusic = user?.role === "artist-owner" || user?.role === "account-owner";

  const [portalReleases, setPortalReleases] = useState<PortalWorkspaceRelease[]>([]);
  const [portalTrackCounts, setPortalTrackCounts] = useState<Record<string, number | null>>({});

  const reloadPortalReleasesFromApi = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    try {
      const apiReleases = await listReleases();
      setPortalReleases(apiReleases.map(mapApiReleaseToPortalWorkspace));
    } catch (err) {
      if (!silent) {
        setPortalReleases([]);
        const message = err instanceof Error ? err.message : "Failed to load releases";
        toast.error(message);
      }
    }
  }, []);

  useEffect(() => {
    void reloadPortalReleasesFromApi();
  }, [reloadPortalReleasesFromApi]);

  useEffect(() => {
    return onReleaseCatalogChanged(() => {
      void reloadPortalReleasesFromApi({ silent: true });
    });
  }, [reloadPortalReleasesFromApi]);

  useEffect(() => {
    if (portalReleases.length === 0) return;
    const minDelay = earliestPresignedRefreshDelayMs(portalReleases.map((r) => r.artwork));
    if (minDelay == null) return;
    const tid = window.setTimeout(() => {
      void reloadPortalReleasesFromApi({ silent: true });
    }, minDelay);
    return () => clearTimeout(tid);
  }, [portalReleases, reloadPortalReleasesFromApi]);

  useEffect(() => {
    let cancelled = false;
    if (portalReleases.length === 0) {
      setPortalTrackCounts({});
      return () => {
        cancelled = true;
      };
    }
    setPortalTrackCounts((prev) => {
      const releaseIds = new Set(portalReleases.map((r) => r.id));
      const next: Record<string, number | null> = {};
      for (const r of portalReleases) {
        next[r.id] = Object.prototype.hasOwnProperty.call(prev, r.id) ? prev[r.id] : null;
      }
      for (const id of Object.keys(prev)) {
        if (!releaseIds.has(id)) {
          delete next[id];
        }
      }
      return next;
    });
    portalReleases.forEach((release) => {
      listReleaseTracks(release.id)
        .then((tracks) => {
          if (cancelled) return;
          const count = tracks.length;
          setPortalTrackCounts((prev) =>
            prev[release.id] === count ? prev : { ...prev, [release.id]: count }
          );
        })
        .catch(() => {
          if (cancelled) return;
          setPortalTrackCounts((prev) =>
            prev[release.id] === 0 ? prev : { ...prev, [release.id]: 0 }
          );
        });
    });
    return () => {
      cancelled = true;
    };
  }, [portalReleases]);

  const artistDisplayName = useMemo(() => displayNameForWelcome(user), [user]);

  const portalStatusCounts = useMemo(() => {
    const base: Record<WorkspaceBucket, number> = {
      draft: 0,
      in_review: 0,
      approved: 0,
      live: 0,
      rejected: 0,
    };
    for (const r of portalReleases) {
      base[r.workspaceBucket]++;
    }
    return base;
  }, [portalReleases]);

  const portalWorkspaceCards = useMemo((): WorkspaceReleaseCardModel[] => {
    return portalReleases.map((r) => ({
      id: r.id,
      title: r.title,
      primaryArtistName: r.primaryArtistName,
      releaseTypeLabel: r.releaseTypeLabel,
      artworkUrl: r.artwork,
      lastEdited: r.lastUpdated,
      workspaceBucket: r.workspaceBucket,
      isIncomplete:
        (r.workspaceBucket === "draft" || r.workspaceBucket === "in_review") &&
        (portalTrackCounts[r.id] === 0 || portalTrackCounts[r.id] == null),
    }));
  }, [portalReleases, portalTrackCounts]);

  const portalActionIssues = useMemo((): ActionIssueModel[] => {
    const missingMeta = portalReleases.filter((r) => r.hasSparseMetadata);
    const rejected = portalReleases.filter((r) => r.workspaceBucket === "rejected");
    const contrib = portalReleases.filter((r) => r.missingContributorsSlot);
    const incompleteTracks = portalReleases.filter((r) => {
      const c = portalTrackCounts[r.id];
      return (
        (r.workspaceBucket === "draft" || r.workspaceBucket === "in_review") &&
        c === 0
      );
    });
    const firstId = (arr: PortalWorkspaceRelease[]) => (arr[0] ? arr[0].id : null);
    return [
      {
        id: "metadata",
        title: "Missing metadata",
        description: "Complete UPC, label, dates, and artist before submission.",
        count: missingMeta.length,
        severity: missingMeta.length ? "warning" : "info",
        ctaLabel: missingMeta.length ? "Fix now" : "Review",
        targetReleaseId: firstId(missingMeta),
      },
      {
        id: "rejected",
        title: "Rejected releases",
        description: "QC or delivery rejected these address notes and resubmit.",
        count: rejected.length,
        severity: rejected.length ? "critical" : "info",
        ctaLabel: rejected.length ? "Review" : "Review",
        targetReleaseId: firstId(rejected),
      },
      {
        id: "contributors",
        title: "Missing contributors",
        description: "Writer, publisher, or contributor credits look incomplete.",
        count: contrib.length,
        severity: contrib.length ? "warning" : "info",
        ctaLabel: contrib.length ? "Fix now" : "Review",
        targetReleaseId: firstId(contrib),
      },
      {
        id: "tracks",
        title: "Incomplete tracks",
        description: "These releases still need audio or track details.",
        count: incompleteTracks.length,
        severity: incompleteTracks.length ? "warning" : "info",
        ctaLabel: incompleteTracks.length ? "Fix now" : "Review",
        targetReleaseId: firstId(incompleteTracks),
      },
    ];
  }, [portalReleases, portalTrackCounts]);

  const portalActivityItems = useMemo((): ActivityTimelineItem[] => {
    const fallback: ActivityTimelineItem[] = [
      {
        id: "f1",
        title: "Release submitted for review",
        time: "When you ship a build, it shows up here.",
        tone: "info",
      },
      {
        id: "f2",
        title: "Approved by QC",
        time: "QC milestones appear in this timeline.",
        tone: "success",
      },
      {
        id: "f3",
        title: "Metadata issue found",
        time: "We surface blockers so you can fix them fast.",
        tone: "warning",
      },
    ];
    if (portalReleases.length === 0) return fallback;
    const rows: ActivityTimelineItem[] = [];
    const r0 = portalReleases[0];
    const r1 = portalReleases[1];
    const r2 = portalReleases[2];
    if (r0) {
      rows.push({
        id: "r0",
        title:
          r0.workspaceBucket === "live"
            ? `${r0.title} · Release went live`
            : r0.workspaceBucket === "rejected"
              ? `${r0.title} · Rejected`
              : `${r0.title} · Release submitted`,
        time: r0.lastUpdated,
        tone:
          r0.workspaceBucket === "live"
            ? "success"
            : r0.workspaceBucket === "rejected"
              ? "failure"
              : "info",
      });
    }
    if (r1) {
      rows.push({
        id: "r1",
        title: r1.hasSparseMetadata
          ? `${r1.title} · Metadata issue found`
          : `${r1.title} · Track updated`,
        time: r1.lastUpdated,
        tone: r1.hasSparseMetadata ? "warning" : "neutral",
      });
    }
    if (r2) {
      rows.push({
        id: "r2",
        title: `${r2.title} · Approved by QC`,
        time: r2.lastUpdated,
        tone: "success",
      });
    }
    rows.push({
      id: "art",
      title: "Artwork validation passed",
      time: "Automated checks",
      tone: "success",
    });
    return rows;
  }, [portalReleases]);

  const handleWorkspaceActionIssuePortal = useCallback(
    (issue: ActionIssueModel) => {
      if (issue.targetReleaseId) {
        navigate(`/artist/releases/${encodeURIComponent(issue.targetReleaseId)}/distribute`);
        return;
      }
      if (issue.id === "rejected") {
        navigate("/artist/releases?catalog=rejected");
        return;
      }
      navigate(`/artist/releases?issue=${encodeURIComponent(issue.id)}`);
    },
    [navigate]
  );

  const goToCreateContent = useCallback(() => {
    setEditReleaseId(null);
    navigate("/artist/upload");
  }, [navigate]);

  const renderDashboard = () => (
    <ArtistMusicWorkspace
      artistDisplayName={artistDisplayName}
      releases={portalWorkspaceCards}
      statusCounts={portalStatusCounts}
      actionIssues={portalActionIssues}
      activityItems={portalActivityItems}
      onNavigateCatalog={(bucket) => navigate(`/artist/releases?catalog=${bucket}`)}
      onOpenRelease={(id) => navigate(`/artist/releases/${encodeURIComponent(id)}/distribute`)}
      onActionIssue={handleWorkspaceActionIssuePortal}
      onCreateNewRelease={canCreateMusic ? goToCreateContent : undefined}
      onCreateNewTrack={canCreateMusic ? goToCreateContent : undefined}
    />
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
    if (distributionReleaseId) {
      return (
        <ReleaseDistributionView
          releaseId={distributionReleaseId}
          viewerMode={user?.role === "viewer" || user?.role === "artist-viewer"}
          onBackToCatalog={() => navigate("/artist/releases")}
          onEditInWorkspace={(focus?: Section4Focus) => {
            setEditReleaseId(distributionReleaseId);
            navigate("/artist/upload", focus ? { state: { section4Focus: focus } } : undefined);
          }}
        />
      );
    }
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "releases":
        return (
          <ReleasesView
            onNavigateToUpload={() => {
              setEditReleaseId(null);
              setActiveTab("upload");
            }}
            onEditRelease={(id) => {
              setEditReleaseId(id);
              setActiveTab("upload");
            }}
            onOpenReleaseWorkspace={(id) =>
              navigate(`/artist/releases/${encodeURIComponent(id)}/distribute`)
            }
          />
        );
      case "upload":
        return (
          <UploadContent
            editReleaseId={editReleaseId}
            onEditConsumed={() => setEditReleaseId(null)}
          />
        );
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
    <div className="flex min-h-0 w-full flex-1 overflow-hidden bg-background">
      {/* Left Sidebar - Hidden on mobile, shown on desktop */}
      <div className={cn(
        "border-r bg-card flex min-h-0 flex-col shrink-0 transition-all duration-300 hidden lg:flex",
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
        <nav className="min-h-0 flex-1 overflow-auto p-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = distributionReleaseId ? item.id === "releases" : activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "upload") setEditReleaseId(null);
                  setActiveTab(item.id);
                }}
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <div className="shrink-0 border-b bg-card/50 backdrop-blur-sm">
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
                {distributionReleaseId ? (
                  <h1 className="text-lg sm:text-xl md:text-2xl font-semibold truncate">Release & distribution</h1>
                ) : (
                  activeTab !== "upload" &&
                  activeTab !== "releases" && (
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold truncate">
                      {menuItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
                    </h1>
                  )
                )}
                {!distributionReleaseId && activeTab !== "releases" && (
                  <p
                    className={cn(
                      "text-xs sm:text-sm text-muted-foreground truncate",
                      activeTab === "upload" ? "mt-0 block" : "mt-0.5 hidden sm:block"
                    )}
                  >
                    {welcomeBackLine(user)}
                  </p>
                )}
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

        {/* Main Content Area — min-h-0 so flexbox does not inflate scroll height past real content */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scrollbar-hide">
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
              const isActive = distributionReleaseId ? item.id === "releases" : activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === "upload") setEditReleaseId(null);
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





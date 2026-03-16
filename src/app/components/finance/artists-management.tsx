import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import {
  Users,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Music,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";

interface Artist {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  type: "Individual" | "Label" | "Band";
  contractStart: string;
  totalReleases: number;
  activeReleases: number;
  lifetimeRevenue: number;
  lastMonthRevenue: number;
  revenueChange: number; // percentage
  pendingPayout: number;
  lastPaymentDate: string;
  paymentMethod: "ACH" | "PayPal" | "Wire" | "Not Set";
  paymentStatus: "current" | "pending" | "overdue";
  splitPercentage: number;
  topDSP: string;
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  period: string;
  status: "completed" | "pending" | "failed";
  method: string;
}

interface ReleasePerformance {
  title: string;
  type: "Single" | "Album" | "EP";
  releaseDate: string;
  revenue: number;
  streams: number;
}

const mockArtists: Artist[] = [
  {
    id: "1",
    name: "The Waves",
    email: "thewaves@example.com",
    phone: "+1 (555) 123-4567",
    location: "Los Angeles, CA",
    type: "Band",
    contractStart: "2024-03-15",
    totalReleases: 8,
    activeReleases: 5,
    lifetimeRevenue: 145678.90,
    lastMonthRevenue: 8234.56,
    revenueChange: 12.5,
    pendingPayout: 2341.89,
    lastPaymentDate: "2026-01-01",
    paymentMethod: "ACH",
    paymentStatus: "current",
    splitPercentage: 80,
    topDSP: "Spotify",
  },
  {
    id: "2",
    name: "Neon City",
    email: "neon@example.com",
    phone: "+1 (555) 234-5678",
    location: "Brooklyn, NY",
    type: "Individual",
    contractStart: "2023-08-20",
    totalReleases: 12,
    activeReleases: 8,
    lifetimeRevenue: 234567.80,
    lastMonthRevenue: 12456.78,
    revenueChange: 8.3,
    pendingPayout: 1876.45,
    lastPaymentDate: "2026-01-01",
    paymentMethod: "PayPal",
    paymentStatus: "current",
    splitPercentage: 85,
    topDSP: "Apple Music",
  },
  {
    id: "3",
    name: "Ocean Records",
    email: "payments@oceanrecords.com",
    phone: "+1 (555) 345-6789",
    location: "Miami, FL",
    type: "Label",
    contractStart: "2022-01-10",
    totalReleases: 45,
    activeReleases: 28,
    lifetimeRevenue: 1234567.90,
    lastMonthRevenue: 45678.90,
    revenueChange: 15.2,
    pendingPayout: 8234.56,
    lastPaymentDate: "2026-01-01",
    paymentMethod: "Wire",
    paymentStatus: "current",
    splitPercentage: 75,
    topDSP: "Spotify",
  },
  {
    id: "4",
    name: "Coast Collective",
    email: "coast@example.com",
    phone: "+1 (555) 456-7890",
    location: "San Diego, CA",
    type: "Band",
    contractStart: "2025-06-01",
    totalReleases: 3,
    activeReleases: 2,
    lifetimeRevenue: 12345.67,
    lastMonthRevenue: 456.78,
    revenueChange: -5.2,
    pendingPayout: 18.75,
    lastPaymentDate: "2025-12-01",
    paymentMethod: "ACH",
    paymentStatus: "pending",
    splitPercentage: 80,
    topDSP: "YouTube Music",
  },
  {
    id: "5",
    name: "Synth Wave",
    email: "synth@example.com",
    phone: "+1 (555) 567-8901",
    location: "Austin, TX",
    type: "Individual",
    contractStart: "2024-09-15",
    totalReleases: 6,
    activeReleases: 4,
    lifetimeRevenue: 34567.89,
    lastMonthRevenue: 2345.67,
    revenueChange: -2.1,
    pendingPayout: 456.78,
    lastPaymentDate: "2025-11-01",
    paymentMethod: "Not Set",
    paymentStatus: "overdue",
    splitPercentage: 82,
    topDSP: "Deezer",
  },
  {
    id: "6",
    name: "Midnight Sound",
    email: "midnight@example.com",
    phone: "+1 (555) 678-9012",
    location: "Nashville, TN",
    type: "Band",
    contractStart: "2023-11-20",
    totalReleases: 10,
    activeReleases: 7,
    lifetimeRevenue: 89012.34,
    lastMonthRevenue: 5678.90,
    revenueChange: 18.7,
    pendingPayout: 3456.89,
    lastPaymentDate: "2026-01-01",
    paymentMethod: "ACH",
    paymentStatus: "current",
    splitPercentage: 80,
    topDSP: "Spotify",
  },
  {
    id: "7",
    name: "Urban Beats",
    email: "urban@example.com",
    phone: "+1 (555) 789-0123",
    location: "Atlanta, GA",
    type: "Individual",
    contractStart: "2025-02-10",
    totalReleases: 4,
    activeReleases: 3,
    lifetimeRevenue: 8901.23,
    lastMonthRevenue: 234.56,
    revenueChange: -8.5,
    pendingPayout: 12.50,
    lastPaymentDate: "2025-10-01",
    paymentMethod: "PayPal",
    paymentStatus: "pending",
    splitPercentage: 85,
    topDSP: "TikTok Music",
  },
  {
    id: "8",
    name: "Electric Dreams Studio",
    email: "dreams@example.com",
    phone: "+1 (555) 890-1234",
    location: "Chicago, IL",
    type: "Label",
    contractStart: "2021-05-15",
    totalReleases: 67,
    activeReleases: 42,
    lifetimeRevenue: 2345678.90,
    lastMonthRevenue: 78901.23,
    revenueChange: 22.3,
    pendingPayout: 5678.90,
    lastPaymentDate: "2026-01-01",
    paymentMethod: "Wire",
    paymentStatus: "current",
    splitPercentage: 70,
    topDSP: "Apple Music",
  },
];

export function ArtistsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "revenue" | "releases">("revenue");
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const filteredArtists = mockArtists
    .filter((artist) => {
      const matchesSearch =
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || artist.type === filterType;
      const matchesStatus = filterStatus === "all" || artist.paymentStatus === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "revenue") return b.lifetimeRevenue - a.lifetimeRevenue;
      if (sortBy === "releases") return b.totalReleases - a.totalReleases;
      return 0;
    });

  const totalRevenue = mockArtists.reduce((sum, a) => sum + a.lifetimeRevenue, 0);
  const totalArtists = mockArtists.length;
  const totalReleases = mockArtists.reduce((sum, a) => sum + a.totalReleases, 0);
  const pendingPayouts = mockArtists.reduce((sum, a) => sum + a.pendingPayout, 0);

  const handleViewDetails = (artist: Artist) => {
    setSelectedArtist(artist);
    setDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: Artist["paymentStatus"]) => {
    const variants = {
      current: "bg-green-500/10 text-green-600 border-green-500/20",
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      overdue: "bg-red-500/10 text-red-600 border-red-500/20",
    };

    const icons = {
      current: <CheckCircle2 className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      overdue: <AlertCircle className="h-3 w-3 mr-1" />,
    };

    const labels = {
      current: "Current",
      pending: "Pending",
      overdue: "Overdue",
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const mockPaymentHistory: PaymentHistory[] = [
    { id: "1", date: "2026-01-01", amount: 8234.56, period: "Dec 2025", status: "completed", method: "ACH" },
    { id: "2", date: "2025-12-01", amount: 7456.78, period: "Nov 2025", status: "completed", method: "ACH" },
    { id: "3", date: "2025-11-01", amount: 6789.90, period: "Oct 2025", status: "completed", method: "ACH" },
    { id: "4", date: "2025-10-01", amount: 7234.56, period: "Sep 2025", status: "completed", method: "ACH" },
  ];

  const mockReleases: ReleasePerformance[] = [
    { title: "Summer Waves", type: "Single", releaseDate: "2025-06-15", revenue: 45678.90, streams: 1234567 },
    { title: "Ocean Dreams", type: "Album", releaseDate: "2025-03-20", revenue: 67890.12, streams: 2345678 },
    { title: "Midnight City", type: "EP", releaseDate: "2024-11-10", revenue: 23456.78, streams: 876543 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Artists</p>
                <p className="text-2xl font-semibold mt-1">{totalArtists}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-semibold mt-1">${(totalRevenue / 1000000).toFixed(2)}M</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Releases</p>
                <p className="text-2xl font-semibold mt-1">{totalReleases}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Music className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-semibold mt-1">${pendingPayouts.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 px-3.5 sm:px-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by artist name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Band">Band</SelectItem>
                <SelectItem value="Label">Label</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Sort by Revenue</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="releases">Sort by Releases</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Artists List */}
      <Card>
        <CardHeader>
          <CardTitle>Artists</CardTitle>
          <CardDescription>
            {filteredArtists.length} artist{filteredArtists.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium">ARTIST</th>
                    <th className="px-4 py-3 text-left text-xs font-medium">LIFETIME REVENUE</th>
                    <th className="px-4 py-3 text-left text-xs font-medium">LAST MONTH</th>
                    <th className="px-4 py-3 text-right text-xs font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredArtists.map((artist) => (
                    <tr key={artist.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-6 w-6 text-[#ff0050]" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{artist.name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">{artist.type}</Badge>
                              {getStatusBadge(artist.paymentStatus)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-lg font-semibold text-green-600">
                          ${artist.lifetimeRevenue.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium">
                            ${artist.lastMonthRevenue.toLocaleString()}
                          </p>
                          {artist.revenueChange > 0 ? (
                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-500" />
                          )}
                          <span
                            className={cn(
                              "text-xs",
                              artist.revenueChange > 0 ? "text-green-500" : "text-red-500"
                            )}
                          >
                            {Math.abs(artist.revenueChange)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(artist)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredArtists.length === 0 && (
              <div className="text-center py-12 border-t">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No artists found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Artist Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Artist Details</DialogTitle>
            <DialogDescription>
              Complete artist profile and financial information
            </DialogDescription>
          </DialogHeader>
          {selectedArtist && (
            <div className="space-y-6 py-4 overflow-x-hidden">
              {/* Artist Header */}
              <div className="p-4 rounded-lg bg-muted overflow-hidden">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-8 w-8 text-[#ff0050]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold break-words">{selectedArtist.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline">{selectedArtist.type}</Badge>
                        {getStatusBadge(selectedArtist.paymentStatus)}
                        <Badge variant="outline">{selectedArtist.splitPercentage}% Split</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded bg-muted overflow-hidden">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium truncate">{selectedArtist.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded bg-muted overflow-hidden">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{selectedArtist.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded bg-muted overflow-hidden">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium truncate">{selectedArtist.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded bg-muted overflow-hidden">
                    <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Payment Method</p>
                      <p className="text-sm font-medium">{selectedArtist.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Stats */}
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm mb-3">Financial Overview</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Lifetime Revenue</p>
                    <p className="text-lg font-bold text-green-600 break-all">
                      ${selectedArtist.lifetimeRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Last Month</p>
                    <p className="text-lg font-bold break-all">
                      ${selectedArtist.lastMonthRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Pending</p>
                    <p className="text-lg font-bold text-[#ff0050] break-all">
                      ${selectedArtist.pendingPayout.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Growth</p>
                    <p className={cn(
                      "text-lg font-bold",
                      selectedArtist.revenueChange > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {selectedArtist.revenueChange > 0 ? "+" : ""}{selectedArtist.revenueChange}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Release Stats */}
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm mb-3">Release Statistics</h4>
                <div className="space-y-2">
                  {mockReleases.map((release, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded border overflow-hidden">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-medium text-sm truncate">{release.title}</p>
                          <Badge variant="outline" className="text-xs flex-shrink-0">{release.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(release.releaseDate).toLocaleDateString()} • {release.streams.toLocaleString()} streams
                        </p>
                      </div>
                      <p className="font-semibold text-sm text-[#ff0050] flex-shrink-0 whitespace-nowrap">
                        ${release.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment History */}
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm mb-3">Payment History</h4>
                <div className="space-y-2">
                  {mockPaymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between gap-3 p-3 rounded border overflow-hidden">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{new Date(payment.date).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{payment.period} • {payment.method}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-sm flex-shrink-0 whitespace-nowrap">
                        ${payment.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                toast.success(`Downloaded statement for ${selectedArtist?.name}`);
              }}
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Statement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
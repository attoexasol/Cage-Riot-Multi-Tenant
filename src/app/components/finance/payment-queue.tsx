import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
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
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Send,
  Eye,
  Ban,
  CheckSquare,
  Square,
  Music,
  TrendingUp,
  Calendar,
  CreditCard,
  Mail,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";

interface PaymentQueueItem {
  id: string;
  artistName: string;
  email: string;
  pendingAmount: number;
  releasesCount: number;
  lastPaymentDate: string;
  paymentMethod: "ACH" | "PayPal" | "Wire" | "Not Set";
  status: "above_threshold" | "below_threshold" | "on_hold";
  threshold: number;
  period: string;
}

const mockPayments: PaymentQueueItem[] = [
  {
    id: "1",
    artistName: "The Waves",
    email: "thewaves@example.com",
    pendingAmount: 2341.89,
    releasesCount: 3,
    lastPaymentDate: "2026-01-01",
    paymentMethod: "ACH",
    status: "above_threshold",
    threshold: 25.00,
    period: "Jan 2026",
  },
  {
    id: "2",
    artistName: "Neon City",
    email: "neon@example.com",
    pendingAmount: 1876.45,
    releasesCount: 5,
    lastPaymentDate: "2026-01-01",
    paymentMethod: "PayPal",
    status: "above_threshold",
    threshold: 25.00,
    period: "Jan 2026",
  },
  {
    id: "3",
    artistName: "Ocean Records",
    email: "payments@oceanrecords.com",
    pendingAmount: 8234.56,
    releasesCount: 12,
    lastPaymentDate: "2026-01-01",
    paymentMethod: "Wire",
    status: "above_threshold",
    threshold: 100.00,
    period: "Jan 2026",
  },
  {
    id: "4",
    artistName: "Coast Collective",
    email: "coast@example.com",
    pendingAmount: 18.75,
    releasesCount: 1,
    lastPaymentDate: "2025-12-01",
    paymentMethod: "ACH",
    status: "below_threshold",
    threshold: 25.00,
    period: "Jan 2026",
  },
  {
    id: "5",
    artistName: "Synth Wave",
    email: "synth@example.com",
    pendingAmount: 456.78,
    releasesCount: 2,
    lastPaymentDate: "2025-11-01",
    paymentMethod: "Not Set",
    status: "on_hold",
    threshold: 25.00,
    period: "Jan 2026",
  },
  {
    id: "6",
    artistName: "Midnight Sound",
    email: "midnight@example.com",
    pendingAmount: 3456.89,
    releasesCount: 7,
    lastPaymentDate: "2026-01-01",
    paymentMethod: "ACH",
    status: "above_threshold",
    threshold: 25.00,
    period: "Jan 2026",
  },
  {
    id: "7",
    artistName: "Urban Beats",
    email: "urban@example.com",
    pendingAmount: 12.50,
    releasesCount: 1,
    lastPaymentDate: "2025-10-01",
    paymentMethod: "PayPal",
    status: "below_threshold",
    threshold: 25.00,
    period: "Jan 2026",
  },
  {
    id: "8",
    artistName: "Electric Dreams Studio",
    email: "dreams@example.com",
    pendingAmount: 5678.90,
    releasesCount: 9,
    lastPaymentDate: "2026-01-01",
    paymentMethod: "Wire",
    status: "above_threshold",
    threshold: 100.00,
    period: "Jan 2026",
  },
  {
    id: "9",
    artistName: "Sunset Vibes",
    email: "sunset@example.com",
    pendingAmount: 234.56,
    releasesCount: 2,
    lastPaymentDate: "2025-12-01",
    paymentMethod: "ACH",
    status: "above_threshold",
    threshold: 25.00,
    period: "Jan 2026",
  },
  {
    id: "10",
    artistName: "Deep Bass Records",
    email: "deepbass@example.com",
    pendingAmount: 987.65,
    releasesCount: 4,
    lastPaymentDate: "2026-01-01",
    paymentMethod: "PayPal",
    status: "above_threshold",
    threshold: 25.00,
    period: "Jan 2026",
  },
];

export function PaymentQueue() {
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"amount" | "artist" | "date">("amount");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  const selectedPaymentDetails = selectedPaymentId
    ? mockPayments.find((p) => p.id === selectedPaymentId)
    : null;

  const filteredPayments = mockPayments
    .filter((payment) => {
      const matchesSearch =
        payment.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || payment.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "amount") return b.pendingAmount - a.pendingAmount;
      if (sortBy === "artist") return a.artistName.localeCompare(b.artistName);
      if (sortBy === "date") return new Date(b.lastPaymentDate).getTime() - new Date(a.lastPaymentDate).getTime();
      return 0;
    });

  const selectedTotal = mockPayments
    .filter((p) => selectedPayments.includes(p.id))
    .reduce((sum, p) => sum + p.pendingAmount, 0);

  const aboveThresholdCount = filteredPayments.filter(
    (p) => p.status === "above_threshold"
  ).length;
  const belowThresholdCount = filteredPayments.filter(
    (p) => p.status === "below_threshold"
  ).length;
  const onHoldCount = filteredPayments.filter((p) => p.status === "on_hold").length;

  const toggleSelection = (id: string) => {
    setSelectedPayments((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredPayments.map((p) => p.id));
    }
  };

  const handleProcessPayments = () => {
    if (selectedPayments.length === 0) {
      toast.error("Please select at least one payment to process");
      return;
    }
    toast.success(`Processing ${selectedPayments.length} payment${selectedPayments.length > 1 ? "s" : ""} ($${selectedTotal.toFixed(2)})`);
    setSelectedPayments([]);
  };

  const handleExport = () => {
    toast.success("Exporting payment queue to CSV...");
  };

  const getStatusBadge = (status: PaymentQueueItem["status"]) => {
    const variants = {
      above_threshold: "bg-green-500/10 text-green-600 border-green-500/20",
      below_threshold: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      on_hold: "bg-red-500/10 text-red-600 border-red-500/20",
    };

    const labels = {
      above_threshold: "Ready",
      below_threshold: "Below Threshold",
      on_hold: "On Hold",
    };

    const icons = {
      above_threshold: <CheckCircle2 className="h-3 w-3 mr-1" />,
      below_threshold: <Clock className="h-3 w-3 mr-1" />,
      on_hold: <Ban className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const getPaymentMethodBadge = (method: PaymentQueueItem["paymentMethod"]) => {
    if (method === "Not Set") {
      return (
        <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
          <AlertCircle className="h-3 w-3 mr-1" />
          Not Set
        </Badge>
      );
    }
    return <Badge variant="outline">{method}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready to Process</p>
                <p className="text-2xl font-semibold mt-1">{aboveThresholdCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Below Threshold</p>
                <p className="text-2xl font-semibold mt-1">{belowThresholdCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Hold</p>
                <p className="text-2xl font-semibold mt-1">{onHoldCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Ban className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-semibold mt-1">
                  ${mockPayments.reduce((sum, p) => sum + p.pendingAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6 px-3.5 sm:px-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by artist name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="above_threshold">Ready to Process</SelectItem>
                <SelectItem value="below_threshold">Below Threshold</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Sort by Amount</SelectItem>
                <SelectItem value="artist">Sort by Artist</SelectItem>
                <SelectItem value="date">Sort by Date</SelectItem>
              </SelectContent>
            </Select>

            {/* Export */}
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selection Bar */}
      {selectedPayments.length > 0 && (
        <Card className="border-[#ff0050]/20 bg-[#ff0050]/5">
          <CardContent className="pt-6 px-3.5 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <CheckSquare className="h-5 w-5 text-[#ff0050] flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm md:text-base">
                    {selectedPayments.length} payment{selectedPayments.length > 1 ? "s" : ""} selected
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Total: ${selectedTotal.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button variant="outline" onClick={() => setSelectedPayments([])} className="w-full sm:w-auto">
                  Clear Selection
                </Button>
                <Button onClick={handleProcessPayments} className="bg-[#ff0050] hover:bg-[#cc0040] w-full sm:w-auto">
                  <Send className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Process Selected Payments</span>
                  <span className="sm:hidden">Process Payments</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Table */}
      <Card>
        <CardHeader className="px-3.5 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div>
              <CardTitle>Payment Queue</CardTitle>
              <CardDescription>
                {filteredPayments.length} artist{filteredPayments.length !== 1 ? "s" : ""} with pending payouts
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={selectAll} className="w-full md:w-auto">
              {selectedPayments.length === filteredPayments.length ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Select All
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 w-12">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="text-left p-3 font-semibold text-sm">Artist</th>
                  <th className="text-left p-3 font-semibold text-sm hidden md:table-cell">Amount</th>
                  <th className="text-left p-3 font-semibold text-sm hidden lg:table-cell">Period</th>
                  <th className="text-left p-3 font-semibold text-sm hidden lg:table-cell">Last Payment</th>
                  <th className="text-right p-3 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className={cn(
                      "border-b transition-all hover:bg-muted/50",
                      selectedPayments.includes(payment.id) && "bg-[#ff0050]/5"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="p-3">
                      <Checkbox
                        checked={selectedPayments.includes(payment.id)}
                        onCheckedChange={() => toggleSelection(payment.id)}
                        disabled={payment.status === "on_hold"}
                      />
                    </td>

                    {/* Artist Info */}
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{payment.artistName}</p>
                        <p className="text-sm text-muted-foreground">{payment.email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {getStatusBadge(payment.status)}
                          {getPaymentMethodBadge(payment.paymentMethod)}
                        </div>
                        {/* Mobile-only: Show amount and period */}
                        <div className="md:hidden mt-2 space-y-1">
                          <p className="text-sm font-semibold text-[#ff0050]">
                            ${payment.pendingAmount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.period} • {payment.releasesCount} release{payment.releasesCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Amount - Hidden on mobile */}
                    <td className="p-3 hidden md:table-cell">
                      <p className="font-semibold text-[#ff0050]">
                        ${payment.pendingAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.releasesCount} release{payment.releasesCount !== 1 ? "s" : ""}
                      </p>
                    </td>

                    {/* Period - Hidden on mobile/tablet */}
                    <td className="p-3 hidden lg:table-cell">
                      <p className="font-medium">{payment.period}</p>
                    </td>

                    {/* Last Payment - Hidden on mobile/tablet */}
                    <td className="p-3 hidden lg:table-cell">
                      <p className="text-sm">
                        {new Date(payment.lastPaymentDate).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPaymentId(payment.id);
                          setDetailsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Details</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPayments.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg mt-4">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No payments found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-x-hidden w-[95vw] sm:w-full">
          <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Complete payment information and earnings breakdown
              </DialogDescription>
            </DialogHeader>
            {selectedPaymentDetails && (
              <div className="space-y-6 py-4 overflow-x-hidden">
                {/* Artist Info Card */}
                <div className="p-3 sm:p-4 rounded-lg bg-muted overflow-hidden">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff0050]" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="text-base sm:text-lg font-semibold mb-1 break-words">{selectedPaymentDetails.artistName}</h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground overflow-hidden">
                          <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{selectedPaymentDetails.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(selectedPaymentDetails.status)}
                        {getPaymentMethodBadge(selectedPaymentDetails.paymentMethod)}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm text-muted-foreground">Pending:</p>
                        <p className="text-xl sm:text-2xl font-bold text-[#ff0050] break-all">
                          ${selectedPaymentDetails.pendingAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-sm mb-3">Payment Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <div className="flex items-center justify-between p-2 sm:p-3 rounded bg-muted overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">Period</span>
                      </div>
                      <span className="font-medium text-xs sm:text-sm ml-2 flex-shrink-0">{selectedPaymentDetails.period}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 rounded bg-muted overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">Payment Method</span>
                      </div>
                      <span className="font-medium text-xs sm:text-sm ml-2 flex-shrink-0">{selectedPaymentDetails.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 rounded bg-muted overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">Last Payment</span>
                      </div>
                      <span className="font-medium text-xs sm:text-sm ml-2 flex-shrink-0">
                        {new Date(selectedPaymentDetails.lastPaymentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 rounded bg-muted overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <Music className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">Active Releases</span>
                      </div>
                      <span className="font-medium text-xs sm:text-sm ml-2 flex-shrink-0">{selectedPaymentDetails.releasesCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 rounded bg-muted overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">Threshold</span>
                      </div>
                      <span className="font-medium text-xs sm:text-sm ml-2 flex-shrink-0">${selectedPaymentDetails.threshold.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 rounded bg-muted overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">Status</span>
                      </div>
                      <span className="font-medium text-xs sm:text-sm ml-2 flex-shrink-0 truncate">
                        {selectedPaymentDetails.status === "above_threshold" && "Ready"}
                        {selectedPaymentDetails.status === "below_threshold" && "Below"}
                        {selectedPaymentDetails.status === "on_hold" && "On Hold"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Earnings Breakdown by DSP */}
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-sm mb-3">Earnings Breakdown by DSP</h4>
                  <div className="space-y-2">
                    {[
                      { dsp: "Spotify", amount: selectedPaymentDetails.pendingAmount * 0.42, streams: "127,543" },
                      { dsp: "Apple Music", amount: selectedPaymentDetails.pendingAmount * 0.28, streams: "45,892" },
                      { dsp: "YouTube Music", amount: selectedPaymentDetails.pendingAmount * 0.15, streams: "89,234" },
                      { dsp: "Amazon Music", amount: selectedPaymentDetails.pendingAmount * 0.08, streams: "23,456" },
                      { dsp: "Deezer", amount: selectedPaymentDetails.pendingAmount * 0.04, streams: "12,789" },
                      { dsp: "Tidal", amount: selectedPaymentDetails.pendingAmount * 0.03, streams: "5,432" },
                    ].map((item) => (
                      <div key={item.dsp} className="flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 rounded border hover:bg-muted transition-colors overflow-hidden">
                        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 min-w-0">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <Music className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                          </div>
                          <div className="overflow-hidden min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">{item.dsp}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">{item.streams} streams</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-xs sm:text-sm whitespace-nowrap">${item.amount.toFixed(2)}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {((item.amount / selectedPaymentDetails.pendingAmount) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Release Breakdown */}
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-sm mb-3">Top Earning Releases</h4>
                  <div className="space-y-2">
                    {[
                      { title: "Summer Waves", type: "Single", earnings: selectedPaymentDetails.pendingAmount * 0.45 },
                      { title: "Ocean Dreams", type: "Album", earnings: selectedPaymentDetails.pendingAmount * 0.32 },
                      { title: "Midnight City", type: "EP", earnings: selectedPaymentDetails.pendingAmount * 0.23 },
                    ].slice(0, selectedPaymentDetails.releasesCount).map((release) => (
                      <div key={release.title} className="flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 rounded border overflow-hidden">
                        <div className="overflow-hidden flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">{release.title}</p>
                          <Badge variant="outline" className="text-[10px] sm:text-xs mt-1">{release.type}</Badge>
                        </div>
                        <p className="font-semibold text-xs sm:text-sm text-[#ff0050] flex-shrink-0 whitespace-nowrap">
                          ${release.earnings.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment History */}
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-sm mb-3">Recent Payment History</h4>
                  <div className="space-y-2">
                    {[
                      { date: "2026-01-01", amount: 2145.67, status: "Completed" },
                      { date: "2025-12-01", amount: 1987.45, status: "Completed" },
                      { date: "2025-11-01", amount: 2234.89, status: "Completed" },
                    ].map((payment, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 rounded border overflow-hidden">
                        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-1 min-w-0">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                          </div>
                          <div className="overflow-hidden min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">{new Date(payment.date).toLocaleDateString()}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">{payment.status}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-xs sm:text-sm flex-shrink-0 whitespace-nowrap">${payment.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
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
                toast.success(`Processing payment for ${selectedPaymentDetails?.artistName}`);
                setDetailsDialogOpen(false);
              }}
              className="bg-[#ff0050] hover:bg-[#cc0040] w-full sm:w-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
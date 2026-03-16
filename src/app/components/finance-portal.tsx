import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { RoleBadge } from "@/app/components/ui/role-badge";
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  Clock,
  Settings,
  LogOut,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Download,
  Sun,
  Moon,
  Menu,
  X,
  Wallet,
  CreditCard,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Calendar,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { PaymentQueue } from "@/app/components/finance/payment-queue";
import { StatementImport } from "@/app/components/finance/statement-import";
import { ArtistsManagement } from "@/app/components/finance/artists-management";
import { FinancialReports } from "@/app/components/finance/financial-reports";
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
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "payment-queue", label: "Payment Queue", icon: DollarSign },
  { id: "statements", label: "Statements", icon: FileText },
  { id: "artists", label: "Artists", icon: Wallet },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const VALID_TABS = new Set(menuItems.map((m) => m.id));

interface RecentTransaction {
  id: string;
  type: "payment" | "import" | "reconciliation";
  description: string;
  amount?: number;
  timestamp: string;
  status: "completed" | "pending" | "failed";
}

const mockTransactions: RecentTransaction[] = [
  {
    id: "1",
    type: "payment",
    description: "Payment to The Waves",
    amount: 2341.89,
    timestamp: "2026-01-30T14:30:00",
    status: "completed",
  },
  {
    id: "2",
    type: "import",
    description: "Imported Spotify statement (Jan 2026)",
    timestamp: "2026-01-30T14:15:00",
    status: "completed",
  },
  {
    id: "3",
    type: "payment",
    description: "Payment to Ocean Records",
    amount: 8234.56,
    timestamp: "2026-01-30T13:45:00",
    status: "completed",
  },
  {
    id: "4",
    type: "reconciliation",
    description: "Reconciled Apple Music statement",
    timestamp: "2026-01-30T12:00:00",
    status: "completed",
  },
  {
    id: "5",
    type: "payment",
    description: "Payment to Neon City",
    amount: 1876.45,
    timestamp: "2026-01-30T11:30:00",
    status: "pending",
  },
];

// Revenue chart data - Last 12 months
const revenueData6Months = [
  {
    month: "Aug 2025",
    revenue: 89234,
    payouts: 67890,
    netRevenue: 21344,
    avgPerArtist: 4250,
  },
  {
    month: "Sep 2025",
    revenue: 94567,
    payouts: 71234,
    netRevenue: 23333,
    avgPerArtist: 4456,
  },
  {
    month: "Oct 2025",
    revenue: 102345,
    payouts: 78456,
    netRevenue: 23889,
    avgPerArtist: 4910,
  },
  {
    month: "Nov 2025",
    revenue: 98234,
    payouts: 74567,
    netRevenue: 23667,
    avgPerArtist: 4680,
  },
  {
    month: "Dec 2025",
    revenue: 112890,
    payouts: 85678,
    netRevenue: 27212,
    avgPerArtist: 5387,
  },
  {
    month: "Jan 2026",
    revenue: 117234,
    payouts: 89345,
    netRevenue: 27889,
    avgPerArtist: 5588,
  },
];

const revenueData12Months = [
  {
    month: "Feb 2025",
    revenue: 76543,
    payouts: 58234,
    netRevenue: 18309,
    avgPerArtist: 3654,
  },
  {
    month: "Mar 2025",
    revenue: 81234,
    payouts: 61890,
    netRevenue: 19344,
    avgPerArtist: 3879,
  },
  {
    month: "Apr 2025",
    revenue: 78890,
    payouts: 60123,
    netRevenue: 18767,
    avgPerArtist: 3765,
  },
  {
    month: "May 2025",
    revenue: 84567,
    payouts: 64234,
    netRevenue: 20333,
    avgPerArtist: 4034,
  },
  {
    month: "Jun 2025",
    revenue: 87234,
    payouts: 66345,
    netRevenue: 20889,
    avgPerArtist: 4163,
  },
  {
    month: "Jul 2025",
    revenue: 85678,
    payouts: 65123,
    netRevenue: 20555,
    avgPerArtist: 4088,
  },
  {
    month: "Aug 2025",
    revenue: 89234,
    payouts: 67890,
    netRevenue: 21344,
    avgPerArtist: 4250,
  },
  {
    month: "Sep 2025",
    revenue: 94567,
    payouts: 71234,
    netRevenue: 23333,
    avgPerArtist: 4456,
  },
  {
    month: "Oct 2025",
    revenue: 102345,
    payouts: 78456,
    netRevenue: 23889,
    avgPerArtist: 4910,
  },
  {
    month: "Nov 2025",
    revenue: 98234,
    payouts: 74567,
    netRevenue: 23667,
    avgPerArtist: 4680,
  },
  {
    month: "Dec 2025",
    revenue: 112890,
    payouts: 85678,
    netRevenue: 27212,
    avgPerArtist: 5387,
  },
  {
    month: "Jan 2026",
    revenue: 117234,
    payouts: 89345,
    netRevenue: 27889,
    avgPerArtist: 5588,
  },
];

export function FinancePortal() {
  const { tab: tabParam } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const activeTab = tabParam && VALID_TABS.has(tabParam) ? tabParam : "dashboard";
  const setActiveTab = (id: string) => navigate(`/finance/${id}`);
  const [chartPeriod, setChartPeriod] = useState<"6months" | "12months">("6months");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
  };

  const renderDashboard = () => (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-3xl font-semibold mt-1">$117K</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +18.2% from last month
                </p>
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
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-3xl font-semibold mt-1">$24.5K</p>
                <p className="text-xs text-muted-foreground mt-1">
                  10 artists ready to process
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Send className="h-6 w-6 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processed This Month</p>
                <p className="text-3xl font-semibold mt-1">$92.8K</p>
                <p className="text-xs text-muted-foreground mt-1">
                  47 payments completed
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Payments</p>
                <p className="text-3xl font-semibold mt-1">2</p>
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Requires attention
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue and payout trends</CardDescription>
            </div>
            <Select
              value={chartPeriod}
              onValueChange={(value) => setChartPeriod(value as "6months" | "12months")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2.5 sm:px-6">
          <div className="h-[300px] sm:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartPeriod === "6months" ? revenueData6Months : revenueData12Months}
                margin={{ 
                  top: 10, 
                  right: 5, 
                  bottom: 5, 
                  left: 5 
                }}
                className="sm:!m-[20px]"
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop key="revenue-stop-1" offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop key="revenue-stop-2" offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="payoutsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop key="payouts-stop-1" offset="5%" stopColor="#ff0050" stopOpacity={0.3} />
                    <stop key="payouts-stop-2" offset="95%" stopColor="#ff0050" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374151" : "#e5e7eb"} opacity={0.3} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: theme === "dark" ? "#ffffff" : "#1f2937", fontSize: 10 }}
                  tickLine={{ stroke: theme === "dark" ? "#374151" : "#d1d5db" }}
                  axisLine={{ stroke: theme === "dark" ? "#374151" : "#d1d5db" }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  className="sm:!text-xs"
                />
                <YAxis
                  tick={{ fill: theme === "dark" ? "#ffffff" : "#1f2937", fontSize: 10 }}
                  tickLine={{ stroke: theme === "dark" ? "#374151" : "#d1d5db" }}
                  axisLine={{ stroke: theme === "dark" ? "#374151" : "#d1d5db" }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  width={45}
                  className="sm:!text-xs"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                    border: `1px solid ${theme === "dark" ? "#374151" : "#e5e7eb"}`,
                    borderRadius: "8px",
                    color: theme === "dark" ? "#ffffff" : "#1f2937",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  labelStyle={{ color: theme === "dark" ? "#ffffff" : "#1f2937", fontWeight: 600, fontSize: "11px" }}
                />
                <Legend
                  wrapperStyle={{ 
                    paddingTop: "10px", 
                    color: theme === "dark" ? "#ffffff" : "#1f2937",
                    fontSize: "10px"
                  }}
                  iconType="circle"
                  iconSize={8}
                  className="!text-[10px] sm:!text-xs"
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      revenue: "Revenue",
                      payouts: "Payouts",
                      netRevenue: "Net",
                      avgPerArtist: "Avg/Artist",
                    };
                    return labels[value] || value;
                  }}
                />
                <Area
                  key="area-revenue"
                  type="monotone"
                  dataKey="revenue"
                  fill="url(#revenueGradient)"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="revenue"
                />
                <Area
                  key="area-payouts"
                  type="monotone"
                  dataKey="payouts"
                  fill="url(#payoutsGradient)"
                  stroke="#ff0050"
                  strokeWidth={2}
                  name="payouts"
                />
                <Bar key="bar-netRevenue" dataKey="netRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="netRevenue" />
                <Line
                  key="line-avgPerArtist"
                  type="monotone"
                  dataKey="avgPerArtist"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ fill: "#a855f7", r: 3 }}
                  name="avgPerArtist"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 border-t px-[4px] pt-[16px] pb-[0px]">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-lg font-semibold text-green-600">
                ${(chartPeriod === "6months" ? revenueData6Months : revenueData12Months)
                  .reduce((sum, item) => sum + item.revenue, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Payouts</p>
              <p className="text-lg font-semibold text-[#ff0050]">
                ${(chartPeriod === "6months" ? revenueData6Months : revenueData12Months)
                  .reduce((sum, item) => sum + item.payouts, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Net Profit</p>
              <p className="text-lg font-semibold text-blue-600">
                ${(chartPeriod === "6months" ? revenueData6Months : revenueData12Months)
                  .reduce((sum, item) => sum + item.netRevenue, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg per Artist</p>
              <p className="text-lg font-semibold text-purple-600">
                ${Math.round(
                  (chartPeriod === "6months" ? revenueData6Months : revenueData12Months)
                    .reduce((sum, item) => sum + item.avgPerArtist, 0) /
                    (chartPeriod === "6months" ? revenueData6Months.length : revenueData12Months.length)
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common finance tasks</CardDescription>
          </CardHeader>
          <CardContent className="px-3.5 sm:px-6">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setActiveTab("payment-queue")}
              >
                <Send className="h-5 w-5 text-[#ff0050]" />
                <span className="text-sm font-medium">Process Payments</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setActiveTab("statements")}
              >
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Import Statement</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setActiveTab("reports")}
              >
                <BarChart3 className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Generate Report</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setActiveTab("artists")}
              >
                <Wallet className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">View Artists</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest finance operations</CardDescription>
          </CardHeader>
          <CardContent className="px-3.5 sm:px-6 space-y-3">
            {mockTransactions.map((transaction) => {
              const icons = {
                payment: <DollarSign className="h-4 w-4" />,
                import: <FileText className="h-4 w-4" />,
                reconciliation: <CheckCircle2 className="h-4 w-4" />,
              };

              const colors = {
                payment: "text-[#ff0050] bg-[#ff0050]/10",
                import: "text-blue-500 bg-blue-500/10",
                reconciliation: "text-green-500 bg-green-500/10",
              };

              return (
                <div key={transaction.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                      colors[transaction.type]
                    )}
                  >
                    {icons[transaction.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{transaction.description}</p>
                      {transaction.amount && (
                        <p className="text-sm font-semibold text-green-600">
                          ${transaction.amount.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payment Schedule</CardTitle>
          <CardDescription>Scheduled payment runs</CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="space-y-3">
            {[
              {
                date: "2026-02-01",
                description: "Monthly Artist Payouts",
                amount: 24500.0,
                artistCount: 10,
                status: "scheduled",
              },
              {
                date: "2026-02-05",
                description: "Label Settlements",
                amount: 18750.0,
                artistCount: 3,
                status: "scheduled",
              },
              {
                date: "2026-02-15",
                description: "Mid-Month Payments",
                amount: 12300.0,
                artistCount: 5,
                status: "scheduled",
              },
            ].map((schedule, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">{schedule.description}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(schedule.date).toLocaleDateString()} •{" "}
                      {schedule.artistCount} recipient{schedule.artistCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:block sm:text-right pl-13 sm:pl-0">
                  <p className="font-semibold text-sm sm:text-base text-[#ff0050]">
                    ${schedule.amount.toLocaleString()}
                  </p>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 sm:mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Scheduled
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderArtists = () => (
    <div className="p-3.5 sm:p-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Artist Management</p>
            <p className="text-sm text-muted-foreground mt-1">
              Artist payout details and payment history
            </p>
            <Button className="mt-4" variant="outline">
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="p-3.5 sm:p-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Financial Reports</p>
            <p className="text-sm text-muted-foreground mt-1">
              Revenue reports, tax documents, and analytics
            </p>
            <Button className="mt-4" variant="outline">
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="p-3.5 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Finance Settings</CardTitle>
          <CardDescription>Configure payment and accounting preferences</CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="space-y-6">
            {/* Payment Settings */}
            <div>
              <h3 className="font-semibold mb-3">Payment Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Default Minimum Threshold</p>
                    <p className="text-sm text-muted-foreground">
                      Minimum amount before processing payments
                    </p>
                  </div>
                  <Badge variant="outline">$25.00</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Payment Schedule</p>
                    <p className="text-sm text-muted-foreground">
                      When to process monthly payments
                    </p>
                  </div>
                  <Badge variant="outline">1st of each month</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Currency</p>
                    <p className="text-sm text-muted-foreground">Default currency for payments</p>
                  </div>
                  <Badge variant="outline">USD</Badge>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h3 className="font-semibold mb-3">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Payment Confirmations</p>
                    <p className="text-sm text-muted-foreground">
                      Send email when payments are processed
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Failed Payment Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Alert when payments fail
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Monthly Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Receive monthly finance summary
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 cursor-pointer" />
                </div>
              </div>
            </div>

            <Button 
              className="cursor-pointer"
              onClick={() => toast.success("Settings saved successfully!")}
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
      case "payment-queue":
        return (
          <div className="p-3.5 sm:p-6">
            <PaymentQueue />
          </div>
        );
      case "statements":
        return (
          <div className="p-3.5 sm:p-6">
            <StatementImport />
          </div>
        );
      case "artists":
        return (
          <div className="p-3.5 sm:p-6">
            <ArtistsManagement />
          </div>
        );
      case "reports":
        return (
          <div className="p-3.5 sm:p-6">
            <FinancialReports />
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
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 border-r bg-card flex flex-col transition-all duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "w-64",
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {/* Logo + collapse toggle */}
        <div className="p-3.5 sm:p-4 border-b flex items-center justify-between gap-2">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <img src={logo} alt="Cage Riot" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">Cage Riot</p>
                <p className="text-xs text-muted-foreground truncate">{user?.organizationName ?? "Finance Portal"}</p>
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
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
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
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
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
        <div className="p-3 sm:p-4 border-t space-y-2">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="px-3.5 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold truncate">
                {menuItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                Welcome back, {user?.name || "Finance Team"}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <RoleBadge 
                role={user?.role || "finance"} 
                accountType={user?.accountType}
                displayLabel={user?.roleName}
                size="sm"
                className="hidden sm:flex"
              />
              <RoleBadge 
                role={user?.role || "finance"}
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
        <div className="flex-1 overflow-auto w-full">{renderContent()}</div>
      </div>
    </div>
  );
}
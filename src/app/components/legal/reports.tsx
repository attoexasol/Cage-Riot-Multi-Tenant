import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  BarChart3,
  Download,
  Eye,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Scale,
  FileSearch,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";

interface Report {
  id: string;
  title: string;
  type: "compliance" | "dmca" | "clearance" | "dispute" | "financial" | "analytics";
  period: string;
  generatedDate: string;
  generatedBy: string;
  status: "ready" | "generating" | "scheduled";
  fileSize?: string;
  summary: {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
  }[];
  description: string;
}

const mockReports: Report[] = [
  {
    id: "1",
    title: "Monthly DMCA Compliance Report",
    type: "dmca",
    period: "January 2026",
    generatedDate: "2026-01-31",
    generatedBy: "System Auto-Generate",
    status: "ready",
    fileSize: "3.2 MB",
    summary: [
      { label: "Total DMCA Notices", value: 47, trend: "down", trendValue: "12%" },
      { label: "Resolved Cases", value: 43, trend: "up", trendValue: "8%" },
      { label: "Pending Cases", value: 4, trend: "neutral" },
      { label: "Average Resolution Time", value: "3.2 days", trend: "down", trendValue: "15%" },
    ],
    description: "Comprehensive monthly report covering all DMCA takedown notices, counter-notices, and resolution metrics",
  },
  {
    id: "2",
    title: "Quarterly Clearance Analytics",
    type: "clearance",
    period: "Q1 2026",
    generatedDate: "2026-01-28",
    generatedBy: "Sarah Johnson",
    status: "ready",
    fileSize: "5.8 MB",
    summary: [
      { label: "Clearance Requests", value: 234, trend: "up", trendValue: "23%" },
      { label: "Approval Rate", value: "94.2%", trend: "up", trendValue: "2.1%" },
      { label: "Avg. Processing Time", value: "2.8 days", trend: "down", trendValue: "18%" },
      { label: "Rejected Requests", value: 14, trend: "down", trendValue: "5%" },
    ],
    description: "Quarterly analysis of clearance queue performance, approval rates, and processing efficiency",
  },
  {
    id: "3",
    title: "Dispute Resolution Summary",
    type: "dispute",
    period: "January 2026",
    generatedDate: "2026-01-30",
    generatedBy: "Michael Chen",
    status: "ready",
    fileSize: "2.4 MB",
    summary: [
      { label: "Active Disputes", value: 12, trend: "up", trendValue: "20%" },
      { label: "Resolved This Month", value: 8, trend: "up", trendValue: "14%" },
      { label: "Average Resolution Time", value: "18.5 days", trend: "neutral" },
      { label: "Escalated Cases", value: 2, trend: "down", trendValue: "50%" },
    ],
    description: "Monthly summary of copyright disputes, resolution outcomes, and case management efficiency",
  },
  {
    id: "4",
    title: "Legal Compliance Dashboard",
    type: "compliance",
    period: "January 2026",
    generatedDate: "2026-01-31",
    generatedBy: "System Auto-Generate",
    status: "ready",
    fileSize: "4.1 MB",
    summary: [
      { label: "Compliance Score", value: "98.7%", trend: "up", trendValue: "1.2%" },
      { label: "Active Documents", value: 156, trend: "up", trendValue: "8%" },
      { label: "Expiring Soon", value: 7, trend: "neutral" },
      { label: "Total Issues", value: 3, trend: "down", trendValue: "40%" },
    ],
    description: "Comprehensive compliance status including document tracking, legal obligations, and risk assessment",
  },
  {
    id: "5",
    title: "Rights Management Analytics",
    type: "analytics",
    period: "Q4 2025",
    generatedDate: "2026-01-15",
    generatedBy: "Emily Rodriguez",
    status: "ready",
    fileSize: "6.3 MB",
    summary: [
      { label: "Total Rights Tracked", value: 1847, trend: "up", trendValue: "15%" },
      { label: "Sync Licenses", value: 89, trend: "up", trendValue: "22%" },
      { label: "Master Recordings", value: 423, trend: "up", trendValue: "9%" },
      { label: "Publishing Deals", value: 156, trend: "up", trendValue: "12%" },
    ],
    description: "Detailed analytics on rights ownership, licensing activity, and revenue attribution across all platforms",
  },
  {
    id: "6",
    title: "Takedown Performance Report",
    type: "dmca",
    period: "December 2025",
    generatedDate: "2026-01-05",
    generatedBy: "Sarah Johnson",
    status: "ready",
    fileSize: "2.9 MB",
    summary: [
      { label: "Takedown Requests", value: 52, trend: "down", trendValue: "8%" },
      { label: "Completed", value: 48, trend: "neutral" },
      { label: "Success Rate", value: "92.3%", trend: "up", trendValue: "3.1%" },
      { label: "Avg. Completion Time", value: "4.1 days", trend: "down", trendValue: "12%" },
    ],
    description: "Platform-by-platform breakdown of takedown request processing and completion metrics",
  },
  {
    id: "7",
    title: "Financial Legal Summary",
    type: "financial",
    period: "January 2026",
    generatedDate: "2026-01-30",
    generatedBy: "Michael Chen",
    status: "ready",
    fileSize: "3.7 MB",
    summary: [
      { label: "Legal Fees", value: "$47,850", trend: "down", trendValue: "5%" },
      { label: "Settlement Costs", value: "$12,000", trend: "down", trendValue: "25%" },
      { label: "Licensing Revenue", value: "$284,500", trend: "up", trendValue: "18%" },
      { label: "Net Legal Impact", value: "$224,650", trend: "up", trendValue: "22%" },
    ],
    description: "Monthly financial overview of legal costs, settlement expenses, and licensing revenue impact",
  },
  {
    id: "8",
    title: "Annual Compliance Audit 2025",
    type: "compliance",
    period: "Full Year 2025",
    generatedDate: "2026-01-10",
    generatedBy: "Emily Rodriguez",
    status: "ready",
    fileSize: "12.4 MB",
    summary: [
      { label: "Total Cases Handled", value: 1284, trend: "up", trendValue: "11%" },
      { label: "Overall Compliance", value: "97.8%", trend: "up", trendValue: "2.3%" },
      { label: "Documents Processed", value: 2156, trend: "up", trendValue: "19%" },
      { label: "Critical Issues", value: 8, trend: "down", trendValue: "33%" },
    ],
    description: "Comprehensive annual audit covering all legal operations, compliance metrics, and year-over-year analysis",
  },
  {
    id: "9",
    title: "Weekly Clearance Snapshot",
    type: "clearance",
    period: "Week of Jan 27, 2026",
    generatedDate: "2026-01-31",
    generatedBy: "System Auto-Generate",
    status: "generating",
    summary: [
      { label: "New Requests", value: 18, trend: "neutral" },
      { label: "Approved", value: 15, trend: "neutral" },
      { label: "Pending Review", value: 3, trend: "neutral" },
    ],
    description: "Weekly snapshot of clearance queue activity and processing status",
  },
  {
    id: "10",
    title: "Copyright Analytics Report",
    type: "analytics",
    period: "February 2026",
    generatedDate: "2026-02-01",
    generatedBy: "System Auto-Generate",
    status: "scheduled",
    summary: [
      { label: "Scheduled For", value: "Feb 1, 2026" },
    ],
    description: "Automated monthly analytics report covering copyright registrations, infringement cases, and protection metrics",
  },
];

export function ReportsView() {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "type" | "period">("date");
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const filteredReports = mockReports
    .filter((report) => {
      const matchesType = filterType === "all" || report.type === filterType;
      const matchesStatus = filterStatus === "all" || report.status === filterStatus;
      return matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime();
      }
      if (sortBy === "type") {
        return a.type.localeCompare(b.type);
      }
      if (sortBy === "period") {
        return a.period.localeCompare(b.period);
      }
      return 0;
    });

  const readyCount = mockReports.filter((r) => r.status === "ready").length;
  const generatingCount = mockReports.filter((r) => r.status === "generating").length;
  const scheduledCount = mockReports.filter((r) => r.status === "scheduled").length;

  const handleView = (report: Report) => {
    setCurrentReport(report);
    setShowViewDialog(true);
  };

  const handleDownload = (report: Report) => {
    if (report.status === "ready") {
      toast.success(`Downloading ${report.title}`);
      setTimeout(() => {
        toast.success(`Downloaded: ${report.title}.pdf`);
      }, 1000);
    } else {
      toast.error("Report is not ready for download");
    }
  };

  const handleGenerate = () => {
    toast.success("Report generation started");
    setShowGenerateDialog(false);
  };

  const getTypeBadge = (type: Report["type"]) => {
    const variants = {
      compliance: "bg-green-500/10 text-green-600 border-green-500/20",
      dmca: "bg-red-500/10 text-red-600 border-red-500/20",
      clearance: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      dispute: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      financial: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      analytics: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    };

    const labels = {
      compliance: "Compliance",
      dmca: "DMCA",
      clearance: "Clearance",
      dispute: "Dispute",
      financial: "Financial",
      analytics: "Analytics",
    };

    return (
      <Badge variant="secondary" className={variants[type]}>
        {labels[type]}
      </Badge>
    );
  };

  const getStatusBadge = (status: Report["status"]) => {
    const variants = {
      ready: "bg-green-500/10 text-green-600 border-green-500/20",
      generating: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      scheduled: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };

    const labels = {
      ready: "Ready",
      generating: "Generating",
      scheduled: "Scheduled",
    };

    const icons = {
      ready: <CheckCircle2 className="h-3 w-3 mr-1" />,
      generating: <RefreshCw className="h-3 w-3 mr-1 animate-spin" />,
      scheduled: <Clock className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
    if (!trend || trend === "neutral") return null;
    if (trend === "up") {
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    }
    return <TrendingDown className="h-3 w-3 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">Legal Reports</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Compliance reports, analytics, and legal metrics
          </p>
        </div>
        <Button
          onClick={() => setShowGenerateDialog(true)}
          className="bg-[#ff0050] hover:bg-[#cc0040] w-full sm:w-auto flex-shrink-0 h-9 md:h-10"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-semibold mt-1">{mockReports.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <p className="text-2xl font-semibold mt-1">{readyCount}</p>
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
                <p className="text-sm text-muted-foreground">Generating</p>
                <p className="text-2xl font-semibold mt-1">{generatingCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-semibold mt-1">{scheduledCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Generate common reports instantly</CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 px-[14px] pt-[0px] pb-[24px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-3 md:p-4 text-center min-w-0"
              onClick={() => toast.success("Generating DMCA summary...")}
            >
              <Shield className="h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium break-words w-full">DMCA Summary</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-3 md:p-4 text-center min-w-0"
              onClick={() => toast.success("Generating clearance report...")}
            >
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium break-words w-full">Clearance Report</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-3 md:p-4 text-center min-w-0"
              onClick={() => toast.success("Generating dispute analytics...")}
            >
              <Scale className="h-4 w-4 md:h-5 md:w-5 text-purple-500 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium break-words w-full">Dispute Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-3 md:p-4 text-center min-w-0"
              onClick={() => toast.success("Generating compliance check...")}
            >
              <FileSearch className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium break-words w-full">Compliance Check</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="dmca">DMCA</SelectItem>
                <SelectItem value="clearance">Clearance</SelectItem>
                <SelectItem value="dispute">Dispute</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="type">Sort by Type</SelectItem>
                <SelectItem value="period">Sort by Period</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="md:ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>
            {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} available
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 md:px-6 py-6">
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-3 md:p-4 rounded-lg border hover:border-[#ff0050]/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
                  <div className="h-12 w-12 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-[#ff0050]" />
                  </div>

                  <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-2">
                      <div className="min-w-0 text-center md:text-left">
                        <h3 className="text-sm md:text-base font-semibold mb-2 break-words">{report.title}</h3>
                        <div className="flex items-center justify-center md:justify-start gap-1.5 md:gap-2 flex-wrap">
                          {getTypeBadge(report.type)}
                          {getStatusBadge(report.status)}
                          <Badge variant="outline" className="text-xs">
                            {report.period}
                          </Badge>
                          {report.fileSize && (
                            <Badge variant="outline" className="text-xs">
                              {report.fileSize}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(report)}
                          className="h-9 px-3 w-full sm:w-auto"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report)}
                          disabled={report.status !== "ready"}
                          className="h-9 px-3 w-full sm:w-auto"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-muted-foreground mb-3 break-words text-center md:text-left">{report.description}</p>

                    {/* Summary Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-3">
                      {report.summary.map((item, index) => (
                        <div
                          key={index}
                          className="p-2 md:p-3 rounded-lg bg-muted text-center md:text-left"
                        >
                          <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <p className="text-sm md:text-base font-semibold">{item.value}</p>
                            {item.trend && item.trendValue && (
                              <div className="flex items-center gap-1">
                                {getTrendIcon(item.trend)}
                                <span
                                  className={cn(
                                    "text-xs",
                                    item.trend === "up" && "text-green-600",
                                    item.trend === "down" && "text-red-600"
                                  )}
                                >
                                  {item.trendValue}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(report.generatedDate).toLocaleDateString()}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span>Generated by {report.generatedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No reports found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or generate a new report
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
            <DialogDescription>
              Create a custom legal report with specific parameters
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Report Type *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                  <SelectItem value="dmca">DMCA Summary</SelectItem>
                  <SelectItem value="clearance">Clearance Analytics</SelectItem>
                  <SelectItem value="dispute">Dispute Resolution</SelectItem>
                  <SelectItem value="financial">Financial Summary</SelectItem>
                  <SelectItem value="analytics">Rights Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Report Title *</Label>
              <Input placeholder="Enter report title..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Include Metrics</Label>
              <div className="grid grid-cols-2 gap-3 border rounded-lg p-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked />
                  Summary Statistics
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked />
                  Trend Analysis
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked />
                  Detailed Breakdown
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  Comparative Data
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  Charts & Graphs
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  Recommendations
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              className="bg-[#ff0050] hover:bg-[#cc0040]"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Complete overview and metrics for this report
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {currentReport && (
              <>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted">
                  <div className="h-16 w-16 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-[#ff0050]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{currentReport.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(currentReport.type)}
                      {getStatusBadge(currentReport.status)}
                      <Badge variant="outline">{currentReport.period}</Badge>
                      {currentReport.fileSize && (
                        <Badge variant="outline">{currentReport.fileSize}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{currentReport.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-3">Key Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentReport.summary.map((item, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-card overflow-hidden">
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.label}</p>
                        <div className="flex items-center gap-2 flex-wrap overflow-hidden">
                          <p className="text-2xl font-semibold break-words">{item.value}</p>
                          {item.trend && item.trendValue && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {getTrendIcon(item.trend)}
                              <span
                                className={cn(
                                  "text-sm font-medium whitespace-nowrap",
                                  item.trend === "up" && "text-green-600",
                                  item.trend === "down" && "text-red-600"
                                )}
                              >
                                {item.trendValue}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Generated Date</p>
                      <p className="font-medium">
                        {new Date(currentReport.generatedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Generated By</p>
                      <p className="font-medium">{currentReport.generatedBy}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    onClick={() => currentReport && handleDownload(currentReport)}
                    disabled={currentReport.status !== "ready"}
                    className="bg-[#ff0050] hover:bg-[#cc0040]"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Report
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
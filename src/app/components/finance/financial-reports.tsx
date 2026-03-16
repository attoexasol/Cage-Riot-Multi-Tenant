import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Label } from "@/app/components/ui/label";
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
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart,
  LineChart,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";

interface Report {
  id: string;
  title: string;
  type: "revenue" | "royalty" | "tax" | "analytics" | "reconciliation";
  period: string;
  generatedDate: string;
  fileSize: string;
  format: "PDF" | "Excel" | "CSV";
  status: "ready" | "generating" | "scheduled";
  description: string;
}

const mockReports: Report[] = [
  {
    id: "1",
    title: "Monthly Revenue Report - January 2026",
    type: "revenue",
    period: "Jan 2026",
    generatedDate: "2026-02-01",
    fileSize: "2.4 MB",
    format: "PDF",
    status: "ready",
    description: "Comprehensive revenue breakdown by DSP, artist, and territory",
  },
  {
    id: "2",
    title: "Artist Royalty Statement - Q4 2025",
    type: "royalty",
    period: "Q4 2025",
    generatedDate: "2026-01-15",
    fileSize: "5.8 MB",
    format: "Excel",
    status: "ready",
    description: "Detailed royalty calculations and payment distributions",
  },
  {
    id: "3",
    title: "Tax Summary Report - 2025",
    type: "tax",
    period: "Year 2025",
    generatedDate: "2026-01-31",
    fileSize: "1.2 MB",
    format: "PDF",
    status: "ready",
    description: "Annual tax summary with 1099 forms and documentation",
  },
  {
    id: "4",
    title: "Platform Analytics - January 2026",
    type: "analytics",
    period: "Jan 2026",
    generatedDate: "2026-02-01",
    fileSize: "3.6 MB",
    format: "Excel",
    status: "ready",
    description: "Streaming analytics, trends, and performance metrics",
  },
  {
    id: "5",
    title: "DSP Reconciliation Report - December 2025",
    type: "reconciliation",
    period: "Dec 2025",
    generatedDate: "2026-01-28",
    fileSize: "4.2 MB",
    format: "Excel",
    status: "ready",
    description: "Statement reconciliation and variance analysis",
  },
  {
    id: "6",
    title: "Monthly Revenue Report - December 2025",
    type: "revenue",
    period: "Dec 2025",
    generatedDate: "2026-01-01",
    fileSize: "2.3 MB",
    format: "PDF",
    status: "ready",
    description: "Comprehensive revenue breakdown by DSP, artist, and territory",
  },
  {
    id: "7",
    title: "Artist Royalty Statement - Q3 2025",
    type: "royalty",
    period: "Q3 2025",
    generatedDate: "2025-10-15",
    fileSize: "5.4 MB",
    format: "Excel",
    status: "ready",
    description: "Detailed royalty calculations and payment distributions",
  },
  {
    id: "8",
    title: "Monthly Revenue Report - February 2026",
    type: "revenue",
    period: "Feb 2026",
    generatedDate: "Scheduled",
    fileSize: "-",
    format: "PDF",
    status: "scheduled",
    description: "Will be generated on March 1, 2026",
  },
  {
    id: "9",
    title: "Platform Analytics - December 2025",
    type: "analytics",
    period: "Dec 2025",
    generatedDate: "2026-01-01",
    fileSize: "3.4 MB",
    format: "Excel",
    status: "ready",
    description: "Streaming analytics, trends, and performance metrics",
  },
  {
    id: "10",
    title: "DSP Reconciliation Report - November 2025",
    type: "reconciliation",
    period: "Nov 2025",
    generatedDate: "2025-12-28",
    fileSize: "4.0 MB",
    format: "Excel",
    status: "ready",
    description: "Statement reconciliation and variance analysis",
  },
];

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const quickStats: QuickStat[] = [
  {
    label: "Total Revenue (YTD)",
    value: "$3.2M",
    change: "+18.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-500",
  },
  {
    label: "Reports Generated",
    value: "142",
    change: "+12",
    trend: "up",
    icon: FileText,
    color: "text-blue-500",
  },
  {
    label: "Avg. Processing Time",
    value: "2.4 hrs",
    change: "-0.3 hrs",
    trend: "down",
    icon: Clock,
    color: "text-purple-500",
  },
  {
    label: "Reconciled Statements",
    value: "98.5%",
    change: "+2.1%",
    trend: "up",
    icon: CheckCircle2,
    color: "text-[#ff0050]",
  },
];

export function FinancialReports() {
  const [filterType, setFilterType] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // New Report Dialog State
  const [newReportDialogOpen, setNewReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<Report["type"]>("revenue");
  const [reportPeriod, setReportPeriod] = useState("current-month");
  const [reportFormat, setReportFormat] = useState<Report["format"]>("PDF");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [emailOnComplete, setEmailOnComplete] = useState(true);

  const filteredReports = mockReports.filter((report) => {
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesPeriod = filterPeriod === "all" || report.period.includes(filterPeriod);
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesType && matchesPeriod && matchesStatus;
  });

  const getTypeIcon = (type: Report["type"]) => {
    const icons = {
      revenue: <DollarSign className="h-4 w-4" />,
      royalty: <FileText className="h-4 w-4" />,
      tax: <FileCheck className="h-4 w-4" />,
      analytics: <LineChart className="h-4 w-4" />,
      reconciliation: <FileSpreadsheet className="h-4 w-4" />,
    };
    return icons[type];
  };

  const getTypeBadge = (type: Report["type"]) => {
    const variants = {
      revenue: "bg-green-500/10 text-green-600 border-green-500/20",
      royalty: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      tax: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      analytics: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      reconciliation: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    };

    const labels = {
      revenue: "Revenue",
      royalty: "Royalty",
      tax: "Tax",
      analytics: "Analytics",
      reconciliation: "Reconciliation",
    };

    return (
      <Badge variant="secondary" className={variants[type]}>
        {getTypeIcon(type)}
        <span className="ml-1">{labels[type]}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: Report["status"]) => {
    const variants = {
      ready: "bg-green-500/10 text-green-600 border-green-500/20",
      generating: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      scheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    };

    const icons = {
      ready: <CheckCircle2 className="h-3 w-3 mr-1" />,
      generating: <Clock className="h-3 w-3 mr-1 animate-spin" />,
      scheduled: <Calendar className="h-3 w-3 mr-1" />,
    };

    const labels = {
      ready: "Ready",
      generating: "Generating",
      scheduled: "Scheduled",
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const getFormatIcon = (format: Report["format"]) => {
    const colors = {
      PDF: "text-red-500",
      Excel: "text-green-500",
      CSV: "text-blue-500",
    };

    return (
      <Badge variant="outline" className="text-xs">
        <FileText className={cn("h-3 w-3 mr-1", colors[format])} />
        {format}
      </Badge>
    );
  };

  const handleDownload = (report: Report) => {
    if (report.status === "ready") {
      toast.success(`Downloading ${report.title}`);
    } else if (report.status === "scheduled") {
      toast.info("This report is scheduled for future generation");
    } else {
      toast.info("Report is still generating, please wait...");
    }
  };

  const handleOpenNewReportDialog = () => {
    setNewReportDialogOpen(true);
  };

  const handleGenerateNewReport = () => {
    const reportTypeLabels = {
      revenue: "Revenue Report",
      royalty: "Royalty Statement",
      tax: "Tax Document",
      analytics: "Analytics Report",
      reconciliation: "Reconciliation Report",
    };

    const periodLabels: Record<string, string> = {
      "current-month": "January 2026",
      "last-month": "December 2025",
      "current-quarter": "Q1 2026",
      "last-quarter": "Q4 2025",
      "current-year": "2026",
      "last-year": "2025",
    };

    toast.success(
      `${reportTypeLabels[reportType]} (${periodLabels[reportPeriod]}) generation started! Format: ${reportFormat}. You'll be notified when it's ready.`
    );
    
    setNewReportDialogOpen(false);
    
    // Reset form
    setReportType("revenue");
    setReportPeriod("current-month");
    setReportFormat("PDF");
    setIncludeCharts(true);
    setIncludeRawData(false);
    setIncludeSummary(true);
    setEmailOnComplete(true);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />
                      )}
                      <span className="text-xs text-green-500">{stat.change}</span>
                    </div>
                  </div>
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", 
                    stat.color.replace("text-", "bg-") + "/10"
                  )}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generate New Report */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#ff0050]" />
                Generate New Report
              </CardTitle>
              <CardDescription>Create custom financial reports and exports</CardDescription>
            </div>
            <Button onClick={handleOpenNewReportDialog} className="bg-[#ff0050] hover:bg-[#cc0040] w-full sm:w-auto">
              <FileText className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 px-3.5 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="royalty">Royalty</SelectItem>
                <SelectItem value="tax">Tax</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="reconciliation">Reconciliation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-[#ff0050]" />
                </div>

                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <div className="flex flex-col gap-3 mb-2">
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h4 className="font-medium text-sm break-words">{report.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 flex-shrink-0">
                      {getStatusBadge(report.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(report)}
                        disabled={report.status !== "ready"}
                        className="w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground">
                    {getTypeBadge(report.type)}
                    {getFormatIcon(report.format)}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{report.period}</span>
                    </div>
                    {report.status === "ready" && (
                      <>
                        <span>•</span>
                        <span>Generated {new Date(report.generatedDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{report.fileSize}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No reports found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#ff0050]" />
            Scheduled Reports
          </CardTitle>
          <CardDescription>Automatic report generation schedule</CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="space-y-3">
            {[
              { type: "Monthly Revenue Report", schedule: "1st of every month", next: "March 1, 2026" },
              { type: "Quarterly Royalty Statement", schedule: "15th of quarter end", next: "April 15, 2026" },
              { type: "Weekly Analytics Report", schedule: "Every Monday", next: "February 10, 2026" },
            ].map((schedule, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{schedule.type}</p>
                    <p className="text-xs text-muted-foreground">{schedule.schedule}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Next generation</p>
                  <p className="text-sm font-medium">{schedule.next}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Report Dialog */}
      <Dialog open={newReportDialogOpen} onOpenChange={setNewReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
            <DialogDescription>Create a custom financial report</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select
                id="reportType"
                value={reportType}
                onValueChange={(value) => setReportType(value as Report["type"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                  <SelectItem value="royalty">Royalty Statement</SelectItem>
                  <SelectItem value="tax">Tax Document</SelectItem>
                  <SelectItem value="analytics">Analytics Report</SelectItem>
                  <SelectItem value="reconciliation">Reconciliation Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportPeriod">Report Period</Label>
              <Select
                id="reportPeriod"
                value={reportPeriod}
                onValueChange={(value) => setReportPeriod(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a report period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">January 2026</SelectItem>
                  <SelectItem value="last-month">December 2025</SelectItem>
                  <SelectItem value="current-quarter">Q1 2026</SelectItem>
                  <SelectItem value="last-quarter">Q4 2025</SelectItem>
                  <SelectItem value="current-year">2026</SelectItem>
                  <SelectItem value="last-year">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportFormat">Report Format</Label>
              <Select
                id="reportFormat"
                value={reportFormat}
                onValueChange={(value) => setReportFormat(value as Report["format"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a report format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(checked === true)}
                  />
                  <Label htmlFor="includeCharts" className="text-sm font-normal cursor-pointer">
                    Include Charts & Visualizations
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeRawData"
                    checked={includeRawData}
                    onCheckedChange={(checked) => setIncludeRawData(checked === true)}
                  />
                  <Label htmlFor="includeRawData" className="text-sm font-normal cursor-pointer">
                    Include Raw Data Tables
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSummary"
                    checked={includeSummary}
                    onCheckedChange={(checked) => setIncludeSummary(checked === true)}
                  />
                  <Label htmlFor="includeSummary" className="text-sm font-normal cursor-pointer">
                    Include Executive Summary
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailOnComplete"
                    checked={emailOnComplete}
                    onCheckedChange={(checked) => setEmailOnComplete(checked === true)}
                  />
                  <Label htmlFor="emailOnComplete" className="text-sm font-normal cursor-pointer">
                    Email Me When Complete
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-[#ff0050] hover:bg-[#cc0040]"
              onClick={handleGenerateNewReport}
            >
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
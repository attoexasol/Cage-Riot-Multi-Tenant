import React from "react";
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
  FileText,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  BarChart3,
  DollarSign,
  Music,
  Radio,
  Users,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  format: string[];
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "1",
    title: "Catalog Report",
    description: "Complete catalog with all releases and metadata",
    icon: Music,
    category: "catalog",
    format: ["CSV", "Excel", "PDF"],
  },
  {
    id: "2",
    title: "Royalty Statement",
    description: "Detailed royalty breakdown by platform and territory",
    icon: DollarSign,
    category: "royalties",
    format: ["PDF", "Excel"],
  },
  {
    id: "3",
    title: "Analytics Summary",
    description: "Streams, listeners, and performance metrics",
    icon: BarChart3,
    category: "analytics",
    format: ["CSV", "Excel", "PDF"],
  },
  {
    id: "4",
    title: "Distribution Status",
    description: "Delivery status across all DSPs",
    icon: Radio,
    category: "distribution",
    format: ["CSV", "Excel"],
  },
  {
    id: "5",
    title: "Artist Roster",
    description: "All artists with contract and performance data",
    icon: Users,
    category: "artists",
    format: ["CSV", "Excel", "PDF"],
  },
  {
    id: "6",
    title: "Error Log Report",
    description: "Comprehensive error and issue history",
    icon: AlertCircle,
    category: "errors",
    format: ["CSV", "Excel"],
  },
];

const recentReports = [
  {
    id: "1",
    name: "January 2026 Royalty Statement",
    type: "Royalty Statement",
    generatedAt: "2026-01-25 10:30",
    format: "PDF",
  },
  {
    id: "2",
    name: "Q4 2025 Analytics Summary",
    type: "Analytics Summary",
    generatedAt: "2026-01-15 14:20",
    format: "Excel",
  },
  {
    id: "3",
    name: "Full Catalog Export",
    type: "Catalog Report",
    generatedAt: "2026-01-10 09:15",
    format: "CSV",
  },
];

export function ReportsView() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Generate custom reports and export data
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-semibold mt-1">342</p>
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
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-semibold mt-1">28</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-semibold mt-1">5</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates</p>
                <p className="text-2xl font-semibold mt-1">{reportTemplates.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Templates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
            <CardDescription>Select a template to generate a report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-[#ff0050]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{template.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.format.map((fmt) => (
                        <Badge key={fmt} variant="outline" className="text-xs">
                          {fmt}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity bg-[#ff0050] hover:bg-[#cc0040]"
                      size="sm"
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Custom Report Builder */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report</CardTitle>
              <CardDescription>Build a custom report with specific criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="catalog">Catalog</SelectItem>
                    <SelectItem value="royalties">Royalties</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="distribution">Distribution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Include Fields</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="metadata" defaultChecked />
                    <label htmlFor="metadata" className="text-sm">Metadata</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="financial" defaultChecked />
                    <label htmlFor="financial" className="text-sm">Financial Data</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="analytics" />
                    <label htmlFor="analytics" className="text-sm">Analytics</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="distribution" />
                    <label htmlFor="distribution" className="text-sm">Distribution Status</label>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-[#ff0050] hover:bg-[#cc0040]">
                <Download className="h-4 w-4 mr-2" />
                Generate Custom Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule Report</CardTitle>
              <CardDescription>Set up automated reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="w-full">
                Set Up Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Your recently generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-muted-foreground">{report.type}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        Generated: {report.generatedAt}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{report.format}</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

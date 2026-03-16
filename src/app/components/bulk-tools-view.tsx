import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Progress } from "@/app/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  PackagePlus,
  Upload,
  Download,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Database,
  Edit,
  Radio,
  Fingerprint,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface BulkOperation {
  id: string;
  type: string;
  fileName: string;
  recordsTotal: number;
  recordsProcessed: number;
  status: "processing" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
}

const recentOperations: BulkOperation[] = [
  {
    id: "1",
    type: "Metadata Update",
    fileName: "releases_update_jan2026.csv",
    recordsTotal: 250,
    recordsProcessed: 250,
    status: "completed",
    startedAt: "2026-01-25 10:30",
    completedAt: "2026-01-25 10:35",
  },
  {
    id: "2",
    type: "Bulk Redelivery",
    fileName: "redelivery_spotify.csv",
    recordsTotal: 120,
    recordsProcessed: 85,
    status: "processing",
    startedAt: "2026-01-25 14:20",
  },
  {
    id: "3",
    type: "Import Releases",
    fileName: "new_catalog_2026.csv",
    recordsTotal: 500,
    recordsProcessed: 500,
    status: "completed",
    startedAt: "2026-01-24 09:00",
    completedAt: "2026-01-24 09:45",
  },
  {
    id: "4",
    type: "Audio Rescan",
    fileName: "rescan_queue.csv",
    recordsTotal: 75,
    recordsProcessed: 42,
    status: "failed",
    startedAt: "2026-01-23 16:15",
    completedAt: "2026-01-23 16:25",
  },
];

export function BulkToolsView() {
  const [dragActive, setDragActive] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Bulk Tools</h1>
          <p className="text-muted-foreground mt-1">
            Import/export data, bulk updates, and mass operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Templates
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Operations</p>
                <p className="text-2xl font-semibold mt-1">342</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <PackagePlus className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold mt-1">318</p>
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
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-semibold mt-1">3</p>
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
                <p className="text-sm text-muted-foreground">Records Processed</p>
                <p className="text-2xl font-semibold mt-1">45.2K</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="update">Bulk Update</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <CardDescription>Upload CSV files to import releases, metadata, or other data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-12 transition-colors cursor-pointer",
                    dragActive
                      ? "border-[#ff0050] bg-[#ff0050]/5"
                      : "border-border hover:border-[#ff0050]/50 hover:bg-muted/50"
                  )}
                  onDragEnter={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-[#ff0050]/10 flex items-center justify-center mb-4">
                      <FileSpreadsheet className="h-8 w-8 text-[#ff0050]" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Drop CSV file here</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse from your computer
                    </p>
                    <Button className="bg-[#ff0050] hover:bg-[#cc0040]">
                      <Upload className="h-4 w-4 mr-2" />
                      Select File
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h4 className="text-sm font-medium mb-2">Import Guidelines</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• CSV files must include all required columns</li>
                    <li>• Maximum 10,000 rows per file</li>
                    <li>• Use UTF-8 encoding for special characters</li>
                    <li>• Download templates for correct formatting</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Import Types */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Import Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    New Releases
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Metadata Updates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Radio className="h-4 w-4 mr-2" />
                    Redelivery Queue
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Audio Rescan
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">CSV Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-[#ff0050]">
                    <Download className="h-3 w-3 mr-2" />
                    releases_template.csv
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-[#ff0050]">
                    <Download className="h-3 w-3 mr-2" />
                    metadata_template.csv
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-[#ff0050]">
                    <Download className="h-3 w-3 mr-2" />
                    redelivery_template.csv
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-5 w-5 text-[#ff0050]" />
                  All Releases
                </CardTitle>
                <CardDescription>Export complete catalog</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#ff0050] hover:bg-[#cc0040]">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  Metadata
                </CardTitle>
                <CardDescription>Export all metadata fields</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#ff0050] hover:bg-[#cc0040]">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Radio className="h-5 w-5 text-green-500" />
                  Distribution Status
                </CardTitle>
                <CardDescription>Export DSP delivery status</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#ff0050] hover:bg-[#cc0040]">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-purple-500" />
                  Audio Recognition
                </CardTitle>
                <CardDescription>Export scan results</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#ff0050] hover:bg-[#cc0040]">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Errors & Logs
                </CardTitle>
                <CardDescription>Export error reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#ff0050] hover:bg-[#cc0040]">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-[#ff0050]" />
                  Custom Export
                </CardTitle>
                <CardDescription>Select specific fields</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Configure Export
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bulk Update Tab */}
        <TabsContent value="update" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bulk Metadata Update</CardTitle>
                <CardDescription>Update metadata for multiple releases</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#ff0050] hover:bg-[#cc0040]">
                  <Edit className="h-4 w-4 mr-2" />
                  Start Update
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bulk Redelivery</CardTitle>
                <CardDescription>Redeliver to DSPs in bulk</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#ff0050] hover:bg-[#cc0040]">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Redelivery
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bulk Audio Rescan</CardTitle>
                <CardDescription>Rescan audio fingerprints</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#ff0050] hover:bg-[#cc0040]">
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Start Rescan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Operations</CardTitle>
              <CardDescription>Track progress and history of bulk operations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation Type</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOperations.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell className="font-medium">{op.type}</TableCell>
                      <TableCell className="text-muted-foreground">{op.fileName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-[200px]">
                            <Progress
                              value={(op.recordsProcessed / op.recordsTotal) * 100}
                              className="h-2"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {op.recordsProcessed}/{op.recordsTotal}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{op.startedAt}</TableCell>
                      <TableCell>{getStatusBadge(op.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button, buttonVariants } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";

interface ImportedStatement {
  id: string;
  filename: string;
  dsp: "Spotify" | "Apple Music" | "YouTube Music" | "Amazon Music" | "Deezer" | "TIDAL";
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  totalStreams: number;
  rowCount: number;
  importedAt: string;
  status: "processing" | "completed" | "failed";
  importedBy: string;
}

interface PreviewRow {
  isrc: string;
  trackTitle: string;
  artist: string;
  streams: number;
  revenue: number;
  territory: string;
}

const mockStatements: ImportedStatement[] = [
  {
    id: "1",
    filename: "spotify_jan_2026.csv",
    dsp: "Spotify",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
    totalRevenue: 45678.90,
    totalStreams: 12456789,
    rowCount: 1234,
    importedAt: "2026-01-30T14:30:00",
    status: "completed",
    importedBy: "Finance Team",
  },
  {
    id: "2",
    filename: "apple_music_jan_2026.csv",
    dsp: "Apple Music",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
    totalRevenue: 32145.67,
    totalStreams: 8765432,
    rowCount: 987,
    importedAt: "2026-01-30T15:15:00",
    status: "completed",
    importedBy: "Finance Team",
  },
  {
    id: "3",
    filename: "youtube_jan_2026.csv",
    dsp: "YouTube Music",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
    totalRevenue: 18234.56,
    totalStreams: 5432109,
    rowCount: 654,
    importedAt: "2026-01-29T10:00:00",
    status: "completed",
    importedBy: "Finance Team",
  },
  {
    id: "4",
    filename: "amazon_jan_2026.csv",
    dsp: "Amazon Music",
    periodStart: "2026-01-01",
    periodEnd: "2026-01-31",
    totalRevenue: 12456.78,
    totalStreams: 3456789,
    rowCount: 456,
    importedAt: "2026-01-28T16:45:00",
    status: "completed",
    importedBy: "Finance Team",
  },
  {
    id: "5",
    filename: "deezer_dec_2025.csv",
    dsp: "Deezer",
    periodStart: "2025-12-01",
    periodEnd: "2025-12-31",
    totalRevenue: 8765.43,
    totalStreams: 2345678,
    rowCount: 321,
    importedAt: "2026-01-05T09:30:00",
    status: "completed",
    importedBy: "Finance Team",
  },
];

const mockPreviewData: PreviewRow[] = [
  {
    isrc: "USUM72345678",
    trackTitle: "Summer Nights",
    artist: "The Waves",
    streams: 45678,
    revenue: 156.78,
    territory: "US",
  },
  {
    isrc: "USUM72345679",
    trackTitle: "Electric Dreams",
    artist: "Neon City",
    streams: 34567,
    revenue: 123.45,
    territory: "UK",
  },
  {
    isrc: "USUM72345680",
    trackTitle: "Ocean Drive",
    artist: "Coast Collective",
    streams: 23456,
    revenue: 89.12,
    territory: "CA",
  },
  {
    isrc: "USUM72345681",
    trackTitle: "Midnight City",
    artist: "Urban Sound",
    streams: 18765,
    revenue: 67.34,
    territory: "AU",
  },
  {
    isrc: "USUM72345682",
    trackTitle: "Neon Lights",
    artist: "Synth Wave",
    streams: 12345,
    revenue: 45.67,
    territory: "DE",
  },
];

const DSP_OPTIONS = [
  { value: "spotify", label: "Spotify", logo: "🎵", color: "bg-green-500" },
  { value: "apple", label: "Apple Music", logo: "🍎", color: "bg-red-500" },
  { value: "youtube", label: "YouTube Music", logo: "▶️", color: "bg-red-600" },
  { value: "amazon", label: "Amazon Music", logo: "📦", color: "bg-blue-500" },
  { value: "deezer", label: "Deezer", logo: "🎧", color: "bg-purple-500" },
  { value: "tidal", label: "TIDAL", logo: "🌊", color: "bg-cyan-500" },
];

export function StatementImport() {
  const [uploadStep, setUploadStep] = useState<"select" | "preview" | "importing" | "completed">("select");
  const [selectedDSP, setSelectedDSP] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [importProgress, setImportProgress] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statementToDelete, setStatementToDelete] = useState<ImportedStatement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = [".csv", ".xlsx", ".xls"];
    const fileExt = file.name.substring(file.name.lastIndexOf("."));

    if (!allowedTypes.includes(fileExt.toLowerCase())) {
      toast.error("Only CSV and Excel files are allowed");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }

    setSelectedFile(file);
    toast.success(`File "${file.name}" selected`);
  };

  const handlePreview = () => {
    if (!selectedDSP) {
      toast.error("Please select a DSP");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }
    if (!periodStart || !periodEnd) {
      toast.error("Please select period start and end dates");
      return;
    }

    setUploadStep("preview");
    toast.success("Preview generated successfully");
  };

  const handleImport = () => {
    setUploadStep("importing");
    setImportProgress(0);

    // Simulate import progress
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStep("completed");
          toast.success("Statement imported successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleReset = () => {
    setUploadStep("select");
    setSelectedDSP("");
    setSelectedFile(null);
    setPeriodStart("");
    setPeriodEnd("");
    setImportProgress(0);
  };

  const handleDelete = (id: string) => {
    toast.info(`Deleting statement ${id}...`);
    // Simulate deletion
    const updatedStatements = mockStatements.filter((s) => s.id !== id);
    toast.success(`Statement ${id} deleted successfully!`);
    // Update mockStatements with the new list
    // In a real application, you would update the state or make an API call here
  };

  const getStatusBadge = (status: ImportedStatement["status"]) => {
    const variants = {
      processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      completed: "bg-green-500/10 text-green-600 border-green-500/20",
      failed: "bg-red-500/10 text-red-600 border-red-500/20",
    };

    const icons = {
      processing: <Upload className="h-3 w-3 mr-1 animate-pulse" />,
      completed: <CheckCircle2 className="h-3 w-3 mr-1" />,
      failed: <AlertCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalRevenue = mockStatements.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalStreams = mockStatements.reduce((sum, s) => sum + s.totalStreams, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Imported</p>
                <p className="text-2xl font-semibold mt-1">{mockStatements.length}</p>
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
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-semibold mt-1">
                  ${totalRevenue.toLocaleString()}
                </p>
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
                <p className="text-sm text-muted-foreground">Total Streams</p>
                <p className="text-2xl font-semibold mt-1">
                  {(totalStreams / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-semibold mt-1">4</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-[#ff0050]" />
            Import New Statement
          </CardTitle>
          <CardDescription>
            Upload royalty statements from DSP partners (CSV or Excel format)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          {uploadStep === "select" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DSP Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">DSP Platform *</label>
                  <Select value={selectedDSP} onValueChange={setSelectedDSP}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DSP_OPTIONS.map((dsp) => (
                        <SelectItem key={dsp.value} value={dsp.value}>
                          <span className="flex items-center gap-2">
                            <span>{dsp.logo}</span>
                            <span>{dsp.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Period */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Period Start *</label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Period End *</label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Statement File *</label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  {selectedFile ? (
                    <div className="space-y-3">
                      <FileText className="h-12 w-12 text-[#ff0050] mx-auto" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        CSV or Excel files (max 50MB)
                      </p>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" asChild>
                          <span>Select File</span>
                        </Button>
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button onClick={handlePreview} className="bg-[#ff0050] hover:bg-[#cc0040]">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Data
                </Button>
              </div>
            </div>
          )}

          {uploadStep === "preview" && (
            <div className="space-y-6">
              {/* Preview Info */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Preview: {selectedFile?.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {DSP_OPTIONS.find(d => d.value === selectedDSP)?.label} • {periodStart} to {periodEnd}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border">
                  <p className="text-2xl font-bold text-[#ff0050]">
                    {mockPreviewData.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Rows</p>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <p className="text-2xl font-bold text-green-500">
                    ${mockPreviewData.reduce((sum, r) => sum + r.revenue, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
                </div>
                <div className="text-center p-4 rounded-lg border">
                  <p className="text-2xl font-bold text-blue-500">
                    {mockPreviewData.reduce((sum, r) => sum + r.streams, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Streams</p>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium">ISRC</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Track</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Artist</th>
                        <th className="px-4 py-3 text-right text-xs font-medium">Streams</th>
                        <th className="px-4 py-3 text-right text-xs font-medium">Revenue</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Territory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockPreviewData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm font-mono">{row.isrc}</td>
                          <td className="px-4 py-3 text-sm">{row.trackTitle}</td>
                          <td className="px-4 py-3 text-sm">{row.artist}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            {row.streams.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            ${row.revenue.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm">{row.territory}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
                <Button onClick={handleImport} className="bg-[#ff0050] hover:bg-[#cc0040]">
                  <Upload className="h-4 w-4 mr-2" />
                  Confirm Import
                </Button>
              </div>
            </div>
          )}

          {uploadStep === "importing" && (
            <div className="space-y-6 py-8">
              <div className="text-center">
                <Upload className="h-16 w-16 text-[#ff0050] mx-auto mb-4 animate-pulse" />
                <p className="text-lg font-medium">Importing Statement...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Processing {mockPreviewData.length} rows
                </p>
              </div>
              <div className="space-y-2">
                <Progress value={importProgress} className="h-3" />
                <p className="text-center text-sm text-muted-foreground">
                  {importProgress}% Complete
                </p>
              </div>
            </div>
          )}

          {uploadStep === "completed" && (
            <div className="space-y-6 py-8">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <p className="text-lg font-medium">Import Completed!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Successfully imported {mockPreviewData.length} rows
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-2xl font-bold text-green-600">
                    {mockPreviewData.length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Rows Imported</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-xs text-muted-foreground mt-1">Errors</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-2xl font-bold text-green-600">100%</p>
                  <p className="text-xs text-muted-foreground mt-1">Success Rate</p>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={handleReset}>
                  Import Another Statement
                </Button>
                <Button onClick={() => toast.info("Viewing imported data...")}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Imported Data
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Imports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
          <CardDescription>
            {mockStatements.length} statement{mockStatements.length !== 1 ? "s" : ""} imported
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium">FILE</th>
                    <th className="px-4 py-3 text-left text-xs font-medium">PERIOD</th>
                    <th className="px-4 py-3 text-left text-xs font-medium">REVENUE / STREAMS</th>
                    <th className="px-4 py-3 text-left text-xs font-medium">STATUS</th>
                    <th className="px-4 py-3 text-right text-xs font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockStatements.map((statement) => (
                    <tr key={statement.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-[#ff0050]" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{statement.filename}</p>
                            <p className="text-xs text-muted-foreground">{statement.dsp}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">
                          {new Date(statement.periodStart).toLocaleDateString()} -{" "}
                          {new Date(statement.periodEnd).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">
                          ${statement.totalRevenue.toLocaleString()} /{" "}
                          {(statement.totalStreams / 1000000).toFixed(1)}M
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(statement.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.success(`Downloading ${statement.filename}`)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeleteDialogOpen(true);
                              setStatementToDelete(statement);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Statement?</AlertDialogTitle>
            <AlertDialogDescription>
              {statementToDelete && (
                <>
                  Are you sure you want to delete <strong>{statementToDelete.filename}</strong>?
                  <br />
                  <br />
                  This will permanently remove this statement import and cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (statementToDelete) {
                  handleDelete(statementToDelete.id);
                }
                setDeleteDialogOpen(false);
                setStatementToDelete(null);
              }}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Delete Statement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
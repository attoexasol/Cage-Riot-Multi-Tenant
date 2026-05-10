import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
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
  FileText,
  Upload,
  Download,
  Eye,
  Search,
  Filter,
  FolderOpen,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";

interface Document {
  id: string;
  title: string;
  category: "contract" | "license" | "agreement" | "copyright" | "clearance" | "other";
  fileType: "pdf" | "docx" | "txt" | "xlsx";
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  status: "active" | "pending_review" | "expired" | "archived";
  expiryDate?: string;
  associatedRelease?: string;
  associatedArtist?: string;
  description: string;
  tags: string[];
}

const mockDocuments: Document[] = [
  {
    id: "1",
    title: "Distribution Agreement - Summer Nights EP",
    category: "agreement",
    fileType: "pdf",
    fileSize: "2.4 MB",
    uploadedBy: "Sarah Johnson",
    uploadDate: "2026-01-28",
    status: "active",
    expiryDate: "2028-01-28",
    associatedRelease: "Summer Nights EP",
    associatedArtist: "The Waves",
    description: "Master distribution agreement for Summer Nights EP including all streaming platforms",
    tags: ["distribution", "master", "streaming"],
  },
  {
    id: "2",
    title: "Mechanical License - Electric Dreams",
    category: "license",
    fileType: "pdf",
    fileSize: "1.8 MB",
    uploadedBy: "Michael Chen",
    uploadDate: "2026-01-25",
    status: "active",
    expiryDate: "2027-12-31",
    associatedRelease: "Electric Dreams",
    associatedArtist: "Neon City",
    description: "Mechanical license for cover song on Electric Dreams single",
    tags: ["mechanical", "cover", "license"],
  },
  {
    id: "3",
    title: "Publishing Agreement - Coast Collective",
    category: "contract",
    fileType: "pdf",
    fileSize: "3.2 MB",
    uploadedBy: "Sarah Johnson",
    uploadDate: "2026-01-20",
    status: "active",
    expiryDate: "2029-01-20",
    associatedArtist: "Coast Collective",
    description: "Comprehensive publishing rights agreement including sync licensing",
    tags: ["publishing", "sync", "rights"],
  },
  {
    id: "4",
    title: "Sample Clearance - Bass Drops",
    category: "clearance",
    fileType: "pdf",
    fileSize: "1.2 MB",
    uploadedBy: "Emily Rodriguez",
    uploadDate: "2026-01-22",
    status: "active",
    associatedRelease: "Bass Drops",
    associatedArtist: "Deep Sound Records",
    description: "Sample clearance documentation for drum loop in Bass Drops",
    tags: ["sample", "clearance", "drums"],
  },
  {
    id: "5",
    title: "Copyright Registration - Midnight Sessions",
    category: "copyright",
    fileType: "pdf",
    fileSize: "890 KB",
    uploadedBy: "Michael Chen",
    uploadDate: "2026-01-18",
    status: "pending_review",
    associatedRelease: "Midnight Sessions",
    associatedArtist: "Urban Sound",
    description: "Copyright office registration certificate pending final review",
    tags: ["copyright", "registration", "pending"],
  },
  {
    id: "6",
    title: "Sync License Agreement - TV Commercial",
    category: "license",
    fileType: "pdf",
    fileSize: "2.1 MB",
    uploadedBy: "Sarah Johnson",
    uploadDate: "2026-01-15",
    status: "active",
    expiryDate: "2026-12-31",
    associatedRelease: "Ocean Vibes Vol. 3",
    associatedArtist: "Coast Collective",
    description: "Synchronization license for use in national TV advertising campaign",
    tags: ["sync", "commercial", "advertising"],
  },
  {
    id: "7",
    title: "Master Recording Agreement",
    category: "contract",
    fileType: "pdf",
    fileSize: "4.5 MB",
    uploadedBy: "Emily Rodriguez",
    uploadDate: "2026-01-10",
    status: "active",
    expiryDate: "2031-01-10",
    associatedArtist: "The Waves",
    description: "Master recording ownership and rights transfer agreement",
    tags: ["master", "recording", "ownership"],
  },
  {
    id: "8",
    title: "Producer Agreement - Split Sheet",
    category: "agreement",
    fileType: "pdf",
    fileSize: "650 KB",
    uploadedBy: "Michael Chen",
    uploadDate: "2026-01-12",
    status: "active",
    associatedRelease: "Electric Dreams",
    associatedArtist: "Neon City",
    description: "Producer royalty split and credit agreement",
    tags: ["producer", "royalty", "split"],
  },
  {
    id: "9",
    title: "Collaboration Agreement",
    category: "agreement",
    fileType: "docx",
    fileSize: "425 KB",
    uploadedBy: "Sarah Johnson",
    uploadDate: "2025-12-20",
    status: "expired",
    expiryDate: "2026-01-20",
    associatedArtist: "Various Artists",
    description: "Collaboration terms between multiple artists - now expired",
    tags: ["collaboration", "expired"],
  },
  {
    id: "10",
    title: "Trademark Registration Certificate",
    category: "other",
    fileType: "pdf",
    fileSize: "1.5 MB",
    uploadedBy: "Emily Rodriguez",
    uploadDate: "2026-01-05",
    status: "archived",
    description: "Archived trademark registration documentation",
    tags: ["trademark", "registration", "archived"],
  },
];

const ALLOWED_UPLOAD_EXT = new Set(["pdf", "docx", "txt", "xlsx"]);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function formatFileSizeFromBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeFromName(fileName: string): Document["fileType"] {
  const ext = fileName.split(".").pop()?.toLowerCase() || "pdf";
  if (ext === "docx") return "docx";
  if (ext === "txt") return "txt";
  if (ext === "xlsx") return "xlsx";
  return "pdf";
}

export function DocumentsView() {
  const [documents, setDocuments] = useState<Document[]>(() => [...mockDocuments]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "title" | "size">("date");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<Document["category"] | "">("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [uploadRelease, setUploadRelease] = useState("");
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadTagsRaw, setUploadTagsRaw] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    if (!showUploadDialog) return;
    setUploadTitle("");
    setUploadCategory("");
    setUploadArtist("");
    setUploadRelease("");
    setUploadExpiry("");
    setUploadDescription("");
    setUploadTagsRaw("");
    setUploadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [showUploadDialog]);

  const pickUploadFile = (file: File | null) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_UPLOAD_EXT.has(ext)) {
      toast.error("Please choose a PDF, DOCX, TXT, or XLSX file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("File is too large (maximum 10MB).");
      return;
    }
    setUploadFile(file);
  };

  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.associatedArtist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.associatedRelease?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
      const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "size") {
        const aSize = parseFloat(a.fileSize);
        const bSize = parseFloat(b.fileSize);
        return bSize - aSize;
      }
      return 0;
    });

  const activeCount = documents.filter((d) => d.status === "active").length;
  const pendingCount = documents.filter((d) => d.status === "pending_review").length;
  const expiredCount = documents.filter((d) => d.status === "expired").length;

  const handleView = (doc: Document) => {
    setCurrentDocument(doc);
    setShowViewDialog(true);
  };

  const handleDownload = (doc: Document) => {
    toast.success(`Downloading ${doc.title}`);
    setTimeout(() => {
      toast.success(`Downloaded: ${doc.title}.${doc.fileType}`);
    }, 1000);
  };

  const handleDelete = (doc: Document) => {
    toast.success(`Document "${doc.title}" moved to trash`);
  };

  const handleUpload = () => {
    const title = uploadTitle.trim();
    if (!title) {
      toast.error("Please enter a document title.");
      return;
    }
    if (!uploadCategory) {
      toast.error("Please select a category.");
      return;
    }
    if (!uploadFile) {
      toast.error("Please choose a file to upload.");
      return;
    }

    const tags = uploadTagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const today = new Date().toISOString().slice(0, 10);
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title,
      category: uploadCategory as Document["category"],
      fileType: fileTypeFromName(uploadFile.name),
      fileSize: formatFileSizeFromBytes(uploadFile.size),
      uploadedBy: "You",
      uploadDate: today,
      status: "pending_review",
      expiryDate: uploadExpiry.trim() || undefined,
      associatedRelease: uploadRelease.trim() || undefined,
      associatedArtist: uploadArtist.trim() || undefined,
      description: uploadDescription.trim() || "No description provided.",
      tags,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    toast.success("Document uploaded successfully", { description: uploadFile.name });
    setShowUploadDialog(false);
  };

  const getCategoryBadge = (category: Document["category"]) => {
    const variants = {
      contract: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      license: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      agreement: "bg-green-500/10 text-green-600 border-green-500/20",
      copyright: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      clearance: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };

    const labels = {
      contract: "Contract",
      license: "License",
      agreement: "Agreement",
      copyright: "Copyright",
      clearance: "Clearance",
      other: "Other",
    };

    return (
      <Badge variant="secondary" className={variants[category]}>
        {labels[category]}
      </Badge>
    );
  };

  const getStatusBadge = (status: Document["status"]) => {
    const variants = {
      active: "bg-green-500/10 text-green-600 border-green-500/20",
      pending_review: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      expired: "bg-red-500/10 text-red-600 border-red-500/20",
      archived: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };

    const labels = {
      active: "Active",
      pending_review: "Pending Review",
      expired: "Expired",
      archived: "Archived",
    };

    const icons = {
      active: <CheckCircle2 className="h-3 w-3 mr-1" />,
      pending_review: <Clock className="h-3 w-3 mr-1" />,
      expired: <AlertCircle className="h-3 w-3 mr-1" />,
      archived: <FolderOpen className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const getFileIcon = (fileType: Document["fileType"]) => {
    return <FileText className="h-5 w-5 text-[#ff0050]" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">Legal Documents</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage contracts, licenses, and legal documentation
          </p>
        </div>
        <Button
          onClick={() => setShowUploadDialog(true)}
          className="bg-[#ff0050] hover:bg-[#cc0040] w-full sm:w-auto flex-shrink-0 h-9 md:h-10"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-semibold mt-1">{documents.length}</p>
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
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-semibold mt-1">{activeCount}</p>
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
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-semibold mt-1">{pendingCount}</p>
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
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-semibold mt-1">{expiredCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="px-3.5 sm:px-6 pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents by title, artist, release, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="license">Licenses</SelectItem>
                <SelectItem value="agreement">Agreements</SelectItem>
                <SelectItem value="copyright">Copyright</SelectItem>
                <SelectItem value="clearance">Clearance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="title">Sort by Title</SelectItem>
                <SelectItem value="size">Sort by Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-6">
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "p-3 md:p-4 rounded-lg border hover:border-[#ff0050]/30 transition-colors",
                  doc.status === "expired" && "border-red-500/30 bg-red-500/5"
                )}
              >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
                  <div className="h-12 w-12 md:h-12 md:w-12 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                    {getFileIcon(doc.fileType)}
                  </div>

                  <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2 md:gap-3 mb-2">
                      <div className="min-w-0 text-center md:text-left">
                        <h3 className="text-sm md:text-base font-semibold mb-2 break-words">{doc.title}</h3>
                        <div className="flex items-center justify-center md:justify-start gap-1.5 md:gap-2 flex-wrap">
                          {getCategoryBadge(doc.category)}
                          {getStatusBadge(doc.status)}
                          <Badge variant="outline" className="text-xs">
                            {doc.fileType.toUpperCase()} • {doc.fileSize}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-1.5 md:gap-2 flex-shrink-0 w-full lg:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(doc)}
                          className="h-8 px-2 md:h-9 md:px-3 flex-1 lg:flex-none"
                        >
                          <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                          <span className="hidden md:inline">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          className="h-8 px-2 md:h-9 md:px-3 flex-1 lg:flex-none"
                        >
                          <Download className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
                          <span className="hidden md:inline">Download</span>
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 break-words text-center md:text-left">{doc.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-sm">
                      {doc.associatedArtist && (
                        <div className="min-w-0 text-center md:text-left">
                          <p className="text-muted-foreground text-xs">Artist</p>
                          <p className="text-xs md:text-sm font-medium truncate">{doc.associatedArtist}</p>
                        </div>
                      )}
                      {doc.associatedRelease && (
                        <div className="min-w-0 text-center md:text-left">
                          <p className="text-muted-foreground text-xs">Release</p>
                          <p className="text-xs md:text-sm font-medium truncate">{doc.associatedRelease}</p>
                        </div>
                      )}
                      <div className="min-w-0 text-center md:text-left">
                        <p className="text-muted-foreground text-xs">Uploaded By</p>
                        <p className="text-xs md:text-sm font-medium truncate">{doc.uploadedBy}</p>
                      </div>
                      <div className="min-w-0 text-center md:text-left">
                        <p className="text-muted-foreground text-xs">Upload Date</p>
                        <p className="text-xs md:text-sm font-medium">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {doc.expiryDate && (
                      <div className="mt-2 md:mt-3 p-2 md:p-3 rounded-lg bg-muted">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-xs md:text-sm">
                            <span className="text-muted-foreground">Expires: </span>
                            <span className="font-medium">
                              {new Date(doc.expiryDate).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {doc.tags.length > 0 && (
                      <div className="flex items-center justify-center md:justify-start gap-1.5 md:gap-2 flex-wrap mt-2 md:mt-3">
                        {doc.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredDocuments.length === 0 && (
              <div className="text-center py-8 md:py-12 border-2 border-dashed rounded-lg">
                <FileText className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm md:text-base text-muted-foreground">No documents found</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Try adjusting your filters or upload a new document
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new legal document to the system
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="legal-doc-title">Document Title *</Label>
              <Input
                id="legal-doc-title"
                placeholder="Enter document title..."
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={uploadCategory || undefined}
                onValueChange={(v) => setUploadCategory(v as Document["category"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                  <SelectItem value="agreement">Agreement</SelectItem>
                  <SelectItem value="copyright">Copyright</SelectItem>
                  <SelectItem value="clearance">Clearance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legal-doc-artist">Associated Artist</Label>
                <Input
                  id="legal-doc-artist"
                  placeholder="Artist name (optional)"
                  value={uploadArtist}
                  onChange={(e) => setUploadArtist(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legal-doc-release">Associated Release</Label>
                <Input
                  id="legal-doc-release"
                  placeholder="Release name (optional)"
                  value={uploadRelease}
                  onChange={(e) => setUploadRelease(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal-doc-expiry">Expiry Date (Optional)</Label>
              <Input
                id="legal-doc-expiry"
                type="date"
                value={uploadExpiry}
                onChange={(e) => setUploadExpiry(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal-doc-desc">Description</Label>
              <Textarea
                id="legal-doc-desc"
                placeholder="Enter document description..."
                className="min-h-[100px]"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal-doc-tags">Tags (comma separated)</Label>
              <Input
                id="legal-doc-tags"
                placeholder="e.g., distribution, master, streaming"
                value={uploadTagsRaw}
                onChange={(e) => setUploadTagsRaw(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legal-doc-file">File Upload *</Label>
              <input
                ref={fileInputRef}
                id="legal-doc-file"
                type="file"
                accept=".pdf,.docx,.txt,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  pickUploadFile(f);
                }}
              />
              <div
                role="button"
                tabIndex={0}
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-[#ff0050]/50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#ff0050]/40"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const f = e.dataTransfer.files?.[0] ?? null;
                  pickUploadFile(f);
                }}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" aria-hidden />
                <p className="text-sm font-medium">
                  {uploadFile ? uploadFile.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOCX, TXT, or XLSX (max 10MB)
                  {uploadFile ? ` · ${formatFileSizeFromBytes(uploadFile.size)}` : null}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              className="bg-[#ff0050] hover:bg-[#cc0040]"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
            <DialogDescription>
              Complete information for this document
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6 overflow-x-hidden">
            {currentDocument && (
              <>
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-muted">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-[#ff0050]/10 flex items-center justify-center flex-shrink-0">
                    {getFileIcon(currentDocument.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 break-words">{currentDocument.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryBadge(currentDocument.category)}
                      {getStatusBadge(currentDocument.status)}
                      <Badge variant="outline" className="text-xs">
                        {currentDocument.fileType.toUpperCase()} • {currentDocument.fileSize}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground break-words">{currentDocument.description}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm mb-2">Upload Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex flex-col gap-1 p-2 rounded bg-muted">
                          <span className="text-muted-foreground text-xs">Uploaded By:</span>
                          <span className="font-medium break-words">{currentDocument.uploadedBy}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-2 rounded bg-muted">
                          <span className="text-muted-foreground text-xs">Upload Date:</span>
                          <span className="font-medium">
                            {new Date(currentDocument.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm mb-2">Associated Content</h4>
                      <div className="space-y-2 text-sm">
                        {currentDocument.associatedArtist && (
                          <div className="flex flex-col gap-1 p-2 rounded bg-muted">
                            <span className="text-muted-foreground text-xs">Artist:</span>
                            <span className="font-medium break-words">{currentDocument.associatedArtist}</span>
                          </div>
                        )}
                        {currentDocument.associatedRelease && (
                          <div className="flex flex-col gap-1 p-2 rounded bg-muted">
                            <span className="text-muted-foreground text-xs">Release:</span>
                            <span className="font-medium break-words">{currentDocument.associatedRelease}</span>
                          </div>
                        )}
                        {currentDocument.expiryDate && (
                          <div className="flex flex-col gap-1 p-2 rounded bg-muted">
                            <span className="text-muted-foreground text-xs">Expiry Date:</span>
                            <span className="font-medium">
                              {new Date(currentDocument.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {currentDocument.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Tags</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {currentDocument.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleDownload(currentDocument)}
                    className="bg-[#ff0050] hover:bg-[#cc0040] w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Document
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(currentDocument)}
                    className="w-full text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Document
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
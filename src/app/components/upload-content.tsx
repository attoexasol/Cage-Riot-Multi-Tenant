import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
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
  Upload,
  Music,
  Image as ImageIcon,
  FileText,
  Video,
  CheckCircle2,
  X,
  FileAudio,
  AlertCircle,
  Cloud,
  Shield,
  Save,
  Plus,
  Trash2,
  Check,
  Zap,
  Crown,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { toast } from "sonner";

interface UploadFile {
  id: string;
  name: string;
  type: "audio" | "video" | "image" | "document";
  size: string;
  progress: number;
  status: "uploading" | "complete" | "error";
}

interface Track {
  id: string;
  title: string;
  isrc: string;
  duration: string;
  explicit: boolean;
  genre: string;
}

interface ReleaseMetadata {
  releaseTitle: string;
  upc: string;
  artist: string;
  releaseDate: string;
  releaseType: string;
  label: string;
  copyrightYear: string;
  copyrightHolder: string;
  genre: string;
  subgenre: string;
  language: string;
  description: string;
  tracks: Track[];
}

export function UploadContent() {
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "premium" | "enterprise" | null>(null);
  const [currentStorage, setCurrentStorage] = useState(500); // GB
  const [usedStorage] = useState(234); // GB
  const [files, setFiles] = useState<UploadFile[]>([
    {
      id: "1",
      name: "Summer_Nights_Master.wav",
      type: "audio",
      size: "42.3 MB",
      progress: 100,
      status: "complete",
    },
    {
      id: "2",
      name: "Album_Artwork_3000x3000.jpg",
      type: "image",
      size: "8.2 MB",
      progress: 100,
      status: "complete",
    },
    {
      id: "3",
      name: "License_Agreement.pdf",
      type: "document",
      size: "1.4 MB",
      progress: 65,
      status: "uploading",
    },
  ]);

  const [metadata, setMetadata] = useState<ReleaseMetadata>({
    releaseTitle: "Summer Nights",
    upc: "",
    artist: "The Waves",
    releaseDate: "",
    releaseType: "single",
    label: "Independent",
    copyrightYear: "2026",
    copyrightHolder: "",
    genre: "pop",
    subgenre: "",
    language: "en",
    description: "",
    tracks: [
      {
        id: "1",
        title: "Summer Nights",
        isrc: "",
        duration: "3:45",
        explicit: false,
        genre: "pop",
      },
    ],
  });

  const addTrack = () => {
    const newTrack: Track = {
      id: Date.now().toString(),
      title: "",
      isrc: "",
      duration: "",
      explicit: false,
      genre: "pop",
    };
    setMetadata({
      ...metadata,
      tracks: [...metadata.tracks, newTrack],
    });
  };

  const removeTrack = (trackId: string) => {
    if (metadata.tracks.length > 1) {
      setMetadata({
        ...metadata,
        tracks: metadata.tracks.filter((t) => t.id !== trackId),
      });
      toast.success("Track removed");
    }
  };

  const updateTrack = (trackId: string, field: keyof Track, value: any) => {
    setMetadata({
      ...metadata,
      tracks: metadata.tracks.map((t) =>
        t.id === trackId ? { ...t, [field]: value } : t
      ),
    });
  };

  const saveMetadata = () => {
    toast.success("Metadata saved successfully!");
  };

  const submitForReview = () => {
    toast.success("Release submitted for review!");
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "audio":
        return FileAudio;
      case "video":
        return Video;
      case "image":
        return ImageIcon;
      case "document":
        return FileText;
      default:
        return FileText;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case "audio":
        return "text-[#ff0050]";
      case "video":
        return "text-purple-500";
      case "image":
        return "text-blue-500";
      case "document":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Upload Content</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Upload audio, video, artwork, and supporting documents
        </p>
      </div>

      {/* Upload Guidelines */}
      <Card className="border-[#ff0050]/20 bg-[#ff0050]/5">
        <CardContent className="pt-4 sm:pt-6 px-3.5 sm:px-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#ff0050] flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium text-sm sm:text-base">Upload Guidelines</h3>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li>• Audio: WAV or FLAC, 16-bit/44.1kHz minimum, 24-bit/96kHz recommended</li>
                <li>• Artwork: JPG or PNG, minimum 3000x3000px, RGB color space</li>
                <li>• Video: MP4 or MOV, H.264 codec, 1080p minimum</li>
                <li>• Documents: PDF format for licenses and contracts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>Drag and drop or click to browse</CardDescription>
          </CardHeader>
          <CardContent className="px-3.5 sm:px-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="flex w-full overflow-x-auto sm:grid sm:grid-cols-5 gap-2 scrollbar-hide">
                <TabsTrigger value="all" className="flex-shrink-0 whitespace-nowrap">All</TabsTrigger>
                <TabsTrigger value="audio" className="flex-shrink-0 whitespace-nowrap">Audio</TabsTrigger>
                <TabsTrigger value="video" className="flex-shrink-0 whitespace-nowrap">Video</TabsTrigger>
                <TabsTrigger value="artwork" className="flex-shrink-0 whitespace-nowrap">Artwork</TabsTrigger>
                <TabsTrigger value="docs" className="flex-shrink-0 whitespace-nowrap">Docs</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {/* Drag and Drop Zone */}
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
                      <Upload className="h-8 w-8 text-[#ff0050]" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Drop files here</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse from your computer
                    </p>
                    <Button className="bg-[#ff0050] hover:bg-[#cc0040]">
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                </div>

                {/* File List */}
                <div className="space-y-3">
                  {files.map((file) => {
                    const Icon = getFileIcon(file.type);
                    const colorClass = getFileColor(file.type);

                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", colorClass)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <p className="text-xs sm:text-sm font-medium truncate">{file.name}</p>
                            <span className="text-xs text-muted-foreground flex-shrink-0">{file.size}</span>
                          </div>
                          
                          {file.status === "uploading" && (
                            <div className="space-y-1">
                              <Progress value={file.progress} className="h-1.5" />
                              <p className="text-xs text-muted-foreground">
                                Uploading... {file.progress}%
                              </p>
                            </div>
                          )}
                          
                          {file.status === "complete" && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-green-500">Upload complete</span>
                            </div>
                          )}
                          
                          {file.status === "error" && (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-[#ff0050]" />
                              <span className="text-xs text-[#ff0050]">Upload failed</span>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => setFiles(files.filter((f) => f.id !== file.id))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="audio">
                <div className="text-center py-12 text-muted-foreground">
                  <FileAudio className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No audio files uploaded yet</p>
                </div>
              </TabsContent>

              <TabsContent value="video">
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No video files uploaded yet</p>
                </div>
              </TabsContent>

              <TabsContent value="artwork">
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No artwork files uploaded yet</p>
                </div>
              </TabsContent>

              <TabsContent value="docs">
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No documents uploaded yet</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Upload Info Sidebar */}
        <div className="space-y-6">
          {/* Storage Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Used</span>
                  <span className="font-medium">234 GB / 500 GB</span>
                </div>
                <Progress value={46.8} className="h-2" />
              </div>
              <Button variant="outline" className="w-full" size="sm" onClick={() => setShowStorageModal(true)}>
                Upgrade Storage
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                Secure Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">End-to-end encryption</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Files encrypted during transfer
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Secure cloud storage</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Protected in enterprise-grade servers
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Automated backups</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Daily backups for data protection
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supported Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileAudio className="h-4 w-4 text-[#ff0050]" />
                    <span>Audio</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">WAV, FLAC</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-500" />
                    <span>Video</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">MP4, MOV</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                    <span>Images</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">JPG, PNG</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span>Documents</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">PDF</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Metadata Form */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Release Metadata</CardTitle>
              <CardDescription>Enter details about your release</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={saveMetadata} className="w-full sm:w-auto sm:flex-shrink-0">
              <Save className="h-4 w-4 mr-2" />
              Save Metadata
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="releaseTitle">Release Title</Label>
                <Input
                  id="releaseTitle"
                  value={metadata.releaseTitle}
                  onChange={(e) => setMetadata({ ...metadata, releaseTitle: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="upc">UPC</Label>
                <Input
                  id="upc"
                  value={metadata.upc}
                  onChange={(e) => setMetadata({ ...metadata, upc: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={metadata.artist}
                  onChange={(e) => setMetadata({ ...metadata, artist: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="releaseDate">Release Date</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={metadata.releaseDate}
                  onChange={(e) => setMetadata({ ...metadata, releaseDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="releaseType">Release Type</Label>
                <Select
                  value={metadata.releaseType}
                  onValueChange={(value) => setMetadata({ ...metadata, releaseType: value })}
                >
                  <SelectTrigger>
                    <SelectValue>{metadata.releaseType}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="album">Album</SelectItem>
                    <SelectItem value="ep">EP</SelectItem>
                    <SelectItem value="compilation">Compilation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={metadata.label}
                  onChange={(e) => setMetadata({ ...metadata, label: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="copyrightYear">Copyright Year</Label>
                <Input
                  id="copyrightYear"
                  value={metadata.copyrightYear}
                  onChange={(e) => setMetadata({ ...metadata, copyrightYear: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="copyrightHolder">Copyright Holder</Label>
                <Input
                  id="copyrightHolder"
                  value={metadata.copyrightHolder}
                  onChange={(e) => setMetadata({ ...metadata, copyrightHolder: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="genre">Genre</Label>
                <Select
                  value={metadata.genre}
                  onValueChange={(value) => setMetadata({ ...metadata, genre: value })}
                >
                  <SelectTrigger>
                    <SelectValue>{metadata.genre}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                    <SelectItem value="indie">Indie</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="classical">Classical</SelectItem>
                    <SelectItem value="r&b">R&B</SelectItem>
                    <SelectItem value="latin">Latin</SelectItem>
                    <SelectItem value="folk">Folk</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="punk">Punk</SelectItem>
                    <SelectItem value="reggae">Reggae</SelectItem>
                    <SelectItem value="soul">Soul</SelectItem>
                    <SelectItem value="blues">Blues</SelectItem>
                    <SelectItem value="world">World</SelectItem>
                    <SelectItem value="alternative">Alternative</SelectItem>
                    <SelectItem value="funk">Funk</SelectItem>
                    <SelectItem value="disco">Disco</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="techno">Techno</SelectItem>
                    <SelectItem value="trap">Trap</SelectItem>
                    <SelectItem value="drum-and-bass">Drum and Bass</SelectItem>
                    <SelectItem value="ambient">Ambient</SelectItem>
                    <SelectItem value="experimental">Experimental</SelectItem>
                    <SelectItem value="soundtrack">Soundtrack</SelectItem>
                    <SelectItem value="spoken-word">Spoken Word</SelectItem>
                    <SelectItem value="children">Children</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="new-age">New Age</SelectItem>
                    <SelectItem value="religious">Religious</SelectItem>
                    <SelectItem value="comedy">Comedy</SelectItem>
                    <SelectItem value="drama">Drama</SelectItem>
                    <SelectItem value="documentary">Documentary</SelectItem>
                    <SelectItem value="sound-effects">Sound Effects</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subgenre">Subgenre</Label>
                <Input
                  id="subgenre"
                  value={metadata.subgenre}
                  onChange={(e) => setMetadata({ ...metadata, subgenre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={metadata.language}
                  onValueChange={(value) => setMetadata({ ...metadata, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue>{metadata.language}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="bn">Bengali</SelectItem>
                    <SelectItem value="ur">Urdu</SelectItem>
                    <SelectItem value="tr">Turkish</SelectItem>
                    <SelectItem value="nl">Dutch</SelectItem>
                    <SelectItem value="sv">Swedish</SelectItem>
                    <SelectItem value="no">Norwegian</SelectItem>
                    <SelectItem value="da">Danish</SelectItem>
                    <SelectItem value="fi">Finnish</SelectItem>
                    <SelectItem value="pl">Polish</SelectItem>
                    <SelectItem value="hu">Hungarian</SelectItem>
                    <SelectItem value="ro">Romanian</SelectItem>
                    <SelectItem value="bg">Bulgarian</SelectItem>
                    <SelectItem value="hr">Croatian</SelectItem>
                    <SelectItem value="cs">Czech</SelectItem>
                    <SelectItem value="sk">Slovak</SelectItem>
                    <SelectItem value="sl">Slovenian</SelectItem>
                    <SelectItem value="lt">Lithuanian</SelectItem>
                    <SelectItem value="lv">Latvian</SelectItem>
                    <SelectItem value="et">Estonian</SelectItem>
                    <SelectItem value="hu">Hungarian</SelectItem>
                    <SelectItem value="ro">Romanian</SelectItem>
                    <SelectItem value="bg">Bulgarian</SelectItem>
                    <SelectItem value="hr">Croatian</SelectItem>
                    <SelectItem value="cs">Czech</SelectItem>
                    <SelectItem value="sk">Slovak</SelectItem>
                    <SelectItem value="sl">Slovenian</SelectItem>
                    <SelectItem value="lt">Lithuanian</SelectItem>
                    <SelectItem value="lv">Latvian</SelectItem>
                    <SelectItem value="et">Estonian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={metadata.description}
                  onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                />
              </div>
            </div>

            {/* Tracks */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tracks</h3>
              <div className="space-y-4">
                {metadata.tracks.map((track, index) => (
                  <div key={track.id} className="rounded-lg border bg-card p-4 space-y-3">
                    {/* Track Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Track {index + 1}
                      </span>
                      {metadata.tracks.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeTrack(track.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Track Title - Full Width */}
                    <div className="w-full">
                      <Label htmlFor={`track-title-${track.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                        Title
                      </Label>
                      <Input
                        id={`track-title-${track.id}`}
                        value={track.title}
                        onChange={(e) => updateTrack(track.id, "title", e.target.value)}
                        placeholder="Enter track title"
                        className="w-full"
                      />
                    </div>

                    {/* ISRC & Duration - 2 Column on Mobile */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`track-isrc-${track.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                          ISRC
                        </Label>
                        <Input
                          id={`track-isrc-${track.id}`}
                          value={track.isrc}
                          onChange={(e) => updateTrack(track.id, "isrc", e.target.value)}
                          placeholder="ISRC code"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`track-duration-${track.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                          Duration
                        </Label>
                        <Input
                          id={`track-duration-${track.id}`}
                          value={track.duration}
                          onChange={(e) => updateTrack(track.id, "duration", e.target.value)}
                          placeholder="3:45"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Explicit & Genre - 2 Column on Mobile, Better on Desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`track-explicit-${track.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                          Content Rating
                        </Label>
                        <Select
                          value={track.explicit ? "true" : "false"}
                          onValueChange={(value) => updateTrack(track.id, "explicit", value === "true")}
                        >
                          <SelectTrigger id={`track-explicit-${track.id}`} className="w-full">
                            <SelectValue>{track.explicit ? "Explicit" : "Clean"}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Explicit</SelectItem>
                            <SelectItem value="false">Clean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`track-genre-${track.id}`} className="text-xs text-muted-foreground mb-1.5 block">
                          Genre
                        </Label>
                        <Select
                          value={track.genre}
                          onValueChange={(value) => updateTrack(track.id, "genre", value)}
                        >
                          <SelectTrigger id={`track-genre-${track.id}`} className="w-full">
                            <SelectValue>{track.genre}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pop">Pop</SelectItem>
                            <SelectItem value="rock">Rock</SelectItem>
                            <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                            <SelectItem value="indie">Indie</SelectItem>
                            <SelectItem value="electronic">Electronic</SelectItem>
                            <SelectItem value="country">Country</SelectItem>
                            <SelectItem value="jazz">Jazz</SelectItem>
                            <SelectItem value="classical">Classical</SelectItem>
                            <SelectItem value="r&b">R&B</SelectItem>
                            <SelectItem value="latin">Latin</SelectItem>
                            <SelectItem value="folk">Folk</SelectItem>
                            <SelectItem value="metal">Metal</SelectItem>
                            <SelectItem value="punk">Punk</SelectItem>
                            <SelectItem value="reggae">Reggae</SelectItem>
                            <SelectItem value="soul">Soul</SelectItem>
                            <SelectItem value="blues">Blues</SelectItem>
                            <SelectItem value="world">World</SelectItem>
                            <SelectItem value="alternative">Alternative</SelectItem>
                            <SelectItem value="funk">Funk</SelectItem>
                            <SelectItem value="disco">Disco</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="techno">Techno</SelectItem>
                            <SelectItem value="trap">Trap</SelectItem>
                            <SelectItem value="drum-and-bass">Drum and Bass</SelectItem>
                            <SelectItem value="ambient">Ambient</SelectItem>
                            <SelectItem value="experimental">Experimental</SelectItem>
                            <SelectItem value="soundtrack">Soundtrack</SelectItem>
                            <SelectItem value="spoken-word">Spoken Word</SelectItem>
                            <SelectItem value="children">Children</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                            <SelectItem value="new-age">New Age</SelectItem>
                            <SelectItem value="religious">Religious</SelectItem>
                            <SelectItem value="comedy">Comedy</SelectItem>
                            <SelectItem value="drama">Drama</SelectItem>
                            <SelectItem value="documentary">Documentary</SelectItem>
                            <SelectItem value="sound-effects">Sound Effects</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={addTrack}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Track
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit for Review */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Submit for Review</CardTitle>
              <CardDescription>Finalize and submit your release</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={submitForReview} className="w-full sm:w-auto sm:flex-shrink-0">
              <Cloud className="h-4 w-4 mr-2" />
              Submit for Review
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once you submit your release, it will be reviewed by our team. You will receive an email notification once your release is approved.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Storage Upgrade Modal */}
      <Dialog open={showStorageModal} onOpenChange={setShowStorageModal}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Upgrade Your Storage</DialogTitle>
            <DialogDescription>
              Choose the perfect plan for your content library
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {/* Pro Plan */}
            <div
              className={cn(
                "relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg",
                selectedPlan === "pro"
                  ? "border-[#ff0050] bg-[#ff0050]/5"
                  : "border-border hover:border-[#ff0050]/50"
              )}
              onClick={() => setSelectedPlan("pro")}
            >
              <div className="absolute top-4 right-4">
                {selectedPlan === "pro" && (
                  <div className="h-6 w-6 rounded-full bg-[#ff0050] flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Pro</h3>
                  <p className="text-sm text-muted-foreground">For growing artists</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold">1 TB</p>
                <p className="text-sm text-muted-foreground mt-1">Storage capacity</p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Up to 500 releases</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Hi-res audio support</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Priority upload speed</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>90-day version history</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-2xl font-bold">$29<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </div>
            </div>

            {/* Premium Plan - Popular */}
            <div
              className={cn(
                "relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg",
                selectedPlan === "premium"
                  ? "border-[#ff0050] bg-[#ff0050]/5"
                  : "border-[#ff0050] bg-[#ff0050]/5"
              )}
              onClick={() => setSelectedPlan("premium")}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#ff0050] text-white">Most Popular</Badge>
              </div>

              <div className="absolute top-4 right-4">
                {selectedPlan === "premium" && (
                  <div className="h-6 w-6 rounded-full bg-[#ff0050] flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="h-10 w-10 rounded-lg bg-[#ff0050]/20 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-[#ff0050]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Premium</h3>
                  <p className="text-sm text-muted-foreground">For professionals</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold">3 TB</p>
                <p className="text-sm text-muted-foreground mt-1">Storage capacity</p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited releases</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Hi-res & immersive audio</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Ultra-fast upload (5x)</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>1-year version history</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-2xl font-bold">$79<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div
              className={cn(
                "relative rounded-xl border-2 p-6 cursor-pointer transition-all hover:shadow-lg",
                selectedPlan === "enterprise"
                  ? "border-[#ff0050] bg-[#ff0050]/5"
                  : "border-border hover:border-[#ff0050]/50"
              )}
              onClick={() => setSelectedPlan("enterprise")}
            >
              <div className="absolute top-4 right-4">
                {selectedPlan === "enterprise" && (
                  <div className="h-6 w-6 rounded-full bg-[#ff0050] flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Enterprise</h3>
                  <p className="text-sm text-muted-foreground">For labels & teams</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold">10 TB</p>
                <p className="text-sm text-muted-foreground mt-1">Storage capacity</p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited everything</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>All audio formats</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Maximum upload speed</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Unlimited version history</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Dedicated support</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Custom integrations</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-2xl font-bold">$199<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowStorageModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto bg-[#ff0050] hover:bg-[#cc0040]"
              disabled={!selectedPlan}
              onClick={() => {
                if (selectedPlan) {
                  const planDetails = {
                    pro: { storage: 1000, name: "Pro" },
                    premium: { storage: 3000, name: "Premium" },
                    enterprise: { storage: 10000, name: "Enterprise" },
                  };
                  const plan = planDetails[selectedPlan];
                  setCurrentStorage(plan.storage);
                  setShowStorageModal(false);
                  toast.success(`Successfully upgraded to ${plan.name} plan! You now have ${plan.storage / 1000} TB of storage.`);
                  setSelectedPlan(null);
                }
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              Upgrade to {selectedPlan ? selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1) : "Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
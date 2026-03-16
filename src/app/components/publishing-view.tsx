import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
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
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  FileMusic,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  Users,
  Building2,
  Music,
  Download,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface Composition {
  id: string;
  title: string;
  iswc: string;
  writers: Writer[];
  publishers: Publisher[];
  pro: string;
  status: "registered" | "pending" | "conflict";
  relatedReleases: number;
}

interface Writer {
  name: string;
  share: number;
  ipi: string;
  pro: string;
}

interface Publisher {
  name: string;
  share: number;
  ipi: string;
}

const compositions: Composition[] = [
  {
    id: "1",
    title: "Summer Nights",
    iswc: "T-123.456.789-0",
    writers: [
      { name: "John Smith", share: 50, ipi: "00123456789", pro: "ASCAP" },
      { name: "Jane Doe", share: 50, ipi: "00987654321", pro: "BMI" },
    ],
    publishers: [
      { name: "Cage Riot Publishing", share: 100, ipi: "00555555555" },
    ],
    pro: "ASCAP",
    status: "registered",
    relatedReleases: 1,
  },
  {
    id: "2",
    title: "Electric Dreams",
    iswc: "T-123.456.790-1",
    writers: [
      { name: "Mike Johnson", share: 33.33, ipi: "00111111111", pro: "SESAC" },
      { name: "Sarah Williams", share: 33.33, ipi: "00222222222", pro: "ASCAP" },
      { name: "Tom Brown", share: 33.34, ipi: "00333333333", pro: "BMI" },
    ],
    publishers: [
      { name: "Cage Riot Publishing", share: 50, ipi: "00555555555" },
      { name: "Dream Music Publishing", share: 50, ipi: "00666666666" },
    ],
    pro: "ASCAP",
    status: "pending",
    relatedReleases: 2,
  },
  {
    id: "3",
    title: "Midnight City",
    iswc: "T-123.456.791-2",
    writers: [
      { name: "Alex Turner", share: 100, ipi: "00444444444", pro: "PRS" },
    ],
    publishers: [],
    pro: "PRS",
    status: "conflict",
    relatedReleases: 1,
  },
];

export function PublishingView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registered":
        return (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Registered
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "conflict":
        return (
          <Badge className="bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Conflict
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
          <h1 className="text-3xl font-semibold tracking-tight">Publishing</h1>
          <p className="text-muted-foreground mt-1">
            Manage compositions, songwriter splits, and publisher information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#ff0050] hover:bg-[#cc0040]">
                <Plus className="h-4 w-4 mr-2" />
                New Composition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Composition</DialogTitle>
                <DialogDescription>
                  Add composition metadata and songwriter/publisher splits
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="compTitle">Composition Title</Label>
                    <Input id="compTitle" placeholder="Enter song title" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="iswc">ISWC</Label>
                      <Input id="iswc" placeholder="T-123.456.789-0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pro">Primary PRO</Label>
                      <Select>
                        <SelectTrigger id="pro">
                          <SelectValue placeholder="Select PRO" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ascap">ASCAP</SelectItem>
                          <SelectItem value="bmi">BMI</SelectItem>
                          <SelectItem value="sesac">SESAC</SelectItem>
                          <SelectItem value="prs">PRS</SelectItem>
                          <SelectItem value="socan">SOCAN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Songwriters</Label>
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Writer
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-5">
                        <Input placeholder="Writer name" />
                      </div>
                      <div className="col-span-3">
                        <Input placeholder="IPI Number" />
                      </div>
                      <div className="col-span-2">
                        <Input placeholder="Share %" type="number" />
                      </div>
                      <div className="col-span-2">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="PRO" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ascap">ASCAP</SelectItem>
                            <SelectItem value="bmi">BMI</SelectItem>
                            <SelectItem value="sesac">SESAC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Publishers</Label>
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Publisher
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-6">
                        <Input placeholder="Publisher name" />
                      </div>
                      <div className="col-span-4">
                        <Input placeholder="IPI Number" />
                      </div>
                      <div className="col-span-2">
                        <Input placeholder="Share %" type="number" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-[#ff0050] hover:bg-[#cc0040]">
                    Register Composition
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Compositions</p>
                <p className="text-2xl font-semibold mt-1">847</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <FileMusic className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registered</p>
                <p className="text-2xl font-semibold mt-1">789</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold mt-1">52</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conflicts</p>
                <p className="text-2xl font-semibold mt-1">6</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, ISWC, writer, or publisher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="conflict">Conflicts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Compositions List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Compositions</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="pending">Pending Registration</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {compositions.map((comp) => (
            <Card key={comp.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{comp.title}</h3>
                      {getStatusBadge(comp.status)}
                      <Badge variant="outline" className="text-xs">
                        ISWC: {comp.iswc}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        {comp.relatedReleases} {comp.relatedReleases === 1 ? 'release' : 'releases'}
                      </span>
                      <span>PRO: {comp.pro}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Songwriters */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Songwriters
                    </div>
                    <div className="space-y-2">
                      {comp.writers.map((writer, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{writer.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">
                                IPI: {writer.ipi}
                              </span>
                              <Badge variant="outline" className="text-xs h-5">
                                {writer.pro}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{writer.share}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Publishers */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      Publishers
                    </div>
                    {comp.publishers.length > 0 ? (
                      <div className="space-y-2">
                        {comp.publishers.map((publisher, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">{publisher.name}</p>
                              <span className="text-xs text-muted-foreground">
                                IPI: {publisher.ipi}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{publisher.share}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center border rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">No publishers assigned</p>
                      </div>
                    )}
                  </div>
                </div>

                {comp.status === "conflict" && (
                  <div className="mt-4 p-4 rounded-lg bg-[#ff0050]/10 border border-[#ff0050]/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-[#ff0050] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#ff0050]">Conflict Detected</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Split percentages don't add up to 100%. Please review and correct the songwriter splits.
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="border-[#ff0050] text-[#ff0050] hover:bg-[#ff0050] hover:text-white">
                        Resolve
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="conflicts">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {compositions.filter(c => c.status === "conflict").length} composition(s) with conflicts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {compositions.filter(c => c.status === "pending").length} composition(s) pending registration
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

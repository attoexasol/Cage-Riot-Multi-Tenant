import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Users,
  Plus,
  Search,
  Edit,
  Eye,
  Mail,
  Phone,
  FileText,
  MoreVertical,
  Music,
  DollarSign,
  TrendingUp,
  Star,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface Artist {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "pending";
  releases: number;
  totalStreams: number;
  revenue: number;
  contractType: "exclusive" | "non-exclusive" | "distribution";
  joinDate: string;
}

const artists: Artist[] = [
  {
    id: "1",
    name: "The Waves",
    avatar: "",
    email: "contact@thewaves.com",
    phone: "+1 (555) 123-4567",
    status: "active",
    releases: 24,
    totalStreams: 3200000,
    revenue: 12800,
    contractType: "exclusive",
    joinDate: "2024-03-15",
  },
  {
    id: "2",
    name: "Neon City",
    avatar: "",
    email: "info@neoncity.music",
    phone: "+1 (555) 234-5678",
    status: "active",
    releases: 18,
    totalStreams: 2800000,
    revenue: 11200,
    contractType: "exclusive",
    joinDate: "2024-06-22",
  },
  {
    id: "3",
    name: "Urban Sound",
    avatar: "",
    email: "urban@soundcollective.com",
    phone: "+1 (555) 345-6789",
    status: "active",
    releases: 15,
    totalStreams: 1900000,
    revenue: 7600,
    contractType: "non-exclusive",
    joinDate: "2024-09-10",
  },
  {
    id: "4",
    name: "Coast Collective",
    avatar: "",
    email: "hello@coastcollective.net",
    phone: "+1 (555) 456-7890",
    status: "pending",
    releases: 0,
    totalStreams: 0,
    revenue: 0,
    contractType: "distribution",
    joinDate: "2026-01-20",
  },
  {
    id: "5",
    name: "Synth Wave",
    avatar: "",
    email: "contact@synthwave.io",
    phone: "+1 (555) 567-8901",
    status: "inactive",
    releases: 12,
    totalStreams: 850000,
    revenue: 3400,
    contractType: "non-exclusive",
    joinDate: "2023-11-05",
  },
];

export function ArtistsView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary">
            Inactive
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getContractBadge = (type: string) => {
    const colors = {
      exclusive: "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20",
      "non-exclusive": "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
      distribution: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-500 border-cyan-500/20",
    };
    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {type.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Artists</h1>
          <p className="text-muted-foreground mt-1">
            Manage artist profiles, contracts, and catalog assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#ff0050] hover:bg-[#cc0040]">
                <Plus className="h-4 w-4 mr-2" />
                Add Artist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Artist</DialogTitle>
                <DialogDescription>
                  Create a new artist profile and assign contract details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="artistName">Artist Name</Label>
                    <Input id="artistName" placeholder="Enter artist or band name" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="artist@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Contract Type</Label>
                    <Select>
                      <SelectTrigger id="contractType">
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exclusive">Exclusive</SelectItem>
                        <SelectItem value="non-exclusive">Non-Exclusive</SelectItem>
                        <SelectItem value="distribution">Distribution Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue="pending">
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-[#ff0050] hover:bg-[#cc0040]">
                    Create Artist
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
                <p className="text-sm text-muted-foreground">Total Artists</p>
                <p className="text-2xl font-semibold mt-1">{artists.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-semibold mt-1">
                  {artists.filter(a => a.status === "active").length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Releases</p>
                <p className="text-2xl font-semibold mt-1">
                  {artists.reduce((sum, a) => sum + a.releases, 0)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Music className="h-5 w-5 text-blue-500" />
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
                  ${artists.reduce((sum, a) => sum + a.revenue, 0).toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by artist name, email, or phone..."
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-contracts">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-contracts">All Contracts</SelectItem>
                <SelectItem value="exclusive">Exclusive</SelectItem>
                <SelectItem value="non-exclusive">Non-Exclusive</SelectItem>
                <SelectItem value="distribution">Distribution</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Artists</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {artists.map((artist) => (
            <Card key={artist.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={artist.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-[#ff0050] to-[#cc0040] text-white text-lg">
                      {artist.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Artist Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold">{artist.name}</h3>
                          {getStatusBadge(artist.status)}
                          {getContractBadge(artist.contractType)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {artist.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {artist.phone}
                          </span>
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
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            View Contract
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Releases</p>
                        <p className="text-xl font-semibold">{artist.releases}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Streams</p>
                        <p className="text-xl font-semibold">
                          {(artist.totalStreams / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                        <p className="text-xl font-semibold">
                          ${artist.revenue.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                        <p className="text-sm font-medium">
                          {new Date(artist.joinDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Star className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-50" />
                <p className="text-muted-foreground">
                  {artists.filter(a => a.status === "active").length} active artist(s)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-3 text-orange-500 opacity-50" />
                <p className="text-muted-foreground">
                  {artists.filter(a => a.status === "pending").length} pending artist(s)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
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
  Building2,
  Plus,
  Edit,
  Trash2,
  Users,
  Music,
  DollarSign,
  CheckCircle2,
  XCircle,
  Settings,
  Palette,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: "starter" | "pro" | "enterprise";
  status: "active" | "trial" | "cancelled";
  userCount: number;
  releaseCount: number;
  monthlyRevenue: number;
  createdAt: string;
  primaryColor: string;
}

const mockTenants: Tenant[] = [
  {
    id: "1",
    name: "Cage Riot",
    slug: "cage-riot",
    plan: "enterprise",
    status: "active",
    userCount: 12,
    releaseCount: 156,
    monthlyRevenue: 12500,
    createdAt: "2025-01-01",
    primaryColor: "#ff0050",
  },
  {
    id: "2",
    name: "Indie Label Co",
    slug: "indie-label",
    plan: "pro",
    status: "active",
    userCount: 8,
    releaseCount: 89,
    monthlyRevenue: 4200,
    createdAt: "2025-03-15",
    primaryColor: "#3b82f6",
  },
  {
    id: "3",
    name: "Urban Sounds",
    slug: "urban-sounds",
    plan: "pro",
    status: "active",
    userCount: 5,
    releaseCount: 67,
    monthlyRevenue: 3800,
    createdAt: "2025-05-20",
    primaryColor: "#8b5cf6",
  },
  {
    id: "4",
    name: "Electronic Records",
    slug: "electronic-records",
    plan: "starter",
    status: "trial",
    userCount: 3,
    releaseCount: 12,
    monthlyRevenue: 0,
    createdAt: "2026-01-15",
    primaryColor: "#10b981",
  },
];

export function TenantManagement() {
  const [tenants, setTenants] = useState(mockTenants);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // Create form
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createPlan, setCreatePlan] = useState("");
  const [createColor, setCreateColor] = useState("#ff0050");

  // Edit form
  const [editName, setEditName] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreateTenant = () => {
    if (!createName || !createSlug || !createPlan) {
      toast.error("Please fill all required fields");
      return;
    }

    const newTenant: Tenant = {
      id: String(tenants.length + 1),
      name: createName,
      slug: createSlug,
      plan: createPlan as any,
      status: "trial",
      userCount: 0,
      releaseCount: 0,
      monthlyRevenue: 0,
      createdAt: new Date().toISOString().split("T")[0],
      primaryColor: createColor,
    };

    setTenants([...tenants, newTenant]);
    toast.success(`Created tenant: ${createName}`);
    setShowCreateDialog(false);
    setCreateName("");
    setCreateSlug("");
    setCreatePlan("");
    setCreateColor("#ff0050");
  };

  const handleEditTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    setEditName(tenant.name);
    setEditPlan(tenant.plan);
    setEditStatus(tenant.status);
    setEditColor(tenant.primaryColor);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (currentTenant) {
      setTenants(
        tenants.map((t) =>
          t.id === currentTenant.id
            ? {
                ...t,
                name: editName,
                plan: editPlan as any,
                status: editStatus as any,
                primaryColor: editColor,
              }
            : t
        )
      );
      toast.success(`Updated ${editName}`);
      setShowEditDialog(false);
      setCurrentTenant(null);
    }
  };

  const handleDeleteTenant = (id: string) => {
    if (confirm(`Are you sure you want to delete this tenant? This action cannot be undone.`)) {
      setTenants(tenants.filter((t) => t.id !== id));
      toast.success(`Deleted tenant`);
    }
  };

  const getPlanBadge = (plan: Tenant["plan"]) => {
    const variants = {
      starter: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      pro: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      enterprise: "bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20",
    };

    return (
      <Badge variant="secondary" className={variants[plan]}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: Tenant["status"]) => {
    const variants = {
      active: { bg: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
      trial: { bg: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: <Shield className="h-3 w-3 mr-1" /> },
      cancelled: { bg: "bg-red-500/10 text-red-600 border-red-500/20", icon: <XCircle className="h-3 w-3 mr-1" /> },
    };

    const variant = variants[status];

    return (
      <Badge variant="secondary" className={variant.bg}>
        {variant.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalUsers = tenants.reduce((sum, t) => sum + t.userCount, 0);
  const totalReleases = tenants.reduce((sum, t) => sum + t.releaseCount, 0);
  const totalRevenue = tenants.reduce((sum, t) => sum + t.monthlyRevenue, 0);
  const activeCount = tenants.filter((t) => t.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
                <p className="text-2xl font-semibold mt-1">{tenants.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tenants</p>
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
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-semibold mt-1">{totalUsers}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-semibold mt-1">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#ff0050]/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#ff0050]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Tenants</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage organizations and their subscriptions
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-[#ff0050] hover:bg-[#cc0040] w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Tenant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="hover:border-[#ff0050]/20 transition-colors">
            <CardHeader>
              <div className="flex flex-col xl:flex-row items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 max-w-full overflow-hidden">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                    style={{ backgroundColor: tenant.primaryColor }}
                  >
                    {tenant.name.charAt(0)}
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <CardTitle className="text-lg truncate">{tenant.name}</CardTitle>
                    <CardDescription className="truncate">/{tenant.slug}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full xl:w-auto flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTenant(tenant)}
                    className="flex-1 xl:flex-none cursor-pointer"
                  >
                    <Edit className="h-4 w-4 xl:mr-2" />
                    <span className="hidden xl:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTenantToDelete(tenant);
                      setShowDeleteDialog(true);
                    }}
                    className="flex-1 xl:flex-none cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 xl:mr-2" />
                    <span className="hidden xl:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Plan & Status */}
                <div className="flex items-center gap-2 flex-wrap">
                  {getPlanBadge(tenant.plan)}
                  {getStatusBadge(tenant.status)}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <p className="text-xs">Users</p>
                    </div>
                    <p className="text-lg font-semibold">{tenant.userCount}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Music className="h-4 w-4" />
                      <p className="text-xs">Releases</p>
                    </div>
                    <p className="text-lg font-semibold">{tenant.releaseCount}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      <p className="text-xs">Revenue</p>
                    </div>
                    <p className="text-lg font-semibold">
                      ${tenant.monthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(tenant.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Tenant Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Tenant</DialogTitle>
            <DialogDescription>
              Add a new organization to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Name *</label>
              <Input
                placeholder="e.g., Indie Label Co"
                value={createName}
                onChange={(e) => {
                  setCreateName(e.target.value);
                  setCreateSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subdomain/Slug *</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="indie-label"
                  value={createSlug}
                  onChange={(e) => setCreateSlug(e.target.value)}
                />
                <span className="text-sm text-muted-foreground">.cageriot.com</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription Plan *</label>
              <Select value={createPlan} onValueChange={setCreatePlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter - $29/month</SelectItem>
                  <SelectItem value="pro">Pro - $99/month</SelectItem>
                  <SelectItem value="enterprise">Enterprise - $299/month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={createColor}
                  onChange={(e) => setCreateColor(e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <Input value={createColor} onChange={(e) => setCreateColor(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTenant}
              className="bg-[#ff0050] hover:bg-[#cc0040]"
              disabled={!createName || !createSlug || !createPlan}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant settings for {currentTenant?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: currentTenant?.primaryColor }}
                >
                  {currentTenant?.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{currentTenant?.name}</p>
                  <p className="text-sm text-muted-foreground">/{currentTenant?.slug}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription Plan</label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter - $29/month</SelectItem>
                  <SelectItem value="pro">Pro - $99/month</SelectItem>
                  <SelectItem value="enterprise">Enterprise - $299/month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <Input value={editColor} onChange={(e) => setEditColor(e.target.value)} />
                <Button variant="outline" size="sm">
                  <Palette className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg border">
              <p className="text-sm font-medium mb-2">Tenant Metrics</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Users</p>
                  <p className="font-semibold">{currentTenant?.userCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Releases</p>
                  <p className="font-semibold">{currentTenant?.releaseCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-semibold">${currentTenant?.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#ff0050] hover:bg-[#cc0040]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tenant Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <DialogTitle>Delete Tenant</DialogTitle>
              </div>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to delete <span className="font-semibold text-foreground">{tenantToDelete?.name}</span>? This action cannot be undone and will permanently remove:
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{tenantToDelete?.userCount} users</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Music className="h-4 w-4 text-muted-foreground" />
                <span>{tenantToDelete?.releaseCount} releases</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>${tenantToDelete?.monthlyRevenue.toLocaleString()} monthly revenue</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ⚠️ This will permanently delete all data associated with this tenant.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (tenantToDelete) {
                  setTenants(tenants.filter((t) => t.id !== tenantToDelete.id));
                  toast.success(`Deleted ${tenantToDelete.name}`);
                }
                setShowDeleteDialog(false);
                setTenantToDelete(null);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
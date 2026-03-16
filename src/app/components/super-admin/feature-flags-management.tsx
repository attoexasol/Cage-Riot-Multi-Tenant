import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Flag, Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { toast } from "sonner";

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  scope: "platform" | "account" | "user";
  rolloutPercentage: number;
  accountIds?: string[];
  createdAt: string;
  updatedAt: string;
}

const mockFeatureFlags: FeatureFlag[] = [
  {
    id: "1",
    name: "Enhanced Analytics Dashboard",
    key: "enhanced_analytics",
    description: "New analytics dashboard with advanced reporting and visualizations",
    enabled: true,
    scope: "platform",
    rolloutPercentage: 100,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-02-01T14:30:00Z",
  },
  {
    id: "2",
    name: "AI-Powered Content Recognition",
    key: "ai_content_recognition",
    description: "Advanced AI features for audio fingerprinting and content matching",
    enabled: true,
    scope: "account",
    rolloutPercentage: 50,
    accountIds: ["ent-001", "ent-002"],
    createdAt: "2025-02-10T09:00:00Z",
    updatedAt: "2025-02-20T11:15:00Z",
  },
  {
    id: "3",
    name: "Bulk Upload Tool",
    key: "bulk_upload",
    description: "Upload and manage multiple releases simultaneously",
    enabled: false,
    scope: "platform",
    rolloutPercentage: 0,
    createdAt: "2025-01-20T08:00:00Z",
    updatedAt: "2025-01-20T08:00:00Z",
  },
  {
    id: "4",
    name: "White Label Customization",
    key: "white_label",
    description: "Full branding customization for enterprise accounts",
    enabled: true,
    scope: "account",
    rolloutPercentage: 100,
    accountIds: ["ent-001"],
    createdAt: "2025-01-05T12:00:00Z",
    updatedAt: "2025-02-15T16:45:00Z",
  },
  {
    id: "5",
    name: "Beta Features Access",
    key: "beta_features",
    description: "Early access to beta features and experimental functionality",
    enabled: true,
    scope: "user",
    rolloutPercentage: 25,
    createdAt: "2025-02-01T10:00:00Z",
    updatedAt: "2025-03-01T09:30:00Z",
  },
];

export function FeatureFlagsManagement() {
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFeatureFlags);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScope, setFilterScope] = useState<"all" | "platform" | "account" | "user">("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  const filteredFlags = flags.filter((flag) => {
    const matchesSearch =
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesScope = filterScope === "all" || flag.scope === filterScope;

    return matchesSearch && matchesScope;
  });

  const handleToggleFlag = (flagId: string) => {
    setFlags((prev) =>
      prev.map((flag) => {
        if (flag.id === flagId) {
          const newEnabled = !flag.enabled;
          
          // Log audit event
          console.log("AUDIT LOG:", {
            action: "FEATURE_FLAG_TOGGLED",
            flagId: flag.id,
            flagKey: flag.key,
            previousState: flag.enabled,
            newState: newEnabled,
            timestamp: new Date().toISOString(),
          });

          toast.success(
            `Feature flag "${flag.name}" ${newEnabled ? "enabled" : "disabled"}`
          );

          return { ...flag, enabled: newEnabled, updatedAt: new Date().toISOString() };
        }
        return flag;
      })
    );
  };

  const handleDeleteFlag = (flagId: string) => {
    const flag = flags.find((f) => f.id === flagId);
    if (!flag) return;

    if (confirm(`Are you sure you want to delete the feature flag "${flag.name}"?`)) {
      setFlags((prev) => prev.filter((f) => f.id !== flagId));

      // Log audit event
      console.log("AUDIT LOG:", {
        action: "FEATURE_FLAG_DELETED",
        flagId: flag.id,
        flagKey: flag.key,
        timestamp: new Date().toISOString(),
      });

      toast.success(`Feature flag "${flag.name}" deleted`);
    }
  };

  const getScopeBadgeColor = (scope: string) => {
    switch (scope) {
      case "platform":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "account":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "user":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "";
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Flag className="h-6 w-6 text-[#ff0050]" />
            Feature Flags Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control platform features and rollout configurations
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingFlag(null);
            setShowCreateDialog(true);
          }}
          className="bg-[#ff0050] hover:bg-[#cc0040]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Feature Flag
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search feature flags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterScope} onValueChange={(value: any) => setFilterScope(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Flags</div>
            <div className="text-2xl font-semibold mt-1">{flags.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Enabled</div>
            <div className="text-2xl font-semibold mt-1 text-green-500">
              {flags.filter((f) => f.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Platform Wide</div>
            <div className="text-2xl font-semibold mt-1 text-blue-500">
              {flags.filter((f) => f.scope === "platform").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Account Specific</div>
            <div className="text-2xl font-semibold mt-1 text-purple-500">
              {flags.filter((f) => f.scope === "account").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags ({filteredFlags.length})</CardTitle>
          <CardDescription>Manage feature availability and rollout settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Rollout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No feature flags found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlags.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{flag.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {flag.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{flag.key}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getScopeBadgeColor(flag.scope)}>
                          {flag.scope}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-[#ff0050] h-2 rounded-full transition-all"
                              style={{ width: `${flag.rolloutPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {flag.rolloutPercentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => handleToggleFlag(flag.id)}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(flag.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingFlag(flag);
                              setShowCreateDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFlag(flag.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <FeatureFlagDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        flag={editingFlag}
        onSave={(flag) => {
          if (editingFlag) {
            // Update existing flag
            setFlags((prev) =>
              prev.map((f) => (f.id === editingFlag.id ? { ...flag, id: f.id } : f))
            );
            toast.success(`Feature flag "${flag.name}" updated`);
          } else {
            // Create new flag
            setFlags((prev) => [...prev, { ...flag, id: Date.now().toString() }]);
            toast.success(`Feature flag "${flag.name}" created`);
          }
          setShowCreateDialog(false);
          setEditingFlag(null);
        }}
      />
    </div>
  );
}

interface FeatureFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flag: FeatureFlag | null;
  onSave: (flag: FeatureFlag) => void;
}

function FeatureFlagDialog({ open, onOpenChange, flag, onSave }: FeatureFlagDialogProps) {
  const [formData, setFormData] = useState<Partial<FeatureFlag>>(
    flag || {
      name: "",
      key: "",
      description: "",
      enabled: false,
      scope: "platform",
      rolloutPercentage: 0,
      accountIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.key || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSave(formData as FeatureFlag);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{flag ? "Edit Feature Flag" : "Create Feature Flag"}</DialogTitle>
          <DialogDescription>
            {flag
              ? "Update feature flag settings and rollout configuration"
              : "Create a new feature flag to control platform functionality"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Feature Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enhanced Analytics Dashboard"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">
              Feature Key <span className="text-red-500">*</span>
            </Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                })
              }
              placeholder="enhanced_analytics"
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier used in code (lowercase, underscores only)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of what this feature does..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <Select
                value={formData.scope}
                onValueChange={(value: any) => setFormData({ ...formData, scope: value })}
              >
                <SelectTrigger id="scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Platform Wide</SelectItem>
                  <SelectItem value="account">Account Specific</SelectItem>
                  <SelectItem value="user">User Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollout">Rollout Percentage</Label>
              <Input
                id="rollout"
                type="number"
                min="0"
                max="100"
                value={formData.rolloutPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {formData.scope === "account" && (
            <div className="space-y-2">
              <Label htmlFor="accountIds">Account IDs (comma-separated)</Label>
              <Input
                id="accountIds"
                value={formData.accountIds?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accountIds: e.target.value.split(",").map((id) => id.trim()),
                  })
                }
                placeholder="ent-001, ent-002"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
              />
              <Label htmlFor="enabled">Enable this feature flag</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#ff0050] hover:bg-[#cc0040]">
              {flag ? "Update" : "Create"} Feature Flag
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

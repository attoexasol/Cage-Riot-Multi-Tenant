import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Switch } from "@/app/components/ui/switch";
import { Badge } from "@/app/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Mail, User, Lock, Building2, Shield, X } from "lucide-react";
import type { UserRole, AccountType } from "@/app/components/auth/auth-context";

interface CreateUserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated?: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  accountType: AccountType;
  accountId: string;
  artistId?: string;
  twoFactorEnabled: boolean;
  sendInviteEmail: boolean;
}

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  {
    value: "platform-super-admin",
    label: "Platform Super Admin",
    description: "Full platform access with all privileges",
  },
  {
    value: "admin",
    label: "Enterprise Admin",
    description: "Full access to enterprise account",
  },
  {
    value: "operations",
    label: "Operations",
    description: "Manage deliveries, QC, and distribution",
  },
  {
    value: "legal",
    label: "Legal",
    description: "Manage contracts, disputes, and compliance",
  },
  {
    value: "finance",
    label: "Finance",
    description: "Manage royalties, payments, and reporting",
  },
  {
    value: "artist-owner",
    label: "Artist Owner",
    description: "Full access to artist profile",
  },
  {
    value: "artist-viewer",
    label: "Artist Viewer",
    description: "Read-only access to artist profile",
  },
  {
    value: "account-owner",
    label: "Account Owner",
    description: "Standard account owner",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only standard account access",
  },
];

export function CreateUserForm({ open, onOpenChange, onUserCreated }: CreateUserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "account-owner",
    accountType: "standard",
    accountId: "",
    twoFactorEnabled: false,
    sendInviteEmail: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password && !formData.sendInviteEmail) {
      newErrors.password = "Password is required when not sending invite email";
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.accountId.trim()) {
      newErrors.accountId = "Account ID is required";
    }

    if ((formData.role === "artist-owner" || formData.role === "artist-viewer") && !formData.artistId?.trim()) {
      newErrors.artistId = "Artist ID is required for artist roles";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In production, this would be an API call
      console.log("Creating user:", formData);

      // Log audit event
      console.log("AUDIT LOG:", {
        action: "USER_CREATED",
        timestamp: new Date().toISOString(),
        details: {
          email: formData.email,
          role: formData.role,
          accountType: formData.accountType,
          accountId: formData.accountId,
        },
      });

      toast.success(`User ${formData.email} created successfully!`);

      if (formData.sendInviteEmail) {
        toast.info(`Invitation email sent to ${formData.email}`);
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "account-owner",
        accountType: "standard",
        accountId: "",
        twoFactorEnabled: false,
        sendInviteEmail: true,
      });

      setErrors({});
      onUserCreated?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role,
      // Auto-set account type based on role
      accountType:
        role === "platform-super-admin" ||
        role === "admin" ||
        role === "operations" ||
        role === "legal" ||
        role === "finance" ||
        role === "artist-owner" ||
        role === "artist-viewer"
          ? "enterprise"
          : "standard",
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#ff0050]" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Add a new user to the platform. All privileged actions are audit logged.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Anderson"
                    className="pl-10"
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="pl-10"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {!formData.sendInviteEmail && <span className="text-red-500">*</span>}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={formData.sendInviteEmail ? "Optional (auto-generated)" : "Minimum 8 characters"}
                    className="pl-10"
                    disabled={formData.sendInviteEmail}
                  />
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                <p className="text-xs text-muted-foreground">
                  {formData.sendInviteEmail
                    ? "A temporary password will be generated and sent via email"
                    : "User will use this password for first login"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Role & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">
                  User Role <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={formData.accountType === "enterprise" ? "default" : "secondary"}
                  className={
                    formData.accountType === "enterprise"
                      ? "bg-[#ff0050]"
                      : ""
                  }
                >
                  {formData.accountType === "enterprise" ? "Enterprise" : "Standard"} Account
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {roleOptions.find((r) => r.value === formData.role)?.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Account Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountId">
                  Account ID <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="accountId"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    placeholder="ent-001, std-001, etc."
                    className="pl-10"
                  />
                </div>
                {errors.accountId && <p className="text-sm text-red-500">{errors.accountId}</p>}
                <p className="text-xs text-muted-foreground">
                  The account this user belongs to (e.g., ent-001 for enterprise, std-001 for standard)
                </p>
              </div>

              {(formData.role === "artist-owner" || formData.role === "artist-viewer") && (
                <div className="space-y-2">
                  <Label htmlFor="artistId">
                    Artist ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="artistId"
                    value={formData.artistId || ""}
                    onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                    placeholder="artist-001"
                  />
                  {errors.artistId && <p className="text-sm text-red-500">{errors.artistId}</p>}
                  <p className="text-xs text-muted-foreground">
                    Required for artist-level roles to scope data access
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twoFactor">Enable Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Require 2FA for additional security
                  </p>
                </div>
                <Switch
                  id="twoFactor"
                  checked={formData.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, twoFactorEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sendInvite">Send Invitation Email</Label>
                  <p className="text-xs text-muted-foreground">
                    Send account setup link via email
                  </p>
                </div>
                <Switch
                  id="sendInvite"
                  checked={formData.sendInviteEmail}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, sendInviteEmail: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#ff0050] hover:bg-[#cc0040]">
              {isSubmitting ? (
                <>Creating User...</>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

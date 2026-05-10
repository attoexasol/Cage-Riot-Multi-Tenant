import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Mail,
  Key,
  LogOut,
  CheckSquare,
  Square,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";
import { CreateUserForm } from "@/app/components/super-admin/create-user-form";
import { RoleBadge } from "@/app/components/ui/role-badge";
import type { UserRole, AccountType } from "@/app/components/auth/auth-context";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenant: string;
  status: "active" | "inactive" | "pending";
  lastLogin: string;
  createdAt: string;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Anderson",
    email: "john@cageriot.com",
    role: "admin",
    tenant: "Cage Riot",
    status: "active",
    lastLogin: "2026-01-30T14:30:00",
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.chen@cageriot.com",
    role: "operations",
    tenant: "Cage Riot",
    status: "active",
    lastLogin: "2026-01-30T13:00:00",
    createdAt: "2025-02-20",
  },
  {
    id: "3",
    name: "Michael Torres",
    email: "michael@cageriot.com",
    role: "legal",
    tenant: "Cage Riot",
    status: "active",
    lastLogin: "2026-01-30T10:15:00",
    createdAt: "2025-03-10",
  },
  {
    id: "4",
    name: "Emma Williams",
    email: "emma@cageriot.com",
    role: "finance",
    tenant: "Cage Riot",
    status: "active",
    lastLogin: "2026-01-30T09:30:00",
    createdAt: "2025-04-05",
  },
  {
    id: "5",
    name: "The Waves",
    email: "waves@artist.com",
    role: "artist",
    tenant: "Indie Label Co",
    status: "active",
    lastLogin: "2026-01-29T20:00:00",
    createdAt: "2025-06-12",
  },
  {
    id: "6",
    name: "Neon City",
    email: "neon@artist.com",
    role: "artist",
    tenant: "Urban Sounds",
    status: "active",
    lastLogin: "2026-01-29T18:45:00",
    createdAt: "2025-07-22",
  },
  {
    id: "7",
    name: "Alex Johnson",
    email: "alex@pending.com",
    role: "artist",
    tenant: "Cage Riot",
    status: "pending",
    lastLogin: "Never",
    createdAt: "2026-01-28",
  },
  {
    id: "8",
    name: "Lisa Martinez",
    email: "lisa@inactive.com",
    role: "operations",
    tenant: "Cage Riot",
    status: "inactive",
    lastLogin: "2025-12-15T10:00:00",
    createdAt: "2025-05-18",
  },
];

export function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteTenant, setInviteTenant] = useState("");

  // Edit form
  const [editRole, setEditRole] = useState("");
  const [editTenant, setEditTenant] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.tenant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const inactiveCount = users.filter((u) => u.status === "inactive").length;

  const toggleSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const handleInviteUser = () => {
    if (!inviteEmail || !inviteRole || !inviteTenant) {
      toast.error("Please fill all fields");
      return;
    }

    const newUser: User = {
      id: String(users.length + 1),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole as any,
      tenant: inviteTenant,
      status: "pending",
      lastLogin: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsers([...users, newUser]);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setShowInviteDialog(false);
    setInviteEmail("");
    setInviteRole("");
    setInviteTenant("");
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setEditRole(user.role);
    setEditTenant(user.tenant);
    setEditStatus(user.status);
    setShowEditDrawer(true);
  };

  const handleSaveEdit = () => {
    if (currentUser) {
      setUsers(
        users.map((u) =>
          u.id === currentUser.id
            ? { ...u, role: editRole as any, tenant: editTenant, status: editStatus as any }
            : u
        )
      );
      toast.success(`Updated ${currentUser.name}`);
      setShowEditDrawer(false);
      setCurrentUser(null);
    }
  };

  const handleDeleteUser = (user: User) => {
    setUsers(users.filter((u) => u.id !== user.id));
    toast.success(`Deleted ${user.name}`);
  };

  const handleBulkAction = (action: string) => {
    toast.success(`Applied ${action} to ${selectedUsers.length} users`);
    setSelectedUsers([]);
  };

  const getStatusBadge = (status: User["status"]) => {
    const variants = {
      active: { bg: "bg-green-500/10 text-green-600 border-green-500/20", icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
      inactive: { bg: "bg-gray-500/10 text-gray-600 border-gray-500/20", icon: <XCircle className="h-3 w-3 mr-1" /> },
      pending: { bg: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: <Clock className="h-3 w-3 mr-1" /> },
    };

    const variant = variants[status];

    return (
      <Badge variant="secondary" className={variant.bg}>
        {variant.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-semibold mt-1">{users.length}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
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
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-semibold mt-1">{inactiveCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or tenant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="artist">Artist</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setShowInviteDialog(true)} className="bg-[#ff0050] hover:bg-[#cc0040]">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selection Bar */}
      {selectedUsers.length > 0 && (
        <Card className="border-[#ff0050]/20 bg-[#ff0050]/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckSquare className="h-5 w-5 text-[#ff0050]" />
                <div>
                  <p className="font-medium">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedUsers([])}>
                  Clear Selection
                </Button>
                <Button variant="outline" onClick={() => handleBulkAction("activate")}>
                  Activate
                </Button>
                <Button variant="outline" onClick={() => handleBulkAction("deactivate")}>
                  Deactivate
                </Button>
                <Button variant="destructive" onClick={() => handleBulkAction("delete")}>
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={selectAll} className="flex-1 sm:flex-none cursor-pointer">
                {selectedUsers.length === filteredUsers.length ? (
                  <>
                    <Square className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Deselect All</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Select All</span>
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none cursor-pointer">
                <Upload className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Import CSV</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-start gap-3 sm:gap-4 p-4 rounded-lg border transition-all",
                    selectedUsers.includes(user.id) && "border-[#ff0050] bg-[#ff0050]/5"
                  )}
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleSelection(user.id)}
                    className="mt-1"
                  />

                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff0050] to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Mobile Layout - Vertical Stack */}
                    <div className="md:hidden space-y-3">
                      {/* User Info */}
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <RoleBadge role={user.role} />
                          {getStatusBadge(user.status)}
                        </div>
                      </div>

                      {/* Tenant */}
                      <div>
                        <p className="text-xs text-muted-foreground">Tenant</p>
                        <p className="text-sm font-medium mt-0.5">{user.tenant}</p>
                      </div>

                      {/* Last Login */}
                      <div>
                        <p className="text-xs text-muted-foreground">Last Login</p>
                        <p className="text-sm font-medium mt-0.5">
                          {user.lastLogin === "Never"
                            ? "Never"
                            : new Date(user.lastLogin).toLocaleString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end pt-2 border-t">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="cursor-pointer">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)} className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info(`Reset password for ${user.name}`)} className="cursor-pointer">
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info(`Force logout ${user.name}`)} className="cursor-pointer">
                              <LogOut className="h-4 w-4 mr-2" />
                              Force Logout
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info(`Email ${user.name}`)} className="cursor-pointer">
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Desktop Layout - Grid */}
                    <div className="hidden md:grid md:grid-cols-5 gap-4">
                      {/* User Info */}
                      <div className="col-span-2">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <RoleBadge role={user.role} />
                          {getStatusBadge(user.status)}
                        </div>
                      </div>

                      {/* Tenant */}
                      <div>
                        <p className="text-sm text-muted-foreground">Tenant</p>
                        <p className="text-sm font-medium">{user.tenant}</p>
                      </div>

                      {/* Last Login */}
                      <div>
                        <p className="text-sm text-muted-foreground">Last Login</p>
                        <p className="text-sm font-medium">
                          {user.lastLogin === "Never"
                            ? "Never"
                            : new Date(user.lastLogin).toLocaleString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="cursor-pointer">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)} className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info(`Reset password for ${user.name}`)} className="cursor-pointer">
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info(`Force logout ${user.name}`)} className="cursor-pointer">
                              <LogOut className="h-4 w-4 mr-2" />
                              Force Logout
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info(`Email ${user.name}`)} className="cursor-pointer">
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No users found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new user
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address *</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role *</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="artist">Artist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tenant *</label>
              <Select value={inviteTenant} onValueChange={setInviteTenant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cage Riot">Cage Riot</SelectItem>
                  <SelectItem value="Indie Label Co">Indie Label Co</SelectItem>
                  <SelectItem value="Urban Sounds">Urban Sounds</SelectItem>
                  <SelectItem value="Electronic Records">Electronic Records</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInviteUser}
              className="bg-[#ff0050] hover:bg-[#cc0040]"
              disabled={!inviteEmail || !inviteRole || !inviteTenant}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDrawer} onOpenChange={setShowEditDrawer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {currentUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#ff0050] to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                  {currentUser?.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{currentUser?.name}</p>
                  <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="artist">Artist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tenant</label>
              <Select value={editTenant} onValueChange={setEditTenant}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cage Riot">Cage Riot</SelectItem>
                  <SelectItem value="Indie Label Co">Indie Label Co</SelectItem>
                  <SelectItem value="Urban Sounds">Urban Sounds</SelectItem>
                  <SelectItem value="Electronic Records">Electronic Records</SelectItem>
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
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-lg border">
              <p className="text-sm font-medium mb-2">Account Details</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Created: {currentUser && new Date(currentUser.createdAt).toLocaleDateString()}</p>
                <p>Last Login: {currentUser?.lastLogin === "Never" ? "Never" : currentUser && new Date(currentUser.lastLogin).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDrawer(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#ff0050] hover:bg-[#cc0040]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
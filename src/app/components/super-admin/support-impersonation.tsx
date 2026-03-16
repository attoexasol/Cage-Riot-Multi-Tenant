import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
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
import { Eye, Search, Shield, AlertTriangle, Clock, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { RoleBadge } from "@/app/components/ui/role-badge";
import type { UserRole, AccountType } from "@/app/components/auth/auth-context";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountType: AccountType;
  accountId: string;
  accountName: string;
  lastActive: string;
  status: "active" | "suspended" | "inactive";
}

interface ImpersonationLog {
  id: string;
  adminEmail: string;
  targetUserEmail: string;
  targetUserName: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  reason: string;
  status: "active" | "completed";
}

const mockUsers: UserRecord[] = [
  {
    id: "1",
    name: "Enterprise Admin",
    email: "admin@cageriot.com",
    role: "admin",
    accountType: "enterprise",
    accountId: "ent-001",
    accountName: "Cage Riot Records",
    lastActive: "2025-03-10T14:30:00Z",
    status: "active",
  },
  {
    id: "2",
    name: "Operations Manager",
    email: "ops@cageriot.com",
    role: "operations",
    accountType: "enterprise",
    accountId: "ent-001",
    accountName: "Cage Riot Records",
    lastActive: "2025-03-10T15:15:00Z",
    status: "active",
  },
  {
    id: "3",
    name: "Finance Director",
    email: "finance@cageriot.com",
    role: "finance",
    accountType: "enterprise",
    accountId: "ent-001",
    accountName: "Cage Riot Records",
    lastActive: "2025-03-10T13:45:00Z",
    status: "active",
  },
  {
    id: "4",
    name: "Legal Counsel",
    email: "legal@cageriot.com",
    role: "legal",
    accountType: "enterprise",
    accountId: "ent-001",
    accountName: "Cage Riot Records",
    lastActive: "2025-03-10T12:20:00Z",
    status: "active",
  },
  {
    id: "5",
    name: "The Waves",
    email: "artist@cageriot.com",
    role: "artist-owner",
    accountType: "enterprise",
    accountId: "ent-001",
    accountName: "Cage Riot Records",
    lastActive: "2025-03-10T16:00:00Z",
    status: "active",
  },
];

const mockImpersonationLogs: ImpersonationLog[] = [
  {
    id: "1",
    adminEmail: "superadmin@cageriot.com",
    targetUserEmail: "admin@cageriot.com",
    targetUserName: "Enterprise Admin",
    startTime: "2025-03-09T10:30:00Z",
    endTime: "2025-03-09T10:45:00Z",
    duration: "15 minutes",
    reason: "Support ticket #1234 - User reporting dashboard loading issues",
    status: "completed",
  },
  {
    id: "2",
    adminEmail: "superadmin@cageriot.com",
    targetUserEmail: "ops@cageriot.com",
    targetUserName: "Operations Manager",
    startTime: "2025-03-08T14:20:00Z",
    endTime: "2025-03-08T14:35:00Z",
    duration: "15 minutes",
    reason: "Support ticket #1228 - Investigating delivery queue issues",
    status: "completed",
  },
  {
    id: "3",
    adminEmail: "superadmin@cageriot.com",
    targetUserEmail: "finance@cageriot.com",
    targetUserName: "Finance Director",
    startTime: "2025-03-07T11:00:00Z",
    endTime: "2025-03-07T11:22:00Z",
    duration: "22 minutes",
    reason: "Support ticket #1210 - Payment processing discrepancy investigation",
    status: "completed",
  },
];

export function SupportImpersonation() {
  const [users, setUsers] = useState<UserRecord[]>(mockUsers);
  const [impersonationLogs, setImpersonationLogs] = useState<ImpersonationLog[]>(mockImpersonationLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [impersonationReason, setImpersonationReason] = useState("");
  const [activeImpersonation, setActiveImpersonation] = useState<ImpersonationLog | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.accountName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartImpersonation = () => {
    if (!selectedUser || !impersonationReason.trim()) {
      toast.error("Please provide a reason for impersonation");
      return;
    }

    // Create impersonation log entry
    const newLog: ImpersonationLog = {
      id: Date.now().toString(),
      adminEmail: "superadmin@cageriot.com", // Current user
      targetUserEmail: selectedUser.email,
      targetUserName: selectedUser.name,
      startTime: new Date().toISOString(),
      reason: impersonationReason,
      status: "active",
    };

    setActiveImpersonation(newLog);
    setImpersonationLogs((prev) => [newLog, ...prev]);

    // Log audit event
    console.log("AUDIT LOG:", {
      action: "IMPERSONATION_STARTED",
      adminEmail: "superadmin@cageriot.com",
      targetUserId: selectedUser.id,
      targetUserEmail: selectedUser.email,
      reason: impersonationReason,
      timestamp: new Date().toISOString(),
      severity: "HIGH",
    });

    toast.success(`Impersonation session started for ${selectedUser.name}`);
    setShowConfirmDialog(false);
    setSelectedUser(null);
    setImpersonationReason("");
  };

  const handleEndImpersonation = () => {
    if (!activeImpersonation) return;

    const endTime = new Date();
    const startTime = new Date(activeImpersonation.startTime);
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // Update log entry
    setImpersonationLogs((prev) =>
      prev.map((log) =>
        log.id === activeImpersonation.id
          ? {
              ...log,
              endTime: endTime.toISOString(),
              duration: `${durationMinutes} minutes`,
              status: "completed" as const,
            }
          : log
      )
    );

    // Log audit event
    console.log("AUDIT LOG:", {
      action: "IMPERSONATION_ENDED",
      adminEmail: activeImpersonation.adminEmail,
      targetUserEmail: activeImpersonation.targetUserEmail,
      startTime: activeImpersonation.startTime,
      endTime: endTime.toISOString(),
      duration: `${durationMinutes} minutes`,
      timestamp: new Date().toISOString(),
      severity: "HIGH",
    });

    toast.success("Impersonation session ended");
    setActiveImpersonation(null);
  };

  const handleImpersonateClick = (user: UserRecord) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Eye className="h-6 w-6 text-[#ff0050]" />
          Support Impersonation
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Securely impersonate users for support purposes. All actions are audit logged.
        </p>
      </div>

      {/* Active Impersonation Warning */}
      {activeImpersonation && (
        <Card className="border-[#ff0050]/50 bg-[#ff0050]/5">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#ff0050] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-[#ff0050]">Active Impersonation Session</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Currently impersonating: <strong>{activeImpersonation.targetUserName}</strong> (
                    {activeImpersonation.targetUserEmail})
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Started: {new Date(activeImpersonation.startTime).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reason: {activeImpersonation.reason}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndImpersonation}
                className="bg-[#ff0050] hover:bg-[#cc0040]"
              >
                End Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Security & Compliance Notice</h3>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>All impersonation sessions are logged with full audit trails</li>
                <li>You must provide a valid support ticket or reason for impersonation</li>
                <li>Impersonation sessions should be kept as brief as possible</li>
                <li>All actions performed during impersonation are attributed to the impersonated user</li>
                <li>Unauthorized or unnecessary impersonation may result in disciplinary action</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Search */}
      <Card>
        <CardHeader>
          <CardTitle>Find User to Impersonate</CardTitle>
          <CardDescription>Search for users by name, email, or account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Select a user to start an impersonation session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#ff0050] to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm">{user.accountName}</div>
                            <div className="text-xs text-muted-foreground">{user.accountId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.lastActive).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.status === "active"
                              ? "bg-green-500/10 text-green-500"
                              : user.status === "suspended"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-gray-500/10 text-gray-500"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImpersonateClick(user)}
                          disabled={!!activeImpersonation || user.status !== "active"}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Impersonate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Impersonation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Impersonation History
          </CardTitle>
          <CardDescription>Recent impersonation sessions and audit logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Target User</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {impersonationLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No impersonation history
                    </TableCell>
                  </TableRow>
                ) : (
                  impersonationLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.targetUserName}</div>
                          <div className="text-xs text-muted-foreground">{log.targetUserEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(log.startTime).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.duration || (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                        {log.reason}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.status === "active"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-gray-500/10 text-gray-500"
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#ff0050]" />
              Confirm Impersonation Session
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to impersonate <strong>{selectedUser?.name}</strong> (
              {selectedUser?.email}). This action will be audit logged.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Reason for Impersonation <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., Support ticket #1234 - User reporting login issues"
                value={impersonationReason}
                onChange={(e) => setImpersonationReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Provide a valid support ticket number or detailed reason
              </p>
            </div>

            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">
                  By proceeding, you acknowledge that:
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>This session will be fully audit logged</li>
                  <li>All actions will be attributed to the impersonated user</li>
                  <li>You should end the session as soon as possible</li>
                  <li>Misuse may result in disciplinary action</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartImpersonation}
              disabled={!impersonationReason.trim()}
              className="bg-[#ff0050] hover:bg-[#cc0040]"
            >
              Start Impersonation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

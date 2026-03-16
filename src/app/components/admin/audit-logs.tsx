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
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  User,
  Calendar,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  user: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  before?: any;
  after?: any;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    user: "John Anderson",
    userId: "1",
    action: "user.created",
    resourceType: "user",
    resourceId: "7",
    resourceName: "Alex Johnson",
    timestamp: "2026-01-30T14:30:00",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    after: { name: "Alex Johnson", email: "alex@pending.com", role: "artist" },
  },
  {
    id: "2",
    user: "Sarah Chen",
    userId: "2",
    action: "release.delivered",
    resourceType: "release",
    resourceId: "42",
    resourceName: "Electric Dreams",
    timestamp: "2026-01-30T14:00:00",
    ipAddress: "192.168.1.105",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    id: "3",
    user: "Michael Torres",
    userId: "3",
    action: "clearance.approved",
    resourceType: "clearance",
    resourceId: "12",
    resourceName: "Sample License - Summer Nights EP",
    timestamp: "2026-01-30T13:30:00",
    ipAddress: "192.168.1.110",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
    before: { status: "pending" },
    after: { status: "approved" },
  },
  {
    id: "4",
    user: "Emma Williams",
    userId: "4",
    action: "payment.processed",
    resourceType: "payment",
    resourceId: "89",
    resourceName: "Royalty Payment - The Waves",
    timestamp: "2026-01-30T13:00:00",
    ipAddress: "192.168.1.115",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
  },
  {
    id: "5",
    user: "John Anderson",
    userId: "1",
    action: "user.role_changed",
    resourceType: "user",
    resourceId: "8",
    resourceName: "Lisa Martinez",
    timestamp: "2026-01-30T12:30:00",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    before: { role: "artist" },
    after: { role: "operations" },
  },
  {
    id: "6",
    user: "Sarah Chen",
    userId: "2",
    action: "qc.override",
    resourceType: "qc_check",
    resourceId: "156",
    resourceName: "QC Check - Synth Wave Anthology",
    timestamp: "2026-01-30T12:00:00",
    ipAddress: "192.168.1.105",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    before: { status: "failed" },
    after: { status: "passed", override_reason: "Artist confirmed audio quality intentional" },
  },
  {
    id: "7",
    user: "John Anderson",
    userId: "1",
    action: "tenant.created",
    resourceType: "tenant",
    resourceId: "4",
    resourceName: "Electronic Records",
    timestamp: "2026-01-30T11:30:00",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    after: { name: "Electronic Records", plan: "starter", status: "trial" },
  },
  {
    id: "8",
    user: "Michael Torres",
    userId: "3",
    action: "dmca.takedown_issued",
    resourceType: "dmca",
    resourceId: "23",
    resourceName: "DMCA Takedown - Unauthorized Upload",
    timestamp: "2026-01-30T11:00:00",
    ipAddress: "192.168.1.110",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
  },
  {
    id: "9",
    user: "Emma Williams",
    userId: "4",
    action: "invoice.generated",
    resourceType: "invoice",
    resourceId: "67",
    resourceName: "Invoice #INV-2026-001",
    timestamp: "2026-01-30T10:30:00",
    ipAddress: "192.168.1.115",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
  },
  {
    id: "10",
    user: "John Anderson",
    userId: "1",
    action: "system.settings_changed",
    resourceType: "settings",
    resourceId: "global",
    resourceName: "Platform Settings",
    timestamp: "2026-01-30T10:00:00",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    before: { maintenance_mode: false },
    after: { maintenance_mode: false, email_verification_required: true },
  },
];

export function AuditLogs() {
  const [logs, setLogs] = useState(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [currentLog, setCurrentLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction =
      filterAction === "all" || log.action.startsWith(filterAction);
    const matchesUser = filterUser === "all" || log.userId === filterUser;
    return matchesSearch && matchesAction && matchesUser;
  });

  const handleViewDetails = (log: AuditLog) => {
    setCurrentLog(log);
    setShowDetailsDialog(true);
  };

  const handleExport = () => {
    toast.success("Exporting audit logs to CSV...");
  };

  const getActionBadge = (action: string) => {
    const type = action.split(".")[0];
    const variants: Record<string, string> = {
      user: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      release: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      payment: "bg-green-500/10 text-green-600 border-green-500/20",
      clearance: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      qc: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      tenant: "bg-pink-500/10 text-pink-600 border-pink-500/20",
      dmca: "bg-red-500/10 text-red-600 border-red-500/20",
      invoice: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      system: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };

    return (
      <Badge variant="secondary" className={variants[type] || variants.system}>
        {action}
      </Badge>
    );
  };

  const totalActions = logs.length;
  const usersActive = new Set(logs.map((l) => l.userId)).size;
  const todayActions = logs.filter(
    (l) =>
      new Date(l.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-semibold mt-1">{totalActions}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-semibold mt-1">{todayActions}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-semibold mt-1">{usersActive}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <User className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Retention</p>
                <p className="text-2xl font-semibold mt-1">90 days</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="user">User Actions</SelectItem>
                <SelectItem value="release">Release Actions</SelectItem>
                <SelectItem value="payment">Payment Actions</SelectItem>
                <SelectItem value="clearance">Clearance Actions</SelectItem>
                <SelectItem value="qc">QC Actions</SelectItem>
                <SelectItem value="tenant">Tenant Actions</SelectItem>
                <SelectItem value="system">System Actions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="1">John Anderson</SelectItem>
                <SelectItem value="2">Sarah Chen</SelectItem>
                <SelectItem value="3">Michael Torres</SelectItem>
                <SelectItem value="4">Emma Williams</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                {filteredLogs.length} event{filteredLogs.length !== 1 ? "s" : ""} recorded
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Resource</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP Address</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b hover:bg-[#ff0050]/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff0050] to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {log.user.charAt(0)}
                        </div>
                        <p className="font-medium whitespace-nowrap">{log.user}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium">{log.resourceType}</p>
                        <p className="text-sm text-muted-foreground">{log.resourceName}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-sm whitespace-nowrap">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono">{log.ipAddress}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLogs.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No audit logs found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Event ID: {currentLog?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">User</p>
                <p className="font-medium">{currentLog?.user}</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Action</p>
                {currentLog && getActionBadge(currentLog.action)}
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Resource</p>
                <p className="font-medium">{currentLog?.resourceType}</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Resource Name</p>
                <p className="font-medium">{currentLog?.resourceName}</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Timestamp</p>
                <p className="font-medium">
                  {currentLog && new Date(currentLog.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">IP Address</p>
                <p className="font-medium font-mono text-sm">{currentLog?.ipAddress}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">User Agent</p>
              <p className="text-sm font-mono break-all">{currentLog?.userAgent}</p>
            </div>

            {currentLog?.before && (
              <div className="p-3 rounded-lg border bg-red-500/5">
                <p className="text-sm font-medium mb-2 text-red-600">Before</p>
                <pre className="text-xs bg-background p-2 rounded border overflow-auto">
                  {JSON.stringify(currentLog.before, null, 2)}
                </pre>
              </div>
            )}

            {currentLog?.after && (
              <div className="p-3 rounded-lg border bg-green-500/5">
                <p className="text-sm font-medium mb-2 text-green-600">After</p>
                <pre className="text-xs bg-background p-2 rounded border overflow-auto">
                  {JSON.stringify(currentLog.after, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
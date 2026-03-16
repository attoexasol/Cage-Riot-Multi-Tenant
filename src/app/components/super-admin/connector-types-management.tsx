import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
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
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Plug, Search, Shield, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ConnectorType {
  id: string;
  name: string;
  type: "dsp" | "analytics" | "payment" | "reporting";
  enabled: boolean;
  requiresApproval: boolean;
  activeConnections: number;
  rateLimit: number; // requests per minute
  lastUpdated: string;
  description: string;
}

const mockConnectors: ConnectorType[] = [
  {
    id: "1",
    name: "Spotify",
    type: "dsp",
    enabled: true,
    requiresApproval: false,
    activeConnections: 3847,
    rateLimit: 100,
    lastUpdated: "2025-03-01T10:00:00Z",
    description: "Spotify music streaming platform connector",
  },
  {
    id: "2",
    name: "Apple Music",
    type: "dsp",
    enabled: true,
    requiresApproval: false,
    activeConnections: 2934,
    rateLimit: 80,
    lastUpdated: "2025-03-01T10:00:00Z",
    description: "Apple Music streaming service connector",
  },
  {
    id: "3",
    name: "YouTube Music",
    type: "dsp",
    enabled: true,
    requiresApproval: false,
    activeConnections: 2456,
    rateLimit: 60,
    lastUpdated: "2025-03-01T10:00:00Z",
    description: "YouTube Music streaming platform connector",
  },
  {
    id: "4",
    name: "Tidal",
    type: "dsp",
    enabled: true,
    requiresApproval: true,
    activeConnections: 892,
    rateLimit: 40,
    lastUpdated: "2025-02-28T15:30:00Z",
    description: "Tidal high-fidelity music streaming connector",
  },
  {
    id: "5",
    name: "Amazon Music",
    type: "dsp",
    enabled: true,
    requiresApproval: false,
    activeConnections: 1823,
    rateLimit: 70,
    lastUpdated: "2025-03-01T10:00:00Z",
    description: "Amazon Music streaming service connector",
  },
  {
    id: "6",
    name: "SoundCloud",
    type: "dsp",
    enabled: false,
    requiresApproval: true,
    activeConnections: 0,
    rateLimit: 30,
    lastUpdated: "2025-02-15T09:00:00Z",
    description: "SoundCloud music platform connector (Beta)",
  },
  {
    id: "7",
    name: "Chartmetric",
    type: "analytics",
    enabled: true,
    requiresApproval: true,
    activeConnections: 456,
    rateLimit: 50,
    lastUpdated: "2025-03-01T10:00:00Z",
    description: "Chartmetric music analytics platform connector",
  },
  {
    id: "8",
    name: "PayPal",
    type: "payment",
    enabled: true,
    requiresApproval: true,
    activeConnections: 1234,
    rateLimit: 100,
    lastUpdated: "2025-03-01T10:00:00Z",
    description: "PayPal payment processing connector",
  },
  {
    id: "9",
    name: "Stripe",
    type: "payment",
    enabled: true,
    requiresApproval: true,
    activeConnections: 2145,
    rateLimit: 150,
    lastUpdated: "2025-03-01T10:00:00Z",
    description: "Stripe payment processing connector",
  },
  {
    id: "10",
    name: "SoundExchange",
    type: "reporting",
    enabled: true,
    requiresApproval: true,
    activeConnections: 678,
    rateLimit: 20,
    lastUpdated: "2025-02-28T14:00:00Z",
    description: "SoundExchange reporting connector",
  },
];

export function ConnectorTypesManagement() {
  const [connectors, setConnectors] = useState<ConnectorType[]>(mockConnectors);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConnector, setSelectedConnector] = useState<ConnectorType | null>(null);

  const filteredConnectors = connectors.filter(
    (connector) =>
      connector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connector.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connector.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleConnector = (connectorId: string) => {
    setConnectors((prev) =>
      prev.map((connector) => {
        if (connector.id === connectorId) {
          const newEnabled = !connector.enabled;

          // Log audit event
          console.log("AUDIT LOG:", {
            action: "CONNECTOR_TYPE_TOGGLED",
            connectorId: connector.id,
            connectorName: connector.name,
            previousState: connector.enabled,
            newState: newEnabled,
            timestamp: new Date().toISOString(),
          });

          toast.success(
            `Connector "${connector.name}" ${newEnabled ? "enabled" : "disabled"}`
          );

          return {
            ...connector,
            enabled: newEnabled,
            lastUpdated: new Date().toISOString(),
          };
        }
        return connector;
      })
    );
  };

  const handleToggleApproval = (connectorId: string) => {
    setConnectors((prev) =>
      prev.map((connector) => {
        if (connector.id === connectorId) {
          const newRequiresApproval = !connector.requiresApproval;

          // Log audit event
          console.log("AUDIT LOG:", {
            action: "CONNECTOR_APPROVAL_REQUIREMENT_CHANGED",
            connectorId: connector.id,
            connectorName: connector.name,
            previousState: connector.requiresApproval,
            newState: newRequiresApproval,
            timestamp: new Date().toISOString(),
          });

          toast.success(
            `Connector "${connector.name}" ${
              newRequiresApproval ? "now requires" : "no longer requires"
            } approval`
          );

          return {
            ...connector,
            requiresApproval: newRequiresApproval,
            lastUpdated: new Date().toISOString(),
          };
        }
        return connector;
      })
    );
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "dsp":
        return "bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20";
      case "analytics":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "payment":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "reporting":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "";
    }
  };

  const typeStats = {
    dsp: connectors.filter((c) => c.type === "dsp").length,
    analytics: connectors.filter((c) => c.type === "analytics").length,
    payment: connectors.filter((c) => c.type === "payment").length,
    reporting: connectors.filter((c) => c.type === "reporting").length,
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Plug className="h-6 w-6 text-[#ff0050]" />
          Connector Types Management
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage allowed connector types and integration settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Connectors</div>
            <div className="text-2xl font-semibold mt-1">{connectors.length}</div>
            <div className="text-xs text-green-500 mt-1">
              {connectors.filter((c) => c.enabled).length} enabled
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">DSP Connectors</div>
            <div className="text-2xl font-semibold mt-1 text-[#ff0050]">{typeStats.dsp}</div>
            <div className="text-xs text-muted-foreground mt-1">Streaming platforms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Analytics</div>
            <div className="text-2xl font-semibold mt-1 text-blue-500">{typeStats.analytics}</div>
            <div className="text-xs text-muted-foreground mt-1">Data providers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Active Connections</div>
            <div className="text-2xl font-semibold mt-1 text-green-500">
              {connectors.reduce((sum, c) => sum + c.activeConnections, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Across all accounts</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search connectors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Security Notice</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Connector credentials and API keys are never exposed in the UI. All secrets are
                encrypted at rest and in transit. Privileged actions are audit logged.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connectors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Connector Types ({filteredConnectors.length})</CardTitle>
          <CardDescription>
            Manage connector availability, approval requirements, and rate limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Connector</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requires Approval</TableHead>
                  <TableHead>Active Connections</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConnectors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No connectors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConnectors.map((connector) => (
                    <TableRow
                      key={connector.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedConnector(connector)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{connector.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {connector.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getTypeBadgeColor(connector.type)}>
                          {connector.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {connector.enabled ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-500">Enabled</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-500">Disabled</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {connector.requiresApproval ? (
                            <>
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-yellow-500">Yes</span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">No</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{connector.activeConnections.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {connector.rateLimit}/min
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleApproval(connector.id)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={connector.enabled}
                            onCheckedChange={() => handleToggleConnector(connector.id)}
                          />
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

      {/* Connector Details Dialog */}
      <Dialog open={!!selectedConnector} onOpenChange={() => setSelectedConnector(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedConnector?.name} Connector</DialogTitle>
            <DialogDescription>{selectedConnector?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="mt-2">
                    {selectedConnector?.enabled ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-500">
                        Disabled
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="mt-2">
                    <Badge variant="outline" className={getTypeBadgeColor(selectedConnector?.type || "")}>
                      {selectedConnector?.type.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Active Connections</div>
                  <div className="text-2xl font-semibold mt-1">
                    {selectedConnector?.activeConnections.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Rate Limit</div>
                  <div className="text-2xl font-semibold mt-1">
                    {selectedConnector?.rateLimit}
                    <span className="text-sm text-muted-foreground font-normal">/min</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Connector Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Connector</div>
                    <div className="text-xs text-muted-foreground">
                      Allow accounts to create connections to this platform
                    </div>
                  </div>
                  <Switch
                    checked={selectedConnector?.enabled}
                    onCheckedChange={() =>
                      selectedConnector && handleToggleConnector(selectedConnector.id)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Require Admin Approval</div>
                    <div className="text-xs text-muted-foreground">
                      New connections must be approved by platform admin
                    </div>
                  </div>
                  <Switch
                    checked={selectedConnector?.requiresApproval}
                    onCheckedChange={() =>
                      selectedConnector && handleToggleApproval(selectedConnector.id)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">Security</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      API credentials and secrets are never exposed in the platform UI. All
                      connector credentials are encrypted and stored securely.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

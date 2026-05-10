import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Plus, Trash2, Users, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Split {
  id: string;
  name: string;
  role: string;
  percentage: number;
  email: string;
  ipi?: string;
}

interface RoyaltySplitsProps {
  releaseId?: string;
  trackId?: string;
  level: "release" | "track";
  onSave?: (splits: Split[]) => void;
}

const ROLES = [
  "Primary Artist",
  "Featured Artist",
  "Producer",
  "Songwriter",
  "Composer",
  "Lyricist",
  "Engineer",
  "Mixer",
  "Label",
  "Publisher",
  "Rights Holder",
];

export function RoyaltySplits({ releaseId, trackId, level, onSave }: RoyaltySplitsProps) {
  const [splits, setSplits] = useState<Split[]>([
    {
      id: "1",
      name: "The Waves",
      role: "Primary Artist",
      percentage: 70,
      email: "thewaves@example.com",
    },
    {
      id: "2",
      name: "Ocean Records",
      role: "Label",
      percentage: 30,
      email: "label@oceanrecords.com",
    },
  ]);

  const [editingSplit, setEditingSplit] = useState<Partial<Split>>({
    name: "",
    role: "Primary Artist",
    percentage: 0,
    email: "",
    ipi: "",
  });

  const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
  const isValid = Math.abs(totalPercentage - 100) < 0.01;

  const addSplit = () => {
    if (!editingSplit.name || !editingSplit.email || !editingSplit.percentage) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingSplit.percentage <= 0 || editingSplit.percentage > 100) {
      toast.error("Percentage must be between 1 and 100");
      return;
    }

    const newSplit: Split = {
      id: Date.now().toString(),
      name: editingSplit.name!,
      role: editingSplit.role!,
      percentage: editingSplit.percentage!,
      email: editingSplit.email!,
      ipi: editingSplit.ipi,
    };

    setSplits([...splits, newSplit]);
    setEditingSplit({
      name: "",
      role: "Primary Artist",
      percentage: 0,
      email: "",
      ipi: "",
    });
    toast.success("Contributor added");
  };

  const removeSplit = (id: string) => {
    setSplits(splits.filter((s) => s.id !== id));
    toast.success("Contributor removed");
  };

  const handleSave = () => {
    if (!isValid) {
      toast.error("Total percentage must equal 100%");
      return;
    }

    onSave?.(splits);
    toast.success("Royalty splits saved successfully!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#ff0050]" />
                Royalty Splits & Contributors
              </CardTitle>
              <CardDescription>
                Define how royalties are split for this {level}. Total must equal 100%.
              </CardDescription>
            </div>
            <Badge
              variant={isValid ? "default" : "destructive"}
              className={cn(
                "w-fit",
                isValid ? "bg-green-500" : ""
              )}
            >
              {totalPercentage}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 px-3.5 sm:px-6">
          {/* Validation Alert */}
          {!isValid && splits.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {totalPercentage < 100
                    ? `Missing ${100 - totalPercentage}% allocation`
                    : `Over-allocated by ${totalPercentage - 100}%`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total percentage must equal exactly 100% before saving.
                </p>
              </div>
            </div>
          )}

          {/* Existing Splits */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Current Contributors</h4>
            {splits.map((split) => (
              <div
                key={split.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff0050] to-[#cc0040] text-white flex items-center justify-center text-xs sm:text-sm font-semibold flex-shrink-0">
                    {split.percentage}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium break-words">{split.name}</p>
                    <p className="text-sm text-muted-foreground break-words">
                      {split.role} • {split.email}
                    </p>
                    {split.ipi && (
                      <p className="text-xs text-muted-foreground mt-0.5 break-words">
                        IPI: {split.ipi}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSplit(split.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 self-end sm:self-center"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Split Form */}
          <div className="space-y-4 p-4 rounded-lg border-2 border-dashed">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Contributor
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={editingSplit.name}
                  onChange={(e) => setEditingSplit({ ...editingSplit, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={editingSplit.email}
                  onChange={(e) => setEditingSplit({ ...editingSplit, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role *</label>
                <select
                  value={editingSplit.role}
                  onChange={(e) =>
                    setEditingSplit({ ...editingSplit, role: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-[#ff0050]/20 focus:border-[#ff0050] transition-colors"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Percentage *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                    value={editingSplit.percentage || ""}
                    onChange={(e) =>
                      setEditingSplit({
                        ...editingSplit,
                        percentage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 pr-8 rounded-lg border bg-background"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">
                  IPI/CAE Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="000000000"
                  value={editingSplit.ipi}
                  onChange={(e) =>
                    setEditingSplit({ ...editingSplit, ipi: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  International Performer/Publisher Interested Parties Information number
                </p>
              </div>
            </div>
            <Button onClick={addSplit} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Contributor
            </Button>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Allocation</p>
                <p className="text-xs text-muted-foreground">
                  {splits.length} contributor{splits.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{totalPercentage}%</p>
              <p className="text-xs text-muted-foreground">
                {isValid ? "Ready to save" : "Invalid allocation"}
              </p>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="w-full"
            size="lg"
          >
            Save Royalty Splits
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
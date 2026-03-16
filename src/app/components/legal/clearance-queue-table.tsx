import React from "react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

interface ClearanceItem {
  id: string;
  releaseTitle: string;
  artistName: string;
  upc: string;
  status: "pending" | "missing_docs" | "ready" | "approved" | "rejected";
  sampleLicensesCount: number;
  rightsDocsCount: number;
  daysWaiting: number;
  submittedDate: string;
  submittedBy: string;
  priority: "urgent" | "high" | "normal" | "low";
  notes?: string;
}

interface ClearanceQueueTableProps {
  items: ClearanceItem[];
  selectedItems: string[];
  onToggleSelection: (id: string) => void;
  onView: (item: ClearanceItem) => void;
  onApprove: (item: ClearanceItem) => void;
  onReject: (item: ClearanceItem) => void;
  onRequestInfo: (item: ClearanceItem) => void;
}

export function ClearanceQueueTable({
  items,
  selectedItems,
  onToggleSelection,
  onView,
  onApprove,
  onReject,
  onRequestInfo,
}: ClearanceQueueTableProps) {
  const getStatusBadge = (status: ClearanceItem["status"]) => {
    const variants = {
      pending: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      missing_docs: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      ready: "bg-green-500/10 text-green-600 border-green-500/20",
      approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      rejected: "bg-red-500/10 text-red-600 border-red-500/20",
    };

    const labels = {
      pending: "Pending Review",
      missing_docs: "Missing Docs",
      ready: "Ready to Approve",
      approved: "Approved",
      rejected: "Rejected",
    };

    const icons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      missing_docs: <AlertCircle className="h-3 w-3 mr-1" />,
      ready: <CheckCircle2 className="h-3 w-3 mr-1" />,
      approved: <CheckCircle2 className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: ClearanceItem["priority"]) => {
    const variants = {
      urgent: "bg-red-500/10 text-red-600 border-red-500/20",
      high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      normal: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      low: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };

    return (
      <Badge variant="secondary" className={variants[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No releases found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 md:p-3 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap">
                Select
              </th>
              <th className="text-left p-2 md:p-3 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[180px]">
                Release
              </th>
              <th className="text-left p-2 md:p-3 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[120px]">
                UPC
              </th>
              <th className="text-left p-2 md:p-3 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[150px]">
                Documentation
              </th>
              <th className="text-left p-2 md:p-3 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[120px]">
                Waiting
              </th>
              <th className="text-right p-2 md:p-3 text-xs md:text-sm font-medium text-muted-foreground whitespace-nowrap min-w-[280px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "border-b transition-all hover:bg-muted/50",
                  selectedItems.includes(item.id) &&
                    "bg-[#ff0050]/5 border-[#ff0050]/20"
                )}
              >
                {/* Checkbox */}
                <td className="p-2 md:p-3 align-top">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => onToggleSelection(item.id)}
                    disabled={item.status === "approved"}
                  />
                </td>

                {/* Release Info */}
                <td className="p-2 md:p-3 align-top">
                  <p className="font-medium text-xs md:text-sm whitespace-nowrap">
                    {item.releaseTitle}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5 whitespace-nowrap">
                    {item.artistName}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1 md:mt-2">
                    {getStatusBadge(item.status)}
                    {getPriorityBadge(item.priority)}
                  </div>
                </td>

                {/* UPC */}
                <td className="p-2 md:p-3 align-top">
                  <p className="text-xs md:text-sm font-mono whitespace-nowrap">
                    {item.upc}
                  </p>
                </td>

                {/* Documentation */}
                <td className="p-2 md:p-3 align-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      <FileText className="h-3 w-3 mr-1" />
                      {item.sampleLicensesCount} samples
                    </Badge>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {item.rightsDocsCount} docs
                    </Badge>
                  </div>
                </td>

                {/* Days Waiting */}
                <td className="p-2 md:p-3 align-top">
                  <p className="text-sm md:text-lg font-semibold text-[#ff0050] whitespace-nowrap">
                    {item.daysWaiting} day{item.daysWaiting !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                    Since {new Date(item.submittedDate).toLocaleDateString()}
                  </p>
                </td>

                {/* Actions */}
                <td className="p-2 md:p-3 align-top">
                  <div className="flex items-center justify-end gap-1 md:gap-2 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(item)}
                      className="text-xs md:text-sm"
                    >
                      <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      View
                    </Button>
                    {item.status === "ready" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReject(item)}
                          className="text-red-600 hover:text-red-700 text-xs md:text-sm"
                        >
                          <XCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onApprove(item)}
                          className="bg-green-500 hover:bg-green-600 text-xs md:text-sm"
                        >
                          <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          Approve
                        </Button>
                      </>
                    )}
                    {item.status === "missing_docs" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRequestInfo(item)}
                        className="text-xs md:text-sm"
                      >
                        <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                        Request Info
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

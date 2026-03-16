import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  FileEdit,
  ClipboardCheck,
  Scale,
  CheckCircle2,
  Radio,
  Globe,
  Clock,
  User,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";

type WorkflowStage =
  | "draft"
  | "qc"
  | "legal"
  | "approved"
  | "queued"
  | "sent"
  | "ingested"
  | "live"
  | "rejected";

interface WorkflowStep {
  stage: WorkflowStage;
  label: string;
  icon: React.ElementType;
  status: "completed" | "current" | "pending" | "rejected";
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  color: string;
}

interface WorkflowStatusProps {
  currentStage: WorkflowStage;
  steps?: WorkflowStep[];
  releaseId?: string;
}

const DEFAULT_STEPS: Omit<WorkflowStep, "status" | "completedAt" | "completedBy" | "notes">[] = [
  {
    stage: "draft",
    label: "Draft",
    icon: FileEdit,
    color: "text-gray-500",
  },
  {
    stage: "qc",
    label: "Quality Check",
    icon: ClipboardCheck,
    color: "text-blue-500",
  },
  {
    stage: "legal",
    label: "Legal Review",
    icon: Scale,
    color: "text-purple-500",
  },
  {
    stage: "approved",
    label: "Approved",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  {
    stage: "queued",
    label: "Queued",
    icon: Clock,
    color: "text-yellow-500",
  },
  {
    stage: "sent",
    label: "Sent to DSPs",
    icon: Radio,
    color: "text-orange-500",
  },
  {
    stage: "ingested",
    label: "Ingested",
    icon: CheckCircle2,
    color: "text-cyan-500",
  },
  {
    stage: "live",
    label: "Live",
    icon: Globe,
    color: "text-green-500",
  },
];

export function WorkflowStatus({ currentStage, steps, releaseId }: WorkflowStatusProps) {
  // Generate workflow steps with status
  const workflowSteps: WorkflowStep[] = DEFAULT_STEPS.map((step, index) => {
    const stageIndex = DEFAULT_STEPS.findIndex((s) => s.stage === currentStage);
    let status: WorkflowStep["status"];

    if (currentStage === "rejected") {
      status = index < stageIndex ? "completed" : index === stageIndex ? "rejected" : "pending";
    } else {
      status = index < stageIndex ? "completed" : index === stageIndex ? "current" : "pending";
    }

    return {
      ...step,
      status,
      // Mock completion data
      completedAt:
        status === "completed"
          ? new Date(Date.now() - (DEFAULT_STEPS.length - index) * 86400000)
          : undefined,
      completedBy: status === "completed" ? getCompletedByName(step.stage) : undefined,
    };
  });

  // Add mock notes for specific stages
  const currentStep = workflowSteps.find((s) => s.status === "current");
  if (currentStep) {
    currentStep.notes = getStageNotes(currentStep.stage);
  }

  function getCompletedByName(stage: WorkflowStage): string {
    const names: Record<WorkflowStage, string> = {
      draft: "Artist",
      qc: "QC Team",
      legal: "Legal Team",
      approved: "Admin",
      queued: "System",
      sent: "Distribution System",
      ingested: "DSP Partners",
      live: "System",
      rejected: "Review Team",
    };
    return names[stage] || "System";
  }

  function getStageNotes(stage: WorkflowStage): string {
    const notes: Partial<Record<WorkflowStage, string>> = {
      draft: "Complete all required metadata fields and upload assets",
      qc: "Audio quality, metadata accuracy, and artwork standards being verified",
      legal: "Sample clearances and licensing documentation under review",
      approved: "Release approved for distribution",
      queued: "Preparing assets and metadata for delivery to DSP partners",
      sent: "Release submitted to 8 DSP partners",
      ingested: "DSPs processing your release for publication",
      live: "Your release is now available to listeners worldwide",
    };
    return notes[stage] || "";
  }

  const getStatusColor = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "current":
        return "bg-[#ff0050]";
      case "rejected":
        return "bg-red-500";
      case "pending":
      default:
        return "bg-gray-300 dark:bg-gray-700";
    }
  };

  const getStatusBadge = (status: WorkflowStep["status"]) => {
    const variants = {
      completed: "bg-green-500/10 text-green-600 border-green-500/20",
      current: "bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20",
      rejected: "bg-red-500/10 text-red-600 border-red-500/20",
      pending: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };

    const labels = {
      completed: "Completed",
      current: "In Progress",
      rejected: "Rejected",
      pending: "Pending",
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Release Workflow Status</CardTitle>
        <CardDescription>
          Track your release through each stage from draft to live
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-3.5 sm:px-6">
        {/* Progress Bar */}
        <div className="overflow-x-auto pb-2">
          <div className="relative min-w-[600px] sm:min-w-0">
            <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800" />
            <div
              className="absolute top-4 sm:top-5 left-0 h-0.5 bg-[#ff0050] transition-all duration-500"
              style={{
                width: `${
                  (workflowSteps.findIndex((s) => s.status === "current") /
                    (workflowSteps.length - 1)) *
                  100
                }%`,
              }}
            />
            <div className="relative flex justify-between gap-2 sm:gap-4 md:gap-6 px-1">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.stage} className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={cn(
                        "h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-all duration-300 ring-2 sm:ring-4 ring-background",
                        getStatusColor(step.status)
                      )}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <p className="text-[10px] sm:text-xs font-medium mt-1.5 sm:mt-2 text-center max-w-[60px] sm:max-w-[80px] whitespace-nowrap">
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Stage Details */}
        {currentStep && (
          <div className="p-4 sm:p-5 rounded-xl border bg-gradient-to-br from-[#ff0050]/5 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                    "bg-[#ff0050]/10 ring-1 ring-[#ff0050]/20"
                  )}
                >
                  <currentStep.icon className="h-6 w-6 text-[#ff0050]" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{currentStep.label}</h4>
                  <p className="text-sm text-muted-foreground">Current Stage</p>
                </div>
              </div>
              <div className="ml-[60px] sm:ml-0">
                {getStatusBadge(currentStep.status)}
              </div>
            </div>
            {currentStep.notes && (
              <p className="text-sm text-muted-foreground leading-relaxed">{currentStep.notes}</p>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Timeline</h4>
          <div className="space-y-2">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === workflowSteps.length - 1;

              return (
                <div key={step.stage} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                        step.status === "completed" && "bg-green-500/10",
                        step.status === "current" && "bg-[#ff0050]/10",
                        step.status === "rejected" && "bg-red-500/10",
                        step.status === "pending" && "bg-gray-500/10"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          step.status === "completed" && "text-green-500",
                          step.status === "current" && "text-[#ff0050]",
                          step.status === "rejected" && "text-red-500",
                          step.status === "pending" && "text-gray-500"
                        )}
                      />
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 flex-1 my-1",
                          step.status === "completed"
                            ? "bg-green-500/20"
                            : "bg-gray-200 dark:bg-gray-800"
                        )}
                        style={{ minHeight: "20px" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{step.label}</p>
                      {step.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          {step.completedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {step.completedBy && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{step.completedBy}</span>
                      </div>
                    )}
                    {step.status === "current" && step.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{step.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {currentStage === "draft" && (
          <Button className="w-full" size="lg">
            Submit for QC Review
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        {currentStage === "rejected" && (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Release Rejected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please review the feedback and make necessary changes before resubmitting.
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full" size="lg">
              Edit Release & Resubmit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
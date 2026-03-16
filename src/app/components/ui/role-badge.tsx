import React from "react";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/components/ui/utils";
import type { UserRole, AccountType } from "@/app/components/auth/auth-context";
import {
  Shield,
  ShieldCheck,
  Briefcase,
  Scale,
  DollarSign,
  Music,
  Eye,
  User,
  Users,
} from "lucide-react";

/** Humanize API role_name (e.g. "standard_owner" -> "Standard Owner"). Exported for use in headers. */
export function humanizeRoleName(value: string): string {
  return value
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface RoleBadgeProps {
  role: UserRole;
  accountType?: AccountType;
  /** When set (e.g. from API role_name), shown instead of internal role label in the red-marked header area */
  displayLabel?: string;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RoleBadge({ 
  role, 
  accountType, 
  displayLabel,
  className,
  showIcon = true,
  size = "md"
}: RoleBadgeProps) {
  const getRoleConfig = () => {
    switch (role) {
      case "platform-super-admin":
        return {
          label: "Platform Super Admin",
          icon: Shield,
          variant: "default" as const,
          className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        };
      case "admin":
        return {
          label: "Account Admin",
          icon: ShieldCheck,
          variant: "default" as const,
          className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        };
      case "operations":
        return {
          label: "Operations",
          icon: Briefcase,
          variant: "default" as const,
          className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
        };
      case "legal":
        return {
          label: "Legal",
          icon: Scale,
          variant: "default" as const,
          className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
        };
      case "finance":
        return {
          label: "Finance",
          icon: DollarSign,
          variant: "default" as const,
          className: "bg-green-500/10 text-green-600 border-green-500/20",
        };
      case "artist-owner":
        return {
          label: "Artist Owner",
          icon: Music,
          variant: "default" as const,
          className: "bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20",
        };
      case "artist-viewer":
        return {
          label: "Artist Viewer",
          icon: Eye,
          variant: "secondary" as const,
          className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
        };
      case "account-owner":
        return {
          label: "Account Owner",
          icon: User,
          variant: "default" as const,
          className: "bg-[#ff0050]/10 text-[#ff0050] border-[#ff0050]/20",
        };
      case "viewer":
        return {
          label: "Viewer",
          icon: Eye,
          variant: "secondary" as const,
          className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
        };
      default:
        return {
          label: "User",
          icon: Users,
          variant: "secondary" as const,
          className: "",
        };
    }
  };

  const config = getRoleConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "flex items-center gap-1.5",
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn(
        size === "sm" && "h-3 w-3",
        size === "md" && "h-3.5 w-3.5",
        size === "lg" && "h-4 w-4"
      )} />}
      <span>{displayLabel?.trim() ? humanizeRoleName(displayLabel) : config.label}</span>
      {accountType && (
        <span className="opacity-60 ml-1">
          ({accountType === "enterprise" ? "Enterprise" : "Standard"})
        </span>
      )}
    </Badge>
  );
}

export function AccountTypeBadge({ 
  accountType,
  className 
}: { 
  accountType: AccountType;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        accountType === "enterprise"
          ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
          : "bg-blue-500/10 text-blue-600 border-blue-500/20",
        className
      )}
    >
      {accountType === "enterprise" ? "Enterprise Account" : "Standard Account"}
    </Badge>
  );
}

import React, { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/app/components/ui/utils";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function StepBadge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-white">
      {count}
    </span>
  );
}

export function TagInput({
  value,
  onChange,
  placeholder,
  maxTotal = 500,
  invalid,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  maxTotal?: number;
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const totalLen = value.join(", ").length;

  const addTag = () => {
    const t = draft.trim();
    if (!t || value.includes(t)) return;
    const next = [...value, t];
    if (next.join(", ").length > maxTotal) return;
    onChange(next);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1 font-normal">
            {tag}
            <button
              type="button"
              className="rounded-full hover:bg-muted p-0.5"
              onClick={() => onChange(value.filter((x) => x !== tag))}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          aria-invalid={invalid}
        />
        <Button type="button" variant="outline" size="sm" onClick={addTag}>
          Add
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground text-right">
        {totalLen}/{maxTotal}
      </p>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
      {children}
    </p>
  );
}

export function DropSurface({
  active,
  className,
  children,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
}: {
  active: boolean;
  className?: string;
  children: React.ReactNode;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick?: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "rounded-xl border-2 border-dashed transition-colors cursor-pointer",
        active ? "border-[#ff0050] bg-[#ff0050]/5" : "border-border/80 hover:border-[#ff0050]/40 hover:bg-muted/30",
        className
      )}
    >
      {children}
    </div>
  );
}

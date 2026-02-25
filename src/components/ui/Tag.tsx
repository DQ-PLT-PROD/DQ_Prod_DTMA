import React from "react";
import { cn } from "../../lib/utils";

type TagVariant = "category" | "topic" | "level" | "audience" | "meta";

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  className?: string;
  onClick?: () => void;
}

const variants: Record<TagVariant, string> = {
  category: "bg-[color:var(--md-primary-container)] text-[color:var(--md-on-primary-container)] border-[color:var(--md-outline-variant)]",
  topic: "bg-[color:var(--md-surface-variant)] text-[color:var(--md-on-surface-variant)] border-[color:var(--md-outline-variant)]",
  level: "bg-[color:var(--md-surface-variant)] text-[color:var(--md-on-surface-variant)] border-[color:var(--md-outline-variant)]",
  audience: "bg-[color:var(--md-surface-variant)] text-[color:var(--md-on-surface-variant)] border-[color:var(--md-outline-variant)]",
  meta: "bg-transparent text-[color:var(--md-on-surface-variant)] border-transparent px-0",
};

export function Tag({ children, variant = "topic", className, onClick }: TagProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        variants[variant],
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
    >
      {children}
    </span>
  );
}

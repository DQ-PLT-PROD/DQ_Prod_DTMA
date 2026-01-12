import React from "react";
import { cn } from "../../lib/utils";

export type TagVariant = "category" | "topic" | "level" | "audience" | "meta";

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  className?: string;
  onClick?: () => void;
}

const variants: Record<TagVariant, string> = {
  category: "bg-blue-50 text-blue-700 border-blue-100",
  topic: "bg-gray-50 text-gray-600 border-gray-200",
  level: "bg-green-50 text-green-700 border-green-100",
  audience: "bg-purple-50 text-purple-700 border-purple-100",
  meta: "bg-transparent text-gray-500 border-transparent px-0",
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

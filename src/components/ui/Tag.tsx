import React from "react";

export type TagVariant = "category" | "topic" | "level" | "audience" | "meta";

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  category: "bg-blue-50 text-blue-700 border border-blue-100",
  topic: "bg-purple-50 text-purple-700 border border-purple-100",
  level: "bg-amber-50 text-amber-700 border border-amber-100",
  audience: "bg-teal-50 text-teal-700 border border-teal-100",
  meta: "bg-gray-50 text-gray-700 border border-gray-200",
};

export const Tag: React.FC<TagProps> = ({
  children,
  icon,
  variant = "meta",
  className,
}) => {
  const baseClasses =
    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium leading-tight";
  const classes = [baseClasses, variantClasses[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {icon ? <span className="flex items-center">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </span>
  );
};

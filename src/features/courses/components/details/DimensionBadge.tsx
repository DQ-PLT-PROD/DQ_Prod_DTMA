import { cn } from "../../../../lib/utils";

interface DimensionBadgeProps {
    dimension?: string; // e.g. "D1: Digital Economy"
    className?: string;
}

export function DimensionBadge({ dimension, className }: DimensionBadgeProps) {
    if (!dimension) return null;

    // Extract the D-number if present for styling logic
    const dNumber = dimension.match(/D\d/)?.[0] || "D1";

    return (
        <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-sm", className)}>
            <span className="font-mono font-bold text-xs opacity-80">{dNumber}</span>
            <span className="w-px h-3 bg-white/20"></span>
            <span className="text-xs font-medium tracking-wide">{dimension}</span>
        </div>
    );
}

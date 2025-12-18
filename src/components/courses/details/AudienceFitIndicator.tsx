import { Users, Briefcase } from "lucide-react";
import { cn } from "../../../lib/utils";

interface AudienceFitIndicatorProps {
    audienceLevel: string; // "Digital Leaders" | "Digital Workers"
    className?: string;
}

export function AudienceFitIndicator({ audienceLevel, className }: AudienceFitIndicatorProps) {
    const isLeader = audienceLevel.toLowerCase().includes("leader");

    return (
        <div className={cn("flex items-start gap-3 p-4 rounded-xl border", isLeader ? "bg-purple-50 border-purple-100" : "bg-blue-50 border-blue-100", className)}>
            <div className={cn("p-2 rounded-lg", isLeader ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                {isLeader ? <Briefcase size={20} /> : <Users size={20} />}
            </div>
            <div>
                <h4 className={cn("font-semibold text-sm mb-1", isLeader ? "text-purple-900" : "text-blue-900")}>
                    Designed for {audienceLevel}
                </h4>
                <p className={cn("text-xs leading-relaxed", isLeader ? "text-purple-700" : "text-blue-700")}>
                    {isLeader
                        ? "Focuses on strategy, decision-making, and driving digital transformation initiatives."
                        : "Focuses on practical skills, execution, and applying digital tools in daily work."}
                </p>
            </div>
        </div>
    );
}

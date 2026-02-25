import React from "react";
import { ChevronDown } from "lucide-react";
import { SectionRequirement } from "../../utils/profileCompletion";

interface ProfileSectionAccordionProps {
  title: string;
  description: string;
  requirement: SectionRequirement;
  completionPct: number;
  isComplete: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const requirementLabel: Record<SectionRequirement, string> = {
  required: "Required",
  optional: "Optional",
  conditional: "Required for Leaders",
};

const ProfileSectionAccordion: React.FC<ProfileSectionAccordionProps> = ({
  title,
  description,
  requirement,
  completionPct,
  isComplete,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <section className="w-full rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
        aria-expanded={isOpen}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                requirement === "required"
                  ? "bg-red-100 text-red-700"
                  : requirement === "conditional"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {requirementLabel[requirement]}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                isComplete ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {completionPct}% complete
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
        <ChevronDown
          size={18}
          className={`mt-1 shrink-0 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen ? <div className="border-t border-gray-100 px-4 py-4">{children}</div> : null}
    </section>
  );
};

export default ProfileSectionAccordion;

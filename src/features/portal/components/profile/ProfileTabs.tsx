import React from "react";
import { ProfileTabId } from "../../utils/profileCompletion";

interface ProfileTabConfig {
  id: ProfileTabId;
  label: string;
  completionPct?: number;
  missingRequiredCount?: number;
  disabled?: boolean;
  disabledLabel?: string;
}

interface ProfileTabsProps {
  tabs: ProfileTabConfig[];
  activeTab: ProfileTabId;
  onTabChange: (tabId: ProfileTabId) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex w-full gap-2 border-b border-gray-200 pb-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const isDisabled = Boolean(tab.disabled);
          const stateClassName = isDisabled
            ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
            : isActive
              ? "border-[#1839AD] bg-[#1839AD]/10 text-[#1839AD]"
              : "border-gray-200 text-gray-600 hover:border-[#1839AD]/40";
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (!isDisabled) {
                  onTabChange(tab.id);
                }
              }}
              disabled={isDisabled}
              className={`shrink-0 rounded-lg border px-3 py-2 text-left transition md:flex-1 ${stateClassName}`}
            >
              <div className="text-sm font-semibold">{tab.label}</div>
              {isDisabled ? (
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-gray-300 px-2 py-0.5 text-gray-600">
                    {tab.disabledLabel || "Coming soon"}
                  </span>
                </div>
              ) : typeof tab.completionPct === "number" ? (
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span>{tab.completionPct}% complete</span>
                  {tab.missingRequiredCount ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                      {tab.missingRequiredCount} required missing
                    </span>
                  ) : null}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;

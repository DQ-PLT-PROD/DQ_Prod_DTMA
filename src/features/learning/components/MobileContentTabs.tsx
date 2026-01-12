import React from 'react';
import { ListVideo, FileText, ClipboardCheck } from 'lucide-react';

export type MobileTabType = 'lessons' | 'resources' | 'quiz';

interface MobileContentTabsProps {
    activeTab: MobileTabType;
    onTabChange: (tab: MobileTabType) => void;
    hasResources?: boolean;
}

const tabs: { id: MobileTabType; label: string; icon: React.ReactNode }[] = [
    { id: 'lessons', label: 'Lessons', icon: <ListVideo size={16} /> },
    { id: 'resources', label: 'Resources', icon: <FileText size={16} /> },
    { id: 'quiz', label: 'Quiz', icon: <ClipboardCheck size={16} /> },
];

export const MobileContentTabs: React.FC<MobileContentTabsProps> = ({
    activeTab,
    onTabChange,
    hasResources = true,
}) => {
    const visibleTabs = hasResources ? tabs : tabs.filter(t => t.id !== 'resources');

    return (
        <div className="flex border-b border-gray-200 bg-white sticky top-[56px] z-20 lg:hidden">
            {visibleTabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                            ? 'text-[#1839AD] border-b-2 border-[#1839AD] bg-blue-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default MobileContentTabs;

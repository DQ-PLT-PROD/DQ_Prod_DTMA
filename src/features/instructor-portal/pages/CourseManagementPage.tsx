/**
 * CourseManagementPage for Instructor Portal
 * 
 * Main page for managing learning paths, courses, modules, lessons, and quizzes.
 * Adapted from DWS Admin App for DTMA integration.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpenIcon,
    GraduationCapIcon,
    FileTextIcon,
    PlayCircleIcon,
    HelpCircleIcon,
    PlusIcon,
    TagIcon
} from 'lucide-react';
import { CoursesSection } from '../components/course-management/CoursesSection';
import { ModulesSection } from '../components/course-management/ModulesSection';
import { LessonsSection } from '../components/course-management/LessonsSection';
import { QuizzesSection } from '../components/course-management/QuizzesSection';
import { ClassificationsSection } from '../components/course-management/ClassificationsSection';

interface Tab {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
    { id: 'classifications', title: 'Classifications', icon: TagIcon },
    { id: 'courses', title: 'Courses', icon: GraduationCapIcon },
    { id: 'lessons', title: 'Lessons', icon: PlayCircleIcon },
    { id: 'modules', title: 'Modules', icon: FileTextIcon },
    { id: 'quizzes', title: 'Quizzes', icon: HelpCircleIcon },
    { id: 'learning-paths', title: 'Learning Paths', icon: BookOpenIcon },
];

export function CourseManagementPage() {
    const navigate = useNavigate();

    // Get tab from URL params or default to categories
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab') || 'classifications';
    const [activeTab, setActiveTab] = useState(tabFromUrl);

    // Update URL when tab changes
    const handleTabChange = (tabId: string) => {
        // Prevent navigation for disabled tabs
        if (tabId === 'learning-paths') return;

        setActiveTab(tabId);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tabId);
        window.history.replaceState({}, '', url.toString());
    };

    const handleAddNew = () => {
        switch (activeTab) {
            case 'courses':
                navigate('/instructor/course-management/course/new');
                break;
            case 'modules':
                navigate('/instructor/course-management/module/new');
                break;
            case 'lessons':
                navigate('/instructor/course-management/lesson/new');
                break;
            case 'quizzes':
                navigate('/instructor/course-management/quiz/new');
                break;
            // No action for categories or disabled tabs
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'classifications':
                return <ClassificationsSection />;
            case 'courses':
                return <CoursesSection />;
            case 'modules':
                return <ModulesSection />;
            case 'lessons':
                return <LessonsSection />;
            case 'quizzes':
                return <QuizzesSection />;
            default:
                return null;
        }
    };

    return (
        <div className="px-4 sm:px-6 pt-4 pb-20 bg-gray-50 min-h-screen">
            {/* Page Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                            Course Management
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage classifications, courses, modules, and lessons
                        </p>
                    </div>
                    {/* Show Add New button only for core content types */}
                    {['courses', 'modules', 'lessons'].includes(activeTab) && (
                        <button
                            className="px-4 py-2 bg-[var(--md-primary)] hover:bg-[var(--md-primary-dark)] text-white rounded-md shadow-sm flex items-center justify-center text-sm font-medium transition-colors"
                            onClick={handleAddNew}
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add New
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-1 mb-6">
                <div className="flex overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const isDisabled = tab.id === 'learning-paths';

                        return (
                            <div
                                key={tab.id}
                                title={isDisabled ? `${tab.title} - Coming Soon` : ""}
                                className={isDisabled ? "cursor-not-allowed" : ""}
                            >
                                <button
                                    onClick={() => handleTabChange(tab.id)}
                                    disabled={isDisabled}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${isActive
                                        ? 'bg-[var(--md-primary)] text-white shadow-sm'
                                        : isDisabled
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className={`h-4 w-4 mr-2 ${isDisabled ? "opacity-50" : ""}`} />
                                    <span className="text-sm font-medium">{tab.title}</span>
                                    {isDisabled && (
                                        <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Soon</span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            {renderContent()}
        </div>
    );
}

// Placeholder component for tabs not yet implemented
function ComingSoonPlaceholder({ title }: { title: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileTextIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {title} Management
                </h3>
                <p className="text-gray-500">
                    This section is coming soon. The {title.toLowerCase()} management functionality
                    will be available in a future update.
                </p>
            </div>
        </div>
    );
}

export default CourseManagementPage;

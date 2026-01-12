/**
 * Course Configuration
 * Consolidated configuration for the DTMA course catalog
 */

import * as React from 'react';
import { ReactNode } from 'react';
import { Clock, BarChart, Calendar, BookOpen, FileText } from 'lucide-react';

// Type definitions
export interface TabConfig {
    id: string;
    label: string;
    icon?: any;
    iconBgColor?: string;
    iconColor?: string;
    renderContent?: (item: any) => React.ReactNode;
}

export interface FilterCategoryConfig {
    id: string;
    title: string;
    options: {
        id: string;
        name: string;
    }[];
}

export interface AttributeConfig {
    key: string;
    label: string;
    icon: ReactNode;
    formatter?: (value: any) => string;
}

export interface CourseConfig {
    id: string;
    title: string;
    description: string;
    route: string;
    primaryCTA: string;
    secondaryCTA: string;
    itemName: string;
    itemNamePlural: string;
    showPromoCards?: boolean;
    attributes: AttributeConfig[];
    detailSections: string[];
    tabs: TabConfig[];
    summarySticky?: boolean;
    filterCategories: FilterCategoryConfig[];
}

// Course configuration
export const courseConfig: CourseConfig = {
    id: 'courses',
    title: 'DTMA Courses',
    description: 'Discover and enroll in courses tailored for SMEs to help grow your business',
    route: '/courses',
    primaryCTA: 'Start Learning Now',
    secondaryCTA: 'Add to Library',
    itemName: 'Course',
    itemNamePlural: 'Courses',
    showPromoCards: false,
    attributes: [
        {
            key: 'duration',
            label: 'Duration',
            icon: React.createElement(Clock, { size: 18, className: "mr-2" })
        },
        {
            key: 'levelTag',
            label: 'Level',
            icon: React.createElement(BarChart, { size: 18, className: "mr-2" })
        }
    ],
    detailSections: ['description', 'learningOutcomes', 'schedule', 'related'],
    tabs: [
        {
            id: 'schedule',
            label: 'Course Outline',
            icon: Calendar,
            iconBgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            id: 'learning_outcomes',
            label: 'Learning Outcomes',
            icon: BookOpen,
            iconBgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            id: 'resources',
            label: 'Resources',
            icon: FileText,
            iconBgColor: 'bg-amber-50',
            iconColor: 'text-amber-600'
        }
    ],
    summarySticky: true,
    filterCategories: [
        {
            id: 'category',
            title: 'Category',
            options: [
                { id: 'economy-4-0', name: 'Mastering Economy 4.0' },
                { id: 'digital-cognitive-organization', name: "Building Tomorrow's Organisations" },
                { id: 'digital-business-platform', name: 'Mastering Digital Transformation' },
                { id: 'digital-transformation-2-0', name: 'Designing for the Future' },
                { id: 'digital-worker-workspace', name: 'Architecting Change' },
                { id: 'digital-accelerators-tools', name: 'Empowering Change' },
            ]
        },
        {
            id: 'industry',
            title: 'Industry',
            options: [
                { id: 'farming-4-0', name: 'Farming 4.0' },
                { id: 'government-4-0', name: 'Government 4.0' },
                { id: 'hospitality-4-0', name: 'Hospitality 4.0' },
                { id: 'infrastructure-4-0', name: 'Infrastructure 4.0' },
                { id: 'logistics-4-0', name: 'Logistics 4.0' },
                { id: 'plant-4-0', name: 'Plant 4.0' },
                { id: 'retail-4-0', name: 'Retail 4.0' },
                { id: 'service-4-0', name: 'Service 4.0' },
                { id: 'wellness-4-0', name: 'Wellness 4.0' },
            ]
        },
        {
            id: 'audienceLevel',
            title: 'Role',
            options: [
                { id: 'Digital Leaders', name: 'Digital Leaders' },
                { id: 'Digital Workers', name: 'Digital Workers' }
            ]
        },
        {
            id: 'levelTag',
            title: 'Level',
            options: [
                { id: 'Beginner', name: 'Beginner' },
                { id: 'Intermediate', name: 'Intermediate' },
                { id: 'Advanced', name: 'Advanced' }
            ]
        }
    ]
};

// Helper function to get the course config
export function getCourseConfig(): CourseConfig {
    return courseConfig;
}

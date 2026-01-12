import { LessonType } from "./dtma-lms";

/**
 * UI-side Lesson type for the Learning Screen
 * This is separate from the database Lesson type in types/dtma-lms.ts
 */
export interface Lesson {
    id: number | string;
    title: string;
    duration: string; // Display format like "08:12"
    completed: boolean;
    description: string;
    type?: LessonType;
    videoUrl?: string;
    resourceUrl?: string;
    isPreview?: boolean; // For preview content access control
}

/**
 * Convert database lesson to UI lesson format
 */
export const toUILesson = (dbLesson: {
    id: string;
    title: string;
    type?: LessonType;
    estimatedDurationMinutes: number;
    videoUrl?: string;
    resourceUrl?: string;
    content?: string;
    isPreview?: boolean; // Add isPreview field from database
}, orderIndex: number, completedIds: Set<string> = new Set()): Lesson => {
    const mins = dbLesson.estimatedDurationMinutes || 0;
    const durationStr = `${String(Math.floor(mins)).padStart(2, '0')}:00`;

    return {
        id: dbLesson.id,
        title: dbLesson.title,
        duration: durationStr,
        completed: completedIds.has(dbLesson.id),
        description: dbLesson.content || '',
        type: dbLesson.type,
        videoUrl: dbLesson.videoUrl,
        resourceUrl: dbLesson.resourceUrl,
        isPreview: dbLesson.isPreview || false, // Map isPreview field
    };
};

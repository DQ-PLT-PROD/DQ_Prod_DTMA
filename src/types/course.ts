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
}, orderIndex: number, completedIds: Set<string> = new Set()): Lesson => {
    // Use loading state initially - actual duration will be populated from video metadata
    // This ensures all lessons show accurate durations from the video files
    const durationStr = '--:--';

    return {
        id: dbLesson.id,
        title: dbLesson.title,
        duration: durationStr,
        completed: completedIds.has(dbLesson.id),
        description: dbLesson.content || '',
        type: dbLesson.type,
        videoUrl: dbLesson.videoUrl,
        resourceUrl: dbLesson.resourceUrl,
    };
};

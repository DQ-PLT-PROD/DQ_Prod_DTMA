import { useState, useEffect } from 'react';
import { fetchFullCourse, fetchRelatedCourses } from '../services/courseService';
import { Course } from '@/types/dtma-lms';

interface UseCourseDetailsParams {
    itemId: string;
    shouldTakeAction?: boolean;
}

interface UseCourseDetailsReturn {
    item: Course | null;
    relatedItems: Course[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useCourseDetails({ itemId, shouldTakeAction = true }: UseCourseDetailsParams): UseCourseDetailsReturn {
    const [item, setItem] = useState<Course | null>(null);
    const [relatedItems, setRelatedItems] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        if (!itemId || !shouldTakeAction) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Fetch course details
            const course = await fetchFullCourse(itemId);
            setItem(course);

            // Fetch related courses if available
            if (course?.relatedCourses && course.relatedCourses.length > 0) {
                const related = await fetchRelatedCourses(course.relatedCourses);
                setRelatedItems(related);
            } else {
                setRelatedItems([]);
            }
        } catch (err) {
            console.error('Error fetching course details:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch course details'));
            setItem(null);
            setRelatedItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [itemId, shouldTakeAction]);

    return {
        item,
        relatedItems,
        loading,
        error,
        refetch: fetchData,
    };
}

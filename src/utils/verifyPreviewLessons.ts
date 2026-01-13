/**
 * Utility to verify preview lesson configuration
 * Helps ensure proper preview content setup for enrollment gating
 */
import { supabase } from "../lib/supabase/client";

export interface PreviewLessonInfo {
    id: string;
    title: string;
    courseSlug: string;
    type: string;
    orderIndex: number;
    isPreview: boolean;
}

/**
 * Get all lessons with their preview status for a course
 */
export const getCourseLessonsWithPreviewStatus = async (
    courseSlug: string
): Promise<PreviewLessonInfo[]> => {
    try {
        const { data, error } = await supabase
            .from('lessons')
            .select('id, title, course_slug, type, order_index, is_preview')
            .eq('course_slug', courseSlug)
            .order('order_index');

        if (error) {
            console.error('Error fetching lessons with preview status:', error);
            return [];
        }

        return (data || []).map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            courseSlug: lesson.course_slug,
            type: lesson.type,
            orderIndex: lesson.order_index,
            isPreview: lesson.is_preview || false
        }));
    } catch (err) {
        console.error('Error in getCourseLessonsWithPreviewStatus:', err);
        return [];
    }
};

/**
 * Verify that a course has proper preview lesson configuration
 * Returns analysis of preview setup
 */
export const verifyPreviewConfiguration = async (courseSlug: string) => {
    const lessons = await getCourseLessonsWithPreviewStatus(courseSlug);
    
    const totalLessons = lessons.length;
    const previewLessons = lessons.filter(l => l.isPreview);
    const fullLessons = lessons.filter(l => !l.isPreview);
    
    const analysis = {
        courseSlug,
        totalLessons,
        previewCount: previewLessons.length,
        fullCount: fullLessons.length,
        previewPercentage: totalLessons > 0 ? Math.round((previewLessons.length / totalLessons) * 100) : 0,
        hasPreviewContent: previewLessons.length > 0,
        hasFullContent: fullLessons.length > 0,
        previewLessons: previewLessons.map(l => ({
            title: l.title,
            type: l.type,
            orderIndex: l.orderIndex
        })),
        recommendations: [] as string[]
    };

    // Generate recommendations
    if (analysis.previewCount === 0) {
        analysis.recommendations.push('Consider marking some lessons as preview to allow non-enrolled users to sample content');
    }
    
    if (analysis.previewCount === analysis.totalLessons) {
        analysis.recommendations.push('All lessons are preview - consider marking some as full content to encourage enrollment');
    }
    
    if (analysis.previewPercentage > 50) {
        analysis.recommendations.push('High percentage of preview content - consider reducing to maintain enrollment incentive');
    }
    
    if (analysis.previewPercentage < 10 && analysis.totalLessons > 5) {
        analysis.recommendations.push('Very low preview content - consider adding more preview lessons for better user experience');
    }

    return analysis;
};

/**
 * Console helper to display preview configuration analysis
 */
export const logPreviewAnalysis = async (courseSlug: string) => {
    const analysis = await verifyPreviewConfiguration(courseSlug);
    
    console.log(`\n📊 Preview Configuration Analysis for: ${courseSlug}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📚 Total Lessons: ${analysis.totalLessons}`);
    console.log(`👁️  Preview Lessons: ${analysis.previewCount} (${analysis.previewPercentage}%)`);
    console.log(`🔒 Full Lessons: ${analysis.fullCount}`);
    console.log(`✅ Has Preview Content: ${analysis.hasPreviewContent ? 'Yes' : 'No'}`);
    console.log(`✅ Has Full Content: ${analysis.hasFullContent ? 'Yes' : 'No'}`);
    
    if (analysis.previewLessons.length > 0) {
        console.log(`\n👁️  Preview Lessons:`);
        analysis.previewLessons.forEach((lesson, index) => {
            console.log(`   ${index + 1}. ${lesson.title} (${lesson.type}, order: ${lesson.orderIndex})`);
        });
    }
    
    if (analysis.recommendations.length > 0) {
        console.log(`\n💡 Recommendations:`);
        analysis.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec}`);
        });
    }
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    
    return analysis;
};
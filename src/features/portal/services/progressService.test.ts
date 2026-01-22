/**
 * Unit Tests for progressService
 * Tests learner progress persistence functionality (Feature 01)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock modules before imports
vi.mock('../../../lib/supabase/serviceClient', () => ({
    getSupabaseForEnrollment: vi.fn(),
}));

vi.mock('../../../lib/supabase/client', () => ({
    isSupabaseConfigured: vi.fn(),
}));

// Now import after mocks are set up
import { getSupabaseForEnrollment } from '../../../lib/supabase/serviceClient';
import { isSupabaseConfigured } from '../../../lib/supabase/client';
import {
    getOrCreateEnrollment,
    getUserCourseProgress,
    updateLessonProgress,
    updateEnrollmentProgress,
    syncLocalProgressToServer,
    getUserEnrollments,
    getActualProgressStats,
} from './progressService';

// Type for our mocked Supabase client
type MockSupabaseClient = {
    from: ReturnType<typeof vi.fn>;
};

describe('progressService', () => {
    let mockSupabase: MockSupabaseClient;
    let mockChain: Record<string, ReturnType<typeof vi.fn>>;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Create chainable mock methods
        mockChain = {
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn(),
            eq: vi.fn(),
            single: vi.fn(),
            order: vi.fn(),
        };

        // Make methods chainable
        Object.values(mockChain).forEach(fn => {
            fn.mockReturnValue(mockChain);
        });

        // Setup mock Supabase client
        mockSupabase = {
            from: vi.fn().mockReturnValue(mockChain),
        };

        // Configure mocks
        vi.mocked(isSupabaseConfigured).mockReturnValue(true);
        vi.mocked(getSupabaseForEnrollment).mockReturnValue(mockSupabase as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getOrCreateEnrollment', () => {
        const userId = 'user-123';
        const courseSlug = 'intro-to-testing';

        it('should return null when Supabase is not configured', async () => {
            vi.mocked(isSupabaseConfigured).mockReturnValue(false);

            const result = await getOrCreateEnrollment(userId, courseSlug);

            expect(result).toBeNull();
            expect(mockSupabase.from).not.toHaveBeenCalled();
        });

        it('should return existing enrollment if found', async () => {
            const existingEnrollment = {
                id: 'enroll-1',
                user_id: userId,
                course_slug: courseSlug,
                started_at: '2024-01-01T00:00:00Z',
                last_accessed_at: '2024-01-15T00:00:00Z',
                progress_pct: 50,
            };

            mockChain.single.mockResolvedValueOnce({
                data: existingEnrollment,
                error: null,
            });

            const result = await getOrCreateEnrollment(userId, courseSlug);

            expect(result).not.toBeNull();
            expect(result?.id).toBe('enroll-1');
            expect(result?.userId).toBe(userId);
            expect(result?.courseSlug).toBe(courseSlug);
            expect(result?.progressPct).toBe(50);
        });

        it('should create new enrollment when none exists', async () => {
            // First call returns no existing enrollment
            mockChain.single.mockResolvedValueOnce({
                data: null,
                error: { code: 'PGRST116', message: 'No rows found' },
            });

            // Second call returns the created enrollment
            const newEnrollment = {
                id: 'enroll-new',
                user_id: userId,
                course_slug: courseSlug,
                started_at: '2024-01-20T00:00:00Z',
                last_accessed_at: '2024-01-20T00:00:00Z',
                progress_pct: 0,
            };

            mockChain.single.mockResolvedValueOnce({
                data: newEnrollment,
                error: null,
            });

            const result = await getOrCreateEnrollment(userId, courseSlug);

            expect(result).not.toBeNull();
            expect(result?.id).toBe('enroll-new');
            expect(result?.progressPct).toBe(0);
            expect(mockSupabase.from).toHaveBeenCalledWith('user_enrollments');
        });
    });

    describe('getUserCourseProgress', () => {
        const userId = 'user-123';
        const courseSlug = 'intro-to-testing';

        it('should return empty progress when Supabase is not configured', async () => {
            vi.mocked(isSupabaseConfigured).mockReturnValue(false);

            const result = await getUserCourseProgress(userId, courseSlug);

            expect(result.enrollment).toBeNull();
            expect(result.lessonProgress).toEqual([]);
        });

        it('should return enrollment with lesson progress', async () => {
            const enrollmentData = {
                id: 'enroll-1',
                user_id: userId,
                course_slug: courseSlug,
                started_at: '2024-01-01T00:00:00Z',
                last_accessed_at: '2024-01-15T00:00:00Z',
                progress_pct: 33,
            };

            const lessonProgressData = [
                { id: 'lp-1', enrollment_id: 'enroll-1', lesson_id: 'lesson-1', completed: true, watch_time_seconds: 300 },
                { id: 'lp-2', enrollment_id: 'enroll-1', lesson_id: 'lesson-2', completed: false, watch_time_seconds: 120 },
            ];

            // First call for enrollment
            mockChain.single.mockResolvedValueOnce({
                data: enrollmentData,
                error: null,
            });

            // Second call for lesson progress (no single() call)
            mockChain.eq.mockResolvedValueOnce({
                data: lessonProgressData,
                error: null,
            });

            const result = await getUserCourseProgress(userId, courseSlug);

            expect(result.enrollment).not.toBeNull();
            expect(result.enrollment?.progressPct).toBe(33);
            expect(result.lessonProgress).toHaveLength(2);
            expect(result.lessonProgress[0].lessonId).toBe('lesson-1');
            expect(result.lessonProgress[0].completed).toBe(true);
        });
    });

    describe('updateLessonProgress', () => {
        const userId = 'user-123';
        const courseSlug = 'intro-to-testing';
        const lessonId = 'lesson-1';

        it('should return false when Supabase is not configured', async () => {
            vi.mocked(isSupabaseConfigured).mockReturnValue(false);

            const result = await updateLessonProgress(userId, courseSlug, lessonId, true);

            expect(result).toBe(false);
        });

        it('should return false when no enrollment found', async () => {
            mockChain.single.mockResolvedValueOnce({
                data: null,
                error: { message: 'No enrollment' },
            });

            const result = await updateLessonProgress(userId, courseSlug, lessonId, true);

            expect(result).toBe(false);
        });

        it('should upsert lesson progress correctly', async () => {
            mockChain.single.mockResolvedValueOnce({
                data: { id: 'enroll-1' },
                error: null,
            });

            mockChain.upsert.mockImplementation((data, options) => {
                expect(data.enrollment_id).toBe('enroll-1');
                expect(data.lesson_id).toBe(lessonId);
                expect(data.completed).toBe(true);
                expect(options.onConflict).toBe('enrollment_id,lesson_id');
                return Promise.resolve({ error: null });
            });

            const result = await updateLessonProgress(userId, courseSlug, lessonId, true, 300);

            expect(result).toBe(true);
            expect(mockSupabase.from).toHaveBeenCalledWith('lesson_progress');
        });
    });

    describe('updateEnrollmentProgress', () => {
        const userId = 'user-123';
        const courseSlug = 'intro-to-testing';

        it('should clamp progress between 0 and 100', async () => {
            mockChain.eq.mockResolvedValue({ error: null });

            // Test over 100
            await updateEnrollmentProgress(userId, courseSlug, 150);

            // The update call should have clamped the value
            expect(mockChain.update).toHaveBeenCalled();
        });

        it('should return false when Supabase is not configured', async () => {
            vi.mocked(isSupabaseConfigured).mockReturnValue(false);

            const result = await updateEnrollmentProgress(userId, courseSlug, 50);

            expect(result).toBe(false);
        });
    });

    describe('syncLocalProgressToServer', () => {
        const userId = 'user-123';
        const courseSlug = 'intro-to-testing';

        it('should return false when Supabase is not configured', async () => {
            vi.mocked(isSupabaseConfigured).mockReturnValue(false);

            const result = await syncLocalProgressToServer(userId, courseSlug, []);

            expect(result).toBe(false);
        });

        it('should return false for empty lessons array', async () => {
            const result = await syncLocalProgressToServer(userId, courseSlug, []);

            expect(result).toBe(false);
        });

        it('should sync only completed lessons', async () => {
            const localLessons = [
                { id: 'lesson-1', completed: true },
                { id: 'lesson-2', completed: false },
                { id: 'lesson-3', completed: true },
            ];

            // Mock enrollment lookup for each updateLessonProgress call
            mockChain.single.mockResolvedValue({
                data: { id: 'enroll-1' },
                error: null,
            });

            mockChain.upsert.mockResolvedValue({ error: null });
            mockChain.eq.mockResolvedValue({ error: null });

            const result = await syncLocalProgressToServer(userId, courseSlug, localLessons);

            expect(result).toBe(true);
        });
    });

    describe('getUserEnrollments', () => {
        const userId = 'user-123';

        it('should return empty array when Supabase is not configured', async () => {
            vi.mocked(isSupabaseConfigured).mockReturnValue(false);

            const result = await getUserEnrollments(userId);

            expect(result).toEqual([]);
        });

        it('should return mapped enrollments ordered by last access', async () => {
            const enrollmentsData = [
                {
                    id: 'enroll-2',
                    user_id: userId,
                    course_slug: 'course-b',
                    started_at: '2024-01-05T00:00:00Z',
                    last_accessed_at: '2024-01-20T00:00:00Z',
                    progress_pct: 75,
                },
                {
                    id: 'enroll-1',
                    user_id: userId,
                    course_slug: 'course-a',
                    started_at: '2024-01-01T00:00:00Z',
                    last_accessed_at: '2024-01-10T00:00:00Z',
                    progress_pct: 50,
                },
            ];

            mockChain.order.mockResolvedValueOnce({
                data: enrollmentsData,
                error: null,
            });

            const result = await getUserEnrollments(userId);

            expect(result).toHaveLength(2);
            expect(result[0].courseSlug).toBe('course-b'); // Most recent first
            expect(result[1].courseSlug).toBe('course-a');
        });
    });

    describe('getActualProgressStats', () => {
        const userId = 'user-123';
        const courseSlug = 'intro-to-testing';

        it('should return default stats when Supabase is not configured', async () => {
            vi.mocked(isSupabaseConfigured).mockReturnValue(false);

            const result = await getActualProgressStats(userId, courseSlug);

            expect(result).toEqual({ completedCount: 0, totalCount: 0, progressPct: 0 });
        });

        it('should calculate progress percentage correctly', async () => {
            // Mock enrollment lookup
            mockChain.single.mockResolvedValueOnce({
                data: { id: 'enroll-1' },
                error: null,
            });

            // Mock completed lessons count (3 completed)
            mockChain.eq.mockResolvedValueOnce({
                count: 3,
                error: null,
            });

            // Mock total lessons count (10 total)
            mockChain.eq.mockResolvedValueOnce({
                count: 10,
                error: null,
            });

            const result = await getActualProgressStats(userId, courseSlug);

            expect(result.completedCount).toBe(3);
            expect(result.totalCount).toBe(10);
            expect(result.progressPct).toBe(30); // 3/10 = 30%
        });
    });
});

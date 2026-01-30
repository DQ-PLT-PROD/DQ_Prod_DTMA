
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock dependencies
// Relative to this file (src/features/courses/services/instructorCourseService.test.ts)
vi.mock('../../../lib/supabase/client', () => ({
    getSupabase: vi.fn(),
    isSupabaseConfigured: vi.fn(() => true)
}));

vi.mock('@casl/ability', () => ({
    subject: vi.fn((name, obj) => ({ __caslSubjectType__: name, ...obj })),
}));

// Import SUT
import {
    listInstructorCourses,
    publishCourse,
    unpublishCourse,
    createDraftCourse,
    updateInstructorCourse,
    deleteDraftCourse
} from './instructorCourseService';
import { getSupabase } from '../../../lib/supabase/client';

describe('InstructorCourseService', () => {
    const mockSupabaseClient = {
        from: vi.fn(() => ({
            select: vi.fn(),
            insert: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        }))
    } as unknown as SupabaseClient;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSupabase).mockReturnValue(mockSupabaseClient);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('listInstructorCourses', () => {
        it('should list courses filtered by owner', async () => {
            const userId = 'instructor-123';
            const mockData = [{ slug: 'c1', title: 'C1' }];

            const selectMock = vi.fn().mockReturnValue({
                filter: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: mockData, error: null })
                })
            });

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: selectMock
            } as any);

            const result = await listInstructorCourses(userId);
            expect(result).toEqual(mockData);
            expect(selectMock).toHaveBeenCalled();
        });
    });

    describe('publishCourse', () => {
        it('should fail if course not owned by user', async () => {
            const userId = 'instructor-123';
            const otherUser = 'other-456';
            const courseSlug = 'c1';

            // Mock fetchCourseMinimal to return a course owned by otherUser
            const singleMock = vi.fn().mockResolvedValue({
                data: { slug: courseSlug, title: 'T', short_description: 'D', status: 'draft', owner_user_id: otherUser },
                error: null
            });

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: singleMock
                    })
                })
            } as any);

            const result = await publishCourse(courseSlug, userId);
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.message).toBe('Forbidden');
            }
        });

        it('should fail if title/description missing', async () => {
            const userId = 'instructor-123';
            const courseSlug = 'c1';

            const singleMock = vi.fn().mockResolvedValue({
                data: { slug: courseSlug, title: '', short_description: 'D', status: 'draft', owner_user_id: userId },
                error: null
            });

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: singleMock
                    })
                })
            } as any);

            const result = await publishCourse(courseSlug, userId);
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.message).toContain('Title is required');
            }
        });

        it('should succeed if all checks pass', async () => {
            const userId = 'instructor-123';
            const courseSlug = 'c1';

            // Fetch mock
            const singleMock = vi.fn().mockResolvedValue({
                data: { slug: courseSlug, title: 'Valid Title', short_description: 'Valid Desc', status: 'draft', owner_user_id: userId },
                error: null
            });

            // Update mock
            const updateMock = vi.fn().mockReturnValue({
                filter: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            });

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: singleMock
                    })
                }),
                update: updateMock
            } as any);

            const result = await publishCourse(courseSlug, userId);
            expect(result.ok).toBe(true);
            expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'published' }));
        });

        it('should enforce CASL ability check if provided', async () => {
            const userId = 'instructor-123';
            const courseSlug = 'c1';

            const singleMock = vi.fn().mockResolvedValue({
                data: { slug: courseSlug, title: 'Valid Title', short_description: 'Valid Desc', status: 'draft', owner_user_id: userId },
                error: null
            });

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: singleMock
                    })
                })
            } as any);

            const mockAbility = {
                can: vi.fn().mockReturnValue(false) // Deny
            } as any;

            const result = await publishCourse(courseSlug, userId, mockAbility);
            expect(result.ok).toBe(false);
            if (!result.ok) expect(result.message).toBe('Forbidden');
            expect(mockAbility.can).toHaveBeenCalled();
        });
    });

    describe('createDraftCourse', () => {
        it('should create a draft course', async () => {
            const userId = 'instructor-123';
            const payload = { slug: 'new-course', title: 'New Course' };

            const singleMock = vi.fn().mockResolvedValue({
                data: { slug: 'new-course' },
                error: null
            });
            const insertMock = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: singleMock
                })
            });

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                insert: insertMock
            } as any);

            const result = await createDraftCourse(userId, payload);
            expect(result).toEqual({ slug: 'new-course' });
            expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
                status: 'draft',
                owner_user_id: userId
            }));
        });
    });
});

/**
 * Unit Tests for Enrollment Service
 * Tests enrollment creation logic and enrollment lookup logic as per DTMA Spec requirement 9
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock the modules before importing the service
vi.mock('../../../../lib/supabase/serviceClient', () => ({
    getSupabaseForEnrollment: vi.fn(),
    isServiceRoleConfigured: vi.fn(() => true)
}));

vi.mock('../../../../lib/supabase/client', () => ({
    isSupabaseConfigured: vi.fn(() => true)
}));

// Import after mocking
import {
    isUserEnrolled,
    getEnrollment,
    enrollInCourse,
    canAccessLesson,
    validateEnrollmentEligibility
} from '../enrollmentService';
import { getSupabaseForEnrollment } from '../../../../lib/supabase/serviceClient';

describe('EnrollmentService', () => {
    const mockSupabaseClient = {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            single: vi.fn()
                        }))
                    }))
                }))
            })),
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn()
                }))
            }))
        }))
    } as unknown as SupabaseClient;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSupabaseForEnrollment).mockReturnValue(mockSupabaseClient);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('isUserEnrolled', () => {
        it('should return true when user is enrolled', async () => {
            // Arrange
            const userId = 'user-123';
            const courseSlug = 'test-course';
            const mockData = { id: 'enrollment-123', status: 'active' };

            const mockChain = {
                single: vi.fn().mockResolvedValue({
                    data: mockData,
                    error: null
                })
            };

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue(mockChain)
                        })
                    })
                })
            } as any);

            // Act
            const result = await isUserEnrolled(userId, courseSlug);

            // Assert
            expect(result).toBe(true);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_enrollments');
        });

        it('should return false when user is not enrolled', async () => {
            // Arrange
            const userId = 'user-123';
            const courseSlug = 'test-course';

            const mockChain = {
                single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' } // No record found
                })
            };

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue(mockChain)
                        })
                    })
                })
            } as any);

            // Act
            const result = await isUserEnrolled(userId, courseSlug);

            // Assert
            expect(result).toBe(false);
        });

        it('should return false on database error', async () => {
            // Arrange
            const userId = 'user-123';
            const courseSlug = 'test-course';

            const mockChain = {
                single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'UNKNOWN_ERROR', message: 'Database error' }
                })
            };

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue(mockChain)
                        })
                    })
                })
            } as any);

            // Act
            const result = await isUserEnrolled(userId, courseSlug);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('getEnrollment', () => {
        it('should return enrollment data when found', async () => {
            // Arrange
            const userId = 'user-123';
            const courseSlug = 'test-course';
            const mockData = {
                id: 'enrollment-123',
                user_id: userId,
                course_slug: courseSlug,
                started_at: '2025-01-13T00:00:00Z',
                status: 'active',
                enrollment_method: 'explicit'
            };

            const mockChain = {
                single: vi.fn().mockResolvedValue({
                    data: mockData,
                    error: null
                })
            };

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue(mockChain)
                    })
                })
            } as any);

            // Act
            const result = await getEnrollment(userId, courseSlug);

            // Assert
            expect(result).toEqual({
                id: 'enrollment-123',
                userId: userId,
                courseSlug: courseSlug,
                enrolledAt: '2025-01-13T00:00:00Z',
                status: 'active',
                enrollmentMethod: 'explicit'
            });
        });

        it('should return null when enrollment not found', async () => {
            // Arrange
            const userId = 'user-123';
            const courseSlug = 'test-course';

            const mockChain = {
                single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' }
                })
            };

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue(mockChain)
                    })
                })
            } as any);

            // Act
            const result = await getEnrollment(userId, courseSlug);

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('canAccessLesson', () => {
        it('should allow access to preview lessons for any user', async () => {
            // Act
            const result = await canAccessLesson(null, 'test-course', 'lesson-1', true);

            // Assert
            expect(result).toBe(true);
        });

        it('should deny access to non-preview lessons for unauthenticated users', async () => {
            // Act
            const result = await canAccessLesson(null, 'test-course', 'lesson-1', false);

            // Assert
            expect(result).toBe(false);
        });

        it('should allow access to non-preview lessons for enrolled users', async () => {
            // Arrange
            const userId = 'user-123';
            
            const mockChain = {
                single: vi.fn().mockResolvedValue({
                    data: { id: 'enrollment-123', status: 'active' },
                    error: null
                })
            };

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue(mockChain)
                        })
                    })
                })
            } as any);

            // Act
            const result = await canAccessLesson(userId, 'test-course', 'lesson-1', false);

            // Assert
            expect(result).toBe(true);
        });

        it('should deny access to non-preview lessons for non-enrolled users', async () => {
            // Arrange
            const userId = 'user-123';
            
            const mockChain = {
                single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' }
                })
            };

            vi.mocked(mockSupabaseClient.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue(mockChain)
                        })
                    })
                })
            } as any);

            // Act
            const result = await canAccessLesson(userId, 'test-course', 'lesson-1', false);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('validateEnrollmentEligibility', () => {
        it('should return eligible for authenticated users', async () => {
            // Act
            const result = await validateEnrollmentEligibility('user-123', 'test-course');

            // Assert
            expect(result.eligible).toBe(true);
            expect(result.reason).toBeUndefined();
        });

        it('should return not eligible for unauthenticated users', async () => {
            // Act
            const result = await validateEnrollmentEligibility('', 'test-course');

            // Assert
            expect(result.eligible).toBe(false);
            expect(result.reason).toBe('Authentication required');
        });
    });
});
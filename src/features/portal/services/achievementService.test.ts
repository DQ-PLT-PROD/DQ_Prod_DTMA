/**
 * Unit Tests for achievementService
 * Tests badge earning and XP tracking functionality
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock modules before imports
vi.mock('../../../lib/supabase/serviceClient', () => ({
    getSupabaseForEnrollment: vi.fn(),
}));

vi.mock('../../../lib/supabase/client', () => ({
    isSupabaseConfigured: vi.fn(),
}));

vi.mock('../../../lib/api/learningApiClient', () => ({
    learningApiClient: {
        recordQuizAttempt: vi.fn(),
        recordCourseCompletion: vi.fn(),
    },
}));

// Now import after mocks are set up
import { getSupabaseForEnrollment } from '../../../lib/supabase/serviceClient';
import { learningApiClient } from '../../../lib/api/learningApiClient';
import { isSupabaseConfigured } from '../../../lib/supabase/client';
import {
    earnBadge,
    getUserBadges,
    getBadgeByShareToken,
    recordQuizAttempt,
    recordCourseCompletion
} from './achievementService';

// Type for our mocked Supabase client
type MockSupabaseClient = {
    from: ReturnType<typeof vi.fn>;
};

describe('achievementService', () => {
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
            maybeSingle: vi.fn(),
            order: vi.fn(),
            limit: vi.fn(),
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

    describe('earnBadge', () => {
        const userId = 'user-123';
        const badgeSlug = 'first_quiz_completed';

        it('should return false when Supabase is not configured', async () => {
            vi.mocked(isSupabaseConfigured).mockReturnValue(false);
            const result = await earnBadge(userId, badgeSlug);
            expect(result).toBe(false);
        });

        it('should award badge successfully', async () => {
            // Mock finding badge definition
            mockChain.single.mockResolvedValueOnce({
                data: { id: 'badge-uuid-1' },
                error: null,
            });

            // Mock upserting earned badge
            mockChain.upsert.mockResolvedValueOnce({ error: null });

            const result = await earnBadge(userId, badgeSlug);

            expect(result).toBe(true);
            expect(mockSupabase.from).toHaveBeenCalledWith('badges');
            expect(mockSupabase.from).toHaveBeenCalledWith('earned_badges');
        });

        it('should return false if badge definition not found', async () => {
            mockChain.single.mockResolvedValueOnce({
                data: null,
                error: { message: 'Not found' },
            });

            const result = await earnBadge(userId, badgeSlug);

            expect(result).toBe(false);
        });
    });

    describe('getUserBadges', () => {
        const userId = 'user-123';

        it('should return empty array when Supabase is not configured', async () => {
            vi.mocked(isSupabaseConfigured).mockReturnValue(false);
            const result = await getUserBadges(userId);
            expect(result).toEqual([]);
        });

        it('should return mapped badges with joined definition', async () => {
            const mockData = [
                {
                    id: 'earned-1',
                    user_id: userId,
                    badge_id: 'badge-1',
                    earned_at: '2024-01-01T00:00:00Z',
                    share_token: 'token-1',
                    badges: {
                        id: 'badge-1',
                        slug: 'first_quiz_completed',
                        title: 'First Quiz',
                        description: 'Desc',
                        icon_url: 'icon.png',
                        category: 'Cat',
                        criteria_text: 'Criteria'
                    }
                }
            ];

            mockChain.order.mockResolvedValueOnce({
                data: mockData,
                error: null,
            });

            const result = await getUserBadges(userId);

            expect(result).toHaveLength(1);
            expect(result[0].badge.title).toBe('First Quiz');
            expect(result[0].shareToken).toBe('token-1');
        });
    });

    describe('getBadgeByShareToken', () => {
        const token = 'test-token';

        it('should return badge details for public share', async () => {
            const mockData = {
                id: 'earned-1',
                user_id: 'user-1',
                badge_id: 'badge-1',
                earned_at: '2024-01-01T00:00:00Z',
                share_token: token,
                badges: {
                    id: 'badge-1',
                    slug: 'first_quiz_completed',
                    title: 'First Quiz',
                    description: 'Desc',
                },
                users: {
                    name: 'John Doe',
                    email: 'john@example.com'
                }
            };

            mockChain.single.mockResolvedValueOnce({
                data: mockData,
                error: null,
            });

            const result = await getBadgeByShareToken(token);

            expect(result).not.toBeNull();
            expect(result?.badge.title).toBe('First Quiz');
            expect((result as any).userName).toBe('John Doe');
        });
    });

    describe('backend-owned writes', () => {
        it('records quiz attempts through the learning API', async () => {
            vi.mocked(learningApiClient.recordQuizAttempt).mockResolvedValueOnce({
                success: true,
                badge: { badge: { slug: 'first_quiz_completed' } },
            } as any);

            const result = await recordQuizAttempt('intro-to-testing', 80, true);

            expect(result).not.toBeNull();
            expect(learningApiClient.recordQuizAttempt).toHaveBeenCalledWith('intro-to-testing', 80, true);
        });

        it('records course completion through the learning API', async () => {
            vi.mocked(learningApiClient.recordCourseCompletion).mockResolvedValueOnce({
                success: true,
                badge: { badge: { slug: 'first_course_completed' } },
            } as any);

            const result = await recordCourseCompletion('intro-to-testing');

            expect(result).not.toBeNull();
            expect(learningApiClient.recordCourseCompletion).toHaveBeenCalledWith('intro-to-testing');
        });
    });
});

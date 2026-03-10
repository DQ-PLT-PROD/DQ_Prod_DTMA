import { learningApiClient } from "../../../lib/api/learningApiClient";
import { getSupabaseForEnrollment } from "../../../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../../../lib/supabase/client";

export type BadgeKey = "first_quiz_completed" | "first_course_completed";

export interface BadgeDefinition {
    id: string;
    slug: string;
    title: string;
    description: string;
    iconUrl?: string | null;
    category?: string | null;
    criteriaText?: string | null;
}

export interface UserBadge {
    id: string;
    userId: string;
    badgeId: string;
    earnedAt: string;
    shareToken?: string;
    badge: BadgeDefinition;
}

export interface UserXp {
    userId: string;
    totalXp: number;
}

export interface LeaderboardEntry {
    userId: string;
    totalXp: number;
    name?: string | null;
    email?: string | null;
}

const getAchievementSupabase = () => getSupabaseForEnrollment();

const mapBadgeRow = (row: any): UserBadge => ({
    id: row.id,
    userId: row.user_id,
    badgeId: row.badge_id,
    earnedAt: row.earned_at,
    shareToken: row.share_token,
    badge: {
        id: row.badges.id,
        slug: row.badges.slug,
        title: row.badges.title,
        description: row.badges.description,
        iconUrl: row.badges.icon_url,
        category: row.badges.category,
        criteriaText: row.badges.criteria_text,
    }
});

const mapXpRow = (row: any): UserXp => ({
    userId: row.user_id,
    totalXp: row.total_xp ?? 0,
});

export const earnBadge = async (userId: string, badgeSlug: string, context?: { type: string; id: string }): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        return false;
    }

    const supabase = getAchievementSupabase();

    // First find the badge definition by slug
    const { data: badgeDef, error: badgeError } = await (supabase.from("badges" as any) as any)
        .select("id")
        .eq("slug", badgeSlug)
        .single();

    if (badgeError || !badgeDef) {
        console.error("Badge definition not found:", badgeSlug, badgeError);
        return false;
    }

    const { error } = await (supabase.from("earned_badges" as any) as any)
        .upsert({
            user_id: userId,
            badge_id: (badgeDef as any).id,
            earned_at: new Date().toISOString(),
            context_type: context?.type,
            context_id: context?.id,
        }, { onConflict: "user_id,badge_id" });

    if (error) {
        console.error("Error awarding badge:", error);
        return false;
    }

    return true;
};

export const recordQuizAttempt = async (
    courseSlug: string,
    scorePct: number,
    passed: boolean
): Promise<UserBadge | null> => {
    const result = await learningApiClient.recordQuizAttempt(courseSlug, scorePct, passed);
    if (!result.success) {
        console.error("Error recording quiz attempt:", result.error);
        return null;
    }

    return result.badge;
};

export const recordCourseCompletion = async (
    courseSlug: string
): Promise<UserBadge | null> => {
    const result = await learningApiClient.recordCourseCompletion(courseSlug);
    if (!result.success) {
        console.error("Error recording course completion:", result.error);
        return null;
    }

    return result.badge;
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
    if (!isSupabaseConfigured()) {
        return [];
    }

    const supabase = getAchievementSupabase();
    const { data, error } = await (supabase.from("earned_badges" as any) as any)
        .select(`
            id,
            user_id,
            badge_id,
            earned_at,
            share_token,
            badges (
                id,
                slug,
                title,
                description,
                icon_url,
                category,
                criteria_text
            )
        `)
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });

    if (error || !data) {
        console.error("Error fetching user badges:", error);
        return [];
    }

    return data.map(mapBadgeRow);
};

export const getBadgeByShareToken = async (shareToken: string): Promise<UserBadge | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const supabase = getAchievementSupabase();
    const { data, error } = await (supabase.from("earned_badges" as any) as any)
        .select(`
            id,
            user_id,
            badge_id,
            earned_at,
            share_token,
            badges (
                id,
                slug,
                title,
                description,
                icon_url,
                category,
                criteria_text
            ),
            users (
                name,
                email
            )
        `)
        .eq("share_token", shareToken)
        .single();

    if (error || !data) {
        console.error("Error fetching badge by share token:", error);
        return null;
    }

    const badge = mapBadgeRow(data);
    // Add user info for public share page
    return {
        ...badge,
        userName: (data.users as any)?.name || (data.users as any)?.email?.split("@")[0] || "Learner"
    } as any;
};

export const getUserXp = async (userId: string): Promise<UserXp | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const supabase = getAchievementSupabase();
    const { data, error } = await supabase
        .from("user_xp")
        .select("user_id, total_xp")
        .eq("user_id", userId)
        .single();

    if (error || !data) {
        return null;
    }

    return mapXpRow(data);
};

export const getXpLeaderboard = async (limit = 5): Promise<LeaderboardEntry[]> => {
    if (!isSupabaseConfigured()) {
        return [];
    }

    const supabase = getAchievementSupabase();
    const { data, error } = await supabase
        .from("user_xp")
        .select("user_id, total_xp, users(name, email)")
        .order("total_xp", { ascending: false })
        .limit(limit);

    if (error || !data) {
        return [];
    }

    return data.map((row: any) => ({
        userId: row.user_id,
        totalXp: row.total_xp ?? 0,
        name: row.users?.name ?? null,
        email: row.users?.email ?? null,
    }));
};


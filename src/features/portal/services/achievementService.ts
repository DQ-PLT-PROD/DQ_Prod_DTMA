import { getSupabaseForEnrollment } from "../../../lib/supabase/serviceClient";
import { isSupabaseConfigured } from "../../../lib/supabase/client";

export type BadgeKey = "first_quiz_completed" | "first_course_completed";

const QUIZ_XP_AWARD = 100;
const COURSE_XP_AWARD = 200;

export interface UserBadge {
    id: string;
    userId: string;
    badgeKey: BadgeKey | string;
    awardedAt: string;
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
    badgeKey: row.badge_key,
    awardedAt: row.awarded_at,
});

const mapXpRow = (row: any): UserXp => ({
    userId: row.user_id,
    totalXp: row.total_xp ?? 0,
});

const upsertUserXp = async (userId: string, delta: number): Promise<UserXp | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const supabase = getAchievementSupabase();
    const { data: existing } = await supabase
        .from("user_xp")
        .select("user_id, total_xp")
        .eq("user_id", userId)
        .single();

    const nextTotal = Math.max(0, (existing?.total_xp ?? 0) + delta);

    const { data, error } = await supabase
        .from("user_xp")
        .upsert({
            user_id: userId,
            total_xp: nextTotal,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error("Error updating XP:", error);
        return null;
    }

    return data ? mapXpRow(data) : null;
};

const awardBadge = async (userId: string, badgeKey: BadgeKey): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        return false;
    }

    const supabase = getAchievementSupabase();
    const { error } = await supabase
        .from("user_badges")
        .upsert({
            user_id: userId,
            badge_key: badgeKey,
            awarded_at: new Date().toISOString(),
        }, { onConflict: "user_id,badge_key" });

    if (error) {
        console.error("Error awarding badge:", error);
        return false;
    }

    return true;
};

export const recordQuizAttempt = async (
    userId: string,
    courseSlug: string,
    scorePct: number,
    passed: boolean
): Promise<void> => {
    if (!isSupabaseConfigured()) {
        return;
    }

    const supabase = getAchievementSupabase();
    const { data: existing } = await supabase
        .from("quiz_attempts")
        .select("id")
        .eq("user_id", userId)
        .eq("course_slug", courseSlug)
        .single();

    const payload = {
        user_id: userId,
        course_slug: courseSlug,
        score_pct: scorePct,
        passed,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from("quiz_attempts")
        .upsert(payload, { onConflict: "user_id,course_slug" });

    if (error) {
        console.error("Error recording quiz attempt:", error);
        return;
    }

    if (!existing?.id) {
        await awardBadge(userId, "first_quiz_completed");
        await upsertUserXp(userId, QUIZ_XP_AWARD);
    }
};

export const recordCourseCompletion = async (
    userId: string,
    courseSlug: string
): Promise<void> => {
    if (!isSupabaseConfigured()) {
        return;
    }

    const supabase = getAchievementSupabase();
    const { data: existing } = await supabase
        .from("user_badges")
        .select("id")
        .eq("user_id", userId)
        .eq("badge_key", "first_course_completed")
        .single();

    if (!existing?.id) {
        await awardBadge(userId, "first_course_completed");
        await upsertUserXp(userId, COURSE_XP_AWARD);
    }

    await supabase
        .from("user_enrollments")
        .update({ updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("course_slug", courseSlug);
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
    if (!isSupabaseConfigured()) {
        return [];
    }

    const supabase = getAchievementSupabase();
    const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false });

    if (error || !data) {
        return [];
    }

    return data.map(mapBadgeRow);
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

export const BADGE_DEFINITIONS: Record<BadgeKey, { title: string; description: string }> = {
    first_quiz_completed: {
        title: "First Quiz Completed",
        description: "Completed your first course assessment.",
    },
    first_course_completed: {
        title: "First Course Completed",
        description: "Completed your first course end-to-end.",
    },
};

import { isSupabaseConfigured } from "../../../lib/supabase/client";
import { getSupabaseForEnrollment } from "../../../lib/supabase/serviceClient";

export type BadgeKey = "first_quiz_completed" | "first_course_completed";

const QUIZ_XP_AWARD = 100;
const COURSE_XP_AWARD = 200;

type ModuleRow = {
    id: string;
    slug: string;
};

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

const resolveModuleBySlug = async (moduleSlug: string): Promise<ModuleRow | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const supabase = getAchievementSupabase();
    const { data, error } = await supabase
        .from("modules")
        .select("id, slug")
        .eq("slug", moduleSlug)
        .maybeSingle();

    if (error) {
        console.error("Error resolving module for achievement:", error);
        return null;
    }

    return (data as ModuleRow | null) ?? null;
};

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

export const earnBadge = async (userId: string, badgeSlug: string, context?: { type: string; id: string }): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        return false;
    }

    const supabase = getAchievementSupabase();
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
    userId: string,
    courseSlug: string,
    scorePct: number,
    passed: boolean
): Promise<UserBadge | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const module = await resolveModuleBySlug(courseSlug);
    if (!module) {
        return null;
    }

    const supabase = getAchievementSupabase();
    const { data: existing } = await (supabase.from("module_quiz_attempts" as any) as any)
        .select("id")
        .eq("user_id", userId)
        .eq("module_id", module.id)
        .maybeSingle();

    const payload = {
        user_id: userId,
        module_id: module.id,
        score_pct: scorePct,
        passed,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const { error } = await (supabase.from("module_quiz_attempts" as any) as any)
        .upsert(payload, { onConflict: "user_id,module_id" });

    if (error) {
        console.error("Error recording quiz attempt:", error);
        return null;
    }

    if (!existing?.id) {
        await upsertUserXp(userId, QUIZ_XP_AWARD);
        const success = await earnBadge(userId, "first_quiz_completed", { type: "module", id: module.slug });
        if (success) {
            const badges = await getUserBadges(userId);
            return badges.find((badge) => badge.badge.slug === "first_quiz_completed") || null;
        }
    }

    return null;
};

export const recordCourseCompletion = async (
    userId: string,
    courseSlug: string
): Promise<UserBadge | null> => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const module = await resolveModuleBySlug(courseSlug);
    if (!module) {
        return null;
    }

    const supabase = getAchievementSupabase();
    const { data: badgeDef } = await (supabase.from("badges" as any) as any)
        .select("id")
        .eq("slug", "first_course_completed")
        .single();

    if (!badgeDef) {
        return null;
    }

    const { data: existing } = await (supabase.from("earned_badges" as any) as any)
        .select("id")
        .eq("user_id", userId)
        .eq("badge_id", (badgeDef as any).id)
        .maybeSingle();

    let earnedBadge: UserBadge | null = null;
    if (!existing?.id) {
        const success = await earnBadge(userId, "first_course_completed", { type: "module", id: module.slug });
        if (success) {
            const badges = await getUserBadges(userId);
            earnedBadge = badges.find((badge) => badge.badge.slug === "first_course_completed") || null;
        }
        await upsertUserXp(userId, COURSE_XP_AWARD);
    }

    await (supabase.from("module_enrollments" as any) as any)
        .update({ updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("module_id", module.id);

    return earnedBadge;
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

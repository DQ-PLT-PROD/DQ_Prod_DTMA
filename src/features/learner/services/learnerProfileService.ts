import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase/client";

export type RoleTrack = "digital_worker" | "leader";

export interface LearnerProfile {
    azureUserId: string;
    roleTrack: RoleTrack | null;
    goals: string[];
    preferences: string[];
    onboardingCompleted: boolean;
    onboardingCompletedAt: string | null;
}

export interface LearnerProfileResult {
    profile: LearnerProfile | null;
    error: Error | null;
}

export interface UpsertProfileInput {
    roleTrack?: RoleTrack | null;
    goals?: string[] | null;
    preferences?: string[] | null;
    onboardingCompleted?: boolean;
    onboardingCompletedAt?: string | null;
}

const mapRowToProfile = (row: any): LearnerProfile => ({
    azureUserId: row.azure_user_id,
    roleTrack: row.role_track ?? null,
    goals: Array.isArray(row.goals) ? row.goals : [],
    preferences: Array.isArray(row.preferences) ? row.preferences : [],
    onboardingCompleted: Boolean(row.onboarding_completed),
    onboardingCompletedAt: row.onboarding_completed_at ?? null,
});

const PROFILE_SELECT = "azure_user_id, role_track, goals, preferences, onboarding_completed, onboarding_completed_at";

export async function getLearnerProfile(azureUserId: string): Promise<LearnerProfileResult> {
    if (!isSupabaseConfigured()) {
        return { profile: null, error: new Error("Supabase not configured") };
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("users")
            .select(PROFILE_SELECT)
            .eq("azure_user_id", azureUserId)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return { profile: null, error: null };
            }
            return { profile: null, error: new Error(error.message || "Failed to fetch learner profile") };
        }

        return { profile: data ? mapRowToProfile(data) : null, error: null };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error fetching learner profile";
        return { profile: null, error: new Error(message) };
    }
}

export async function getProfile(azureUserId: string): Promise<LearnerProfile | null> {
    const result = await getLearnerProfile(azureUserId);
    if (result.error) {
        console.error("Error fetching learner profile:", result.error);
    }
    return result.profile;
}

export async function upsertProfile(
    azureUserId: string,
    input: UpsertProfileInput
): Promise<LearnerProfile | null> {
    if (!isSupabaseConfigured()) {
        console.warn("Supabase not configured; cannot update learner profile.");
        return null;
    }

    const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
    };

    if (input.roleTrack !== undefined) {
        updateData.role_track = input.roleTrack;
    }

    if (input.goals !== undefined) {
        updateData.goals = input.goals;
    }

    if (input.preferences !== undefined) {
        updateData.preferences = input.preferences;
    }

    if (input.onboardingCompleted !== undefined) {
        updateData.onboarding_completed = input.onboardingCompleted;
        if (input.onboardingCompleted) {
            updateData.onboarding_completed_at = input.onboardingCompletedAt || new Date().toISOString();
        } else if (input.onboardingCompletedAt === undefined) {
            updateData.onboarding_completed_at = null;
        }
    }

    if (input.onboardingCompletedAt !== undefined) {
        updateData.onboarding_completed_at = input.onboardingCompletedAt;
    }

    if (Object.keys(updateData).length === 1) {
        return getProfile(azureUserId);
    }

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from("users")
            .update(updateData)
            .eq("azure_user_id", azureUserId)
            .select(PROFILE_SELECT)
            .single();

        if (error) {
            console.error("Error updating learner profile:", error);
            return null;
        }

        return data ? mapRowToProfile(data) : null;
    } catch (err) {
        console.error("Unexpected error updating learner profile:", err);
        return null;
    }
}

export async function upsertLearnerProfile(
    azureUserId: string,
    input: UpsertProfileInput
): Promise<LearnerProfile | null> {
    return upsertProfile(azureUserId, input);
}

import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase/client";

export type RoleTrack = "digital_worker" | "leader";

export interface LearnerProfile {
    azureUserId: string;
    displayName: string | null;
    preferredEmail: string | null;
    phoneNumber: string | null;
    country: string | null;
    timezone: string | null;
    roleTrack: RoleTrack | null;
    goals: string[];
    preferences: string[];
    onboardingCompleted: boolean;
    onboardingCompletedAt: string | null;
    seniorityLevel: string | null;
    weeklyLearningCapacity: string | null;
    transformationExperience: string | null;
}

export interface LearnerProfileResult {
    profile: LearnerProfile | null;
    error: Error | null;
}

export interface UpsertProfileInput {
    displayName?: string | null;
    preferredEmail?: string | null;
    phoneNumber?: string | null;
    country?: string | null;
    timezone?: string | null;
    roleTrack?: RoleTrack | null;
    goals?: string[] | null;
    preferences?: string[] | null;
    onboardingCompleted?: boolean;
    onboardingCompletedAt?: string | null;
    seniorityLevel?: string | null;
    weeklyLearningCapacity?: string | null;
    transformationExperience?: string | null;
}

const mapRowToProfile = (row: any): LearnerProfile => ({
    azureUserId: row.azure_user_id,
    displayName: row.display_name ?? null,
    preferredEmail: row.preferred_email ?? null,
    phoneNumber: row.phone_number ?? null,
    country: row.country ?? null,
    timezone: row.timezone ?? null,
    roleTrack: row.role_track ?? null,
    goals: Array.isArray(row.goals) ? row.goals : [],
    preferences: Array.isArray(row.preferences) ? row.preferences : [],
    onboardingCompleted: Boolean(row.onboarding_completed),
    onboardingCompletedAt: row.onboarding_completed_at ?? null,
    seniorityLevel: row.seniority_level ?? null,
    weeklyLearningCapacity: row.weekly_learning_capacity ?? null,
    transformationExperience: row.transformation_experience ?? null,
});

const PROFILE_SELECT = "azure_user_id, display_name, preferred_email, phone_number, country, timezone, role_track, goals, preferences, onboarding_completed, onboarding_completed_at, seniority_level, weekly_learning_capacity, transformation_experience";

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

    if (input.displayName !== undefined) {
        updateData.display_name = input.displayName;
    }

    if (input.preferredEmail !== undefined) {
        updateData.preferred_email = input.preferredEmail;
    }

    if (input.phoneNumber !== undefined) {
        updateData.phone_number = input.phoneNumber;
    }

    if (input.country !== undefined) {
        updateData.country = input.country;
    }

    if (input.timezone !== undefined) {
        updateData.timezone = input.timezone;
    }

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

    if (input.seniorityLevel !== undefined) {
        updateData.seniority_level = input.seniorityLevel;
    }

    if (input.weeklyLearningCapacity !== undefined) {
        updateData.weekly_learning_capacity = input.weeklyLearningCapacity;
    }

    if (input.transformationExperience !== undefined) {
        updateData.transformation_experience = input.transformationExperience;
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

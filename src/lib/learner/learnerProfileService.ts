import { learnerProfileApiClient } from "../api/learnerProfileApiClient";

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

const mapProfile = (profile: any): LearnerProfile => ({
    azureUserId: profile.azureUserId,
    roleTrack: profile.roleTrack ?? null,
    goals: Array.isArray(profile.goals) ? profile.goals : [],
    preferences: Array.isArray(profile.preferences) ? profile.preferences : [],
    onboardingCompleted: Boolean(profile.onboardingCompleted),
    onboardingCompletedAt: profile.onboardingCompletedAt ?? null,
});

export async function getLearnerProfile(_azureUserId: string): Promise<LearnerProfileResult> {
    try {
        const result = await learnerProfileApiClient.getProfile();
        if (!result.success) {
            return {
                profile: null,
                error: result.error
                    ? new Error(result.error)
                    : new Error("Failed to fetch learner profile"),
            };
        }

        return {
            profile: result.profile ? mapProfile(result.profile) : null,
            error: null,
        };
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
    if (!Object.keys(input).length) {
        return getProfile(azureUserId);
    }

    try {
        const result = await learnerProfileApiClient.updateProfile(input);
        if (!result.success || !result.profile) {
            console.error("Error updating learner profile:", result.error);
            return null;
        }

        return mapProfile(result.profile);
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

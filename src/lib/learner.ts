export const getLearnerProfile = async (userId: string) => {
    return Promise.resolve({
        profile: {
            onboardingCompleted: false
        },
        error: null
    });
};

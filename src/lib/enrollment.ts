export interface AccessContract {
    isEnrolled: boolean;
    enrollmentStatus: string | null;
    subscriptionStatus: string | null;
}

export const getAccessContract = async (userId: string, courseSlug: string): Promise<AccessContract> => {
    return Promise.resolve({
        isEnrolled: false,
        enrollmentStatus: null,
        subscriptionStatus: null
    });
};

export const FEATURES = {
    // CORE FEATURES (Active)
    COURSE_MARKETPLACE: true,
    LEARNING_EXPERIENCE: true,
    USER_DASHBOARD_CORE: true, // Overview, Profile, Settings, Support
    ADMIN_COURSE_MANAGEMENT: true,
    AUTHENTICATION: true,

    // DEACTIVATED FEATURES (Inactive for MVP)
    GROWTH_AREAS: false,        // Growth Areas Marketplace & Landing
    OTHER_MARKETPLACES: false,  // Financial, Non-Financial, Knowledge Hub, Business Directory
    ADVANCED_FORMS: false,      // Funding, Loans, and other non-course forms

    // AI FEATURES (Inactive but integrated)
    AI_CHATBOT: false,          // Voiceflow KfBot
};

// Helper to check if a specific form is allowed
export const isFormActive = (formId: string): boolean => {
    const ACTIVE_FORMS_FOR_COURSES = [
        'needs-assessment', // Keeping generic assessment
        // Add others if strictly needed for courses
    ];

    if (FEATURES.ADVANCED_FORMS) return true;
    return ACTIVE_FORMS_FOR_COURSES.includes(formId);
};

// Learner module - shared learner profile services
import {
    getLearnerProfile,
    getProfile,
    upsertProfile,
    upsertLearnerProfile,
    type LearnerProfile,
    type LearnerProfileResult,
    type UpsertProfileInput,
    type RoleTrack
} from './learnerProfileService';

// Re-export functions
export {
    getLearnerProfile,
    getProfile,
    upsertProfile,
    upsertLearnerProfile
};

// Re-export types
export type {
    LearnerProfile,
    LearnerProfileResult,
    UpsertProfileInput,
    RoleTrack
};

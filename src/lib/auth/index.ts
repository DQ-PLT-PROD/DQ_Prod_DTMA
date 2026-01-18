// Auth module - shared authentication context and services
export { AuthProvider, useAuth } from './AuthContext';
export { fetchUserFromGraph, mergeGraphUserData } from './graphService';
export type { GraphUser } from './graphService';
export {
    syncUserWithDatabase,
    getUserByAzureId,
    updateUserLastLogin,
    updateUserProfile
} from './userService';
export type { DatabaseUser, UserProfile } from './userService';

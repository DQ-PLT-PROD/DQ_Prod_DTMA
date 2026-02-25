import type { Session, User } from '@supabase/supabase-js';
import type { MongoAbility } from '@casl/ability';

export type AdminRole = 'admin' | 'instructor' | 'editor' | 'viewer';
export type AdminMembershipStatus = 'active' | 'inactive';

export interface AdminMembership {
    id: string;
    user_id: string;
    role: AdminRole;
    status: AdminMembershipStatus;
    created_at: string;
    updated_at: string;
}

export type AdminAction =
    | 'manage'
    | 'read'
    | 'create'
    | 'update'
    | 'delete'
    | 'publish'
    | 'unpublish'
    | 'upload';

export type AdminSubject =
    | 'Dashboard'
    | 'Course'
    | 'Module'
    | 'Lesson'
    | 'Category'
    | 'Media'
    | 'all';

export type AdminAbility = MongoAbility<[AdminAction, AdminSubject]>;

export interface AdminAuthContextType {
    session: Session | null;
    user: User | null;
    membership: AdminMembership | null;
    ability: AdminAbility;
    hasActiveMembership: boolean;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    refresh: () => Promise<void>;
}

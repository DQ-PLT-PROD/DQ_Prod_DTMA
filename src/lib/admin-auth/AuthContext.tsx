import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';
import { buildAdminAbility } from './ability';
import type { AdminAuthContextType, AdminMembership } from './types';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

async function getActiveMembership(userId: string): Promise<AdminMembership | null> {
    const supabase = getSupabase() as any;
    const { data, error } = await supabase
        .from('admin_memberships')
        .select('id, user_id, role, status, created_at, updated_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

    if (error) {
        // PGRST116 => no rows, not an operational error
        if ((error as { code?: string }).code !== 'PGRST116') {
            console.error('Failed to load admin membership:', error);
        }
        return null;
    }

    return (data as AdminMembership | null) ?? null;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [membership, setMembership] = useState<AdminMembership | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const supabase = getSupabase();
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                throw error;
            }

            const nextSession = data.session ?? null;
            const nextUser = nextSession?.user ?? null;

            setSession(nextSession);
            setUser(nextUser);

            if (nextUser?.id) {
                const activeMembership = await getActiveMembership(nextUser.id);
                setMembership(activeMembership);
            } else {
                setMembership(null);
            }
        } catch (error) {
            console.error('Failed to refresh admin auth state:', error);
            setSession(null);
            setUser(null);
            setMembership(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        let supabase: ReturnType<typeof getSupabase> | null = null;

        try {
            supabase = getSupabase();
        } catch {
            if (isMounted) {
                setIsLoading(false);
                setSession(null);
                setUser(null);
                setMembership(null);
            }
            return () => {
                isMounted = false;
            };
        }

        const bootstrap = async () => {
            await refresh();
        };

        bootstrap();

        const { data } = supabase.auth.onAuthStateChange(
            async (_event: AuthChangeEvent, nextSession: Session | null) => {
                if (!isMounted) {
                    return;
                }

                const nextUser = nextSession?.user ?? null;
                setSession(nextSession);
                setUser(nextUser);

                if (nextUser?.id) {
                    const activeMembership = await getActiveMembership(nextUser.id);
                    if (isMounted) {
                        setMembership(activeMembership);
                    }
                } else {
                    setMembership(null);
                }
            }
        );

        return () => {
            isMounted = false;
            data.subscription.unsubscribe();
        };
    }, [refresh]);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const supabase = getSupabase();
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                return { error: error.message };
            }

            await refresh();
            return {};
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Sign in failed';
            return { error: message };
        }
    }, [refresh]);

    const signOut = useCallback(async () => {
        try {
            const supabase = getSupabase();
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Failed to sign out admin session:', error);
        }
        setSession(null);
        setUser(null);
        setMembership(null);
    }, []);

    const ability = useMemo(
        () => buildAdminAbility(membership?.role ?? null, membership),
        [membership]
    );

    const value = useMemo<AdminAuthContextType>(() => ({
        session,
        user,
        membership,
        ability,
        hasActiveMembership: Boolean(membership?.status === 'active'),
        isLoading,
        signIn,
        signOut,
        refresh,
    }), [ability, isLoading, membership, refresh, session, signIn, signOut, user]);

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth(): AdminAuthContextType {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}

export function useAdminAuthOptional(): AdminAuthContextType | null {
    return useContext(AdminAuthContext) ?? null;
}

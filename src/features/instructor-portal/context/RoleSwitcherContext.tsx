/**
 * Role Switcher Context
 * 
 * Provides a context for switching between Learner and Instructor roles.
 * The role is persisted in localStorage for session persistence.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'learner' | 'instructor';

interface RoleSwitcherContextType {
    currentRole: UserRole;
    setRole: (role: UserRole) => void;
    toggleRole: () => void;
    isInstructor: boolean;
    isLearner: boolean;
}

const RoleSwitcherContext = createContext<RoleSwitcherContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'dtma_user_role';

interface RoleSwitcherProviderProps {
    children: ReactNode;
}

export function RoleSwitcherProvider({ children }: RoleSwitcherProviderProps) {
    const [currentRole, setCurrentRole] = useState<UserRole>(() => {
        // Initialize from localStorage or default to 'learner'
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(ROLE_STORAGE_KEY);
            if (stored === 'instructor' || stored === 'learner') {
                return stored;
            }
        }
        return 'learner';
    });

    // Persist role changes to localStorage
    useEffect(() => {
        localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
    }, [currentRole]);

    const setRole = (role: UserRole) => {
        setCurrentRole(role);
    };

    const toggleRole = () => {
        setCurrentRole(prev => prev === 'learner' ? 'instructor' : 'learner');
    };

    const value: RoleSwitcherContextType = {
        currentRole,
        setRole,
        toggleRole,
        isInstructor: currentRole === 'instructor',
        isLearner: currentRole === 'learner',
    };

    return (
        <RoleSwitcherContext.Provider value={value}>
            {children}
        </RoleSwitcherContext.Provider>
    );
}

export function useRoleSwitcher(): RoleSwitcherContextType {
    const context = useContext(RoleSwitcherContext);
    if (context === undefined) {
        throw new Error('useRoleSwitcher must be used within a RoleSwitcherProvider');
    }
    return context;
}

// Optional hook that doesn't throw if used outside provider
export function useRoleSwitcherOptional(): RoleSwitcherContextType | null {
    return useContext(RoleSwitcherContext) ?? null;
}

export default RoleSwitcherContext;

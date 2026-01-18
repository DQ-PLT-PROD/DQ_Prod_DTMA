import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';  // no react-router imports needed
import { useAuth } from '@/lib/auth';

/**
 * AuthRedirectHandler - Provides a smooth transition overlay during post-login redirects.
 * 
 * This component listens for authentication state changes after MSAL redirect
 * and provides visual feedback to the user during the transition period.
 */
export const AuthRedirectHandler: React.FC = () => {
    const { user, isLoading } = useAuth();
    // const location = useLocation();
    // const navigate = useNavigate();
    const [showTransition, setShowTransition] = useState(false);
    const [wasUnauthenticated, setWasUnauthenticated] = useState(false);

    // Track when user transitions from unauthenticated to authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            setWasUnauthenticated(true);
        }
    }, [isLoading, user]);

    // Handle the transition when user becomes authenticated
    useEffect(() => {
        if (user && wasUnauthenticated) {
            console.log('🔄 AuthRedirectHandler: User just logged in, showing transition...');
            setShowTransition(true);
            setWasUnauthenticated(false);

            // Hide transition after a brief moment
            const timer = setTimeout(() => {
                setShowTransition(false);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [user, wasUnauthenticated]);

    // Don't render anything if not showing transition
    if (!showTransition) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-opacity duration-500"
            style={{ opacity: showTransition ? 1 : 0 }}
        >
            <div className="text-center">
                {/* Animated logo/spinner */}
                <div className="mb-6">
                    <div className="w-16 h-16 mx-auto border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                </div>

                {/* Welcome message */}
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Welcome back!
                </h2>
                <p className="text-slate-400">
                    {user?.displayName ? `Hello, ${user.displayName}` : 'Preparing your experience...'}
                </p>
            </div>
        </div>
    );
};

export default AuthRedirectHandler;

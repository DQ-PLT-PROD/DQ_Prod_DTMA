import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../../../components/loading';

/**
 * Guards routes behind MSAL auth. If unauthenticated, triggers login and
 * renders nothing while redirecting. If you prefer redirecting to home
 * instead of auto-login, set `AUTO_LOGIN` to false below.
 */
const AUTO_LOGIN = true;

const ProtectedRoute: React.FC<PropsWithChildren> = ({ children }) => {
    const { user, isLoading, login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [hasTriggeredLogin, setHasTriggeredLogin] = useState(false);

    // Not authenticated: either auto-login or redirect to home
    useEffect(() => {
        if (!isLoading && !user && AUTO_LOGIN && !hasTriggeredLogin) {
            console.log('🔒 ProtectedRoute: User not authenticated, triggering login...');
            setHasTriggeredLogin(true);
            // Kick off MSAL redirect sign-in flow
            // MSAL will remember current URL so user returns to the same route
            login();
        }
    }, [isLoading, user, login, hasTriggeredLogin]);

    // Reset login trigger when user becomes authenticated
    useEffect(() => {
        if (user && hasTriggeredLogin) {
            console.log('✅ ProtectedRoute: User authenticated, resetting login trigger');
            setHasTriggeredLogin(false);

            // If user just logged in and is trying to access a protected route,
            // redirect them to the learning page instead
            if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/forms')) {
                console.log('🎓 Redirecting newly authenticated user to portal...');
                navigate('/portal', { replace: true });
            }
        }
    }, [user, hasTriggeredLogin, location.pathname, navigate]);

    // While determining auth state, don't render or redirect
    if (isLoading) {
        console.log('🔄 ProtectedRoute: Loading authentication state...');
        return <PageLoader variant="minimal" message="Authenticating..." />;
    }

    // If authenticated, render the protected content
    if (user) {
        console.log('✅ ProtectedRoute: User authenticated, rendering content');
        return <>{children}</>;
    }

    console.log('❌ ProtectedRoute: User not authenticated');

    if (AUTO_LOGIN) {
        return <PageLoader variant="minimal" message="Signing you in..." />;
    }

    return <Navigate to="/" state={{ from: location }} replace />;
};

export default ProtectedRoute;

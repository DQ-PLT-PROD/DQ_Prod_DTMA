import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AuthRedirectHandlerProps {
    targetPath?: string;
}

/**
 * A friendly transition screen shown after successful login.
 * Displays a welcome message and redirects to the portal after a short delay.
 */
export const AuthRedirectHandler: React.FC<AuthRedirectHandlerProps> = ({
    targetPath = '/portal'
}) => {
    const { user, isRedirecting, setIsRedirecting } = useAuth();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(2);

    useEffect(() => {
        if (!isRedirecting) return;

        // Countdown timer
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Redirect after delay
        const redirectTimer = setTimeout(() => {
            setIsRedirecting(false);
            navigate(targetPath, { replace: true });
        }, 2000);

        return () => {
            clearInterval(countdownInterval);
            clearTimeout(redirectTimer);
        };
    }, [isRedirecting, navigate, targetPath, setIsRedirecting]);

    if (!isRedirecting) {
        return null;
    }

    const userName = user?.name || 'there';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="text-center max-w-md px-6">
                {/* Animated Logo/Icon */}
                <div className="mb-8">
                    <div className="relative mx-auto w-20 h-20">
                        {/* Outer spinning ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping"></div>
                        {/* Inner pulsing circle */}
                        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 animate-pulse flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Welcome Message */}
                <h1 className="text-3xl font-bold text-white mb-3">
                    Welcome, {userName}!
                </h1>

                <p className="text-lg text-blue-200 mb-6">
                    Taking you to the learning portal...
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-700/50 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${((2 - countdown) / 2) * 100}%` }}
                    ></div>
                </div>

                {/* Subtle hint */}
                <p className="text-sm text-slate-400">
                    Preparing your personalized experience
                </p>
            </div>
        </div>
    );
};

export default AuthRedirectHandler;

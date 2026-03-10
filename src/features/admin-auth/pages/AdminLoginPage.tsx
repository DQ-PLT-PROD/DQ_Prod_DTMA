import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/lib/admin-auth';

type LoginState = {
    from?: string;
};

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn, session, hasActiveMembership, isLoading } = useAdminAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const redirectTo = ((location.state as LoginState | null)?.from) || '/instructor/dashboard';

    useEffect(() => {
        if (!isLoading && session && hasActiveMembership) {
            navigate(redirectTo, { replace: true });
        }
    }, [hasActiveMembership, isLoading, navigate, redirectTo, session]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        const result = await signIn(email.trim(), password);
        if (result.error) {
            setError(result.error);
            setSubmitting(false);
            return;
        }

        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                <h1 className="text-xl font-semibold text-gray-900">Admin Sign In</h1>
                <p className="text-sm text-gray-600 mt-2">
                    Sign in with an account that has admin membership to access instructor tools.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-email">
                            Email
                        </label>
                        <input
                            id="admin-email"
                            type="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="admin@company.com"
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-password">
                            Password
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your password"
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                            <p className="whitespace-pre-wrap break-all">{error}</p>
                        </div>
                    )}


                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

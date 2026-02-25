import React, { type PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/lib/admin-auth';

const Loader = ({ label }: { label: string }) => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">{label}</p>
        </div>
    </div>
);

export default function AdminProtectedRoute({ children }: PropsWithChildren) {
    const location = useLocation();
    const { user, session, hasActiveMembership, isLoading } = useAdminAuth();

    if (isLoading) {
        return <Loader label="Checking admin session..." />;
    }

    if (!session || !user) {
        return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    }

    if (!hasActiveMembership) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h1 className="text-lg font-semibold text-gray-900">Admin Access Required</h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Your account is authenticated but does not have an active admin membership.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

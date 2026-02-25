import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/lib/admin-auth';

export default function AdminLogoutPage() {
    const navigate = useNavigate();
    const { signOut } = useAdminAuth();

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            await signOut();
            if (!cancelled) {
                navigate('/admin/login', { replace: true });
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [navigate, signOut]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-2 text-gray-600">Signing out...</p>
            </div>
        </div>
    );
}

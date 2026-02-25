import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import AdminProtectedRoute from '../AdminProtectedRoute';
import { useAdminAuth } from '@/lib/admin-auth';

vi.mock('@/lib/admin-auth', () => ({
    useAdminAuth: vi.fn(),
}));

describe('AdminProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading state while auth is initializing', () => {
        vi.mocked(useAdminAuth).mockReturnValue({
            session: null,
            user: null,
            membership: null,
            ability: {} as any,
            hasActiveMembership: false,
            isLoading: true,
            signIn: vi.fn(),
            signOut: vi.fn(),
            refresh: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={['/instructor/dashboard']}>
                <AdminProtectedRoute>
                    <div>Protected Content</div>
                </AdminProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText('Checking admin session...')).toBeInTheDocument();
    });

    it('redirects unauthenticated users to /admin/login', () => {
        vi.mocked(useAdminAuth).mockReturnValue({
            session: null,
            user: null,
            membership: null,
            ability: {} as any,
            hasActiveMembership: false,
            isLoading: false,
            signIn: vi.fn(),
            signOut: vi.fn(),
            refresh: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={['/instructor/dashboard']}>
                <Routes>
                    <Route
                        path="/instructor/dashboard"
                        element={
                            <AdminProtectedRoute>
                                <div>Protected Content</div>
                            </AdminProtectedRoute>
                        }
                    />
                    <Route path="/admin/login" element={<div>Admin Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Admin Login Page')).toBeInTheDocument();
    });

    it('blocks authenticated users without active membership', () => {
        vi.mocked(useAdminAuth).mockReturnValue({
            session: { access_token: 'token' } as any,
            user: { id: 'user-1' } as any,
            membership: null,
            ability: {} as any,
            hasActiveMembership: false,
            isLoading: false,
            signIn: vi.fn(),
            signOut: vi.fn(),
            refresh: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={['/instructor/dashboard']}>
                <AdminProtectedRoute>
                    <div>Protected Content</div>
                </AdminProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText('Admin Access Required')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders children for authenticated users with active membership', () => {
        vi.mocked(useAdminAuth).mockReturnValue({
            session: { access_token: 'token' } as any,
            user: { id: 'user-1' } as any,
            membership: { id: 'membership-1', user_id: 'user-1', role: 'admin', status: 'active' } as any,
            ability: {} as any,
            hasActiveMembership: true,
            isLoading: false,
            signIn: vi.fn(),
            signOut: vi.fn(),
            refresh: vi.fn(),
        });

        render(
            <MemoryRouter initialEntries={['/instructor/dashboard']}>
                <AdminProtectedRoute>
                    <div>Protected Content</div>
                </AdminProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
});

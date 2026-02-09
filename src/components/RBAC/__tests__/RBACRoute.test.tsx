
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RBACRoute } from '../RBACRoute';
import { useAbilityContext } from '../../../context/AbilityContext';
import { useLocation } from 'react-router-dom';
import * as abilitiesConfig from '../../../config/abilities';

// Mock dependencies
vi.mock('../../../context/AbilityContext', () => ({
    useAbilityContext: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useLocation: vi.fn(),
}));

vi.mock('../../../config/abilities', () => ({
    getRoutePermission: vi.fn(),
    isRouteProtected: vi.fn(),
    Actions: {},
    Subjects: {}
}));

// Mock the Forbidden component
vi.mock('../Forbidden', () => ({
    Forbidden: ({ message }: { message: string }) => <div data-testid="forbidden">{message}</div>,
}));

describe('RBACRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders children when ability allows (explicit args)', () => {
        const mockAbility = {
            can: vi.fn().mockReturnValue(true),
        };
        vi.mocked(useAbilityContext).mockReturnValue({
            ability: mockAbility,
            role: 'instructor'
        } as any);
        vi.mocked(useLocation).mockReturnValue({ pathname: '/instructor' } as any);

        render(
            <RBACRoute subject="Course" action="create">
                <div data-testid="child">Protected Content</div>
            </RBACRoute>
        );

        expect(screen.getByTestId('child')).toBeInTheDocument();
        expect(mockAbility.can).toHaveBeenCalledWith('create', 'Course');
    });

    it('renders Forbidden when ability denies (explicit args)', () => {
        const mockAbility = {
            can: vi.fn().mockReturnValue(false),
        };
        vi.mocked(useAbilityContext).mockReturnValue({
            ability: mockAbility,
            role: 'learner'
        } as any);
        vi.mocked(useLocation).mockReturnValue({ pathname: '/instructor' } as any);

        render(
            <RBACRoute subject="Course" action="create">
                <div>Protected Content</div>
            </RBACRoute>
        );

        expect(screen.queryByTestId('child')).not.toBeInTheDocument();
        expect(screen.getByTestId('forbidden')).toHaveTextContent(/You do not have permission/);
    });

    it('infers permission from route if args missing', () => {
        const mockAbility = {
            can: vi.fn().mockReturnValue(true),
        };
        vi.mocked(useAbilityContext).mockReturnValue({
            ability: mockAbility,
            role: 'instructor'
        } as any);
        vi.mocked(useLocation).mockReturnValue({ pathname: '/auto-route' } as any);

        vi.mocked(abilitiesConfig.getRoutePermission).mockReturnValue({ action: 'read', subject: 'Dashboard' } as any);

        render(
            <RBACRoute>
                <div data-testid="child">Auto Content</div>
            </RBACRoute>
        );

        expect(abilitiesConfig.getRoutePermission).toHaveBeenCalledWith('/auto-route');
        expect(mockAbility.can).toHaveBeenCalledWith('read', 'Dashboard');
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });
});

import { describe, expect, it } from 'vitest';
import { buildAdminAbility } from './ability';

describe('buildAdminAbility', () => {
    it('returns read-only access for viewer role', () => {
        const ability = buildAdminAbility('viewer');

        expect(ability.can('read', 'Course')).toBe(true);
        expect(ability.can('create', 'Course')).toBe(false);
        expect(ability.can('delete', 'Course')).toBe(false);
    });

    it('returns non-destructive write access for editor role', () => {
        const ability = buildAdminAbility('editor');

        expect(ability.can('create', 'Course')).toBe(true);
        expect(ability.can('update', 'Lesson')).toBe(true);
        expect(ability.can('publish', 'Course')).toBe(true);
        expect(ability.can('publish', 'Module')).toBe(true);
        expect(ability.can('delete', 'Course')).toBe(false);
        expect(ability.can('delete', 'Media')).toBe(false);
    });

    it('returns full content CRUD for instructor role', () => {
        const ability = buildAdminAbility('instructor');

        expect(ability.can('delete', 'Course')).toBe(true);
        expect(ability.can('delete', 'Module')).toBe(true);
        expect(ability.can('delete', 'Lesson')).toBe(true);
        expect(ability.can('publish', 'Module')).toBe(true);
        expect(ability.can('upload', 'Media')).toBe(true);
        expect(ability.can('delete', 'Media')).toBe(true);
    });

    it('returns global manage access for admin role', () => {
        const ability = buildAdminAbility('admin');

        expect(ability.can('manage', 'all')).toBe(true);
        expect(ability.can('delete', 'Course')).toBe(true);
        expect(ability.can('delete', 'Media')).toBe(true);
    });

    it('returns no permissions when role is null', () => {
        const ability = buildAdminAbility(null);

        expect(ability.can('read', 'Course')).toBe(false);
        expect(ability.can('manage', 'all')).toBe(false);
    });
});

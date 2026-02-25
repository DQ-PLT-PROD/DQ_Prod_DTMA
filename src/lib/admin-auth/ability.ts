import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import type { AdminAbility, AdminMembership, AdminRole } from './types';

export function buildAdminAbility(
    role: AdminRole | null,
    _membership?: AdminMembership | null
): AdminAbility {
    const { can, build } = new AbilityBuilder<AdminAbility>(createMongoAbility);

    if (!role) {
        return build();
    }

    if (role === 'admin') {
        can('manage', 'all');
        return build();
    }

    can('read', 'Dashboard');
    can('read', 'Course');
    can('read', 'Module');
    can('read', 'Lesson');
    can('read', 'Category');
    can('read', 'Media');

    if (role === 'instructor') {
        can('create', 'Course');
        can('update', 'Course');
        can('delete', 'Course');
        can('publish', 'Course');
        can('unpublish', 'Course');

        can('create', 'Module');
        can('update', 'Module');
        can('delete', 'Module');

        can('create', 'Lesson');
        can('update', 'Lesson');
        can('delete', 'Lesson');

        can('create', 'Category');
        can('update', 'Category');
        can('delete', 'Category');

        can('upload', 'Media');
        can('delete', 'Media');
    }

    if (role === 'editor') {
        can('create', 'Course');
        can('update', 'Course');
        can('publish', 'Course');
        can('unpublish', 'Course');

        can('create', 'Module');
        can('update', 'Module');

        can('create', 'Lesson');
        can('update', 'Lesson');

        can('create', 'Category');
        can('update', 'Category');

        can('upload', 'Media');
    }

    return build();
}

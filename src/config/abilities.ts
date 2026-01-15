import { defineAbility, type MongoAbility } from '@casl/ability';
import { match } from 'path-to-regexp';

export type Subjects =
  | 'onboarding'
  | 'user-dashboard'
  | 'user-forms'
  | 'user-documents'
  | 'user-requests'
  | 'user-reporting'
  | 'user-profile'
  | 'user-settings'
  | 'user-help-center'
  | 'instructor-dashboard'
  | 'course'
  | 'course-resource'
  | 'marketplace'
  | 'public-content'
  | 'all';

export type Actions =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'download'
  | 'publish'
  | 'archive'
  | 'approve'
  | 'unpublish';
export type AppAbility = MongoAbility<[Actions, Subjects]>;

// Roles supported by this app. We only need `instructor` for now, but include
// a few common ones for future-proofing and safer defaults.
export type Role =
  | 'instructor'
  | 'admin'
  | 'approver'
  | 'creator'
  | 'contributor'
  | 'viewer'
  | 'advisor';

export const ALLOWED_ROLES: Role[] = [
  'instructor',
  'admin',
  'approver',
  'creator',
  'contributor',
  'viewer',
  'advisor',
];

// Define abilities for a given role
// For `instructor`, mirror EXACTLY the "creator" role in MZN-EJP-v2
export function defineAbilityFor(role?: Role, currentUserId?: string): AppAbility {
  if (role === 'admin') {
    return defineAbility<AppAbility>((can) => {
      can('read', 'onboarding');
      can('create', 'onboarding');
      can('update', 'onboarding');

      can('read', 'user-dashboard');

      can('read', 'user-documents');
      can('create', 'user-documents');
      can('update', 'user-documents');
      can('delete', 'user-documents');
      can('download', 'user-documents');

      can('read', 'user-requests');
      can('create', 'user-requests');
      can('update', 'user-requests');
      can('delete', 'user-requests');

      can('read', 'user-reporting');
      can('create', 'user-reporting');
      can('update', 'user-reporting');
      can('delete', 'user-reporting');

      can('manage', 'user-profile');
      can('read', 'user-settings');
      can('update', 'user-settings');
      can('create', 'user-settings');

      can('read', 'user-dashboard');
      can('read', 'user-help-center');
      can('update', 'user-help-center');

      can('read', 'user-forms');
      can('create', 'user-forms');
      can('update', 'user-forms');
      can('delete', 'user-forms');
    });
  }

  // Instructor role with EXACT same permissions as "creator" in MZN-EJP-v2
  if (role === 'instructor') {
    return defineAbility<AppAbility>((can, cannot) => {
      // Access instructor dashboard
      can('read', 'instructor-dashboard');

      // Course permissions scoped by ownership
      can('create', 'course');
      if (currentUserId) {
        const canAny = can as unknown as (
          action: Actions,
          subject: Subjects,
          fieldsOrConditions?: any,
          maybeConditions?: any
        ) => void;
        canAny('read', 'course', undefined, { owner_user_id: currentUserId });
        canAny('update', 'course', undefined, { owner_user_id: currentUserId });
        canAny('publish', 'course', undefined, { owner_user_id: currentUserId });
        canAny('unpublish', 'course', undefined, { owner_user_id: currentUserId });
        // Delete allowed only for drafts
        canAny('delete', 'course', undefined, { owner_user_id: currentUserId, status: 'draft' });
      } else {
        cannot('read', 'course');
        cannot('update', 'course');
        cannot('publish', 'course');
        cannot('unpublish', 'course');
        cannot('delete', 'course');
      }

      // Manage course resources (ownership validated at service level)
      can('create', 'course-resource');
      can('update', 'course-resource');
      can('delete', 'course-resource');

      // No onboarding access
      cannot('read', 'onboarding');
      cannot('create', 'onboarding');
      cannot('update', 'onboarding');
    });
  }

  if (role === 'viewer') {
    return defineAbility<AppAbility>((can, cannot) => {
      can('read', 'user-dashboard');

      can('read', 'user-documents');
      cannot('create', 'user-documents');
      cannot('update', 'user-documents');
      cannot('delete', 'user-documents');

      can('read', 'user-requests');
      cannot('create', 'user-requests');
      cannot('update', 'user-requests');
      cannot('delete', 'user-requests');

      can('read', 'user-reporting');
      cannot('create', 'user-reporting');
      cannot('update', 'user-reporting');
      cannot('delete', 'user-reporting');

      can('read', 'user-profile');
      can('read', 'user-settings');
      cannot('update', 'user-settings');

      can('read', 'user-dashboard');
      can('read', 'user-help-center');
      cannot('update', 'user-help-center');

      can('read', 'user-forms');
      cannot('create', 'user-forms');
      cannot('update', 'user-forms');
      cannot('delete', 'user-forms');

      cannot('read', 'onboarding');
      cannot('create', 'onboarding');
      cannot('update', 'onboarding');
      cannot('delete', 'onboarding');
    });
  }

  // Unknown roles: deny dashboard subjects
  return defineAbility<AppAbility>((_can, cannot) => {
    cannot('read', 'user-dashboard');
    cannot('read', 'user-documents');
    cannot('read', 'user-requests');
    cannot('read', 'user-reporting');
    cannot('read', 'user-profile');
    cannot('read', 'user-settings');
    cannot('read', 'user-forms');
    cannot('read', 'onboarding');
    cannot('create', 'onboarding');
    cannot('update', 'onboarding');
    cannot('manage', 'all');
  });
}

// Route permission mapping
export const routePermissions: Record<string, { subject: Subjects; action: Actions }> = {
  '/dashboard': { subject: 'user-dashboard', action: 'read' },
  '/dashboard/overview': { subject: 'user-dashboard', action: 'read' },
  // Instructor routes
  '/instructor': { subject: 'instructor-dashboard', action: 'read' },
  '/instructor/courses': { subject: 'instructor-dashboard', action: 'read' },
  '/instructor/courses/:slug': { subject: 'instructor-dashboard', action: 'read' },
  '/instructor/resources/:slug': { subject: 'instructor-dashboard', action: 'read' },
  '/instructor/create': { subject: 'instructor-dashboard', action: 'read' },
};

export function isRouteProtected(path: string): boolean {
  return path.startsWith('/dashboard') || path.startsWith('/instructor');
}

export function getRoutePermission(path: string): { subject: Subjects; action: Actions } | null {
  if (!path) return null;
  const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';

  if (routePermissions[normalizedPath]) {
    return routePermissions[normalizedPath];
  }

  for (const [routePattern, permission] of Object.entries(routePermissions)) {
    if (!routePattern.includes(':')) continue;
    try {
      const matcher = match(routePattern, { decode: decodeURIComponent });
      const result = matcher(normalizedPath);
      if (result) return permission;
    } catch {
      const patternRegex = new RegExp('^' + routePattern.replace(/:[^/]+/g, '[^/]+') + '$');
      if (patternRegex.test(normalizedPath)) return permission;
    }
  }

  if (normalizedPath.startsWith('/dashboard')) {
    return { subject: 'user-dashboard', action: 'read' };
  }
  if (normalizedPath.startsWith('/instructor')) {
    return { subject: 'instructor-dashboard', action: 'read' };
  }

  return null;
}

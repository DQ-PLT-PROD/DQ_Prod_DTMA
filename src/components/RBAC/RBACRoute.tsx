import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAbilityContext } from '../../context/AbilityContext';
import { Actions, getRoutePermission, isRouteProtected, Subjects } from '../../config/abilities';
import { Forbidden } from './Forbidden';

interface RBACRouteProps {
  subject?: Subjects;
  action?: Actions;
  fallbackElement?: React.ReactNode;
  requireAuth?: boolean;
  children: React.ReactNode;
}

export function RBACRoute({
  subject: explicitSubject,
  action: explicitAction,
  fallbackElement,
  requireAuth = true,
  children,
}: RBACRouteProps) {
  const location = useLocation();
  const { ability, role } = useAbilityContext();

  const routePermission = useMemo(() => {
    return explicitSubject && explicitAction
      ? { subject: explicitSubject, action: explicitAction }
      : getRoutePermission(location.pathname);
  }, [explicitSubject, explicitAction, location.pathname]);

  if (!routePermission) {
    if (!isRouteProtected(location.pathname)) {
      return <>{children}</>;
    }
    return (
      <>
        {fallbackElement ?? (
          <Forbidden message={`Access denied. This route requires permissions that are not configured.`} />
        )}
      </>
    );
  }

  const allowed = ability.can(routePermission.action, routePermission.subject);

  if (allowed) {
    return <>{children}</>;
  }

  if (!role) {
    return (
      <Forbidden message="Access denied. Your account role is not recognized. Please contact support." />
    );
  }

  return (
    <Forbidden message={`You do not have permission to ${routePermission.action} ${routePermission.subject}.`} />
  );
}

export default RBACRoute;

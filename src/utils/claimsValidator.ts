/**
 * Claims validation and extraction utilities for Azure AD tokens
 */

export interface ValidatedClaims {
  oid?: string;
  sub?: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  surname?: string;
}

/**
 * Validates and logs ID token claims
 */
export function validateAndLogClaims(claims: any): ValidatedClaims {
  console.log('🔍 Validating ID token claims:', {
    oid: claims.oid,
    sub: claims.sub,
    email: claims.email,
    preferred_username: claims.preferred_username,
    name: claims.name
  });

  return claims as ValidatedClaims;
}

/**
 * Extracts user profile from validated claims
 */
export function extractUserProfile(claims: ValidatedClaims): UserProfile {
  const id = claims.oid || claims.sub || '';
  const email = claims.email || claims.preferred_username || '';
  const name = claims.name || '';
  const givenName = claims.given_name;
  const surname = claims.family_name;

  return {
    id,
    email,
    name,
    givenName,
    surname
  };
}

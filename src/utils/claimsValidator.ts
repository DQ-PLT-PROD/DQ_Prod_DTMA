/**
 * Utility functions for validating and processing Microsoft Entra ID claims
 */

export interface EntraIdClaims {
  oid?: string; // Object ID
  sub?: string; // Subject
  name?: string; // Display name
  given_name?: string; // First name
  family_name?: string; // Last name
  email?: string; // Email address
  preferred_username?: string; // Preferred username
  upn?: string; // User Principal Name
  tid?: string; // Tenant ID
  aud?: string; // Audience
  iss?: string; // Issuer
  iat?: number; // Issued at
  exp?: number; // Expires at
}

/**
 * Validates and logs the claims received from Microsoft Entra ID
 */
export function validateAndLogClaims(claims: any): EntraIdClaims {
  console.log('🔍 Raw claims received:', claims);
  
  const validatedClaims: EntraIdClaims = {
    oid: claims?.oid,
    sub: claims?.sub,
    name: claims?.name,
    given_name: claims?.given_name,
    family_name: claims?.family_name,
    email: claims?.email,
    preferred_username: claims?.preferred_username,
    upn: claims?.upn,
    tid: claims?.tid,
    aud: claims?.aud,
    iss: claims?.iss,
    iat: claims?.iat,
    exp: claims?.exp
  };

  console.log('✅ Validated claims:', validatedClaims);
  
  // Check for missing essential claims
  const missingClaims = [];
  if (!validatedClaims.oid && !validatedClaims.sub) {
    missingClaims.push('User ID (oid/sub)');
  }
  if (!validatedClaims.name && !validatedClaims.given_name) {
    missingClaims.push('Display Name');
  }
  if (!validatedClaims.email && !validatedClaims.preferred_username && !validatedClaims.upn) {
    missingClaims.push('Email/Username');
  }

  if (missingClaims.length > 0) {
    console.warn('⚠️ Missing essential claims:', missingClaims);
  } else {
    console.log('✅ All essential claims present');
  }

  return validatedClaims;
}

/**
 * Extracts user profile information from validated claims
 */
export function extractUserProfile(claims: EntraIdClaims) {
  const userId = claims.oid || claims.sub || 'unknown-user';
  const userName = claims.name || 
                   (claims.given_name && claims.family_name 
                     ? `${claims.given_name} ${claims.family_name}` 
                     : claims.given_name) || 
                   claims.preferred_username || 
                   'User';
  const userEmail = claims.email || 
                    claims.preferred_username || 
                    claims.upn || 
                    'user@domain.com';

  console.log('👤 Extracted user profile:', { userId, userName, userEmail });

  return {
    id: userId,
    name: userName,
    email: userEmail
  };
}
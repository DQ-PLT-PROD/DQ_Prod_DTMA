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
  emails?: string[]; // Email addresses array
  preferred_username?: string; // Preferred username
  upn?: string; // User Principal Name
  unique_name?: string; // Unique name (sometimes contains email)
  signInNames?: any; // Sign-in names (B2C specific)
  'signInNames.emailAddress'?: string; // B2C email claim
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
    emails: claims?.emails,
    preferred_username: claims?.preferred_username,
    upn: claims?.upn,
    unique_name: claims?.unique_name,
    signInNames: claims?.signInNames,
    'signInNames.emailAddress': claims?.['signInNames.emailAddress'],
    tid: claims?.tid,
    aud: claims?.aud,
    iss: claims?.iss,
    iat: claims?.iat,
    exp: claims?.exp
  };

  console.log('✅ Validated claims:', validatedClaims);

  // Enhanced email claim detection
  const emailSources = [
    claims?.email,
    claims?.emails?.[0],
    claims?.preferred_username,
    claims?.upn,
    claims?.unique_name,
    claims?.['signInNames.emailAddress']
  ].filter(Boolean);

  console.log('📧 Available email sources:', emailSources);

  // Check for missing essential claims
  const missingClaims: string[] = [];
  if (!validatedClaims.oid && !validatedClaims.sub) {
    missingClaims.push('User ID (oid/sub)');
  }
  if (!validatedClaims.name && !validatedClaims.given_name) {
    missingClaims.push('Display Name');
  }
  if (emailSources.length === 0) {
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

  // Enhanced email extraction with Azure B2C specific claims
  let userEmail = 'user@domain.com'; // Default fallback

  // Try multiple email sources in order of preference
  const emailCandidates = [
    claims.email,
    claims.emails?.[0],
    claims['signInNames.emailAddress'], // B2C specific
    claims.preferred_username,
    claims.upn,
    claims.unique_name
  ];

  for (const candidate of emailCandidates) {
    if (candidate && typeof candidate === 'string' && candidate.includes('@')) {
      userEmail = candidate;
      console.log('📧 Found valid email:', userEmail);
      break;
    }
  }

  if (userEmail === 'user@domain.com') {
    console.warn('⚠️ No valid email found in claims, using default');
    console.log('🔍 All email candidates checked:', emailCandidates);
  }

  console.log('👤 Extracted user profile:', { userId, userName, userEmail });

  return {
    id: userId,
    name: userName,
    email: userEmail
  };
}
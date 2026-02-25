import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load environment variables if not already loaded
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

if (!process.env.VITE_AZURE_TENANT_ID) {
  try {
    const envPath = join(__dirname, '../../.env')  // Go up two levels to reach root
    console.log('🔍 Loading env from:', envPath)
    const envFile = readFileSync(envPath, 'utf8')
    
    let loadedCount = 0
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join('=')
          if (key.includes('AZURE')) {
            loadedCount++
            console.log(`   Loaded: ${key}`)
          }
        }
      }
    })
    console.log(`✅ Environment variables loaded in auth middleware (${loadedCount} Azure vars)`)
  } catch (err) {
    console.log('⚠️ Could not load .env file in auth middleware:', err.message)
  }
} else {
  console.log('✅ Environment variables already available in auth middleware')
}

// JWKS client for Azure AD token validation
const getJwksClient = (tenantId, subdomain = null) => {
  // Use CIAM endpoint if subdomain is provided, otherwise use standard Azure AD
  const jwksUri = subdomain 
    ? `https://${subdomain}.ciamlogin.com/${tenantId}/discovery/v2.0/keys`
    : `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;
    
  console.log('🔑 JWKS URI:', jwksUri);
  
  return jwksClient({
    jwksUri,
    requestHeaders: {},
    timeout: 30000,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000, // 10 minutes
  });
};

// Get signing key for JWT verification
const getKey = (client) => (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('❌ Error getting signing key:', err);
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

// Extract token from Authorization header
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

let supabaseAdminClient = null;
const getSupabaseAdminClient = () => {
  if (supabaseAdminClient) return supabaseAdminClient;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return supabaseAdminClient;
};

// Validate Azure AD JWT token
const validateAzureToken = async (token, tenantId, clientId, subdomain = null) => {
  return new Promise((resolve, reject) => {
    const client = getJwksClient(tenantId, subdomain);
    
    // Expected issuer based on configuration
    // Azure CIAM can issue tokens with either subdomain or tenant ID format
    const expectedIssuers = subdomain 
      ? [
          `https://${subdomain}.ciamlogin.com/${tenantId}/v2.0`,
          `https://${tenantId}.ciamlogin.com/${tenantId}/v2.0`
        ]
      : [
          `https://login.microsoftonline.com/${tenantId}/v2.0`,
          `https://${tenantId}.ciamlogin.com/${tenantId}/v2.0`
        ];

    const options = {
      audience: clientId,
      issuer: expectedIssuers,
      algorithms: ['RS256'],
      clockTolerance: 60, // Allow 60 seconds clock skew
    };

    console.log('🔍 Token validation options:', {
      audience: options.audience,
      issuer: options.issuer,
      algorithms: options.algorithms
    });

    // Decode token without verification to see actual claims
    const decodedWithoutVerify = jwt.decode(token, { complete: true });
    console.log('🔍 Token claims (unverified):', {
      header: decodedWithoutVerify?.header,
      payload: {
        iss: decodedWithoutVerify?.payload?.iss,
        aud: decodedWithoutVerify?.payload?.aud,
        sub: decodedWithoutVerify?.payload?.sub,
        oid: decodedWithoutVerify?.payload?.oid,
        exp: decodedWithoutVerify?.payload?.exp,
        iat: decodedWithoutVerify?.payload?.iat
      }
    });

    jwt.verify(token, getKey(client), options, (err, decoded) => {
      if (err) {
        console.error('❌ Token validation failed:', err.message);
        console.error('❌ Error details:', {
          name: err.name,
          message: err.message,
          expiredAt: err.expiredAt,
          audience: err.audience,
          issuer: err.issuer
        });
        return reject(err);
      }

      console.log('✅ Token validated successfully');
      console.log('👤 Token claims:', {
        sub: decoded.sub,
        oid: decoded.oid,
        email: decoded.email || decoded.preferred_username,
        name: decoded.name,
        aud: decoded.aud,
        iss: decoded.iss,
        exp: new Date(decoded.exp * 1000).toISOString(),
        iat: new Date(decoded.iat * 1000).toISOString()
      });

      resolve(decoded);
    });
  });
};

// Extract user information from validated token
const extractUserFromToken = (decodedToken) => {
  return {
    azureUserId: decodedToken.oid || decodedToken.sub,
    email: decodedToken.email || decodedToken.preferred_username || decodedToken.upn,
    name: decodedToken.name || decodedToken.given_name + ' ' + decodedToken.family_name || 'User',
    tenantId: decodedToken.tid,
    clientId: decodedToken.aud,
    scopes: decodedToken.scp ? decodedToken.scp.split(' ') : [],
    roles: decodedToken.roles || [],
    jobTitle: decodedToken.jobTitle,
    department: decodedToken.department,
    officeLocation: decodedToken.officeLocation
  };
};

// Main authentication middleware
export const authenticateUser = (options = {}) => {
  const {
    required = true,
    allowTestMode = process.env.NODE_ENV === 'development'
  } = options;

  return async (req, res, next) => {
    try {
      console.log(`🔐 Authentication middleware - ${req.method} ${req.url}`);
      
      // Get configuration from environment
      const tenantId = process.env.VITE_AZURE_TENANT_ID;
      const clientId = process.env.VITE_AZURE_CLIENT_ID;
      const subdomain = process.env.VITE_AZURE_SUBDOMAIN;

      console.log('🔧 Environment check:', {
        tenantId: tenantId ? `${tenantId.substring(0, 8)}...` : 'undefined',
        clientId: clientId ? `${clientId.substring(0, 8)}...` : 'undefined',
        subdomain: subdomain || 'undefined',
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('AZURE')).join(', ')
      });

      if (!tenantId || !clientId) {
        console.error('❌ Azure AD configuration missing:', {
          tenantId: !!tenantId,
          clientId: !!clientId
        });
        
        if (required) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'Authentication configuration error',
            message: 'Server authentication not properly configured'
          }));
          return;
        } else {
          console.log('⚠️ Authentication not required, continuing without user');
          return next();
        }
      }

      // Extract token from request
      const token = extractToken(req);
      
      if (!token) {
        console.log('❌ No authentication token provided');
        
        if (required) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'Authentication required',
            message: 'No authentication token provided'
          }));
          return;
        } else {
          console.log('⚠️ Authentication not required, continuing without user');
          return next();
        }
      }

      // Test mode bypass (development only)
      if (allowTestMode && token === 'test-token') {
        console.log('🧪 Test mode: Using mock authentication');
        req.user = {
          azureUserId: '12345678-1234-1234-1234-123456789abc',
          email: 'test@example.com',
          name: 'Test User',
          tenantId: 'test-tenant',
          clientId: 'test-client',
          scopes: ['openid', 'profile', 'email'],
          roles: [],
          isTestUser: true
        };
        return next();
      }

      try {
        // Validate the JWT token
        const decodedToken = await validateAzureToken(token, tenantId, clientId, subdomain);
        
        // Extract user information
        const user = extractUserFromToken(decodedToken);
        
        // Attach user to request object
        req.user = user;
        req.token = decodedToken;
        
        console.log('✅ User authenticated:', {
          azureUserId: user.azureUserId,
          email: user.email,
          name: user.name
        });
        
        next();
      } catch (tokenError) {
        console.error('❌ Token validation error:', tokenError.message);
        
        if (required) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: 'Invalid authentication token',
            message: 'The provided authentication token is invalid or expired'
          }));
          return;
        } else {
          console.log('⚠️ Authentication not required, continuing without user');
          return next();
        }
      }
    } catch (error) {
      console.error('❌ Authentication middleware error:', error);
      
      if (required) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Authentication error',
          message: 'An error occurred during authentication'
        }));
        return;
      } else {
        console.log('⚠️ Authentication not required, continuing without user');
        return next();
      }
    }
  };
};

// Supabase JWT middleware for admin endpoints
export const authenticateSupabaseUser = (options = {}) => {
  const { required = true } = options;

  return async (req, res, next) => {
    try {
      const token = extractToken(req);
      if (!token) {
        if (!required) return next();
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Authentication required',
          message: 'No Supabase access token provided'
        }));
        return;
      }

      const supabase = getSupabaseAdminClient();
      if (!supabase) {
        if (!required) return next();
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Authentication configuration error',
          message: 'Supabase server auth is not configured'
        }));
        return;
      }

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        if (!required) return next();
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: 'Invalid authentication token',
          message: 'The provided Supabase token is invalid or expired'
        }));
        return;
      }

      req.adminUser = data.user;
      req.authProvider = 'supabase';
      req.user = req.user || data.user;
      return next();
    } catch (error) {
      if (!required) return next();
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Authentication error',
        message: 'An error occurred during Supabase authentication'
      }));
      return;
    }
  };
};

// Middleware to require specific scopes
export const requireScopes = (requiredScopes = []) => {
  return (req, res, next) => {
    if (!req.user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource'
      }));
      return;
    }

    const userScopes = req.user.scopes || [];
    const hasRequiredScopes = requiredScopes.every(scope => 
      userScopes.includes(scope)
    );

    if (!hasRequiredScopes) {
      console.log('❌ Insufficient scopes:', {
        required: requiredScopes,
        user: userScopes
      });
      
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Insufficient permissions',
        message: 'User does not have required permissions to access this resource',
        requiredScopes,
        userScopes
      }));
      return;
    }

    console.log('✅ Scope validation passed');
    next();
  };
};

// Middleware to require specific roles
export const requireRoles = (requiredRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource'
      }));
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => 
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      console.log('❌ Insufficient roles:', {
        required: requiredRoles,
        user: userRoles
      });
      
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        error: 'Insufficient permissions',
        message: 'User does not have required role to access this resource',
        requiredRoles,
        userRoles
      }));
      return;
    }

    console.log('✅ Role validation passed');
    next();
  };
};

// Helper to get current user from request
export const getCurrentUser = (req) => {
  return req.user || null;
};

// Helper to check if user is authenticated
export const isAuthenticated = (req) => {
  return !!req.user;
};

export default {
  authenticateUser,
  authenticateSupabaseUser,
  requireScopes,
  requireRoles,
  getCurrentUser,
  isAuthenticated
};

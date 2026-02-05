/**
 * Rate Limiting Middleware
 * Feature 02.1 - Production Hardening
 * Prevents API abuse and ensures system stability
 */

// Simple in-memory rate limiter
// For production, consider using Redis for distributed rate limiting
class RateLimiter {
  constructor() {
    this.requests = new Map(); // IP -> { count, resetTime }
    this.windowMs = 15 * 60 * 1000; // 15 minutes
    this.maxRequests = 1000; // Max requests per window
    this.authMaxRequests = 2000; // Higher limit for authenticated users
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(ip);
      }
    }
  }

  isAllowed(ip, isAuthenticated = false) {
    const now = Date.now();
    const maxRequests = isAuthenticated ? this.authMaxRequests : this.maxRequests;
    
    if (!this.requests.has(ip)) {
      this.requests.set(ip, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    const data = this.requests.get(ip);
    
    // Reset window if expired
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + this.windowMs;
      return { allowed: true, remaining: maxRequests - 1 };
    }

    // Check if limit exceeded
    if (data.count >= maxRequests) {
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: data.resetTime
      };
    }

    // Increment counter
    data.count++;
    return { 
      allowed: true, 
      remaining: maxRequests - data.count 
    };
  }
}

const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware
 */
export const applyRateLimit = (req, res, next) => {
  // Get client IP
  const ip = req.headers['x-forwarded-for'] || 
            req.headers['x-real-ip'] || 
            req.connection?.remoteAddress || 
            req.socket?.remoteAddress ||
            'unknown';

  // Check if user is authenticated (has valid token)
  const isAuthenticated = req.user && req.user.id;

  const result = rateLimiter.isAllowed(ip, isAuthenticated);

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', isAuthenticated ? 2000 : 1000);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  
  if (result.resetTime) {
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
  }

  if (!result.allowed) {
    console.warn(`🚫 Rate limit exceeded for IP: ${ip}`);
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000));
    res.end(JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
    }));
    return;
  }

  next();
};

/**
 * Strict rate limiting for sensitive endpoints
 */
export const applyStrictRateLimit = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || 
            req.headers['x-real-ip'] || 
            req.connection?.remoteAddress || 
            req.socket?.remoteAddress ||
            'unknown';

  // Stricter limits for enrollment/auth endpoints
  const strictLimiter = new RateLimiter();
  strictLimiter.maxRequests = 100; // 100 requests per 15 minutes
  strictLimiter.authMaxRequests = 200; // 200 for authenticated users

  const isAuthenticated = req.user && req.user.id;
  const result = strictLimiter.isAllowed(ip, isAuthenticated);

  res.setHeader('X-RateLimit-Limit', isAuthenticated ? 200 : 100);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  
  if (result.resetTime) {
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
  }

  if (!result.allowed) {
    console.warn(`🚫 Strict rate limit exceeded for IP: ${ip}`);
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000));
    res.end(JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded for sensitive endpoint. Please try again later.',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
    }));
    return;
  }

  next();
};

export default { applyRateLimit, applyStrictRateLimit };
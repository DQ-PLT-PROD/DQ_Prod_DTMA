/**
 * Request Logging Middleware
 * Feature 02.1 - Production Hardening
 * Provides audit trail and security monitoring
 */

/**
 * Log request details for security audit
 */
export const logRequest = (req, res, next) => {
  const startTime = Date.now();
  
  // Get client information
  const ip = req.headers['x-forwarded-for'] || 
            req.headers['x-real-ip'] || 
            req.connection?.remoteAddress || 
            req.socket?.remoteAddress ||
            'unknown';
            
  const userAgent = req.headers['user-agent'] || 'unknown';
  const method = req.method;
  const url = req.url;
  const timestamp = new Date().toISOString();
  
  // Log request start
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;
  
  console.log(`📝 [${timestamp}] ${requestId} ${method} ${url} - IP: ${ip}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const userId = req.user?.id || 'anonymous';
    
    // Log response
    console.log(`📝 [${new Date().toISOString()}] ${requestId} ${method} ${url} - ${statusCode} - ${duration}ms - User: ${userId}`);
    
    // Log security-relevant events
    if (statusCode === 401) {
      console.warn(`🔐 [SECURITY] Unauthorized access attempt - ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);
    } else if (statusCode === 403) {
      console.warn(`🔐 [SECURITY] Forbidden access attempt - ${method} ${url} - IP: ${ip} - User: ${userId}`);
    } else if (statusCode === 429) {
      console.warn(`🔐 [SECURITY] Rate limit exceeded - ${method} ${url} - IP: ${ip}`);
    } else if (statusCode >= 500) {
      console.error(`❌ [ERROR] Server error - ${method} ${url} - ${statusCode} - IP: ${ip} - User: ${userId}`);
    }
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Log authentication events
 */
export const logAuthEvent = (req, res, next) => {
  // Override req.user setter to log authentication events
  let _user = null;
  Object.defineProperty(req, 'user', {
    get() {
      return _user;
    },
    set(user) {
      if (user && !_user) {
        // User just authenticated
        const ip = req.headers['x-forwarded-for'] || 
                  req.headers['x-real-ip'] || 
                  req.connection?.remoteAddress || 
                  req.socket?.remoteAddress ||
                  'unknown';
        console.log(`🔐 [AUTH] User authenticated - ID: ${user.id} - Email: ${user.email} - IP: ${ip}`);
      }
      _user = user;
    }
  });
  
  next();
};

/**
 * Log enrollment events
 */
export const logEnrollmentEvent = (action, courseSlug, userId, details = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`📚 [ENROLLMENT] ${timestamp} - Action: ${action} - Course: ${courseSlug} - User: ${userId} - Details:`, details);
};

/**
 * Log access control events
 */
export const logAccessEvent = (action, resource, userId, result, details = {}) => {
  const timestamp = new Date().toISOString();
  const level = result === 'denied' ? 'WARN' : 'INFO';
  console.log(`🔒 [ACCESS-${level}] ${timestamp} - Action: ${action} - Resource: ${resource} - User: ${userId} - Result: ${result} - Details:`, details);
};

export default { logRequest, logAuthEvent, logEnrollmentEvent, logAccessEvent };
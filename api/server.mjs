import http from 'http'
import { parse } from 'url'
import crypto from 'crypto'

const PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 3001

// Simple in-memory cache with TTL (Redis-like behavior)
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

// Generate ETag from content
const generateETag = (content) => {
  return crypto.createHash('md5').update(content).digest('hex');
};

// Simple request body parser
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
};

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = parse(req.url || '', true)

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, If-None-Match');
    res.setHeader('Access-Control-Expose-Headers', 'ETag, Cache-Control');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      return res.end();
    }

    // Health check with caching
    if (pathname === '/api/health') {
      const cacheKey = 'health-check';
      let responseData = cache.get(cacheKey);

      if (!responseData) {
        responseData = JSON.stringify({ ok: true, timestamp: new Date().toISOString() });
        cache.set(cacheKey, responseData, 60); // Cache for 1 minute
      }

      const etag = generateETag(responseData);

      // Check if client has cached version
      if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304;
        return res.end();
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.setHeader('ETag', etag);
      return res.end(responseData);
    }

    // Stripe endpoints
    if (pathname === '/api/stripe/create-checkout-session' && req.method === 'POST') {
      const body = await parseBody(req);
      const { planId, priceAmount, currency, courseSlug, userId, successUrl, cancelUrl, metadata } = body;

      // Mock Stripe session for development
      const mockSessionId = `mock_session_${Date.now()}`;
      const mockUrl = `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id=${mockSessionId}`;

      const responseData = JSON.stringify({
        sessionId: mockSessionId,
        url: mockUrl,
        status: 'open',
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store'); // Don't cache payment sessions
      return res.end(responseData);
    }

    if (pathname === '/api/stripe/verify-session' && req.method === 'POST') {
      const body = await parseBody(req);
      const { sessionId } = body;

      // Mock verification - always return paid
      const responseData = JSON.stringify({
        paymentStatus: 'paid',
        metadata: {
          courseSlug: 'mock-course',
          userId: 'mock-user',
          planId: 'premium',
        },
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store'); // Don't cache payment verifications
      return res.end(responseData);
    }

    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Not found' }))
  } catch (e) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: e?.message || 'Server error' }))
  }
})

server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`)
  console.log(`Stripe mock endpoints available at /api/stripe/*`)
  console.log(`In-memory caching enabled`)
})

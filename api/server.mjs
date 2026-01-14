import http from 'http'
import { parse } from 'url'

const PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 3001

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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      return res.end();
    }
    
    // Health check
    if (pathname === '/api/health') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ ok: true }))
    }
    
    // Stripe endpoints
    if (pathname === '/api/stripe/create-checkout-session' && req.method === 'POST') {
      const body = await parseBody(req);
      const { planId, priceAmount, currency, courseSlug, userId, successUrl, cancelUrl, metadata } = body;
      
      // Mock Stripe session for development
      const mockSessionId = `mock_session_${Date.now()}`;
      const mockUrl = `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id=${mockSessionId}`;
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        sessionId: mockSessionId,
        url: mockUrl,
        status: 'open',
      }));
    }
    
    if (pathname === '/api/stripe/verify-session' && req.method === 'POST') {
      const body = await parseBody(req);
      const { sessionId } = body;
      
      // Mock verification - always return paid
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        paymentStatus: 'paid',
        metadata: {
          courseSlug: 'mock-course',
          userId: 'mock-user',
          planId: 'premium',
        },
      }));
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
})

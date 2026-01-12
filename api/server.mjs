import http from 'http'
import { parse } from 'url'

const PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 3001

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = parse(req.url || '', true)
    if (pathname === '/api/health') {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ ok: true }))
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
})

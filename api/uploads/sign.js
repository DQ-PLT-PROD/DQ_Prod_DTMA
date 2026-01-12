/* eslint-env node */
import { buildBlobPath, getUploadSas } from '../../src/server/azure/blobSign.js'

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}) } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

const allowed = (ct) => {
  if (!ct) return false
  return (
    ct.startsWith('image/') ||
    ct.startsWith('video/') ||
    ct.startsWith('audio/') ||
    ct === 'application/pdf' ||
    ct.startsWith('application/vnd')
  )
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ ok: true, endpoint: '/api/uploads/sign', method: 'GET' }))
  }
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }

  try {
    const account = process.env.AZURE_STORAGE_ACCOUNT
    const container = process.env.AZURE_STORAGE_CONTAINER
    const key = process.env.AZURE_STORAGE_ACCOUNT_KEY
    const conn = process.env.AZURE_STORAGE_CONNECTION_STRING
    if (!account || (!key && !conn) || !container) {
      res.statusCode = 401
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: 'Storage not configured' }))
    }

    const body = await parseBody(req)
    const { filename, contentType, dir, mediaId } = body || {}
    if (!filename || !contentType || !dir) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: 'filename, contentType and dir are required' }))
    }
    if (!allowed(contentType)) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: 'Unsupported content type' }))
    }

    const blobPath = buildBlobPath(dir, mediaId, filename)
    const { putUrl, publicUrl, expiresAt } = await getUploadSas({ blobName: blobPath, contentType, expiresInSeconds: 10 * 60 })
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ putUrl, publicUrl, blobPath, expiresAt }))
  } catch (e) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: e?.message || 'Failed to sign upload' }))
  }
}

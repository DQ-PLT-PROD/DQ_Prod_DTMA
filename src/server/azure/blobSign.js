/* eslint-env node */
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  SASProtocol,
  StorageSharedKeyCredential,
  BlobServiceClient,
} from '@azure/storage-blob'

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

export function buildBlobPath(typeDir, mediaId, filename) {
  const safeName = slugify(filename)
  const ts = Date.now()
  const parts = [typeDir, mediaId || 'misc', `${ts}-${safeName}`].filter(Boolean)
  return parts.join('/')
}

export async function getUploadSas(opts) {
  const account = process.env.AZURE_STORAGE_ACCOUNT || ''
  const container = process.env.AZURE_STORAGE_CONTAINER || 'media-items'
  const cdn = process.env.AZURE_CDN_URL || ''
  const key = process.env.AZURE_STORAGE_ACCOUNT_KEY || ''
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING || ''

  if (!account || (!key && !conn)) {
    throw new Error('Missing Azure storage configuration (account/key or connection string).')
  }

  let sharedCredential
  if (conn) {
    const mAccount = conn.match(/AccountName=([^;]+)/i)
    const mKey = conn.match(/AccountKey=([^;]+)/i)
    if (!mAccount || !mKey)
      throw new Error('Invalid AZURE_STORAGE_CONNECTION_STRING; missing AccountName/AccountKey')
    sharedCredential = new StorageSharedKeyCredential(mAccount[1], mKey[1])
  } else {
    sharedCredential = new StorageSharedKeyCredential(account, key)
  }

  const now = new Date()
  const start = new Date(now.getTime() - 5 * 60 * 1000)
  const ttl = Math.min(Math.max(opts.expiresInSeconds || 10 * 60, 60), 60 * 60)
  const expiry = new Date(now.getTime() + ttl * 1000)

  const permissions = BlobSASPermissions.parse('cw')
  const sas = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName: opts.blobName,
      permissions,
      startsOn: start,
      expiresOn: expiry,
      protocol: SASProtocol.Https,
      contentType: opts.contentType,
    },
    sharedCredential,
  ).toString()

  const base = `https://${account}.blob.core.windows.net/${container}/${opts.blobName}`
  const putUrl = `${base}?${sas}`
  const publicUrl = cdn ? `${cdn.replace(/\/$/, '')}/${opts.blobName}` : base

  return { putUrl, publicUrl, blobPath: opts.blobName, expiresAt: expiry.toISOString() }
}

export async function deleteBlob(blobPath) {
  const conn = process.env.AZURE_STORAGE_CONNECTION_STRING
  const account = process.env.AZURE_STORAGE_ACCOUNT
  const container = process.env.AZURE_STORAGE_CONTAINER || 'media-items'
  if (!conn && !account) throw new Error('Azure storage env not configured')
  const client = conn
    ? BlobServiceClient.fromConnectionString(conn)
    : new BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        new StorageSharedKeyCredential(account, process.env.AZURE_STORAGE_ACCOUNT_KEY),
      )
  const containerClient = client.getContainerClient(container)
  const blobClient = containerClient.getBlockBlobClient(blobPath)
  await blobClient.deleteIfExists()
  return { ok: true }
}

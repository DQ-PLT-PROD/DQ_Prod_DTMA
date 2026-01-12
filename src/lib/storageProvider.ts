export type UploadArgs = { file: File; dir: 'thumbnails' | 'video' | 'podcast' | 'report'; mediaId?: string }
export type UploadResult = { publicUrl: string; blobPath: string }

const json = async (res: Response) => { try { return await res.json() } catch { return null } }

export async function uploadFile({ file, dir, mediaId }: UploadArgs): Promise<UploadResult> {
  const signRes = await fetch('/api/uploads/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType: file.type, dir, mediaId }),
  })
  if (!signRes.ok) {
    const body = await json(signRes)
    throw new Error(body?.error || `Sign failed: ${signRes.status}`)
  }
  const { putUrl, publicUrl } = await signRes.json()
  const put = await fetch(putUrl, {
    method: 'PUT',
    headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type },
    body: file,
  })
  if (!(put.status === 201 || put.status === 200)) {
    const t = await put.text().catch(() => '')
    throw new Error(`Upload failed: ${put.status} ${t}`)
  }
  return { publicUrl, blobPath: new URL(putUrl).pathname.replace(/^\//,'').split('?')[0] }
}

export async function deleteFile(blobPath: string): Promise<{ ok: true }> {
  const res = await fetch('/api/uploads/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blobPath }),
  })
  if (!res.ok) {
    const body = await json(res)
    throw new Error(body?.error || `Delete failed: ${res.status}`)
  }
  return { ok: true }
}
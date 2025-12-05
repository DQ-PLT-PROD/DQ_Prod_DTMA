import React, { useEffect, useMemo, useState, Suspense } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { mediaService, MediaItem } from '../utils/supabase'
import { Toast, ToastType } from '../components/Toast'
import { ArrowLeft as ArrowLeftIcon, Save as SaveIcon, Tag as TagIcon, X as XIcon, PlusCircle as PlusCircleIcon } from 'lucide-react'
import DOMPurify from 'dompurify'

const RichTextEditor = React.lazy(() => import('../components/RichTextEditor'))

const isValidUrl = (url: string) => { if (!url) return true; try { const u = new URL(url); return u.protocol === 'http:' || u.protocol === 'https:' } catch { return false } }

const MediaDetail2: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<MediaItem | null>(null)
  const [formData, setFormData] = useState<Partial<MediaItem & { duration?: string; videoUrl?: string | null; podcastUrl?: string | null; documentUrl?: string | null; eventDate?: string; eventLocation?: string; eventTime?: string; announcementDate?: string }>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [tagSearch, setTagSearch] = useState('')
  const [newTag, setNewTag] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [canonicalTouched, setCanonicalTouched] = useState(false)
  // Thumbnail
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [pendingThumbFile, setPendingThumbFile] = useState<File | null>(null)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  // Type-specific assets
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('')
  const [podcastFile, setPodcastFile] = useState<File | null>(null)
  const [podcastPreviewUrl, setPodcastPreviewUrl] = useState<string>('')
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [reportPreviewName, setReportPreviewName] = useState<string>('')

  useEffect(() => {
    if (!id) return
    const run = async () => {
      setLoading(true)
      try {
        const data = await mediaService.getMediaItemById(id)
        const normalizedTags = Array.isArray(data.tags) ? data.tags : []
        setItem({ ...data, tags: normalizedTags })
        setFormData({ ...data, tags: normalizedTags })
        setThumbnailUrl(data.thumbnailUrl || '')
        try {
          const tags = await mediaService.getAvailableTags()
          const combined = Array.from(new Set([...(tags || []), ...normalizedTags]))
          setAvailableTags(combined.sort((a, b) => a.localeCompare(b)))
        } catch {
          setAvailableTags(normalizedTags.sort((a, b) => a.localeCompare(b)))
        }
      } catch (e) {
        console.error('Failed to load media item', e)
        setToast({ message: 'Failed to load media item', type: 'error' })
      } finally { setLoading(false) }
    }
    run()
  }, [id])

  const generateSlug = (title: string) => (title || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const isValidSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test((slug || '').trim())
  const getTextFromHTML = (html?: string) => { if (!html) return ''; const d = document.createElement('div'); d.innerHTML = html; return d.textContent || d.innerText || '' }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'slug') setSlugTouched(true)
    if (name === 'canonicalUrl') setCanonicalTouched(true)
    setFormData((p) => ({ ...p, [name]: value }))
  }
  const selectedTags = useMemo(() => (Array.isArray(formData.tags) ? formData.tags : []), [formData.tags])
  const addAvailableTag = (tag: string) => setAvailableTags((prev) => (prev.includes(tag) ? prev : [...prev, tag].sort((a, b) => a.localeCompare(b))))
  const addTag = (tag: string) => { const t = tag.trim(); if (!t) return; setFormData((prev) => { const cur = Array.isArray(prev.tags) ? prev.tags : []; if (cur.includes(t)) return prev; return { ...prev, tags: [...cur, t] } }); addAvailableTag(t) }
  const removeTag = (tag: string) => setFormData((prev) => { const cur = Array.isArray(prev.tags) ? prev.tags : []; return { ...prev, tags: cur.filter((x) => x !== tag) } })
  const toggleTag = (tag: string) => setFormData((prev) => { const cur = Array.isArray(prev.tags) ? prev.tags : []; return cur.includes(tag) ? { ...prev, tags: cur.filter((x) => x !== tag) } : { ...prev, tags: [...cur, tag] } })
  const filteredTags = useMemo(() => { if (!tagSearch.trim()) return availableTags; const q = tagSearch.toLowerCase(); return availableTags.filter((t) => t.toLowerCase().includes(q)) }, [availableTags, tagSearch])
  const bodyText = useMemo(() => getTextFromHTML((formData as any).bodyHtml || formData.body || ''), [formData])
  const wordCount = useMemo(() => (bodyText.trim() ? bodyText.trim().split(/\s+/).length : 0), [bodyText])
  const charCount = bodyText.length
  const canSave = Boolean((formData.title || '').trim() && (formData.type || '').trim() && (formData.visibility || '').trim()) && isValidSlug((formData.slug || '').trim() || generateSlug(formData.title || ''))
  const parseDurationToSeconds = (v?: string): number | null => { if (!v) return null; const parts = String(v).split(':').map((n) => parseInt(n, 10)); if (parts.some((n) => isNaN(n))) return null; if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; if (parts.length === 2) return parts[0] * 60 + parts[1]; if (parts.length === 1) return parts[0]; return null }

  const handlePublish = async () => { if (!id) return; setSaving(true); try { const updated = await mediaService.updateMediaItem(id, { status: 'Published' as any, visibility: 'Public' as any, publishedAt: new Date().toISOString(), }); setItem(updated); setFormData(updated); setToast({ message: 'Published', type: 'success' }) } catch (e: any) { setToast({ message: e?.message || 'Publish failed', type: 'error' }) } finally { setSaving(false) } }
  const handleUnpublish = async () => { if (!id) return; setSaving(true); try { const updated = await mediaService.updateMediaItem(id, { status: 'Draft' as any, publishedAt: null }); setItem(updated); setFormData(updated); setToast({ message: 'Unpublished', type: 'success' }) } catch (e: any) { setToast({ message: e?.message || 'Unpublish failed', type: 'error' }) } finally { setSaving(false) } }
  const save = async () => {
    if (!id) return
    setSaving(true)
    try {
      let thumbUrl = thumbnailUrl
      if (pendingThumbFile) {
        try {
          setUploadingThumb(true)
          const { uploadFile } = await import('../../lib/storageProvider')
          const r = await uploadFile({ file: pendingThumbFile, dir: 'thumbnails', mediaId: id })
          await mediaService.persistUploadedAsset({ mediaId: id, kind: 'Image', publicUrl: r.publicUrl, storagePath: r.blobPath, mime: pendingThumbFile.type || null, sizeBytes: pendingThumbFile.size || null })
          thumbUrl = r.publicUrl
        } finally { setUploadingThumb(false) }
      }
      const payload: any = { ...formData, slug: (formData.slug || '').trim(), bodyHtml: DOMPurify.sanitize((formData as any).bodyHtml || formData.body || ''), thumbnailUrl: thumbUrl || undefined }
      const updated = await mediaService.updateMediaItem(id, payload)
      setItem(updated)
      setFormData(updated)
      setPendingThumbFile(null)
      setToast({ message: 'Saved changes', type: 'success' })
    } catch (e: any) { setToast({ message: e?.message || 'Failed to save', type: 'error' }) } finally { setSaving(false) }
  }

  return (
    <AppLayout title="Media Details">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/admin-ui/media" className="inline-flex items-center text-blue-600 hover:text-blue-800"><ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to list</Link>
          <div className="flex items-center gap-2">
            {formData.status !== 'Published' && (
              <button onClick={handlePublish} disabled={saving} className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 mr-2">Publish</button>
            )}
            {formData.status === 'Published' && (
              <button onClick={handleUnpublish} disabled={saving} className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 mr-2">Unpublish</button>
            )}
            <button onClick={save} disabled={saving || !canSave} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"><SaveIcon className="w-4 h-4 mr-2" /> {(formData.status === 'Published' ? 'Update' : 'Save')}</button>
          </div>
        </div>

        {toast && (<div className="mb-3"><Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /></div>)}

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>
        ) : !item ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">Media item not found.</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Shared fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input name="title" value={formData.title || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input name="slug" value={formData.slug || ''} onChange={handleChange} className={`mt-1 block w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${slugTouched && !isValidSlug(formData.slug || '') ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Summary</label>
              <textarea name="summary" value={formData.summary || ''} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Card Thumbnail</label>
              <p className="text-xs text-gray-500 mb-2">Paste a URL or upload a new image.</p>
              <div className="flex items-center gap-2">
                <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <input type="file" accept="image/*" onChange={(e) => setPendingThumbFile(e.target.files?.[0] || null)} />
              </div>
              {(thumbnailUrl || pendingThumbFile) && (
                <div className="mt-2">
                  <img src={pendingThumbFile ? URL.createObjectURL(pendingThumbFile) : thumbnailUrl} alt="thumbnail" className="h-32 w-auto rounded border" />
                </div>
              )}
            </div>

            {/* Article content (RTE) */}
            {formData.type === 'Article' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <div className="mt-1">
                  <Suspense fallback={<div className="border rounded-md p-3 text-sm text-gray-500">Loading editor.</div>}>
                    <RichTextEditor valueJson={(formData as any).bodyJson || undefined} valueHtml={(formData as any).bodyHtml || formData.body || ''} onChange={(json, html) => setFormData((prev) => ({ ...(prev as any), bodyJson: json, bodyHtml: html }))} />
                  </Suspense>
                </div>
                <div className="mt-2 text-xs text-gray-500">{wordCount} words · {charCount} characters</div>
              </div>
            )}

            {/* Video-specific */}
            {formData.type === 'Video' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Video URL</label>
                    <input name="videoUrl" value={(formData as any).videoUrl || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (mm:ss)</label>
                    <input name="duration" value={(formData as any).duration || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Video</label>
                    <input type="file" accept="video/*" className="mt-1 text-sm" onChange={async (e) => {
                      const f = e.target.files?.[0] || null
                      setVideoFile(f)
                      setVideoPreviewUrl(f ? URL.createObjectURL(f) : '')
                      if (!f || !id) return
                      try {
                        const { uploadFile } = await import('../../lib/storageProvider')
                        const r = await uploadFile({ file: f, dir: 'video', mediaId: id })
                        await mediaService.persistUploadedAsset({ mediaId: id, kind: 'Video', publicUrl: r.publicUrl, storagePath: r.blobPath, mime: f.type || null, sizeBytes: f.size || null, durationSec: parseDurationToSeconds((formData as any).duration || '') || null })
                        setFormData((p) => ({ ...(p as any), videoUrl: '' }))
                        setToast({ message: 'Video uploaded', type: 'success' })
                      } catch (er: any) { setToast({ message: er?.message || 'Failed to upload video', type: 'error' }) }
                    }} />
                  </div>
                  <div className="border rounded-md p-2 bg-gray-50">
                    <div className="rounded-md overflow-hidden bg-black" style={{ height: '16rem' }}>
                      {(videoPreviewUrl || (formData as any).videoUrl) ? (
                        <video src={videoPreviewUrl || (formData as any).videoUrl!} controls className="w-full h-full bg-black" onLoadedMetadata={(e) => {
                          const d = (e.currentTarget as HTMLVideoElement).duration
                          if (!(formData as any).duration && isFinite(d) && d > 0) {
                            const m = Math.floor(d / 60); const s = Math.round(d % 60)
                            setFormData((prev) => ({ ...(prev as any), duration: `${m}:${s < 10 ? '0' + s : s}` }))
                          }
                        }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No preview available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Podcast-specific */}
            {formData.type === 'Podcast' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Episode URL</label>
                    <input name="podcastUrl" value={(formData as any).podcastUrl || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (mm:ss)</label>
                    <input name="duration" value={(formData as any).duration || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Audio/Video</label>
                    <input type="file" accept="audio/*,video/*" className="mt-1 text-sm" onChange={async (e) => {
                      const f = e.target.files?.[0] || null
                      setPodcastFile(f)
                      setPodcastPreviewUrl(f ? URL.createObjectURL(f) : '')
                      if (!f || !id) return
                      try {
                        const { uploadFile } = await import('../../lib/storageProvider')
                        const r = await uploadFile({ file: f, dir: 'podcast', mediaId: id })
                        await mediaService.persistUploadedAsset({ mediaId: id, kind: f.type.startsWith('video') ? 'Video' : 'Audio', publicUrl: r.publicUrl, storagePath: r.blobPath, mime: f.type || null, sizeBytes: f.size || null, durationSec: parseDurationToSeconds((formData as any).duration || '') || null })
                        setFormData((p) => ({ ...(p as any), podcastUrl: '' }))
                        setToast({ message: 'Episode uploaded', type: 'success' })
                      } catch (er: any) { setToast({ message: er?.message || 'Failed to upload episode', type: 'error' }) }
                    }} />
                  </div>
                  <div className="border rounded-md p-2 bg-gray-50">
                    <div className="rounded-md overflow-hidden bg-black" style={{ height: '16rem' }}>
                      {(podcastPreviewUrl || (formData as any).podcastUrl) ? (
                        (podcastFile && podcastFile.type.startsWith('audio')) || (!podcastFile && ((formData as any).podcastUrl || '').match(/\.(mp3|m4a|aac|wav|ogg)$/i)) ? (
                          <audio src={podcastPreviewUrl || (formData as any).podcastUrl!} controls className="w-full h-full bg-black" onLoadedMetadata={(e) => {
                            const d = (e.currentTarget as HTMLAudioElement).duration
                            if (!(formData as any).duration && isFinite(d) && d > 0) {
                              const m = Math.floor(d / 60); const s = Math.round(d % 60)
                              setFormData((prev) => ({ ...(prev as any), duration: `${m}:${s < 10 ? '0' + s : s}` }))
                            }
                          }} />
                        ) : (
                          <video src={podcastPreviewUrl || (formData as any).podcastUrl!} controls className="w-full h-full bg-black" onLoadedMetadata={(e) => {
                            const d = (e.currentTarget as HTMLVideoElement).duration
                            if (!(formData as any).duration && isFinite(d) && d > 0) {
                              const m = Math.floor(d / 60); const s = Math.round(d % 60)
                              setFormData((prev) => ({ ...(prev as any), duration: `${m}:${s < 10 ? '0' + s : s}` }))
                            }
                          }} />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No preview available</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Report-specific */}
            {formData.type === 'Report' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Document URL</label>
                    <input name="documentUrl" value={(formData as any).documentUrl || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Document</label>
                    <input type="file" accept="application/pdf,application/vnd.*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" className="mt-1 text-sm" onChange={async (e) => {
                      const f = e.target.files?.[0] || null
                      setReportFile(f)
                      setReportPreviewName(f ? f.name : '')
                      if (!f || !id) return
                      try {
                        const { uploadFile } = await import('../../lib/storageProvider')
                        const r = await uploadFile({ file: f, dir: 'report', mediaId: id })
                        await mediaService.persistUploadedAsset({ mediaId: id, kind: 'Doc', publicUrl: r.publicUrl, storagePath: r.blobPath, mime: f.type || null, sizeBytes: f.size || null })
                        setFormData((p) => ({ ...(p as any), documentUrl: '' }))
                        setToast({ message: 'Document uploaded', type: 'success' })
                      } catch (er: any) { setToast({ message: er?.message || 'Failed to upload document', type: 'error' }) }
                    }} />
                    {reportPreviewName && (<p className="mt-1 text-xs text-gray-500">{reportPreviewName}</p>)}
                  </div>
                </div>
              </div>
            )}

            {/* Visibility/Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Visibility</label>
                <select name="visibility" value={formData.visibility || 'Public'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select name="language" value={formData.language || 'en'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <p className="text-xs text-gray-500 mb-2">Select or add tags.</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.length === 0 ? (
                  <span className="text-sm text-gray-500">No tags selected yet.</span>
                ) : (
                  selectedTags.map((tag) => (
                    <span key={`selected-${tag}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                      <TagIcon className="h-4 w-4" />
                      <span>{tag}</span>
                      <button type="button" className="text-blue-600 hover:text-blue-800" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}><XIcon className="h-4 w-4" /></button>
                    </span>
                  ))
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <input value={tagSearch} onChange={(e) => setTagSearch(e.target.value)} placeholder="Filter available tags" className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <span className="text-xs text-gray-400">{filteredTags.length} tag{filteredTags.length === 1 ? '' : 's'} available</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredTags.map((tag) => {
                  const isActive = selectedTags.includes(tag)
                  return (
                    <button type="button" key={`available-${tag}`} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full border text-sm transition-colors ${isActive ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'}`} aria-pressed={isActive}>
                      {tag}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add custom tag" className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(newTag); setNewTag('') } }} />
                <button type="button" onClick={() => { addTag(newTag); setNewTag('') }} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"><PlusCircleIcon className="h-4 w-4" /> Add tag</button>
              </div>
            </div>

            {/* SEO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                <input name="seoTitle" value={formData.seoTitle || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Canonical URL</label>
                <input name="canonicalUrl" type="url" value={formData.canonicalUrl || ''} onChange={handleChange} placeholder="https://example.com/path-to-original" className={`mt-1 block w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${canonicalTouched && !isValidUrl(formData.canonicalUrl || '') ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">SEO Description</label>
                <textarea name="seoDescription" value={formData.seoDescription || ''} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default MediaDetail2

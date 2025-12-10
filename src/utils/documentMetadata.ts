/**
 * Utility functions for extracting document metadata
 */

/**
 * Get file size from a URL using HTTP HEAD request
 * Returns formatted string (e.g., "4.2 MB") or null if unable to retrieve
 */
export async function getFileSizeFromUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentLength = response.headers.get('Content-Length')

    if (!contentLength) return null

    const bytes = parseInt(contentLength, 10)
    return formatFileSize(bytes)
  } catch (error) {
    console.error('Failed to get file size from URL:', error)
    return null
  }
}

/**
 * Get PDF page count using pdf.js
 * Returns number of pages or null if unable to retrieve
 */
export async function getPdfPageCount(url: string): Promise<number | null> {
  try {
    // Dynamically import pdf.js to avoid loading it unless needed
    const pdfjsLib = await import('pdfjs-dist')

    // Configure worker - using CDN version for better compatibility
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(url)
    const pdf = await loadingTask.promise

    return pdf.numPages
  } catch (error) {
    console.error('Failed to get PDF page count:', error)
    return null
  }
}

/**
 * Format file size in bytes to human-readable string
 */
export function formatFileSize(bytes: number | null | undefined): string | null {
  if (!bytes || bytes === 0) return null

  if (bytes < 1024) {
    return `${bytes} B`
  }

  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }

  const mb = kb / 1024
  if (mb < 1024) {
    return `${mb.toFixed(2)} MB`
  }

  const gb = mb / 1024
  return `${gb.toFixed(2)} GB`
}

/**
 * Extract all available metadata from a document URL
 * Returns an object with format, fileSize, and pageCount
 */
export async function extractDocumentMetadata(url: string, isPDF: boolean = false): Promise<{
  fileSize: string | null
  pageCount: number | null
}> {
  const [fileSize, pageCount] = await Promise.all([
    getFileSizeFromUrl(url),
    isPDF ? getPdfPageCount(url) : Promise.resolve(null)
  ])

  return { fileSize, pageCount }
}

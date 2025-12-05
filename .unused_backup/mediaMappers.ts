import {
  getAudioUrl,
  getVideoUrl,
  getPosterUrl,
  getDuration,
} from './mediaSelectors'

/**
 * Maps an API item to the props format expected by the card component
 */
export function mapApiItemToCardProps(item: any) {
  // Get normalized duration info
  const durationInfo = getDuration(item)
  // Extract and normalize data from the API item
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    mediaType: item.mediaType || 'resource',
    provider: {
      name: item.provider?.name || item.source || 'Unknown Provider',
      logoUrl: item.provider?.logoUrl || null,
    },
    imageUrl: getPosterUrl(item),
    videoUrl: getVideoUrl(item),
    audioUrl: getAudioUrl(item),
    processedAudioUrl: item.processedAudioUrl,
    tags: item.tags || [],
    date: item.date || item.lastUpdated,
    downloadCount: item.downloadCount,
    fileSize: item.fileSize,
    duration: durationInfo.available ? durationInfo.formatted : item.duration,
    durationSeconds: durationInfo.available ? durationInfo.seconds : 0,
    location: item.location,
    category: item.category,
    format: item.format,
    popularity: item.popularity,
    episodes: item.episodes,
    lastUpdated: item.lastUpdated,
    domain: item.domain,
    businessStage: item.businessStage,
    // Generate a details URL path
    detailsHref: `/media/${(item.mediaType || 'resource').toLowerCase().replace(/\s+/g, '-')}/${item.id}`,
  }
}

/**
 * Maps an API item to the detailed props format expected by the detail page
 */
export function mapApiItemToDetailProps(item: any) {
  // Start with the card props as a base
  const baseProps = mapApiItemToCardProps(item)
  // Add additional detail-specific properties
  return {
    ...baseProps,
    // Additional fields that might be needed for the detail view
    content: item.content,
    relatedItems: (item.relatedItems || []).map(mapApiItemToCardProps),
    metadata: {
      author: item.author,
      publishDate: item.date,
      lastUpdated: item.lastUpdated,
      readTime: item.readTime,
      views: item.views,
      downloads: item.downloadCount,
      fileSize: item.fileSize,
      format: item.format,
      language: item.language || 'English',
      license: item.license,
    },
    // Format resources for rendering
    resources: item.resources
      ? item.resources.map((resource: any) => ({
          id: resource.id,
          title: resource.title,
          type: resource.type,
          url: resource.url,
          fileSize: resource.fileSize,
        }))
      : [],
    // Format actions for rendering
    actions: [
      getVideoUrl(item)
        ? { label: 'Watch Video', url: getVideoUrl(item), icon: 'play' }
        : null,
      getAudioUrl(item)
        ? { label: 'Listen', url: getAudioUrl(item), icon: 'volume-2' }
        : null,
      item.downloadUrl
        ? { label: 'Download', url: item.downloadUrl, icon: 'download' }
        : null,
      item.externalUrl
        ? {
            label: 'Visit Website',
            url: item.externalUrl,
            icon: 'external-link',
          }
        : null,
    ].filter(Boolean),
  }
}

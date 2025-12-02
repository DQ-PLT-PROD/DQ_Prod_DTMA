import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MediaCard } from '../Cards/MediaCard'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Calendar,
  Clock,
  MapPin,
  Download,
  FileText,
  BookOpen,
  Tag,
} from 'lucide-react'
import { getVideoDuration, VideoDurationInfo } from '../../utils/videoUtils'
import {
  getAudioUrl,
  getVideoUrl,
  getPosterUrl,
  getDuration,
  isAudioItem,
  isVideoItem,
} from '../../utils/mediaSelectors'
// Helper function to resolve the primary audio URL
const resolveAudioUrl = (item: any): string | null => {
  return getAudioUrl(item)
}
export interface KnowledgeHubItemProps {
  item: {
    id: string
    title: string
    description: string
    mediaType?: string
    provider: {
      name: string
      logoUrl: string
    }
    imageUrl?: string
    videoUrl?: string
    audioUrl?: string
    processedAudioUrl?: string
    tags?: string[]
    date?: string
    downloadCount?: number
    fileSize?: string
    duration?: string
    location?: string
    category?: string
    format?: string
    popularity?: string
    episodes?: number
    lastUpdated?: string
    domain?: string
    businessStage?: string
    [key: string]: any
  }
  isBookmarked: boolean
  onToggleBookmark: () => void

  onQuickView?: () => void
}
// Utility function to get the details href for an item
const slugify = (value: string) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')

// Try to infer a media type when it's missing
const inferMediaType = (item: KnowledgeHubItemProps['item']): string => {
  const direct = (item.mediaType ?? '').toString().trim()
  if (direct) return direct
  const fromFormat = (item.format ?? '').toString().toLowerCase()
  if (fromFormat.includes('event')) return 'event'
  if (fromFormat.includes('podcast')) return 'podcast'
  if (fromFormat.includes('video') || fromFormat.includes('recorded')) return 'video'
  if (fromFormat.includes('template') || fromFormat.includes('tool')) return 'toolkits & templates'
  if (fromFormat.includes('report')) return 'report'
  if (fromFormat.includes('guide')) return 'guide'
  // Last resort: look at tags
  const tagsJoined = Array.isArray(item.tags)
    ? item.tags.map((t) => String(t).toLowerCase()).join(' ')
    : ''
  if (tagsJoined.includes('event')) return 'event'
  if (tagsJoined.includes('podcast')) return 'podcast'
  if (tagsJoined.includes('video')) return 'video'
  if (tagsJoined.includes('report')) return 'report'
  if (tagsJoined.includes('guide')) return 'guide'
  return 'resource'
}

const getDetailsHref = (item: KnowledgeHubItemProps['item']): string => {
  const type = inferMediaType(item)
  const typeSlug = slugify(type)
  return `/media/${typeSlug}/${item.id}`
}
export const KnowledgeHubCard: React.FC<KnowledgeHubItemProps> = ({
  item,
  isBookmarked,
  onToggleBookmark,

  onQuickView,
}) => {
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoDuration, setVideoDuration] = useState<VideoDurationInfo>({
    seconds: 0,
    formatted: '',
    available: false,
  })
  const detailsHref = getDetailsHref(item)
  // Get video duration on component mount
  useEffect(() => {
    if (isVideoItem(item)) {
      const durationInfo = getDuration(item)
      setVideoDuration(durationInfo)
    }
  }, [item])
  // Update video duration when video metadata is loaded
  useEffect(() => {
    const video = videoRef.current
    if (video && isVideoItem(item)) {
      const handleLoadedMetadata = () => {
        const updatedDuration = getDuration(item, video)
        setVideoDuration(updatedDuration)
      }
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [videoRef.current, item])
  // Runtime check for valid href
  useEffect(() => {
    if (!detailsHref || detailsHref === '#' || detailsHref === 'about:blank') {
      console.warn(
        `Warning: Invalid href for item ${item.id}: "${detailsHref}"`,
      )
    }
  }, [detailsHref, item.id])
  // Format date to display as "Jan 12, 2024"
  const formatDate = (dateString?: string): string => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch (error) {
      return ''
    }
  }
  // Ensure description is plain text (strip any visible HTML)
  const plainDescription = (item.description || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  // Render metadata row with date and author
  const renderMetadata = () => {
    const dateToUse = item.lastUpdated || item.date
    const formattedDate = formatDate(dateToUse)
    const author = item.provider?.name
    const isoDate = dateToUse
      ? new Date(dateToUse).toISOString().split('T')[0]
      : ''
    if (!formattedDate && !author) return null
    const ariaLabel = `Published ${formattedDate ? `on ${formattedDate}` : ''}${formattedDate && author ? ', by ' : ''}${author ? author : ''}`
    return (
      <div
        className="flex items-center text-xs text-gray-500 mb-3 truncate"
        aria-label={ariaLabel}
      >
        {formattedDate && (
          <span className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <time dateTime={isoDate}>{formattedDate}</time>
          </span>
        )}
        {formattedDate && author && <span className="mx-1.5">•</span>}
        {author && <span className="truncate">{author}</span>}
      </div>
    )
  }
  // Render pill badges for domain and businessStage
  const renderPills = () => {
    const pills = [item.domain, item.businessStage].filter(Boolean)
    if (pills.length === 0) return null
    return (
      <div className="flex flex-wrap gap-2 mb-3">
        {pills.map((pill, index) => (
          <span
            key={`pill-${index}`}
            className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            tabIndex={0}
          >
            {pill}
          </span>
        ))}
      </div>
    )
  }
  // Determine the card type based on mediaType
  const getCardType = () => {
    const mt = inferMediaType(item).toLowerCase()
    switch (mt) {
      case 'news':
        return 'news'
      case 'blog':
        return 'blog'
      case 'event':
        return 'event'
      case 'video':
        return 'video'
      case 'podcast':
        return 'podcast'
      case 'report':
      case 'guide':
      case 'toolkits & templates':
      case 'infographic':
        return 'resource'
      case 'announcement':
        return 'announcement'
      default:
        return 'resource'
    }
  }
  // Get primary CTA text based on mediaType
  const getPrimaryCTA = () => {
    const mt = inferMediaType(item).toLowerCase()
    switch (mt) {
      case 'news':
      case 'blog':
        return 'Read Article'
      case 'video':
        return 'Watch Now'
      case 'podcast':
        return 'Listen Now'
      case 'report':
      case 'guide':
      case 'toolkits & templates':
      case 'infographic':
        return 'Download'
      case 'event':
        return 'Register Now'
      case 'announcement':
        return 'View Announcement'
      default:
        return 'View Details'
    }
  }
  // Get appropriate icon for the content type
  const getContentTypeIcon = () => {
    const mt = inferMediaType(item).toLowerCase()
    switch (mt) {
      case 'news':
      case 'blog':
        return <FileText size={16} className="mr-1 text-blue-600" />
      case 'video':
        return <Play size={16} className="mr-1 text-blue-600" />
      case 'podcast':
        return <Volume2 size={16} className="mr-1 text-blue-600" />
      case 'report':
      case 'guide':
        return <BookOpen size={16} className="mr-1 text-blue-600" />
      case 'toolkits & templates':
        return <FileText size={16} className="mr-1 text-blue-600" />
      case 'event':
        return <Calendar size={16} className="mr-1 text-blue-600" />
      default:
        return <FileText size={16} className="mr-1 text-blue-600" />
    }
  }
  // Get enhanced tags with content type
  const getEnhancedTags = () => {
    const tags = [...(item.tags || [])]
    // Add mediaType as a tag if it's not already included
    const mediaType = item.mediaType
    if (mediaType && !tags.includes(mediaType)) {
      tags.unshift(mediaType)
    }
    // Add format as a tag if available and not already included
    if (item.format && !tags.includes(item.format)) {
      tags.push(item.format)
    }
    // Add category as a tag if available and not already included
    if (item.category && !tags.includes(item.category)) {
      tags.push(item.category)
    }
    // Add popularity tag if available (like "Trending", "Most Downloaded")
    if (item.popularity && !tags.includes(item.popularity)) {
      tags.push(item.popularity)
    }
    return tags
  }
  // Get additional props based on mediaType
  const getAdditionalProps = () => {
    const type = getCardType()
    const metadata: Record<string, any> = {}
    // Common metadata for all types
    if (item.provider?.name) {
      metadata.source = item.provider.name
    }
    if (item.date) {
      metadata.date = item.date
    }
    // Type-specific metadata
    switch (type) {
      case 'news':
      case 'blog':
        metadata.icon = getContentTypeIcon()
        metadata.category = item.category || 'News'
        break
      case 'event':
        if (item.location) {
          metadata.location = item.location
        }
        metadata.organizer = item.provider?.name
        metadata.icon = getContentTypeIcon()
        metadata.isUpcoming = new Date(item.date || '') > new Date()
        break
      case 'video':
        // Use the videoDuration if available, otherwise fall back to item.duration
        if (videoDuration.available) {
          metadata.duration = videoDuration.formatted
        }
        metadata.icon = getContentTypeIcon()
        metadata.videoUrl = getVideoUrl(item)
        break
      case 'podcast':
        // Use the getDuration selector for consistent duration display
        const audioDuration = getDuration(item)
        if (audioDuration.available) {
          metadata.duration = audioDuration.formatted
        } else if (item.duration) {
          metadata.duration = item.duration
        }
        if (item.episodes) {
          metadata.episodes = item.episodes
        }
        metadata.icon = getContentTypeIcon()
        // Resolve the audio URL using the selector
        metadata.audioUrl = getAudioUrl(item)
        break
      case 'resource':
        metadata.resourceType = item.mediaType
        if (item.downloadCount) {
          metadata.downloadCount = item.downloadCount
        }
        if (item.fileSize) {
          metadata.fileSize = item.fileSize
        }
        metadata.lastUpdated = item.lastUpdated || item.date
        metadata.icon = getContentTypeIcon()
        break
      case 'announcement':
        metadata.icon = getContentTypeIcon()
        metadata.category = 'Announcement'
        break
    }
    return metadata
  }
  // Toggle video playback
  const togglePlayback = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }
  // Toggle audio mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }
  // Handle card click
  const handleCardClick = () => {
    // Always navigate directly to the details page for knowledge-hub
    navigate(detailsHref)
  }
  // Handle primary CTA click
  const handlePrimaryCTAClick = (e: React.MouseEvent) => {
    // No need to stop propagation or prevent default
    // Just navigate to the same URL as the card body would
    navigate(detailsHref)
  }
  // Video preview component
  const VideoPreview = () => {
    if (isVideoItem(item)) {
      const videoUrl = getVideoUrl(item)
      if (!videoUrl) return null
      return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="flex items-center space-x-2 pointer-events-auto">
            <button
              onClick={togglePlayback}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors z-10"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="text-white" size={20} />
              ) : (
                <Play className="text-white" size={20} />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors z-10"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="text-white" size={20} />
              ) : (
                <Volume2 className="text-white" size={20} />
              )}
            </button>
          </div>
          <video
            ref={videoRef}
            src={videoUrl}
            className="hidden"
            muted={isMuted}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          {/* Duration badge - Only show if duration is available */}
          {videoDuration.available && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-white text-xs">
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                <span>{videoDuration.formatted}</span>
              </div>
            </div>
          )}
        </div>
      )
    }
    return null
  }
  return (
    <div className="h-full group" onClick={handleCardClick}>
      <MediaCard
        type={getCardType()}
        title={item.title}
        description={plainDescription}
        image={getPosterUrl(item)}
        tags={getEnhancedTags()}
        {...getAdditionalProps()}
        isBookmarked={isBookmarked}
        onToggleBookmark={(e) => {
          e.stopPropagation()
          onToggleBookmark()
        }}
        cta={{
          label: getPrimaryCTA(),
          onClick: detailsHref ? handlePrimaryCTAClick : undefined,
          href: detailsHref || undefined,
          disabled: !detailsHref,
          'aria-disabled': !detailsHref ? 'true' : undefined,
        }}
        videoPreview={<VideoPreview />}
        className="h-full flex flex-col"
        titleClassName="line-clamp-2 h-12 text-gray-900 font-semibold mb-1"
        descriptionClassName="line-clamp-3 h-18 text-sm text-gray-600 mb-4"
        metadataClassName="flex flex-wrap gap-2 items-center text-xs text-gray-500 mb-3"
        tagClassName="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 first:bg-indigo-50 first:text-indigo-700"
        showMetadata={true}
        author={item.provider?.name}
        authorImageUrl={item.provider?.logoUrl}
        showTags={true}
        maxTags={3}
        showMoreTags={getEnhancedTags().length > 3}
        lastUpdated={item.lastUpdated || item.date}
        contentClassName="flex-grow flex flex-col"
        ctaClassName="mt-auto pt-3"
        stats={[
          item.downloadCount && {
            label: 'Downloads',
            value: item.downloadCount,
          },
          videoDuration.available && {
            label: 'Duration',
            value: videoDuration.formatted,
          },
          item.episodes && {
            label: 'Episodes',
            value: item.episodes,
          },
        ].filter(Boolean)}
        renderCustomMetadata={renderMetadata()}
        renderCustomPills={renderPills()}
      />
    </div>
  )
}

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { designTokens, tagVariants } from './designTokens'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Calendar,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  MapPin,
  Clock,
  ZoomIn,
  Building,
  TrendingUp,
  Download,
  Users,
} from 'lucide-react'
export interface MediaCardProps {
  type:
    | 'news'
    | 'blog'
    | 'video'
    | 'podcast'
    | 'event'
    | 'report'
    | 'toolkit'
    | 'infographic'
    | 'case-study'
    | 'tool'
    | 'announcement'
  title: string
  description?: string
  image?: string
  videoUrl?: string // For video auto-play
  audioUrl?: string // For podcast audio auto-play
  icon?: React.ReactNode
  metadata?: Record<string, string>
  badges?: string[]
  cta: {
    label: string
    href: string
  }
  secondaryCta?: {
    label: string
    href: string
    icon?: React.ReactNode
  }
  onClick?: () => void
  'data-id'?: string
}
const getCTAText = (type: string) => {
  switch (type) {
    case 'news':
    case 'blog':
      return 'Read Article'
    case 'video':
      return 'Watch Now'
    case 'podcast':
      return 'Listen Now'
    case 'event':
      return 'Register Now'
    case 'report':
      return 'Download Report'
    case 'toolkit':
      return 'Access Resource'
    case 'infographic':
      return 'View Infographic'
    case 'case-study':
      return 'Read Case Study'
    case 'tool':
      return 'Launch Tool'
    case 'announcement':
      return 'Learn More'
    default:
      return 'View Details'
  }
}
const getCTAColorByType = (type: string) => {
  switch (type) {
    case 'video':
    case 'podcast':
      return 'bg-red-600 hover:bg-red-700'
    case 'news':
    case 'blog':
    case 'announcement':
      return 'bg-blue-600 hover:bg-blue-700'
    case 'event':
      return 'bg-emerald-600 hover:bg-emerald-700'
    case 'report':
    case 'toolkit':
      return 'bg-purple-600 hover:bg-purple-700'
    case 'case-study':
      return 'bg-indigo-600 hover:bg-indigo-700'
    case 'infographic':
      return 'bg-pink-600 hover:bg-pink-700'
    case 'tool':
      return 'bg-gray-600 hover:bg-gray-700'
    default:
      return 'bg-gray-600 hover:bg-gray-700'
  }
}
export const MediaCard: React.FC<MediaCardProps> = ({
  type,
  title,
  description,
  image,
  videoUrl,
  audioUrl,
  icon,
  metadata = {},
  badges = [],
  cta,
  secondaryCta,
  onClick,
  'data-id': dataId,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()
  // Robust image fallback handling
  const ABU_DHABI_POOL = useMemo(
    () => [
  'https://images.unsplash.com/photo-1601465383808-5415a0f29a26?q=80&w=1200&auto=format&fit=crop',   // e.g. city skyline / Abu Dhabi
  'https://images.unsplash.com/photo-1581091215367-16f6f28a9e1e?q=80&w=1200&auto=format&fit=crop',   // business meeting / finance
  'https://images.unsplash.com/photo-1590608897129-f09fd8ccf299?q=80&w=1200&auto=format&fit=crop',  // AI / technology abstract
  'https://images.unsplash.com/photo-1531435364437-f6f39071f6f4?q=80&w=1200&auto=format&fit=crop',   // coworking / collaboration
  'https://images.unsplash.com/photo-1556761175-129418cb2dfe?q=80&w=1200&auto=format&fit=crop',   // people networking / community
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',   // urban skyline / night
]
,
    [],
  )
  const fallbackIndexRef = useRef(0)
  const pickNextThumb = () => {
    const i = fallbackIndexRef.current % ABU_DHABI_POOL.length
    fallbackIndexRef.current += 1
    return ABU_DHABI_POOL[i]
  }
  const initialSrc = image || pickNextThumb()
  const [imgSrc, setImgSrc] = useState<string>(initialSrc)
  useEffect(() => {
    // Reset when upstream image changes
    setImgSrc(image || pickNextThumb())
  }, [image])
  const handleImgError = () => {
    const next = pickNextThumb()
    if (next !== imgSrc) setImgSrc(next)
  }
  // Utility function to get details href - used for both card click and CTA click
  const getDetailsHref = (item: {
    cta: {
      href: string
    }
  }) => {
    return item.cta?.href || null
  }
  // Get the details href for consistent navigation
  const detailsHref = getDetailsHref({
    cta,
  })
  // Video/Podcast specific handlers
  const handleMouseEnter = () => {
    setIsHovered(true)
    // Handle video autoplay
    if (videoRef.current && videoUrl && type === 'video') {
      videoRef.current.play()
      setIsPlaying(true)
      // Auto-pause after 10 seconds
      hoverTimeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause()
          setIsPlaying(false)
        }
      }, 10000)
    }
    // Handle podcast audio autoplay
    if (audioRef.current && audioUrl && type === 'podcast') {
      audioRef.current.play()
      setIsPlaying(true)
      // Auto-pause after 10 seconds
      hoverTimeoutRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause()
          setIsPlaying(false)
        }
      }, 10000)
    }
  }
  const handleMouseLeave = () => {
    setIsHovered(false)
    // Handle video cleanup
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsPlaying(false)
    }
    // Handle audio cleanup
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
    if (type === 'podcast' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }
  const handleMuteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (type === 'video' && videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
    if (type === 'podcast' && audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }
  // Updated navigation handler - used for both card and CTA clicks
  const handleNavigation = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    if (!detailsHref) {
      console.warn('Missing href for card', {
        title,
        type,
        cta,
      })
      return
    }
    if (onClick) {
      onClick()
    } else {
      // Navigate in the same tab
      window.location.href = detailsHref
    }
  }
  const handleCTA = (e: React.MouseEvent) => {
    handleNavigation(e)
  }
  const handleCardClick = () => {
    handleNavigation()
  }
  const handleSecondaryCTA = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (secondaryCta) {
      window.location.href = secondaryCta.href
    }
  }
  // Convert badges to tags with appropriate variants
  const tags = badges.slice(0, 2).map((badge, index) => ({
    text: badge,
    variant: (index === 0 ? 'primary' : 'info') as const,
  }))
  const ctaColorClass = getCTAColorByType(type)
  const finalCTALabel = (cta && cta.label) ? cta.label : getCTAText(type)
  const isCtaDisabled = !detailsHref
  // Render media section based on type
  const renderMediaSection = () => {
    // Video and Podcast types with autoplay
    if (type === 'video' || type === 'podcast') {
      return (
        <div className="relative w-full h-48 bg-gray-900 overflow-hidden">
          {/* Background Image */}
          <img
            src={imgSrc || 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400&h=225&fit=crop'}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={handleImgError}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
          />
          {/* Video Element (if videoUrl provided and type is video) */}
          {videoUrl && type === 'video' && (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              muted={isMuted}
              loop={false}
              playsInline
              preload="metadata"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
          {/* Audio Element (if audioUrl provided and type is podcast) */}
          {audioUrl && type === 'podcast' && (
            <audio ref={audioRef} muted={isMuted} preload="metadata">
              <source src={audioUrl} type="audio/mpeg" />
              <source src={audioUrl} type="audio/wav" />
            </audio>
          )}
          {/* Play Icon Overlay for Video */}
          {type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayClick}
                className={`flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 transform ${isHovered ? 'scale-110' : 'scale-100'} ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? (
                  <Pause size={24} className="text-gray-900 ml-1" />
                ) : (
                  <Play size={24} className="text-gray-900 ml-1" />
                )}
              </button>
            </div>
          )}
          {/* Mic Icon Overlay for Podcast */}
          {type === 'podcast' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayClick}
                className={`flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 transform ${isHovered ? 'scale-110' : 'scale-100'} ${isPlaying && audioUrl ? 'bg-green-500 bg-opacity-90' : ''}`}
                aria-label={isPlaying ? 'Pause podcast' : 'Play podcast'}
              >
                {isPlaying && audioUrl ? (
                  <Pause
                    size={24}
                    className={`${isPlaying ? 'text-white' : 'text-gray-900'}`}
                  />
                ) : (
                  <Mic size={24} className="text-gray-900" />
                )}
              </button>
            </div>
          )}
          {/* Media Controls Overlay (when playing or hovered) */}
          {((videoUrl && type === 'video') ||
            (audioUrl && type === 'podcast')) &&
            (isPlaying || isHovered) && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={handleMuteClick}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX size={16} className="text-white" />
                  ) : (
                    <Volume2 size={16} className="text-white" />
                  )}
                </button>
                <button
                  onClick={handlePlayClick}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause size={16} className="text-white" />
                  ) : (
                    <Play size={16} className="text-white ml-0.5" />
                  )}
                </button>
              </div>
            )}
          {/* Duration Badge */}
          {metadata.duration && (
            <div className="absolute top-4 right-4 px-2 py-1 rounded bg-black bg-opacity-75 text-white text-xs font-medium">
              {metadata.duration}
            </div>
          )}
        </div>
      )
    }
    // All other types
    return (
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={title}
            loading="lazy"
            decoding="async"
            onError={handleImgError}
            className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            {type === 'event' && (
              <Calendar size={32} className="text-white opacity-75" />
            )}
            {type === 'report' && (
              <FileText size={32} className="text-white opacity-75" />
            )}
            {type === 'toolkit' && (
              <FileText size={32} className="text-white opacity-75" />
            )}
            {type === 'infographic' && (
              <ImageIcon size={32} className="text-white opacity-75" />
            )}
            {type === 'case-study' && (
              <Building size={32} className="text-white opacity-75" />
            )}
            {type === 'tool' && (
              <ExternalLink size={32} className="text-white opacity-75" />
            )}
            {(type === 'news' ||
              type === 'blog' ||
              type === 'announcement') && (
              <FileText size={32} className="text-white opacity-75" />
            )}
          </div>
        )}
        {/* Special overlays for specific types */}
        {type === 'event' && metadata.date && (
          <div className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-white text-emerald-600 text-sm font-bold shadow-md">
            {metadata.date}
          </div>
        )}
        {type === 'case-study' && metadata.keyMetric && (
          <div className="absolute bottom-3 right-3 px-3 py-2 rounded-lg bg-white text-indigo-600 font-bold shadow-md">
            <div className="flex items-center gap-1">
              <TrendingUp size={14} />
              {metadata.keyMetric}
            </div>
          </div>
        )}
        {type === 'infographic' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handleCTA}
              className={`flex items-center justify-center w-16 h-16 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 transform ${isHovered ? 'scale-110' : 'scale-100'}`}
              aria-label="View infographic"
            >
              <ZoomIn size={24} className="text-gray-900" />
            </button>
          </div>
        )}
      </div>
    )
  }
  return (
    <div
      className={`flex flex-col h-full bg-white ${designTokens.visual.borderRadius} ${designTokens.visual.shadow.default} overflow-hidden transition-all duration-300 ${isHovered ? 'shadow-xl -translate-y-1' : designTokens.visual.shadow.hover} ${detailsHref ? 'cursor-pointer' : ''}`}
      onClick={detailsHref ? handleCardClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-id={dataId}
      role={detailsHref ? 'button' : undefined}
      tabIndex={detailsHref ? 0 : undefined}
      onKeyDown={
        detailsHref
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCardClick()
              }
            }
          : undefined
      }
      aria-label={detailsHref ? `${type} card: ${title}` : undefined}
    >
      {/* Media Section */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden flex-shrink-0">
        {renderMediaSection()}
      </div>
      {/* Content Section */}
      <div
        className={`${designTokens.spacing.card.padding} flex flex-col flex-grow`}
      >
        {/* Title and Description */}
        <div className="mb-4 flex-shrink-0">
          <h3
            className={`${designTokens.typography.title.size} ${designTokens.typography.title.weight} ${designTokens.typography.title.color} ${designTokens.typography.title.lineHeight} line-clamp-2 mb-2`}
            style={{
              minHeight: 'calc(2 * 1.375rem)',
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              className={`${designTokens.typography.description.size} ${designTokens.typography.description.color} ${designTokens.typography.description.lineHeight} line-clamp-2 mb-3`}
              style={{
                minHeight: 'calc(2 * 1.25rem)',
              }}
            >
              {description}
            </p>
          )}
        </div>
        {/* Metadata Section */}
        {Object.keys(metadata).length > 0 && (
          <div className="mb-4 flex-shrink-0">
            {/* Event-specific metadata */}
            {type === 'event' && (
              <div className="space-y-2">
                {metadata.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} />
                    <span>{metadata.location}</span>
                  </div>
                )}
                {metadata.time && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{metadata.time}</span>
                  </div>
                )}
                {metadata.attendees && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={14} />
                    <span>{metadata.attendees} attendees</span>
                  </div>
                )}
              </div>
            )}
            {/* Report/Toolkit metadata */}
            {(type === 'report' || type === 'toolkit') && (
              <div className="flex justify-between items-center text-xs text-gray-500 p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {metadata.fileSize && <span>{metadata.fileSize}</span>}
                  {metadata.fileSize && metadata.updated && <span>•</span>}
                  {metadata.updated && <span>Updated {metadata.updated}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Download size={12} />
                  {metadata.downloadCount || '0'}
                </div>
              </div>
            )}
            {/* General metadata for other types */}
            {!['event', 'report', 'toolkit'].includes(type) && (
              <div
                className={`${designTokens.typography.metadata.size} ${designTokens.typography.metadata.color} flex items-center gap-2`}
              >
                {metadata.date && <span>{metadata.date}</span>}
                {metadata.date && (metadata.author || metadata.speaker) && (
                  <span>•</span>
                )}
                {(metadata.author || metadata.speaker) && (
                  <span>{metadata.author || metadata.speaker}</span>
                )}
                {metadata.industry && <span>{metadata.industry}</span>}
                {metadata.updated && <span>Updated {metadata.updated}</span>}
              </div>
            )}
          </div>
        )}
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center ${designTokens.spacing.pill.padding} rounded-full text-xs font-medium truncate ${tagVariants[tag.variant || 'primary']}`}
              >
                {tag.text}
              </span>
            ))}
          </div>
        )}
        {/* CTA Buttons - Pinned to bottom */}
        <div className="mt-auto flex-shrink-0">
          {type === 'event' && secondaryCta ? (
            <div className="flex gap-2">
              <button
                onClick={handleCTA}
                disabled={isCtaDisabled}
                aria-disabled={isCtaDisabled}
                className={`flex-1 px-4 py-3 text-sm font-bold text-white rounded-md transition-colors flex items-center justify-center gap-2 ${isCtaDisabled ? 'bg-gray-400 cursor-not-allowed' : ctaColorClass}`}
                aria-label={`Register for event: ${title}`}
              >
                <Calendar size={16} />
                Register Now
              </button>
              <button
                onClick={handleSecondaryCTA}
                className="px-3 py-3 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center justify-center"
                aria-label="Add to calendar"
              >
                {secondaryCta.icon || <Calendar size={16} />}
              </button>
            </div>
          ) : (
            <button
              onClick={handleCTA}
              disabled={isCtaDisabled}
              aria-disabled={isCtaDisabled}
              className={`w-full px-4 py-3 text-sm font-bold text-white rounded-md transition-colors flex items-center justify-center gap-2 ${isCtaDisabled ? 'bg-gray-400 cursor-not-allowed' : ctaColorClass}`}
              aria-label={`${finalCTALabel}: ${title}`}
            >
              {type === 'video' && <Play size={16} />}
              {type === 'podcast' && <Mic size={16} />}
              {type === 'event' && <Calendar size={16} />}
              {(type === 'report' || type === 'toolkit') && (
                <Download size={16} />
              )}
              {(type === 'news' ||
                type === 'blog' ||
                type === 'case-study') && <FileText size={16} />}
              {type === 'infographic' && <ZoomIn size={16} />}
              {type === 'tool' && <ExternalLink size={16} />}
              {type === 'announcement' && <ExternalLink size={16} />}
              {finalCTALabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

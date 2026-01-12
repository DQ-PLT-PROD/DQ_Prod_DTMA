/**
 * Utility functions for video handling
 */
/**
 * Format duration in seconds to a display string
 * @param seconds - Duration in seconds
 * @returns Formatted string in mm:ss or h:mm:ss format
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return ''
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
/**
 * Interface for video duration information
 */
export interface VideoDurationInfo {
  seconds: number
  formatted: string
  available: boolean
}
/**
 * Get the primary video poster URL following a consistent resolution order:
 * 1. Poster/thumbnail extracted from the video asset itself
 * 2. Processed poster variant from the media pipeline (poster, preview, or snapshot)
 * 3. Existing thumbnail/imageUrl field already attached to the item
 * 4. Fallback placeholder if no poster exists
 *
 * @param item - The media item
 * @returns The resolved poster URL
 */
export const getVideoPosterUrl = (item: any): string => {
  // Fallback placeholder to use if no poster is found
  const fallbackPosterUrl =
    'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  // 1. Check for poster/thumbnail extracted from the video asset itself
  if (item?.videoMetadata?.thumbnailUrl) {
    return item.videoMetadata.thumbnailUrl
  }
  // 2. Check for processed poster variants from the media pipeline
  if (item?.processedVideoMetadata?.poster) {
    return item.processedVideoMetadata.poster
  }
  if (item?.processedVideoMetadata?.preview) {
    return item.processedVideoMetadata.preview
  }
  if (item?.processedVideoMetadata?.snapshot) {
    return item.processedVideoMetadata.snapshot
  }
  // 3. Check for existing thumbnail field already attached to the item
  if (item?.imageUrl) {
    return item.imageUrl
  }
  if (item?.thumbnailUrl) {
    return item.thumbnailUrl
  }
  // 4. Return fallback placeholder if no poster exists
  return fallbackPosterUrl
}
/**
 * Get video duration based on the resolution order:
 * 1. Precise duration from backend metadata
 * 2. Duration from processed/streaming variant metadata
 * 3. Read duration from actual media once loaded
 *
 * @param item - The media item
 * @param videoElement - Optional video element reference to read duration from
 * @returns Object containing seconds, formatted duration and availability flag
 */
export const getVideoDuration = (
  item: any,
  videoElement?: HTMLVideoElement | null,
): VideoDurationInfo => {
  // Default return when duration is unavailable
  const unavailable: VideoDurationInfo = {
    seconds: 0,
    formatted: '',
    available: false,
  }
  // Case 1: Try to get precise duration from backend metadata
  if (item?.duration) {
    // Handle if duration is already in seconds (number)
    if (typeof item.duration === 'number') {
      const seconds = item.duration
      return {
        seconds,
        formatted: formatDuration(seconds),
        available: true,
      }
    }
    // Handle if duration is a formatted string (e.g., "5:30")
    if (typeof item.duration === 'string') {
      // If it's already formatted as mm:ss or h:mm:ss, parse it
      const parts = item.duration.split(':').map((part) => parseInt(part, 10))
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        // mm:ss format
        const seconds = parts[0] * 60 + parts[1]
        return {
          seconds,
          formatted: item.duration, // Use the original formatted string
          available: true,
        }
      } else if (
        parts.length === 3 &&
        !isNaN(parts[0]) &&
        !isNaN(parts[1]) &&
        !isNaN(parts[2])
      ) {
        // h:mm:ss format
        const seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
        return {
          seconds,
          formatted: item.duration, // Use the original formatted string
          available: true,
        }
      }
    }
  }
  // Case 2: Try to get duration from processed/streaming variant metadata
  if (item?.processedVideoMetadata?.duration) {
    const seconds = parseFloat(item.processedVideoMetadata.duration)
    if (!isNaN(seconds)) {
      return {
        seconds,
        formatted: formatDuration(seconds),
        available: true,
      }
    }
  }
  // Case 3: Try to read duration from the actual media element
  if (
    videoElement &&
    videoElement.duration &&
    !isNaN(videoElement.duration) &&
    videoElement.duration > 0
  ) {
    const seconds = videoElement.duration
    return {
      seconds,
      formatted: formatDuration(seconds),
      available: true,
    }
  }
  // Duration unavailable
  return unavailable
}
/**
 * Hook to get video duration from a video element
 * This can be used to dynamically update duration once video is loaded
 *
 * @param videoElement - Video element reference
 * @param initialDuration - Initial duration info
 * @returns Updated duration info
 */
export const useVideoDuration = (
  videoElement: HTMLVideoElement | null,
  initialDuration: VideoDurationInfo,
): VideoDurationInfo => {
  // If we already have a valid duration from metadata, use it
  if (initialDuration.available) {
    return initialDuration
  }
  // If we have a video element, try to get the duration from it
  if (
    videoElement &&
    videoElement.duration &&
    !isNaN(videoElement.duration) &&
    videoElement.duration > 0
  ) {
    const seconds = videoElement.duration
    return {
      seconds,
      formatted: formatDuration(seconds),
      available: true,
    }
  }
  // Otherwise, return the initial duration (which is likely unavailable)
  return initialDuration
}

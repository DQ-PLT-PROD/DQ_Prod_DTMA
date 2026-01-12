/**
 * Media Selectors
 *
 * This file contains selector functions that serve as a single source of truth
 * for various media properties across the application. These selectors ensure
 * consistent display of media properties in both card and detail views.
 */
import { formatDuration, VideoDurationInfo } from './videoUtils'
/**
 * Get the primary audio URL following a consistent resolution order:
 * 1. Processed/streaming variant (if available)
 * 2. Original audio URL
 * 3. null if no audio is available
 *
 * @param item - The media item
 * @returns The resolved audio URL or null
 */
export const getAudioUrl = (item: any): string | null => {
  // Check for processed/streaming variant first
  if (item?.processedAudioUrl) {
    return item.processedAudioUrl
  }
  // Fall back to original audio URL
  if (item?.audioUrl) {
    return item.audioUrl
  }
  // No audio available
  return null
}
/**
 * Get the primary video URL following a consistent resolution order:
 * 1. Processed/streaming variant (if available)
 * 2. Original video URL
 * 3. null if no video is available
 *
 * @param item - The media item
 * @returns The resolved video URL or null
 */
export const getVideoUrl = (item: any): string | null => {
  // Check for processed/streaming variant first
  if (item?.processedVideoUrl) {
    return item.processedVideoUrl
  }
  // Fall back to original video URL
  if (item?.videoUrl) {
    return item.videoUrl
  }
  // No video available
  return null
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
export const getPosterUrl = (item: any): string => {
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
 * Get media duration based on the resolution order:
 * 1. Precise duration from backend metadata
 * 2. Duration from processed/streaming variant metadata
 * 3. Read duration from actual media element once loaded
 *
 * @param item - The media item
 * @param mediaElement - Optional media element reference to read duration from
 * @returns Object containing seconds, formatted duration and availability flag
 */
export const getDuration = (
  item: any,
  mediaElement?: HTMLVideoElement | HTMLAudioElement | null,
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
  if (item?.processedAudioMetadata?.duration) {
    const seconds = parseFloat(item.processedAudioMetadata.duration)
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
    mediaElement &&
    mediaElement.duration &&
    !isNaN(mediaElement.duration) &&
    mediaElement.duration > 0
  ) {
    const seconds = mediaElement.duration
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
 * Determines if an item is an audio type
 *
 * @param item - The media item
 * @returns boolean indicating if the item is audio
 */
export const isAudioItem = (item: any): boolean => {
  return (
    item?.mediaType?.toLowerCase() === 'podcast' ||
    item?.mediaType?.toLowerCase() === 'audio' ||
    !!item?.audioUrl ||
    !!item?.processedAudioUrl
  )
}
/**
 * Determines if an item is a video type
 *
 * @param item - The media item
 * @returns boolean indicating if the item is video
 */
export const isVideoItem = (item: any): boolean => {
  return (
    item?.mediaType?.toLowerCase() === 'video' ||
    !!item?.videoUrl ||
    !!item?.processedVideoUrl
  )
}

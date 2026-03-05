/**
 * Utility to get actual video duration from video URLs
 * This reads the video metadata to get the exact duration
 */

/**
 * Get the actual duration of a video from its URL
 * @param videoUrl - URL of the video file
 * @returns Duration in minutes (rounded up)
 */
export async function getVideoDuration(videoUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const durationSeconds = video.duration;
      const durationMinutes = Math.ceil(durationSeconds / 60);
      resolve(durationMinutes);
    };
    
    video.onerror = () => {
      reject(new Error(`Failed to load video metadata from ${videoUrl}`));
    };
    
    video.src = videoUrl;
  });
}

/**
 * Get durations for multiple videos
 * @param videoUrls - Array of video URLs
 * @returns Array of durations in minutes
 */
export async function getMultipleVideoDurations(videoUrls: string[]): Promise<number[]> {
  const promises = videoUrls.map(url => 
    getVideoDuration(url).catch(() => 0) // Return 0 if video fails to load
  );
  return Promise.all(promises);
}

/**
 * Calculate total duration from an array of lessons with video URLs
 * @param lessons - Array of lesson objects with videoUrl property
 * @returns Total duration in minutes
 */
export async function calculateTotalDurationFromLessons(
  lessons: Array<{ videoUrl?: string | null }>
): Promise<number> {
  const videoUrls = lessons
    .map(lesson => lesson.videoUrl)
    .filter((url): url is string => !!url);
  
  if (videoUrls.length === 0) return 0;
  
  const durations = await getMultipleVideoDurations(videoUrls);
  return durations.reduce((total, duration) => total + duration, 0);
}

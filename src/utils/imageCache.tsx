import React, { useEffect, useState, memo } from 'react';
/**
 * Utility for fetching and caching images locally
 */
// In-memory cache for images
const imageCache: Record<string, string> = {};
/**
 * Fetches an image from a URL and converts it to a data URL
 * This allows us to cache the image and avoid repeated network requests
 */
export const fetchAndCacheImage = async (url: string): Promise<string> => {
  // Return cached image if available
  if (imageCache[url]) {
    return imageCache[url];
  }
  // Default fallback image if fetch fails
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNFNUU3RUIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZCN0M5MyIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNnB4Ij5Mb2dvPC90ZXh0Pjwvc3ZnPg==';
  try {
    // Fetch the image
    const response = await fetch(url, {
      mode: 'cors'
    });
    // If the fetch fails, return fallback
    if (!response.ok) {
      return fallbackImage;
    }
    // Convert to blob
    const blob = await response.blob();
    // Convert to data URL
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Cache the result
        imageCache[url] = dataUrl;
        resolve(dataUrl);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return fallbackImage;
  }
};
/**
 * Hook to use cached images in components
 */

export const useCachedImage = (url: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    const loadImage = async () => {
      try {
        const cachedUrl = await fetchAndCacheImage(url);
        if (isMounted) {
          setImageUrl(cachedUrl);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };
    if (url) {
      // Check if we already have it cached in memory
      if (imageCache[url]) {
        setImageUrl(imageCache[url]);
        setIsLoading(false);
      } else {
        loadImage();
      }
    }
    return () => {
      isMounted = false;
    };
  }, [url]);
  return {
    imageUrl,
    isLoading,
    error
  };
};
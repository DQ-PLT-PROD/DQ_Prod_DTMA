import { useState, useEffect } from 'react'
import { getFallbackKnowledgeHubItems } from '../utils/fallbackData'
import { mapApiItemToDetailProps } from '../utils/mediaMappers'
export interface MediaItemResult {
  item: any | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}
/**
 * Hook for fetching a single media item by slug
 */
export function useMediaItem({ slug }: { slug: string }): MediaItemResult {
  const [item, setItem] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const fetchItem = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Get all items from fallback data
      const allItems = getFallbackKnowledgeHubItems()
      // Find the item by slug (in a real app, you'd make an API call with the slug)
      // For this mock implementation, we'll use the ID as the slug
      const foundItem = allItems.find((item) => item.id === slug)
      if (foundItem) {
        // Map the API item to the detail props format
        setItem(mapApiItemToDetailProps(foundItem))
      } else {
        throw new Error(`Item with slug "${slug}" not found`)
      }
      setIsLoading(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('An error occurred while fetching the item'),
      )
      setIsLoading(false)
    }
  }
  useEffect(() => {
    if (slug) {
      fetchItem()
    }
  }, [slug])
  const refetch = () => {
    fetchItem()
  }
  return {
    item,
    isLoading,
    error,
    refetch,
  }
}

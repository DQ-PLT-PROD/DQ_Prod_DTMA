import { useState, useEffect, useCallback } from 'react'
import { getFallbackKnowledgeHubItems } from '../utils/fallbackData'
import { mapApiItemToCardProps } from '../utils/mediaMappers'
import { getSupabase } from '../admin-ui/utils/supabaseClient'

// Known media types - these are filter values that map to the 'type' field in the database
const KNOWN_TYPES = ['News', 'Reports', 'Toolkits & Templates', 'Guides', 'Events', 'Videos', 'Podcasts']

export interface MediaSearchParams {
  q?: string
  filters?: string[]
  pageSize?: number
  cursor?: string
}
export interface MediaSearchResult {
  items: any[]
  isLoading: boolean
  error: Error | null
  hasMore: boolean
  nextCursor: string | null
  loadMore: () => void
  refetch: () => void
}
/**
 * Hook for searching and paginating through media items
 */
export function useMediaSearch({
  q = '',
  filters = [],
  pageSize = 10,
  cursor = null,
}: MediaSearchParams = {}): MediaSearchResult {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [nextCursor, setNextCursor] = useState<string | null>(cursor)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Stable thumbnail fallbacks for live (Supabase) items without images
  const FALLBACK_IMAGES: Record<string, string[]> = {
    article: [
      // Abu Dhabi architecture + business scenes
      'https://images.unsplash.com/photo-1602426987727-82c2122dc7ee?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544989161-11946b75d408?q=80&w=1200&auto=format&fit=crop',
      
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop',
    ],
    report: [
      'https://images.unsplash.com/photo-1602426987727-82c2122dc7ee?q=80&w=1200&auto=format&fit=crop',
      
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551281044-8b18f1aee0b0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop',
    ],
    announcement: [
      'https://images.unsplash.com/photo-1544989161-11946b75d408?q=80&w=1200&auto=format&fit=crop',
      
      'https://images.unsplash.com/photo-1519337265831-281ec6cc8514?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485217988980-11786ced9454?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517260739337-6799d391d403?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1200&auto=format&fit=crop',
    ],
    event: [
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551836022-4c4a0cde5242?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1200&auto=format&fit=crop',
    ],
    podcast: [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517090172524-9dc1523801e3?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?q=80&w=1200&auto=format&fit=crop',
    ],
    video: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
    ],
    resource: [
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?q=80&w=1200&auto=format&fit=crop',
    ],
  }
  const GLOBAL_FALLBACK_POOL: string[] = Array.from(new Set(Object.values(FALLBACK_IMAGES).flat()))

  const pickFallbackImage = (id: string, type: string | null | undefined) => {
    const key = String(type || '').toLowerCase()
    const pool = FALLBACK_IMAGES[key] || FALLBACK_IMAGES['resource']
    // Stable index from id
    let hash = 0
    for (let i = 0; i < String(id).length; i++) {
      hash = (hash * 31 + String(id).charCodeAt(i)) >>> 0
    }
    const idx = pool.length > 0 ? hash % pool.length : 0
    return pool[idx]
  }

  const pickUniqueFallbackImage = (
    id: string,
    type: string | null | undefined,
    used: Set<string>,
  ) => {
    const key = String(type || '').toLowerCase()
    const pool = FALLBACK_IMAGES[key] || FALLBACK_IMAGES['resource']
    if (pool.length === 0) return GLOBAL_FALLBACK_POOL[0]
    // Start from the stable index, then probe forward to avoid duplicates
    let hash = 0
    for (let i = 0; i < String(id).length; i++) {
      hash = (hash * 31 + String(id).charCodeAt(i)) >>> 0
    }
    let start = hash % pool.length
    for (let attempt = 0; attempt < pool.length; attempt++) {
      const candidate = pool[(start + attempt) % pool.length]
      if (!used.has(candidate)) {
        used.add(candidate)
        return candidate
      }
    }
    // Probe the global pool if the type pool is exhausted
    const gStart = hash % GLOBAL_FALLBACK_POOL.length
    for (let attempt = 0; attempt < GLOBAL_FALLBACK_POOL.length; attempt++) {
      const candidate = GLOBAL_FALLBACK_POOL[(gStart + attempt) % GLOBAL_FALLBACK_POOL.length]
      if (!used.has(candidate)) {
        used.add(candidate)
        return candidate
      }
    }
    // As a last resort, return a stable pick from type/global pool
    const fallback = pool[start] || GLOBAL_FALLBACK_POOL[gStart]
    used.add(fallback)
    return fallback
  }
  // Fetch items from Supabase (published + public), fallback to local data when unavailable
  const fetchItems = useCallback(
    async (reset: boolean = false) => {
      try {
        setIsLoading(true)
        setError(null)

        // Try Supabase first
        let usedSupabase = false
        try {
          const supabase = getSupabase()
          const from = reset ? 0 : (currentPage - 1) * pageSize
          const to = reset ? pageSize - 1 : currentPage * pageSize - 1
          let query = supabase
            .from('media_items')
            .select('*', { count: 'exact' })
            .eq('status', 'Published')
            .lte('published_at', new Date().toISOString())
            .order('published_at', { ascending: false })
            .order('updated_at', { ascending: false })

          // Only include Public if the column exists and is used
          query = query.eq('visibility', 'Public')

          if (q) {
            const search = q.replace(/%/g, '')
            query = query.or(
              `title.ilike.%${search}%,summary.ilike.%${search}%`
            )
          }
          // Apply filters if provided
          if (filters && filters.length > 0) {
            // Separate type filters from other filters
            const typeFilters = (filters || []).filter((f) => KNOWN_TYPES.includes(String(f))) as string[]
            const otherFilters = (filters || []).filter((f) => !KNOWN_TYPES.includes(String(f))) as string[]

            // Build OR conditions for all filter types
            const orConditions: string[] = []

            // Add type filter
            if (typeFilters.length > 0) {
              query = query.in('type', typeFilters as string[])
            }

            // Add filters for other fields (business_stage, domain, format, popularity, tags)
            if (otherFilters.length > 0) {
              otherFilters.forEach((filter) => {
                const safe = String(filter).replace(/\"/g, '\\"')
                // Check against multiple fields
                orConditions.push(`business_stage.eq.${safe}`)
                orConditions.push(`domain.eq.${safe}`)
                orConditions.push(`format.eq.${safe}`)
                orConditions.push(`popularity.eq.${safe}`)
                orConditions.push(`tags.cs.["${safe}"]`)
              })

              if (orConditions.length > 0) {
                query = query.or(orConditions.join(','))
              }
            }
          }const { data, error, count } = await query.range(from, to)
          if (error) throw error
          usedSupabase = true

          const usedImageUrls = new Set<string>((reset ? [] : items).map((i: any) => i.imageUrl).filter(Boolean))
          const mapped = (data || []).map((row: any) =>
            {
              let img = (row as any).thumbnail_url || (row as any).image_url as string | null
              if (!img || usedImageUrls.has(img)) {
                img = pickUniqueFallbackImage(row.id, row.type, usedImageUrls)
              } else {
                usedImageUrls.add(img)
              }
              return mapApiItemToCardProps({
                id: row.id,
                title: row.title,
                description: row.summary,
                mediaType: row.type,
                provider: { name: row.provider_name || 'Knowledge Hub', logoUrl: row.provider_logo_url || null },
                imageUrl: img,
                videoUrl: row.video_url || null,
                audioUrl: (row as any).podcast_url || (row as any).audio_url || null,
                downloadUrl: (row as any).document_url || null,
                tags: (row as any).tags || [],
                date: row.published_at,
                lastUpdated: row.updated_at,
              })
            }
          )

          // Determine if more Supabase pages remain
          // Prefer page-size heuristic to avoid issues when count is misleading (e.g. RLS)
          const fetchedSoFar = (reset ? 0 : (currentPage - 1) * pageSize) + mapped.length
          const supabaseHasMore = mapped.length === pageSize

          if (supabaseHasMore) {
            if (reset) {
              setItems(mapped)
            } else {
              setItems((prev) => [...prev, ...mapped])
            }
            setHasMore(true)
            setNextCursor(`page_${currentPage + 1}`)
            setIsLoading(false)
            return
          }

          // Supabase exhausted � append filtered fallback items at the end
          let allItems = getFallbackKnowledgeHubItems()
          if (q) {
            const searchQuery = q.toLowerCase()
            allItems = allItems.filter(
              (item) =>
                item.title.toLowerCase().includes(searchQuery) ||
                item.description.toLowerCase().includes(searchQuery) ||
                (item.provider?.name && item.provider.name.toLowerCase().includes(searchQuery)) ||
                (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery))),
            )
          }
          if (filters && filters.length > 0) {
            allItems = allItems.filter((item) => {
              // Collect all filterable values from the item
              const itemValues = [
                item.filterType,
                item.mediaType,
                item.businessStage,
                item.domain,
                item.format,
                item.popularity,
                ...(item.tags || [])
              ].filter(Boolean)

              // Check if any of the active filters match any of the item's values
              return filters.some((filter) => itemValues.includes(filter))
            })
          }
          const toDate = (it: any) => new Date(it.date || it.lastUpdated || 0).getTime()
          allItems.sort((a, b) => toDate(b) - toDate(a))
          const mappedFallback = allItems.map(mapApiItemToCardProps)
          // Avoid obvious duplicates by id
          const supabaseIds = new Set(mapped.map((m: any) => m.id))
          const dedupedFallback = mappedFallback.filter((it: any) => !supabaseIds.has(it.id))

          if (reset) {
            setItems([...mapped, ...dedupedFallback])
          } else {
            setItems((prev) => [...prev, ...mapped, ...dedupedFallback])
          }
          setHasMore(false)
          setNextCursor(null)
          setIsLoading(false)
          return
        } catch (e) {
          // If Supabase is not configured or errors, fall back to local
          if (usedSupabase) {
            // If a real fetch failed mid-way, surface the error
            console.warn('Supabase fetch failed, falling back to local data', e)
          }
        }

        // Fallback: local mock dataset
        let allItems = getFallbackKnowledgeHubItems()
        // Apply search filter
        if (q) {
          const searchQuery = q.toLowerCase()
          allItems = allItems.filter(
            (item) =>
              item.title.toLowerCase().includes(searchQuery) ||
              item.description.toLowerCase().includes(searchQuery) ||
              (item.provider?.name && item.provider.name.toLowerCase().includes(searchQuery)) ||
              (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery))),
          )
        }
        // Apply filters (by mediaType, businessStage, domain, format, popularity, and tags)
        if (filters && filters.length > 0) {
          allItems = allItems.filter((item) => {
            // Collect all filterable values from the item
            const itemValues = [
              item.filterType,
              item.mediaType,
              item.businessStage,
              item.domain,
              item.format,
              item.popularity,
              ...(item.tags || [])
            ].filter(Boolean)

            // Check if any of the active filters match any of the item's values
            return filters.some((filter) => itemValues.includes(filter))
          })
        }
        // Sort newest first (by date/lastUpdated)
        const toDate = (it: any) => new Date(it.date || it.lastUpdated || 0).getTime()
        allItems.sort((a, b) => toDate(b) - toDate(a))
        // Paginate
        const startIndex = reset ? 0 : (currentPage - 1) * pageSize
        const endIndex = reset ? pageSize : currentPage * pageSize
        const paginatedItems = allItems.slice(startIndex, endIndex)
        const moreItems = endIndex < allItems.length
        const cursor = moreItems ? `page_${currentPage + 1}` : null
        if (reset) {
          setItems(paginatedItems.map(mapApiItemToCardProps))
        } else {
          setItems((prev) => [...prev, ...paginatedItems.map(mapApiItemToCardProps)])
        }
        setHasMore(moreItems)
        setNextCursor(cursor)
        setIsLoading(false)
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('An error occurred while fetching data'),
        )
        setIsLoading(false)
      }
    },
    [q, filters, pageSize, currentPage],
  )
  // Initial fetch
  useEffect(() => {
    setCurrentPage(1)
    fetchItems(true)
  }, [q, filters, pageSize])
  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [isLoading, hasMore])
  // Load more when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchItems(false)
    }
  }, [currentPage])
  // Refetch function
  const refetch = useCallback(() => {
    setCurrentPage(1)
    fetchItems(true)
  }, [fetchItems])
  return {
    items,
    isLoading,
    error,
    hasMore,
    nextCursor,
    loadMore,
    refetch,
  }
}











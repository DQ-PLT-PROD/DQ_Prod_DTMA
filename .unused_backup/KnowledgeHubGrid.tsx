import React, { useEffect, useMemo, useState } from 'react'
import { KnowledgeHubCard } from './KnowledgeHubCard'
import { useMediaSearch } from '../../hooks/UseMediaSearch'
interface KnowledgeHubGridProps {
  bookmarkedItems: string[]
  onToggleBookmark: (itemId: string) => void
  onAddToComparison?: (item: any) => void
  searchQuery?: string
  activeFilters?: string[]
  onFilterChange?: (filter: string) => void
  onClearFilters?: () => void
}
export const KnowledgeHubGrid: React.FC<KnowledgeHubGridProps> = ({
  bookmarkedItems,
  onToggleBookmark,
  onAddToComparison,
  searchQuery = '',
  activeFilters = [],
  onFilterChange,
  onClearFilters,
}) => {
  // Use our custom hook for fetching and filtering media items
  const { items, isLoading, error, hasMore, loadMore } = useMediaSearch({
    q: searchQuery,
    filters: activeFilters,
    pageSize: 9, // Show 9 items per page
  })
  // Get available filters based on all items
  const availableFilters = useMemo(() => {
    const mediaTypes = [...new Set(items.map((item) => item.mediaType))]
    const domains = [...new Set(items.flatMap((item) => item.tags || []))]
    return [...mediaTypes, ...domains].filter(Boolean)
  }, [items])
  // Handle filter click
  const handleFilterClick = (filter: string) => {
    if (onFilterChange) {
      onFilterChange(filter)
    }
  }
  // Handle scroll to load more
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        hasMore &&
        !isLoading
      ) {
        loadMore()
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoading, loadMore])
  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">Error loading content: {error.message}</p>
          <button
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            onClick={() => window.location.reload()}
          >
            Try refreshing the page
          </button>
        </div>
      )}
      {!error && items.length === 0 && !isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No items found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or search criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {items.map((item) => (
            <div key={`item-${item.id}`} className="h-full">
              <KnowledgeHubCard
                item={item}
                isBookmarked={bookmarkedItems.includes(item.id)}
                onToggleBookmark={() => onToggleBookmark(item.id)}
                onAddToComparison={
                  onAddToComparison ? () => onAddToComparison(item) : undefined
                }
              />
            </div>
          ))}
        </div>
      )}
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {hasMore && !isLoading && items.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
export default KnowledgeHubGrid
